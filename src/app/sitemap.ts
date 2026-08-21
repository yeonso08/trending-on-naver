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

  // getTrendingTopics는 실패 시 빈 배열을 준다. 사이트맵은 어떤 경우에도 나간다.
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
}
