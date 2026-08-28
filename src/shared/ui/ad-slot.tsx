import { cn } from '@/lib/utils'
import {
  ADSENSE_CLIENT,
  ADSENSE_ENABLED,
  ADSENSE_SLOTS,
  type AdFormat,
} from '@/shared/config/adsense'

const FORMAT_STYLES: Record<AdFormat, string> = {
  /* 헤더 아래 / 푸터 위 가로 배너 */
  leaderboard: 'min-h-[90px] sm:min-h-[90px]',
  /* 사이드바 */
  rectangle: 'min-h-[250px]',
  /* 목록 사이에 끼워 넣는 네이티브형 */
  'in-feed': 'min-h-[120px]',
}

interface AdSlotProps {
  format: AdFormat
  className?: string
}

/**
 * AdSense 지면.
 *
 * 게시자 ID나 해당 지면의 광고 단위 ID가 없으면 **아무것도 렌더하지 않습니다.**
 * 예전에는 점선 자리표시자를 그렸는데, 그대로 배포되면 미완성으로 보입니다.
 *
 * 지면 크기는 미리 잡아 두었으므로 광고가 들어와도 레이아웃 시프트(CLS)가 없습니다.
 */
export function AdSlot({ format, className }: AdSlotProps) {
  const slot = ADSENSE_SLOTS[format]
  if (!ADSENSE_ENABLED || !slot) return null

  return (
    <aside
      aria-label="광고"
      className={cn('w-full overflow-hidden', FORMAT_STYLES[format], className)}
    >
      <ins
        className="adsbygoogle block w-full"
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format === 'in-feed' ? 'fluid' : 'auto'}
        data-full-width-responsive="true"
      />
      <script
        dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }}
      />
    </aside>
  )
}
