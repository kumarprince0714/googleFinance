// src/utilities/markets/getFallbackMarketData.ts

import { ProcessedMarketData } from "@/types";

export function getFallbackMarketData(region: string): ProcessedMarketData {
  const fallbackData: ProcessedMarketData = {
    us: [
      {
        stock: ".DJI:INDEXDJX",
        link: "#",
        serpapi_link: "#",
        name: "Dow Jones Industrial Average",
        price: 34000.0,
        currency: "USD",
        price_movement: {
          percentage: 0.5,
          value: 170.0,
          movement: "Up",
        },
      },
      {
        stock: ".INX:INDEXSP",
        link: "#",
        serpapi_link: "#",
        name: "S&P 500",
        price: 4200.0,
        currency: "USD",
        price_movement: {
          percentage: 0.3,
          value: 12.5,
          movement: "Up",
        },
      },
      {
        stock: ".IXIC:INDEXNASDAQ",
        link: "#",
        serpapi_link: "#",
        name: "NASDAQ Composite",
        price: 13000.0,
        currency: "USD",
        price_movement: {
          percentage: -0.2,
          value: -26.0,
          movement: "Down",
        },
      },
    ],
    europe: [
      {
        stock: "UKX:INDEXFTSE",
        link: "#",
        serpapi_link: "#",
        name: "FTSE 100",
        price: 7500.0,
        currency: "GBP",
        price_movement: {
          percentage: 0.4,
          value: 30.0,
          movement: "Up",
        },
      },
      {
        stock: "DAX:INDEXDB",
        link: "#",
        serpapi_link: "#",
        name: "DAX",
        price: 15000.0,
        currency: "EUR",
        price_movement: {
          percentage: -0.1,
          value: -15.0,
          movement: "Down",
        },
      },
    ],
    asia: [
      {
        stock: "N225:INDEXNIKKEI",
        link: "#",
        serpapi_link: "#",
        name: "Nikkei 225",
        price: 28000.0,
        currency: "JPY",
        price_movement: {
          percentage: 0.8,
          value: 224.0,
          movement: "Up",
        },
      },
      {
        stock: "SENSEX:INDEXBOM",
        link: "#",
        serpapi_link: "#",
        name: "BSE Sensex",
        price: 60000.0,
        currency: "INR",
        price_movement: {
          percentage: 0.6,
          value: 360.0,
          movement: "Up",
        },
      },
    ],
    currencies: [
      {
        stock: "EURUSD:CUR",
        link: "#",
        serpapi_link: "#",
        name: "EUR/USD",
        price: 1.08,
        currency: "USD",
        price_movement: {
          percentage: 0.2,
          value: 0.002,
          movement: "Up",
        },
      },
      {
        stock: "GBPUSD:CUR",
        link: "#",
        serpapi_link: "#",
        name: "GBP/USD",
        price: 1.25,
        currency: "USD",
        price_movement: {
          percentage: -0.1,
          value: -0.001,
          movement: "Down",
        },
      },
    ],
    crypto: [
      {
        stock: "BTC-USD:CRYPTO",
        link: "#",
        serpapi_link: "#",
        name: "Bitcoin",
        price: 45000.0,
        currency: "USD",
        price_movement: {
          percentage: 2.5,
          value: 1125.0,
          movement: "Up",
        },
      },
      {
        stock: "ETH-USD:CRYPTO",
        link: "#",
        serpapi_link: "#",
        name: "Ethereum",
        price: 3000.0,
        currency: "USD",
        price_movement: {
          percentage: 1.8,
          value: 54.0,
          movement: "Up",
        },
      },
    ],
    futures: [
      {
        stock: "CL=F:NYMEX",
        link: "#",
        serpapi_link: "#",
        name: "Crude Oil",
        price: 75.0,
        currency: "USD",
        price_movement: {
          percentage: -1.2,
          value: -0.9,
          movement: "Down",
        },
      },
      {
        stock: "GC=F:COMEX",
        link: "#",
        serpapi_link: "#",
        name: "Gold",
        price: 1950.0,
        currency: "USD",
        price_movement: {
          percentage: 0.3,
          value: 5.85,
          movement: "Up",
        },
      },
    ],
  };

  // Return data based on region, but always include some US data as fallback
  if (region === "us") {
    return {
      ...fallbackData,
      us: fallbackData.us,
    };
  } else if (region === "europe") {
    return {
      ...fallbackData,
      europe: fallbackData.europe,
      us: fallbackData.us.slice(0, 2), // Include some US data
    };
  } else if (region === "asia") {
    return {
      ...fallbackData,
      asia: fallbackData.asia,
      us: fallbackData.us.slice(0, 2), // Include some US data
    };
  }

  return fallbackData;
}
