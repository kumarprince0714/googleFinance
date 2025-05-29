// src/app/hooks/useStocks.ts

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { StockData } from "@/types";

interface UseStockDataOptions {
  enabled?: boolean;
  timeRange?: string;
}

export const useStockData = (
  symbol: string,
  options: UseStockDataOptions = {}
) => {
  const { timeRange = "1D", enabled = true } = options;

  return useQuery({
    queryKey: ["stock", symbol, timeRange],
    queryFn: async (): Promise<StockData> => {
      const params = new URLSearchParams({
        symbol: symbol,
        timeRange: timeRange,
      });

      const response = await axios.get(`/api/stock?${params.toString()}`);
      return response.data;
    },
    enabled: Boolean(symbol && enabled),
    staleTime: getStaleTimeForRange(timeRange),
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: (failureCount, error) => {
      if (
        axios.isAxiosError(error) &&
        error.response?.status &&
        error.response.status < 500
      ) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Helper function to determine appropriate stale time based on time range
function getStaleTimeForRange(timeRange: string): number {
  switch (timeRange) {
    case "1D":
      return 1000 * 60 * 1; // 1 minute for intraday data
    case "5D":
      return 1000 * 60 * 5; // 5 minutes
    case "1M":
    case "3M":
      return 1000 * 60 * 15; // 15 minutes
    case "6M":
    case "YTD":
    case "1Y":
      return 1000 * 60 * 60; // 1 hour
    case "5Y":
    case "MAX":
      return 1000 * 60 * 60 * 4; // 4 hours
    default:
      return 1000 * 60 * 5; // 5 minutes default
  }
}
