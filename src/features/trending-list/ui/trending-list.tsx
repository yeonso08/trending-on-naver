'use client'

import { TrendingTopic } from '@/entities/trending/model/types'
import { Card, CardContent } from '@/components/ui/card'

interface TrendingListProps {
  topics: TrendingTopic[]
}

export function TrendingList({ topics }: TrendingListProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <ul className="space-y-4">
          {topics.map((topic, index) => (
            <a
              href={`https://search.naver.com/search.naver?where=nexearch&sm=top_hty&fbm=1&ie=utf8&query=${topic.title}`}
              target="_blank"
              rel="noopener noreferrer"
              key={index}
              className={`flex items-center space-x-4 p-4 rounded-lg transition duration-200 cursor-pointer hover:bg-muted`}
            >
              <span className="text-2xl font-bold text-muted-foreground w-8">{index + 1}</span>
              <div>
                <h2 className="text-lg font-semibold">{topic.title}</h2>
                <div className="flex space-x-4 text-sm text-muted-foreground">
                  <span>{new Date(topic.pubDate).toLocaleString('ko-KR')}</span>
                </div>
              </div>
            </a>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
