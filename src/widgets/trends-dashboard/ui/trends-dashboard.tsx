'use client'

import { useState } from 'react'
import { TrendingUp } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchForm } from '@/features/trend-analysis/ui/search-form'
import { TrendChart } from '@/features/trend-analysis/ui/trend-chart'
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

/**
 * 조회 조건을 한 줄로 요약한다. 사용자가 이미 아는 기본값(전체)은 빼고
 * 이 조회를 특별하게 만든 조건만 남긴다.
 */
function describeParams(params: SearchParams): string {
  const parts = [
    `${params.startDate} ~ ${params.endDate}`,
    TIME_UNIT_KO[params.timeUnit],
    params.keywordGroups[0].keywords.join(', '),
  ]

  if (params.device) parts.push(DEVICE_TYPE_KO[params.device])
  if (params.gender) parts.push(GENDER_TYPE_KO[params.gender])

  const ages = params.ages ?? []
  const allAges = ages.length === 0 || ALL_AGE_VALUES.every((age) => ages.includes(age))
  if (!allAges) parts.push(ages.map((age) => AGE_TYPE_KO[age]).join(', '))

  return parts.join(' · ')
}

function ResultSkeleton() {
  return (
    <section className="overflow-hidden rounded-xl border border-border/70 bg-card">
      <div className="space-y-4 border-b border-border/70 px-4 py-4 sm:px-5">
        <Skeleton className="h-4 w-32" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      </div>
      <div className="p-3 pt-5 sm:p-4 sm:pt-6">
        <Skeleton className="h-[300px] w-full sm:h-[340px]" />
      </div>
    </section>
  )
}

interface TrendsDashboardProps {
  /** 검색 전 화면에서 바로 눌러 볼 수 있게 건네는 실시간 인기 검색어 */
  starters?: string[]
}

export function TrendsDashboard({ starters = [] }: TrendsDashboardProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [trends, setTrends] = useState<TrendData[]>([])
  const [currentParams, setCurrentParams] = useState<SearchParams | null>(null)
  const [presetKeyword, setPresetKeyword] = useState<string>()

  const handleSearch = async (params: SearchParams) => {
    setLoading(true)
    setError(null)
    // 같은 칩을 다시 눌렀을 때도 값이 바뀐 것으로 보이도록 비워 둔다
    setPresetKeyword(undefined)

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

  const hasResult = !loading && !error && trends.length > 0
  const showStarters = !loading && !error && trends.length === 0 && starters.length > 0

  return (
    <div className="space-y-5">
      <SearchForm onSearch={handleSearch} loading={loading} presetKeyword={presetKeyword} />

      {loading && <ResultSkeleton />}

      {error && !loading && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {hasResult && currentParams && (
        <TrendChart data={trends} conditionLabel={describeParams(currentParams)} />
      )}

      {/* 빈 화면 대신 지금 뜨는 검색어로 바로 들어갈 입구를 준다 */}
      {showStarters && (
        <section className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center sm:px-5 sm:py-8">
          <TrendingUp className="mx-auto h-5 w-5 text-heat" />
          <h2 className="mt-3 text-[15px] font-bold tracking-tight">
            지금 뜨는 검색어로 시작해 보세요
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            눌러서 최근 30일 관심도를 바로 확인할 수 있습니다.
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {starters.map((keyword) => (
              <button
                key={keyword}
                type="button"
                onClick={() => setPresetKeyword(keyword)}
                className="rounded-full border border-border/70 bg-card px-3 py-1.5 text-[13px] font-medium transition-colors hover:border-heat-border hover:bg-heat-soft hover:text-heat"
              >
                {keyword}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
