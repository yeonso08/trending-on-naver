'use client'

import { TrendingTopic } from '@/entities/trending/model/types'
import { ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TrendingDetailProps {
  topic: TrendingTopic
}

export function TrendingDetail({ topic }: TrendingDetailProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{topic.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topic.description && <p className="text-muted-foreground">{topic.description}</p>}
        <a
          href={topic.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80"
        >
          검색 결과 보기
          <ExternalLink className="h-4 w-4" />
        </a>
      </CardContent>
    </Card>
  )
}
