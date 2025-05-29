// src/app/api/stock/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { SerpApiResponse, StockData, ApiError } from "@/types";
import { formatDateForTimeRange } from "@/utilities/formatDateForTimeRange";
import { generateSampleData } from "@/utilities/generateSampleData";

const SERP_API_KEY = process.env.SERP_API_KEY;
const SERP_API_URL = "https://serpapi.com/search";

// Time range mapping for SerpAPI
const TIME_RANGE_MAP = {
  "1D": "1d",
  "5D": "5d",
  "1M": "1m",
  "3M": "3m",
  "6M": "6m",
  YTD: "ytd",
  "1Y": "1y",
  "5Y": "5y",
  MAX: "max",
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");
    const timeRange = searchParams.get("timeRange") || "1D";

    if (!symbol) {
      return NextResponse.json(
        { message: "Stock symbol is required" } as ApiError,
        { status: 400 }
      );
    }

    if (!SERP_API_KEY) {
      return NextResponse.json(
        { message: "SerpAPI key not configured" } as ApiError,
        { status: 500 }
      );
    }

    console.log(`Fetching data for symbol: ${symbol}, timeRange: ${timeRange}`);

    // Map the time range to SerpAPI format
    const serpTimeRange =
      TIME_RANGE_MAP[timeRange as keyof typeof TIME_RANGE_MAP] || "1d";

    const response = await axios.get<SerpApiResponse>(SERP_API_URL, {
      params: {
        engine: "google_finance",
        q: symbol,
        api_key: SERP_API_KEY,
        interval: serpTimeRange,
      },
      timeout: 15000,
    });

    const serpData = response.data;

    // Log the entire response to understand the structure
    console.log("SerpAPI Response:", JSON.stringify(serpData, null, 2));

    // Check if the API returned an error
    if (serpData.search_metadata?.status !== "Success") {
      console.error(
        "SerpAPI returned non-success status:",
        serpData.search_metadata
      );
      return NextResponse.json(
        { message: "Failed to fetch stock data from SerpAPI" } as ApiError,
        { status: 500 }
      );
    }

    // Validate that we have the required summary data
    if (!serpData.summary) {
      console.error("Missing summary data in SerpAPI response");
      return NextResponse.json(
        {
          message: "Stock data not found. Please check the symbol format.",
        } as ApiError,
        { status: 404 }
      );
    }

    // Extract current price from multiple possible locations
    const currentPrice =
      serpData.summary.extracted_price ||
      serpData.summary.price?.current ||
      parseFloat(serpData.summary.price?.toString() || "0") ||
      0;

    // Extract previous close
    const previousClose =
      serpData.summary.price?.previous_close ||
      serpData.graph?.previous_close ||
      currentPrice;

    // Calculate change if not provided
    let changeValue = serpData.summary.market?.price_movement?.value || 0;
    let changePercent =
      serpData.summary.market?.price_movement?.percentage || 0;

    if (changeValue === 0 && currentPrice > 0 && previousClose > 0) {
      changeValue = currentPrice - previousClose;
      changePercent = (changeValue / previousClose) * 100;
    }

    // Handle graph data with fallback to sample data
    const graphData = {
      timespan: timeRange,
      previous_close: previousClose,
      graph: [] as Array<{
        timestamp: number;
        price: number;
        date: string;
      }>,
    };

    // Try to use real graph data first
    if (
      serpData.graph &&
      serpData.graph.graph &&
      Array.isArray(serpData.graph.graph) &&
      serpData.graph.graph.length > 0
    ) {
      console.log("Using real graph data from SerpAPI");
      graphData.graph = serpData.graph.graph.map((point) => ({
        timestamp: point.timestamp,
        price: point.price,
        date: formatDateForTimeRange(point.timestamp, timeRange),
      }));
    } else {
      console.log("No real graph data available, generating sample data");
      // Always generate sample data when real data is not available
      graphData.graph = generateSampleData(
        currentPrice,
        previousClose,
        timeRange
      );
    }

    console.log(`Generated ${graphData.graph.length} data points`);

    // Ensure we have updated summary data with calculated values
    const updatedSummary = {
      ...serpData.summary,
      extracted_price: currentPrice,
      price: {
        current: currentPrice,
        previous_close: previousClose,
        change: changeValue,
        change_percent: changePercent,
      },
      market: {
        ...serpData.summary.market,
        price_movement: {
          value: changeValue,
          percentage: changePercent,
          movement: changeValue >= 0 ? "Up" : "Down",
        },
      },
    };

    // Transform the data to match the interface
    const stockData: StockData = {
      title: serpData.title || `${symbol} Stock`,
      stock: serpData.stock || symbol.split(":")[0],
      exchange: serpData.exchange || symbol.split(":")[1] || "UNKNOWN",
      summary: updatedSummary,
      graph: graphData,
    };

    console.log(
      "Final stockData being returned:",
      JSON.stringify(stockData, null, 2)
    );

    return NextResponse.json(stockData);
  } catch (error) {
    console.error("Error fetching stock data:", error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      let message = "Failed to fetch stock data";

      if (error.response?.data) {
        console.error("SerpAPI error response:", error.response.data);
        message =
          error.response.data.error ||
          error.response.data.message ||
          `SerpAPI returned ${status} error`;
      }

      if (error.code === "ECONNABORTED") {
        message = "Request timeout - please try again";
      }

      return NextResponse.json({ message } as ApiError, { status });
    }

    return NextResponse.json(
      {
        message: "Internal server error",
      } as ApiError,
      { status: 500 }
    );
  }
}
