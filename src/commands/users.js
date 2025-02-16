import { InlineKeyboard } from 'grammy';
import { User } from "../models/user.js";

export const handleUsers = async (ctx) => {
  try {
    // Fetch approved users
    const approvedUsers = await User.findAll({ where: { approved: true } });
    // Fetch pending users
    const pendingUsers = await User.findAll({ where: { approved: false } });
    
    let responseMessage = "👥 Approved Users:\n";
    
    // Display approved users
    if (approvedUsers.length === 0) {
      responseMessage += "⚠️ No approved users.\n";
    } else {
      for (const user of approvedUsers) {
        responseMessage += `${user.first_name}: ${user.userId}\n`;
      }
    }
    
    for (const user of pendingUsers) {
      const keyboard = new InlineKeyboard()
        .text("✅ Approve", `approve:${user.userId}`)
        .text("❌ Deny", `deny:${user.userId}`);
      
      const userInfo = `${user.first_name}: ${user.userId}`;
      
      await ctx.reply(userInfo, { reply_markup: keyboard }); // Send each user with the buttons
    }
    
    // Send the summary message to the admin
    await ctx.reply(responseMessage);
  } catch (error) {
    console.error("Error in /users:", error);
    return ctx.reply("❌ An error occurred while fetching users.");
  }
};
