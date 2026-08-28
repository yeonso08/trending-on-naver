import type { Metadata } from 'next'

import { SITE } from '@/shared/config/site'
import { Prose } from '@/shared/ui/prose'

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: `${SITE.name}의 개인정보 수집·이용 및 광고 쿠키 사용에 대한 안내입니다.`,
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <Prose>
      <h1>개인정보처리방침</h1>
      <p>
        {SITE.name}(이하 &lsquo;서비스&rsquo;)는 이용자의 개인정보를 소중히 여기며, 아래와 같이
        개인정보를 처리합니다.
      </p>

      <h2>1. 수집하는 정보</h2>
      <p>
        서비스는 회원가입 절차가 없으며 이름, 연락처, 주소 등 이용자를 직접 식별할 수 있는 정보를
        수집하지 않습니다. 다만 서비스 개선을 위해 다음과 같은 정보가 자동으로 수집될 수 있습니다.
      </p>
      <ul>
        <li>접속 기기 및 브라우저 종류, 화면 크기</li>
        <li>방문한 페이지와 머문 시간</li>
        <li>접속 국가 및 지역 단위의 대략적 위치</li>
      </ul>

      <h2>2. 이용 목적</h2>
      <p>
        수집된 정보는 통계 분석을 통한 서비스 개선, 오류 진단, 페이지 성능 측정 목적으로만
        이용합니다.
      </p>

      <h2>3. 쿠키와 광고</h2>
      <p>
        서비스는 Google AdSense를 통해 광고를 게재할 수 있습니다. Google을 포함한 제3자 광고
        사업자는 쿠키를 사용하여 이용자의 이전 방문 기록을 바탕으로 광고를 게재할 수 있습니다.
      </p>
      <p>
        이용자는 Google 광고 설정 페이지에서 맞춤 광고를 해제할 수 있으며, 브라우저 설정을 통해 쿠키
        저장을 거부할 수 있습니다. 쿠키를 거부하더라도 서비스 이용에는 제한이 없습니다.
      </p>

      <h2>4. 이용하는 외부 서비스</h2>
      <ul>
        <li>Vercel Analytics, Vercel Speed Insights — 방문 통계 및 성능 측정</li>
        <li>Google AdSense — 광고 게재</li>
      </ul>

      <h2>5. 보유 및 파기</h2>
      <p>
        서비스는 이용자를 식별할 수 있는 개인정보를 직접 저장하지 않습니다. 위 외부 서비스가
        수집하는 정보의 보유 기간은 각 사업자의 정책을 따릅니다.
      </p>

      <h2>6. 문의</h2>
      <p>개인정보 처리에 관한 문의는 서비스 소개 페이지에 안내된 주소로 보내 주세요.</p>

      <h2>7. 고지</h2>
      <p>본 방침은 2026년 8월 21일부터 적용됩니다.</p>
    </Prose>
  )
}
