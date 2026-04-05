// Types basés sur les structures réelles de l'API FMP (endpoints /stable/)

// Profile - Informations entreprise
export interface FMPProfile {
  symbol: string;
  price: number;
  marketCap: number;
  beta: number;
  lastDividend: number;
  range: string;
  change: number;
  changePercentage: number;
  volume: number;
  averageVolume: number;
  companyName: string;
  currency: string;
  cik: string;
  isin: string;
  cusip: string;
  exchangeFullName: string;
  exchange: string;
  industry: string;
  website: string;
  description: string;
  ceo: string;
  sector: string;
  country: string;
  fullTimeEmployees: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  image: string;
  ipoDate: string;
  defaultImage: boolean;
  isEtf: boolean;
  isActivelyTrading: boolean;
  isAdr: boolean;
  isFund: boolean;
}

// Quote - Prix actuel
export interface FMPQuote {
  symbol: string;
  name: string;
  price: number;
  changePercentage: number;
  change: number;
  volume: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  exchange: string;
  open: number;
  previousClose: number;
  timestamp: number;
}

// Income Statement - Compte de résultat
export interface FMPIncomeStatement {
  date: string;
  symbol: string;
  reportedCurrency: string;
  cik: string;
  filingDate: string;
  acceptedDate: string;
  fiscalYear: string;
  period: string;
  revenue: number;
  costOfRevenue: number;
  grossProfit: number;
  researchAndDevelopmentExpenses: number;
  generalAndAdministrativeExpenses: number;
  sellingAndMarketingExpenses: number;
  sellingGeneralAndAdministrativeExpenses: number;
  otherExpenses: number;
  operatingExpenses: number;
  costAndExpenses: number;
  netInterestIncome: number;
  interestIncome: number;
  interestExpense: number;
  depreciationAndAmortization: number;
  ebitda: number;
  ebit: number;
  nonOperatingIncomeExcludingInterest: number;
  operatingIncome: number;
  totalOtherIncomeExpensesNet: number;
  incomeBeforeTax: number;
  incomeTaxExpense: number;
  netIncomeFromContinuingOperations: number;
  netIncomeFromDiscontinuedOperations: number;
  otherAdjustmentsToNetIncome: number;
  netIncome: number;
  netIncomeDeductions: number;
  bottomLineNetIncome: number;
  eps: number;
  epsDiluted: number;
  weightedAverageShsOut: number;
  weightedAverageShsOutDil: number;
}

// Balance Sheet - Bilan comptable
export interface FMPBalanceSheet {
  date: string;
  symbol: string;
  reportedCurrency: string;
  cik: string;
  filingDate: string;
  acceptedDate: string;
  fiscalYear: string;
  period: string;
  cashAndCashEquivalents: number;
  shortTermInvestments: number;
  cashAndShortTermInvestments: number;
  netReceivables: number;
  accountsReceivables: number;
  otherReceivables: number;
  inventory: number;
  prepaids: number;
  otherCurrentAssets: number;
  totalCurrentAssets: number;
  propertyPlantEquipmentNet: number;
  goodwill: number;
  intangibleAssets: number;
  goodwillAndIntangibleAssets: number;
  longTermInvestments: number;
  taxAssets: number;
  otherNonCurrentAssets: number;
  totalNonCurrentAssets: number;
  otherAssets: number;
  totalAssets: number;
  totalPayables: number;
  accountPayables: number;
  otherPayables: number;
  accruedExpenses: number;
  shortTermDebt: number;
  capitalLeaseObligationsCurrent: number;
  taxPayables: number;
  deferredRevenue: number;
  otherCurrentLiabilities: number;
  totalCurrentLiabilities: number;
  longTermDebt: number;
  capitalLeaseObligationsNonCurrent: number;
  deferredRevenueNonCurrent: number;
  deferredTaxLiabilitiesNonCurrent: number;
  otherNonCurrentLiabilities: number;
  totalNonCurrentLiabilities: number;
  otherLiabilities: number;
  capitalLeaseObligations: number;
  totalLiabilities: number;
  treasuryStock: number;
  preferredStock: number;
  commonStock: number;
  retainedEarnings: number;
  additionalPaidInCapital: number;
  accumulatedOtherComprehensiveIncomeLoss: number;
  otherTotalStockholdersEquity: number;
  totalStockholdersEquity: number;
  totalEquity: number;
  minorityInterest: number;
  totalLiabilitiesAndTotalEquity: number;
  totalInvestments: number;
  totalDebt: number;
  netDebt: number;
}

