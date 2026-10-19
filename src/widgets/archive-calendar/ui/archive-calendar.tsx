import Link from 'next/link'

import { cn } from '@/lib/utils'
import { formatDateKey } from '@/shared/lib/format'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

interface MonthGroup {
  /** YYYY-MM */
  key: string
  year: number
  month: number
  dates: Set<string>
}

/** 최신 달이 먼저 오도록 YYYY-MM으로 묶는다. dates는 이미 내림차순이다. */
function groupByMonth(dates: string[]): MonthGroup[] {
  const groups: MonthGroup[] = []
  for (const date of dates) {
    const key = date.slice(0, 7)
    let group = groups.at(-1)
    if (group?.key !== key) {
      const [year, month] = key.split('-').map(Number)
      group = { key, year, month, dates: new Set() }
      groups.push(group)
    }
    group.dates.add(date)
  }
  return groups
}

/** 달력 칸. 앞쪽 빈칸은 null. 요일은 날짜만으로 정해지므로 UTC로 계산해도 KST와 같다. */
function buildCells({ year, month }: MonthGroup): (string | null)[] {
  const leading = new Date(Date.UTC(year, month - 1, 1)).getUTCDay()
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const prefix = `${year}-${String(month).padStart(2, '0')}-`
  return [
    ...Array<null>(leading).fill(null),
    ...Array.from({ length: days }, (_, i) => prefix + String(i + 1).padStart(2, '0')),
  ]
}

/**
 * 날짜별 기록 달력. 서버에서 그려 모든 날짜가 크롤러가 따라갈 수 있는 평범한 링크로 남는다.
 * 기록이 있는 날만 링크이고, 오늘은 집계 중이라 데이터색(--heat)으로 표시한다.
 */
export function ArchiveCalendar({ dates, today }: { dates: string[]; today: string }) {
  const months = groupByMonth(dates)

  return (
    <div className="mt-8">
      {months.length > 1 && (
        <nav aria-label="달 바로가기" className="flex flex-wrap gap-2">
          {months.map((group) => (
            <a
              key={group.key}
              href={`#${group.key}`}
              className="rounded-full border border-border/70 bg-card px-3 py-1 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              {group.year}년 {group.month}월
            </a>
          ))}
        </nav>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {months.map((group) => {
          const cells = buildCells(group)
          const weeks = Array.from({ length: Math.ceil(cells.length / 7) }, (_, i) =>
            cells.slice(i * 7, i * 7 + 7)
          )

          return (
            <section
              key={group.key}
              id={group.key}
              aria-labelledby={`${group.key}-title`}
              className="scroll-mt-24 rounded-xl border border-border/70 bg-card p-4 sm:p-5"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 id={`${group.key}-title`} className="text-lg font-bold tracking-tight">
                  {group.year}년 {group.month}월
                </h2>
                <span className="text-[12px] text-muted-foreground">기록 {group.dates.size}일</span>
              </div>

              <table className="mt-4 w-full table-fixed border-separate border-spacing-1">
                <thead>
                  <tr>
                    {WEEKDAYS.map((weekday) => (
                      <th
                        key={weekday}
                        scope="col"
                        className="pb-1 text-[12px] font-medium text-muted-foreground"
                      >
                        {weekday}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {weeks.map((week, i) => (
                    <tr key={i}>
                      {week.map((date, j) => (
                        <td key={date ?? `blank-${j}`} className="p-0">
                          {date && (
                            <DayCell date={date} today={today} recorded={group.dates.has(date)} />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function DayCell({ date, today, recorded }: { date: string; today: string; recorded: boolean }) {
  const day = Number(date.slice(8))
  const isToday = date === today
  const base =
    'flex h-10 w-full flex-col items-center justify-center rounded-md text-[14px] sm:h-11'

  if (!recorded) {
    return (
      <span className={cn(base, 'text-muted-foreground/35')} aria-hidden="true">
        {day}
      </span>
    )
  }

  return (
    <Link
      href={`/daily/${date}`}
      aria-label={`${formatDateKey(date)}${isToday ? ' (오늘, 집계 중)' : ''} 검색어 기록`}
      className={cn(
        base,
        'font-semibold transition-colors',
        isToday
          ? 'bg-heat-soft text-heat ring-1 ring-inset ring-heat-border hover:bg-heat-soft/70'
          : 'bg-muted text-foreground ring-1 ring-inset ring-border hover:bg-foreground hover:text-background'
      )}
    >
      {day}
      {isToday && <span className="text-[10px] font-bold leading-none">오늘</span>}
    </Link>
  )
}
