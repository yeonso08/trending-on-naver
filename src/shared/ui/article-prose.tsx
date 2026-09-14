import { cn } from '@/lib/utils'

/**
 * 마크다운 글 본문의 타이포그래피. 약관용 `Prose`보다 크고 진하게, 요소 종류도 넓게 잡는다.
 * 링크 색에 --heat을 쓰지 않는다 — 오렌지는 데이터 표시 전용이다.
 */
export function ArticleProse({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={cn(
        'text-pretty text-[16px] leading-[1.85] text-foreground/90',
        '[&>*:first-child]:mt-0',
        '[&_h2]:mt-12 [&_h2]:text-[22px] [&_h2]:font-bold [&_h2]:leading-snug [&_h2]:tracking-tight [&_h2]:text-foreground',
        '[&_h3]:mt-9 [&_h3]:text-[18px] [&_h3]:font-bold [&_h3]:leading-snug [&_h3]:text-foreground',
        '[&_p]:mt-5',
        '[&_ul]:mt-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mt-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mt-2',
        '[&_strong]:font-bold [&_strong]:text-foreground',
        '[&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:decoration-foreground/30 [&_a]:underline-offset-4 hover:[&_a]:decoration-foreground',
        // 출처의 긴 URL은 줄바꿈할 곳이 없어 모바일에서 페이지 전체를 가로로 민다(390px에서 431px로 늘어남)
        '[&_a]:[overflow-wrap:anywhere]',
        '[&_blockquote]:mt-6 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground',
        '[&_img]:mt-6 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg [&_img]:border [&_img]:border-border/70',
        '[&_hr]:my-10 [&_hr]:border-border',
        '[&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.88em]',
        '[&_pre]:mt-6 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:text-[14px] [&_pre]:leading-relaxed',
        '[&_pre_code]:bg-transparent [&_pre_code]:p-0',
        '[&_.table-scroll]:mt-6 [&_.table-scroll]:overflow-x-auto',
        '[&_table]:w-full [&_table]:min-w-[28rem] [&_table]:border-collapse [&_table]:text-[14px]',
        '[&_th]:border-b [&_th]:border-border [&_th]:py-2 [&_th]:pr-4 [&_th]:text-left [&_th]:font-semibold [&_th]:text-foreground',
        '[&_td]:border-b [&_td]:border-border/60 [&_td]:py-2 [&_td]:pr-4 [&_td]:align-top',
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
