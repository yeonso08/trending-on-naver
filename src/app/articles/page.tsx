import type { Metadata } from 'next'

import { listArticles } from '@/entities/article/api/get-articles'
import { ARTICLES_DESCRIPTION, ArticleListPage } from '@/widgets/article-list/ui/article-list-page'

/**
 * 글은 배포할 때만 바뀌므로 빌드 때 한 번 만들고 다시 만들지 않는다(재생성마다 ISR Writes가
 * 쌓여 Hobby 한도를 넘긴 적이 있다, 2026-09-28). 사이드바 순위는 빌드 시점 값으로 그려지고
 * TrendingSearches가 마운트 즉시 최신으로 바꾼다. 2페이지부터는 /articles/page/[page].
 */
export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  const articles = await listArticles()

  return {
    title: '인사이트',
    description: ARTICLES_DESCRIPTION,
    alternates: { canonical: '/articles' },
    // 글이 없을 때 빈 목록 페이지를 색인시키지 않는다. 메뉴·사이트맵에서도 빠진다.
    ...(articles.length === 0 && { robots: { index: false, follow: true } }),
  }
}

export default function ArticlesPage() {
  return <ArticleListPage page={1} />
}
