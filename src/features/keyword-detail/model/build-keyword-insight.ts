import type { KeywordRecord } from '@/entities/trending/model/keyword-record'
import type { TrendingTopic } from '@/entities/trending/model/types'
import {
  formatDateKey,
  formatDuration,
  formatKstDateTime,
  withTopicParticle,
} from '@/shared/lib/format'
import type { TrendData } from '@/shared/types/trends'

/** 최근 구간과 그 이전 구간을 나누는 기준 일수 */
const RECENT_DAYS = 7
/** 이 이하의 증감은 "비슷하다"로 본다 (%) */
const FLAT_THRESHOLD_PERCENT = 10
/** 이 배수 이상 뛰면 퍼센트 대신 "약 N배"로 쓴다 */
const MULTIPLE_THRESHOLD = 3

export interface KeywordInsight {
  /** 키위가 쌓은 순위 기록을 풀어 쓴 문장 */
  history: string[]
  /** 네이버 데이터랩 30일 추이를 해석한 문장 */
  trend: string[]
}

interface BuildKeywordInsightInput {
  keyword: string
  topic: TrendingTopic | null
  record: KeywordRecord | null
  /** 순위권에 머문 총 시간(분) */
  rankedMinutes: number | null
  trend: TrendData[] | null
}

/**
 * 외부 데이터(검색어·뉴스·그래프)를 나열만 하던 상세 페이지에, 그 데이터를 해석한 문장을 더한다.
 * 문장은 전부 실제 수치에서 나오므로 검색어마다 내용이 달라진다.
 */
export function buildKeywordInsight(input: BuildKeywordInsightInput): KeywordInsight {
  return {
    history: describeHistory(input),
    trend: describeTrend(input.trend),
  }
}

function describeHistory({ keyword, topic, record, rankedMinutes }: BuildKeywordInsightInput) {
  if (!record) return []

  const sentences = [
    `${withTopicParticle(keyword)} ${formatKstDateTime(record.firstSeenAt)}에 처음 실시간 검색어 순위에 올랐습니다.`,
  ]

  const peakTraffic =
    record.peakTrafficValue > 0
      ? ` 검색량은 최대 ${record.peakTrafficValue.toLocaleString('ko-KR')}+까지 집계됐습니다.`
      : ''
  sentences.push(`지금까지 기록된 최고 순위는 ${record.bestRank}위입니다.${peakTraffic}`)

  if (rankedMinutes !== null) {
    sentences.push(
      record.entries > 1
        ? `순위권에 ${record.entries}번 진입해 모두 ${formatDuration(rankedMinutes)} 동안 머물렀습니다.`
        : `순위권에 머문 시간은 모두 ${formatDuration(rankedMinutes)}입니다.`
    )
  }

  sentences.push(
    topic
      ? `지금은 ${topic.rank}위에 올라 있습니다.`
      : `마지막으로 순위권에서 확인된 시각은 ${formatKstDateTime(record.lastSeenAt)}입니다.`
  )

  return sentences
}

function average(points: TrendData[]) {
  return points.reduce((sum, point) => sum + point.ratio, 0) / points.length
}

function describeTrend(trend: TrendData[] | null) {
  // 최근 구간과 비교할 이전 구간이 충분히 있어야 증감이 의미를 가진다
  if (!trend || trend.length < RECENT_DAYS * 2) return []

  const peak = trend.reduce((best, point) => (point.ratio > best.ratio ? point : best))
  const sentences = [
    `최근 30일 네이버 검색 관심도는 ${formatDateKey(peak.period, { withYear: false })}에 가장 높았습니다.`,
  ]

  const recent = average(trend.slice(-RECENT_DAYS))
  const before = average(trend.slice(0, -RECENT_DAYS))

  if (before < 1) {
    if (recent >= 1) {
      sentences.push(`그 전에는 검색이 거의 없다가 최근 ${RECENT_DAYS}일 사이 관심이 생겼습니다.`)
    }
    return sentences
  }

  const change = Math.round(((recent - before) / before) * 100)
  const multiple = Math.round(recent / before)
  const prefix = `최근 ${RECENT_DAYS}일 평균 관심도는 그 전 기간`

  if (Math.abs(change) < FLAT_THRESHOLD_PERCENT) {
    sentences.push(`${prefix}과 비슷합니다.`)
  } else if (multiple >= MULTIPLE_THRESHOLD) {
    // 이전 평균이 작으면 퍼센트가 "1,527%"처럼 과장돼 보인다. 크게 뛰면 배수로 쓴다.
    sentences.push(`${prefix}의 약 ${multiple.toLocaleString('ko-KR')}배입니다.`)
  } else {
    sentences.push(`${prefix}보다 ${Math.abs(change)}% ${change > 0 ? '높습니다' : '낮습니다'}.`)
  }

  return sentences
}
