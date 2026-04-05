import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getStockHandler } from '../../app/api/stock/[ticker]/route';
import { POST as postDCFHandler } from '../../app/api/stock/[ticker]/dcf/route';
import { GET as getChartHandler } from '../../app/api/stock/[ticker]/chart/route';

// Mock the use case (route principale)
vi.mock('../../services/use-cases/get-stock-analysis', () => ({
  GetStockAnalysisUseCase: vi.fn().mockImplementation(() => ({
    execute: vi.fn(),
  })),
}));

// Mock l'adapter FMP (routes chart + dcf)
vi.mock('../../services/fmp-adapter', () => ({
  FMPAdapter: vi.fn().mockImplementation(() => ({
    getProfile: vi.fn(),
    getQuote: vi.fn(),
    getIncomeStatements: vi.fn(),
    getBalanceSheets: vi.fn(),
    getCashFlows: vi.fn(),
  })),
}));

vi.mock('../../services/calculations', () => ({
  calculateQualityMetrics: vi.fn(),
  calculateDCF: vi.fn(),
  calculateCAGR: vi.fn(),
  calculateROIC: vi.fn().mockReturnValue(0.15),
}));

import { GetStockAnalysisUseCase } from '../../services/use-cases/get-stock-analysis';
import { FMPAdapter } from '../../services/fmp-adapter';
import { calculateDCF } from '../../services/calculations';

