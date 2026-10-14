import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { listArticles } from '@/entities/article/api/get-articles'
import { articlePagePath, countArticlePages } from '@/entities/article/model/pagination'
import { ARTICLES_DESCRIPTION, ArticleListPage } from '@/widgets/article-list/ui/article-list-page'

/**
 * 인사이트 목록 2페이지부터. /articles와 같은 이유로 빌드 때 한 번만 만든다.
 * 1페이지는 /articles 하나만 두므로 /articles/page/1은 404다.
 */
export const dynamic = 'force-static'
export const dynamicParams = false

interface Props {
  params: Promise<{ page: string }>
}

export async function generateStaticParams() {
  const totalPages = countArticlePages((await listArticles()).length)
  return Array.from({ length: totalPages - 1 }, (_, index) => ({ page: String(index + 2) }))
}

function parsePage(value: string): number | null {
  return /^[1-9]\d*$/.test(value) ? Number(value) : null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = parsePage((await params).page)
  if (!page) return {}

  // 쪽마다 제목과 canonical을 따로 둔다. 1페이지로 canonical을 몰면 뒤쪽 글 링크를 구글이 덜 따라간다.
  return {
    title: `인사이트 (${page}페이지)`,
    description: ARTICLES_DESCRIPTION,
    alternates: { canonical: articlePagePath(page) },
  }
}

export default async function ArticlesPagedPage({ params }: Props) {
  const page = parsePage((await params).page)
  const totalPages = countArticlePages((await listArticles()).length)
  if (!page || page < 2 || page > totalPages) notFound()

  return <ArticleListPage page={page} />
}
