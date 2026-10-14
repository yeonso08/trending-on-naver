/** 인사이트 목록 한 페이지에 보이는 글 수 */
export const ARTICLES_PER_PAGE = 10

export function countArticlePages(total: number): number {
  return Math.max(1, Math.ceil(total / ARTICLES_PER_PAGE))
}

/** 1페이지는 목록 주소 그대로, 2페이지부터 /articles/page/<n> */
export function articlePagePath(page: number): string {
  return page <= 1 ? '/articles' : `/articles/page/${page}`
}

export function sliceArticlePage<T>(items: T[], page: number): T[] {
  const start = (page - 1) * ARTICLES_PER_PAGE
  return items.slice(start, start + ARTICLES_PER_PAGE)
}
