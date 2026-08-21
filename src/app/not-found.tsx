import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <p className="tabular text-[13px] font-bold tracking-widest text-heat">404</p>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight">페이지를 찾을 수 없습니다</h1>
      <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
        주소가 바뀌었거나, 순위에서 내려간 검색어일 수 있습니다. 실시간 순위에서 지금 뜨는 검색어를
        확인해 보세요.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">실시간 순위 보기</Link>
      </Button>
    </div>
  )
}
