import type { StockData, QualityMetric, ChartDataPoint, CAGRData, RevenueSegment } from "./types"

export const stockData: StockData = {
  ticker: "FISV",
  name: "Fiserv, Inc.",
  exchange: "US - NASDAQ",
  price: 60.53,
  currency: "$US",
  marketCap: 32.9,
  marketCapUnit: "Md $",
}

export const qualityMetrics: QualityMetric[] = [
  {
    id: "revenue-growth",
    label: "Croissance du chiffre d'affaires",
    value: 14.96,
    unit: "%",
    description: "par an sur les 5 dernières années",
    threshold: "Doit être supérieur à 10 %",
    isPositive: true,
  },
  {
    id: "fcf-growth",
    label: "Croissance du free cash flow",
    value: 19.54,
    unit: "%",
    description: "par an sur les 5 dernières années",
    threshold: "Doit être supérieur à 10 %",
    isPositive: true,
  },
  {
    id: "super-roic",
    label: "Super ROIC",
    value: 16.23,
    unit: "%",
    description: "en moyenne sur 5 ans",
    threshold: "Doit être supérieur à 15 %",
    isPositive: true,
  },
  {
    id: "debt-fcf",
    label: "Dette nette / Free cash flow",
    value: 4.90,
    unit: "",
    description: "au dernier trimestre",
    threshold: "Doit être inférieur à 3",
    isPositive: false,
  },
  {
    id: "shares-outstanding",
    label: "Nombre d'actions en circulation",
    value: 11.39,
    unit: "%",
    description: "sur les 5 dernières années",
    threshold: "Doit être inférieur ou égal à 0 %",
    isPositive: false,
  },
  {
    id: "fcf-margin",
    label: "Marge du free cash flow",
    value: 20.36,
    unit: "%",
    description: "en moyenne sur 5 ans",
    threshold: "Doit être supérieur à 10 %",
    isPositive: true,
  },
]

// Generate historical data from 1985 to 2023
const generateYears = (startYear: number, endYear: number): string[] => {
  const years: string[] = []
  for (let year = startYear; year <= endYear; year++) {
    years.push(year.toString())
  }
  years.push("TTM")
  return years
}

const years = generateYears(1985, 2023)

// Revenue data (Chiffre d'affaires)
export const revenueData: ChartDataPoint[] = years.map((year, index) => {
  if (year === "TTM") {
    return { year, value: 19.5 }
  }
  const baseValue = 0.5 + (index * 0.3) + Math.random() * 2
  const growth = Math.pow(1.12, index / 10)
  return { year, value: Math.min(baseValue * growth, 22) }
})

export const revenueCAGR: CAGRData = {
  fiveYear: 14.96,
  tenYear: 14.98,
  twentyYear: 8.88,
}

// Free Cash Flow data
export const fcfData: ChartDataPoint[] = years.slice(4).map((year, index) => {
  if (year === "TTM") {
    return { year, value: 5.8, value2: 0.3 }
  }
  const baseValue = 0.2 + (index * 0.1) + Math.random() * 0.5
  const growth = Math.pow(1.15, index / 8)
  return { 
    year, 
    value: Math.min(baseValue * growth, 6),
    value2: Math.random() * 0.4
  }
})

export const fcfCAGR: CAGRData = {
  fiveYear: 19.54,
  tenYear: 17.43,
  twentyYear: 11.91,
}

// FCF per share data
export const fcfPerShareData: ChartDataPoint[] = years.slice(4).map((year, index) => {
  if (year === "TTM") {
    return { year, value: 11.5 }
  }
  const baseValue = 0.5 + (index * 0.2) + Math.random() * 1
  const growth = Math.pow(1.12, index / 6)
  return { year, value: Math.min(baseValue * growth, 12) }
})

export const fcfPerShareCAGR: CAGRData = {
  fiveYear: 16.99,
  tenYear: 15.78,
  twentyYear: 13.63,
}

// Super ROIC data (line chart)
export const superRoicData: ChartDataPoint[] = years.slice(3).map((year) => {
  if (year === "TTM") {
    return { year, value: 22 }
  }
  const yearNum = parseInt(year)
  let value = 8 + Math.random() * 10
  if (yearNum > 2010) {
    value = 15 + Math.random() * 25
  }
  if (yearNum > 2017) {
    value = 25 + Math.random() * 15
  }
  return { year, value: Math.min(value, 47) }
})

// Gross margin data (Marge brute)
export const grossMarginData: ChartDataPoint[] = years.slice(3).map((year) => {
  if (year === "TTM") {
    return { year, value: 35 }
  }
  const yearNum = parseInt(year)
  let value = 50 + Math.random() * 30
  if (yearNum > 1995 && yearNum < 2002) {
    value = 80 + Math.random() * 20
  }
  if (yearNum > 2005) {
    value = 25 + Math.random() * 20
  }
  return { year, value: Math.min(value, 100) }
})

// FCF Margin data (Marge du Free Cash Flow)
export const fcfMarginData: ChartDataPoint[] = years.slice(3).map((year) => {
  if (year === "TTM") {
    return { year, value: 20 }
  }
  const yearNum = parseInt(year)
  let value = 5 + Math.random() * 10
  if (yearNum > 1995 && yearNum < 2005) {
    value = 20 + Math.random() * 12
  }
  if (yearNum > 2010) {
    value = 12 + Math.random() * 10
  }
  return { year, value: Math.min(value, 32) }
})

// Diluted shares outstanding
export const sharesData: ChartDataPoint[] = years.map((year, index) => {
  if (year === "TTM") {
    return { year, value: 580 }
  }
  const yearNum = parseInt(year)
  let value = 200 + index * 10 + Math.random() * 50
  if (yearNum > 2000) {
    value = 400 + Math.random() * 100
  }
  if (yearNum > 2015) {
    value = 600 + Math.random() * 150
  }
  if (yearNum > 2019) {
    value = 550 + Math.random() * 50
  }
  return { year, value }
})

// Dividends data
export const dividendsData: ChartDataPoint[] = [
  { year: "2013", value: 0.08 },
  { year: "2014", value: 0.08 },
  { year: "2015", value: 0.16 },
  { year: "2016", value: 0.16 },
  { year: "2017", value: 0.16 },
  { year: "2018", value: 0.16 },
  { year: "2019", value: 0.16 },
  { year: "2020", value: 0.16 },
  { year: "2021", value: 0.16 },
  { year: "2022", value: 0.16 },
  { year: "2023", value: 0.08 },
]

// Cash and Debt data
export const cashDebtData: ChartDataPoint[] = years.slice(10).map((year, index) => {
  if (year === "TTM") {
    return { year, value: 1.5, value2: 23 }
  }
  const yearNum = parseInt(year)
  let cash = 0.5 + Math.random() * 2
  let debt = 2 + index * 0.3 + Math.random() * 3
  if (yearNum > 2018) {
    debt = 18 + Math.random() * 8
    cash = 1 + Math.random() * 1.5
  }
  return { year, value: cash, value2: debt }
})

// Revenue segments
export const revenueSegments: RevenueSegment[] = [
  { name: "Processing And Services", value: 100, percentage: 100 },
]
