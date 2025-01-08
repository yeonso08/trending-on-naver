'use client'

import { useState } from 'react'
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
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { SearchParams, KeywordGroup } from '@/shared/types/trends'
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

type GenderType = 'all' | 'm' | 'f'
type DeviceType = 'all' | 'pc' | 'mo'

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
})

export function SearchForm({ onSearch }: SearchFormProps) {
  const [timeUnit, setTimeUnit] = useState<'date' | 'week' | 'month'>('date')
  const [device, setDevice] = useState<DeviceType>('all')
  const [gender, setGender] = useState<GenderType>('all')
  const [selectedAges, setSelectedAges] = useState<string[]>([])
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'all',
    defaultValues: {
      keywords: '',
      startDate: undefined,
      endDate: undefined,
    },
  })

  const ageGroups = [
    { id: '1', label: '0-12세' },
    { id: '2', label: '13-18세' },
    { id: '3', label: '19-24세' },
    { id: '4', label: '25-29세' },
    { id: '5', label: '30-34세' },
    { id: '6', label: '35-39세' },
    { id: '7', label: '40-44세' },
    { id: '8', label: '45-49세' },
    { id: '9', label: '50-54세' },
    { id: '10', label: '55-59세' },
    { id: '11', label: '60세 이상' },
  ]

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
      timeUnit,
      keywordGroups,
      ...(device !== 'all' && { device }),
      ...(gender !== 'all' && { gender }),
      ...(selectedAges.length > 0 && { ages: selectedAges }),
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
              <div className="space-y-1">
                <Label>시간 단위</Label>
                <Select
                  value={timeUnit}
                  onValueChange={(value: 'date' | 'week' | 'month') => setTimeUnit(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="시간 단위 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">일간</SelectItem>
                    <SelectItem value="week">주간</SelectItem>
                    <SelectItem value="month">월간</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>디바이스</Label>
                <Select
                  value={device}
                  onValueChange={(value: string) => setDevice(value as DeviceType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="디바이스 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="pc">PC</SelectItem>
                    <SelectItem value="mo">모바일</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>성별</Label>
                <Select
                  value={gender}
                  onValueChange={(value: string) => setGender(value as GenderType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="성별 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="m">남성</SelectItem>
                    <SelectItem value="f">여성</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>연령대</Label>
              <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {ageGroups.map(({ id, label }) => (
                  <div key={id} className="flex items-center gap-2">
                    <Checkbox
                      id={`age-${id}`}
                      checked={selectedAges.includes(id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedAges((prev) => [...prev, id])
                        } else {
                          setSelectedAges((prev) => prev.filter((a) => a !== id))
                        }
                      }}
                    />
                    <label
                      htmlFor={`age-${id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <Button type="submit" className="text-end">
              검색하기
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
