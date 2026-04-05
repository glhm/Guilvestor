import type { AnnualFinancials, AnnualBalanceSheet, AnnualCashFlow } from '../lib/types/domain';
import type { DCFInputs, DCFResult, QualityMetric } from '../lib/types/fmp';

/**
 * Calculate Compound Annual Growth Rate (CAGR)
 * Formula: CAGR = (Final Value / Initial Value)^(1/n) - 1
 */
export function calculateCAGR(initialValue: number, finalValue: number, years: number): number {
  if (initialValue <= 0 || years <= 0) return 0;
  return Math.pow(finalValue / initialValue, 1 / years) - 1;
}

/**
 * Calculate Free Cash Flow
 * FCF = Operating Cash Flow - Capital Expenditure
 * In FMP data, capex is usually negative, so we add it (FCF = OCF + CapEx where CapEx is negative)
 */
export function calculateFCF(
  operatingCashFlow: number, 
  capitalExpenditure: number,
  providedFCF?: number
): number {
  if (providedFCF !== undefined) return providedFCF;
  if (operatingCashFlow <= 0) return 0;
  if (capitalExpenditure === 0) return 0;
  // CapEx is negative in FMP data, so FCF = OCF + CapEx (e.g., 100 + (-20) = 80)
  return operatingCashFlow + capitalExpenditure;
}

/**
 * Calculate FCF per share
 */
export function calculateFCFPerShare(fcf: number, sharesOutstanding: number): number {
  if (sharesOutstanding <= 0) return 0;
  return fcf / sharesOutstanding;
}

/**
 * Calculate Return on Invested Capital (ROIC)
 * Formula: ROIC = NOPAT / Invested Capital
 * NOPAT = EBIT * (1 - Tax Rate)
 * Invested Capital = Total Debt + Total Equity - Cash
 */
export function calculateROIC(
  ebit: number,
  taxRate: number,
  totalDebt: number,
  totalEquity: number,
  cash: number
): number {
  const nopat = ebit * (1 - taxRate);
  const investedCapital = totalDebt + totalEquity - cash;
  
  if (investedCapital <= 0) return 0;
  
  return nopat / investedCapital;
}

/**
 * Calculate Net Debt to FCF ratio
 * Shows how many years of FCF needed to pay off debt
 */
export function calculateDebtToFCF(netDebt: number, fcf: number): number {
  if (fcf <= 0) return Infinity;
  return netDebt / fcf;
}

/**
 * Calculate share dilution using CAGR formula
 * Positive = dilution (bad), Negative = buybacks (good)
 */
export function calculateShareDilution(
  initialShares: number,
  finalShares: number,
  years: number
): number {
  if (initialShares <= 0 || years <= 0) return 0;
  return calculateCAGR(initialShares, finalShares, years);
}

/**
 * Calculate FCF Margin
 * Formula: FCF Margin = FCF / Revenue
 */
export function calculateFCFMargin(fcf: number, revenue: number): number {
  if (revenue <= 0) return 0;
  return fcf / revenue;
}

/**
 * Calculate Discounted Cash Flow (DCF) valuation
 */
export function calculateDCF(inputs: DCFInputs): DCFResult {
  const {
    ticker,
    currentFCF,
    growthRate,
    discountRate,
    terminalMultiple,
    projectionYears,
    sharesOutstanding,
    currentPrice
  } = inputs;

  const projectedFCFs: Array<{ year: number; fcf: number; presentValue: number }> = [];
  let enterpriseValue = 0;

  // Project FCF for each year
  let previousFCF = currentFCF;
  for (let year = 1; year <= projectionYears; year++) {
    const fcf = previousFCF * (1 + growthRate);
    const presentValue = fcf / Math.pow(1 + discountRate, year);
    
    projectedFCFs.push({
      year,
      fcf,
      presentValue
    });
    
    enterpriseValue += presentValue;
    previousFCF = fcf;
  }

  // Calculate terminal value
  const terminalFCF = previousFCF;
  const terminalValue = (terminalFCF * terminalMultiple) / Math.pow(1 + discountRate, projectionYears);
  enterpriseValue += terminalValue;

  // Calculate equity value and target price
  // Assuming net debt is 0 for simplicity (can be enhanced later)
  const equityValue = enterpriseValue;
  const targetPrice = sharesOutstanding > 0 ? equityValue / sharesOutstanding : 0;

  // Calculate upside
  let upside = 0;
  if (currentPrice && currentPrice > 0) {
    upside = ((targetPrice - currentPrice) / currentPrice) * 100;
  }

  return {
    ticker,
    enterpriseValue,
    equityValue,
    targetPrice,
    currentPrice: currentPrice || 0,
    upside,
    projectedFCFs,
    wacc: discountRate
  };
}

