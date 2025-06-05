// src/components/MarketsList.tsx

"use client";

import React, { useState } from "react";
import { useMarkets } from "@/app/hooks/useMarkets";
import { MarketIndex, MarketRegion, ProcessedMarketData } from "@/types";

// Market regions configuration
const MARKET_REGIONS: MarketRegion[] = [
  { key: "us", label: "United States", flag: "🇺🇸" },
  { key: "europe", label: "Europe", flag: "🇪🇺" },
  { key: "asia", label: "Asia", flag: "🌏" },
  { key: "currencies", label: "Currencies", flag: "💱" },
  { key: "crypto", label: "Crypto", flag: "₿" },
  { key: "futures", label: "Futures", flag: "📈" },
];

export default function MarketsList() {
  // Fix the type issue by being explicit about the type
  const [selectedRegion, setSelectedRegion] =
    useState<keyof ProcessedMarketData>("us");

  const {
    data: marketsData,
    isLoading,
    error,
    isError,
  } = useMarkets({
    enabled: true,
    region: selectedRegion,
  });

  const formatPrice = (price: number, currency?: string): string => {
    const currencySymbol = getCurrencySymbol(currency);
    return `${currencySymbol}${price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getCurrencySymbol = (currency?: string): string => {
    const currencyMap: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      INR: "₹",
      JPY: "¥",
      CNY: "¥",
    };

    if (!currency) return "$";

    // If currency is already a symbol, return it
    if (currency.length === 1 && /[₹$€£¥₿]/.test(currency)) {
      return currency;
    }

    return currencyMap[currency.toUpperCase()] || currency;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="flex space-x-2 mb-6">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded w-20"></div>
              ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
                Error loading market data
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error?.message || "Failed to fetch market indices"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentRegionData = marketsData?.[selectedRegion] || [];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Market Indices
        </h2>
        <p className="text-gray-600">Browse market indices by region</p>
      </div>

      {/* Region Selector */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {MARKET_REGIONS.map((region) => (
            <button
              key={region.key}
              onClick={() => setSelectedRegion(region.key)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedRegion === region.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span>{region.flag}</span>
              <span>{region.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Market Indices Grid */}
      {currentRegionData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentRegionData.map((index: MarketIndex, i: number) => (
            <div
              key={`${index.stock}-${i}`}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600">
                    {index.name}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {index.stock}
                  </p>
                </div>
                <div className="ml-3 text-right">
                  <div className="font-bold text-gray-900">
                    {formatPrice(index.price, index.currency)}
                  </div>
                  <div
                    className={`text-sm font-medium flex items-center justify-end ${
                      index.price_movement.movement === "Up"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    <svg
                      className={`w-3 h-3 mr-1 ${
                        index.price_movement.movement === "Up"
                          ? "rotate-0"
                          : "rotate-180"
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
                    {index.price_movement.percentage > 0 ? "+" : ""}
                    {index.price_movement.percentage.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
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
          <p className="text-gray-500 text-lg mb-2">
            No market indices available
          </p>
          <p className="text-gray-400">
            Try selecting a different region or check back later
          </p>
        </div>
      )}

      {/* Footer */}
      {currentRegionData.length > 0 && (
        <div className="border-t border-gray-200 pt-4 mt-6">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              Showing {currentRegionData.length} indices for{" "}
              {MARKET_REGIONS.find((r) => r.key === selectedRegion)?.label}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
