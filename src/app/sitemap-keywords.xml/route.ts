import { listKeywordsFirstSeenBefore } from '@/entities/trending/api/keyword-archive'
import { SITE } from '@/shared/config/site'

/**
 * ⚠️ 임시 사이트맵 — 검색어 상세(/keyword/*)의 noindex를 구글이 빨리 확인하게 하려는 용도.
 *
 * 2026-10-02에 /keyword/*를 noindex로 바꿨지만 구글이 다시 크롤링해야 색인에서 빠진다.
 * 2주 동안 1,900여 개 중 24개만 확인돼, 그 전에 구글이 알던 주소만 모아 Search Console에
 * 따로 제출한다. 색인을 다시 켜는 것이 아니다(docs/SEO-INCIDENT-2026-10.md 12절).
 *
 * 색인된 /keyword/* 페이지가 거의 사라지면 Search Console에서 제출을 지우고 이 파일도 지운다.
 * 본 사이트맵(sitemap.ts)과 robots.txt에는 넣지 않는다.
 */
export const dynamic = 'force-dynamic'

/** noindex를 배포한 날. 그 전에 구글이 본 주소만 대상이고, lastmod도 이 날짜로 알린다. */
const NOINDEX_SINCE = new Date('2026-10-02T00:00:00+09:00')

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const keywords = await listKeywordsFirstSeenBefore(NOINDEX_SINCE)
  const lastmod = NOINDEX_SINCE.toISOString()

  const urls = keywords
    .map(
      (keyword) =>
        `<url><loc>${escapeXml(`${SITE.url}/keyword/${encodeURIComponent(keyword)}`)}</loc><lastmod>${lastmod}</lastmod></url>`
    )
    .join('\n')

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'content-type': 'application/xml; charset=utf-8' } }
  )
}
