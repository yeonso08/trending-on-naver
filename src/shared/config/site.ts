export const SITE = {
  name: '키위',
  nameEn: 'Keywi',
  tagline: '지금 뜨는 키워드와, 뜬 이유',
  description:
    '실시간 인기 검색어 순위와 네이버 데이터랩 기반 검색어 트렌드 분석을 한 곳에서. 지금 뜨는 키워드를 확인하고 검색량 추이를 그래프로 비교하세요.',
  // 정식 주소는 apex다. www.keywi.kr은 308로 이쪽에 합쳐진다.
  // metadataBase를 타고 canonical·sitemap·OG가 전부 이 값에서 나오므로
  // 실제 정식 주소와 어긋나면 canonical이 리다이렉트 대상을 가리켜 색인이 꼬인다.
  url: 'https://keywi.kr',
  locale: 'ko_KR',
} as const

export const NAV_LINKS = [
  { href: '/', label: '실시간 순위' },
  { href: '/analysis', label: '트렌드 분석' },
  { href: '/about', label: '소개' },
] as const
