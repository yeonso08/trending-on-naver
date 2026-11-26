import type { Ref } from 'react'

/**
 * 산타가 탄 오픈카 제설차 그림. 오른쪽을 보고 달린다.
 *
 * viewBox 120×80, 바퀴 바닥 y=79, 날 끝 x≈116. 위치·바퀴 회전·덜컹임은 snow-plow.ts가 매 프레임
 * 옮기고, 손 흔들기만 SVG 자체 애니메이션이다. 산타 빨강·강철 회색은 이 그림 전용 색이라
 * 브랜드 그린·데이터 오렌지와 겹치지 않는다.
 */

const RED = '#D63A3A'
const RED_DARK = '#A92A2A'
const SKIN = '#F4C7A1'
const FUR = '#FFFFFF'
const FUR_EDGE = '#D5DAE1'
const STEEL = '#A9B2BC'
const STEEL_DARK = '#6E7782'
const TIRE = '#2A2E35'
const OUTLINE = 'rgba(0,0,0,0.18)'

function Wheel({ cx }: { cx: number }) {
  return (
    <g data-wheel data-cx={cx}>
      <circle cx={cx} cy={70} r={9} fill={TIRE} />
      <circle cx={cx} cy={70} r={4.6} fill="#C7CDD4" />
      <path
        d={`M${cx - 4.2} 70 H${cx + 4.2} M${cx} 65.8 V74.2`}
        stroke="#7D8590"
        strokeWidth={1.3}
      />
      <circle cx={cx} cy={70} r={1.3} fill="#7D8590" />
    </g>
  )
}

