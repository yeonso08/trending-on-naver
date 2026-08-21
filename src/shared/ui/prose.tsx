import { cn } from '@/lib/utils'

/** 약관·정책처럼 글이 중심인 페이지의 공통 타이포그래피 */
export function Prose({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14',
        '[&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:tracking-tight',
        '[&_h2]:mt-10 [&_h2]:text-[17px] [&_h2]:font-bold [&_h2]:tracking-tight',
        '[&_p]:mt-3 [&_p]:text-[14px] [&_p]:leading-relaxed [&_p]:text-muted-foreground',
        '[&_ul]:mt-3 [&_ul]:space-y-2 [&_li]:text-[14px] [&_li]:leading-relaxed',
        '[&_li]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-5',
        className
      )}
    >
      {children}
    </div>
  )
}
