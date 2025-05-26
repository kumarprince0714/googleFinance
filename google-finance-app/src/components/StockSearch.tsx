"use client";

import { useState } from "react";

interface StockSearchProps {
  onSymbolChange: (symbol: string) => void;
  placeholder?: string;
}

export default function StockSearch({
  onSymbolChange,
  placeholder = "Enter stock symbol (e.g., GOOGL:NASDAQ)",
}: StockSearchProps) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  const validateSymbol = (symbol: string): boolean => {
    // Basic validation for symbol format
    const symbolPattern = /^[A-Z]+:[A-Z]+$/i;
    return symbolPattern.test(symbol.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedValue = inputValue.trim().toUpperCase();

    if (!trimmedValue) {
      setError("Please enter a stock symbol");
      return;
    }

    if (!validateSymbol(trimmedValue)) {
      setError("Please use format: SYMBOL:EXCHANGE (e.g., GOOGL:NASDAQ)");
      return;
    }

    setError("");
    onSymbolChange(trimmedValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (error) setError(""); // Clear error when user starts typing
  };

  return (
    <form onSubmit={handleSubmit} className="w-full mx-auto mb-8">
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 pr-12 text-lg border rounded-lg focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
            error ? "border-red-500" : "border-gray-300"
          }`}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Search
        </button>
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600">
          <p>{error}</p>
        </div>
      )}

      <div className="mt-2 text-sm text-gray-600">
        <p>Examples: GOOGL:NASDAQ, AAPL:NASDAQ, TSLA:NASDAQ, MSFT:NASDAQ</p>
        <p>Format: SYMBOL:EXCHANGE</p>
      </div>
    </form>
  );
}
