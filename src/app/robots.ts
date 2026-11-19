import type { MetadataRoute } from 'next'

import { SITE } from '@/shared/config/site'

/**
 * 크롤링 비용 때문에 봇마다 범위를 나눈다(2026-11-19).
 *
 * Firewall Bot Protection(11월 2일)은 브라우저로 위장한 크롤러만 막고, 이름을 밝히는 검증된 봇은
 * 통과시킨다. 11월 19일 하루 통과 요청 13.6K 중 GPTBot 5.1K·OAI-SearchBot 1.4K·SemrushBot 886이었고,
 * 같은 Hobby 계정(누꼬와 공유)의 CDN Requests 한도 1M을 넘겼다.
 *
 * - GPTBot(학습)·SemrushBot(SEO 도구): 전체 차단. 검색 노출과 무관하다.
 * - OAI-SearchBot(ChatGPT 검색): `/keyword/`만 차단. 글·홈이 인용되는 길은 남긴다.
 * - 구글봇은 막지 않는다 — `/keyword/*` noindex를 다시 크롤링해야 색인에서 빠진다
 *   (sitemap-keywords.xml 참고).
 *
 * 봇은 자기 이름과 맞는 묶음 하나만 읽고 `*` 묶음은 무시하므로, 이름을 따로 적은 묶음에도
 * `/api/`를 다시 넣는다.
 */
const BLOCKED_BOTS = ['GPTBot', 'SemrushBot']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: BLOCKED_BOTS, disallow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/', disallow: ['/api/', '/keyword/'] },
      { userAgent: '*', allow: '/', disallow: '/api/' },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  }
}
