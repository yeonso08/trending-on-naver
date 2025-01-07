'use client'

import { useState } from 'react'
import { SearchForm } from '@/features/trend-analysis/ui/SearchForm'
import { TrendChart } from '@/features/trend-analysis/ui/TrendChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { SearchParams, TrendData } from '@/shared/types/trends'

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch trends')
      }

      const data = await response.json()
      setTrends(data.results[0].data)
      setCurrentParams(params)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <SearchForm onSearch={handleSearch} />

      {currentParams && (
        <Card>
          <CardHeader>
            <CardTitle>현재 검색 조건</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">기간</dt>
                <dd>
                  {currentParams.startDate} ~ {currentParams.endDate}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">검색어</dt>
                <dd>{currentParams.keywordGroups[0].keywords.join(', ')}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">시간 단위</dt>
                <dd>{currentParams.timeUnit}</dd>
              </div>
              {currentParams.device && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">디바이스</dt>
                  <dd>{currentParams.device === 'pc' ? 'PC' : '모바일'}</dd>
                </div>
              )}
              {currentParams.gender && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">성별</dt>
                  <dd>{currentParams.gender === 'm' ? '남성' : '여성'}</dd>
                </div>
              )}
              {currentParams.ages && currentParams.ages.length > 0 && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">연령대</dt>
                  <dd>{currentParams.ages.join(', ')}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="flex justify-center p-8">
          <svg
            className="animate-spin h-8 w-8 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && trends.length > 0 && <TrendChart data={trends} />}
    </div>
  )
}
