"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Tick02Icon, Cancel01Icon, InformationCircleIcon } from "@hugeicons/core-free-icons"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { QualityMetric } from "@/lib/types"

interface QualityMetricsProps {
  metrics: QualityMetric[]
}

export function QualityMetrics({ metrics }: QualityMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => (
        <MetricCard key={metric.id} metric={metric} />
      ))}
    </div>
  )
}

function MetricCard({ metric }: { metric: QualityMetric }) {
  // White background for positive, slightly gray for negative
  const bgColor = metric.isPositive 
    ? "bg-white" 
    : "bg-neutral-100"
  
  const borderColor = metric.isPositive
    ? "border-neutral-200"
    : "border-neutral-300"

  return (
    <Card className={`${bgColor} border ${borderColor} shadow-sm`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {metric.isPositive ? (
              <div className="flex h-5 w-5 items-center justify-center rounded" style={{ backgroundColor: '#FB2C36' }}>
                <HugeiconsIcon icon={Tick02Icon} className="h-3 w-3 text-white" />
              </div>
            ) : (
              <div className="flex h-5 w-5 items-center justify-center rounded bg-neutral-400">
                <HugeiconsIcon icon={Cancel01Icon} className="h-3 w-3 text-white" />
              </div>
            )}
            <span className="text-sm font-medium text-foreground">{metric.label}</span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground">
                  <HugeiconsIcon icon={InformationCircleIcon} className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{metric.threshold}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="mt-3">
          <span className="text-3xl font-bold text-foreground">
            {metric.id === "shares-outstanding" && metric.value > 0 ? "+" : ""}
            {metric.value.toFixed(2).replace(".", ",")}
            {metric.unit && ` ${metric.unit}`}
          </span>
          <span className="ml-1 text-xs text-muted-foreground">{metric.description}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{metric.threshold}</p>
      </CardContent>
    </Card>
  )
}
