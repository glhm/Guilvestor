// Provider-agnostic domain types — indépendants de FMP ou tout autre fournisseur

export interface StockProfile {
  symbol: string;
  companyName: string;
  exchange: string;
  price: number;
  currency: string;
  marketCap: number;
  sector: string;
  industry: string;
  description: string;
  website: string;
  ceo: string;
  fullTimeEmployees: string;
  country: string;
}

export interface StockQuote {
  price: number;
  marketCap: number;
}

export interface AnnualFinancials {
  fiscalYear: string;
  revenue: number;
  grossProfit: number;
  operatingIncome: number;
  incomeTaxExpense: number;
  incomeBeforeTax: number;
  weightedAverageSharesDiluted: number;
}

export interface AnnualCashFlow {
  fiscalYear: string;
  freeCashFlow: number;
  stockBasedCompensation: number;
  dividendsPaid?: number;
}

export interface AnnualBalanceSheet {
  fiscalYear: string;
  totalDebt: number;
  totalStockholdersEquity: number;
  cashAndCashEquivalents: number;
  netDebt?: number;
  investedCapital?: number;
}
