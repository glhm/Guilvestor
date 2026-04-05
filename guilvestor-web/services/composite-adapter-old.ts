/**
 * Composite adapter — combines multiple providers:
 * - US tickers: Finnhub (profile, quote, fundamentals via XBRL)
 * - EU tickers: Yahoo Finance (profile, quote, fundamentals)
 * - Price history: Twelve Data (both US & EU)
 */

import type { StockDataPort } from '../lib/ports/stock-data.port';
import type { StockProfile, StockQuote, AnnualFinancials, AnnualBalanceSheet, AnnualCashFlow } from '../lib/types/domain';
import * as finnhubAdapter from './finnhub-adapter';
import { YahooAdapter } from './yahoo-adapter';

const yahoo = new YahooAdapter();

function isEuropeanTicker(ticker: string): boolean {
  const euSuffixes = ['.PA', '.DE', '.AS', '.MI', '.MC', '.L', '.SW', '.BR', '.HE', '.ST', '.OL', '.CO', '.VI', '.LI', '.WA'];
  return euSuffixes.some(s => ticker.toUpperCase().endsWith(s));
}

export class CompositeAdapter implements StockDataPort {

  async getProfile(ticker: string): Promise<StockProfile> {
    if (isEuropeanTicker(ticker)) return yahoo.getProfile(ticker);
    return finnhubAdapter.getProfile(ticker);
  }

  async getQuote(ticker: string): Promise<StockQuote | null> {
    if (isEuropeanTicker(ticker)) return yahoo.getQuote(ticker);
    return finnhubAdapter.getQuote(ticker);
  }

  async getIncomeStatements(ticker: string, limit = 5): Promise<AnnualFinancials[]> {
    if (isEuropeanTicker(ticker)) return yahoo.getIncomeStatements(ticker, limit);
    return finnhubAdapter.getIncomeStatements(ticker, limit);
  }

  async getBalanceSheets(ticker: string, limit = 5): Promise<AnnualBalanceSheet[]> {
    if (isEuropeanTicker(ticker)) return yahoo.getBalanceSheets(ticker, limit);
    return finnhubAdapter.getBalanceSheets(ticker, limit);
  }

  async getCashFlows(ticker: string, limit = 5): Promise<AnnualCashFlow[]> {
    if (isEuropeanTicker(ticker)) return yahoo.getCashFlows(ticker, limit);
    return finnhubAdapter.getCashFlows(ticker, limit);
  }
}
