import type { MetadataRoute } from 'next'

import { getTrendingTopics } from '@/entities/trending/api/get-trending-topics'
import { listRecordedKeywords } from '@/entities/trending/api/keyword-history'
import { SITE } from '@/shared/config/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE.url, changeFrequency: 'hourly', priority: 1 },
    { url: `${SITE.url}/analysis`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE.url}/about`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE.url}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE.url}/terms`, changeFrequency: 'yearly', priority: 0.2 },
  ]

  // 둘 다 실패 시 빈 배열을 준다. 사이트맵은 어떤 경우에도 나간다.
  const [topics, recorded] = await Promise.all([getTrendingTopics(), listRecordedKeywords()])
  const liveKeywords = new Set(topics.map((topic) => topic.title))

  return [
    ...staticRoutes,
    ...topics.map((topic) => ({
      url: `${SITE.url}/keyword/${topic.slug}`,
      lastModified: topic.pubDate ? new Date(topic.pubDate) : undefined,
      changeFrequency: 'hourly' as const,
      priority: 0.6,
    })),
    // 순위에서 내려간 검색어도 DB 기록으로 페이지가 유지된다
    ...recorded
      .filter((record) => !liveKeywords.has(record.keyword))
      .map((record) => ({
        url: `${SITE.url}/keyword/${encodeURIComponent(record.keyword)}`,
        lastModified: new Date(record.lastSeenAt),
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      })),
  ]
}
