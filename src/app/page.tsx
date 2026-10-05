import type { Metadata } from 'next'

import { getTrendingSnapshot } from '@/entities/trending/api/get-trending-topics'
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

/**
 * 요청마다 렌더한다. 구글 RSS 호출은 getTrendingSnapshot()의 메모리 캐시(30초)가 묶는다.
 * 메모리 캐시가 맞으면 fetch가 없어 Next.js가 동적 렌더를 감지하지 못하므로 명시가 필수다.
 */
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  // 브랜드 검색('키위 실시간' 등)에 홈이 잡히도록 서비스명을 앞에 둔다. 레이아웃 템플릿을 거치지 않는다.
  title: { absolute: `${SITE.name}(${SITE.nameEn}) — 실시간 인기 검색어 순위` },
  description: SITE.description,
  alternates: { canonical: '/' },
}

export default async function Home() {
  const { topics, fetchedAt } = await getTrendingSnapshot()

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
            ? 'grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start'
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
