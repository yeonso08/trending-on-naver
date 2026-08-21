'use client'

import { useEffect } from 'react'

import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <p className="text-[13px] font-bold tracking-widest text-heat">ERROR</p>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight">문제가 발생했습니다</h1>
      <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
        {error.message || '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'}
      </p>
      <Button onClick={reset} className="mt-6">
        다시 시도
      </Button>
    </div>
  )
}
