import type { NextConfig } from 'next'
import { HTML_LIMITED_BOT_UA_RE } from 'next/dist/shared/lib/router/utils/html-bots'

/**
 * 요청마다 렌더하는 검색어·날짜 페이지를 Vercel CDN에만 이만큼 담아 둔다(2026-11-19).
 *
 * ISR이 아니라 CDN 캐시라 ISR Writes를 쓰지 않는다(9월에 그 한도를 넘겨 force-dynamic으로 바꿨다).
 * 같은 페이지를 연달아 여는 크롤러 요청이 함수 실행·Fast Origin Transfer 없이 나간다.
 * 순위는 최대 이만큼 늦게 보인다 — 원래도 RSS를 30초 메모리에 들고 있다(MEMORY_TTL_MS).
 * CDN Requests 수는 캐시와 상관없이 세므로 그쪽은 robots.ts가 맡는다.
 */
const DYNAMIC_PAGE_CDN_TTL_SECONDS = 60

/** Vercel 기본 주소. 크롤러가 이 주소로도 하루 3.9K씩 긁어 가서 정식 주소로 보낸다(2026-11-19) */
const VERCEL_PRODUCTION_HOST = 'trending-on-naver.vercel.app'

const nextConfig: NextConfig = {
  async headers() {
    const cdnCache = [
      {
        key: 'Vercel-CDN-Cache-Control',
        value: `max-age=${DYNAMIC_PAGE_CDN_TTL_SECONDS}`,
      },
    ]
    return [
      { source: '/keyword/:keyword', headers: cdnCache },
      { source: '/daily', headers: cdnCache },
      { source: '/daily/:date', headers: cdnCache },
    ]
  },
  async redirects() {
    return [
      {
        // 미리보기 배포 주소(trending-on-naver-<해시>-…)는 정확히 같은 호스트가 아니라 걸리지 않는다
        source: '/:path*',
        has: [{ type: 'host', value: VERCEL_PRODUCTION_HOST }],
        destination: 'https://keywi.kr/:path*',
        permanent: true,
      },
    ]
  },
  /**
   * Googlebot에게도 메타데이터를 <head>에 담아 보낸다.
   *
   * Next.js 15.2+는 동적 렌더 페이지의 title·description·canonical·robots를 <body> 중간에
   * 스트리밍한다. 기본 목록(HTML_LIMITED_BOT_UA_RE)은 `Google-InspectionTool` 등은 잡지만 일반
   * `Googlebot`은 빠져 있어, URL 검사에선 정상인데 실제 크롤링에선 canonical이 body에 놓인다.
   * 구글은 body의 canonical을 무시한다. 기본 목록을 대체하는 옵션이라 반드시 이어 붙인다.
   */
  htmlLimitedBots: new RegExp(`Googlebot|${HTML_LIMITED_BOT_UA_RE.source}`, 'i'),
  /**
   * OG 이미지 라우트가 런타임에 읽는 폰트를 서버리스 번들에 포함시킨다.
   *
   * `public/`은 CDN으로만 나가고 함수 번들에는 들어가지 않는다. 추적이 되지 않으면
   * 배포본에서 `readFile`이 실패해 500이 난다. 홈 OG는 빌드 시 미리 생성돼 로컬에서도
   * 프리뷰에서도 멀쩡해 보이지만, 검색어 OG는 요청 시점에 실행되므로 여기서만 터진다.
   */
  outputFileTracingIncludes: {
    '/opengraph-image': ['./public/fonts/pretendard/og/**'],
    // 레이아웃의 SiteHeader가 글 폴더를 읽어 '글' 메뉴를 보일지 정한다. 동적 라우트(홈 등)와
    // ISR 재생성은 요청 시점에 실행되므로 번들에 없으면 배포본에서만 메뉴가 사라진다.
    '/': ['./content/articles/**'],
    '/**/*': ['./content/articles/**'],
  },
  images: {
    remotePatterns: [
      // 구글 트렌드 RSS가 내려주는 뉴스 썸네일
      { protocol: 'https', hostname: 'encrypted-tbn0.gstatic.com' },
      { protocol: 'https', hostname: 'encrypted-tbn1.gstatic.com' },
      { protocol: 'https', hostname: 'encrypted-tbn2.gstatic.com' },
      { protocol: 'https', hostname: 'encrypted-tbn3.gstatic.com' },
    ],
  },
}

export default nextConfig
