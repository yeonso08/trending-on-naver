import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Search } from 'lucide-react'

import {
  buildNaverSearchUrl,
  getTrendingTopicByKeyword,
  getTrendingTopics,
} from '@/entities/trending/api/get-trending-topics'
import { KeywordTrendChart } from '@/features/keyword-detail/ui/keyword-trend-chart'
import { RelatedNews } from '@/features/keyword-detail/ui/related-news'
import { getKeywordTrend } from '@/shared/api/naver-datalab'
import { SITE } from '@/shared/config/site'
import { buildBreadcrumbSchema, buildGraph } from '@/shared/model/structured-data'
import { AdSlot } from '@/shared/ui/ad-slot'
import { JsonLd } from '@/shared/ui/json-ld'
import { TrendingSearches } from '@/widgets/trending-searches/ui/trending-searches'

interface KeywordPageProps {
  params: Promise<{ keyword: string }>
}

/** 현재 순위권 검색어는 미리 만들어 둔다. 목록은 1분마다 갱신된다. */
export async function generateStaticParams() {
  const topics = await getTrendingTopics()
  // Next.js가 URL 인코딩을 담당한다. 이미 encodeURIComponent된 slug를 넘기면
  // 이중 인코딩되어 렌더 시점에 디코딩해도 원본과 매칭되지 않는다.
  return topics.map((topic) => ({ keyword: topic.title }))
}

export async function generateMetadata({ params }: KeywordPageProps): Promise<Metadata> {
  const { keyword: rawKeyword } = await params
  const keyword = decodeURIComponent(rawKeyword)
  const topic = await getTrendingTopicByKeyword(keyword)

  if (!topic) {
    return { title: keyword, robots: { index: false, follow: false } }
  }

  const description = topic.news[0]
    ? `${keyword} — 실시간 검색어 ${topic.rank}위. ${topic.news[0].title}`
    : `${keyword}의 실시간 검색어 순위와 최근 30일 검색 관심도 추이를 확인하세요.`

  return {
    title: `${keyword} — 실시간 검색어 ${topic.rank}위`,
    description,
    alternates: { canonical: `/keyword/${topic.slug}` },
    // images를 여기서 지정하면 파일 기반 opengraph-image.tsx를 덮어쓴다.
    // 구글 RSS의 topic.picture는 gstatic 핫링크에 폭이 수백 px뿐이라
    // summary_large_image 카드에 맞지 않는다. 우리가 그리는 1200x630 카드를 쓴다.
    openGraph: {
      title: `${keyword} — 실시간 검색어 ${topic.rank}위 | ${SITE.name}`,
      description,
    },
  }
}

export default async function KeywordPage({ params }: KeywordPageProps) {
  const { keyword: rawKeyword } = await params
  const keyword = decodeURIComponent(rawKeyword)
  const topic = await getTrendingTopicByKeyword(keyword)

  // 순위에서 내려간 검색어는 보여줄 내용이 없다. 빈 페이지를 색인시키지 않는다.
  if (!topic) notFound()

  // 서버에서 캐시와 함께 조회한다. 키가 없거나 호출이 실패하면 null이고 차트는 생략된다.
  const trend = await getKeywordTrend(topic.title)

  // 같은 요청 내 fetch라 Next.js가 getTrendingTopicByKeyword의 조회와 중복 호출을 합쳐준다.
  const topics = await getTrendingTopics()
  const fetchedAt = new Date().toISOString()

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <JsonLd
        data={buildGraph(
          buildBreadcrumbSchema([
            { name: '실시간 순위', path: '/' },
            { name: topic.title, path: `/keyword/${topic.slug}` },
          ])
        )}
      />

      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        실시간 순위
      </Link>

      <div className="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="space-y-8">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-heat-soft px-2 py-0.5 text-[12px] font-bold text-heat ring-1 ring-inset ring-heat-border">
                  {topic.rank}위
                </span>
                {topic.approxTraffic && (
                  <span className="tabular text-[12px] text-muted-foreground">
                    검색량 {topic.approxTraffic}
                  </span>
                )}
              </div>

              <h1 className="mt-3 text-balance text-[32px] font-extrabold leading-tight tracking-tight sm:text-4xl">
                {topic.title}
              </h1>
            </div>

            <a
              href={buildNaverSearchUrl(topic.title)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Search className="h-3.5 w-3.5" />
              네이버에서 검색
            </a>
          </header>

          <AdSlot format="leaderboard" />

          {trend && <KeywordTrendChart data={trend} />}

          <RelatedNews news={topic.news} />
        </div>

        <div className="space-y-6 lg:sticky lg:top-20">
          <TrendingSearches topics={topics} fetchedAt={fetchedAt} compact />
          <AdSlot format="rectangle" />
        </div>
      </div>
    </div>
  )
}
