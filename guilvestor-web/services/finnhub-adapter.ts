/**
 * Finnhub adapter — profile, quote, and fundamentals (XBRL SEC filings).
 * US tickers only. EU tickers fall back to Yahoo in composite-adapter.
 * Free tier: 60 calls/min, 16+ years of annual financials.
 */

import type { StockProfile, StockQuote, AnnualFinancials, AnnualBalanceSheet, AnnualCashFlow } from '../lib/types/domain';
import * as finnhub from './finnhub-client';

const BASE_URL = 'https://finnhub.io/api/v1';

function getApiKey(): string {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) throw new Error('FINNHUB_API_KEY not configured');
  return key;
}

async function fetchFinnhub<T>(endpoint: string): Promise<T> {
  const url = `${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}token=${getApiKey()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Finnhub API error: ${response.status} ${response.statusText}`);
  const data = await response.json();
  if (data.error) throw new Error(`Finnhub error: ${data.error}`);
  return data;
}

// ── XBRL concept helpers ──

interface XBRLItem {
  concept: string;
  value: number;
  unit: string;
  label: string;
}

interface FinnhubFinancialReport {
  year: number;
  quarter: number;
  form: string;
  report: {
    ic: XBRLItem[];
    bs: XBRLItem[];
    cf: XBRLItem[];
  };
}

function findConcept(items: XBRLItem[], ...concepts: string[]): number {
  for (const concept of concepts) {
    const found = items.find(i => i.concept === concept);
    if (found != null) return found.value;
  }
  return 0;
}

// ── Mappers ──

function mapIncomeStatement(report: FinnhubFinancialReport): AnnualFinancials {
  const ic = report.report.ic;
  return {
    fiscalYear: report.year.toString(),
    revenue: findConcept(ic,
      'us-gaap_RevenueFromContractWithCustomerExcludingAssessedTax',
      'us-gaap_Revenues',
      'us-gaap_SalesRevenueNet',
    ),
    grossProfit: findConcept(ic, 'us-gaap_GrossProfit'),
    operatingIncome: findConcept(ic,
      'us-gaap_OperatingIncomeLoss',
    ),
    incomeTaxExpense: findConcept(ic, 'us-gaap_IncomeTaxExpenseBenefit'),
    incomeBeforeTax: findConcept(ic,
      'us-gaap_IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest',
      'us-gaap_IncomeLossFromContinuingOperationsBeforeIncomeTaxesMinorityInterestAndIncomeLossFromEquityMethodInvestments',
    ),
    weightedAverageSharesDiluted: findConcept(ic,
      'us-gaap_WeightedAverageNumberOfDilutedSharesOutstanding',
    ),
  };
}

function mapBalanceSheet(report: FinnhubFinancialReport): AnnualBalanceSheet {
  const bs = report.report.bs;
  const cash = findConcept(bs,
    'us-gaap_CashAndCashEquivalentsAtCarryingValue',
    'us-gaap_CashCashEquivalentsAndShortTermInvestments',
  );
  const shortTermDebt = findConcept(bs,
    'us-gaap_LongTermDebtCurrent',
    'us-gaap_ShortTermBorrowings',
  );
  const longTermDebt = findConcept(bs,
    'us-gaap_LongTermDebtNoncurrent',
    'us-gaap_LongTermDebt',
  );
  const totalDebt = shortTermDebt + longTermDebt;
  const equity = findConcept(bs, 'us-gaap_StockholdersEquity');

  return {
    fiscalYear: report.year.toString(),
    totalDebt,
    totalStockholdersEquity: equity,
    cashAndCashEquivalents: cash,
    netDebt: totalDebt - cash,
    investedCapital: totalDebt + equity - cash,
  };
}

function mapCashFlow(report: FinnhubFinancialReport): AnnualCashFlow {
  const cf = report.report.cf;
  const operatingCF = findConcept(cf, 'us-gaap_NetCashProvidedByUsedInOperatingActivities');
  const capex = findConcept(cf, 'us-gaap_PaymentsToAcquirePropertyPlantAndEquipment');
  const fcf = operatingCF - capex;

  return {
    fiscalYear: report.year.toString(),
    freeCashFlow: fcf,
    stockBasedCompensation: findConcept(cf, 'us-gaap_ShareBasedCompensation'),
    dividendsPaid: findConcept(cf, 'us-gaap_PaymentsOfDividends') || undefined,
  };
}

// ── Public API ──

async function getAnnualReports(ticker: string, limit: number): Promise<FinnhubFinancialReport[]> {
  const data = await fetchFinnhub<{ data: FinnhubFinancialReport[] }>(
    `/stock/financials-reported?symbol=${ticker}&freq=annual`,
  );

  return (data.data ?? [])
    .filter(r => r.form === '10-K')
    .slice(0, limit)
    .reverse(); // oldest first
}

export async function getProfile(ticker: string): Promise<StockProfile> {
  const [profile, quote] = await Promise.all([
    finnhub.getProfile(ticker),
    finnhub.getQuote(ticker),
  ]);

  if (!profile.name) throw new Error(`Stock not found: ${ticker}`);

  return {
    symbol: profile.ticker,
    companyName: profile.name,
    exchange: profile.exchange,
    price: quote.c,
    currency: profile.currency,
    marketCap: profile.marketCapitalization * 1_000_000,
    sector: profile.finnhubIndustry,
    industry: profile.finnhubIndustry,
    description: '',
    website: profile.weburl,
    ceo: '',
    fullTimeEmployees: '',
    country: profile.country,
  };
}

export async function getQuote(ticker: string): Promise<StockQuote | null> {
  const q = await finnhub.getQuote(ticker);
  if (!q || q.c === 0) return null;
  return { price: q.c, marketCap: 0 };
}

export async function getIncomeStatements(ticker: string, limit = 5): Promise<AnnualFinancials[]> {
  const reports = await getAnnualReports(ticker, limit);
  return reports.map(mapIncomeStatement).filter(r => r.revenue > 0);
}

export async function getBalanceSheets(ticker: string, limit = 5): Promise<AnnualBalanceSheet[]> {
  const reports = await getAnnualReports(ticker, limit);
  return reports.map(mapBalanceSheet);
}

export async function getCashFlows(ticker: string, limit = 5): Promise<AnnualCashFlow[]> {
  const reports = await getAnnualReports(ticker, limit);
  return reports.map(mapCashFlow).filter(r => r.freeCashFlow !== 0);
}
