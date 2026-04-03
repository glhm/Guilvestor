"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { RevenueSegment } from "@/lib/types"

interface PieChartCardProps {
  title: string
  data: RevenueSegment[]
  companyName?: string
}

const COLORS = ["#FB2C36", "#fc5960", "#fc8b8f", "#fdbdbf"]

export function PieChartCard({ title, data, companyName }: PieChartCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-center text-lg font-bold">
          {title}
          {companyName && <span className="font-normal"> {companyName}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={100}
                fill="#8884d8"
                dataKey="percentage"
                nameKey="name"
                label={({ percentage }) => `${percentage}%`}
                labelLine={false}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg bg-popover px-3 py-2 text-sm shadow-lg ring-1 ring-border">
                        <p className="font-semibold">{payload[0].name}</p>
                        <p className="text-muted-foreground">{payload[0].value}%</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          {data.map((segment, index) => (
            <div key={segment.name} className="flex items-center gap-2 text-sm">
              <div 
                className="h-3 w-3 rounded-sm" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }} 
              />
              <span className="text-muted-foreground">{segment.name}</span>
              <span className="ml-auto font-medium">{segment.percentage}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
