'use client'

import { TrendingTopic } from '@/entities/trending/model/types'
import { Card, CardContent } from '@/components/ui/card'

interface TrendingListProps {
  topics: TrendingTopic[]
  selectedTopic?: TrendingTopic | null
  onSelectTopic: (topic: TrendingTopic) => void
}

export function TrendingList({ topics, selectedTopic, onSelectTopic }: TrendingListProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <ul className="space-y-4">
          {topics.map((topic, index) => (
            <li
              key={index}
              className={`flex items-center space-x-4 p-4 rounded-lg transition duration-200 cursor-pointer
                ${selectedTopic?.title === topic.title ? 'bg-muted' : 'hover:bg-muted/50'}`}
              onClick={() => onSelectTopic(topic)}
            >
              <span className="text-2xl font-bold text-muted-foreground w-8">{index + 1}</span>
              <div>
                <h2 className="text-lg font-semibold">{topic.title}</h2>
                <div className="flex space-x-4 text-sm text-muted-foreground">
                  <span>{new Date(topic.pubDate).toLocaleString('ko-KR')}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
