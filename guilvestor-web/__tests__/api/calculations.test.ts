import { describe, it, expect } from 'vitest';
import {
  calculateCAGR,
  calculateROIC,
  calculateFCF,
  calculateDCF,
  calculateQualityMetrics,
  calculateFCFPerShare,
  calculateDebtToFCF,
  calculateShareDilution,
  calculateFCFMargin
} from '../../services/calculations';
import type { AnnualFinancials, AnnualBalanceSheet, AnnualCashFlow } from '../../lib/types/domain';
import type { DCFInputs, QualityMetric } from '../../lib/types/fmp';

describe('Financial Calculations', () => {
  describe('calculateCAGR', () => {
    it('should calculate CAGR correctly for 5-year period', () => {
      const initialValue = 100;
      const finalValue = 161; // ~10% CAGR sur 5 ans
      const years = 5;

      const result = calculateCAGR(initialValue, finalValue, years);

      // CAGR = (161/100)^(1/5) - 1 = 0.0999... ≈ 10%
      expect(result).toBeCloseTo(0.10, 2);
    });

    it('should calculate CAGR correctly for 10-year period', () => {
      const initialValue = 100;
      const finalValue = 259; // ~10% CAGR sur 10 ans
      const years = 10;

      const result = calculateCAGR(initialValue, finalValue, years);

      // CAGR = (259/100)^(1/10) - 1 = 0.0999... ≈ 10%
      expect(result).toBeCloseTo(0.10, 2);
    });

    it('should return 0 for zero initial value', () => {
      const result = calculateCAGR(0, 100, 5);
      expect(result).toBe(0);
    });

    it('should return 0 for negative initial value', () => {
      const result = calculateCAGR(-100, 100, 5);
      expect(result).toBe(0);
    });

    it('should handle decline correctly', () => {
      const result = calculateCAGR(100, 50, 5);
      // CAGR = (50/100)^(1/5) - 1 = -0.129... ≈ -13%
      expect(result).toBeCloseTo(-0.129, 2);
    });
  });

  describe('calculateFCF', () => {
    it('should calculate FCF from operating cash flow and capex', () => {
      const operatingCashFlow = 100;
      const capitalExpenditure = -20; // Négatif dans les données FMP

      const result = calculateFCF(operatingCashFlow, capitalExpenditure);

      expect(result).toBe(80); // 100 + (-20) = 80
    });

    it('should use freeCashFlow directly if provided', () => {
      const result = calculateFCF(100, -20, 80);

      expect(result).toBe(80);
    });

    it('should return 0 for invalid inputs', () => {
      expect(calculateFCF(0, -20)).toBe(0);
      expect(calculateFCF(100, 0)).toBe(0);
    });
  });

  describe('calculateFCFPerShare', () => {
    it('should calculate FCF per share correctly', () => {
      const fcf = 1000000000; // 1B
      const sharesOutstanding = 500000000; // 500M

      const result = calculateFCFPerShare(fcf, sharesOutstanding);

      expect(result).toBe(2); // 1B / 500M = 2
    });

    it('should return 0 for zero shares', () => {
      const result = calculateFCFPerShare(1000000000, 0);
      expect(result).toBe(0);
    });
  });

  describe('calculateROIC', () => {
    it('should calculate ROIC correctly', () => {
      const ebit = 100;
      const taxRate = 0.21;
      const totalDebt = 50;
      const totalEquity = 100;
      const cash = 20;

      const result = calculateROIC(ebit, taxRate, totalDebt, totalEquity, cash);

      // NOPAT = EBIT * (1 - TaxRate) = 100 * 0.79 = 79
      // Invested Capital = Debt + Equity - Cash = 50 + 100 - 20 = 130
      // ROIC = 79 / 130 = 0.607... ≈ 60.8%
      expect(result).toBeCloseTo(0.608, 2);
    });

    it('should return 0 for zero invested capital', () => {
      const result = calculateROIC(100, 0.21, 0, 0, 0);
      expect(result).toBe(0);
    });

    it('should handle negative invested capital', () => {
      const result = calculateROIC(100, 0.21, 10, 10, 50);
      expect(result).toBe(0);
    });
  });

  describe('calculateDebtToFCF', () => {
    it('should calculate debt to FCF ratio', () => {
      const netDebt = 100;
      const fcf = 50;

      const result = calculateDebtToFCF(netDebt, fcf);

      expect(result).toBe(2); // 100 / 50 = 2
    });

    it('should return Infinity for zero FCF', () => {
      const result = calculateDebtToFCF(100, 0);
      expect(result).toBe(Infinity);
    });
  });

  describe('calculateShareDilution', () => {
    it('should calculate share dilution over 5 years', () => {
      const initialShares = 1000;
      const finalShares = 1139; // +13.9%
      const years = 5;

      const result = calculateShareDilution(initialShares, finalShares, years);

      // CAGR = (1139/1000)^(1/5) - 1 = 0.026... ≈ 2.6%
      expect(result).toBeCloseTo(0.026, 2);
    });

    it('should calculate share reduction correctly', () => {
      const initialShares = 1000;
      const finalShares = 900; // -10%
      const years = 5;

      const result = calculateShareDilution(initialShares, finalShares, years);

      // CAGR = (900/1000)^(1/5) - 1 = -0.020... ≈ -2.1%
      expect(result).toBeLessThan(0);
    });

    it('should return 0 for zero initial shares', () => {
      const result = calculateShareDilution(0, 1000, 5);
      expect(result).toBe(0);
    });
  });

  describe('calculateFCFMargin', () => {
    it('should calculate FCF margin correctly', () => {
      const fcf = 20;
      const revenue = 100;

      const result = calculateFCFMargin(fcf, revenue);

      expect(result).toBe(0.2); // 20 / 100 = 20%
    });

    it('should return 0 for zero revenue', () => {
      const result = calculateFCFMargin(20, 0);
      expect(result).toBe(0);
    });
  });

  describe('calculateDCF', () => {
    it('should calculate DCF valuation correctly', () => {
      const inputs: DCFInputs = {
        ticker: 'TEST',
        currentFCF: 100,
        growthRate: 0.10, // 10%
        discountRate: 0.10, // 10%
        terminalMultiple: 15,
        projectionYears: 5,
        sharesOutstanding: 100
      };

      const result = calculateDCF(inputs);

      // Vérifications de structure
      expect(result.ticker).toBe('TEST');
      expect(result.enterpriseValue).toBeGreaterThan(0);
      expect(result.targetPrice).toBeGreaterThan(0);
      expect(result.projectedFCFs).toHaveLength(5);
      
      // Premier FCF projeté = 100 * 1.10 = 110
      expect(result.projectedFCFs[0].fcf).toBeCloseTo(110, 0);
      
      // Target price doit être calculé
      expect(result.currentPrice).toBe(0); // Non fourni
      expect(result.upside).toBe(0); // Non calculable sans currentPrice
    });

    it('should calculate with different growth and discount rates', () => {
      const inputs: DCFInputs = {
        ticker: 'TEST',
        currentFCF: 100,
        growthRate: 0.05, // 5%
        discountRate: 0.08, // 8%
        terminalMultiple: 12,
        projectionYears: 10,
        sharesOutstanding: 50
      };

      const result = calculateDCF(inputs);

      expect(result.projectedFCFs).toHaveLength(10);
      expect(result.targetPrice).toBeGreaterThan(0);
      
      // Avec growth < discount, les PV devraient diminuer
      const firstPV = result.projectedFCFs[0].presentValue;
      const lastPV = result.projectedFCFs[9].presentValue;
      expect(lastPV).toBeLessThan(firstPV * 1.5); // Croissance modérée
    });

    it('should handle currentPrice for upside calculation', () => {
      const inputs: DCFInputs = {
        ticker: 'TEST',
        currentFCF: 100,
        growthRate: 0.10,
        discountRate: 0.10,
        terminalMultiple: 15,
        projectionYears: 5,
        sharesOutstanding: 100,
        currentPrice: 50
      };

      const result = calculateDCF(inputs);

      expect(result.currentPrice).toBe(50);
      expect(result.upside).toBeDefined();
      // Upside = (targetPrice - currentPrice) / currentPrice * 100
      expect(result.upside).toBeGreaterThan(-100);
    });
  });

  describe('calculateQualityMetrics', () => {
    it('should calculate all 6 quality metrics', () => {
      const incomeStatements: AnnualFinancials[] = [
        { fiscalYear: '2023', revenue: 383285000000, grossProfit: 169148000000, operatingIncome: 114301000000, incomeTaxExpense: 16741000000, incomeBeforeTax: 113736000000, weightedAverageSharesDiluted: 15812547000 },
        { fiscalYear: '2022', revenue: 394328000000, grossProfit: 170782000000, operatingIncome: 119437000000, incomeTaxExpense: 19300000000, incomeBeforeTax: 119103000000, weightedAverageSharesDiluted: 16325819000 },
        { fiscalYear: '2021', revenue: 365817000000, grossProfit: 152836000000, operatingIncome: 108949000000, incomeTaxExpense: 14527000000, incomeBeforeTax: 109207000000, weightedAverageSharesDiluted: 16714282000 },
        { fiscalYear: '2020', revenue: 274515000000, grossProfit: 104956000000, operatingIncome: 66288000000, incomeTaxExpense: 9680000000, incomeBeforeTax: 67091000000, weightedAverageSharesDiluted: 17353115000 },
        { fiscalYear: '2019', revenue: 260174000000, grossProfit: 98392000000, operatingIncome: 63930000000, incomeTaxExpense: 10481000000, incomeBeforeTax: 65737000000, weightedAverageSharesDiluted: 18471336000 },
      ];

      const balanceSheets: AnnualBalanceSheet[] = [
        { fiscalYear: '2023', totalDebt: 111088000000, totalStockholdersEquity: 62206000000, cashAndCashEquivalents: 29943000000, netDebt: 81145000000 },
        { fiscalYear: '2022', totalDebt: 120069000000, totalStockholdersEquity: 50672000000, cashAndCashEquivalents: 16913000000, netDebt: 103156000000 },
      ];

      const cashFlows: AnnualCashFlow[] = [
        { fiscalYear: '2023', freeCashFlow: 99583000000, stockBasedCompensation: 10839000000 },
        { fiscalYear: '2022', freeCashFlow: 111443000000, stockBasedCompensation: 9038000000 },
        { fiscalYear: '2021', freeCashFlow: 92953000000, stockBasedCompensation: 7906000000 },
        { fiscalYear: '2020', freeCashFlow: 73365000000, stockBasedCompensation: 6829000000 },
        { fiscalYear: '2019', freeCashFlow: 58896000000, stockBasedCompensation: 6068000000 },
      ];

      const result = calculateQualityMetrics(incomeStatements, balanceSheets, cashFlows);

      expect(result).toHaveLength(6);
      
      // Vérifier les IDs
      const ids = result.map((m: QualityMetric) => m.id);
      expect(ids).toContain('revenue-growth');
      expect(ids).toContain('fcf-growth');
      expect(ids).toContain('super-roic');
      expect(ids).toContain('debt-fcf');
      expect(ids).toContain('shares-outstanding');
      expect(ids).toContain('fcf-margin');

      // Vérifier que toutes les valeurs sont des nombres
      result.forEach((metric: QualityMetric) => {
        expect(typeof metric.value).toBe('number');
        expect(metric.label).toBeDefined();
        expect(metric.threshold).toBeDefined();
        expect(typeof metric.isPositive).toBe('boolean');
      });
    });

    it('should handle empty arrays gracefully', () => {
      const result = calculateQualityMetrics([], [], []);

      expect(result).toHaveLength(6);
      result.forEach((metric: QualityMetric) => {
        expect(metric.value).toBe(0);
      });
    });

    it('should mark metrics as positive based on thresholds', () => {
      const incomeStatements: AnnualFinancials[] = [
        { fiscalYear: '2023', revenue: 200, grossProfit: 100, operatingIncome: 50, incomeTaxExpense: 10, incomeBeforeTax: 60, weightedAverageSharesDiluted: 1000 },
        { fiscalYear: '2019', revenue: 100, grossProfit: 50, operatingIncome: 25, incomeTaxExpense: 5, incomeBeforeTax: 30, weightedAverageSharesDiluted: 1000 },
      ];

      const cashFlows: AnnualCashFlow[] = [
        { fiscalYear: '2023', freeCashFlow: 200, stockBasedCompensation: 10 },
        { fiscalYear: '2019', freeCashFlow: 100, stockBasedCompensation: 5 },
      ];

      const result = calculateQualityMetrics(incomeStatements, [], cashFlows);

      // Revenue growth > 10% devrait être positive
      const revenueGrowth = result.find((m: QualityMetric) => m.id === 'revenue-growth');
      expect(revenueGrowth?.isPositive).toBe(true);
      expect(revenueGrowth?.status).toBe('success');
    });
  });
});
