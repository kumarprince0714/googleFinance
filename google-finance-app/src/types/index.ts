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
