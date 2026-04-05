import type { StockDataPort } from '../../lib/ports/stock-data.port';
import type { AnnualFinancials, AnnualCashFlow, AnnualBalanceSheet } from '../../lib/types/domain';
import { calculateQualityMetrics, calculateROIC, calculateCAGR } from '../calculations';
import type { CompleteStockData, StockData, DCFInputs } from '../../lib/types/fmp';

export class GetStockAnalysisUseCase {
  constructor(private readonly stockData: StockDataPort) {}

  async execute(ticker: string): Promise<CompleteStockData> {
    const [profile, quote, incomeStatements, balanceSheets, cashFlows] = await Promise.all([
      this.stockData.getProfile(ticker),
      this.stockData.getQuote(ticker),
      this.stockData.getIncomeStatements(ticker, 5),
      this.stockData.getBalanceSheets(ticker, 5),
      this.stockData.getCashFlows(ticker, 5),
    ]);

    const metrics = calculateQualityMetrics(incomeStatements, balanceSheets, cashFlows);

    const stockData: StockData = {
      ticker: profile.symbol,
      name: profile.companyName,
      exchange: profile.exchange,
      price: quote?.price ?? profile.price,
      currency: profile.currency,
      marketCap: quote?.marketCap ?? profile.marketCap,
      sector: profile.sector,
      industry: profile.industry,
      description: profile.description,
      website: profile.website,
      ceo: profile.ceo,
      employees: profile.fullTimeEmployees,
      country: profile.country,
      currencyUnit: profile.marketCap >= 1_000_000_000 ? 'Md $' : 'M$',
    };

    const sortedIncome = sortByYear(incomeStatements);
    const sortedCF = sortByYear(cashFlows);
    const sortedBS = sortByYear(balanceSheets);

    const revenueData = sortedIncome.map(item => ({
      year: item.fiscalYear,
      value: item.revenue / 1_000_000_000,
    }));

    const fcfData = sortedCF.map(item => ({
      year: item.fiscalYear,
      value: item.freeCashFlow / 1_000_000_000,
      value2: item.stockBasedCompensation / 1_000_000_000,
    }));

    const fcfPerShareData = sortedCF.map((cf, index) => {
      const shares = sortedIncome[index]?.weightedAverageSharesDiluted || 1;
      return { year: cf.fiscalYear, value: cf.freeCashFlow / shares };
    });

    const roicData = sortedIncome.map((income, index) => {
      const bs = sortedBS[index];
      if (!bs) return { year: income.fiscalYear, value: 0 };
      const taxRate = income.incomeTaxExpense / income.incomeBeforeTax || 0.21;
      const roic = calculateROIC(
        income.operatingIncome,
        taxRate,
        bs.totalDebt,
        bs.totalStockholdersEquity,
        bs.cashAndCashEquivalents,
      );
      return { year: income.fiscalYear, value: roic * 100 };
    });

    const grossMarginData = sortedIncome.map(item => ({
      year: item.fiscalYear,
      value: item.revenue > 0 ? (item.grossProfit / item.revenue) * 100 : 0,
    }));

    const fcfMarginData = sortedCF.map((cf, index) => {
      const income = sortedIncome[index];
      return {
        year: cf.fiscalYear,
        value: income && income.revenue > 0 ? (cf.freeCashFlow / income.revenue) * 100 : 0,
      };
    });

    const latestCF = sortedCF[sortedCF.length - 1];
    const latestIncome = sortedIncome[sortedIncome.length - 1];

    const dcfInputs: DCFInputs = {
      ticker,
      currentFCF: latestCF?.freeCashFlow ?? 0,
      growthRate: 0.10,
      discountRate: 0.10,
      terminalMultiple: 15,
      projectionYears: 10,
      sharesOutstanding: latestIncome?.weightedAverageSharesDiluted ?? 0,
      currentPrice: quote?.price ?? profile.price,
    };

    return {
      profile: stockData,
      metrics,
      charts: {
        revenue: revenueData,
        fcf: fcfData,
        fcfPerShare: fcfPerShareData,
        roic: roicData,
        grossMargin: grossMarginData,
        fcfMargin: fcfMarginData,
        sharesOutstanding: sortedIncome.map(item => ({
          year: item.fiscalYear,
          value: item.weightedAverageSharesDiluted / 1_000_000,
        })),
        dividends: [],
        cashAndDebt: sortedBS.map(item => ({
          year: item.fiscalYear,
          value: item.cashAndCashEquivalents / 1_000_000_000,
          value2: item.totalDebt / 1_000_000_000,
        })),
      },
      cagrData: {
        revenue: buildCAGR(revenueData),
        fcf: buildCAGR(fcfData),
        fcfPerShare: buildCAGR(fcfPerShareData),
      },
      revenueSegments: [],
      dcfInputs,
    };
  }
}

function sortByYear<T extends { fiscalYear: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => parseInt(a.fiscalYear) - parseInt(b.fiscalYear));
}

function buildCAGR(data: { year: string; value: number }[]) {
  const fiveYear = data.length >= 5
    ? calculateCAGR(data[data.length - 5].value, data[data.length - 1].value, 5) * 100
    : 0;
  const tenYear = data.length >= 10
    ? calculateCAGR(data[data.length - 10].value, data[data.length - 1].value, 10) * 100
    : fiveYear;
  return { fiveYear, tenYear };
}
