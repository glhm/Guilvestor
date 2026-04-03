export interface StockData {
  ticker: string
  name: string
  exchange: string
  price: number
  currency: string
  marketCap: number
  marketCapUnit: string
}

export interface QualityMetric {
  id: string
  label: string
  value: number
  unit: string
  description: string
  threshold: string
  isPositive: boolean
}

export interface ChartDataPoint {
  year: string
  value: number
  value2?: number
}

export interface CAGRData {
  fiveYear: number
  tenYear: number
  twentyYear: number
}

export interface RevenueSegment {
  name: string
  value: number
  percentage: number
}
