import { NextResponse } from 'next/server'

import { getTrendingTopics } from '@/entities/trending/api/get-trending-topics'

/**
 * 라우트 자체를 매 요청 실행하되, 내부 getTrendingTopics()의 fetch는
 * revalidate: 60 캐시를 그대로 타므로 구글 RSS 호출은 60초에 한 번으로 묶인다.
 */
export const dynamic = 'force-dynamic'

export async function GET() {
  const topics = await getTrendingTopics()
  return NextResponse.json({ topics, fetchedAt: new Date().toISOString() })
}
