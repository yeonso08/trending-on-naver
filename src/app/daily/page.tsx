import type { Metadata } from 'next'
import Link from 'next/link'

import { listArchiveDates } from '@/entities/trending/api/keyword-archive'
import { HISTORY_STARTED_ON } from '@/entities/trending/model/keyword-archive'
import { formatDateKey, toKstDateKey } from '@/shared/lib/format'
import { buildBreadcrumbSchema, buildGraph } from '@/shared/model/structured-data'
import { JsonLd } from '@/shared/ui/json-ld'

/** 오늘 날짜가 새로 생기는 걸 반영하는 주기 */
export const revalidate = 600

export const metadata: Metadata = {
  title: '날짜별 실시간 검색어 기록',
  description:
    '하루 동안 실시간 검색어 순위에 오른 키워드를 날짜별로 모았습니다. 최고 순위와 순위권에 머문 시간을 확인하세요.',
  alternates: { canonical: '/daily' },
}

export default async function DailyIndexPage() {
  const dates = await listArchiveDates()
  const today = toKstDateKey()

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <JsonLd data={buildGraph(buildBreadcrumbSchema([{ name: '날짜별 기록', path: '/daily' }]))} />

      <h1 className="text-balance text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
        날짜별 검색어 기록
      </h1>
      <p className="mt-4 text-pretty text-[15px] leading-relaxed text-muted-foreground">
        키위는 1분마다 Google 트렌드 실시간 인기 검색어를 기록합니다. 날짜를 고르면 그날 순위에 오른
        검색어와 각 검색어가 순위권에 머문 시간을 볼 수 있습니다. 기록은{' '}
        {formatDateKey(HISTORY_STARTED_ON)}부터 쌓였습니다.
      </p>

      {dates.length === 0 ? (
        <p className="mt-10 rounded-xl border border-border/70 bg-card px-4 py-10 text-center text-sm text-muted-foreground">
          아직 쌓인 기록이 없습니다. 잠시 후 다시 확인해 주세요.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-border/60 overflow-hidden rounded-xl border border-border/70 bg-card">
          {dates.map((date) => (
            <li key={date}>
              <Link
                href={`/daily/${date}`}
                className="flex items-center justify-between gap-3 px-4 py-3.5 text-[15px] font-medium transition-colors hover:bg-muted/60"
              >
                <span>{formatDateKey(date)}</span>
                {date === today && (
                  <span className="shrink-0 text-[12px] font-semibold text-heat">
                    오늘 · 집계 중
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
