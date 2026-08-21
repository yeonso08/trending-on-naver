import { Fragment } from 'react'

import type { TrendingTopic } from '@/entities/trending/model/types'
import { AdSlot } from '@/shared/ui/ad-slot'

import { TrendingListItem } from './trending-list-item'

interface TrendingListProps {
  topics: TrendingTopic[]
  /** 이 순위 뒤에 인피드 광고를 끼워 넣는다 */
  adAfterRank?: number
}

export function TrendingList({ topics, adAfterRank = 5 }: TrendingListProps) {
  if (topics.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-sm text-muted-foreground">
        표시할 검색어가 없습니다. 잠시 후 다시 확인해 주세요.
      </p>
    )
  }

  return (
    <ol className="divide-y divide-border/60">
      {topics.map((topic) => (
        <Fragment key={topic.slug}>
          <TrendingListItem topic={topic} />
          {topic.rank === adAfterRank && (
            <li className="px-3 py-3 sm:px-4">
              <AdSlot format="in-feed" debug />
            </li>
          )}
        </Fragment>
      ))}
    </ol>
  )
}
