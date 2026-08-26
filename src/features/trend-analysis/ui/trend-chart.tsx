'use client'

import { Area, AreaChart, CartesianGrid, ReferenceDot, XAxis, YAxis } from 'recharts'

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import type { TrendData } from '@/shared/types/trends'

interface TrendChartProps {
  data: TrendData[]
  /** 기본값과 다른 조회 조건만 추려 받은 한 줄 요약 */
  conditionLabel?: string
}

const chartConfig = {
  ratio: { label: '검색 관심도', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig

/** "2026-08-14" → "08.14" */
function shortPeriod(period: string): string {
  return period.slice(5).replace('-', '.')
}

interface Summary {
  peak: TrendData
  average: number
  /** 초반 구간 평균 대비 후반 구간 평균의 변화율(%). 초반이 0이면 계산하지 않는다. */
  change: number | null
}

function summarize(data: TrendData[]): Summary {
  const peak = data.reduce((max, point) => (point.ratio > max.ratio ? point : max), data[0])
  const average = data.reduce((sum, point) => sum + point.ratio, 0) / data.length

  // 양 끝점만 비교하면 하루치 노이즈에 휘둘린다. 앞뒤 1/5 구간 평균을 견준다.
  const window = Math.max(1, Math.floor(data.length / 5))
  const headAverage = data.slice(0, window).reduce((sum, p) => sum + p.ratio, 0) / window
  const tailAverage = data.slice(-window).reduce((sum, p) => sum + p.ratio, 0) / window

  return {
    peak,
    average,
    change: headAverage > 0 ? ((tailAverage - headAverage) / headAverage) * 100 : null,
  }
}

function Stat({
  label,
  value,
  sub,
  tone = 'default',
}: {
  label: string
  value: string
  sub?: string
  tone?: 'default' | 'heat' | 'up' | 'down'
}) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd
        className={cn(
          'tabular mt-1 text-[26px] font-extrabold leading-none tracking-tight',
          tone === 'heat' && 'text-heat'
        )}
      >
        {value}
      </dd>
      {sub && <p className="mt-1 text-[12px] text-muted-foreground">{sub}</p>}
    </div>
  )
}

export function TrendChart({ data, conditionLabel }: TrendChartProps) {
  if (!data || data.length === 0) return null

  const { peak, average, change } = summarize(data)

  return (
    <section className="overflow-hidden rounded-xl border border-border/70 bg-card">
      <header className="border-b border-border/70 px-4 py-4 sm:px-5">
        <h2 className="text-[15px] font-bold tracking-tight">검색 관심도 추이</h2>
        <p className="mt-0.5 text-[12px] text-muted-foreground">
          {conditionLabel ?? '기간 내 최고 검색량을 100으로 둔 상대값입니다.'}
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Stat
            label="최고점"
            value={String(Math.round(peak.ratio))}
            sub={`${shortPeriod(peak.period)}`}
            tone="heat"
          />
          <Stat label="평균" value={average.toFixed(1)} sub="기간 전체" />
          {change !== null && (
            <Stat
              label="초반 대비 후반"
              value={`${change > 0 ? '+' : ''}${change.toFixed(0)}%`}
              sub="앞뒤 1/5 구간 평균"
            />
          )}
        </dl>
      </header>

      <div className="p-3 pt-5 sm:p-4 sm:pt-6">
        <ChartContainer config={chartConfig} className="h-[300px] w-full sm:h-[340px]">
          <AreaChart data={data} margin={{ left: 4, right: 12, top: 12 }}>
            <defs>
              <linearGradient id="trend-chart-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-ratio)" stopOpacity={0.32} />
                <stop offset="100%" stopColor="var(--color-ratio)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeOpacity={0.35} />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              minTickGap={28}
              tickFormatter={shortPeriod}
            />
            <YAxis width={30} tickLine={false} axisLine={false} domain={[0, 100]} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Area
              dataKey="ratio"
              type="monotone"
              stroke="var(--color-ratio)"
              strokeWidth={2}
              fill="url(#trend-chart-fill)"
            />
            {/* 위 '최고점' 숫자가 그래프 어디를 가리키는지 눈으로 잇는다 */}
            <ReferenceDot
              x={peak.period}
              y={peak.ratio}
              r={4}
              fill="var(--color-ratio)"
              stroke="hsl(var(--card))"
              strokeWidth={2}
              isFront
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </section>
  )
}
