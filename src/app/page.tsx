import type { Metadata } from 'next'

import { getTrendingTopics } from '@/entities/trending/api/get-trending-topics'
import { cn } from '@/lib/utils'
import { ADSENSE_ENABLED, ADSENSE_SLOTS } from '@/shared/config/adsense'
import { SITE } from '@/shared/config/site'
import {
  buildGraph,
  buildTrendingItemListSchema,
  buildWebSiteSchema,
} from '@/shared/model/structured-data'
import { AdSlot } from '@/shared/ui/ad-slot'
import { JsonLd } from '@/shared/ui/json-ld'
import { TrendingSearches } from '@/widgets/trending-searches/ui/trending-searches'

export const metadata: Metadata = {
  title: `실시간 인기 검색어 순위 | ${SITE.name}`,
  description: SITE.description,
  alternates: { canonical: '/' },
}

export default async function Home() {
  const topics = await getTrendingTopics()
  const fetchedAt = new Date().toISOString()

  // 광고 단위가 아직 없으면 AdSlot이 아무것도 렌더하지 않는다. 그 상태로 2단 그리드를
  // 유지하면 사이드바 자리만 텅 빈 채 남아 본문이 가운데서 왼쪽으로 밀려 보인다.
  const hasLeaderboardAd = ADSENSE_ENABLED && Boolean(ADSENSE_SLOTS.leaderboard)
  const hasRectangleAd = ADSENSE_ENABLED && Boolean(ADSENSE_SLOTS.rectangle)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <JsonLd data={buildGraph(buildWebSiteSchema(), buildTrendingItemListSchema(topics))} />
      <section className="mx-auto max-w-2xl text-center">
        <h1 className="text-balance text-3xl font-extrabold leading-[1.15] tracking-tight sm:text-[42px]">
          지금 대한민국이
          <br className="sm:hidden" />
          <span className="text-heat"> 검색하는 것</span>
        </h1>
        <p className="mt-4 text-pretty text-[15px] leading-relaxed text-muted-foreground">
          실시간 인기 검색어 순위를 확인하고, 궁금한 키워드의 검색량 추이를 그래프로 비교해 보세요.
        </p>
      </section>

      {hasLeaderboardAd && (
        <div className="mt-8">
          <AdSlot format="leaderboard" />
        </div>
      )}

      <div
        className={cn(
          'mt-8',
          hasRectangleAd
            ? 'grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start'
            : 'mx-auto max-w-2xl'
        )}
      >
        <TrendingSearches topics={topics} fetchedAt={fetchedAt} />

        {hasRectangleAd && (
          <div className="space-y-6 lg:sticky lg:top-20">
            <AdSlot format="rectangle" />
          </div>
        )}
      </div>
    </div>
  )
}
