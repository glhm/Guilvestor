import type { StockDataPort } from '../lib/ports/stock-data.port';
import type { StockProfile, StockQuote, AnnualFinancials, AnnualBalanceSheet, AnnualCashFlow } from '../lib/types/domain';
import type { FMPProfile, FMPQuote, FMPIncomeStatement, FMPBalanceSheet, FMPCashFlow } from '../lib/types/fmp';

const BASE_URL = 'https://financialmodelingprep.com/stable';

function getApiKey(): string {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) throw new Error('FMP_API_KEY not configured');
  return apiKey;
}

async function fetchFMP<T>(endpoint: string): Promise<T> {
  const apiKey = getApiKey();
  const sep = endpoint.includes('?') ? '&' : '?';
  const url = `${BASE_URL}${endpoint}${sep}apikey=${apiKey}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`FMP API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data && typeof data === 'object' && 'Error Message' in data) {
    const msg = data['Error Message'] as string;
    if (msg.includes('Premium') || msg.includes('subscription')) {
      throw new Error('Premium subscription required for this data');
    }
    throw new Error(`FMP API error: ${msg}`);
  }

  return data;
}

// Mappers FMP → domain

function mapProfile(raw: FMPProfile): StockProfile {
  return {
    symbol: raw.symbol,
    companyName: raw.companyName,
    exchange: raw.exchange,
    price: raw.price,
    currency: raw.currency,
    marketCap: raw.marketCap,
    sector: raw.sector,
    industry: raw.industry,
    description: raw.description,
    website: raw.website,
    ceo: raw.ceo,
    fullTimeEmployees: raw.fullTimeEmployees,
    country: raw.country,
  };
}

function mapQuote(raw: FMPQuote): StockQuote {
  return { price: raw.price, marketCap: raw.marketCap };
}

function mapIncomeStatement(raw: FMPIncomeStatement): AnnualFinancials {
  return {
    fiscalYear: raw.fiscalYear,
    revenue: raw.revenue,
    grossProfit: raw.grossProfit,
    operatingIncome: raw.operatingIncome,
    incomeTaxExpense: raw.incomeTaxExpense,
    incomeBeforeTax: raw.incomeBeforeTax,
    weightedAverageSharesDiluted: raw.weightedAverageShsOutDil,
  };
}

function mapBalanceSheet(raw: FMPBalanceSheet): AnnualBalanceSheet {
  return {
    fiscalYear: raw.fiscalYear,
    totalDebt: raw.totalDebt,
    totalStockholdersEquity: raw.totalStockholdersEquity,
    cashAndCashEquivalents: raw.cashAndCashEquivalents,
    netDebt: raw.netDebt,
  };
}

function mapCashFlow(raw: FMPCashFlow): AnnualCashFlow {
  return {
    fiscalYear: raw.fiscalYear,
    freeCashFlow: raw.freeCashFlow,
    stockBasedCompensation: raw.stockBasedCompensation,
  };
}

export class FMPAdapter implements StockDataPort {
  async getProfile(ticker: string): Promise<StockProfile> {
    const data = await fetchFMP<FMPProfile[]>(`/profile?symbol=${ticker}`);
    if (!data || data.length === 0) throw new Error(`Stock not found: ${ticker}`);
    return mapProfile(data[0]);
  }

  async getQuote(ticker: string): Promise<StockQuote | null> {
    const data = await fetchFMP<FMPQuote[]>(`/quote?symbol=${ticker}`);
    if (!data || data.length === 0) return null;
    return mapQuote(data[0]);
  }

  async getIncomeStatements(ticker: string, limit = 5): Promise<AnnualFinancials[]> {
    const data = await fetchFMP<FMPIncomeStatement[]>(`/income-statement?symbol=${ticker}&limit=${limit}`);
    return (data || []).map(mapIncomeStatement);
  }

  async getBalanceSheets(ticker: string, limit = 5): Promise<AnnualBalanceSheet[]> {
    const data = await fetchFMP<FMPBalanceSheet[]>(`/balance-sheet-statement?symbol=${ticker}&limit=${limit}`);
    return (data || []).map(mapBalanceSheet);
  }

  async getCashFlows(ticker: string, limit = 5): Promise<AnnualCashFlow[]> {
    const data = await fetchFMP<FMPCashFlow[]>(`/cash-flow-statement?symbol=${ticker}&limit=${limit}`);
    return (data || []).map(mapCashFlow);
  }
}
