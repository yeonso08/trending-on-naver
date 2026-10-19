'use client'

import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import { cn } from '@/lib/utils'
import { formatDateKey } from '@/shared/lib/format'
import { LinkPendingSpinner } from '@/shared/ui/link-pending-spinner'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

/** YYYY-MM ↔ 연·월. 월은 1부터. */
const toMonthKey = (year: number, month: number) => `${year}-${String(month).padStart(2, '0')}`
const parseMonthKey = (key: string) => key.split('-').map(Number) as [number, number]

function shiftMonth(key: string, delta: number): string {
  const [year, month] = parseMonthKey(key)
  const index = year * 12 + (month - 1) + delta
  return toMonthKey(Math.floor(index / 12), (index % 12) + 1)
}

/** 달력 칸. 앞쪽 빈칸은 null. 요일은 날짜만으로 정해지므로 UTC로 계산해도 KST와 같다. */
function buildCells(monthKey: string): (string | null)[] {
  const [year, month] = parseMonthKey(monthKey)
  const leading = new Date(Date.UTC(year, month - 1, 1)).getUTCDay()
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return [
    ...Array<null>(leading).fill(null),
    ...Array.from({ length: days }, (_, i) => `${monthKey}-${String(i + 1).padStart(2, '0')}`),
  ]
}

/**
 * 날짜 선택 달력. 화살표로 한 달씩 넘기고, 제목을 누르면 연도·월을 바로 고른다.
 * 기록이 있는 날만 링크다. 다른 달의 날짜는 사이트맵과 날짜 페이지의 이전·다음 링크로 크롤링된다.
 */
export function ArchiveCalendar({ dates, today }: { dates: string[]; today: string }) {
  const recorded = useMemo(() => new Set(dates), [dates])
  const recordedMonths = useMemo(() => new Set(dates.map((date) => date.slice(0, 7))), [dates])
  // dates는 최신순. 첫 기록 달부터 이번 달까지 오간다
  const firstMonth = (dates.at(-1) ?? today).slice(0, 7)
  const lastMonth = today.slice(0, 7)

  const [monthKey, setMonthKey] = useState((dates[0] ?? today).slice(0, 7))
  const [picking, setPicking] = useState(false)
  const [pickerYear, setPickerYear] = useState(() => parseMonthKey(monthKey)[0])

  const [year, month] = parseMonthKey(monthKey)
  const firstYear = parseMonthKey(firstMonth)[0]
  const lastYear = parseMonthKey(lastMonth)[0]

  const openPicker = () => {
    setPickerYear(year)
    setPicking(true)
  }

  const chooseMonth = (key: string) => {
    setMonthKey(key)
    setPicking(false)
  }

  return (
    <div className="rounded-xl border border-border/70 bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        {picking ? (
          <>
            <NavButton
              label="이전 해"
              disabled={pickerYear <= firstYear}
              onClick={() => setPickerYear((value) => value - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </NavButton>
            <button
              type="button"
              onClick={() => setPicking(false)}
              aria-expanded
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[15px] font-bold tabular-nums transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {pickerYear}년
              <ChevronDown className="h-3.5 w-3.5 rotate-180 text-muted-foreground" />
            </button>
            <NavButton
              label="다음 해"
              disabled={pickerYear >= lastYear}
              onClick={() => setPickerYear((value) => value + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </NavButton>
          </>
        ) : (
          <>
            <NavButton
              label="이전 달"
              disabled={monthKey <= firstMonth}
              onClick={() => setMonthKey((key) => shiftMonth(key, -1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </NavButton>
            <button
              type="button"
              onClick={openPicker}
              aria-expanded={false}
              aria-label={`${year}년 ${month}월, 연도와 월 고르기`}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[15px] font-bold tabular-nums transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {year}년 {month}월
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <NavButton
              label="다음 달"
              disabled={monthKey >= lastMonth}
              onClick={() => setMonthKey((key) => shiftMonth(key, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </NavButton>
          </>
        )}
      </div>

      {picking ? (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {MONTHS.map((value) => {
            const key = toMonthKey(pickerYear, value)
            const enabled = key >= firstMonth && key <= lastMonth
            const selected = key === monthKey
            return (
              <button
                key={key}
                type="button"
                disabled={!enabled}
                onClick={() => chooseMonth(key)}
                aria-pressed={selected}
                className={cn(
                  'h-11 rounded-lg text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:text-muted-foreground/35',
                  selected ? 'bg-foreground text-background' : 'enabled:hover:bg-muted',
                  enabled && !selected && !recordedMonths.has(key) && 'text-muted-foreground'
                )}
              >
                {value}월
              </button>
            )
          })}
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-7 gap-y-1 text-center">
          {WEEKDAYS.map((weekday) => (
            <span key={weekday} className="pb-1 text-[11px] font-medium text-muted-foreground">
              {weekday}
            </span>
          ))}
          {buildCells(monthKey).map((date, i) =>
            date ? (
              <DayCell key={date} date={date} today={today} recorded={recorded.has(date)} />
            ) : (
              <span key={`blank-${i}`} />
            )
          )}
        </div>
      )}
    </div>
  )
}

function NavButton({
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
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  )
}

function DayCell({ date, today, recorded }: { date: string; today: string; recorded: boolean }) {
  const day = Number(date.slice(8))
  const isToday = date === today
  const base =
    'relative mx-auto flex h-9 w-9 items-center justify-center rounded-full text-[13px] tabular-nums'

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
      <LinkPendingSpinner
        className={cn('absolute inset-0 rounded-full', isToday ? 'bg-heat' : 'bg-muted')}
      />
    </Link>
  )
}
