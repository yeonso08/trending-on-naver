import { Skeleton } from '@/components/ui/skeleton'
import { ADSENSE_ENABLED, ADSENSE_SLOTS } from '@/shared/config/adsense'

/**
 * 날짜 상세는 요청마다 DB를 읽어 응답이 늦다. 루트 loading.tsx는 /daily → /daily/[date] 이동에서
 * 다시 보이지 않으므로(공통 세그먼트가 유지됨) 이 경로 전용 뼈대를 둔다. 실제 페이지와 같은 틀이다.
 */
export default function DailyLoading() {
  const hasLeaderboardAd = ADSENSE_ENABLED && Boolean(ADSENSE_SLOTS.leaderboard)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10" aria-busy="true">
      <span className="sr-only">기록을 불러오는 중</span>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="min-w-0">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-8 h-10 w-4/5 sm:h-11" />
          <div className="mt-5 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          {hasLeaderboardAd && <Skeleton className="mt-8 h-[90px] w-full rounded-xl" />}

          <Skeleton className="mt-8 h-4 w-32" />
          <div className="mt-3 divide-y divide-border/60 overflow-hidden rounded-xl border border-border/70 bg-card">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="flex items-center gap-3.5 px-3 py-3 sm:gap-4 sm:px-4">
                <Skeleton className="h-6 w-6 shrink-0" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Skeleton className="h-[640px] w-full rounded-xl" />
      </div>
    </div>
  )
}