// Cash Flow Statement - Flux de trésorerie
export interface FMPCashFlow {
  date: string;
  symbol: string;
  reportedCurrency: string;
  cik: string;
  filingDate: string;
  acceptedDate: string;
  fiscalYear: string;
  period: string;
  netIncome: number;
  depreciationAndAmortization: number;
  deferredIncomeTax: number;
  stockBasedCompensation: number;
  changeInWorkingCapital: number;
  accountsReceivables: number;
  inventory: number;
  accountsPayables: number;
  otherWorkingCapital: number;
  otherNonCashItems: number;
  netCashProvidedByOperatingActivities: number;
  investmentsInPropertyPlantAndEquipment: number;
  acquisitionsNet: number;
  purchasesOfInvestments: number;
  salesMaturitiesOfInvestments: number;
  otherInvestingActivities: number;
  netCashProvidedByInvestingActivities: number;
  netDebtIssuance: number;
  longTermNetDebtIssuance: number;
  shortTermNetDebtIssuance: number;
  netStockIssuance: number;
  netCommonStockIssuance: number;
  commonStockIssuance: number;
  commonStockRepurchased: number;
  netPreferredStockIssuance: number;
  netDividendsPaid: number;
  commonDividendsPaid: number;
  preferredDividendsPaid: number;
  otherFinancingActivities: number;
  netCashProvidedByFinancingActivities: number;
  effectOfForexChangesOnCash: number;
  netChangeInCash: number;
  cashAtEndOfPeriod: number;
  cashAtBeginningOfPeriod: number;
  operatingCashFlow: number;
  capitalExpenditure: number;
  freeCashFlow: number;
  incomeTaxesPaid: number;
  interestPaid: number;
}

// Types pour l'application Guilvestor

export interface StockData {
  ticker: string;
  name: string;
  exchange: string;
  price: number;
  currency: string;
  marketCap: number;
  sector: string;
  industry: string;
  description: string;
  website: string;
  ceo: string;
  employees: string;
  country: string;
  currencyUnit?: string; // ex: "Md $" pour milliards
}

export interface QualityMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  description: string;
  threshold: string;
  isPositive: boolean;
  status?: 'success' | 'warning' | 'error';
}

export interface ChartDataPoint {
  year: string;
  value: number;
  value2?: number; // Pour les graphiques combinés (SBC, dette/cash)
}

export interface CAGRData {
  fiveYear: number;
  tenYear: number;
  twentyYear?: number;
}

export interface RevenueSegment {
  name: string;
  value: number;
  percentage: number;
}

export interface DCFInputs {
  ticker: string;
  currentFCF: number;
  growthRate: number; // Décimal (0.10 = 10%)
  discountRate: number;
  terminalMultiple: number;
  projectionYears: number;
  sharesOutstanding: number;
  currentPrice?: number; // Prix actuel pour calculer l'upside
}

export interface DCFResult {
  ticker: string;
  enterpriseValue: number;
  equityValue: number;
  targetPrice: number;
  currentPrice: number;
  upside: number; // Pourcentage
  projectedFCFs: Array<{
    year: number;
    fcf: number;
    presentValue: number;
  }>;
  wacc?: number;
}

// Réponse API standardisée
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Données complètes pour une action
export interface CompleteStockData {
  profile: StockData;
  metrics: QualityMetric[];
  charts: {
    revenue: ChartDataPoint[];
    fcf: ChartDataPoint[];
    fcfPerShare: ChartDataPoint[];
    roic: ChartDataPoint[];
    grossMargin: ChartDataPoint[];
    fcfMargin: ChartDataPoint[];
    sharesOutstanding: ChartDataPoint[];
    dividends: ChartDataPoint[];
    cashAndDebt: ChartDataPoint[];
  };
  cagrData: {
    revenue: CAGRData;
    fcf: CAGRData;
    fcfPerShare: CAGRData;
  };
  revenueSegments: RevenueSegment[];
  dcfInputs: DCFInputs;
}

// Données historiques pour graphiques
export interface HistoricalPriceData {
  symbol: string;
  historical: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    adjClose: number;
    volume: number;
    unadjustedVolume: number;
    change: number;
    changePercent: number;
    vwap: number;
    label: string;
    changeOverTime: number;
  }>;
}

// Erreurs FMP
export class FMPError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'FMPError';
  }
}
