export interface NaverTrendResponse {
  startDate: string
  endDate: string
  timeUnit: string
  results: Array<{
    data: TrendData[]
    keywords: string[]
    title: string
  }>
}

export interface TrendData {
  period: string
  ratio: number
}

export interface KeywordGroup {
  groupName: string
  keywords: string[]
}
export interface SearchParams {
  startDate: string
  endDate: string
  timeUnit: 'date' | 'week' | 'month'
  keywordGroups: KeywordGroup[]
  device?: 'pc' | 'mo'
  gender?: 'm' | 'f'
  ages?: string[]
}