/**
 * Calculate all 6 quality metrics for a stock
 */
export function calculateQualityMetrics(
  incomeStatements: AnnualFinancials[],
  balanceSheets: AnnualBalanceSheet[],
  cashFlows: AnnualCashFlow[]
): QualityMetric[] {
  const metrics: QualityMetric[] = [];

  // 1. Revenue Growth (CAGR sur 5 ans)
  if (incomeStatements.length >= 2) {
    const sortedIncome = [...incomeStatements].sort((a, b) => 
      parseInt(b.fiscalYear) - parseInt(a.fiscalYear)
    );
    const recentRevenue = sortedIncome[0]?.revenue || 0;
    const oldRevenue = sortedIncome[Math.min(4, sortedIncome.length - 1)]?.revenue || 0;
    const years = Math.min(5, sortedIncome.length - 1);
    
    const revenueGrowth = calculateCAGR(oldRevenue, recentRevenue, years);
    const isPositive = revenueGrowth > 0.10;
    
    metrics.push({
      id: 'revenue-growth',
      label: 'Croissance du chiffre d\'affaires',
      value: revenueGrowth * 100,
      unit: '%',
      description: `par an sur les ${years} dernières années`,
      threshold: 'Doit être supérieur à 10 %',
      isPositive,
      status: isPositive ? 'success' : revenueGrowth > 0.05 ? 'warning' : 'error'
    });
  } else {
    metrics.push({
      id: 'revenue-growth',
      label: 'Croissance du chiffre d\'affaires',
      value: 0,
      unit: '%',
      description: 'par an sur les 5 dernières années',
      threshold: 'Doit être supérieur à 10 %',
      isPositive: false,
      status: 'error'
    });
  }

  // 2. FCF Growth (CAGR sur 5 ans)
  if (cashFlows.length >= 2) {
    const sortedCF = [...cashFlows].sort((a, b) => 
      parseInt(b.fiscalYear) - parseInt(a.fiscalYear)
    );
    const recentFCF = sortedCF[0]?.freeCashFlow || 0;
    const oldFCF = sortedCF[Math.min(4, sortedCF.length - 1)]?.freeCashFlow || 0;
    const years = Math.min(5, sortedCF.length - 1);
    
    const fcfGrowth = calculateCAGR(oldFCF, recentFCF, years);
    const isPositive = fcfGrowth > 0.10;
    
    metrics.push({
      id: 'fcf-growth',
      label: 'Croissance du free cash flow',
      value: fcfGrowth * 100,
      unit: '%',
      description: `par an sur les ${years} dernières années`,
      threshold: 'Doit être supérieur à 10 %',
      isPositive,
      status: isPositive ? 'success' : fcfGrowth > 0.05 ? 'warning' : 'error'
    });
  } else {
    metrics.push({
      id: 'fcf-growth',
      label: 'Croissance du free cash flow',
      value: 0,
      unit: '%',
      description: 'par an sur les 5 dernières années',
      threshold: 'Doit être supérieur à 10 %',
      isPositive: false,
      status: 'error'
    });
  }

  // 3. Super ROIC (moyenne sur 5 ans)
  if (incomeStatements.length > 0 && balanceSheets.length > 0) {
    // Simplification: on calcule avec les donnees disponibles
    // Calcul complexe du ROIC necessite EBIT, tax rate, debt, equity, cash
    const roicValue = 0.15; // Placeholder - a remplacer par vrai calcul
    const roicPositive = roicValue > 0.15;
    
    metrics.push({
      id: 'super-roic',
      label: 'Super ROIC',
      value: roicValue * 100,
      unit: '%',
      description: 'en moyenne sur 5 ans',
      threshold: 'Doit etre superieur a 15 %',
      isPositive: roicPositive,
      status: roicPositive ? 'success' : roicValue > 0.10 ? 'warning' : 'error'
    });
  } else {
    metrics.push({
      id: 'super-roic',
      label: 'Super ROIC',
      value: 0,
      unit: '%',
      description: 'en moyenne sur 5 ans',
      threshold: 'Doit etre superieur a 15 %',
      isPositive: false,
      status: 'error'
    });
  }

  // 4. Net Debt to FCF (dernier trimestre/année)
  if (balanceSheets.length > 0 && cashFlows.length > 0) {
    const latestBS = [...balanceSheets].sort((a, b) => 
      parseInt(b.fiscalYear) - parseInt(a.fiscalYear)
    )[0];
    const latestCF = [...cashFlows].sort((a, b) => 
      parseInt(b.fiscalYear) - parseInt(a.fiscalYear)
    )[0];
    
    const netDebt = latestBS?.netDebt || 0;
    const fcf = latestCF?.freeCashFlow || 0;
    const debtToFCF = calculateDebtToFCF(netDebt, fcf);
    const isPositive = debtToFCF < 3;
    
    metrics.push({
      id: 'debt-fcf',
      label: 'Dette nette / Free cash flow',
      value: debtToFCF === Infinity ? 999 : debtToFCF,
      unit: '',
      description: 'au dernier exercice',
      threshold: 'Doit être inférieur à 3',
      isPositive,
      status: isPositive ? 'success' : debtToFCF < 5 ? 'warning' : 'error'
    });
  } else {
    metrics.push({
      id: 'debt-fcf',
      label: 'Dette nette / Free cash flow',
      value: 0,
      unit: '',
      description: 'au dernier exercice',
      threshold: 'Doit être inférieur à 3',
      isPositive: false,
      status: 'error'
    });
  }

  // 5. Share Dilution (CAGR sur 5 ans)
  if (incomeStatements.length >= 2) {
    const sortedIncome = [...incomeStatements].sort((a, b) => 
      parseInt(b.fiscalYear) - parseInt(a.fiscalYear)
    );
    const recentShares = sortedIncome[0]?.weightedAverageSharesDiluted || 0;
    const oldShares = sortedIncome[Math.min(4, sortedIncome.length - 1)]?.weightedAverageSharesDiluted || 0;
    const years = Math.min(5, sortedIncome.length - 1);
    
    const dilution = calculateShareDilution(oldShares, recentShares, years);
    const isPositive = dilution <= 0; // Buybacks = good (negative dilution)
    
    metrics.push({
      id: 'shares-outstanding',
      label: 'Nombre d\'actions en circulation',
      value: dilution * 100,
      unit: '%',
      description: `sur les ${years} dernières années`,
      threshold: 'Doit être inférieur ou égal à 0 %',
      isPositive,
      status: isPositive ? 'success' : dilution < 0.05 ? 'warning' : 'error'
    });
  } else {
    metrics.push({
      id: 'shares-outstanding',
      label: 'Nombre d\'actions en circulation',
      value: 0,
      unit: '%',
      description: 'sur les 5 dernières années',
      threshold: 'Doit être inférieur ou égal à 0 %',
      isPositive: false,
      status: 'error'
    });
  }

  // 6. FCF Margin (moyenne sur 5 ans)
  if (cashFlows.length > 0 && incomeStatements.length > 0) {
    const sortedCF = [...cashFlows].sort((a, b) => 
      parseInt(b.fiscalYear) - parseInt(a.fiscalYear)
    );
    const sortedIncome = [...incomeStatements].sort((a, b) => 
      parseInt(b.fiscalYear) - parseInt(a.fiscalYear)
    );
    
    let totalMargin = 0;
    let count = 0;
    const yearsToAverage = Math.min(5, sortedCF.length, sortedIncome.length);
    
    for (let i = 0; i < yearsToAverage; i++) {
      const fcf = sortedCF[i]?.freeCashFlow || 0;
      const revenue = sortedIncome[i]?.revenue || 0;
      if (revenue > 0) {
        totalMargin += calculateFCFMargin(fcf, revenue);
        count++;
      }
    }
    
    const avgMargin = count > 0 ? totalMargin / count : 0;
    const isPositive = avgMargin > 0.10;
    
    metrics.push({
      id: 'fcf-margin',
      label: 'Marge du free cash flow',
      value: avgMargin * 100,
      unit: '%',
      description: `en moyenne sur ${count} ans`,
      threshold: 'Doit être supérieur à 10 %',
      isPositive,
      status: isPositive ? 'success' : avgMargin > 0.05 ? 'warning' : 'error'
    });
  } else {
    metrics.push({
      id: 'fcf-margin',
      label: 'Marge du free cash flow',
      value: 0,
      unit: '%',
      description: 'en moyenne sur 5 ans',
      threshold: 'Doit être supérieur à 10 %',
      isPositive: false,
      status: 'error'
    });
  }

  return metrics;
}
