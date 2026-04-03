"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ChartDataPoint, CAGRData } from "@/lib/types"

interface BarChartCardProps {
  title: string
  data: ChartDataPoint[]
  cagr?: CAGRData
  dataKey?: string
  dataKey2?: string
  legendLabel?: string
  legendLabel2?: string
  color?: string
  color2?: string
  formatValue?: (value: number) => string
}

export function BarChartCard({
  title,
  data,
  cagr,
  dataKey = "value",
  dataKey2,
  legendLabel,
  legendLabel2,
  color = "hsl(var(--chart-1))",
  color2 = "hsl(var(--chart-2))",
  formatValue = (v) => `${v.toFixed(1)}B`,
}: BarChartCardProps) {
  // Sample data to show every 2nd year for readability
  const sampledData = data.filter((_, i) => i % 2 === 0 || i === data.length - 1)

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardAction>
          <Select defaultValue="all">
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Depuis toujours</SelectItem>
              <SelectItem value="10y">10 ans</SelectItem>
              <SelectItem value="5y">5 ans</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="pt-0">
        {legendLabel && (
          <div className="mb-2 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} />
              <span className="text-muted-foreground">{legendLabel}</span>
            </div>
            {legendLabel2 && (
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color2 }} />
                <span className="text-muted-foreground">{legendLabel2}</span>
              </div>
            )}
          </div>
        )}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sampledData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
              <XAxis 
                dataKey="year" 
                tick={{ fontSize: 10 }} 
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                className="fill-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 10 }} 
                tickLine={false}
                axisLine={false}
                tickFormatter={formatValue}
                className="fill-muted-foreground"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg bg-popover px-3 py-2 text-sm shadow-lg ring-1 ring-border">
                        <p className="font-semibold">{label}</p>
                        {payload.map((entry, index) => (
                          <p key={index} className="text-muted-foreground">
                            {entry.name}: {formatValue(entry.value as number)}
                          </p>
                        ))}
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar 
                dataKey={dataKey} 
                fill={color} 
                radius={[4, 4, 0, 0]}
                name={legendLabel || dataKey}
              />
              {dataKey2 && (
                <Bar 
                  dataKey={dataKey2} 
                  fill={color2} 
                  radius={[4, 4, 0, 0]}
                  name={legendLabel2 || dataKey2}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
        {cagr && (
          <div className="mt-2 flex items-center gap-4 text-xs">
            <span className="text-muted-foreground">CAGR</span>
            <span className="font-medium text-red-500">5Y: {cagr.fiveYear.toFixed(2)} %</span>
            <span className="font-medium text-red-600">10Y: {cagr.tenYear.toFixed(2)} %</span>
            <span className="font-medium text-red-700">20Y: {cagr.twentyYear.toFixed(2)} %</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
