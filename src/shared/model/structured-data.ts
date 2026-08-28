import { SITE } from '@/shared/config/site'

import type { TrendingTopic } from '@/entities/trending/model/types'

/**
 * 검색엔진에 넘기는 구조화 데이터(JSON-LD) 생성기.
 *
 * 실제로 검색 결과 모양을 바꾸는 건 `BreadcrumbList` 하나뿐이다. `WebSite`와 `ItemList`는
 * 리치 결과를 만들지는 않지만 페이지의 성격과 목록 구조를 명시해 준다. 눈에 보이는 효과가
 * 없다고 지우지는 말되, 효과를 기대하고 항목을 늘리지도 말 것.
 */

/** 사이트 자체의 정체. 홈에만 넣는다 — 모든 페이지에 반복하면 의미가 없다 */
export function buildWebSiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': `${SITE.url}#website`,
    url: SITE.url,
    name: SITE.name,
    alternateName: SITE.nameEn,
    description: SITE.description,
    inLanguage: 'ko-KR',
  }
}

/** 실시간 검색어 순위를 순서 있는 목록으로 표현한다 */
export function buildTrendingItemListSchema(topics: TrendingTopic[]) {
  return {
    '@type': 'ItemList',
    name: '실시간 인기 검색어 순위',
    numberOfItems: topics.length,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    itemListElement: topics.map((topic) => ({
      '@type': 'ListItem',
      position: topic.rank,
      name: topic.title,
      url: `${SITE.url}/keyword/${topic.slug}`,
    })),
  }
}

/** 검색 결과에 실제로 경로가 노출되는 유일한 스키마 */
export function buildBreadcrumbSchema(trail: Array<{ name: string; path: string }>) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((step, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: step.name,
      item: `${SITE.url}${step.path}`,
    })),
  }
}

/** 여러 스키마를 한 스크립트로 묶는다 */
export function buildGraph(...nodes: Array<Record<string, unknown>>) {
  return { '@context': 'https://schema.org', '@graph': nodes }
}
