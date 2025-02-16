import { User } from "../models/user.js";

export const handleSetInterval = async (ctx) => {
  const userId = ctx.from.id.toString();
  const args = ctx.message.text.split(" ");
  
  if (args.length < 2) {
    return ctx.reply(
      "❌ Usage: `/setinterval <minutes>`\n" +
      "Example: `/setinterval 10` (Alerts every 10 min)\n" +
      "Use `/setinterval 0` to disable time-based alerts."
    );
  }
  
  const newInterval = parseInt(args[1]);
  
  if (isNaN(newInterval) || newInterval < 0 || newInterval > 30) {
    return ctx.reply("❌ Invalid interval. Choose between `0` and `30` minutes.");
  }
  
  const user = await User.findOne({ where: { userId, approved: true } });
  if (!user) return ctx.reply("❌ You are not approved to receive notifications.");
  
  user.pumpInterval = newInterval;
  await user.save();
  
  const message =
    newInterval === 0
      ? "✅ Interval disabled. Alerts will trigger only when price pumps by the set percentage."
      : `✅ Pump Interval Updated: **Every ${newInterval} minutes**`;
  
  ctx.reply(message);
};
