export const getSymbols = async () => {
  try {
    const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
    const data = await response.json();
    return data
      .filter((pair) => pair.symbol.endsWith("USDT"))
      .map(item => item.symbol)
      .slice(0, 100); // Limit to 1000 pairs
  } catch (error) {
    console.error('Error fetching symbols:', error);
    return [];
  }
};
