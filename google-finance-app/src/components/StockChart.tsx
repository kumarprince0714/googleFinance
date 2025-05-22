// //File location: src > components > StockChart.tsx
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useStockData } from "@/app/hooks/useStocks";
import { GraphPoint } from "@/types";

interface StockChartProps {
  symbol: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: GraphPoint;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
        <p className="text-sm font-medium">{`Time: ${data.date}`}</p>
        <p className="text-sm text-blue-600">{`Price: $${data.price.toFixed(
          2
        )}`}</p>
      </div>
    );
  }
  return null;
};

export default function StockChart({ symbol }: StockChartProps) {
  const { data: stockData, isLoading, error, isError } = useStockData(symbol);

  if (!symbol) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-lg">
          Enter a stock symbol to view the chart
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-red-500 text-lg font-medium">
            Error loading stock data
          </p>
          <p className="text-gray-500 text-sm mt-1">
            {error instanceof Error ? error.message : "Please try again later"}
          </p>
        </div>
      </div>
    );
  }

  if (!stockData) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-lg">No data available</p>
      </div>
    );
  }

  const { summary, graph } = stockData;
  const changeColor = summary.price.change >= 0 ? "#22c55e" : "#ef4444";

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {stockData.title}
            </h2>
            <p className="text-sm text-gray-500">{stockData.exchange}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">
              ${summary.price.current.toFixed(2)}
            </p>
            <div className="flex items-center justify-end space-x-2 mt-1">
              <span
                className={`text-sm font-medium ${
                  summary.price.change >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {summary.price.change >= 0 ? "+" : ""}
                {summary.price.change_percent.toFixed(2)}%
              </span>
              <span
                className={`text-sm ${
                  summary.price.change >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {summary.price.change >= 0 ? "+" : ""}
                {summary.price.change.toFixed(2)} Today
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              After Hours: ${summary.price.current.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={graph.graph}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                domain={["dataMin - 0.5", "dataMax + 0.5"]}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="price"
                stroke={changeColor}
                strokeWidth={2}
                dot={false}
                fill={changeColor}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
          <span>Prev close: ${graph.previous_close.toFixed(2)}</span>
          <span>{graph.timespan}</span>
        </div>
      </div>
    </div>
  );
}
