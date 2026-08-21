import { unstable_cache } from 'next/cache'

import type { SearchParams, TrendData } from '@/shared/types/trends'

/**
 * 네이버 검색어 트렌드는 2026년 6월 NAVER API HUB(네이버클라우드)로 이관됐다.
 * 구 개발자센터 방식은 2027년 6월 30일까지만 동작하므로 두 방식을 모두 지원하고,
 * API HUB 키가 있으면 그쪽을 먼저 쓴다.
 *
 * 요청/응답 바디는 두 방식이 동일해서 엔드포인트와 인증 헤더만 갈아끼우면 된다.
 */

const API_HUB_URL = 'https://naverapihub.apigw.ntruss.com/search-trend/v1/search'
const LEGACY_URL = 'https://openapi.naver.com/v1/datalab/search'

type Endpoint = {
  mode: 'apihub' | 'legacy'
  url: string
  headers: Record<string, string>
}

export function resolveNaverEndpoint(): Endpoint | null {
  const hubKeyId = process.env.NAVER_API_HUB_KEY_ID
  const hubKey = process.env.NAVER_API_HUB_KEY

  if (hubKeyId && hubKey) {
    return {
      mode: 'apihub',
      url: API_HUB_URL,
      headers: {
        'X-NCP-APIGW-API-KEY-ID': hubKeyId,
        'X-NCP-APIGW-API-KEY': hubKey,
        'Content-Type': 'application/json',
      },
    }
  }

  const clientId = process.env.NAVER_CLIENT_ID
  const clientSecret = process.env.NAVER_CLIENT_SECRET

  if (clientId && clientSecret) {
    return {
      mode: 'legacy',
      url: LEGACY_URL,
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
        'Content-Type': 'application/json',
      },
    }
  }

  return null
}

export async function fetchSearchTrend(params: SearchParams, endpoint: Endpoint) {
  return fetch(endpoint.url, {
    method: 'POST',
    headers: endpoint.headers,
    body: JSON.stringify(params),
  })
}

/**
 * 검색어 상세 페이지에서 쓰는 최근 30일 추이.
 *
 * 예전에는 차트가 클라이언트에서 `/api/trends`를 호출했다. 페이지 HTML은 ISR로
 * 캐싱돼도 그 호출만은 매번 브라우저에서 나가기 때문에, 페이지뷰 1회가 곧 네이버
 * API 1회였다. 트래픽이 늘면 그대로 쿼터가 녹는 구조라 서버로 옮기고 캐시를 씌운다.
 *
 * 데이터랩의 최소 단위가 일간이라 6시간이면 충분히 신선하다. 검색어 하나당
 * 하루 4회 호출로 상한이 잡힌다.
 */
const KEYWORD_TREND_TTL_SECONDS = 60 * 60 * 6
const KEYWORD_TREND_DAYS = 30

function toApiDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

async function fetchKeywordTrend(keyword: string): Promise<TrendData[] | null> {
  const endpoint = resolveNaverEndpoint()
  if (!endpoint) return null

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - KEYWORD_TREND_DAYS)

  const params: SearchParams = {
    startDate: toApiDate(startDate),
    endDate: toApiDate(endDate),
    timeUnit: 'date',
    keywordGroups: [{ groupName: keyword, keywords: [keyword] }],
  }

  try {
    const response = await fetchSearchTrend(params, endpoint)

    if (!response.ok) {
      console.error(`검색어 추이 조회 실패 (${keyword}, HTTP ${response.status})`)
      return null
    }

    const json = await response.json()
    const points: TrendData[] | undefined = json?.results?.[0]?.data
    return points?.length ? points : null
  } catch (error) {
    console.error(`검색어 추이 조회 중 오류 (${keyword}):`, error)
    return null
  }
}

/**
 * 같은 검색어에 대한 반복 호출은 캐시에서 돌려준다.
 * 실패(null)도 캐시되므로 키가 없거나 한도를 넘긴 상황에서 재시도가 폭주하지 않는다.
 */
export const getKeywordTrend = unstable_cache(fetchKeywordTrend, ['naver-keyword-trend'], {
  revalidate: KEYWORD_TREND_TTL_SECONDS,
})
