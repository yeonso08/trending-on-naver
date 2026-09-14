import type { TrendingNewsItem } from '@/entities/trending/model/types'

/** DB에 쌓인 검색어 요약. 순위에서 내려간 검색어의 상세 페이지를 이걸로 렌더한다. */
export interface KeywordRecord {
  keyword: string
  /** ISO 문자열 */
  firstSeenAt: string
  /** 마지막으로 순위권에서 확인된 시각 (ISO 문자열) */
  lastSeenAt: string
  bestRank: number
  peakTrafficValue: number
  /** 마지막으로 확인된 검색량 문자열 ("200+" 등) */
  approxTraffic: string
  picture?: string
  pictureSource?: string
  /** 마지막으로 확인된 관련 뉴스 */
  news: TrendingNewsItem[]
  /** 순위권에 새로 진입한 횟수 */
  entries: number
}

export interface RecordSnapshotResult {
  /** 직전 스냅샷과 순위 목록이 달라 새로 쌓았는지 */
  changed: boolean
  snapshotId: number
  keywords: number
}
