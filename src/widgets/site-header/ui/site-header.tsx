import Link from 'next/link'

import { ModeToggle } from '@/components/mode-toggle'
import { SITE } from '@/shared/config/site'
import { KeywiMark } from '@/shared/ui/brand/keywi-mark'

import { NavLinks } from './nav-links'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-14 items-center gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <KeywiMark className="h-8 w-8" />
            <span className="text-[15px] font-bold tracking-tight">{SITE.name}</span>
          </Link>

          {/* 넓은 화면에서는 로고 옆에 붙인다 */}
          <NavLinks className="hidden items-center gap-1 sm:flex" />

          <div className="ml-auto shrink-0">
            <ModeToggle />
          </div>
        </div>

        {/* 좁은 화면에서는 아래 줄로 내려 가로 스크롤시킨다 */}
        <NavLinks className="-mx-1 flex items-center gap-1 overflow-x-auto pb-2 sm:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" />
      </div>
    </header>
  )
}
