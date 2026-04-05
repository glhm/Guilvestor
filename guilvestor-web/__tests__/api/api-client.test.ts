import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  fetchStockData, 
  calculateDCFValuation, 
  fetchChartData,
  apiClient 
} from '../../lib/api-client';
import type { CompleteStockData, DCFResult, ChartDataPoint } from '../../lib/types/fmp';

// Mock global fetch
global.fetch = vi.fn();

describe('API Client', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('fetchStockData', () => {
    it('should fetch and return stock data for valid ticker', async () => {
      const mockData: CompleteStockData = {
        profile: {
          ticker: 'AAPL',
          name: 'Apple Inc.',
          exchange: 'NASDAQ',
          price: 150,
          currency: 'USD',
          marketCap: 2500000000000,
          sector: 'Technology',
          industry: 'Consumer Electronics',
          description: 'Test',
          website: 'https://apple.com',
          ceo: 'Tim Cook',
          employees: '161000',
          country: 'US'
        },
        metrics: [],
        charts: {
          revenue: [],
          fcf: [],
          fcfPerShare: [],
          roic: [],
          grossMargin: [],
          fcfMargin: [],
          sharesOutstanding: [],
          dividends: [],
          cashAndDebt: []
        },
        cagrData: {
          revenue: { fiveYear: 0.10, tenYear: 0.15 },
          fcf: { fiveYear: 0.12, tenYear: 0.18 },
          fcfPerShare: { fiveYear: 0.11, tenYear: 0.16 }
        },
        revenueSegments: [],
        dcfInputs: {
          ticker: 'AAPL',
          currentFCF: 100000000000,
          growthRate: 0.10,
          discountRate: 0.10,
          terminalMultiple: 15,
          projectionYears: 10,
          sharesOutstanding: 15000000000
        }
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockData })
      });

      const result = await fetchStockData('AAPL');

      expect(fetch).toHaveBeenCalledWith('/api/stock/AAPL');
      expect(result.profile.ticker).toBe('AAPL');
      expect(result.profile.name).toBe('Apple Inc.');
    });

    it('should throw error on API failure', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, error: 'Stock not found' })
      });

      await expect(fetchStockData('INVALID')).rejects.toThrow('Stock not found');
    });

    it('should throw error on network failure', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchStockData('AAPL')).rejects.toThrow('Network error');
    });
  });

  describe('calculateDCFValuation', () => {
    it('should calculate DCF with provided inputs', async () => {
      const mockResult: DCFResult = {
        ticker: 'AAPL',
        enterpriseValue: 3000000000000,
        equityValue: 2900000000000,
        targetPrice: 180,
        currentPrice: 150,
        upside: 20,
        projectedFCFs: [
          { year: 1, fcf: 110000000000, presentValue: 100000000000 }
        ]
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockResult })
      });

      const inputs = {
        currentFCF: 100000000000,
        growthRate: 0.10,
        discountRate: 0.10,
        terminalMultiple: 15,
        projectionYears: 10,
        sharesOutstanding: 15000000000,
        currentPrice: 150
      };

      const result = await calculateDCFValuation('AAPL', inputs);

      expect(fetch).toHaveBeenCalledWith('/api/stock/AAPL/dcf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs)
      });
      expect(result.targetPrice).toBe(180);
      expect(result.upside).toBe(20);
    });

    it('should throw error on validation failure', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          success: false, 
          error: 'Invalid input: currentFCF must be positive' 
        })
      });

      await expect(calculateDCFValuation('AAPL', {
        currentFCF: -100,
        growthRate: 0.10,
        discountRate: 0.10,
        terminalMultiple: 15,
        projectionYears: 10,
        sharesOutstanding: 1000
      })).rejects.toThrow('Invalid input');
    });
  });

  describe('fetchChartData', () => {
    it('should fetch chart data for specified type and period', async () => {
      const mockChartData: ChartDataPoint[] = [
        { year: '2019', value: 260 },
        { year: '2020', value: 274 },
        { year: '2021', value: 365 },
        { year: '2022', value: 394 },
        { year: '2023', value: 383 }
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          success: true, 
          data: { type: 'revenue', data: mockChartData } 
        })
      });

      const result = await fetchChartData('AAPL', 'revenue', '5y');

      expect(fetch).toHaveBeenCalledWith('/api/stock/AAPL/chart?type=revenue&period=5y');
      expect(result.type).toBe('revenue');
      expect(result.data).toHaveLength(5);
    });

    it('should use default period of 5y', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          success: true, 
          data: { type: 'fcf', data: [] } 
        })
      });

      await fetchChartData('AAPL', 'fcf');

      expect(fetch).toHaveBeenCalledWith('/api/stock/AAPL/chart?type=fcf&period=5y');
    });

    it('should handle different chart types', async () => {
      const chartTypes = ['revenue', 'fcf', 'fcf-per-share', 'shares', 'cash-debt'];

      for (const type of chartTypes) {
        vi.resetAllMocks();
        
        (fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            success: true, 
            data: { type, data: [] } 
          })
        });

        await fetchChartData('AAPL', type);

        expect(fetch).toHaveBeenCalledWith(`/api/stock/AAPL/chart?type=${type}&period=5y`);
      }
    });
  });

  describe('apiClient', () => {
    it('should export all methods', () => {
      expect(apiClient.fetchStockData).toBeDefined();
      expect(apiClient.calculateDCFValuation).toBeDefined();
      expect(apiClient.fetchChartData).toBeDefined();
    });
  });
});
