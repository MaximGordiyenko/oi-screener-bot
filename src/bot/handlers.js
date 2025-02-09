import { getMetrics } from "../db/queries.js";

export const handleStart = (ctx) => {
  console.log('Chat ID:', ctx.chat.id); // Logs the chat_id
  ctx.reply('Hello! You can now receive updates.');
};

export const handleMetrics = async (ctx) => {
  const symbol = ctx.message.text.split(" ")[1]; // Example: /metrics BTCUSDT
  if (!symbol) {
    ctx.reply("Please provide a symbol. Example: /metrics BTCUSDT");
    return;
  }
  
  try {
    const metrics = await getMetrics(symbol);
    if (metrics) {
      ctx.reply(`Metrics for ${symbol}: Price - $${metrics.price}, Timestamp - ${metrics.timestamp}`);
    } else {
      ctx.reply(`No data found for ${symbol}.`);
    }
  } catch (error) {
    console.error(error);
    ctx.reply("An error occurred while fetching metrics.");
  }
};
