export const SITE = {
  name: '키위',
  nameEn: 'Keywi',
  tagline: '지금 뜨는 키워드와, 뜬 이유',
  description:
    '실시간 인기 검색어 순위와 네이버 데이터랩 기반 검색어 트렌드 분석을 한 곳에서. 지금 뜨는 키워드를 확인하고 검색량 추이를 그래프로 비교하세요.',
  // 도메인(keywi.kr)은 아직 연결 전이다. 여기를 먼저 바꾸면 canonical·sitemap이
  // 존재하지 않는 주소를 가리켜 색인이 깨진다. Vercel에 도메인을 붙인 뒤 교체할 것.
  url: 'https://trending-on-naver.vercel.app',
  locale: 'ko_KR',
} as const

export const NAV_LINKS = [
  { href: '/', label: '실시간 순위' },
  { href: '/analysis', label: '트렌드 분석' },
  { href: '/about', label: '소개' },
] as const
