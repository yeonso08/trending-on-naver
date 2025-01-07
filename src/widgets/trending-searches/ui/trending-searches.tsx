'use client'

import { TrendingTopic } from '@/entities/trending/model/types'
import { useState } from 'react'
import { TrendingList } from '@/features/trending-list/ui/trending-list'

interface TrendingSearchesProps {
  initialData: TrendingTopic[]
}

export function TrendingSearches({ initialData }: TrendingSearchesProps) {
  const [topics] = useState<TrendingTopic[]>(initialData)
  const [selectedTopic, setSelectedTopic] = useState<TrendingTopic | null>(null)

  return (
    <div className="flex-1">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">구글 실시간 검색어 순위</h1>
        <p className="text-muted-foreground mt-2">대한민국의 실시간 인기 검색어를 확인하세요</p>
      </div>

      <div className=" gap-6">
        <TrendingList
          topics={topics}
          selectedTopic={selectedTopic}
          onSelectTopic={setSelectedTopic}
        />
        {/*{selectedTopic && <TrendingDetail topic={selectedTopic} />}*/}
      </div>
    </div>
  )
}
