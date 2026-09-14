import { XMLParser } from 'fast-xml-parser'

import type { TrendingNewsItem, TrendingTopic } from '@/entities/trending/model/types'

const TRENDS_RSS_URL = 'https://trends.google.co.kr/trending/rss?geo=KR'
const REVALIDATE_SECONDS = 60
/** 빌드가 서드파티 응답을 무한정 기다리지 않도록 상한을 둔다 */
const REQUEST_TIMEOUT_MS = 10_000

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

/**
 * 구글 RSS는 서드파티 의존이고 빌드는 미국 리전에서 돈다. 여기서 예외를 던지면
 * 프리렌더 단계가 통째로 실패해 배포 자체가 깨진다. 조회 실패는 빈 배열로 처리하고
 * 호출부가 빈 목록을 다루게 한다. ISR이 다음 주기에 다시 시도한다.
 */
export async function getTrendingSnapshot(): Promise<TrendingSnapshot> {
  try {
    return await fetchTrendingSnapshot()
  } catch (error) {
    console.error('실시간 검색어 조회 실패:', error)
    return { topics: [], fetchedAt: new Date().toISOString() }
  }
}

export async function getTrendingTopics(): Promise<TrendingTopic[]> {
  return (await getTrendingSnapshot()).topics
}

export interface TrendingSnapshot {
  topics: TrendingTopic[]
  /**
   * 구글이 이 목록을 응답한 시각 (ISO). 화면의 "○○ 업데이트"에 쓴다.
   * 렌더 시각(new Date())을 쓰면 안 된다 — 데이터 캐시는 만료된 응답을 먼저 내주고 뒤에서
   * 갱신하므로(stale-while-revalidate), 렌더 시각은 실제 데이터보다 몇 분 새것처럼 보인다.
   */
  fetchedAt: string
}

/** 캐시된 fetch 응답도 원래 헤더를 그대로 보존하므로 Date 헤더가 곧 구글 응답 시각이다. */
function resolveFetchedAt(response: Response): string {
  const date = new Date(response.headers.get('date') ?? Date.now())
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

async function fetchTrendingSnapshot(): Promise<TrendingSnapshot> {
  const response = await fetch(TRENDS_RSS_URL, {
    headers: {
      Accept: 'application/rss+xml, application/xml',
      'Accept-Language': 'ko-KR,ko;q=0.9',
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    next: { revalidate: REVALIDATE_SECONDS },
  })

  if (!response.ok) {
    throw new Error(`실시간 검색어를 불러오지 못했습니다 (HTTP ${response.status})`)
  }

  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })
  const parsed = parser.parse(await response.text())
  const items = toArray<RawItem>(parsed?.rss?.channel?.item)

  const topics = items.map((item, index) => {
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

  return { topics, fetchedAt: resolveFetchedAt(response) }
}

export async function getTrendingTopicByKeyword(keyword: string): Promise<TrendingTopic | null> {
  const topics = await getTrendingTopics()
  return topics.find((topic) => topic.title === keyword) ?? null
}

export function buildNaverSearchUrl(keyword: string): string {
  return `https://search.naver.com/search.naver?where=nexearch&query=${encodeURIComponent(keyword)}`
}
