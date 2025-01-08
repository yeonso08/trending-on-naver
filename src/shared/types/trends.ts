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
  timeUnit: TimeUnitType
  keywordGroups: KeywordGroup[]
  device?: DeviceType
  gender?: GenderType
  ages?: AgeType[]
}

export type TimeUnitType = 'date' | 'week' | 'month'
export const TIME_UNIT_KO: Record<TimeUnitType, string> = {
  date: '일간',
  week: '주간',
  month: '월간',
}

export type DeviceType = 'pc' | 'm' | 'all'
export const DEVICE_TYPE_KO: Record<DeviceType, string> = {
  all: '전체',
  pc: '데스크탑',
  m: '모바일',
}

export type GenderType = 'all' | 'm' | 'f'
export const GENDER_TYPE_KO: Record<GenderType, string> = {
  all: '전체',
  m: '남성',
  f: '여성',
}
export type AgeType = 'all' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11'

export const AGE_TYPE_KO: Record<AgeType, string> = {
  all: '전체',
  '1': '0-12세',
  '2': '13-18세',
  '3': '19-24세',
  '4': '25-29세',
  '5': '30-34세',
  '6': '35-39세',
  '7': '40-44세',
  '8': '45-49세',
  '9': '50-54세',
  '10': '55-59세',
  '11': '60세 이상',
} as const
