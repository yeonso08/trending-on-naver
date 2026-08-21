import { NextResponse } from 'next/server'

import { fetchSearchTrend, resolveNaverEndpoint } from '@/shared/api/naver-datalab'
import type { SearchParams } from '@/shared/types/trends'

export async function POST(req: Request) {
  const endpoint = resolveNaverEndpoint()

  if (!endpoint) {
    console.error(
      '네이버 검색어 트렌드 자격 증명이 없습니다. ' +
        'NAVER_API_HUB_KEY_ID/NAVER_API_HUB_KEY 또는 NAVER_CLIENT_ID/NAVER_CLIENT_SECRET을 설정하세요.'
    )
    return NextResponse.json({ error: '검색어 트렌드를 사용할 수 없습니다.' }, { status: 503 })
  }

  try {
    const params: SearchParams = await req.json()
    const response = await fetchSearchTrend(params, endpoint)

    if (!response.ok) {
      // 상태 코드는 그대로 넘겨 호출 측이 한도 초과(429)를 구분할 수 있게 한다
      const detail = await response.text()
      console.error(`네이버 API 오류 (${endpoint.mode}, HTTP ${response.status}):`, detail)
      return NextResponse.json(
        { error: '검색어 트렌드를 불러오지 못했습니다.' },
        { status: response.status }
      )
    }

    return NextResponse.json(await response.json())
  } catch (error) {
    console.error('검색어 트렌드 조회 실패:', error)
    return NextResponse.json({ error: '검색어 트렌드를 불러오지 못했습니다.' }, { status: 500 })
  }
}
