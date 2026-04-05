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
  value: number | null
  unit: string
  description: string
  threshold: string
  isPositive: boolean
  status?: 'success' | 'warning' | 'error' | 'neutral'
}

export interface ChartDataPoint {
  year: string
  value: number
  value2?: number
}

export interface CAGRData {
  years?: number
  value?: number
  label?: string
  fiveYear?: number
  tenYear?: number
  twentyYear?: number
}

export interface RevenueSegment {
  name: string
  value: number
  percentage: number
}
