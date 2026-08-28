'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'
import { NAV_LINKS } from '@/shared/config/site'

/** 홈('/')은 정확히 일치할 때만, 나머지는 하위 경로도 활성으로 본다 */
function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}

export function NavLinks({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <nav className={className}>
      {NAV_LINKS.map((link) => {
        const active = isActive(pathname, link.href)

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground',
              active ? 'bg-muted text-foreground' : 'text-muted-foreground'
            )}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
