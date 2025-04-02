import { User } from '../models/user.js';
import { InlineKeyboard } from 'grammy';

export const handleStart = async (ctx) => {
  try {
    const userId = ctx.from.id;
    const existingUser = await User.findOne({
      where: { userId }
    });
    
    if (existingUser) {
      return ctx.reply("⚠️ You have already requested access.");
    }
    
    await User.create({
      userId,
      approved: false,
      first_name: ctx.from.first_name,
      username: ctx?.from?.username ?? 'N/A',
      language: ctx.from.language_code,
      chat_is_bot: ctx.from.is_bot,
      type_chat: ctx.chat.type
    }); // Ensure `approved` defaults to `false`
    
    // Send notification to the admin
    const adminId = process.env.ADMIN_ID; // Get admin ID from environment variables
    
    const keyboard = new InlineKeyboard()
      .text("✅ Approve", `approve:${userId}`)
      .text("❌ Deny", `deny:${userId}`);
    const userDetails = `👤 New User Request:\nID: ${userId}\nName: ${ctx.from.first_name}\nUsername: @${ctx.from.username || 'N/A'}`;
    
    await ctx.api.sendMessage(adminId, userDetails, { reply_markup: keyboard });
    
    return ctx.reply("✅ Request sent to the admin. Please wait for approval.");
    
  } catch (error) {
    console.error("Error in /start:", error);
    return ctx.reply("❌ An error occurred. Please try again later.");
  }
};
