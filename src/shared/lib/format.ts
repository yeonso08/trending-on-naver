const KST = 'Asia/Seoul'

/** 서버(Vercel)는 UTC로 돈다. 화면에 찍는 날짜·시각은 반드시 KST로 포맷한다. */
export function formatKstDate(isoDate: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: KST,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(isoDate))
}

interface KstParts {
  year: number
  month: number
  day: number
  /** 0–23 */
  hour: number
  minute: number
}

/**
 * KST 기준 연·월·일·시·분. 숫자만 받아 한국어 표기는 직접 조립한다.
 * ko-KR의 오전/오후는 런타임 ICU에 따라 달라서, Vercel 서버는 "PM"을, 브라우저는 "오후"를 찍었다.
 * 서버 문장에 영어가 섞이고 클라이언트 컴포넌트는 하이드레이션 불일치(React #418)가 났다(2026-10-19).
 */
function toKstParts(isoDate: string | Date): KstParts {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: KST,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(new Date(isoDate))
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value)
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
  }
}

/** 0–23시 → ["오후", 2] */
function toKoreanClock(hour: number): [string, number] {
  return [hour < 12 ? '오전' : '오후', hour % 12 || 12]
}

/** "2026년 9월 14일 오전 9:28" */
export function formatKstDateTime(isoDate: string): string {
  const { year, month, day, hour, minute } = toKstParts(isoDate)
  const [period, clock] = toKoreanClock(hour)
  return `${year}년 ${month}월 ${day}일 ${period} ${clock}:${String(minute).padStart(2, '0')}`
}

/** "10월 19일 오후 02:14". 실시간 순위의 업데이트 시각. 유효하지 않은 값이면 null. */
export function formatKstUpdatedAt(isoDate: string): string | null {
  if (Number.isNaN(new Date(isoDate).getTime())) return null
  const { month, day, hour, minute } = toKstParts(isoDate)
  const [period, clock] = toKoreanClock(hour)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${month}월 ${day}일 ${period} ${pad(clock)}:${pad(minute)}`
}

/** 시각 → 그 시각의 KST 날짜 키 "YYYY-MM-DD" */
export function toKstDateKey(date: Date | string = new Date()): string {
  // en-CA는 YYYY-MM-DD 순서로 찍는다
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: KST,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date))
}

export function isValidDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  )
}

/**
 * 이미 KST 기준인 날짜 키를 "2026년 9월 14일"로. Date로 바꾸면 타임존이 끼어들어
 * 하루가 밀릴 수 있으므로 문자열 그대로 다룬다.
 */
export function formatDateKey(dateKey: string, { withYear = true } = {}): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  return withYear ? `${year}년 ${month}월 ${day}일` : `${month}월 ${day}일`
}

/** 분 → "2일 3시간" · "1시간 40분" · "35분". 수집 주기(1분)보다 짧으면 "1분 미만". */
export function formatDuration(minutes: number): string {
  if (minutes < 1) return '1분 미만'

  const total = Math.round(minutes)
  const days = Math.floor(total / 1440)
  const hours = Math.floor((total % 1440) / 60)
  const mins = total % 60

  if (days > 0) return hours > 0 ? `${days}일 ${hours}시간` : `${days}일`
  if (hours > 0) return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`
  return `${mins}분`
}

/** 받침 유무로 은/는을 고른다. 한글로 끝나지 않으면(영문·숫자) 둘 다 적는다. */
export function withTopicParticle(word: string): string {
  const last = word.trim().slice(-1)
  const code = last.charCodeAt(0)
  if (!last || code < 0xac00 || code > 0xd7a3) return `${word}(은)는`
  return (code - 0xac00) % 28 === 0 ? `${word}는` : `${word}은`
}
