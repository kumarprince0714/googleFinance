// src/components/StockChart.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useStockData } from "@/app/hooks/useStocks";
import { ChartDataPoint } from "@/types";
import ChartsSection from "./ChartsSection";

interface StockChartProps {
  symbol: string;
}

// Time range options
const TIME_RANGES = [
  { value: "1D", label: "1D" },
  { value: "5D", label: "5D" },
  { value: "1M", label: "1M" },
  { value: "3M", label: "3M" },
  { value: "6M", label: "6M" },
  { value: "YTD", label: "YTD" },
  { value: "1Y", label: "1Y" },
  { value: "5Y", label: "5Y" },
  { value: "MAX", label: "MAX" },
];

export default function StockChart({ symbol }: StockChartProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState("1D");

  const {
    data: stockData,
    isLoading,
    error,
    isError,
  } = useStockData(symbol, {
    enabled: Boolean(symbol),
    timeRange: selectedTimeRange,
  });

  // Debug logging
  useEffect(() => {
    if (stockData) {
      console.log("StockChart received data:", stockData);
      console.log("Graph data length:", stockData.graph?.graph?.length || 0);
      console.log("Sample graph data:", stockData.graph?.graph?.slice(0, 3));
    }
  }, [stockData]);

  // Don't render anything if no symbol is provided
  if (!symbol) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <p className="text-gray-500 text-lg">
            Enter a stock symbol to view chart
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Loading stock data for {selectedTimeRange}...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !stockData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading stock data
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>
                {error?.message ||
                  "Failed to fetch stock data. Please check the symbol and try again."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Validate basic structure
  if (!stockData.summary) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="text-center">
          <p className="text-yellow-800">Missing stock summary data</p>
        </div>
      </div>
    );
  }

  // Extract data with better error handling
  const { title, stock, exchange, summary, graph } = stockData;

  // Handle the actual data structure with multiple fallbacks
  const currentPrice =
    summary.extracted_price ||
    summary.price?.current ||
    parseFloat(summary.price?.toString() || "0") ||
    0;

  const currency = summary.currency || "$";
  const marketStatus =
    summary.market?.trading || summary.market?.status || "Unknown";

  // Calculate change information with fallbacks
  const changeValue =
    summary.market?.price_movement?.value || summary.price?.change || 0;
  const changePercent =
    summary.market?.price_movement?.percentage ||
    summary.price?.change_percent ||
    0;
  const isPositive =
    summary.market?.price_movement?.movement === "Up" || changeValue >= 0;

  // Previous close calculation with fallback
  const previousClose =
    summary.price?.previous_close ||
    graph?.previous_close ||
    currentPrice - changeValue;

  const changeColor = isPositive ? "text-green-600" : "text-red-600";

  // Create chart data with better validation
  let chartData: ChartDataPoint[] = [];

  if (
    graph &&
    graph.graph &&
    Array.isArray(graph.graph) &&
    graph.graph.length > 0
  ) {
    console.log("Processing graph data:", graph.graph.length, "points");

    chartData = graph.graph
      .filter(
        (point) => point && typeof point.price === "number" && point.price > 0
      )
      .map((point) => ({
        time: point.date || new Date(point.timestamp * 1000).toLocaleString(),
        price: Number(point.price.toFixed(2)),
        timestamp: point.timestamp,
      }));

    console.log("Filtered chart data:", chartData.length, "points");
  } else {
    console.warn("No valid graph data found in response");
  }

  // If we still don't have chart data, create a simple fallback
  if (chartData.length === 0) {
    console.log("Creating fallback chart data");
    const now = Date.now();
    chartData = [
      {
        time: "Start",
        price: previousClose,
        timestamp: Math.floor((now - 3600000) / 1000), // 1 hour ago
      },
      {
        time: "Current",
        price: currentPrice,
        timestamp: Math.floor(now / 1000),
      },
    ];
  }

  // Calculate price range for Y-axis
  const prices = chartData.map((point) => point.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;
  const padding = Math.max(priceRange * 0.05, currentPrice * 0.01); // At least 1% padding

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header Section */}
      <div className="border-b border-gray-200 pb-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {summary.title || title}
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{stock}</span>
              <span>•</span>
              <span>{exchange}</span>
              <span>•</span>
              <span
                className={`px-2 py-1 rounded text-xs ${
                  marketStatus.toLowerCase().includes("open") ||
                  marketStatus.toLowerCase().includes("trading")
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {marketStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Price Information */}
        <div className="mt-4">
          <div className="flex items-baseline space-x-3">
            <span className="text-3xl font-bold text-gray-900">
              {currency}
              {currentPrice.toFixed(2)}
            </span>
            {changeValue !== 0 && (
              <div className={`flex items-center space-x-1 ${changeColor}`}>
                <svg
                  className={`w-4 h-4 ${
                    isPositive ? "rotate-0" : "rotate-180"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414 6.707 7.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-semibold">
                  {isPositive ? "+" : ""}
                  {changeValue.toFixed(2)} ({isPositive ? "+" : ""}
                  {changePercent.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>

          <div className="mt-2 text-sm text-gray-600">
            <span>
              Previous close: {currency}
              {previousClose.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Price Chart</h3>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {TIME_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => setSelectedTimeRange(range.value)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedTimeRange === range.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Charts Section - Now using the separate component */}
      <ChartsSection
        chartData={chartData}
        currency={currency}
        isPositive={isPositive}
        minPrice={minPrice}
        maxPrice={maxPrice}
        padding={padding}
      />

      {/* Additional Info */}
      <div className="border-t border-gray-200 pt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Data points:</span>
            <span className="ml-2 font-semibold">{chartData.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Timespan:</span>
            <span className="ml-2 font-semibold">{selectedTimeRange}</span>
          </div>
          <div>
            <span className="text-gray-600">Currency:</span>
            <span className="ml-2 font-semibold">{currency}</span>
          </div>
          <div>
            <span className="text-gray-600">Market:</span>
            <span className="ml-2 font-semibold">{marketStatus}</span>
          </div>
        </div>
      </div>

      {/* Debug Information (remove in production) */}
      {/* {process.env.NODE_ENV === "development" && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
          <details>
            <summary className="cursor-pointer font-semibold">
              Debug Info
            </summary>
            <pre className="mt-2 whitespace-pre-wrap">
              {JSON.stringify(
                {
                  currentPrice,
                  previousClose,
                  changeValue,
                  changePercent,
                  chartDataLength: chartData.length,
                  sampleChartData: chartData.slice(0, 2),
                },
                null,
                2
              )}
            </pre>
          </details>
        </div>
      )} */}
    </div>
  );
}
