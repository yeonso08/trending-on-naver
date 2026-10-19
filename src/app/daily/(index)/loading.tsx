import { Skeleton } from '@/components/ui/skeleton'

/**
 * 날짜 상세(/daily/[date])에서 목록으로 돌아올 때의 뼈대. 목록 페이지를 (index) 그룹에 둔 이유다 —
 * daily 폴더 바로 아래 loading.tsx는 공통 세그먼트라 이 이동에서 다시 보이지 않는다. 실제 페이지와 같은 틀이다.
 */
export default function DailyIndexLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12" aria-busy="true">
      <span className="sr-only">기록을 불러오는 중</span>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="min-w-0">
          <Skeleton className="h-9 w-64 sm:h-10" />
          <div className="mt-5 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-[minmax(0,1fr)_280px] md:items-start">
            <div className="order-2 md:order-1">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="mb-3 mt-2 h-4 w-56" />
              <div className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/70 bg-card">
                {Array.from({ length: 7 }, (_, i) => (
                  <div key={i} className="flex items-center gap-4 px-4 py-4 sm:gap-5 sm:px-5">
                    <Skeleton className="h-14 w-12 shrink-0" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-3.5 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Skeleton className="order-1 h-[330px] w-full rounded-xl md:order-2 md:mt-[3.75rem]" />
          </div>
        </div>

        <Skeleton className="h-[640px] w-full rounded-xl" />
      </div>
    </div>
  )
}
