import Link from 'next/link'

import { listArticles } from '@/entities/article/api/get-articles'
import {
  articlePagePath,
  countArticlePages,
  sliceArticlePage,
} from '@/entities/article/model/pagination'
import { cn } from '@/lib/utils'
import { formatDateKey } from '@/shared/lib/format'
import { buildBreadcrumbSchema, buildGraph } from '@/shared/model/structured-data'
import { JsonLd } from '@/shared/ui/json-ld'
import { TrendingSidebarLayout } from '@/widgets/trending-searches/ui/trending-sidebar-layout'

export const ARTICLES_DESCRIPTION =
  '검색어 트렌드를 읽는 법, 그리고 키위가 모은 실시간 검색어 기록으로 쓴 리포트를 모았습니다.'

/** 인사이트 목록. /articles(1페이지)와 /articles/page/<n>이 함께 쓴다. */
export async function ArticleListPage({ page }: { page: number }) {
  const articles = await listArticles()
  const totalPages = countArticlePages(articles.length)
  const pageArticles = sliceArticlePage(articles, page)

  const trail = [{ name: '인사이트', path: '/articles' }]
  if (page > 1) trail.push({ name: `${page}페이지`, path: articlePagePath(page) })

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <JsonLd data={buildGraph(buildBreadcrumbSchema(trail))} />

      <TrendingSidebarLayout>
        <h1 className="text-balance text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
          인사이트
        </h1>
        <p className="mt-4 text-pretty text-[15px] leading-relaxed text-muted-foreground">
          {ARTICLES_DESCRIPTION}
        </p>

        {articles.length === 0 ? (
          <p className="mt-10 rounded-xl border border-border/70 bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            아직 올라온 글이 없습니다.
          </p>
        ) : (
          <ul className="mt-8 divide-y divide-border/60 overflow-hidden rounded-xl border border-border/70 bg-card">
            {pageArticles.map((article) => (
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

        {totalPages > 1 && <Pagination page={page} totalPages={totalPages} />}
      </TrendingSidebarLayout>
    </div>
  )
}

/** 쪽 번호는 전부 보여 준다. 매주 한두 편 느는 속도라 수십 쪽까지는 한 줄에 들어간다. */
function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)
  const stepClass =
    'rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'

  return (
    <nav
      aria-label="인사이트 목록 페이지"
      className="mt-8 flex flex-wrap items-center justify-center gap-1"
    >
      {page > 1 && (
        <Link href={articlePagePath(page - 1)} rel="prev" className={stepClass}>
          이전
        </Link>
      )}
      {pages.map((number) => (
        <Link
          key={number}
          href={articlePagePath(number)}
          aria-current={number === page ? 'page' : undefined}
          className={cn(
            'min-w-9 rounded-lg px-3 py-2 text-center text-sm font-medium tabular-nums transition-colors',
            number === page
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          {number}
        </Link>
      ))}
      {page < totalPages && (
        <Link href={articlePagePath(page + 1)} rel="next" className={stepClass}>
          다음
        </Link>
      )}
    </nav>
  )
}
