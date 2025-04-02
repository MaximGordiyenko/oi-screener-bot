import { Bot } from "grammy";
import dotenv from "dotenv";
import { User } from './src/models/user.js';
import { sequelize } from './src/config/db.js';

import { handleStart } from './src/commands/start.js';
import { handleUsers } from './src/commands/users.js';
import { handleCallbackQuery } from './src/commands/callbacks.js';
import { handleSetPairs } from './src/commands/setPairs.js';
import { handleSetPump } from './src/commands/setPump.js';
import { handleSetInterval } from './src/commands/setInterval.js';
import { handleSetPercentage } from './src/commands/setPercentage.js';
import { handleHelp } from './src/commands/help.js';
import { starBinanceWebSocket } from './src/services/binanceWebSocket.js';
import { startByBitWebSocket } from './src/services/byBitWebSocket.js';

dotenv.config();

const bot = new Bot(process.env.BOT_TOKEN);

// --- MIDDLEWARE ---

// Admin Check Middleware
const isAdmin = (ctx, next) => {
  const adminId = process.env.ADMIN_ID;
  if (ctx.from.id.toString() !== adminId) {
    return ctx.reply("❌ You are not authorized for this action.");
  }
  return next();
};

// Dynamic Command Menu Middleware
bot.use(async (ctx, next) => {
  const userId = ctx.from.id;
  
  // Check if the user exists and is approved
  const user = await User.findOne({ where: { userId } });
  
  const baseCommands = [{ command: "start", description: "Start using the bot." }]; // Always show start
  const approvedCommands = [
    ...baseCommands, // Include base commands
    { command: "help", description: "Show help text." },
    { command: "setpump", description: "Set up three parameters together." },
    { command: "setpairs", description: "Set quantity currencies to monitor." },
    { command: "setpercentage", description: "Set percentage for notifications." },
    { command: "setinterval", description: "Set time interval for price changes." },
  ];
  
  // Set correct commands based on approval status.
  if (!user || !user.approved) {
    await bot.api.setMyCommands(baseCommands);
  } else {
    await bot.api.setMyCommands(approvedCommands);
  }
  
  // Proceed to the next middleware or command handler
  await next();
});

// --- COMMAND REGISTRATION ---
bot.command("start", handleStart);
bot.command("setpump", handleSetPump);
bot.command("setpairs", handleSetPairs);
bot.command("setpercentage", handleSetPercentage);
bot.command("setinterval", handleSetInterval);
bot.command("users", isAdmin, handleUsers);
bot.command("help", handleHelp);

// --- CALLBACK QUERY HANDLING ---
bot.on("callback_query:data", isAdmin, handleCallbackQuery);

// --- BOT STARTUP ---
bot.start();
console.log("🤖 Bot started");

// --- DATABASE AND WEBSOCKET STARTUP ---
await sequelize.sync()

// Start Binance WebSocket
starBinanceWebSocket(bot).then(r => r);
startByBitWebSocket(bot).then(r => r);
