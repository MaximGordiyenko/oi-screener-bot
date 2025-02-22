import WebSocket from 'ws';
import { getSymbols } from './byBitService.js';

const bybitWs = new WebSocket("wss://stream.bybit.com/v5/public/linear");
const trackedBybitPairs = {}; // Keep track of Bybit subscriptions

bybitWs.on("open", async () => {
  console.log("🚀 Bybit WebSocket connected!");
  
  const subscribeToBybit = (symbol) => {
    if (!trackedBybitPairs[symbol]) {
      const subscribeMessage = {
        op: "subscribe",
        args: [`tickers.${symbol}`]
      };
      bybitWs.send(JSON.stringify(subscribeMessage));
      trackedBybitPairs[symbol] = { price: null };
    }
  };
  
  const unsubscribeFromBybit = (symbol) => {
    if (trackedBybitPairs[symbol]) {
      const unsubscribeMessage = {
        op: "unsubscribe",
        args: [`tickers.${symbol}`]
      };
      console.log(`Unsubscribing from Bybit: ${symbol}`);
      bybitWs.send(JSON.stringify(unsubscribeMessage));
      delete trackedBybitPairs[symbol];
    }
  };
  
  
  // 1. Fetch from Binance
  const topPairs = await getSymbols();
  
  if (topPairs.length === 0) {
    console.error("Could not fetch top pairs from Binance. Exiting.");
    bybitWs.close();
    return;
  }
  
  // 2. Subscribe to the same pairs on Bybit (if they exist)
  topPairs.forEach(symbol => {
    // Check if the symbol exists on Bybit (important!)
    // You might need to make a separate API call to Bybit to verify.
    // For simplicity, I'm assuming all symbols exist.  In a real app, you MUST verify.
    
    // ***Add verification here***
    subscribeToBybit(symbol); // Subscribe to Bybit only if the symbol exists there
  });
  
  
});

bybitWs.on("message", (data) => {
  try {
    const message = JSON.parse(data.toString());
    if (message.topic && message.topic.startsWith("tickers.")) {
      const symbol = message.topic.split('.')[1];
      const price = message.data.bid1Price || message.data.ask1Price;
      
      if (trackedBybitPairs[symbol]) { // Check if we're tracking this symbol
        trackedBybitPairs[symbol].price = price;
        console.log(`Bybit ${symbol}: ${price}`);
      }
    }
  } catch (error) {
    console.error("Error processing Bybit message:", error);
  }
});

bybitWs.on("error", (error) => {
  console.error("Bybit WebSocket error:", error);
});

bybitWs.on("close", () => {
  console.log("Bybit WebSocket connection closed");
});
