'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { CalendarIcon, Search } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

function defaultRange() {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)
  return { startDate, endDate }
}

interface SearchFormProps {
  onSearch: (params: SearchParams) => void
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string
  value: Date | undefined
  onChange: (date: Date | undefined) => void
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left text-[13px] font-normal',
              !value && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-3.5 w-3.5" />
            {value ? format(value, 'yyyy-MM-dd') : label}
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={onChange} locale={ko} />
      </PopoverContent>
    </Popover>
  )
}

export function SearchForm({ onSearch }: SearchFormProps) {
  const { startDate, endDate } = defaultRange()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    defaultValues: {
      keywords: '',
      startDate,
      endDate,
      timeUnit: 'date',
      device: 'all',
      gender: 'all',
      ages: [...ALL_AGE_VALUES],
    },
  })

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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-5 rounded-xl border border-border/70 bg-card p-4 sm:p-5"
      >
        <FormField
          control={form.control}
          name="keywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px]">검색어</FormLabel>
              <FormControl>
                <Input placeholder="쉼표로 구분해 입력 (예: 캠핑, 글램핑, 텐트)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px]">시작일</FormLabel>
                <DateField label="날짜 선택" value={field.value} onChange={field.onChange} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px]">종료일</FormLabel>
                <DateField label="날짜 선택" value={field.value} onChange={field.onChange} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="timeUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px]">시간 단위</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(TIME_UNIT_KO).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="device"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px]">디바이스</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(DEVICE_TYPE_KO).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px]">성별</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(GENDER_TYPE_KO).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="ages"
          render={({ field }) => {
            const allSelected = field.value?.length === ALL_AGE_VALUES.length

            return (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-[13px]">연령대</FormLabel>
                  <button
                    type="button"
                    onClick={() => field.onChange(allSelected ? [] : [...ALL_AGE_VALUES])}
                    className="text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {allSelected ? '전체 해제' : '전체 선택'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 pt-1 sm:grid-cols-3 lg:grid-cols-4">
                  {ALL_AGE_VALUES.map((age) => (
                    <label
                      key={age}
                      className="flex cursor-pointer items-center gap-2 text-[13px] font-normal"
                    >
                      <Checkbox
                        checked={field.value?.includes(age)}
                        onCheckedChange={(checked) => {
                          const current = field.value ?? []
                          field.onChange(
                            checked ? [...current, age] : current.filter((item) => item !== age)
                          )
                        }}
                      />
                      {AGE_TYPE_KO[age]}
                    </label>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )
          }}
        />

        <Button type="submit" className="w-full sm:w-auto">
          <Search className="mr-2 h-3.5 w-3.5" />
          트렌드 조회
        </Button>
      </form>
    </Form>
  )
}
