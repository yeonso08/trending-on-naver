import type { Metadata } from 'next'

import { getTrendingTopics } from '@/entities/trending/api/get-trending-topics'
import { SITE } from '@/shared/config/site'
import { AdSlot } from '@/shared/ui/ad-slot'
import { TrendingSearches } from '@/widgets/trending-searches/ui/trending-searches'
import { TrendsDashboard } from '@/widgets/trends-dashboard/ui/trends-dashboard'

export const metadata: Metadata = {
  title: '검색어 트렌드 분석',
  description:
    '네이버 데이터랩 기반으로 검색어의 기간별 검색량 추이를 비교합니다. 성별, 연령대, 디바이스별로 세분화해 확인할 수 있습니다.',
  alternates: { canonical: '/analysis' },
}

export default async function AnalysisPage() {
  const topics = await getTrendingTopics()
  const fetchedAt = new Date().toISOString()

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-[38px]">
          검색어 트렌드 분석
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          검색어 하나가 언제 얼마나 관심을 받았는지 그래프로 확인하세요.
        </p>
        <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground/80">
          {SITE.name}이 제공하는 수치는 네이버 데이터랩 기준으로, 기간 내 최고 검색량을 100으로 둔
          상대값이며 실제 검색 횟수의 절댓값이 아닙니다.
        </p>
      </header>

      <div className="mt-8">
        <AdSlot format="leaderboard" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <TrendsDashboard starters={topics.slice(0, 6).map((topic) => topic.title)} />
        <div className="space-y-6 lg:sticky lg:top-20">
          <TrendingSearches topics={topics} fetchedAt={fetchedAt} compact />
          <AdSlot format="rectangle" />
        </div>
      </div>
    </div>
  )
}