describe('API Routes', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/stock/[ticker]', () => {
    it('should return complete stock data for valid ticker', async () => {
      const mockResult = {
        profile: { ticker: 'AAPL', name: 'Apple Inc.' },
        metrics: [{ id: 'test', value: 10, isPositive: true }],
        charts: {},
        cagrData: {},
        revenueSegments: [],
        dcfInputs: {},
      };

      const mockExecute = vi.fn().mockResolvedValue(mockResult);
      (GetStockAnalysisUseCase as any).mockImplementation(() => ({ execute: mockExecute }));

      const request = new NextRequest('http://localhost:3000/api/stock/AAPL');
      const response = await getStockHandler(request, { params: Promise.resolve({ ticker: 'AAPL' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.profile.ticker).toBe('AAPL');
      expect(mockExecute).toHaveBeenCalledWith('AAPL');
    });

    it('should return 404 for non-existent ticker', async () => {
      (GetStockAnalysisUseCase as any).mockImplementation(() => ({
        execute: vi.fn().mockRejectedValue(new Error('Stock not found: INVALID')),
      }));

      const request = new NextRequest('http://localhost:3000/api/stock/INVALID');
      const response = await getStockHandler(request, { params: Promise.resolve({ ticker: 'INVALID' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Stock not found');
    });

    it('should return 400 for missing ticker', async () => {
      const request = new NextRequest('http://localhost:3000/api/stock/');
      const response = await getStockHandler(request, { params: Promise.resolve({ ticker: '' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('ticker is required');
    });

    it('should return 500 for internal server error', async () => {
      (GetStockAnalysisUseCase as any).mockImplementation(() => ({
        execute: vi.fn().mockRejectedValue(new Error('Network error')),
      }));

      const request = new NextRequest('http://localhost:3000/api/stock/AAPL');
      const response = await getStockHandler(request, { params: Promise.resolve({ ticker: 'AAPL' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });

  describe('POST /api/stock/[ticker]/dcf', () => {
    it('should calculate DCF with provided inputs', async () => {
      const mockDCFResult = {
        ticker: 'AAPL',
        enterpriseValue: 3000000000000,
        equityValue: 2900000000000,
        targetPrice: 180,
        currentPrice: 150,
        upside: 20,
        projectedFCFs: [{ year: 1, fcf: 100, presentValue: 90 }]
      };

      (calculateDCF as any).mockReturnValue(mockDCFResult);

      const request = new NextRequest('http://localhost:3000/api/stock/AAPL/dcf', {
        method: 'POST',
        body: JSON.stringify({
          currentFCF: 99583000000,
          growthRate: 0.10,
          discountRate: 0.10,
          terminalMultiple: 15,
          projectionYears: 10,
          sharesOutstanding: 15744231000,
          currentPrice: 150
        })
      });

      const response = await postDCFHandler(request, { params: Promise.resolve({ ticker: 'AAPL' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.targetPrice).toBe(180);
      expect(data.data.upside).toBe(20);
    });

    it('should return 400 for invalid DCF inputs', async () => {
      const request = new NextRequest('http://localhost:3000/api/stock/AAPL/dcf', {
        method: 'POST',
        body: JSON.stringify({
          currentFCF: 100,
          growthRate: 0.10,
          discountRate: 0.10,
          terminalMultiple: 15,
          projectionYears: 10,
          sharesOutstanding: 1000
        })
      });

      // Test with negative FCF
      const invalidRequest = new NextRequest('http://localhost:3000/api/stock/AAPL/dcf', {
        method: 'POST',
        body: JSON.stringify({
          currentFCF: -100, // Invalid negative FCF
          growthRate: 0.10,
          discountRate: 0.10,
          terminalMultiple: 15,
          projectionYears: 10,
          sharesOutstanding: 1000
        })
      });

      const response = await postDCFHandler(invalidRequest, { params: Promise.resolve({ ticker: 'AAPL' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid');
    });

    it('should return 400 for missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/stock/AAPL/dcf', {
        method: 'POST',
        body: JSON.stringify({})
      });

      const response = await postDCFHandler(request, { params: Promise.resolve({ ticker: 'AAPL' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('GET /api/stock/[ticker]/chart', () => {
    it('should return chart data for specified type', async () => {
      const mockIncomeData = [
        { fiscalYear: '2023', revenue: 383000000000, grossProfit: 169000000000, operatingIncome: 114000000000, incomeTaxExpense: 17000000000, incomeBeforeTax: 114000000000, weightedAverageSharesDiluted: 15800000000 },
        { fiscalYear: '2022', revenue: 394000000000, grossProfit: 171000000000, operatingIncome: 119000000000, incomeTaxExpense: 19000000000, incomeBeforeTax: 119000000000, weightedAverageSharesDiluted: 16300000000 },
      ];

      (FMPAdapter as any).mockImplementation(() => ({
        getIncomeStatements: vi.fn().mockResolvedValue(mockIncomeData),
        getBalanceSheets: vi.fn().mockResolvedValue([]),
        getCashFlows: vi.fn().mockResolvedValue([]),
      }));

      const request = new NextRequest('http://localhost:3000/api/stock/AAPL/chart?type=revenue&period=5y');
      const response = await getChartHandler(request, { params: Promise.resolve({ ticker: 'AAPL' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.type).toBe('revenue');
      expect(Array.isArray(data.data.data)).toBe(true);
    });

    it('should return 400 for invalid chart type', async () => {
      const request = new NextRequest('http://localhost:3000/api/stock/AAPL/chart?type=invalid');
      const response = await getChartHandler(request, { params: Promise.resolve({ ticker: 'AAPL' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid chart type');
    });

    it('should return 400 for missing chart type', async () => {
      const request = new NextRequest('http://localhost:3000/api/stock/AAPL/chart');
      const response = await getChartHandler(request, { params: Promise.resolve({ ticker: 'AAPL' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('type is required');
    });

    it('should handle different periods (5y, 10y, all)', async () => {
      // Mock with 10 years of data
      const mockData10Y = Array(10).fill(null).map((_, i) => ({
        fiscalYear: (2023 - i).toString(),
        revenue: 383000000000 - i * 10000000000
      }));

      // Mock with 5 years of data
      const mockData5Y = Array(5).fill(null).map((_, i) => ({
        fiscalYear: (2023 - i).toString(),
        revenue: 383000000000 - i * 10000000000
      }));

      const testCases = [
        { period: '5y', mockData: mockData5Y, expectedLength: 5 },
        { period: '10y', mockData: mockData10Y, expectedLength: 10 },
        { period: 'all', mockData: mockData10Y, expectedLength: 10 }
      ];

      for (const testCase of testCases) {
        (FMPAdapter as any).mockImplementation(() => ({
          getIncomeStatements: vi.fn().mockResolvedValue(testCase.mockData),
          getBalanceSheets: vi.fn().mockResolvedValue([]),
          getCashFlows: vi.fn().mockResolvedValue([]),
        }));

        const request = new NextRequest(`http://localhost:3000/api/stock/AAPL/chart?type=revenue&period=${testCase.period}`);
        const response = await getChartHandler(request, { params: Promise.resolve({ ticker: 'AAPL' }) });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.data.data.length).toBe(testCase.expectedLength);
      }
    });
  });
});
