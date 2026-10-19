import type { Metadata } from 'next'

import { getDailySummaries, listArchiveDates } from '@/entities/trending/api/keyword-archive'
import { HISTORY_STARTED_ON } from '@/entities/trending/model/keyword-archive'
import { formatDateKey, toKstDateKey } from '@/shared/lib/format'
import { buildBreadcrumbSchema, buildGraph } from '@/shared/model/structured-data'
import { JsonLd } from '@/shared/ui/json-ld'
import { ArchiveCalendar } from '@/widgets/archive-calendar/ui/archive-calendar'
import { RecentDays } from '@/widgets/archive-calendar/ui/recent-days'
import { TrendingSidebarLayout } from '@/widgets/trending-searches/ui/trending-sidebar-layout'

/**
 * 사이드바의 실시간 순위 때문에 요청마다 렌더한다. ISR로 두면 재생성마다 ISR Writes가 쌓여
 * Hobby 한도를 넘긴다(2026-09-28). getTrendingSnapshot() 주석 참고.
 */
export const dynamic = 'force-dynamic'

/** 목록에 요약을 펼쳐 보이는 최근 날짜 수. 그 전 날짜는 달력에서 고른다. */
const RECENT_DAYS = 7

export const metadata: Metadata = {
  title: '날짜별 실시간 검색어 기록',
  description:
    '하루 동안 실시간 검색어 순위에 오른 키워드를 날짜별로 모았습니다. 최고 순위와 순위권에 머문 시간을 확인하세요.',
  alternates: { canonical: '/daily' },
}

export default async function DailyIndexPage() {
  const dates = await listArchiveDates()
  const today = toKstDateKey()
  // dates는 최신순
  const recent = dates.slice(0, RECENT_DAYS)
  const summaries = recent.length > 0 ? await getDailySummaries(recent.at(-1)!, recent[0]) : []

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <JsonLd data={buildGraph(buildBreadcrumbSchema([{ name: '날짜별 기록', path: '/daily' }]))} />

      <TrendingSidebarLayout>
        <h1 className="text-balance text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
          날짜별 검색어 기록
        </h1>
        <p className="mt-4 text-pretty text-[15px] leading-relaxed text-muted-foreground">
          키위는 1분마다 Google 트렌드 실시간 인기 검색어를 기록합니다. 날짜를 고르면 그날 순위에
          오른 검색어와 각 검색어가 순위권에 머문 시간을 볼 수 있습니다. 기록은{' '}
          {formatDateKey(HISTORY_STARTED_ON)}부터 쌓였습니다.
        </p>

        {dates.length === 0 ? (
          <p className="mt-10 rounded-xl border border-border/70 bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            아직 쌓인 기록이 없습니다. 잠시 후 다시 확인해 주세요.
          </p>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-[minmax(0,1fr)_280px] md:items-start">
            <section aria-labelledby="recent-days-title" className="order-2 md:order-1">
              <h2 id="recent-days-title" className="text-lg font-bold tracking-tight">
                최근 {summaries.length}일
              </h2>
              <p className="mb-3 mt-1 text-[13px] text-muted-foreground">
                날마다 가장 오래 순위권에 머문 검색어입니다.
              </p>
              <RecentDays days={summaries} today={today} />
            </section>

            <aside
              aria-label="날짜 선택"
              className="order-1 md:sticky md:top-20 md:order-2 md:mt-[3.75rem]"
            >
              <ArchiveCalendar dates={dates} today={today} />
              <p className="mt-2 px-1 text-[12px] text-muted-foreground">
                진하게 표시된 날짜에 기록이 있습니다.
              </p>
            </aside>
          </div>
        )}
      </TrendingSidebarLayout>
    </div>
  )
}
