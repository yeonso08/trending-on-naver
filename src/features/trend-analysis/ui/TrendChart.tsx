'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import type { TrendData } from '@/shared/types/trends'

interface TrendChartProps {
  data: TrendData[]
}

const chartConfig = {
  ratio: { label: '검색 관심도', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig

export function TrendChart({ data }: TrendChartProps) {
  if (!data || data.length === 0) return null

  return (
    <section className="rounded-xl border border-border/70 bg-card">
      <header className="border-b border-border/70 px-5 py-3.5">
        <h2 className="text-[15px] font-bold tracking-tight">검색 관심도 추이</h2>
        <p className="mt-0.5 text-[12px] text-muted-foreground">
          기간 내 최고 검색량을 100으로 둔 상대값입니다.
        </p>
      </header>

      <div className="p-4 sm:p-5">
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <AreaChart data={data} margin={{ left: 4, right: 4, top: 8 }}>
            <defs>
              <linearGradient id="trend-chart-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-ratio)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-ratio)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeOpacity={0.4} />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={28}
              tickFormatter={(value: string) => value.slice(5).replace('-', '.')}
            />
            <YAxis width={32} tickLine={false} axisLine={false} domain={[0, 100]} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Area
              dataKey="ratio"
              type="monotone"
              stroke="var(--color-ratio)"
              strokeWidth={2}
              fill="url(#trend-chart-fill)"
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </section>
  )
}
