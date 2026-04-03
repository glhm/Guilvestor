"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StockHeader } from "./stock-header"
import { QualityMetrics } from "./quality-metrics"
import { BarChartCard } from "./bar-chart-card"
import { LineChartCard } from "./line-chart-card"
import { PieChartCard } from "./pie-chart-card"
import {
  stockData,
  qualityMetrics,
  revenueData,
  revenueCAGR,
  fcfData,
  fcfCAGR,
  fcfPerShareData,
  fcfPerShareCAGR,
  superRoicData,
  grossMarginData,
  fcfMarginData,
  sharesData,
  dividendsData,
  cashDebtData,
  revenueSegments,
} from "@/lib/mock-data"

export function StockAnalysisPage() {
  return (
    <div className="min-h-screen bg-background">
      <StockHeader stock={stockData} />
      
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
              <QualityMetrics metrics={qualityMetrics} />
            </section>

            {/* Revenue Charts Row */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <BarChartCard
                title="Chiffre d'affaires"
                data={revenueData}
                cagr={revenueCAGR}
                color="#FB2C36"
                formatValue={(v) => `${v.toFixed(0)}B`}
              />
              <BarChartCard
                title="Free cash flow et SBC"
                data={fcfData}
                cagr={fcfCAGR}
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
                data={fcfPerShareData}
                cagr={fcfPerShareCAGR}
                color="#FB2C36"
                formatValue={(v) => `${v.toFixed(0)}`}
              />
            </section>

            {/* Line Charts Row */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <LineChartCard
                title="Super ROIC"
                data={superRoicData}
                color="#FB2C36"
                formatValue={(v) => `${v.toFixed(0)} %`}
              />
              <LineChartCard
                title="Marge brute"
                data={grossMarginData}
                color="#FB2C36"
                formatValue={(v) => `${v.toFixed(0)} %`}
              />
              <LineChartCard
                title="Marge du Free Cash Flow"
                data={fcfMarginData}
                color="#FB2C36"
                formatValue={(v) => `${v.toFixed(0)} %`}
              />
            </section>

            {/* Additional Charts Row */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <BarChartCard
                title="Actions en circulation diluées"
                data={sharesData}
                color="#FB2C36"
                formatValue={(v) => `${v.toFixed(0)}M`}
              />
              <BarChartCard
                title="Dividendes"
                data={dividendsData}
                color="#FB2C36"
                formatValue={(v) => `${v.toFixed(2)}`}
              />
              <BarChartCard
                title="Cash et dette"
                data={cashDebtData}
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
            <section className="mx-auto max-w-md">
              <PieChartCard
                title="Comment"
                companyName={`${stockData.name} gagne de l'argent`}
                data={revenueSegments}
              />
            </section>
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
