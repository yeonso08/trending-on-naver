'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { SearchForm } from '@/features/trend-analysis/ui/SearchForm'
import { TrendChart } from '@/features/trend-analysis/ui/TrendChart'
import {
  AGE_TYPE_KO,
  DEVICE_TYPE_KO,
  GENDER_TYPE_KO,
  TIME_UNIT_KO,
  type AgeType,
  type SearchParams,
  type TrendData,
} from '@/shared/types/trends'

const ALL_AGE_VALUES: AgeType[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']

function formatAges(ages: AgeType[] | undefined): string | null {
  if (!ages || ages.length === 0) return null
  if (ages.includes('all') || ALL_AGE_VALUES.every((age) => ages.includes(age))) {
    return AGE_TYPE_KO.all
  }
  return ages.map((age) => AGE_TYPE_KO[age]).join(', ')
}

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-muted/40 px-3 py-2">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-[13px] font-medium">{value}</dd>
    </div>
  )
}

export function TrendsDashboard() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [trends, setTrends] = useState<TrendData[]>([])
  const [currentParams, setCurrentParams] = useState<SearchParams | null>(null)

  const handleSearch = async (params: SearchParams) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        throw new Error('검색어 트렌드를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
      }

      const data = await response.json()
      const points: TrendData[] | undefined = data?.results?.[0]?.data

      if (!points?.length) {
        throw new Error('해당 조건에 해당하는 검색 데이터가 없습니다.')
      }

      setTrends(points)
      setCurrentParams(params)
    } catch (err) {
      setTrends([])
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const ages = currentParams ? formatAges(currentParams.ages) : null

  return (
    <div className="space-y-6">
      <SearchForm onSearch={handleSearch} />

      {currentParams && !loading && (
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          <SummaryChip
            label="기간"
            value={`${currentParams.startDate} ~ ${currentParams.endDate}`}
          />
          <SummaryChip
            label="검색어"
            value={currentParams.keywordGroups[0].keywords.join(', ')}
          />
          <SummaryChip label="단위" value={TIME_UNIT_KO[currentParams.timeUnit]} />
          <SummaryChip
            label="디바이스"
            value={DEVICE_TYPE_KO[currentParams.device ?? 'all']}
          />
          <SummaryChip label="성별" value={GENDER_TYPE_KO[currentParams.gender ?? 'all']} />
          {ages && <SummaryChip label="연령대" value={ages} />}
        </dl>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border/70 bg-card py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          검색어 트렌드를 불러오는 중입니다
        </div>
      )}

      {error && !loading && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && trends.length > 0 && <TrendChart data={trends} />}
    </div>
  )
}
