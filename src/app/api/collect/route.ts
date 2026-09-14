import { timingSafeEqual } from 'node:crypto'

import { NextResponse } from 'next/server'

import { recordSnapshot } from '@/entities/trending/api/keyword-history'
import { getTrendingTopics } from '@/entities/trending/api/get-trending-topics'

/**
 * 검색어 이력 수집. Supabase pg_cron이 pg_net으로 5분마다 호출한다
 * (db/migrations/002_collect_schedule.sql). GitHub Actions 스케줄은 몇 시간씩 밀려 쓰지 않는다.
 */
export const dynamic = 'force-dynamic'

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false

  const expected = Buffer.from(`Bearer ${secret}`)
  const received = Buffer.from(request.headers.get('authorization') ?? '')
  return expected.length === received.length && timingSafeEqual(expected, received)
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const topics = await getTrendingTopics()
  // RSS 조회 실패는 빈 배열로 온다. 빈 목록을 스냅샷으로 남기면 전 검색어가 순위에서 빠진 것처럼 기록된다.
  if (topics.length === 0) {
    return NextResponse.json({ error: 'trending feed unavailable' }, { status: 502 })
  }

  try {
    const result = await recordSnapshot(topics)
    if (!result) {
      return NextResponse.json({ error: 'database not configured' }, { status: 503 })
    }
    return NextResponse.json(result)
  } catch (error) {
    console.error('검색어 이력 기록 실패:', error)
    return NextResponse.json({ error: 'record failed' }, { status: 500 })
  }
}
