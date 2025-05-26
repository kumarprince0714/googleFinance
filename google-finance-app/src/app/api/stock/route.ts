// src/app/api/stock/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { SerpApiResponse, StockData, ApiError } from "@/types";

const SERP_API_KEY = process.env.SERP_API_KEY;
const SERP_API_URL = "https://serpapi.com/search";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");

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

    console.log(`Fetching data for symbol: ${symbol}`);

    const response = await axios.get<SerpApiResponse>(SERP_API_URL, {
      params: {
        engine: "google_finance",
        q: symbol,
        api_key: SERP_API_KEY,
      },
      timeout: 10000,
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

    // Handle missing or invalid graph data more gracefully
    let graphData = {
      timespan: "1D",
      previous_close: serpData.summary?.price?.previous_close || 0,
      graph: [] as Array<{
        timestamp: number;
        price: number;
        date: string;
      }>,
    };

    if (
      serpData.graph &&
      serpData.graph.graph &&
      Array.isArray(serpData.graph.graph) &&
      serpData.graph.graph.length > 0
    ) {
      graphData = {
        timespan: serpData.graph.timespan || "1D",
        previous_close:
          serpData.graph.previous_close ||
          serpData.summary.price.previous_close,
        graph: serpData.graph.graph.map((point) => ({
          timestamp: point.timestamp,
          price: point.price,
          date: new Date(point.timestamp * 1000).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        })),
      };
    } else {
      console.warn("No graph data available, returning empty graph");
      // Create a single point graph with current price if no graph data
      const currentTime = Math.floor(Date.now() / 1000);
      graphData.graph = [
        {
          timestamp: currentTime,
          price: serpData.summary.price.current,
          date: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ];
    }

    // Transform the data to match the interface
    const stockData: StockData = {
      title: serpData.title || `${symbol} Stock`,
      stock: serpData.stock || symbol.split(":")[0],
      exchange: serpData.exchange || symbol.split(":")[1] || "UNKNOWN",
      summary: serpData.summary,
      graph: graphData,
    };

    // Add these lines right before: return NextResponse.json(stockData);
    console.log(
      "Final stockData being returned:",
      JSON.stringify(stockData, null, 2)
    );
    console.log("Summary structure:", stockData.summary);
    console.log("Price structure:", stockData.summary?.price);

    return NextResponse.json(stockData);
  } catch (error) {
    console.error("Error fetching stock data:", error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      let message = "Failed to fetch stock data";

      // Handle specific SerpAPI errors
      if (error.response?.data) {
        console.error("SerpAPI error response:", error.response.data);
        message =
          error.response.data.error ||
          error.response.data.message ||
          `SerpAPI returned ${status} error`;
      }

      // Handle timeout
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
