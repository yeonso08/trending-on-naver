'use client'

import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { CalendarIcon, ChevronDown, Search } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import {
  AGE_TYPE_KO,
  DEVICE_TYPE_KO,
  GENDER_TYPE_KO,
  TIME_UNIT_KO,
  type AgeType,
  type DeviceType,
  type GenderType,
  type KeywordGroup,
  type SearchParams,
  type TimeUnitType,
} from '@/shared/types/trends'

const ALL_AGE_VALUES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'] as const

/** 달력을 두 번 여는 대신 대부분의 질문을 한 번에 끝내는 기간 프리셋 */
const RANGE_PRESETS = [
  { days: 7, label: '7일' },
  { days: 30, label: '30일' },
  { days: 90, label: '3개월' },
  { days: 365, label: '1년' },
] as const

const formSchema = z
  .object({
    keywords: z.string().min(1, { message: '검색어를 입력해 주세요.' }),
    startDate: z.date({ required_error: '시작일을 선택해 주세요.' }),
    endDate: z.date({ required_error: '종료일을 선택해 주세요.' }),
    timeUnit: z.custom<TimeUnitType>(),
    device: z.custom<DeviceType>(),
    gender: z.custom<GenderType>(),
    ages: z.array(z.custom<AgeType>()).min(1, { message: '연령대를 하나 이상 선택해 주세요.' }),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: '종료일은 시작일보다 빠를 수 없습니다.',
    path: ['endDate'],
  })

type FormValues = z.infer<typeof formSchema>

function rangeFromDays(days: number) {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  return { startDate, endDate }
}

function Pill({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        selected
          ? 'border-heat-border bg-heat-soft text-heat'
          : 'border-border/70 text-muted-foreground hover:border-border hover:text-foreground'
      )}
    >
      {children}
    </button>
  )
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-4">
      <span className="w-16 shrink-0 pt-1.5 text-[12px] font-medium text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

function DateField({
  value,
  onChange,
}: {
  value: Date | undefined
  onChange: (date: Date | undefined) => void
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            size="sm"
            className={cn('font-normal', !value && 'text-muted-foreground')}
          >
            <CalendarIcon className="mr-2 h-3.5 w-3.5" />
            {value ? format(value, 'yyyy-MM-dd') : '날짜 선택'}
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={onChange} locale={ko} />
      </PopoverContent>
    </Popover>
  )
}

interface SearchFormProps {
  onSearch: (params: SearchParams) => void
  loading?: boolean
  /** 인기 검색어를 눌러 시작할 때 바깥에서 넣어 주는 검색어. 채워지면 바로 조회한다. */
  presetKeyword?: string
}

