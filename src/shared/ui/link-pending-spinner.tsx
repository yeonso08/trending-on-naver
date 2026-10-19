'use client'

import { Loader2 } from 'lucide-react'
import { useLinkStatus } from 'next/link'

import { cn } from '@/lib/utils'

/**
 * 감싼 <Link>의 이동이 끝나기 전까지 스피너를 띄운다. 반드시 Link 안에 둔다.
 * 동적 렌더 페이지는 서버 응답을 기다리는 동안 화면이 멈춘 듯 보여서, 누른 자리에서 바로 반응을 보인다.
 */
export function LinkPendingSpinner({ className }: { className?: string }) {
  const { pending } = useLinkStatus()
  if (!pending) return null

  return (
    <span aria-hidden="true" className={cn('flex items-center justify-center', className)}>
      <Loader2 className="h-4 w-4 motion-safe:animate-spin" />
    </span>
  )
}
