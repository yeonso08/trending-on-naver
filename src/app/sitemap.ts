import type { MetadataRoute } from 'next'

import { listArticles } from '@/entities/article/api/get-articles'
import { listArchiveDates } from '@/entities/trending/api/keyword-archive'
import { SITE } from '@/shared/config/site'

/** 날짜별 기록(DB)을 읽으므로 요청마다 만든다. 정적으로 두면 빌드 시점 목록에 굳는다. */
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE.url, changeFrequency: 'hourly', priority: 1 },
    { url: `${SITE.url}/analysis`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE.url}/daily`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${SITE.url}/about`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE.url}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE.url}/terms`, changeFrequency: 'yearly', priority: 0.2 },
  ]

  // 모두 실패 시 빈 배열을 준다. 사이트맵은 어떤 경우에도 나간다.
  // 검색어 상세(/keyword/*)는 noindex라 넣지 않는다. 이유는 그 페이지의 generateMetadata 참고.
  const [archiveDates, articles] = await Promise.all([listArchiveDates(), listArticles()])

  return [
    ...staticRoutes,
    // 글이 없으면 빈 목록 페이지는 noindex라 사이트맵에서도 뺀다
    ...(articles.length > 0
      ? [
          {
            url: `${SITE.url}/articles`,
            lastModified: new Date(articles[0].updated ?? articles[0].date),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
          },
        ]
      : []),
    ...articles.map((article) => ({
      url: `${SITE.url}/articles/${article.slug}`,
      lastModified: new Date(article.updated ?? article.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    // 가장 최근 날짜(오늘)만 계속 바뀐다
    ...archiveDates.map((date, index) => ({
      url: `${SITE.url}/daily/${date}`,
      changeFrequency: index === 0 ? ('hourly' as const) : ('yearly' as const),
      priority: 0.5,
    })),
  ]
}
