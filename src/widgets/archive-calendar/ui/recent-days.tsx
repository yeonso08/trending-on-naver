import Link from 'next/link'

import type { DailySummary } from '@/entities/trending/model/keyword-archive'
import { formatDuration } from '@/shared/lib/format'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

/** 최근 며칠의 기록. 날짜마다 그날 가장 오래 머문 검색어를 보여 줘 고르기 전에 내용을 짐작하게 한다. 오늘은 지금까지의 값이다. */
export function RecentDays({ days, today }: { days: DailySummary[]; today: string }) {
  return (
    <ol className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/70 bg-card">
      {days.map((summary) => {
        const [, month, day] = summary.date.split('-').map(Number)
        const weekday = WEEKDAYS[new Date(`${summary.date}T00:00:00Z`).getUTCDay()]
        const isToday = summary.date === today

        return (
          <li key={summary.date}>
            <Link
              href={`/daily/${summary.date}`}
              className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none sm:gap-5 sm:px-5"
            >
              <div className="w-12 shrink-0 text-center">
                <div className="text-[11px] font-medium text-muted-foreground">{month}월</div>
                <div className="text-2xl font-extrabold leading-tight tabular-nums">{day}</div>
                <div className="text-[11px] text-muted-foreground">{weekday}</div>
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[17px] font-bold group-hover:underline group-hover:underline-offset-4">
                  {summary.topKeyword}
                </p>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  <span className="font-semibold text-heat">
                    {formatDuration(summary.topMinutes)}
                  </span>
                  <span className="mx-1.5 text-border">|</span>
                  검색어 {summary.keywordCount}개
                </p>
              </div>

              {isToday && (
                <span className="shrink-0 rounded-md bg-heat-soft px-2 py-0.5 text-[12px] font-bold text-heat ring-1 ring-inset ring-heat-border">
                  집계 중
                </span>
              )}
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
