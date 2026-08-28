import type { Metadata } from 'next'

import { SITE } from '@/shared/config/site'
import { Prose } from '@/shared/ui/prose'

const CONTACT_EMAIL = 'nukko.team@gmail.com'

export const metadata: Metadata = {
  title: '서비스 소개',
  description: `${SITE.name}가 어떤 데이터를 어디서 가져와 어떻게 보여주는지 설명합니다.`,
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <Prose>
      <h1>서비스 소개</h1>
      <p>
        {SITE.name}는 지금 대한민국에서 사람들이 무엇을 검색하고 있는지, 그리고 특정 검색어의
        관심도가 시간에 따라 어떻게 변했는지를 한 곳에서 보여주는 서비스입니다.
      </p>

      <h2>실시간 인기 검색어</h2>
      <p>
        메인 화면의 순위는 Google Trends가 공개하는 대한민국 인기 급상승 검색어를 기반으로 하며 약
        1분 간격으로 갱신됩니다. 각 검색어를 누르면 관련 뉴스와 최근 검색 관심도 추이를 함께 볼 수
        있습니다.
      </p>

      <h2>검색어 트렌드 분석</h2>
      <p>
        트렌드 분석 화면에서는 원하는 검색어를 직접 입력해 기간별 검색량 추이를 확인할 수 있습니다.
        성별, 연령대, 디바이스별로 나누어 볼 수 있으며 데이터는 네이버 데이터랩에서 제공받습니다.
      </p>
      <p>
        네이버 데이터랩이 제공하는 값은 검색 횟수의 절댓값이 아니라, 요청한 기간 중 검색량이 가장
        높은 시점을 100으로 두고 나머지를 상대적으로 환산한 수치입니다.
      </p>

      <h2>데이터 출처와 한계</h2>
      <ul>
        <li>실시간 인기 검색어: Google Trends</li>
        <li>검색어 트렌드: 네이버 데이터랩 검색어 트렌드</li>
        <li>
          본 서비스는 Google 및 네이버와 어떠한 제휴 관계도 없으며, 각 사가 공개하는 데이터를 가공해
          보여줄 뿐입니다.
        </li>
        <li>
          네이버는 2021년 2월 실시간 급상승 검색어 서비스를 종료했습니다. 따라서 이 사이트의 실시간
          순위는 네이버가 아닌 Google Trends 기준입니다.
        </li>
      </ul>

      <h2>문의</h2>
      <p>서비스에 대한 문의나 오류 제보는 아래 메일로 보내 주세요.</p>
      <p>
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    </Prose>
  )
}
