// src/app/api/markets/route.ts

import { NextRequest, NextResponse } from "next/server";
import { MarketsApiResponse } from "@/types";
import { processMarketsData } from "@/utilities/markets/processMarketsData";
import { getFallbackMarketData } from "@/utilities/markets/getFallbackMarketData";

// Get appropriate country code for the request
function getCountryCode(region: string): string {
  const countryMap: Record<string, string> = {
    us: "us",
    americas: "us",
    europe: "gb",
    asia: "jp", // Use Japan as default for Asia
    currencies: "us",
    crypto: "us",
    futures: "us",
  };

  return countryMap[region.toLowerCase()] || "us";
}

// Get appropriate trend parameter based on region
function getTrendForRegion(region: string): string {
  const trendMap: Record<string, string> = {
    us: "indexes",
    americas: "indexes",
    europe: "indexes",
    asia: "indexes",
    currencies: "most-active", // Most active for currencies
    crypto: "crypto", // Crypto trend if available
    futures: "most-active",
  };

  return trendMap[region.toLowerCase()] || "indexes";
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get("region") || "us";

    // SerpAPI configuration
    const serpApiKey = process.env.SERP_API_KEY;
    if (!serpApiKey) {
      console.error("SERP_API_KEY environment variable is not set");
      return NextResponse.json(
        {
          error: "API configuration error",
          message: "Missing API key configuration",
        },
        { status: 500 }
      );
    }

    // Build SerpAPI URL for markets data
    const serpApiUrl = new URL("https://serpapi.com/search.json");
    serpApiUrl.searchParams.set("engine", "google_finance_markets");
    serpApiUrl.searchParams.set("api_key", serpApiKey);
    serpApiUrl.searchParams.set("trend", getTrendForRegion(region)); // Add the required trend parameter
    serpApiUrl.searchParams.set("hl", "en");
    serpApiUrl.searchParams.set("gl", getCountryCode(region));

    console.log(`Fetching markets data for region: ${region}`);
    console.log(`Using trend: ${getTrendForRegion(region)}`);
    console.log(
      `SerpAPI URL: ${serpApiUrl
        .toString()
        .replace(serpApiKey, "API_KEY_HIDDEN")}`
    );

    const response = await fetch(serpApiUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; MarketBot/1.0)",
      },
      // Add timeout
      signal: AbortSignal.timeout(30000), // 30 seconds timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `SerpAPI request failed: ${response.status} ${response.statusText}`,
        errorText
      );

      // Return fallback data instead of throwing an error
      console.log("Returning fallback data due to API error");
      return NextResponse.json(getFallbackMarketData(region));
    }

    const data: MarketsApiResponse = await response.json();
    console.log("Raw SerpAPI markets response received");
    console.log("Response keys:", Object.keys(data));

    // Check if there's an error in the SerpAPI response
    if (data.error) {
      console.error("SerpAPI returned an error:", data.error);
      return NextResponse.json(getFallbackMarketData(region));
    }

    // Log what we received to debug
    if (data.markets) {
      console.log("Markets data keys:", Object.keys(data.markets));
      Object.keys(data.markets).forEach((key) => {
        const markets = data.markets[key as keyof typeof data.markets];
        if (Array.isArray(markets)) {
          console.log(`${key}: ${markets.length} items`);
        }
      });
    }

    if (data.market_trends) {
      console.log(`Market trends: ${data.market_trends.length} trends`);
      data.market_trends.forEach((trend) => {
        console.log(`- ${trend.title}: ${trend.results?.length || 0} results`);
      });
    }

    // Process and structure the markets data
    const processedData = processMarketsData(data);

    // If no data was processed, return fallback data
    const totalItems = Object.values(processedData).reduce(
      (sum, arr) => sum + arr.length,
      0
    );

    if (totalItems === 0) {
      console.log("No data processed from API, returning fallback data");
      return NextResponse.json(getFallbackMarketData(region));
    }

    console.log(`Successfully processed ${totalItems} market items`);
    return NextResponse.json(processedData);
  } catch (error) {
    console.error("Markets API Error:", error);

    // Return fallback data instead of error
    const { searchParams } = new URL(request.url);
    const region = searchParams.get("region") || "us";

    console.log("Returning fallback data due to exception");
    return NextResponse.json(getFallbackMarketData(region));
  }
}
