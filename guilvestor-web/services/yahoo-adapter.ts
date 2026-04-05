/**
 * Yahoo Finance adapter — alternative to FMP.
 * Uses yahoo-finance2 package (no API key required).
 * Provides ~5 years of annual fundamentals (same as FMP free tier).
 * To use: replace `new FMPAdapter()` with `new YahooAdapter()` in API routes.
 */
import YahooFinance from 'yahoo-finance2';
import type { StockDataPort } from '../lib/ports/stock-data.port';
import type { StockProfile, StockQuote, AnnualFinancials, AnnualBalanceSheet, AnnualCashFlow } from '../lib/types/domain';

const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

function extractYear(date: Date | string): string {
  return new Date(date).getFullYear().toString();
}

export class YahooAdapter implements StockDataPort {
  async getProfile(ticker: string): Promise<StockProfile> {
    const result = await yf.quoteSummary(ticker, { modules: ['assetProfile', 'price'] });

    const profile = result.assetProfile;
    const price = result.price;

    if (!price) throw new Error(`Stock not found: ${ticker}`);

    const ceo = profile?.companyOfficers?.find(
      o => o.title?.toUpperCase().includes('CEO')
    )?.name ?? '';

    return {
      symbol: ticker.toUpperCase(),
      companyName: price.longName ?? price.shortName ?? ticker,
      exchange: price.exchangeName ?? '',
      price: price.regularMarketPrice ?? 0,
      currency: price.currency ?? 'USD',
      marketCap: price.marketCap ?? 0,
      sector: profile?.sector ?? '',
      industry: profile?.industry ?? '',
      description: profile?.longBusinessSummary ?? '',
      website: profile?.website ?? '',
      ceo,
      fullTimeEmployees: profile?.fullTimeEmployees?.toString() ?? '',
      country: profile?.country ?? '',
    };
  }

  async getQuote(ticker: string): Promise<StockQuote | null> {
    const q = await yf.quote(ticker);
    if (!q) return null;
    return {
      price: q.regularMarketPrice ?? 0,
      marketCap: q.marketCap ?? 0,
    };
  }

  async getIncomeStatements(ticker: string, limit = 5): Promise<AnnualFinancials[]> {
    const data = await yf.fundamentalsTimeSeries(ticker, {
      period1: '2010-01-01',
      type: 'annual',
      module: 'financials',
    });

    return data
      .slice(-limit)
      .map(item => ({
        fiscalYear: extractYear(item.date),
        revenue: (item as any).totalRevenue ?? 0,
        grossProfit: (item as any).grossProfit ?? 0,
        operatingIncome: (item as any).operatingIncome ?? 0,
        incomeTaxExpense: (item as any).taxProvision ?? 0,
        incomeBeforeTax: (item as any).pretaxIncome ?? 0,
        weightedAverageSharesDiluted: (item as any).dilutedAverageShares ?? 0,
      }));
  }

  async getBalanceSheets(ticker: string, limit = 5): Promise<AnnualBalanceSheet[]> {
    const data = await yf.fundamentalsTimeSeries(ticker, {
      period1: '2010-01-01',
      type: 'annual',
      module: 'balance-sheet',
    });

    return data
      .slice(-limit)
      .map(item => ({
        fiscalYear: extractYear(item.date),
        totalDebt: (item as any).totalDebt ?? 0,
        totalStockholdersEquity: (item as any).stockholdersEquity ?? 0,
        cashAndCashEquivalents: (item as any).cashAndCashEquivalents ?? 0,
        netDebt: (item as any).netDebt ?? 0,
      }));
  }

  async getCashFlows(ticker: string, limit = 5): Promise<AnnualCashFlow[]> {
    const data = await yf.fundamentalsTimeSeries(ticker, {
      period1: '2010-01-01',
      type: 'annual',
      module: 'cash-flow',
    });

    return data
      .slice(-limit)
      .map(item => ({
        fiscalYear: extractYear(item.date),
        freeCashFlow: (item as any).freeCashFlow ?? 0,
        stockBasedCompensation: (item as any).stockBasedCompensation ?? 0,
      }));
  }
}
