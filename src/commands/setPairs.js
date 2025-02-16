import { User } from "../models/user.js";

export const handleSetPairs = async (ctx) => {
  const userId = ctx.from.id.toString();
  const args = ctx.message.text.split(" ");
  
  if (args.length < 2) return ctx.reply("❌ Usage: `/setpairs <pairs>`\nExample: `/setpairs 100` (Track Top 100 Pairs)");
  
  const newPairs = parseInt(args[1]);
  if (!newPairs || newPairs < 1 || newPairs > 1000) {
    return ctx.reply("❌ Invalid pairs limit. Choose between 1 and 1000.");
  }
  
  const user = await User.findOne({ where: { userId, approved: true } });
  if (!user) return ctx.reply("❌ You are not approved to receive notifications.");
  
  user.pairsLimit = newPairs;
  await user.save();
  
  ctx.reply(`✅ Pairs Limit Updated: **${newPairs} Pairs**`);
};
