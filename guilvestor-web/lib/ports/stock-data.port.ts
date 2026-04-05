import type { StockProfile, StockQuote, AnnualFinancials, AnnualBalanceSheet, AnnualCashFlow } from '../types/domain';

export interface StockDataPort {
  getProfile(ticker: string): Promise<StockProfile>;
  getQuote(ticker: string): Promise<StockQuote | null>;
  getIncomeStatements(ticker: string, limit?: number): Promise<AnnualFinancials[]>;
  getBalanceSheets(ticker: string, limit?: number): Promise<AnnualBalanceSheet[]>;
  getCashFlows(ticker: string, limit?: number): Promise<AnnualCashFlow[]>;
}
