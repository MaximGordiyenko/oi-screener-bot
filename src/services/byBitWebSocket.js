import WebSocket from "ws";
import { User } from "../models/user.js";
import { formatSymbol } from '../utils/formatSymbol.js';
import { getSymbols } from './byBitService.js';

export const startByBitWebSocket = async (bot) => {
  const users = await User.findAll({ where: { approved: true } });
  
  for (const user of users) {
    const { userId, pairsLimit, pricePumpThreshold, pumpInterval } = user;
    
    const ws = new WebSocket(process.env.BYBIT_WS_URL);

    const priceMemory = new Map(); // Store last known prices (per user)
    const lastAlertTime = new Map(); // Stores last alert timestamps (per user)
    
    ws.on("open", async () => {
      console.log(`✅ ByBit WebSocket connected for User ${userId} (${pairsLimit} pairs)`);
      
      const subscribeToByBit = (symbol) => {
        const subscribeMessage = {
          op: "subscribe", args: [`tickers.${symbol}`]
        };
        ws.send(JSON.stringify(subscribeMessage));
      };
      
      try {
        const topPairs = await getSymbols(); // Fetch symbols (make sure getSymbols handles errors)
        
        if (topPairs.length === 0) {
          console.error("Could not fetch top pairs. Closing WebSocket.");
          ws.close();
          return; // Stop processing this user
        }
        
        topPairs.slice(0, pairsLimit).forEach(subscribeToByBit); // Limit subscriptions
        
      } catch (error) {
        console.error(`Error fetching symbols for User ${userId}:`, error);
        ws.close(); // Close the WebSocket if there's an error
      }
    });
    
    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (!message?.topic || !message.topic.startsWith("tickers.")) return;
        
        const symbol = message.topic.split('.')[1];
        const price = message.data.bid1Price || message.data.ask1Price;
        
        const lastPrice = priceMemory.get(symbol) || price;
        const priceChange = ((price - lastPrice) / lastPrice) * 100;
        priceMemory.set(symbol, price);
        
        const formattedSymbol = formatSymbol(symbol);
        const byBitUrl = `${process.env.BYBIT_WEB_URL}/${formattedSymbol}`;
        
        if (priceChange > 0 && priceChange >= pricePumpThreshold) {
          const lastNotification = lastAlertTime.get(symbol) || 0;
          const currentTime = Date.now();
          
          if (pumpInterval === 0 || currentTime - lastNotification >= pumpInterval * 60 * 1000) {
            
            bot.api.sendMessage(userId, `🪙 <a href="${byBitUrl}">${formattedSymbol}</a>\n💰 Price: $${price}\n🔥 Pump: ${priceChange.toFixed(2)}%`, {
              parse_mode: "HTML", disable_web_page_preview: true
            }).catch(error => {
              console.error(`Error sending message to User ${userId}:`, error);
              // Handle message sending errors appropriately (e.g., log, retry, etc.)
            });
            
            lastAlertTime.set(symbol, currentTime);
          }
        }
      } catch (error) {
        console.error(`Error processing message for User ${userId}:`, error, data);
      }
    });
    
    ws.on("error", (err) => {
      console.error(`❌ ByBit WebSocket Error for User ${userId}:`, err);
      ws.close(); // Close on error as well
    });
    
    ws.on("close", () => {
      console.log(`❌ ByBit WebSocket Disconnected for User ${userId}. Reconnecting...`);
      setTimeout(() => startByBitWebSocket(bot), 5000);
    });
  }
};
