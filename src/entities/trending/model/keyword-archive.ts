/** 검색어 이력 수집을 시작한 날(KST). 이 전의 순위는 기록이 없다. */
export const HISTORY_STARTED_ON = '2026-09-14'

/** 하루 동안 순위권에 오른 검색어 한 줄 */
export interface DailyKeyword {
  keyword: string
  /** 그날의 최고 순위 */
  bestRank: number
  peakTrafficValue: number
  /** 그날 처음 순위권에서 확인된 시각 (ISO 문자열) */
  firstSeenAt: string
  /** 그날 순위권에 머문 시간(분) */
  rankedMinutes: number
  /** 마지막으로 확인된 대표 뉴스 */
  headline?: { title: string; source: string }
}
