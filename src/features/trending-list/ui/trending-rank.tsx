import { cn } from '@/lib/utils'

interface TrendingRankProps {
  rank: number
  className?: string
}

/**
 * 순위 숫자. 상위 3개만 강조색을 쓰고 나머지는 조용하게 둔다.
 * 자릿수가 바뀌어도 열이 흔들리지 않도록 tabular-nums.
 */
export function TrendingRank({ rank, className }: TrendingRankProps) {
  return (
    <span
      className={cn(
        'tabular w-7 shrink-0 text-center text-[19px] font-extrabold leading-none',
        rank <= 3 ? 'text-heat' : 'text-muted-foreground/70',
        className
      )}
    >
      {rank}
    </span>
  )
}
