// src/app/hooks/useMarkets.ts

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ProcessedMarketData, MarketsError, UseMarketsOptions } from "@/types";

export const useMarkets = (options: UseMarketsOptions = {}) => {
  const { enabled = true, region = "us" } = options;

  return useQuery({
    queryKey: ["markets", region],
    queryFn: async (): Promise<ProcessedMarketData> => {
      const params = new URLSearchParams({
        region: region,
      });

      const response = await axios.get(`/api/markets?${params.toString()}`);
      return response.data;
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    retry: (failureCount, error) => {
      if (
        axios.isAxiosError(error) &&
        error.response?.status &&
        error.response.status < 500
      ) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

// Hook for getting specific market region data
export const useMarketsByRegion = (region: keyof ProcessedMarketData) => {
  const { data, isLoading, error, isError } = useMarkets({ region });

  return {
    data: data?.[region] || [],
    isLoading,
    error: error as MarketsError,
    isError,
  };
};
