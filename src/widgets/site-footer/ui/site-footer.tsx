import Link from 'next/link'

import { SITE } from '@/shared/config/site'

const FOOTER_LINKS = [
  { href: '/about', label: '서비스 소개' },
  { href: '/privacy', label: '개인정보처리방침' },
  { href: '/terms', label: '이용약관' },
] as const

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/70">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-lg space-y-2">
            <p className="text-sm font-bold tracking-tight">{SITE.name}</p>
            <p className="whitespace-pre-line text-[13px] leading-relaxed text-muted-foreground">
              {SITE.description.replace('. ', '.\n')}
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 border-t border-border/70 pt-6 text-[12px] leading-relaxed text-muted-foreground">
          <p>
            실시간 인기 검색어는 Google 트렌드가 공식 제공하는 RSS 피드를, 검색어 트렌드는 네이버
            데이터랩을 출처로 합니다. 본 서비스는 Google 및 네이버와 제휴 관계가 없습니다.
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} {SITE.name}
          </p>
        </div>
      </div>
    </footer>
  )
}
