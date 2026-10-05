import type { NextConfig } from 'next'
import { HTML_LIMITED_BOT_UA_RE } from 'next/dist/shared/lib/router/utils/html-bots'

const nextConfig: NextConfig = {
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
    '/keyword/[keyword]/opengraph-image': ['./public/fonts/pretendard/og/**'],
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
