'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  SearchParams,
  KeywordGroup,
  TimeUnitType,
  DeviceType,
  GenderType,
  AGE_TYPE_KO,
  AgeType,
} from '@/shared/types/trends'
import { ko } from 'date-fns/locale'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

interface SearchFormProps {
  onSearch: (params: SearchParams) => void
}

const formSchema = z.object({
  keywords: z.string().min(1, {
    message: '검색어를 입력해주세요.',
  }),
  startDate: z.date({
    required_error: '시작일을 선택해주세요.',
  }),
  endDate: z.date({
    required_error: '종료일을 선택해주세요.',
  }),
  timeUnit: z.custom<TimeUnitType>(),
  device: z.custom<DeviceType>(),
  gender: z.custom<GenderType>(),
  ages: z.array(z.custom<AgeType>()).min(1, { message: '연령대를 선택해주세요.' }),
})

export function SearchForm({ onSearch }: SearchFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'all',
    defaultValues: {
      keywords: '',
      startDate: undefined,
      endDate: undefined,
      timeUnit: 'date',
      device: 'all',
      gender: 'all',
      ages: [],
    },
  })

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    if (!data.startDate || !data.endDate) return

    const keywordList = data.keywords.split(',').map((k) => k.trim())
    const keywordGroups: KeywordGroup[] = [
      {
        groupName: '검색어 그룹',
        keywords: keywordList,
      },
    ]

    const params: SearchParams = {
      startDate: format(data.startDate, 'yyyy-MM-dd'),
      endDate: format(data.endDate, 'yyyy-MM-dd'),
      timeUnit: data.timeUnit,
      keywordGroups,
      ...(data.device !== 'all' && { device: data.device }),
      ...(data.gender !== 'all' && { gender: data.gender }),
      ...(data.ages && { ages: data.ages }),
    }

    onSearch(params)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>검색 조건 설정</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>시작일</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, 'yyyy-MM-dd') : '날짜 선택'}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          locale={ko}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>종료일</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, 'yyyy-MM-dd') : '날짜 선택'}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          locale={ko}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>검색어 (쉼표로 구분)</FormLabel>
                  <FormControl>
                    <Input placeholder="예: 트렌드, 핫토픽, 실시간" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="timeUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>시간 단위</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="시간 단위 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="date">일간</SelectItem>
                        <SelectItem value="week">주간</SelectItem>
                        <SelectItem value="month">월간</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="device"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>디바이스</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="디바이스 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        <SelectItem value="pc">PC</SelectItem>
                        <SelectItem value="mo">모바일</SelectItem>
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
                    <FormLabel>성별</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="성별 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        <SelectItem value="m">남성</SelectItem>
                        <SelectItem value="f">여성</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="ages"
              render={() => (
                <FormItem>
                  <FormLabel>연령대</FormLabel>
                  <div className="grid gap-2 grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {(Object.entries(AGE_TYPE_KO) as [AgeType, string][])
                      .sort(([keyA], [keyB]) => {
                        if (keyA === 'all') return -1
                        if (keyB === 'all') return 1
                        return Number(keyA) - Number(keyB)
                      })
                      .map(([id, label]) => (
                        <FormField
                          key={id}
                          control={form.control}
                          name="ages"
                          render={({ field }) => {
                            const allAges = Object.keys(AGE_TYPE_KO).filter((key) => key !== 'all')

                            return (
                              <FormItem
                                key={id}
                                className="flex flex-row items-start space-x-2 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={
                                      id === 'all'
                                        ? field.value?.length === allAges.length
                                        : field.value?.includes(id)
                                    }
                                    onCheckedChange={(checked) => {
                                      if (id === 'all') {
                                        field.onChange(checked ? allAges : [])
                                      } else {
                                        if (checked) {
                                          const newValue = [...(field.value ?? []), id]
                                          field.onChange(newValue)
                                        } else {
                                          const newValue = (field.value ?? []).filter(
                                            (value) => value !== id
                                          )
                                          field.onChange(newValue)
                                        }
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">{label}</FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="text-end">
              검색하기
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
