import type { Metadata } from 'next'
import Link from 'next/link'

import { listArticles } from '@/entities/article/api/get-articles'
import { formatDateKey } from '@/shared/lib/format'
import { buildBreadcrumbSchema, buildGraph } from '@/shared/model/structured-data'
import { JsonLd } from '@/shared/ui/json-ld'

const DESCRIPTION =
  '검색어 트렌드를 읽는 법, 그리고 키위가 모은 실시간 검색어 기록으로 쓴 리포트를 모았습니다.'

export async function generateMetadata(): Promise<Metadata> {
  const articles = await listArticles()

  return {
    title: '인사이트',
    description: DESCRIPTION,
    alternates: { canonical: '/articles' },
    // 글이 없을 때 빈 목록 페이지를 색인시키지 않는다. 메뉴·사이트맵에서도 빠진다.
    ...(articles.length === 0 && { robots: { index: false, follow: true } }),
  }
}

export default async function ArticlesPage() {
  const articles = await listArticles()

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <JsonLd data={buildGraph(buildBreadcrumbSchema([{ name: '인사이트', path: '/articles' }]))} />

      <h1 className="text-balance text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
        인사이트
      </h1>
      <p className="mt-4 text-pretty text-[15px] leading-relaxed text-muted-foreground">
        {DESCRIPTION}
      </p>

      {articles.length === 0 ? (
        <p className="mt-10 rounded-xl border border-border/70 bg-card px-4 py-10 text-center text-sm text-muted-foreground">
          아직 올라온 글이 없습니다.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-border/60 overflow-hidden rounded-xl border border-border/70 bg-card">
          {articles.map((article) => (
            <li key={article.slug}>
              <Link
                href={`/articles/${article.slug}`}
                className="group block px-4 py-5 transition-colors hover:bg-muted/60 sm:px-5"
              >
                <h2 className="break-keep text-[17px] font-bold leading-snug tracking-tight">
                  {article.draft && (
                    <span className="mr-2 rounded bg-muted px-1.5 py-0.5 align-middle text-[11px] font-semibold text-muted-foreground">
                      초안
                    </span>
                  )}
                  {article.title}
                </h2>
                <p className="mt-2 line-clamp-2 break-keep text-[14px] leading-relaxed text-muted-foreground">
                  {article.description}
                </p>
                <p className="mt-3 text-[12px] text-muted-foreground">
                  <time dateTime={article.date}>{formatDateKey(article.date)}</time>
                  <span className="text-muted-foreground/60"> · </span>
                  {article.readingMinutes}분 분량
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
