import pool from "./config.js";

export const getMetrics = async (symbol) => {
  const query = "SELECT * FROM metrics WHERE symbol = $1 ORDER BY timestamp DESC LIMIT 1";
  const result = await pool.query(query, [symbol]);
  return result.rows[0];
};

export const insertMetrics = async (symbol, price, timestamp) => {
  const query = "INSERT INTO metrics (symbol, price, timestamp) VALUES ($1, $2, $3)";
  await pool.query(query, [symbol, price, timestamp]);
};
