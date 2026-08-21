import Image from 'next/image'
import Link from 'next/link'

import type { TrendingTopic } from '@/entities/trending/model/types'

import { TrendingRank } from './trending-rank'

interface TrendingListItemProps {
  topic: TrendingTopic
}

export function TrendingListItem({ topic }: TrendingListItemProps) {
  const headline = topic.news[0]

  return (
    <li>
      <Link
        href={`/keyword/${topic.slug}`}
        className="group flex items-center gap-3.5 rounded-lg px-3 py-3 transition-colors hover:bg-muted/60 sm:gap-4 sm:px-4"
      >
        <TrendingRank rank={topic.rank} />

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h3 className="truncate text-[15px] font-semibold tracking-tight group-hover:text-heat">
              {topic.title}
            </h3>
            {topic.approxTraffic && (
              <span className="tabular shrink-0 text-[11px] font-medium text-muted-foreground">
                {topic.approxTraffic}
              </span>
            )}
          </div>

          {headline && (
            <p className="mt-1 truncate text-[13px] text-muted-foreground">
              {headline.title}
              {headline.source && (
                <span className="text-muted-foreground/60"> · {headline.source}</span>
              )}
            </p>
          )}
        </div>

        {topic.picture && (
          <div className="relative hidden h-12 w-16 shrink-0 overflow-hidden rounded-md bg-muted sm:block">
            <Image
              src={topic.picture}
              alt=""
              fill
              sizes="64px"
              className="object-cover"
              unoptimized
            />
          </div>
        )}
      </Link>
    </li>
  )
}
