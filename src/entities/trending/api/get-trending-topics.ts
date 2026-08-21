import { XMLParser } from 'fast-xml-parser'

import type { TrendingNewsItem, TrendingTopic } from '@/entities/trending/model/types'

const TRENDS_RSS_URL = 'https://trends.google.co.kr/trending/rss?geo=KR'
const REVALIDATE_SECONDS = 60

/** XMLParser는 항목이 하나면 객체, 여럿이면 배열로 준다. 항상 배열로 맞춘다. */
function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined || value === null) return []
  return Array.isArray(value) ? value : [value]
}

/** "2000+" 같은 문자열에서 비교 가능한 숫자만 뽑는다. */
function parseApproxTraffic(raw: unknown): number {
  if (typeof raw !== 'string') return 0
  const digits = raw.replace(/[^0-9]/g, '')
  return digits ? Number(digits) : 0
}

interface RawNewsItem {
  'ht:news_item_title'?: string
  'ht:news_item_url'?: string
  'ht:news_item_source'?: string
  'ht:news_item_picture'?: string
}

interface RawItem {
  title?: string | number
  pubDate?: string
  'ht:approx_traffic'?: string
  'ht:picture'?: string
  'ht:picture_source'?: string
  'ht:news_item'?: RawNewsItem | RawNewsItem[]
}

function mapNewsItem(raw: RawNewsItem): TrendingNewsItem | null {
  const title = raw['ht:news_item_title']
  const url = raw['ht:news_item_url']
  if (!title || !url) return null

  return {
    title: String(title),
    url: String(url),
    source: String(raw['ht:news_item_source'] ?? ''),
    picture: raw['ht:news_item_picture'] ? String(raw['ht:news_item_picture']) : undefined,
  }
}

export async function getTrendingTopics(): Promise<TrendingTopic[]> {
  const response = await fetch(TRENDS_RSS_URL, {
    headers: {
      Accept: 'application/rss+xml, application/xml',
      'Accept-Language': 'ko-KR,ko;q=0.9',
    },
    next: { revalidate: REVALIDATE_SECONDS },
  })

  if (!response.ok) {
    throw new Error(`실시간 검색어를 불러오지 못했습니다 (HTTP ${response.status})`)
  }

  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })
  const parsed = parser.parse(await response.text())
  const items = toArray<RawItem>(parsed?.rss?.channel?.item)

  return items.map((item, index) => {
    // 숫자로만 이루어진 검색어는 파서가 number로 돌려주므로 문자열로 되돌린다
    const title = String(item.title ?? '').trim()

    return {
      rank: index + 1,
      title,
      slug: encodeURIComponent(title),
      approxTraffic: item['ht:approx_traffic'] ?? '',
      approxTrafficValue: parseApproxTraffic(item['ht:approx_traffic']),
      picture: item['ht:picture'] ? String(item['ht:picture']) : undefined,
      pictureSource: item['ht:picture_source'] ? String(item['ht:picture_source']) : undefined,
      pubDate: item.pubDate ?? '',
      news: toArray(item['ht:news_item'])
        .map(mapNewsItem)
        .filter((news): news is TrendingNewsItem => news !== null),
    }
  })
}

export async function getTrendingTopicByKeyword(keyword: string): Promise<TrendingTopic | null> {
  const topics = await getTrendingTopics()
  return topics.find((topic) => topic.title === keyword) ?? null
}

export function buildNaverSearchUrl(keyword: string): string {
  return `https://search.naver.com/search.naver?where=nexearch&query=${encodeURIComponent(keyword)}`
}
