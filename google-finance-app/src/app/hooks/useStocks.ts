//File path: src/app/hooks/useStocks.ts

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { StockData } from "@/types";

interface UseStockDataOptions {
  enabled?: boolean;
}

export const useStockData = (
  symbol: string,
  options: UseStockDataOptions = {}
) => {
  return useQuery({
    // FIX 1: The query key needs to include the actual symbol value, not the string "symbol"
    queryKey: ["stock", symbol],
    queryFn: async (): Promise<StockData> => {
      const response = await axios.get(
        `/api/stock?symbol=${encodeURIComponent(symbol)}`
      );
      return response.data;
    },
    enabled: Boolean(symbol && options.enabled !== false),
    staleTime: 1000 * 60 * 5, //5 minutes
    gcTime: 1000 * 60 * 5,
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
