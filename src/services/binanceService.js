import axios from "axios";

const BINANCE_API_URL = `${process.env.BINANCE_API_URL}/24hr`;

export const getBinanceTopPairs = async (limit = 100) => {
  try {
    const response = await axios.get(BINANCE_API_URL);
    const sortedPairs = response.data
      .filter((pair) => pair.symbol.endsWith("USDT")) // Focus on USDT pairs
      .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume)) // Sort by volume
      .slice(0, limit)
      .map((pair) => pair.symbol.toLowerCase()); // Convert to lowercase for WebSocket format
    
    return sortedPairs;
  } catch (error) {
    console.error("❌ Error fetching top pairs:", error);
    return [];
  }
};
