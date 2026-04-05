import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  FMPClient, 
  getStockProfile, 
  getStockQuote, 
  getIncomeStatements,
  getBalanceSheets,
  getCashFlows 
} from '../../services/fmp-client';
import type { FMPProfile, FMPQuote, FMPIncomeStatement, FMPBalanceSheet, FMPCashFlow } from '../../lib/types/fmp';

// Mock global fetch
global.fetch = vi.fn();

describe('FMP Client', () => {
  const mockApiKey = 'test-api-key';
  const mockTicker = 'AAPL';

  beforeEach(() => {
    vi.resetAllMocks();
    process.env.FMP_API_KEY = mockApiKey;
  });

  describe('getStockProfile', () => {
    it('should fetch and return company profile for valid ticker', async () => {
      const mockProfile: FMPProfile[] = [{
        symbol: 'AAPL',
        price: 150.5,
        marketCap: 2500000000000,
        beta: 1.2,
        lastDividend: 0.24,
        range: '120.0-180.0',
        change: 2.5,
        changePercentage: 1.7,
        volume: 50000000,
        averageVolume: 45000000,
        companyName: 'Apple Inc.',
        currency: 'USD',
        cik: '0000320193',
        isin: 'US0378331005',
        cusip: '037833100',
        exchangeFullName: 'NASDAQ Global Select',
        exchange: 'NASDAQ',
        industry: 'Consumer Electronics',
        website: 'https://www.apple.com',
        description: 'Apple Inc. designs, manufactures, and markets smartphones...',
        ceo: 'Tim Cook',
        sector: 'Technology',
        country: 'US',
        fullTimeEmployees: '161000',
        phone: '(408) 996-1010',
        address: 'One Apple Park Way',
        city: 'Cupertino',
        state: 'CA',
        zip: '95014',
        image: 'https://images.financialmodelingprep.com/symbol/AAPL.png',
        ipoDate: '1980-12-12',
        defaultImage: false,
        isEtf: false,
        isActivelyTrading: true,
        isAdr: false,
        isFund: false
      }];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfile
      });

      const result = await getStockProfile(mockTicker);

      expect(fetch).toHaveBeenCalledWith(
        `https://financialmodelingprep.com/stable/profile?symbol=${mockTicker}&apikey=${mockApiKey}`
      );
      expect(result).toEqual(mockProfile[0]);
    });

    it('should throw error for invalid ticker', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      await expect(getStockProfile('INVALID')).rejects.toThrow('Stock not found');
    });

    it('should throw FMPError on API failure', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      await expect(getStockProfile(mockTicker)).rejects.toThrow('FMP API error');
    });

    it('should throw error when API key is missing', async () => {
      delete process.env.FMP_API_KEY;
      
      await expect(getStockProfile(mockTicker)).rejects.toThrow('FMP_API_KEY not configured');
    });
  });

  describe('getStockQuote', () => {
    it('should fetch and return stock quote', async () => {
      const mockQuote: FMPQuote[] = [{
        symbol: 'AAPL',
        name: 'Apple Inc.',
        price: 150.5,
        changePercentage: 1.7,
        change: 2.5,
        volume: 50000000,
        dayLow: 148.0,
        dayHigh: 152.0,
        yearHigh: 180.0,
        yearLow: 120.0,
        marketCap: 2500000000000,
        priceAvg50: 145.0,
        priceAvg200: 140.0,
        exchange: 'NASDAQ',
        open: 148.5,
        previousClose: 148.0,
        timestamp: 1704067200
      }];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockQuote
      });

      const result = await getStockQuote(mockTicker);

      expect(fetch).toHaveBeenCalledWith(
        `https://financialmodelingprep.com/stable/quote?symbol=${mockTicker}&apikey=${mockApiKey}`
      );
      expect(result).toEqual(mockQuote[0]);
    });

    it('should return null for empty quote response', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      const result = await getStockQuote(mockTicker);

      expect(result).toBeNull();
    });
  });

  describe('getIncomeStatements', () => {
    it('should fetch income statements with default limit', async () => {
      const mockStatements: FMPIncomeStatement[] = [
        {
          date: '2023-09-30',
          symbol: 'AAPL',
          reportedCurrency: 'USD',
          cik: '0000320193',
          filingDate: '2023-11-03',
          acceptedDate: '2023-11-02 18:08:27',
          fiscalYear: '2023',
          period: 'FY',
          revenue: 383285000000,
          costOfRevenue: 214137000000,
          grossProfit: 169148000000,
          researchAndDevelopmentExpenses: 29915000000,
          generalAndAdministrativeExpenses: 0,
          sellingAndMarketingExpenses: 0,
          sellingGeneralAndAdministrativeExpenses: 24932000000,
          otherExpenses: 0,
          operatingExpenses: 54847000000,
          costAndExpenses: 268984000000,
          netInterestIncome: -183000000,
          interestIncome: 3750000000,
          interestExpense: 3933000000,
          depreciationAndAmortization: 11519000000,
          ebitda: 129188000000,
          ebit: 117669000000,
          nonOperatingIncomeExcludingInterest: -3368000000,
          operatingIncome: 114301000000,
          totalOtherIncomeExpensesNet: -565000000,
          incomeBeforeTax: 113736000000,
          incomeTaxExpense: 16741000000,
          netIncomeFromContinuingOperations: 96995000000,
          netIncomeFromDiscontinuedOperations: 0,
          otherAdjustmentsToNetIncome: 0,
          netIncome: 96995000000,
          netIncomeDeductions: 0,
          bottomLineNetIncome: 96995000000,
          eps: 6.16,
          epsDiluted: 6.13,
          weightedAverageShsOut: 15744231000,
          weightedAverageShsOutDil: 15812547000
        }
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatements
      });

      const result = await getIncomeStatements(mockTicker);

      expect(fetch).toHaveBeenCalledWith(
        `https://financialmodelingprep.com/stable/income-statement?symbol=${mockTicker}&limit=10&apikey=${mockApiKey}`
      );
      expect(result).toEqual(mockStatements);
    });

    it('should accept custom limit parameter', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      await getIncomeStatements(mockTicker, 5);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=5')
      );
    });

    it('should throw error on premium endpoint restriction', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          'Error Message': 'Premium Query Parameter: This value set for symbol is not available under your current subscription' 
        })
      });

      await expect(getIncomeStatements(mockTicker)).rejects.toThrow('Premium subscription required');
    });
  });

  describe('getBalanceSheets', () => {
    it('should fetch balance sheets', async () => {
      const mockSheets: FMPBalanceSheet[] = [
        {
          date: '2023-09-30',
          symbol: 'AAPL',
          reportedCurrency: 'USD',
          cik: '0000320193',
          filingDate: '2023-11-03',
          acceptedDate: '2023-11-02 18:08:27',
          fiscalYear: '2023',
          period: 'FY',
          cashAndCashEquivalents: 29943000000,
          shortTermInvestments: 35228000000,
          cashAndShortTermInvestments: 65171000000,
          netReceivables: 66243000000,
          accountsReceivables: 33410000000,
          otherReceivables: 32833000000,
          inventory: 7286000000,
          prepaids: 0,
          otherCurrentAssets: 14287000000,
          totalCurrentAssets: 152987000000,
          propertyPlantEquipmentNet: 45680000000,
          goodwill: 0,
          intangibleAssets: 0,
          goodwillAndIntangibleAssets: 0,
          longTermInvestments: 91479000000,
          taxAssets: 19499000000,
          otherNonCurrentAssets: 55335000000,
          totalNonCurrentAssets: 211993000000,
          otherAssets: 0,
          totalAssets: 364980000000,
          totalPayables: 95561000000,
          accountPayables: 68960000000,
          otherPayables: 26601000000,
          accruedExpenses: 0,
          shortTermDebt: 20879000000,
          capitalLeaseObligationsCurrent: 1632000000,
          taxPayables: 26601000000,
          deferredRevenue: 0,
          otherCurrentLiabilities: 0,
          totalCurrentLiabilities: 0,
          longTermDebt: 0,
          capitalLeaseObligationsNonCurrent: 0,
          deferredRevenueNonCurrent: 0,
          deferredTaxLiabilitiesNonCurrent: 0,
          otherNonCurrentLiabilities: 0,
          totalNonCurrentLiabilities: 0,
          otherLiabilities: 0,
          capitalLeaseObligations: 0,
          totalLiabilities: 0,
          treasuryStock: 0,
          preferredStock: 0,
          commonStock: 0,
          retainedEarnings: 0,
          additionalPaidInCapital: 0,
          accumulatedOtherComprehensiveIncomeLoss: 0,
          otherTotalStockholdersEquity: 0,
          totalStockholdersEquity: 0,
          totalEquity: 0,
          minorityInterest: 0,
          totalLiabilitiesAndTotalEquity: 0,
          totalInvestments: 0,
          totalDebt: 0,
          netDebt: 0
        }
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSheets
      });

      const result = await getBalanceSheets(mockTicker);

      expect(fetch).toHaveBeenCalledWith(
        `https://financialmodelingprep.com/stable/balance-sheet-statement?symbol=${mockTicker}&limit=10&apikey=${mockApiKey}`
      );
      expect(result).toEqual(mockSheets);
    });
  });

  describe('getCashFlows', () => {
    it('should fetch cash flow statements', async () => {
      const mockFlows: FMPCashFlow[] = [
        {
          date: '2023-09-30',
          symbol: 'AAPL',
          reportedCurrency: 'USD',
          cik: '0000320193',
          filingDate: '2023-11-03',
          acceptedDate: '2023-11-02 18:08:27',
          fiscalYear: '2023',
          period: 'FY',
          netIncome: 96995000000,
          depreciationAndAmortization: 11519000000,
          deferredIncomeTax: 0,
          stockBasedCompensation: 10839000000,
          changeInWorkingCapital: 3651000000,
          accountsReceivables: -5144000000,
          inventory: -1046000000,
          accountsPayables: 6020000000,
          otherWorkingCapital: 3821000000,
          otherNonCashItems: -2266000000,
          netCashProvidedByOperatingActivities: 110543000000,
          investmentsInPropertyPlantAndEquipment: -10960000000,
          acquisitionsNet: 0,
          purchasesOfInvestments: -29423000000,
          salesMaturitiesOfInvestments: 45526000000,
          otherInvestingActivities: -1772000000,
          netCashProvidedByInvestingActivities: 3570000000,
          netDebtIssuance: -11197000000,
          longTermNetDebtIssuance: -11197000000,
          shortTermNetDebtIssuance: 0,
          netStockIssuance: -83159000000,
          netCommonStockIssuance: -83159000000,
          commonStockIssuance: 0,
          commonStockRepurchased: -83159000000,
          netPreferredStockIssuance: 0,
          netDividendsPaid: -15022000000,
          commonDividendsPaid: -15022000000,
          preferredDividendsPaid: 0,
          otherFinancingActivities: -6087000000,
          netCashProvidedByFinancingActivities: -110386000000,
          effectOfForexChangesOnCash: 0,
          netChangeInCash: -2273000000,
          cashAtEndOfPeriod: 30737000000,
          cashAtBeginningOfPeriod: 33029000000,
          operatingCashFlow: 110543000000,
          capitalExpenditure: -10960000000,
          freeCashFlow: 99583000000,
          incomeTaxesPaid: 25385000000,
          interestPaid: 0
        }
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFlows
      });

      const result = await getCashFlows(mockTicker);

      expect(fetch).toHaveBeenCalledWith(
        `https://financialmodelingprep.com/stable/cash-flow-statement?symbol=${mockTicker}&limit=10&apikey=${mockApiKey}`
      );
      expect(result).toEqual(mockFlows);
    });
  });
});
