'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import type { TrendData } from '@/shared/types/trends'

const chartConfig = {
  ratio: { label: '검색 관심도', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig

interface KeywordTrendChartProps {
  /** 서버에서 이미 조회해 넘겨준 데이터. 이 컴포넌트는 직접 fetch하지 않는다. */
  data: TrendData[]
}

/**
 * 그리기만 담당하는 순수 표현 컴포넌트.
 * 'use client'는 recharts가 브라우저를 필요로 해서 붙어 있을 뿐,
 * 데이터 조회는 서버(`getKeywordTrend`)에서 캐시와 함께 끝난 상태다.
 */
export function KeywordTrendChart({ data }: KeywordTrendChartProps) {
  return (
    <section>
      <h2 className="text-[15px] font-bold tracking-tight">최근 30일 검색 관심도</h2>
      <p className="mt-1 text-[13px] text-muted-foreground">
        기간 내 최고 검색량을 100으로 둔 상대값입니다. 출처: 네이버 데이터랩
      </p>

      <div className="mt-3 rounded-xl border border-border/70 bg-card p-4">
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <AreaChart data={data} margin={{ left: 4, right: 4, top: 8 }}>
            <defs>
              <linearGradient id="keyword-trend-fill" x1="0" y1="0" x2="0" y2="1">
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
              fill="url(#keyword-trend-fill)"
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </section>
  )
}