export function SantaPlow({ ref }: { ref: Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-40 will-change-transform"
      style={{ visibility: 'hidden', opacity: 0 }}
    >
      <svg viewBox="0 0 120 80" width="100%" height="100%" overflow="visible">
        {/* 바닥 그림자 */}
        <ellipse cx={60} cy={79} rx={52} ry={2.2} fill="rgba(0,0,0,0.13)" />

        <g data-body>
          {/* 뒷자리 선물 자루 */}
          <path
            d="M11 47 Q9 38 14 34 L13 31 Q17 29 21 31 L20 34 Q26 38 24 47 Z"
            fill="#9B6B43"
            stroke={OUTLINE}
            strokeWidth={0.8}
          />
          <path d="M13 32.5 Q17 34 20.5 32.5" stroke="#6E4A2C" strokeWidth={1.2} fill="none" />

          {/* 실내. 산타와 앞유리 사이가 비어 보이지 않게 */}
          <rect x={30} y={44.5} width={42} height={8} rx={2} fill="#7E1F1F" />

          {/* 등받이 */}
          <rect x={27} y={36} width={8} height={16} rx={3} fill="#5A2A1E" />

          {/* 산타 몸통(아래는 차체에 가린다) */}
          <rect x={33} y={28} width={22} height={26} rx={9} fill={RED} stroke={OUTLINE} />
          <rect x={33.5} y={42} width={21} height={3.4} fill="#26211E" />
          <rect x={45} y={41.4} width={4.6} height={4.6} rx={0.8} fill="none" stroke="#E9C25A" />
          <rect x={47.5} y={28.5} width={3.2} height={13} rx={1.4} fill={FUR} />

          {/* 운전대 잡은 팔 */}
          <path d="M52 33 Q58 37 62 41" stroke={RED} strokeWidth={5} strokeLinecap="round" />
          <path d="M66 36 L69 49" stroke="#3B3F46" strokeWidth={1.5} />
          <ellipse
            cx={65.5}
            cy={39.5}
            rx={1.8}
            ry={5}
            fill="none"
            stroke="#3B3F46"
            strokeWidth={1.6}
          />
          <circle cx={62.5} cy={41} r={2.6} fill={FUR} stroke={FUR_EDGE} strokeWidth={0.6} />

          {/* 얼굴 */}
          <circle cx={45} cy={20} r={7.2} fill={SKIN} />
          <circle cx={42.4} cy={18.4} r={0.9} fill="#2A2420" />
          <circle cx={47.6} cy={18.4} r={0.9} fill="#2A2420" />
          <circle cx={40.6} cy={21} r={1.5} fill="#F2A1A1" opacity={0.7} />
          <circle cx={49.4} cy={21} r={1.5} fill="#F2A1A1" opacity={0.7} />
          {/* 수염 */}
          <path
            d="M37.6 20.5 Q37 30 45 34 Q53 30 52.4 20.5 Q49 25 45 24.5 Q41 25 37.6 20.5 Z"
            fill={FUR}
            stroke={FUR_EDGE}
            strokeWidth={0.6}
          />
          <path
            d="M41.2 23.4 Q43.2 21.6 45 23 Q46.8 21.6 48.8 23.4 Q46.8 24.8 45 23.9 Q43.2 24.8 41.2 23.4 Z"
            fill={FUR}
            stroke={FUR_EDGE}
            strokeWidth={0.5}
          />
          <circle cx={45} cy={21.4} r={1.6} fill="#E58F7B" />
          {/* 모자. 끝이 뒤로 접힌다 */}
          <path d="M40 6.2 Q38 2.6 35 2.2 Q41 0.8 47.5 4.2 Z" fill={RED_DARK} />
          <path
            d="M37 13.5 Q37.5 4.5 45 4 Q52 4.5 53 13.5 Z"
            fill={RED}
            stroke={OUTLINE}
            strokeWidth={0.6}
          />
          <rect
            x={36.2}
            y={12}
            width={17.6}
            height={4.4}
            rx={2.2}
            fill={FUR}
            stroke={FUR_EDGE}
            strokeWidth={0.5}
          />
          <circle cx={35} cy={2.4} r={2.6} fill={FUR} stroke={FUR_EDGE} strokeWidth={0.5} />

          {/* 차체: 빨간 오픈카 */}
          <path
            d="M5 66 L5 53 Q6 47 13 46.5 L31 46.5 Q33 50 37 50 L64 50 L71 46.5 L92 47 Q100 48 101.5 54 L101.5 66 Z"
            fill={RED}
            stroke={OUTLINE}
            strokeWidth={0.8}
          />
          <rect x={5} y={60} width={96.5} height={6} fill={RED_DARK} />
          <path d="M8 55.5 H98" stroke="#F3D5D5" strokeWidth={1} opacity={0.8} />
          {/* 바퀴 집 */}
          <path d="M19 66 A11 11 0 0 1 41 66 Z" fill="#7E1F1F" />
          <path d="M75 66 A11 11 0 0 1 97 66 Z" fill="#7E1F1F" />
          {/* 앞유리 */}
          <path
            d="M67 50 L73.5 37.5 L76.5 37.5 L71 50 Z"
            fill="#CFE6F5"
            opacity={0.85}
            stroke="#9FB8C9"
            strokeWidth={0.6}
          />
          {/* 전조등 */}
          <circle cx={99.5} cy={51.5} r={2} fill="#FFE69A" stroke={OUTLINE} strokeWidth={0.5} />

          {/* 제설 날 */}
          <rect x={100} y={57} width={7} height={3.4} rx={1} fill={STEEL_DARK} />
          <path
            d="M104.5 47 Q111 46 115.5 48.5 Q120 62 117.5 78.5 L103.5 78.5 Q108 63 104.5 47 Z"
            fill={STEEL}
            stroke={STEEL_DARK}
            strokeWidth={0.9}
          />
          <path d="M107.5 50 Q112 60 110 75" stroke="#DCE2E8" strokeWidth={1.2} fill="none" />
          <path
            d="M104 74 H118"
            stroke="#E9C25A"
            strokeWidth={2}
            strokeDasharray="2.5 2.5"
            opacity={0.9}
          />

          {/* 손 흔드는 팔. 어깨(38,32)를 축으로 흔든다 */}
          <g>
            <path
              d="M38 32 Q29 27 27 16"
              stroke={RED}
              strokeWidth={5}
              strokeLinecap="round"
              fill="none"
            />
            <rect
              x={24}
              y={14.5}
              width={6}
              height={3}
              rx={1.5}
              fill={FUR}
              stroke={FUR_EDGE}
              strokeWidth={0.5}
            />
            <ellipse
              cx={27}
              cy={11}
              rx={3}
              ry={3.6}
              fill={FUR}
              stroke={FUR_EDGE}
              strokeWidth={0.6}
            />
            <ellipse
              cx={29.6}
              cy={12.2}
              rx={1.1}
              ry={1.6}
              fill={FUR}
              stroke={FUR_EDGE}
              strokeWidth={0.5}
            />
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="-14 38 32; 16 38 32; -14 38 32"
              dur="0.9s"
              repeatCount="indefinite"
            />
          </g>
        </g>

        <Wheel cx={30} />
        <Wheel cx={86} />
      </svg>
    </div>
  )
}
