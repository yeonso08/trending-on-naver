import { cn } from '@/lib/utils'

type AdFormat = 'leaderboard' | 'rectangle' | 'in-feed'

const FORMAT_STYLES: Record<AdFormat, string> = {
  /* 헤더 아래 / 푸터 위 가로 배너 */
  leaderboard: 'min-h-[90px] sm:min-h-[90px]',
  /* 사이드바 */
  rectangle: 'min-h-[250px]',
  /* 목록 사이에 끼워 넣는 네이티브형 */
  'in-feed': 'min-h-[120px]',
}

interface AdSlotProps {
  format: AdFormat
  className?: string
  /** 광고 스크립트를 붙이기 전 지면을 눈으로 확인할 때 사용 */
  debug?: boolean
}

/**
 * AdSense 지면 자리표시자.
 *
 * 아직 스크립트를 붙이지 않았지만, 승인 후 광고가 들어올 자리를 미리 확보해
 * 레이아웃 시프트(CLS)가 생기지 않게 한다. 실제 광고를 넣을 때는 이 컴포넌트
 * 내부만 교체하면 되고 페이지 레이아웃은 건드릴 필요가 없다.
 */
export function AdSlot({ format, className, debug = false }: AdSlotProps) {
  return (
    <aside
      aria-hidden="true"
      className={cn(
        'w-full overflow-hidden rounded-lg',
        FORMAT_STYLES[format],
        debug && 'grid place-items-center border border-dashed border-border bg-muted/40',
        className
      )}
    >
      {debug && (
        <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          AD · {format}
        </span>
      )}
    </aside>
  )
}
