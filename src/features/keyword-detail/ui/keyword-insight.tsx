import Link from 'next/link'

import { HISTORY_STARTED_ON } from '@/entities/trending/model/keyword-archive'
import { formatDateKey } from '@/shared/lib/format'

import type { KeywordInsight as KeywordInsightData } from '../model/build-keyword-insight'

interface KeywordInsightProps {
  insight: KeywordInsightData
  /** 마지막으로 순위권이었던 날의 날짜별 기록 페이지 */
  daily?: { href: string; label: string }
}

export function KeywordInsight({ insight, daily }: KeywordInsightProps) {
  const hasHistory = insight.history.length > 0
  const hasTrend = insight.trend.length > 0
  if (!hasHistory && !hasTrend) return null

  return (
    <section>
      <h2 className="text-[15px] font-bold tracking-tight">이 검색어의 기록</h2>

      <div className="mt-3 space-y-3 rounded-xl border border-border/70 bg-card p-4 text-pretty text-[14px] leading-relaxed">
        {hasHistory && <p>{insight.history.join(' ')}</p>}
        {hasTrend && <p>{insight.trend.join(' ')}</p>}
        {daily && (
          <Link
            href={daily.href}
            className="inline-block text-[13px] font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            {daily.label} →
          </Link>
        )}
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        {hasHistory &&
          `순위 기록은 키위가 1분마다 수집한 Google 트렌드 기준이며 ${formatDateKey(HISTORY_STARTED_ON)}부터 쌓였습니다. `}
        {hasTrend && '관심도는 네이버 데이터랩의 상대값입니다.'}
      </p>
    </section>
  )
}
