//File location: src > app > page.tsx
"use client";
import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
//import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import StockSearch from "@/components/StockSearch";
import StockChart from "@/components/StockChart";

//create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export default function Home() {
  const [selectedSymbol, setSelectedSymbol] = useState("");

  return (
    <QueryClientProvider client={queryClient}>
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Stock market dashboard
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Search for any stock symbol and view real-time charts with
              detailed price information.
            </p>
          </div>
          <StockSearch onSymbolChange={setSelectedSymbol} />

          <div className="max-w-6xl mx-auto">
            <StockChart symbol={selectedSymbol} />
          </div>
        </div>
      </main>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}
