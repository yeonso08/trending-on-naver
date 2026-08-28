import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
