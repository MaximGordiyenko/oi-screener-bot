module.exports = {
  apps : [{
    name: "oi-screener-bot",
    script: "index.js",
    env_production: { // For production environment
      "BOT_TOKEN": process.env.BOT_TOKEN, // Example: loading from .env
      "DATABASE_URL": process.env.DATABASE_URL,
      // ... other variables
    },
    env: { // For development environment. This will be overwritten by env_production if NODE_ENV=production
      "BOT_TOKEN": process.env.BOT_TOKEN, // Example: loading from .env
    }
  }]
};
