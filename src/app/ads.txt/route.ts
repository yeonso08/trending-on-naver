import { ADSENSE_CLIENT, ADSENSE_ENABLED } from '@/shared/config/adsense'

/**
 * ads.txt — 이 도메인의 광고 재고를 누가 팔 수 있는지 선언한다.
 *
 * 없으면 AdSense가 "수익 손실 위험"을 경고하고 일부 입찰이 빠진다. 게시자 ID가
 * 있어야 쓸 수 있는 파일이라 정적 파일 대신 라우트로 두고 환경 변수에서 만든다.
 *
 * ads.txt에는 `ca-` 접두사를 뺀 형태(`pub-...`)를 적는다.
 */
export function GET() {
  if (!ADSENSE_ENABLED) {
    return new Response('Not Found', { status: 404 })
  }

  const publisherId = ADSENSE_CLIENT.replace(/^ca-/, '')

  return new Response(`google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
