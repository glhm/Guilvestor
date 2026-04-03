// Types partagés entre frontend et backend

export interface StockData {
  ticker: string;
  companyName: string;
  sector: string;
  marketCap: number;
  price: number;
  currency: string;
  exchange: string;
}

export interface FinancialMetrics {
  revenue: number;
  netIncome: number;
  grossMargin: number;
  operatingMargin: number;
  roe: number;
  roa: number;
  debtToEquity: number;
  currentRatio: number;
  dividendYield: number;
  pe: number;
  ps: number;
  pb: number;
  evToEbitda: number;
}

export interface DCFInputs {
  ticker: string;
  growthRate: number;
  discountRate: number;
  terminalGrowthRate: number;
  projectionYears: number;
}

export interface DCFResult {
  ticker: string;
  fairValue: number;
  currentPrice: number;
  upside: number;
  intrinsicValuePerShare: number;
  freeCashFlows: number[];
  wacc: number;
}

export interface ChartData {
  ticker: string;
  period: string;
  data: {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
