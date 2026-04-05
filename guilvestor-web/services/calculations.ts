import type { AnnualFinancials, AnnualBalanceSheet, AnnualCashFlow } from '../lib/types/domain';
import type { DCFInputs, DCFResult, QualityMetric } from '../lib/types/fmp';

export function calculateCAGR(initialValue: number, finalValue: number, years: number): number {
  if (initialValue <= 0 || years <= 0) return 0;
  return Math.pow(finalValue / initialValue, 1 / years) - 1;
}

export function calculateFCF(operatingCashFlow: number, capitalExpenditure: number, providedFCF?: number): number {
  if (providedFCF !== undefined) return providedFCF;
  if (operatingCashFlow <= 0) return 0;
  if (capitalExpenditure === 0) return 0;
  return operatingCashFlow + capitalExpenditure;
}

export function calculateFCFPerShare(fcf: number, sharesOutstanding: number): number {
  if (sharesOutstanding <= 0) return 0;
  return fcf / sharesOutstanding;
}

export function calculateROIC(fcf: number, sbc: number, investedCapital: number): number {
  if (investedCapital <= 0) return 0;
  return (fcf - sbc) / investedCapital;
}

export function calculateDebtToFCF(netDebt: number, fcf: number): number {
  if (fcf <= 0) return Infinity;
  return netDebt / fcf;
}

export function calculateShareDilution(initialShares: number, finalShares: number, years: number): number {
  if (initialShares <= 0 || years <= 0) return 0;
  return calculateCAGR(initialShares, finalShares, years);
}

export function calculateFCFMargin(fcf: number, revenue: number): number {
  if (revenue <= 0) return 0;
  return fcf / revenue;
}

function getValidDataPoints<T>(items: T[], valueGetter: (item: T) => number, yearGetter: (item: T) => string, minPoints: number = 2): Array<{ year: string; value: number }> | null {
  const valid = items
    .map(item => ({ year: yearGetter(item), value: valueGetter(item) }))
    .filter(item => item.value > 0)
    .sort((a, b) => parseInt(a.year) - parseInt(b.year));
  return valid.length >= minPoints ? valid : null;
}

export function calculateDCF(inputs: DCFInputs): DCFResult {
  const { ticker, currentFCF, growthRate, discountRate, terminalMultiple, projectionYears, sharesOutstanding, currentPrice } = inputs;
  const projectedFCFs: Array<{ year: number; fcf: number; presentValue: number }> = [];
  let enterpriseValue = 0;
  let previousFCF = currentFCF;
  for (let year = 1; year <= projectionYears; year++) {
    const fcf = previousFCF * (1 + growthRate);
    const presentValue = fcf / Math.pow(1 + discountRate, year);
    projectedFCFs.push({ year, fcf, presentValue });
    enterpriseValue += presentValue;
    previousFCF = fcf;
  }
  const terminalFCF = previousFCF;
  const terminalValue = (terminalFCF * terminalMultiple) / Math.pow(1 + discountRate, projectionYears);
  enterpriseValue += terminalValue;
  const equityValue = enterpriseValue;
  const targetPrice = sharesOutstanding > 0 ? equityValue / sharesOutstanding : 0;
  let upside = 0;
  if (currentPrice && currentPrice > 0) {
    upside = ((targetPrice - currentPrice) / currentPrice) * 100;
  }
  return { ticker, enterpriseValue, equityValue, targetPrice, currentPrice: currentPrice || 0, upside, projectedFCFs, wacc: discountRate };
}

