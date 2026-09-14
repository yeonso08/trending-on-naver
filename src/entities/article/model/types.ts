export interface ArticleMeta {
  /** 파일 이름에서 온 URL 조각 (영문 소문자·숫자·하이픈) */
  slug: string
  title: string
  /** 목록과 검색 결과 설명에 쓰는 한두 문장 */
  description: string
  /** 처음 올린 날 "YYYY-MM-DD" */
  date: string
  /** 내용을 크게 고친 날 "YYYY-MM-DD" */
  updated?: string
  author: string
  /** 초안은 `pnpm dev`에서만 보이고 배포본에는 나가지 않는다 */
  draft: boolean
  /** 본문 글자 수로 어림한 읽는 시간(분) */
  readingMinutes: number
}

export interface Article extends ArticleMeta {
  /** 마크다운을 변환한 HTML */
  html: string
}
