import type { ComponentProps } from 'react'

import { ChartTooltipContent } from '@/components/ui/chart'

type TooltipFormatter = NonNullable<ComponentProps<typeof ChartTooltipContent>['formatter']>

/**
 * 검색 관심도 차트 툴팁 포맷터.
 *
 * 기본 ChartTooltipContent는 라벨과 값 사이에 여백을 넣어 주지 않는 데다
 * ratio 원값을 그대로 찍어 "검색 관심도27.273"처럼 보인다. 지표 카드와 같은
 * 소수점 1자리(toFixed(1))로 맞추고 라벨·값 사이 간격을 명시한다.
 */
export const ratioTooltipFormatter: TooltipFormatter = (value, _name, item) => (
  <>
    <div className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color }} />
    <div className="flex flex-1 items-center justify-between gap-3 leading-none">
      <span className="text-muted-foreground">검색 관심도</span>
      <span className="font-mono font-medium tabular-nums text-foreground">
        {Number(value).toFixed(1)}
      </span>
    </div>
  </>
)
