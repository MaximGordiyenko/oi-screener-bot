export const formatSymbol= (symbol) => {
  if (symbol.includes("/")) {
    return symbol; // Already formatted
  }
  
  if (symbol.endsWith("USDT")) {
    const base = symbol.slice(0, -4);
    return `${base}/USDT`;
  } else if (symbol.endsWith("BTC")) { // Example for another quote currency
    const base = symbol.slice(0, -3);
    return `${base}/BTC`;
  } else if (symbol.endsWith("USD")) { // Example for USD
    const base = symbol.slice(0, -3);
    return `${base}/USD`;
  }
  else {
    return symbol; // Return original if no known suffix
  }
}