export function calculateQualityMetrics(incomeStatements: AnnualFinancials[], balanceSheets: AnnualBalanceSheet[], cashFlows: AnnualCashFlow[]): QualityMetric[] {
  const metrics: QualityMetric[] = [];
  const validRevenue = getValidDataPoints(incomeStatements, item => item.revenue, item => item.fiscalYear);
  if (validRevenue) {
    const years = validRevenue.length - 1;
    const revenueGrowth = calculateCAGR(validRevenue[0].value, validRevenue[validRevenue.length - 1].value, years);
    const isPositive = revenueGrowth > 0.10;
    metrics.push({ id: 'revenue-growth', label: "Croissance du chiffre d'affaires", value: revenueGrowth * 100, unit: '%', description: 'en moyenne par an sur les ' + years + ' dernières années', threshold: 'Doit etre superieur a 10 %', isPositive, status: isPositive ? 'success' : revenueGrowth > 0.05 ? 'warning' : 'error' });
  } else {
    metrics.push({ id: 'revenue-growth', label: "Croissance du chiffre d'affaires", value: null, unit: '%', description: 'N/A', threshold: 'Doit etre superieur a 10 %', isPositive: false, status: 'neutral' });
  }
  const validFCF = getValidDataPoints(cashFlows, item => item.freeCashFlow, item => item.fiscalYear);
  if (validFCF) {
    const years = validFCF.length - 1;
    const fcfGrowth = calculateCAGR(validFCF[0].value, validFCF[validFCF.length - 1].value, years);
    const isPositive = fcfGrowth > 0.10;
    metrics.push({ id: 'fcf-growth', label: 'Croissance du free cash flow', value: fcfGrowth * 100, unit: '%', description: 'en moyenne par an sur les ' + years + ' dernières années', threshold: 'Doit etre superieur a 10 %', isPositive, status: isPositive ? 'success' : fcfGrowth > 0.05 ? 'warning' : 'error' });
  } else {
    metrics.push({ id: 'fcf-growth', label: 'Croissance du free cash flow', value: null, unit: '%', description: 'N/A', threshold: 'Doit etre superieur a 10 %', isPositive: false, status: 'neutral' });
  }
  if (balanceSheets.length > 0 && cashFlows.length > 0) {
    const roicValues = balanceSheets.map(bs => { const cf = cashFlows.find(c => c.fiscalYear === bs.fiscalYear); if (!cf) return null; const ic = bs.investedCapital ?? (bs.totalDebt + bs.totalStockholdersEquity - bs.cashAndCashEquivalents); return calculateROIC(cf.freeCashFlow, cf.stockBasedCompensation, ic); }).filter((v): v is number => v !== null && isFinite(v));
    const roicValue = roicValues.length > 0 ? roicValues.reduce((sum, v) => sum + v, 0) / roicValues.length : 0;
    const roicPositive = roicValue > 0.15;
    metrics.push({ id: 'super-roic', label: 'Super ROIC', value: Math.round(roicValue * 100 * 10) / 10, unit: '%', description: 'en moyenne sur ' + roicValues.length + ' ans', threshold: 'Doit etre superieur a 15 %', isPositive: roicPositive, status: roicPositive ? 'success' : roicValue > 0.10 ? 'warning' : 'error' });
  } else {
    metrics.push({ id: 'super-roic', label: 'Super ROIC', value: null, unit: '%', description: 'N/A', threshold: 'Doit etre superieur a 15 %', isPositive: false, status: 'neutral' });
  }
  if (balanceSheets.length > 0 && cashFlows.length > 0) {
    const latestBS = [...balanceSheets].sort((a, b) => parseInt(b.fiscalYear) - parseInt(a.fiscalYear))[0];
    const latestCF = [...cashFlows].sort((a, b) => parseInt(b.fiscalYear) - parseInt(a.fiscalYear))[0];
    const netDebt = latestBS?.netDebt ?? (latestBS ? latestBS.totalDebt - latestBS.cashAndCashEquivalents : 0);
    const fcf = latestCF?.freeCashFlow || 0;
    const debtToFCF = calculateDebtToFCF(netDebt, fcf);
    const isPositive = debtToFCF < 3;
    metrics.push({ id: 'debt-fcf', label: 'Dette nette / Free cash flow', value: debtToFCF === Infinity ? 999 : debtToFCF, unit: '', description: 'au dernier exercice', threshold: 'Doit etre inferieur a 3', isPositive, status: isPositive ? 'success' : debtToFCF < 5 ? 'warning' : 'error' });
  } else {
    metrics.push({ id: 'debt-fcf', label: 'Dette nette / Free cash flow', value: null, unit: '', description: 'N/A', threshold: 'Doit etre inferieur a 3', isPositive: false, status: 'neutral' });
  }
  const validShares = getValidDataPoints(incomeStatements, item => item.weightedAverageSharesDiluted, item => item.fiscalYear);
  if (validShares) {
    const years = validShares.length - 1;
    const dilution = calculateShareDilution(validShares[0].value, validShares[validShares.length - 1].value, years);
    const isPositive = dilution <= 0;
    metrics.push({ id: 'shares-outstanding', label: "Nombre d'actions en circulation", value: dilution * 100, unit: '%', description: 'en moyenne par an sur les ' + years + ' dernières années', threshold: 'Doit etre inferieur ou egal a 0 %', isPositive, status: isPositive ? 'success' : dilution < 0.05 ? 'warning' : 'error' });
  } else {
    metrics.push({ id: 'shares-outstanding', label: "Nombre d'actions en circulation", value: null, unit: '%', description: 'N/A', threshold: 'Doit etre inferieur ou egal a 0 %', isPositive: false, status: 'neutral' });
  }
  if (cashFlows.length > 0 && incomeStatements.length > 0) {
    const sortedCF = [...cashFlows].sort((a, b) => 
      parseInt(b.fiscalYear) - parseInt(a.fiscalYear));
    const sortedIncome = [...incomeStatements].sort((a, b) => 
      parseInt(b.fiscalYear) - parseInt(a.fiscalYear));
    let totalMargin = 0;
    let count = 0;
    const yearsToAverage = Math.min(5, sortedCF.length, sortedIncome.length);
    for (let i = 0; i < yearsToAverage; i++) {
      const fcf = sortedCF[i]?.freeCashFlow || 0;
      const revenue = sortedIncome[i]?.revenue || 0;
      if (revenue > 0 && fcf !== 0) {
        totalMargin += calculateFCFMargin(fcf, revenue);
        count++;
      }
    }
    const avgMargin = count > 0 ? totalMargin / count : 0;
    const isPositive = avgMargin > 0.10;
    metrics.push({ id: 'fcf-margin', label: 'Marge du free cash flow', value: avgMargin * 100, unit: '%', description: 'en moyenne sur ' + count + ' ans', threshold: 'Doit etre superieur a 10 %', isPositive, status: isPositive ? 'success' : avgMargin > 0.05 ? 'warning' : 'error' });
  } else {
    metrics.push({ id: 'fcf-margin', label: 'Marge du free cash flow', value: null, unit: '%', description: 'N/A', threshold: 'Doit etre superieur a 10 %', isPositive: false, status: 'neutral' });
  }
  return metrics;
}
