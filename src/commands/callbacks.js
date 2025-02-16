import { User } from "../models/user.js";

export const handleCallbackQuery = async (ctx) => {
  try {
    const adminId = process.env.ADMIN_ID;
    if (ctx.from.id.toString() !== adminId) {
      return ctx.answerCallbackQuery("❌ You are not authorized for this action.");
    }
    
    const data = ctx.callbackQuery.data;
    const [action, userId] = data.split(":");
    
    const user = await User.findOne({ where: { userId } });
    if (!user) {
      return ctx.answerCallbackQuery("❌ User not found.");
    }
    
    if (action === "approve") {
      await user.update({ approved: true });
      await ctx.api.sendMessage(userId, "🎉 You have been approved! You will now receive updates.");
      await ctx.editMessageText(`✅ User ${userId} has been approved.`);
      await ctx.answerCallbackQuery({ text: `User ${userId} approved!` }); // Provide feedback
    } else if (action === "deny") {
      await user.destroy();
      await ctx.api.sendMessage(userId, "❌ Your request has been denied by the admin.");
      await ctx.editMessageText(`❌ User ${userId} has been denied and removed.`);
      await ctx.answerCallbackQuery({ text: `User ${userId} denied and removed!` }); // Provide feedback
    } else {
      await ctx.answerCallbackQuery({ text: "❌ Invalid action." }); // Handle unknown actions
    }
  } catch (error) {
    console.error("Error in callback query:", error);
    return ctx.answerCallbackQuery("❌ An error occurred.");
  }
};
