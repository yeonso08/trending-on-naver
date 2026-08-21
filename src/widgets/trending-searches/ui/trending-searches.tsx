import type { TrendingTopic } from '@/entities/trending/model/types'
import { TrendingList } from '@/features/trending-list/ui/trending-list'

interface TrendingSearchesProps {
  topics: TrendingTopic[]
}

function formatUpdatedAt(pubDate: string): string | null {
  if (!pubDate) return null
  const date = new Date(pubDate)
  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function TrendingSearches({ topics }: TrendingSearchesProps) {
  const updatedAt = formatUpdatedAt(topics[0]?.pubDate ?? '')

  return (
    <section className="overflow-hidden rounded-xl border border-border/70 bg-card">
      <header className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-2.5">
          <span className="live-dot" />
          <h2 className="text-[15px] font-bold tracking-tight">지금 뜨는 검색어</h2>
        </div>
        {updatedAt && (
          <time className="tabular text-[12px] text-muted-foreground">{updatedAt} 기준</time>
        )}
      </header>

      <div className="py-1">
        <TrendingList topics={topics} />
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
