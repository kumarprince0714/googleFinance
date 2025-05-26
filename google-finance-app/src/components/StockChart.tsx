"use client";

import React from "react";
import { useStockData } from "@/app/hooks/useStocks";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartDataPoint, TooltipProps } from "@/types";

interface StockChartProps {
  symbol: string;
}

export default function StockChart({ symbol }: StockChartProps) {
  const {
    data: stockData,
    isLoading,
    error,
    isError,
  } = useStockData(symbol, {
    enabled: Boolean(symbol), // Only fetch when symbol is provided
  });

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
          <p className="text-gray-600">Loading stock data...</p>
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

  // Log the actual structure for debugging
  console.log(
    "Actual stockData structure:",
    JSON.stringify(stockData, null, 2)
  );

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

  // Extract data based on actual API response structure
  const { title, stock, exchange, summary, graph } = stockData;

  // Handle the actual data structure from your API with proper type checking
  const currentPrice = summary.extracted_price ?? summary.price?.current ?? 0;
  const currency = summary.currency || "$";
  const marketStatus =
    summary.market?.trading || summary.market?.status || "Unknown";

  // Calculate change information from market data
  const changeValue = summary.market?.price_movement?.value ?? 0;
  const changePercent = summary.market?.price_movement?.percentage ?? 0;
  const isPositive = summary.market?.price_movement?.movement === "Up";

  // Previous close calculation (current - change)
  const previousClose = currentPrice - changeValue;

  const changeColor = isPositive ? "text-green-600" : "text-red-600";

  // Create chart data - if graph data is insufficient, create a simple chart
  let chartData: ChartDataPoint[] = [];
  if (graph && graph.graph && graph.graph.length > 0) {
    // Use existing graph data if available and has price info
    chartData = graph.graph
      .filter((point) => point.price) // Only include points with price data
      .map((point) => ({
        time: point.date,
        price: point.price,
        timestamp: point.timestamp,
      }));
  }

  // If no valid chart data, create a simple two-point chart
  if (chartData.length === 0) {
    const now = new Date();
    const earlier = new Date(now.getTime() - 6 * 60 * 60 * 1000); // 6 hours ago

    chartData = [
      {
        time: earlier.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        price: previousClose,
        timestamp: Math.floor(earlier.getTime() / 1000),
      },
      {
        time: now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        price: currentPrice,
        timestamp: Math.floor(now.getTime() / 1000),
      },
    ];
  }

  // Custom tooltip for the chart with proper typing
  const CustomTooltip: React.FC<TooltipProps> = ({
    active,
    payload,
    label,
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-gray-600 text-sm">{label}</p>
          <p className="text-gray-900 font-semibold">
            {currency}
            {data.value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

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
            <div className={`flex items-center space-x-1 ${changeColor}`}>
              <svg
                className={`w-4 h-4 ${isPositive ? "rotate-0" : "rotate-180"}`}
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
          </div>

          <div className="mt-2 text-sm text-gray-600">
            <span>
              Previous close: {currency}
              {previousClose.toFixed(2)}
            </span>
          </div>

          {summary.market?.price && (
            <div className="mt-1 text-sm text-gray-600">
              <span>After hours: {summary.market.price}</span>
            </div>
          )}
        </div>
      </div>

      {/* Chart Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Price Chart</h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded">
            {graph?.timespan || "1D"}
          </span>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
              />
              <YAxis
                domain={["dataMin - 1", "dataMax + 1"]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickFormatter={(value) => `${currency}${value.toFixed(0)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="price"
                stroke={isPositive ? "#059669" : "#dc2626"}
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 4,
                  stroke: isPositive ? "#059669" : "#dc2626",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Info */}
      <div className="border-t border-gray-200 pt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Data points:</span>
            <span className="ml-2 font-semibold">{chartData.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Timespan:</span>
            <span className="ml-2 font-semibold">
              {graph?.timespan || "1D"}
            </span>
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
    </div>
  );
}
