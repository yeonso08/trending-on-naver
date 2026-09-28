import { NextResponse } from 'next/server'

import { getTrendingSnapshot } from '@/entities/trending/api/get-trending-topics'

/**
 * 라우트 자체를 매 요청 실행하되, getTrendingSnapshot()의 메모리 캐시(30초)가
 * 구글 RSS 호출을 묶는다.
 */
export const dynamic = 'force-dynamic'

export async function GET() {
  const snapshot = await getTrendingSnapshot()
  return NextResponse.json(snapshot)
}
