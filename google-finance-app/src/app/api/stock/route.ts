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

    const response = await axios.get<SerpApiResponse>(SERP_API_URL, {
      params: {
        engine: "google_finance",
        q: symbol,
        api_key: SERP_API_KEY,
      },
      timeout: 10000,
    });

    const serpData = response.data;

    // FIX: Add better error handling for missing graph data
    if (
      !serpData.graph ||
      !serpData.graph.graph ||
      !Array.isArray(serpData.graph.graph)
    ) {
      console.error("Invalid graph data structure:", serpData);
      return NextResponse.json(
        { message: "Invalid data structure from SerpAPI" } as ApiError,
        { status: 500 }
      );
    }

    // Transform the data to match the interface
    const stockData: StockData = {
      title: serpData.title || `${symbol} Stock`,
      stock: serpData.stock || symbol.split(":")[0],
      exchange: serpData.exchange || symbol.split(":")[1] || "UNKNOWN",
      summary: serpData.summary,
      graph: {
        ...serpData.graph,
        // FIX: Correct the property name "timeStamp" to "timestamp"
        graph: serpData.graph.graph.map((point) => ({
          ...point,
          date: new Date(point.timestamp * 1000).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        })),
      },
    };

    return NextResponse.json(stockData);
  } catch (error) {
    // FIX: Enhanced error logging
    console.error("Error fetching stock data:", error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message =
        error.response?.data?.error || "Failed to fetch stock data";
      console.error("Axios error details:", {
        status,
        message,
        url: error.config?.url,
        data: error.response?.data,
      });
      return NextResponse.json({ message, status } as ApiError, { status });
    }
    return NextResponse.json({ message: "Internal server error" } as ApiError, {
      status: 500,
    });
  }
}
