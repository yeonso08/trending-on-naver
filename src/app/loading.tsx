import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { ADSENSE_ENABLED, ADSENSE_SLOTS } from '@/shared/config/adsense'

export default function Loading() {
  const hasRectangleAd = ADSENSE_ENABLED && Boolean(ADSENSE_SLOTS.rectangle)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <Skeleton className="mx-auto h-10 w-3/4" />
        <Skeleton className="mx-auto h-5 w-full" />
      </div>
      <div
        className={cn(
          'mt-8',
          hasRectangleAd ? 'grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]' : 'mx-auto max-w-2xl'
        )}
      >
        <Skeleton className="h-[520px] w-full rounded-xl" />
        {hasRectangleAd && <Skeleton className="hidden h-[250px] w-full rounded-xl lg:block" />}
      </div>
    </div>
  )
}
