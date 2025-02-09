import WebSocket from 'ws';
import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import axios from 'axios';

dotenv.config();
const bot = new Telegraf(process.env.BOT_TOKEN);

// Store user preferences
const userPreferences = {};

// Store previous price for comparison
const previousPrices = {};

// Handle the /start command
bot.start((ctx) => {
  console.log('Received /start command from:', ctx.chat.id);
  const chatId = ctx.chat.id;
  userPreferences[chatId] = { desiredChange: null };
  ctx.reply(`Hello! Please send me the desired percentage change for price notifications (from 0.5 for 0.5% to 100 for 100%).`);
});

bot.command('stop', (ctx) => {
  const chatId = ctx.chat.id;
  // Logic to remove chatId from the notification list
  ctx.reply('You have unsubscribed from notifications.');
});

// Handle user input for the percentage change
bot.on('text', async (ctx) => {
  const chatId = ctx.chat.id;
  const userMessage = ctx.message.text;
  
  // Check if the message is a valid number
  const desiredChange = parseFloat(userMessage);
  
  if (!isNaN(desiredChange) && desiredChange > 0) {
    userPreferences[chatId].desiredChange = desiredChange;
    console.log(`User ${chatId} set desired change to ${desiredChange}%`);
    ctx.reply(`Got it! You will now receive notifications when the BTC/USDT price changes by ${desiredChange}%.`);
  } else {
    ctx.reply('Please send a valid number for the percentage change (e.g., 5 for 5%, 10 for 10%, etc.).');
  }
});

// Function to get the top 200 pairs from Binance
async function getTopPairs() {
  try {
    const response = await axios.get('https://api.binance.com/api/v3/exchangeInfo');
    const pairs = response.data.symbols
      .filter(symbol => symbol.status === 'TRADING')
      .map(symbol => symbol.symbol);
    return pairs.slice(0, 200); // Take only the first 200 pairs
  } catch (error) {
    console.error('Error fetching pairs:', error);
    return [];
  }
}

// Store WebSocket connections for all pairs
const binanceSockets = {};

// Function to establish WebSocket connections for each pair
async function establishWebSockets() {
  try {
    const topPairs = await getTopPairs();
    console.log('Top pairs:', topPairs); // Log the pairs for debugging
    
    // Create WebSocket connections for each pair
    topPairs.forEach((pair) => {
      const pairLower = pair.toLowerCase(); // WebSocket needs to be in lowercase
      const binanceSocket = new WebSocket(`wss://stream.binance.com:9443/ws/${pairLower}@trade`);
      
      binanceSockets[pair] = binanceSocket;
      
      binanceSocket.on('message', (data) => {
        const parsedData = JSON.parse(data);
        const currentPrice = parseFloat(parsedData.p);
        
        if (!previousPrices[pair]) {
          previousPrices[pair] = currentPrice;
          return;
        }
        
        // Calculate the price change
        const priceChangePercentage = ((currentPrice - previousPrices[pair]) / previousPrices[pair]) * 100;
        
        // Check for the percentage change for each user
        Object.keys(userPreferences).forEach((chatId) => {
          const userChange = userPreferences[chatId].desiredChange;
          
          if (userChange && Math.abs(priceChangePercentage) >= userChange) {
            const message = `${pair} price has changed by ${userChange}%: ${currentPrice}`;
            bot.telegram.sendMessage(chatId, message);
          }
        });
        
        // Update the previous price for this pair
        previousPrices[pair] = currentPrice;
      });
    });
    
    // Return success message or data if needed
    return 'WebSockets established successfully!';
  } catch (error) {
    console.error('Error establishing WebSockets:', error);
    throw new Error('Failed to establish WebSockets');
  }
}

// Calling the function and logging the result
establishWebSockets()
  .then((result) => console.log('establishWebSockets:', result))
  .catch((error) => console.error('Error in establishing WebSockets:', error));

// Start the bot
bot.launch()
  .then(() => console.log('Bot started successfully'))
  .catch((error) => console.error('Error starting bot:', error));

// Graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
