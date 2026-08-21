export interface TrendingNewsItem {
  title: string
  url: string
  source: string
  picture?: string
}

export interface TrendingTopic {
  /** 1부터 시작하는 순위 */
  rank: number
  title: string
  /** URL 경로에 쓰는 인코딩된 검색어 */
  slug: string
  /** 구글이 주는 대략적 검색량 문자열 ("100+", "2000+" 등) */
  approxTraffic: string
  /** approxTraffic을 정렬/비교에 쓰기 위해 숫자로 바꾼 값 */
  approxTrafficValue: number
  picture?: string
  pictureSource?: string
  pubDate: string
  news: TrendingNewsItem[]
}
