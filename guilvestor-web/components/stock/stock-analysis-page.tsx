"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StockHeader } from "./stock-header"
import { QualityMetrics } from "./quality-metrics"
import { BarChartCard } from "./bar-chart-card"
import { LineChartCard } from "./line-chart-card"
import { PieChartCard } from "./pie-chart-card"
import { fetchStockData } from "@/lib/api-client"
import type { CompleteStockData, QualityMetric } from "@/lib/types/fmp"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// Default ticker if none provided
const DEFAULT_TICKER = "AAPL"

export function StockAnalysisPage() {
  const params = useParams()
  const ticker = (params?.ticker as string) || DEFAULT_TICKER
  
  const [data, setData] = useState<CompleteStockData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)
        const stockData = await fetchStockData(ticker.toUpperCase())
        setData(stockData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load stock data")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [ticker])

  // Transform QualityMetric from FMP to the format expected by component
  const transformMetrics = (metrics: QualityMetric[]) => {
    return metrics.map(m => ({
      id: m.id,
      label: m.label,
      value: m.value,
      unit: m.unit,
      description: m.description,
      threshold: m.threshold,
      isPositive: m.isPositive,
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-white px-6 py-4">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="mx-auto max-w-7xl px-6 py-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Alert>
          <AlertDescription>No data available</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Format stock data for StockHeader
  const stockHeaderData = {
    ticker: data.profile.ticker,
    name: data.profile.name,
    exchange: data.profile.exchange || "NASDAQ",
    price: data.profile.price,
    currency: data.profile.currency,
    marketCap: parseFloat(data.profile.marketCap >= 1000000000 
      ? (data.profile.marketCap / 1000000000).toFixed(1)
      : (data.profile.marketCap / 1000000).toFixed(1)),
    marketCapUnit: data.profile.marketCap >= 1000000000 ? "Md $" : "M$"
  }

  return (
    <div className="min-h-screen bg-background">
      <StockHeader stock={stockHeaderData} />
      
      <Tabs defaultValue="qualite" className="w-full">
        {/* Tabs Navigation - White background */}
        <div className="bg-white border-b border-border">
          <div className="mx-auto max-w-7xl px-6">
            <TabsList variant="line" className="w-full justify-start bg-transparent">
              <TabsTrigger 
                value="qualite" 
                className="text-muted-foreground data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none rounded-none px-4 pb-3"
              >
                Qualité
              </TabsTrigger>
              <TabsTrigger 
                value="valorisation"
                className="text-muted-foreground data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none rounded-none px-4 pb-3"
              >
                Valorisation
              </TabsTrigger>
              <TabsTrigger 
                value="transcripts"
                className="text-muted-foreground data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none rounded-none px-4 pb-3"
              >
                Transcripts
              </TabsTrigger>
              <TabsTrigger 
                value="bilan"
                className="text-muted-foreground data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none rounded-none px-4 pb-3"
              >
                Bilan
              </TabsTrigger>
              <TabsTrigger 
                value="compte-resultat"
                className="text-muted-foreground data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none rounded-none px-4 pb-3"
              >
                Compte de résultat
              </TabsTrigger>
              <TabsTrigger 
                value="flux-tresorerie"
                className="text-muted-foreground data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none rounded-none px-4 pb-3"
              >
                Flux de trésorerie
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Tab Content */}
        <main className="mx-auto max-w-7xl px-6 py-6">
          <TabsContent value="qualite" className="space-y-8 mt-0">
            {/* Quality Metrics Cards */}
            <section>
              <QualityMetrics metrics={transformMetrics(data.metrics)} />
            </section>

            {/* Revenue Charts Row */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <BarChartCard
                title="Chiffre d'affaires"
                data={data.charts.revenue}
                cagr={{
                  fiveYear: data.cagrData.revenue.fiveYear,
                  tenYear: data.cagrData.revenue.tenYear,
                  twentyYear: 0
                }}
                color="#FB2C36"
                formatValue={(v) => `${v.toFixed(0)}B`}
              />
              <BarChartCard
                title="Free cash flow et SBC"
                data={data.charts.fcf}
                cagr={{
                  fiveYear: data.cagrData.fcf.fiveYear,
                  tenYear: data.cagrData.fcf.tenYear,
                  twentyYear: 0
                }}
                dataKey="value"
                dataKey2="value2"
                legendLabel="Free cash flow"
                legendLabel2="SBC"
                color="#FB2C36"
                color2="#fc8b8f"
                formatValue={(v) => `${v.toFixed(1)}B`}
              />
              <BarChartCard
                title="Free Cash Flow par action"
                data={data.charts.fcfPerShare}
                cagr={{
                  fiveYear: data.cagrData.fcfPerShare.fiveYear,
                  tenYear: data.cagrData.fcfPerShare.tenYear,
                  twentyYear: 0
                }}
                color="#FB2C36"
                formatValue={(v) => `${v.toFixed(0)}`}
              />
            </section>

            {/* Line Charts Row */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <LineChartCard
                title="Super ROIC"
                data={data.charts.roic}
                color="#FB2C36"
                formatValue={(v) => `${v.toFixed(0)} %`}
              />
              <LineChartCard
                title="Marge brute"
                data={data.charts.grossMargin}
                color="#FB2C36"
                formatValue={(v) => `${v.toFixed(0)} %`}
              />
              <LineChartCard
                title="Marge du Free Cash Flow"
                data={data.charts.fcfMargin}
                color="#FB2C36"
                formatValue={(v) => `${v.toFixed(0)} %`}
              />
            </section>

            {/* Additional Charts Row */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <BarChartCard
                title="Actions en circulation diluées"
                data={data.charts.sharesOutstanding}
                color="#FB2C36"
                formatValue={(v) => `${v.toFixed(0)}M`}
              />
              <BarChartCard
                title="Dividendes"
                data={data.charts.dividends.length > 0 ? data.charts.dividends : [{ year: "N/A", value: 0 }]}
                color="#FB2C36"
                formatValue={(v) => `${v.toFixed(2)}`}
              />
              <BarChartCard
                title="Cash et dette"
                data={data.charts.cashAndDebt}
                dataKey="value"
                dataKey2="value2"
                legendLabel="Cash"
                legendLabel2="Dette"
                color="#FB2C36"
                color2="#fc8b8f"
                formatValue={(v) => `${v.toFixed(0)}B`}
              />
            </section>

            {/* Revenue Breakdown */}
            {data.revenueSegments && data.revenueSegments.length > 0 && (
              <section className="mx-auto max-w-md">
                <PieChartCard
                  title="Comment"
                  companyName={`${data.profile.name} gagne de l'argent`}
                  data={data.revenueSegments}
                />
              </section>
            )}
          </TabsContent>

          <TabsContent value="valorisation" className="mt-0">
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              Section Valorisation - Coming soon
            </div>
          </TabsContent>

          <TabsContent value="transcripts" className="mt-0">
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              Section Transcripts - Coming soon
            </div>
          </TabsContent>

          <TabsContent value="bilan" className="mt-0">
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              Section Bilan - Coming soon
            </div>
          </TabsContent>

          <TabsContent value="compte-resultat" className="mt-0">
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              Section Compte de résultat - Coming soon
            </div>
          </TabsContent>

          <TabsContent value="flux-tresorerie" className="mt-0">
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              Section Flux de trésorerie - Coming soon
            </div>
          </TabsContent>
        </main>
      </Tabs>
    </div>
  )
}
