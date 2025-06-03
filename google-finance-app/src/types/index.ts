// src/types/index.ts

export interface StockPrice {
  current: number;
  previous_close: number;
  change: number;
  change_percent: number;
}

export interface StockMarket {
  status: string;
  timezone: string;
  // Additional properties based on actual API response
  trading?: string;
  extracted_price?: number;
  price?: string;
  price_movement?: {
    value: number;
    percentage: number;
    movement: string; // "Up" or "Down"
  };
}

export interface StockSummary {
  currency: string;
  price: StockPrice;
  market: StockMarket;
  // Additional properties based on actual API response
  extracted_price?: number;
  title?: string;
}

export interface GraphPoint {
  timestamp: number;
  price: number;
  date: string; // formatted date for display
}

export interface StockGraph {
  timespan: string;
  previous_close: number;
  graph: GraphPoint[];
}

export interface StockData {
  title: string;
  stock: string;
  exchange: string;
  summary: StockSummary;
  graph: StockGraph;
}

export interface SerpApiResponse {
  search_metadata: {
    status: string;
    created_at: string;
  };
  search_parameters: {
    q: string;
    engine: string;
    interval?: string; // Add interval parameter
  };
  summary: StockSummary;
  graph: {
    timespan: string;
    previous_close: number;
    graph: Array<{
      timestamp: number;
      price: number;
    }>;
  };
  title?: string;
  stock?: string;
  exchange?: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

// Chart data type for better type safety
export interface ChartDataPoint {
  time: string;
  price: number;
  timestamp: number;
}

// Tooltip props type for recharts
export interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    color: string;
    payload: ChartDataPoint;
  }>;
  label?: string;
}

// Time range types
export type TimeRange =
  | "1D"
  | "5D"
  | "1M"
  | "3M"
  | "6M"
  | "YTD"
  | "1Y"
  | "3Y"
  | "5Y"
  | "MAX";

export interface TimeRangeOption {
  value: TimeRange;
  label?: string;
}

// ===== MARKET INDICES TYPES =====

// Individual market index item
export interface MarketIndex {
  stock: string; // e.g., ".DJI:INDEXDJX"
  link: string;
  serpapi_link: string;
  name: string; // e.g., "Dow Jones"
  price: number;
  currency?: string; // e.g., "USD", "$", "₹"
  price_movement: {
    percentage: number;
    value?: number;
    movement?: "Up" | "Down";
  };
}

// Market regions structure
export interface MarketsByRegion {
  us?: MarketIndex[];
  europe?: MarketIndex[];
  asia?: MarketIndex[];
  currencies?: MarketIndex[];
  crypto?: MarketIndex[];
  futures?: MarketIndex[];
}

// Market trends structure (for regional groupings)
export interface MarketTrend {
  title: string; // e.g., "Americas", "Europe, Middle East, and Africa", "Asia Pacific"
  subtitle?: string;
  link: string;
  serpapi_link: string;
  results: MarketIndex[];
}

// Complete markets API response
export interface MarketsApiResponse {
  search_metadata: {
    id: string;
    status: string;
    json_endpoint: string;
    created_at: string;
    processed_at: string;
    google_finance_markets_url: string;
    raw_html_file: string;
    total_time_taken: number;
  };
  search_parameters: {
    engine: string;
    trend?: string;
    hl?: string;
    gl?: string;
  };
  markets: MarketsByRegion;
  market_trends?: MarketTrend[];
  news_results?: Array<{
    source: string;
    link: string;
    date: string;
    snippet: string;
    thumbnail?: string;
    stocks?: Array<{
      name: string;
      link: string;
      serpapi_link: string;
      stock: string;
      price_movement: {
        percentage: number;
        movement?: "Up" | "Down";
      };
    }>;
  }>;
  discover_more?: Array<{
    title: string;
    items: MarketIndex[];
  }>;

  error?: string;
}

// Processed market data for UI consumption
export interface ProcessedMarketData {
  us: MarketIndex[];
  europe: MarketIndex[];
  asia: MarketIndex[];
  currencies: MarketIndex[];
  crypto: MarketIndex[];
  futures: MarketIndex[];
}

// Country/Region options for selector
export interface MarketRegion {
  key: keyof ProcessedMarketData;
  label: string;
  flag?: string; // Optional flag emoji or icon
}

// Market categories
export type MarketCategory = "indexes" | "currencies" | "crypto" | "futures";

// Options for market data fetching
export interface UseMarketsOptions {
  enabled?: boolean;
  category?: MarketCategory;
  region?: string;
}

// Error type for market data
export interface MarketsError {
  message: string;
  status?: number;
  region?: string;
  category?: string;
}
