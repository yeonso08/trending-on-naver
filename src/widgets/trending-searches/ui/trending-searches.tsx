'use client'

import { useEffect, useState } from 'react'

import type { TrendingTopic } from '@/entities/trending/model/types'
import { TrendingList } from '@/features/trending-list/ui/trending-list'

/** 열려 있는 탭이 이후 몇 분 지나도 저절로 최신화되도록 하는 폴링 주기 */
const POLL_INTERVAL_MS = 60_000

interface TrendingSearchesProps {
  /** 서버에서 초기 렌더링에 쓴 목록 */
  topics: TrendingTopic[]
  /** 이 목록이 서버에서 마지막으로 새로 조회된 시각 (ISO 문자열) */
  fetchedAt: string
  /** 사이드바처럼 좁은 폭에 넣을 때: 썸네일과 인피드 광고를 뺀다 */
  compact?: boolean
}

function formatUpdatedAt(isoDate: string): string | null {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function TrendingSearches({
  topics: initialTopics,
  fetchedAt: initialFetchedAt,
  compact = false,
}: TrendingSearchesProps) {
  const [topics, setTopics] = useState(initialTopics)
  const [fetchedAt, setFetchedAt] = useState(initialFetchedAt)

  useEffect(() => {
    let cancelled = false

    async function refresh() {
      if (document.hidden) return

      try {
        const response = await fetch('/api/trending', { cache: 'no-store' })
        if (!response.ok) return

        const data: { topics: TrendingTopic[]; fetchedAt: string } = await response.json()
        if (!cancelled) {
          setTopics(data.topics)
          setFetchedAt(data.fetchedAt)
        }
      } catch {
        // 다음 주기에 다시 시도한다
      }
    }

    const intervalId = setInterval(refresh, POLL_INTERVAL_MS)
    document.addEventListener('visibilitychange', refresh)

    return () => {
      cancelled = true
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])

  const updatedAt = formatUpdatedAt(fetchedAt)

  return (
    <section className="overflow-hidden rounded-xl border border-border/70 bg-card">
      <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-border/70 px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-2.5">
          <span className="live-dot" />
          <h2 className="text-[15px] font-bold tracking-tight">지금 뜨는 검색어</h2>
        </div>
        {updatedAt && (
          <time className="tabular text-[12px] text-muted-foreground" dateTime={fetchedAt}>
            {updatedAt} 업데이트
          </time>
        )}
      </header>

      <div className="py-1">
        <TrendingList topics={topics} showThumbnail={!compact} adAfterRank={compact ? -1 : 5} />
      </div>

      {/* Google 데이터를 재사용할 때는 출처를 밝히도록 안내하고 있다 */}
      <footer className="border-t border-border/70 px-4 py-3 sm:px-5">
        <p className="text-[12px] text-muted-foreground">
          출처{' '}
          <a
            href="https://trends.google.com/trending?geo=KR"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 transition-colors hover:text-foreground"
          >
            Google 트렌드
          </a>
        </p>
      </footer>
    </section>
  )
}
