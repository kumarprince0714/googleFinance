// src/utilities/generateSampleData.ts

import { formatDateForTimeRange } from "./formatDateForTimeRange";

// Enhanced helper function to generate sample data when API doesn't return graph data
export function generateSampleData(
  currentPrice: number,
  previousClose: number,
  timeRange: string
): Array<{ timestamp: number; price: number; date: string }> {
  const now = Date.now();
  const points: Array<{ timestamp: number; price: number; date: string }> = [];

  // Ensure we have valid prices
  if (currentPrice <= 0) {
    currentPrice = 100; // Default fallback price
  }
  if (previousClose <= 0) {
    previousClose = currentPrice * 0.99; // Assume 1% change
  }

  let numPoints = 20;
  let timeStep = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

  switch (timeRange) {
    case "1D":
      numPoints = 24;
      timeStep = 60 * 60 * 1000; // 1 hour
      break;
    case "5D":
      numPoints = 30;
      timeStep = 4 * 60 * 60 * 1000; // 4 hours
      break;
    case "1M":
      numPoints = 30;
      timeStep = 24 * 60 * 60 * 1000; // 1 day
      break;
    case "3M":
      numPoints = 45;
      timeStep = 2 * 24 * 60 * 60 * 1000; // 2 days
      break;
    case "6M":
      numPoints = 52;
      timeStep = 3.5 * 24 * 60 * 60 * 1000; // 3.5 days
      break;
    case "YTD":
    case "1Y":
      numPoints = 52;
      timeStep = 7 * 24 * 60 * 60 * 1000; // 1 week
      break;
    case "5Y":
      numPoints = 60;
      timeStep = 30 * 24 * 60 * 60 * 1000; // 1 month
      break;
    case "MAX":
      numPoints = 100;
      timeStep = 90 * 24 * 60 * 60 * 1000; // 3 months
      break;
  }

  const startTime = now - numPoints * timeStep;
  const totalChange = currentPrice - previousClose;
  const volatility = Math.max(Math.abs(totalChange) * 0.3, currentPrice * 0.02);

  // Generate more realistic price movements
  for (let i = 0; i < numPoints; i++) {
    const timestamp = Math.floor((startTime + i * timeStep) / 1000);
    const progress = i / (numPoints - 1);

    // Create a smooth progression from previousClose to currentPrice
    const basePrice = previousClose + totalChange * progress;

    // Add some realistic volatility
    const randomFactor = (Math.random() - 0.5) * 2; // -1 to 1
    const volatilityFactor = Math.sin((i / numPoints) * Math.PI * 4) * 0.3; // Wave pattern
    const priceVariation = (randomFactor + volatilityFactor) * volatility;

    let finalPrice = basePrice + priceVariation;

    // Ensure price is always positive and reasonable
    finalPrice = Math.max(finalPrice, currentPrice * 0.1);

    points.push({
      timestamp,
      price: Number(finalPrice.toFixed(2)),
      date: formatDateForTimeRange(timestamp, timeRange),
    });
  }

  // Ensure the last point is close to the current price
  if (points.length > 0) {
    points[points.length - 1].price = currentPrice;
  }

  console.log(`Generated ${points.length} sample data points for ${timeRange}`);
  console.log(
    `Price range: ${Math.min(...points.map((p) => p.price)).toFixed(
      2
    )} - ${Math.max(...points.map((p) => p.price)).toFixed(2)}`
  );

  return points;
}
