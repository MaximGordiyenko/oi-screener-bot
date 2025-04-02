import { DataTypes } from "sequelize";
import { sequelize } from '../config/db.js';

export const User = sequelize.define("User", {
  userId: {
    type: DataTypes.BIGINT,
    unique: true,
    allowNull: false,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  language: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  type_chat: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  chat_is_bot: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  pairsLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 100, // Default: Top 100 pairs
  },
  pricePumpThreshold: {
    type: DataTypes.FLOAT,
    defaultValue: 5, // Default: 5% change triggers alert
  },
  pumpInterval: {
    type: DataTypes.INTEGER,
    defaultValue: 5, // Default: Every 5 minutes
  },
});

await User.sync(); // Ensure the table exists
