import Image from 'next/image'
import { ExternalLink } from 'lucide-react'

import type { TrendingNewsItem } from '@/entities/trending/model/types'

interface RelatedNewsProps {
  news: TrendingNewsItem[]
}

export function RelatedNews({ news }: RelatedNewsProps) {
  if (news.length === 0) return null

  return (
    <section>
      <h2 className="text-[15px] font-bold tracking-tight">관련 뉴스</h2>

      <ul className="mt-3 divide-y divide-border/60 overflow-hidden rounded-xl border border-border/70 bg-card">
        {news.map((item) => (
          <li key={item.url}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="group flex items-start gap-4 p-4 transition-colors hover:bg-muted/60"
            >
              <div className="min-w-0 flex-1">
                <h3 className="text-pretty text-[14px] font-medium leading-snug group-hover:text-heat">
                  {item.title}
                </h3>
                <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                  {item.source}
                  <ExternalLink className="h-3 w-3" />
                </p>
              </div>

              {item.picture && (
                <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                  <Image
                    src={item.picture}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
