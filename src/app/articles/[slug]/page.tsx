import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { getArticle, listArticles } from '@/entities/article/api/get-articles'
import { formatDateKey } from '@/shared/lib/format'
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildGraph,
} from '@/shared/model/structured-data'
import { AdSlot } from '@/shared/ui/ad-slot'
import { ArticleProse } from '@/shared/ui/article-prose'
import { JsonLd } from '@/shared/ui/json-ld'

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

/** 글은 레포의 파일이라 빌드 시점에 전부 알 수 있다. 없는 주소는 진짜 404를 낸다. */
export const dynamicParams = false

export async function generateStaticParams() {
  return (await listArticles()).map((article) => ({ slug: article.slug }))
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return {}

  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.description,
      publishedTime: article.date,
      modifiedTime: article.updated ?? article.date,
      authors: [article.author],
    },
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  // 글끼리 이어 읽도록 최신 글 몇 개를 붙인다
  const others = (await listArticles()).filter((item) => item.slug !== slug).slice(0, 3)

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <JsonLd
        data={buildGraph(
          buildBreadcrumbSchema([
            { name: '글', path: '/articles' },
            { name: article.title, path: `/articles/${article.slug}` },
          ]),
          buildArticleSchema(article)
        )}
      />

      <Link
        href="/articles"
        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />글 목록
      </Link>

      <article className="mt-6">
        <header>
          {article.draft && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
              초안 · 배포본에는 나가지 않습니다
            </span>
          )}
          {/*
            text-balance는 줄 길이를 맞추느라 첫 줄 오른쪽을 비워 둔다. 긴 한국어 제목에선 빈 공간으로 보이므로
            쓰지 않는다. 대신 break-keep으로 음절 중간("추/이")이 아니라 띄어쓰기에서만 줄을 바꾸고,
            text-pretty로 마지막 줄에 단어 하나만 남는 것("… 볼 수 / 있나")을 막는다.
          */}
          <h1 className="mt-2 text-pretty break-keep text-[30px] font-extrabold leading-tight tracking-tight sm:text-[36px]">
            {article.title}
          </h1>
          <p className="mt-4 break-keep text-[16px] leading-relaxed text-muted-foreground">
            {article.description}
          </p>
          <p className="mt-5 text-[13px] text-muted-foreground">
            {article.author}
            <span className="text-muted-foreground/60"> · </span>
            <time dateTime={article.date}>{formatDateKey(article.date)}</time>
            {article.updated && article.updated !== article.date && (
              <>
                <span className="text-muted-foreground/60"> · </span>
                <time dateTime={article.updated}>{formatDateKey(article.updated)} 수정</time>
              </>
            )}
            <span className="text-muted-foreground/60"> · </span>
            {article.readingMinutes}분 분량
          </p>
        </header>

        <div className="mt-8">
          <AdSlot format="leaderboard" />
        </div>

        <ArticleProse html={article.html} className="mt-10" />
      </article>

      {others.length > 0 && (
        <section className="mt-16 border-t border-border/70 pt-8">
          <h2 className="text-[15px] font-bold tracking-tight">다른 글</h2>
          <ul className="mt-3 divide-y divide-border/60 overflow-hidden rounded-xl border border-border/70 bg-card">
            {others.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/articles/${item.slug}`}
                  className="block px-4 py-3.5 transition-colors hover:bg-muted/60"
                >
                  <span className="text-pretty text-[15px] font-semibold leading-snug tracking-tight">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-[12px] text-muted-foreground">
                    {formatDateKey(item.date)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
