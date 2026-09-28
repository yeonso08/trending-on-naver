import { XMLParser } from 'fast-xml-parser'

import type { TrendingNewsItem, TrendingTopic } from '@/entities/trending/model/types'

const TRENDS_RSS_URL = 'https://trends.google.co.kr/trending/rss?geo=KR'
/**
 * 받은 목록을 서버 인스턴스 메모리에 들고 있는 시간. Vercel 데이터 캐시(fetch revalidate)는
 * 쓰기마다 ISR Writes로 과금돼 1분 수집만으로 Hobby 한도(월 20만)를 넘겼다(2026-09-28).
 * 메모리는 과금되지 않고, Fluid Compute가 인스턴스를 재사용하므로 구글 호출도 묶인다.
 */
const MEMORY_TTL_MS = 30_000
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

let memory: { snapshot: TrendingSnapshot; storedAt: number } | undefined
/** 동시에 들어온 요청이 구글을 여러 번 부르지 않게 진행 중인 조회를 함께 기다린다 */
let pending: Promise<TrendingSnapshot> | undefined

/**
 * 메모리 캐시가 맞으면 fetch를 호출하지 않으므로 Next.js가 동적 렌더를 감지하지 못한다.
 * 이 함수를 쓰는 라우트는 `dynamic = 'force-dynamic'`을 명시해야 한다 — 빠뜨리면 빌드 때
 * 정적으로 굳거나 ISR로 잡혀 다시 ISR Writes를 쓴다.
 *
 * 구글 RSS는 서드파티 의존이다. 조회 실패는 빈 배열로 처리하고 호출부가 빈 목록을 다루게 한다.
 */
export async function getTrendingSnapshot(): Promise<TrendingSnapshot> {
  if (memory && Date.now() - memory.storedAt < MEMORY_TTL_MS) return memory.snapshot

  pending ??= fetchTrendingSnapshot()
    .then((snapshot) => {
      memory = { snapshot, storedAt: Date.now() }
      return snapshot
    })
    .finally(() => {
      pending = undefined
    })

  try {
    return await pending
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
   * 렌더 시각(new Date())을 쓰면 안 된다 — 메모리 캐시에서 꺼낸 목록은 렌더 시각보다 최대
   * MEMORY_TTL_MS만큼 묵어 있다.
   */
  fetchedAt: string
}

/** Date 헤더가 곧 구글 응답 시각이다. */
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
    // 데이터 캐시에 넣지 않는다. 캐시는 위의 메모리가 맡는다(MEMORY_TTL_MS 참고)
    cache: 'no-store',
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
