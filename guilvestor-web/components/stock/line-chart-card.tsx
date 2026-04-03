"use client"

import { Area, AreaChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ChartDataPoint } from "@/lib/types"

interface LineChartCardProps {
  title: string
  data: ChartDataPoint[]
  dataKey?: string
  color?: string
  formatValue?: (value: number) => string
}

export function LineChartCard({
  title,
  data,
  dataKey = "value",
  color = "hsl(217, 91%, 60%)",
  formatValue = (v) => `${v.toFixed(0)} %`,
}: LineChartCardProps) {
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
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sampledData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id={`gradient-${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.05} />
                </linearGradient>
              </defs>
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
                        <p className="text-muted-foreground">
                          {formatValue(payload[0].value as number)}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color} 
                strokeWidth={2}
                fill={`url(#gradient-${title.replace(/\s/g, '')})`}
                dot={{ r: 2, fill: color, stroke: color }}
                activeDot={{ r: 4, fill: color }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
