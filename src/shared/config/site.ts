export const SITE = {
  name: '트렌드나우',
  nameEn: 'Trend Now',
  tagline: '지금 대한민국이 검색하는 것',
  description:
    '실시간 인기 검색어 순위와 네이버 데이터랩 기반 검색어 트렌드 분석을 한 곳에서. 지금 뜨는 키워드를 확인하고 검색량 추이를 그래프로 비교하세요.',
  url: 'https://trending-on-naver.vercel.app',
  locale: 'ko_KR',
} as const

export const NAV_LINKS = [
  { href: '/', label: '실시간 순위' },
  { href: '/analysis', label: '트렌드 분석' },
  { href: '/about', label: '소개' },
] as const
