'use client'

import { XAxis, CartesianGrid, AreaChart, Area } from 'recharts'
import { TrendData } from '@/shared/types/trends'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { format } from 'date-fns'

interface TrendChartProps {
  data: TrendData[]
}

const chartConfig = {
  ratio: {
    label: 'ratio',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig

export function TrendChart({ data }: TrendChartProps) {
  console.log('TrendChart data:', data)

  if (!data || data.length === 0) {
    return <div>No data available</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>트렌드 분석 결과</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => format(value, 'MM.dd')}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Area
              dataKey="ratio"
              type="natural"
              fill="var(--color-ratio)"
              fillOpacity={0.4}
              stroke="var(--color-ratio)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
