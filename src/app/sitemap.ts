import type { MetadataRoute } from 'next'

import { getTrendingTopics } from '@/entities/trending/api/get-trending-topics'
import { SITE } from '@/shared/config/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE.url, changeFrequency: 'hourly', priority: 1 },
    { url: `${SITE.url}/analysis`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE.url}/about`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE.url}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE.url}/terms`, changeFrequency: 'yearly', priority: 0.2 },
  ]

  try {
    const topics = await getTrendingTopics()
    return [
      ...staticRoutes,
      ...topics.map((topic) => ({
        url: `${SITE.url}/keyword/${topic.slug}`,
        lastModified: topic.pubDate ? new Date(topic.pubDate) : undefined,
        changeFrequency: 'hourly' as const,
        priority: 0.6,
      })),
    ]
  } catch {
    // 트렌드 조회가 실패해도 사이트맵 자체는 나가야 한다
    return staticRoutes
  }
}