export function SearchForm({ onSearch, loading = false, presetKeyword }: SearchFormProps) {
  const [rangeDays, setRangeDays] = useState<number | null>(30)
  const [showDetail, setShowDetail] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    defaultValues: {
      keywords: '',
      ...rangeFromDays(30),
      timeUnit: 'date',
      device: 'all',
      gender: 'all',
      ages: [...ALL_AGE_VALUES],
    },
  })

  const applyPreset = (days: number) => {
    const { startDate, endDate } = rangeFromDays(days)
    form.setValue('startDate', startDate)
    form.setValue('endDate', endDate)
    setRangeDays(days)
  }

  const handleSubmit = (data: FormValues) => {
    const keywords = data.keywords
      .split(',')
      .map((keyword) => keyword.trim())
      .filter(Boolean)

    if (keywords.length === 0) {
      form.setError('keywords', { message: '검색어를 입력해 주세요.' })
      return
    }

    const keywordGroups: KeywordGroup[] = [{ groupName: keywords[0], keywords }]

    onSearch({
      startDate: format(data.startDate, 'yyyy-MM-dd'),
      endDate: format(data.endDate, 'yyyy-MM-dd'),
      timeUnit: data.timeUnit,
      keywordGroups,
      ...(data.device !== 'all' && { device: data.device }),
      ...(data.gender !== 'all' && { gender: data.gender }),
      ages: data.ages,
    })
  }

  // 인기 검색어 칩을 누르면 입력란을 채우고 그대로 조회까지 이어 간다
  useEffect(() => {
    if (!presetKeyword) return
    form.setValue('keywords', presetKeyword)
    void form.handleSubmit(handleSubmit)()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetKeyword])

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="rounded-xl border border-border/70 bg-card"
      >
        {/* 질문 — 이 페이지에서 가장 큰 입력이자 유일한 필수 항목.
            아래 섹션 구분선이 이미 경계를 그어 주므로 입력란에 밑줄을 따로 두지 않는다. */}
        <div className="border-b border-border/70 px-4 py-3 sm:px-5">
          <FormField
            control={form.control}
            name="keywords"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="group flex flex-1 items-center gap-2.5">
                    <Search className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-focus-within:text-heat" />
                    <FormControl>
                      <Input
                        placeholder="검색어 입력 (쉼표로 구분하면 함께 묶어 봅니다)"
                        className="h-9 border-0 bg-transparent px-0 text-[16px] font-medium shadow-none focus-visible:ring-0"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <Button type="submit" disabled={loading} className="h-9 shrink-0 px-4">
                    관심도 보기
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3 p-4 sm:p-5">
          <FilterRow label="기간">
            {RANGE_PRESETS.map((preset) => (
              <Pill
                key={preset.days}
                selected={rangeDays === preset.days}
                onClick={() => applyPreset(preset.days)}
              >
                {preset.label}
              </Pill>
            ))}
            <Pill selected={rangeDays === null} onClick={() => setRangeDays(null)}>
              직접 선택
            </Pill>
          </FilterRow>

          {rangeDays === null && (
            <div className="flex flex-wrap items-center gap-2 sm:pl-20">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <DateField value={field.value} onChange={field.onChange} />
                  </FormItem>
                )}
              />
              <span className="text-[13px] text-muted-foreground">~</span>
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <DateField value={field.value} onChange={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <FormField
            control={form.control}
            name="timeUnit"
            render={({ field }) => (
              <FilterRow label="단위">
                {Object.entries(TIME_UNIT_KO).map(([value, label]) => (
                  <Pill
                    key={value}
                    selected={field.value === value}
                    onClick={() => field.onChange(value as TimeUnitType)}
                  >
                    {label}
                  </Pill>
                ))}
              </FilterRow>
            )}
          />

          {/* 세 항목 모두 기본값이 '전체'라 평소엔 접어 둔다 */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowDetail((prev) => !prev)}
              aria-expanded={showDetail}
              className="inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronDown
                className={cn('h-3.5 w-3.5 transition-transform', showDetail && 'rotate-180')}
              />
              디바이스 · 성별 · 연령대
            </button>
          </div>

          {showDetail && (
            <div className="space-y-3 border-t border-border/70 pt-4">
              <FormField
                control={form.control}
                name="device"
                render={({ field }) => (
                  <FilterRow label="디바이스">
                    {Object.entries(DEVICE_TYPE_KO).map(([value, label]) => (
                      <Pill
                        key={value}
                        selected={field.value === value}
                        onClick={() => field.onChange(value as DeviceType)}
                      >
                        {label}
                      </Pill>
                    ))}
                  </FilterRow>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FilterRow label="성별">
                    {Object.entries(GENDER_TYPE_KO).map(([value, label]) => (
                      <Pill
                        key={value}
                        selected={field.value === value}
                        onClick={() => field.onChange(value as GenderType)}
                      >
                        {label}
                      </Pill>
                    ))}
                  </FilterRow>
                )}
              />

              <FormField
                control={form.control}
                name="ages"
                render={({ field }) => {
                  const selected = field.value ?? []
                  const allSelected = selected.length === ALL_AGE_VALUES.length

                  return (
                    <FormItem className="space-y-2">
                      <FilterRow label="연령대">
                        <Pill
                          selected={allSelected}
                          onClick={() => field.onChange([...ALL_AGE_VALUES])}
                        >
                          전체
                        </Pill>
                        {ALL_AGE_VALUES.map((age) => (
                          <Pill
                            key={age}
                            selected={!allSelected && selected.includes(age)}
                            onClick={() =>
                              field.onChange(
                                selected.includes(age)
                                  ? selected.filter((item) => item !== age)
                                  : [...selected, age]
                              )
                            }
                          >
                            {AGE_TYPE_KO[age]}
                          </Pill>
                        ))}
                      </FilterRow>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
            </div>
          )}
        </div>
      </form>
    </Form>
  )
}
