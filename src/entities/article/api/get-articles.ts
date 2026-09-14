import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

import matter from 'gray-matter'
import { marked } from 'marked'

import type { Article, ArticleMeta } from '@/entities/article/model/types'
import { SITE } from '@/shared/config/site'
import { isValidDateKey } from '@/shared/lib/format'

/**
 * 글 원본은 `content/articles/<slug>.md`. 작성 방법은 같은 폴더의 README.md.
 *
 * 동적 라우트(홈 등)의 헤더도 이 폴더를 읽으므로 next.config의 outputFileTracingIncludes로
 * 서버리스 번들에 포함시킨다. 빠지면 배포본에서만 글 메뉴가 사라진다.
 */
const ARTICLES_DIR = path.join(process.cwd(), 'content', 'articles')
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
/** 한국어 기준 대략 1분에 읽는 글자 수(공백 제외) */
const CHARS_PER_MINUTE = 500

const INCLUDE_DRAFTS = process.env.NODE_ENV !== 'production'

/** 배포본에서는 파일이 바뀌지 않으므로 한 번만 읽는다. 개발 중에는 매번 다시 읽는다. */
let cache: Article[] | undefined

function fail(file: string, message: string): never {
  throw new Error(`content/articles/${file}: ${message}`)
}

function readString(data: Record<string, unknown>, field: string, file: string): string {
  const value = data[field]
  if (typeof value !== 'string' || value.trim() === '') fail(file, `${field}가 비어 있습니다`)
  return value.trim()
}

/** YAML은 따옴표 없는 2026-09-14를 Date로 읽는다. 문자열이든 Date든 날짜 키로 맞춘다. */
function readDate(value: unknown, field: string, file: string): string {
  const dateKey = value instanceof Date ? value.toISOString().slice(0, 10) : value
  if (typeof dateKey !== 'string' || !isValidDateKey(dateKey)) {
    fail(file, `${field}는 YYYY-MM-DD 형식이어야 합니다`)
  }
  return dateKey
}

/**
 * marked가 만든 HTML에 사이트 규칙을 입힌다. 글은 레포에 커밋되는 신뢰된 원본이라
 * 새니타이즈하지 않는다 — 외부 입력을 이 경로로 넣지 말 것.
 */
function toHtml(markdown: string): string {
  return (
    (marked.parse(markdown, { async: false, gfm: true }) as string)
      // 외부 링크는 새 탭으로
      .replace(
        /<a href="(https?:\/\/[^"]+)"/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer"'
      )
      .replace(/<img /g, '<img loading="lazy" ')
      // 넓은 표는 모바일에서 페이지 전체를 밀지 않고 표만 가로 스크롤
      .replace(/<table>/g, '<div class="table-scroll"><table>')
      .replace(/<\/table>/g, '</table></div>')
  )
}

function parseArticle(file: string, source: string): Article {
  const slug = file.replace(/\.md$/, '')
  if (!SLUG_PATTERN.test(slug)) {
    fail(file, '파일 이름은 영문 소문자·숫자·하이픈만 씁니다 (예: datalab-ratio-guide.md)')
  }

  const { data, content } = matter(source)
  const body = content.trim()
  if (!body) fail(file, '본문이 비어 있습니다')

  return {
    slug,
    title: readString(data, 'title', file),
    description: readString(data, 'description', file),
    date: readDate(data.date, 'date', file),
    updated: data.updated === undefined ? undefined : readDate(data.updated, 'updated', file),
    author: typeof data.author === 'string' && data.author.trim() ? data.author.trim() : SITE.name,
    draft: data.draft === true,
    readingMinutes: Math.max(1, Math.round(body.replace(/\s+/g, '').length / CHARS_PER_MINUTE)),
    html: toHtml(body),
  }
}

async function loadArticles(): Promise<Article[]> {
  if (cache && !INCLUDE_DRAFTS) return cache

  let files: string[]
  try {
    files = await readdir(ARTICLES_DIR)
  } catch (error) {
    // 폴더가 없으면 글이 없는 것으로 본다. 형식 오류는 아래에서 그대로 던져 빌드를 멈춘다.
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }

  const articles = await Promise.all(
    files
      // README.md, _로 시작하는 파일은 글이 아니다
      .filter((file) => file.endsWith('.md') && file !== 'README.md' && !file.startsWith('_'))
      .map(async (file) =>
        parseArticle(file, await readFile(path.join(ARTICLES_DIR, file), 'utf8'))
      )
  )

  const visible = articles
    .filter((article) => INCLUDE_DRAFTS || !article.draft)
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug))

  cache = visible
  return visible
}

/** 최신순 */
export async function listArticles(): Promise<ArticleMeta[]> {
  // 목록에는 본문 HTML이 필요 없다
  return (await loadArticles()).map((article) => {
    const meta: ArticleMeta & { html?: string } = { ...article }
    delete meta.html
    return meta
  })
}

export async function getArticle(slug: string): Promise<Article | null> {
  return (await loadArticles()).find((article) => article.slug === slug) ?? null
}
