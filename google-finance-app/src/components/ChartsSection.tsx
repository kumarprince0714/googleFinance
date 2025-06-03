// src/components/ChartsSection.tsx

"use client";

import React from "react";
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

interface ChartsSectionProps {
  chartData: ChartDataPoint[];
  currency: string;
  isPositive: boolean;
  minPrice: number;
  maxPrice: number;
  padding: number;
}

export default function ChartsSection({
  chartData,
  currency,
  isPositive,
  minPrice,
  maxPrice,
  padding,
}: ChartsSectionProps) {
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
    <div className="mb-4">
      {chartData.length > 0 ? (
        <div className="h-96">
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
                interval={Math.max(Math.floor(chartData.length / 8), 1)}
              />
              <YAxis
                domain={[minPrice - padding, maxPrice + padding]}
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
      ) : (
        <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-gray-500">No chart data available</p>
            <p className="text-sm text-gray-400 mt-1">
              Chart data may not be available for this symbol or time range
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
