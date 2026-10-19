'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import { cn } from '@/lib/utils'
import { formatDateKey } from '@/shared/lib/format'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

/** 달력 칸. 앞쪽 빈칸은 null. 요일은 날짜만으로 정해지므로 UTC로 계산해도 KST와 같다. */
function buildCells(monthKey: string): (string | null)[] {
  const [year, month] = monthKey.split('-').map(Number)
  const leading = new Date(Date.UTC(year, month - 1, 1)).getUTCDay()
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return [
    ...Array<null>(leading).fill(null),
    ...Array.from({ length: days }, (_, i) => `${monthKey}-${String(i + 1).padStart(2, '0')}`),
  ]
}

/**
 * 한 달씩 넘겨 보는 날짜 선택 달력. 기록이 있는 날만 링크다.
 * 다른 달의 날짜는 사이트맵과 날짜 페이지의 이전·다음 링크로 크롤링된다.
 */
export function ArchiveCalendar({ dates, today }: { dates: string[]; today: string }) {
  const recorded = useMemo(() => new Set(dates), [dates])
  // dates는 최신순. 기록이 있는 달만 오간다
  const months = useMemo(() => [...new Set(dates.map((date) => date.slice(0, 7)))], [dates])
  const [index, setIndex] = useState(0)

  const monthKey = months[index]
  if (!monthKey) return null

  const [year, month] = monthKey.split('-').map(Number)
  const cells = buildCells(monthKey)
  const older = index < months.length - 1
  const newer = index > 0

  return (
    <div className="rounded-xl border border-border/70 bg-card p-4">
      <div className="flex items-center justify-between">
        <MonthButton
          label="이전 달"
          disabled={!older}
          onClick={() => setIndex((value) => value + 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </MonthButton>
        <h2 className="text-[15px] font-bold tabular-nums" aria-live="polite">
          {year}년 {month}월
        </h2>
        <MonthButton
          label="다음 달"
          disabled={!newer}
          onClick={() => setIndex((value) => value - 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </MonthButton>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAYS.map((weekday) => (
          <span key={weekday} className="pb-1 text-[11px] font-medium text-muted-foreground">
            {weekday}
          </span>
        ))}
        {cells.map((date, i) =>
          date ? (
            <DayCell key={date} date={date} today={today} recorded={recorded.has(date)} />
          ) : (
            <span key={`blank-${i}`} />
          )
        )}
      </div>
    </div>
  )
}

function MonthButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  )
}

function DayCell({ date, today, recorded }: { date: string; today: string; recorded: boolean }) {
  const day = Number(date.slice(8))
  const isToday = date === today
  const base =
    'mx-auto flex h-9 w-9 items-center justify-center rounded-full text-[13px] tabular-nums'

  if (!recorded) {
    return <span className={cn(base, 'text-muted-foreground/35')}>{day}</span>
  }

  return (
    <Link
      href={`/daily/${date}`}
      aria-label={`${formatDateKey(date)}${isToday ? ' (오늘, 집계 중)' : ''} 기록 보기`}
      className={cn(
        base,
        'font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isToday ? 'bg-heat font-bold text-white hover:bg-heat/85' : 'text-foreground hover:bg-muted'
      )}
    >
      {day}
    </Link>
  )
}
