"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ChartDataPoint, CAGRData } from "@/lib/types/fmp"

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
  // Show last 5 years only
  const sampledData = data.slice(-5)
  
  // Check if we have valid data
  const hasValidData = sampledData.some(d => (d as any)[dataKey] > 0 || (dataKey2 && (d as any)[dataKey2] > 0))

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
          {!hasValidData ? (
            <div className="h-full flex items-center justify-center border border-dashed border-gray-300 rounded">
              <span className="text-gray-400 text-sm">N/A</span>
            </div>
          ) : (
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
                          {payload.map((entry, index) => {
                            const value = entry.value as number | null | null
                            return (
                              <p key={index} className="text-muted-foreground">
                                {entry.name}: {value === null || value === 0 ? 'N/A' : formatValue(value)}
                              </p>
                            )
                          })}
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
                >
                  {sampledData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={(entry as any)[dataKey] > 0 ? color : 'transparent'} 
                    />
                  ))}
                </Bar>
                {dataKey2 && (
                  <Bar 
                    dataKey={dataKey2} 
                    fill={color2} 
                    radius={[4, 4, 0, 0]}
                    name={legendLabel2 || dataKey2}
                  >
                    {sampledData.map((entry, index) => (
                      <Cell 
                        key={`cell2-${index}`} 
                        fill={(entry as any)[dataKey2] > 0 ? color2 : 'transparent'} 
                      />
                    ))}
                  </Bar>
                )}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        {cagr && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">CAGR</span>
            {cagr.value !== undefined && cagr.value !== 0 ? (
              <span className="font-medium text-red-500">
                {cagr.years || '?'}y: {cagr.value.toFixed(2)} %
              </span>
            ) : (
              <span className="font-medium text-gray-400">N/A</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
