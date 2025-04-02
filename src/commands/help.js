import { User } from "../models/user.js";

export const handleHelp = async (ctx) => {
  try {
    const userId = ctx.from.id;
    
    // Check if the user is approved
    const user = await User.findOne({ where: { userId } });
    
    if (!user) {
      return ctx.reply("⚠️ You are not registered. Please use /start to request access.");
    }
    
    if (!user.approved) {
      return ctx.reply(
        "⚠️ Your account is pending approval by the admin. Please wait for approval.\nYou can only use /start for now."
      );
    }
    
    // If the user is approved, show the help text
    const helpText = `
Here are the available commands:
/start - Start using the bot.
/help - Show all commands.
/setpump - Set up three parameters together.
/setpairs - Set up quantity currencies to monitor.
/setpercentage - Set up amount of percentage to notify if price changes.
/setinterval - Set up period of time when price changes.
    `;
    
    return ctx.reply(helpText);
  } catch (error) {
    console.error("Error in /help:", error);
    return ctx.reply("❌ An error occurred. Please try again later.");
  }
};
