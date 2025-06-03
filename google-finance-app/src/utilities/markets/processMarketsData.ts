// src/utilities/markets/processMarketsData.ts

import { MarketsApiResponse, ProcessedMarketData } from "@/types";

export function processMarketsData(
  data: MarketsApiResponse
): ProcessedMarketData {
  const processed: ProcessedMarketData = {
    us: [],
    europe: [],
    asia: [],
    currencies: [],
    crypto: [],
    futures: [],
  };

  console.log("Processing markets data...");

  // Process markets from the main markets object
  if (data.markets) {
    console.log("Found markets data:", Object.keys(data.markets));

    if (data.markets.us && Array.isArray(data.markets.us)) {
      processed.us = data.markets.us;
      console.log(`Added ${data.markets.us.length} US markets`);
    }
    if (data.markets.europe && Array.isArray(data.markets.europe)) {
      processed.europe = data.markets.europe;
      console.log(`Added ${data.markets.europe.length} Europe markets`);
    }
    if (data.markets.asia && Array.isArray(data.markets.asia)) {
      processed.asia = data.markets.asia;
      console.log(`Added ${data.markets.asia.length} Asia markets`);
    }
    if (data.markets.currencies && Array.isArray(data.markets.currencies)) {
      processed.currencies = data.markets.currencies;
      console.log(`Added ${data.markets.currencies.length} currencies`);
    }
    if (data.markets.crypto && Array.isArray(data.markets.crypto)) {
      processed.crypto = data.markets.crypto;
      console.log(`Added ${data.markets.crypto.length} crypto`);
    }
    if (data.markets.futures && Array.isArray(data.markets.futures)) {
      processed.futures = data.markets.futures;
      console.log(`Added ${data.markets.futures.length} futures`);
    }
  }

  // Also process market_trends data if available
  if (
    data.market_trends &&
    Array.isArray(data.market_trends) &&
    data.market_trends.length > 0
  ) {
    console.log(`Processing ${data.market_trends.length} market trends`);

    data.market_trends.forEach((trend) => {
      const title = trend.title.toLowerCase();
      console.log(
        `Processing trend: ${trend.title} with ${
          trend.results?.length || 0
        } results`
      );

      if (trend.results && Array.isArray(trend.results)) {
        if (title.includes("americas") || title.includes("america")) {
          processed.us.push(...trend.results);
        } else if (title.includes("europe") || title.includes("emea")) {
          processed.europe.push(...trend.results);
        } else if (title.includes("asia") || title.includes("pacific")) {
          processed.asia.push(...trend.results);
        }
      }
    });
  }

  // Remove duplicates based on stock symbol
  Object.keys(processed).forEach((key) => {
    const typedKey = key as keyof ProcessedMarketData;
    const seen = new Set<string>();
    const originalLength = processed[typedKey].length;
    processed[typedKey] = processed[typedKey].filter((item) => {
      if (seen.has(item.stock)) {
        return false;
      }
      seen.add(item.stock);
      return true;
    });

    if (originalLength !== processed[typedKey].length) {
      console.log(
        `Removed ${
          originalLength - processed[typedKey].length
        } duplicates from ${key}`
      );
    }
  });

  const totalItems = Object.values(processed).reduce(
    (sum, arr) => sum + arr.length,
    0
  );
  console.log(`Processed markets data complete. Total items: ${totalItems}`);

  return processed;
}
