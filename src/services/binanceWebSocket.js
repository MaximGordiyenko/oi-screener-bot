import WebSocket from "ws";
import { User } from "../models/user.js";
import { getBinanceTopPairs } from "./binanceService.js";

const BINANCE_WS_URL = `${process.env.BINANCE_WS_URL}`;

const priceMemory = new Map(); // Stores last known prices
const lastAlertTime = new Map(); // Stores last alert timestamps

export const starBinanceWebSocket = async (bot) => {
  const users = await User.findAll({ where: { approved: true } });
  
  for (const user of users) {
    const { userId, pairsLimit, pricePumpThreshold, pumpInterval } = user;
    const topPairs = await getBinanceTopPairs(pairsLimit);
    
    if (topPairs.length === 0) continue;
    
    const streams = topPairs.map((pair) => `${pair}@trade`).join("/");
    const ws = new WebSocket(`${BINANCE_WS_URL}/${streams}`);
    
    ws.on("open", () => {
      console.log(`✅ Binance WebSocket opened for User ${userId} (${pairsLimit} pairs)`);
    });
    
    ws.on("message", async (data) => {
      const parsedData = JSON.parse(data);
      if (!parsedData.p || !parsedData.s) return;
      
      const price = parseFloat(parsedData.p);
      const symbol = parsedData.s;
      const lastPrice = priceMemory.get(symbol) || price;
      
      const priceChange = ((price - lastPrice) / lastPrice) * 100;
      priceMemory.set(symbol, price);
      
      const binanceUrl = `${process.env.BINANCE_WEB_URL}/${symbol}`;
      
      if (priceChange > 0 && priceChange >= pricePumpThreshold) {
        const lastNotification = lastAlertTime.get(symbol) || 0;
        const currentTime = Date.now();
        
        if (pumpInterval === 0 || currentTime - lastNotification >= pumpInterval * 60 * 1000) {
          await bot.api.sendMessage(
            userId,
            `🪙 <a href="${binanceUrl}">${symbol}</a>\n💰 Price: $${price}\n🔥 Pump: ${priceChange.toFixed(2)}%`,
            {
              parse_mode: "HTML", // Enables HTML formatting for clickable links
              disable_web_page_preview: true // Disables link preview
            }
          );
          lastAlertTime.set(symbol, currentTime);
        }
      }
    });
    
    ws.on("error", (err) => {
      console.error(`❌ Binance WebSocket Error for User ${userId}:`, err);
    });
    
    ws.on("close", () => {
      console.log(`❌ Binance WebSocket Disconnected for User ${userId}.`);
      setTimeout(() => starBinanceWebSocket(bot), 5000);
    });
  }
};
