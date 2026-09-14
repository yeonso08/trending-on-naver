import type { ReactNode } from 'react'

import { getTrendingSnapshot } from '@/entities/trending/api/get-trending-topics'
import { AdSlot } from '@/shared/ui/ad-slot'

import { TrendingSearches } from './trending-searches'

/**
 * 본문 오른쪽에 '지금 뜨는 검색어' 사이드바를 붙이는 레이아웃. 트렌드 분석·검색어 상세와 같은 그리드다.
 * 좁은 화면에서는 사이드바가 본문 아래로 내려간다.
 *
 * 순위는 서버 렌더 시점 값으로 먼저 그리고, TrendingSearches가 마운트 즉시 새로 받아 온다.
 * ISR·정적 페이지에서 처음 그린 목록이 묵어 있어도 곧바로 최신이 된다.
 */
export async function TrendingSidebarLayout({ children }: { children: ReactNode }) {
  const { topics, fetchedAt } = await getTrendingSnapshot()

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
      <div className="min-w-0">{children}</div>

      <aside className="space-y-6 lg:sticky lg:top-20">
        <TrendingSearches topics={topics} fetchedAt={fetchedAt} compact />
        <AdSlot format="rectangle" />
      </aside>
    </div>
  )
}
