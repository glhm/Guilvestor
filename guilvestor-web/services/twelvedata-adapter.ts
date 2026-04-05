/**
 * Twelve Data adapter — fundamentals (income, balance sheet, cash flow).
 * Docs: https://twelvedata.com/docs
 * Free tier: 800 calls/day, 8 calls/min
 */

import type { AnnualFinancials, AnnualBalanceSheet, AnnualCashFlow } from '../lib/types/domain';

const BASE_URL = 'https://api.twelvedata.com';

function getApiKey(): string {
  const key = process.env.TWELVEDATA_API_KEY;
  if (!key) throw new Error('TWELVEDATA_API_KEY not configured');
  return key;
}

async function fetchTwelve<T>(endpoint: string): Promise<T> {
  const url = `${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}apikey=${getApiKey()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Twelve Data API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (data.status === 'error') {
    throw new Error(`Twelve Data error: ${data.message}`);
  }

  return data;
}

// ── Raw Twelve Data response types ──

interface TwelveIncomeStatement {
  fiscal_date: string;
  year: number;
  sales: number | null;
  cost_of_goods: number | null;
  gross_profit: number | null;
  operating_expense: {
    research_and_development: number | null;
    selling_general_and_administrative: number | null;
    other_operating_expenses: number | null;
  };
  operating_income: number | null;
  pretax_income: number | null;
  income_tax: number | null;
  net_income: number | null;
  eps_diluted: number | null;
  diluted_shares_outstanding: number | null;
  ebitda: number | null;
}

interface TwelveBalanceSheet {
  fiscal_date: string;
  year: number;
  assets: {
    current_assets: {
      cash_and_cash_equivalents: number | null;
      total_current_assets: number | null;
    };
    non_current_assets: {
      goodwill: number | null;
      total_non_current_assets: number | null;
    };
    total_assets: number | null;
  };
  liabilities: {
    current_liabilities: {
      short_term_debt: number | null;
      total_current_liabilities: number | null;
    };
    non_current_liabilities: {
      long_term_debt: number | null;
      total_non_current_liabilities: number | null;
    };
    total_liabilities: number | null;
  };
  shareholders_equity: {
    total_shareholders_equity: number | null;
  };
}

interface TwelveCashFlow {
  fiscal_date: string;
  year: number;
  operating_activities: {
    stock_based_compensation: number | null;
    operating_cash_flow: number | null;
  };
  investing_activities: {
    capital_expenditures: number | null;
  };
  financing_activities: {
    common_dividends: number | null;
  };
  free_cash_flow: number | null;
}

// ── Mappers ──

function extractFiscalYear(fiscalDate: string): string {
  return new Date(fiscalDate).getFullYear().toString();
}

function mapIncomeStatement(raw: TwelveIncomeStatement): AnnualFinancials {
  return {
    fiscalYear: extractFiscalYear(raw.fiscal_date),
    revenue: raw.sales ?? 0,
    grossProfit: raw.gross_profit ?? 0,
    operatingIncome: raw.operating_income ?? 0,
    incomeTaxExpense: raw.income_tax ?? 0,
    incomeBeforeTax: raw.pretax_income ?? 0,
    weightedAverageSharesDiluted: raw.diluted_shares_outstanding ?? 0,
  };
}

function mapBalanceSheet(raw: TwelveBalanceSheet): AnnualBalanceSheet {
  const totalDebt =
    (raw.liabilities.current_liabilities.short_term_debt ?? 0) +
    (raw.liabilities.non_current_liabilities.long_term_debt ?? 0);
  const cash = raw.assets.current_assets.cash_and_cash_equivalents ?? 0;
  const equity = raw.shareholders_equity.total_shareholders_equity ?? 0;

  return {
    fiscalYear: extractFiscalYear(raw.fiscal_date),
    totalDebt,
    totalStockholdersEquity: equity,
    cashAndCashEquivalents: cash,
    netDebt: totalDebt > 0 || cash > 0 ? totalDebt - cash : undefined,
    investedCapital: totalDebt + equity - cash,
  };
}

function mapCashFlow(raw: TwelveCashFlow): AnnualCashFlow {
  return {
    fiscalYear: extractFiscalYear(raw.fiscal_date),
    freeCashFlow: raw.free_cash_flow ?? 0,
    stockBasedCompensation: raw.operating_activities.stock_based_compensation ?? 0,
    dividendsPaid: raw.financing_activities.common_dividends ?? undefined,
  };
}

// ── Public API ──

export async function getIncomeStatements(ticker: string, limit = 5): Promise<AnnualFinancials[]> {
  const data = await fetchTwelve<{ income_statement: TwelveIncomeStatement[] }>(
    `/income_statement?symbol=${ticker}&period=annual`,
  );

  return (data.income_statement ?? [])
    .filter(item => item.sales != null)
    .slice(0, limit)
    .reverse()
    .map(mapIncomeStatement);
}

export async function getBalanceSheets(ticker: string, limit = 5): Promise<AnnualBalanceSheet[]> {
  const data = await fetchTwelve<{ balance_sheet: TwelveBalanceSheet[] }>(
    `/balance_sheet?symbol=${ticker}&period=annual`,
  );

  return (data.balance_sheet ?? [])
    .filter(item => item.assets.total_assets != null)
    .slice(0, limit)
    .reverse()
    .map(mapBalanceSheet);
}

export async function getCashFlows(ticker: string, limit = 5): Promise<AnnualCashFlow[]> {
  const data = await fetchTwelve<{ cash_flow: TwelveCashFlow[] }>(
    `/cash_flow?symbol=${ticker}&period=annual`,
  );

  return (data.cash_flow ?? [])
    .filter(item => item.free_cash_flow != null)
    .slice(0, limit)
    .reverse()
    .map(mapCashFlow);
}
