import { Bot } from "grammy";
import dotenv from "dotenv";
import { User } from './models/User.js';
import { sequelize } from './config/db.js';
import { startWebSocket } from './services/websocket.js';

import { handleStart } from './commands/start.js';
import { handleUsers } from './commands/users.js';
import { handleCallbackQuery } from './commands/callbacks.js';
import { handleSetPairs } from './commands/setPairs.js';
import { handleSetPump } from './commands/setPump.js';
import { handleSetInterval } from './commands/setInterval.js';
import { handleSetPercentage } from './commands/setPercentage.js';
import { handleHelp } from './commands/help.js';

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

// Start Binance WebSocket for BTC/USDT and ETH/USDT
startWebSocket(bot);
