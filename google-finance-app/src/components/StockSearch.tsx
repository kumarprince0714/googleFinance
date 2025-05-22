//File location: src > components > StockSearch.tsx

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSymbolChange(inputValue.trim());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full mx-auto mb-8">
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-12 text-lg border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Search
        </button>
      </div>
      <div className="mt-2 text-sm text-gray-600">
        <p>Examples: GOOGL:NASDAQ, AAPL:NASDAQ, TSLA:NASDAQ</p>
      </div>
    </form>
  );
}
