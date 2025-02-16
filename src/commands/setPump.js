import { User } from "../models/user.js";

export const handleSetPump = async (ctx) => {
  const userId = ctx.from.id.toString();
  const args = ctx.message.text.split(" ");
  
  if (args.length < 4) {
    return ctx.reply(
      `❌ Usage: '/setpump <pairs> <percentage> <interval>'\nExample: '/setpump 100 5 10' (Top 100 pairs, 5% pump, every 10 min). Use '/setinterval 0' to enable price-based alerts.`
    );
  }
  
  const newPairs = parseInt(args[1]);
  const newThreshold = parseFloat(args[2]);
  const newInterval = parseInt(args[3]);
  
  if (!newPairs || newPairs < 1 || newPairs > 1000) {
    return ctx.reply("❌ Invalid pairs limit. Choose between 1 and 1000.");
  }
  if (!newThreshold || newThreshold < 0.5 || newThreshold > 100) {
    return ctx.reply("❌ Invalid percentage. Choose between 0.5% and 100%.");
  }
  
  if (isNaN(newInterval) || newInterval < 0 || newInterval > 30) {
    return ctx.reply("❌ Invalid interval. Choose between `0` and `30` minutes.");
  }
  
  const user = await User.findOne({ where: { userId, approved: true } });
  if (!user) return ctx.reply("❌ You are not approved to receive notifications.");
  
  user.pairsLimit = newPairs;
  user.pricePumpThreshold = newThreshold;
  user.pumpInterval = newInterval;
  await user.save();
  
  const message =
    newInterval === 0
      ? "✅ Interval disabled. Alerts will trigger only when price pumps by the set percentage."
      : `✅ Settings Updated:\n- **Pairs:** ${newPairs}\n- **Pump %:** ${newThreshold}%\n- **Interval:** ${newInterval} min`;
  
  ctx.reply(message);
};
