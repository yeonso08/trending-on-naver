import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'

import { getDailyRanking, listArchiveDates } from '@/entities/trending/api/keyword-archive'
import type { DailyKeyword } from '@/entities/trending/model/keyword-archive'
import { TrendingRank } from '@/features/trending-list/ui/trending-rank'
import { formatDateKey, formatDuration, isValidDateKey, toKstDateKey } from '@/shared/lib/format'
import { buildBreadcrumbSchema, buildGraph } from '@/shared/model/structured-data'
import { AdSlot } from '@/shared/ui/ad-slot'
import { JsonLd } from '@/shared/ui/json-ld'
import { TrendingSidebarLayout } from '@/widgets/trending-searches/ui/trending-sidebar-layout'

interface DailyPageProps {
  params: Promise<{ date: string }>
}

/** 오늘 기록은 계속 늘어난다. 지난 날짜도 같은 주기로 두어도 DB 부담은 작다. */
export const revalidate = 600

/** 빌드 시점엔 만들지 않고 첫 요청 때 생성해 캐시한다 (ISR) */
export async function generateStaticParams() {
  return []
}

/** 목록만 두면 외부 데이터 나열에 그친다. 그날의 기록을 문장으로 요약해 앞에 둔다. */
function summarize(dateKey: string, keywords: DailyKeyword[]): string[] {
  const isToday = dateKey === toKstDateKey()
  const sentences = [
    `${formatDateKey(dateKey)}${isToday ? ' 지금까지' : ''} 키위가 기록한 실시간 검색어는 모두 ${keywords.length}개입니다.`,
  ]

  const longest = keywords.reduce((best, item) =>
    item.rankedMinutes > best.rankedMinutes ? item : best
  )
  sentences.push(
    `가장 오래 순위권에 머문 검색어는 ‘${longest.keyword}’(${formatDuration(longest.rankedMinutes)})입니다.`
  )

  const leaders = keywords.filter((item) => item.bestRank === 1).map((item) => `‘${item.keyword}’`)
  if (leaders.length === 1) {
    sentences.push(`1위에 오른 검색어는 ${leaders[0]}입니다.`)
  } else if (leaders.length > 1) {
    const shown = leaders.slice(0, 5).join(', ')
    sentences.push(
      `1위에 오른 검색어는 ${shown}${leaders.length > 5 ? ` 등 모두 ${leaders.length}개` : ''}입니다.`
    )
  }

  return sentences
}

export async function generateMetadata({ params }: DailyPageProps): Promise<Metadata> {
  const { date } = await params
  const keywords = isValidDateKey(date) ? await getDailyRanking(date) : []

  if (keywords.length === 0) {
    return { title: '기록이 없는 날짜', robots: { index: false, follow: false } }
  }

  const title = `${formatDateKey(date)} 실시간 검색어 기록`
  const description = summarize(date, keywords).join(' ')

  return {
    title,
    description,
    alternates: { canonical: `/daily/${date}` },
    openGraph: { title, description },
  }
}

export default async function DailyPage({ params }: DailyPageProps) {
  const { date } = await params
  if (!isValidDateKey(date)) notFound()

  const [keywords, dates] = await Promise.all([getDailyRanking(date), listArchiveDates()])
  if (keywords.length === 0) notFound()

  // dates는 최신순이다
  const index = dates.indexOf(date)
  const newer = index > 0 ? dates[index - 1] : undefined
  const older = index >= 0 && index < dates.length - 1 ? dates[index + 1] : undefined
  const isToday = date === toKstDateKey()
  const label = formatDateKey(date)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <JsonLd
        data={buildGraph(
          buildBreadcrumbSchema([
            { name: '날짜별 기록', path: '/daily' },
            { name: label, path: `/daily/${date}` },
          ])
        )}
      />

      <TrendingSidebarLayout>
        <Link
          href="/daily"
          className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          날짜별 기록
        </Link>

        <header className="mt-5">
          {isToday && (
            <span className="rounded-md bg-heat-soft px-2 py-0.5 text-[12px] font-bold text-heat ring-1 ring-inset ring-heat-border">
              오늘 · 집계 중
            </span>
          )}
          <h1 className="mt-3 text-balance text-[32px] font-extrabold leading-tight tracking-tight sm:text-4xl">
            {label} 실시간 검색어
          </h1>
          <p className="mt-4 text-pretty text-[15px] leading-relaxed text-muted-foreground">
            {summarize(date, keywords).join(' ')}
          </p>
        </header>

        <div className="mt-8">
          <AdSlot format="leaderboard" />
        </div>

        <section className="mt-8">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-[15px] font-bold tracking-tight">순위에 오른 검색어</h2>
            <span className="shrink-0 text-[11px] text-muted-foreground">
              숫자는 그날 최고 순위 · 옆은 순위권에 머문 시간
            </span>
          </div>

          <ol className="mt-3 divide-y divide-border/60 overflow-hidden rounded-xl border border-border/70 bg-card">
            {keywords.map((item) => (
              <li key={item.keyword}>
                <Link
                  href={`/keyword/${encodeURIComponent(item.keyword)}`}
                  className="group flex items-center gap-3.5 px-3 py-3 transition-colors hover:bg-muted/60 sm:gap-4 sm:px-4"
                >
                  <TrendingRank rank={item.bestRank} />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <h3 className="truncate text-[15px] font-semibold tracking-tight group-hover:text-heat">
                        {item.keyword}
                      </h3>
                      <span className="tabular shrink-0 text-[11px] font-medium text-muted-foreground">
                        {formatDuration(item.rankedMinutes)}
                      </span>
                    </div>

                    {item.headline && (
                      <p className="mt-1 truncate text-[13px] text-muted-foreground">
                        {item.headline.title}
                        {item.headline.source && (
                          <span className="text-muted-foreground/60">
                            {' '}
                            · {item.headline.source}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ol>

          <p className="mt-2 text-[11px] text-muted-foreground">
            키위가 1분마다 수집한 Google 트렌드 실시간 인기 검색어 기준입니다.
          </p>
        </section>

        <nav className="mt-8 flex items-center justify-between gap-4 text-[13px]">
          {older ? (
            <Link
              href={`/daily/${older}`}
              className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              {formatDateKey(older, { withYear: false })}
            </Link>
          ) : (
            <span />
          )}
          {newer && (
            <Link
              href={`/daily/${newer}`}
              className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              {formatDateKey(newer, { withYear: false })}
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </nav>
      </TrendingSidebarLayout>
    </div>
  )
}
