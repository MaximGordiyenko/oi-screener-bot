import { User } from "../models/user.js";

export const handleSetPercentage = async (ctx) => {
  const userId = ctx.from.id.toString();
  const args = ctx.message.text.split(" ");
  
  if (args.length < 2) return ctx.reply("❌ Usage: `/setpercentage <percentage>`\nExample: `/setpercentage 5` (Alerts on 5% pump)");
  
  const newThreshold = parseFloat(args[1]);
  if (!newThreshold || newThreshold < 0.5 || newThreshold > 100) {
    return ctx.reply("❌ Invalid percentage. Choose between 0.5% and 100%.");
  }
  
  const user = await User.findOne({ where: { userId, approved: true } });
  if (!user) return ctx.reply("❌ You are not approved to receive notifications.");
  
  user.pricePumpThreshold = newThreshold;
  await user.save();
  
  ctx.reply(`✅ Pump Threshold Updated: **${newThreshold}%**`);
};
