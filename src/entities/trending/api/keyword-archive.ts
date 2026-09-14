import type { DailyKeyword } from '@/entities/trending/model/keyword-archive'
import { getSql } from '@/shared/api/db'

/**
 * 스냅샷 한 줄은 다음 스냅샷이 쌓일 때까지 유효하다. 다만 수집이 멈춘 구간까지 순위권으로
 * 치지 않도록 마지막 확인 시각(checked_at) + 수집 주기에서 끊는다.
 * 주기는 db/migrations/002_collect_schedule.sql의 1분 cron에, 한 번 늦거나 건너뛴 실행을 봐주는 여유 1분을 더했다.
 */
const COLLECT_INTERVAL = '2 minutes'

/** 검색어가 순위권에 머문 총 시간(분). DB 설정이 없거나 오류면 null. */
export async function getKeywordRankedMinutes(keyword: string): Promise<number | null> {
  const sql = getSql()
  if (!sql) return null

  try {
    const [row] = await sql<{ minutes: number }[]>`
      select coalesce(round(sum(greatest(extract(epoch from (
        least(coalesce(n.next_at, now()), s.checked_at + ${COLLECT_INTERVAL}::interval) - s.captured_at
      )), 0)) / 60), 0)::int as minutes
      from public.snapshot_items i
      join public.snapshots s on s.id = i.snapshot_id
      left join lateral (
        select nx.captured_at as next_at
        from public.snapshots nx
        where nx.captured_at > s.captured_at
        order by nx.captured_at
        limit 1
      ) n on true
      where i.keyword = ${keyword}
    `
    return row.minutes
  } catch (error) {
    console.error('순위권 체류 시간 조회 실패:', error)
    return null
  }
}

interface DailyRow {
  keyword: string
  best_rank: number
  peak_traffic_value: number
  first_seen_at: Date
  ranked_minutes: number
  headline_title: string | null
  headline_source: string | null
}

/** 그날(KST) 순위권에 오른 검색어. 최고 순위 → 머문 시간 순. */
export async function getDailyRanking(dateKey: string): Promise<DailyKeyword[]> {
  const sql = getSql()
  if (!sql) return []

  try {
    const rows = await sql<DailyRow[]>`
      with bounds as (
        select
          (${dateKey}::date)::timestamp at time zone 'Asia/Seoul' as day_start,
          (${dateKey}::date + 1)::timestamp at time zone 'Asia/Seoul' as day_end
      ),
      segments as (
        select
          s.id,
          greatest(s.captured_at, b.day_start) as seg_start,
          least(
            coalesce(n.next_at, now()),
            s.checked_at + ${COLLECT_INTERVAL}::interval,
            b.day_end
          ) as seg_end
        from public.snapshots s
        cross join bounds b
        left join lateral (
          select nx.captured_at as next_at
          from public.snapshots nx
          where nx.captured_at > s.captured_at
          order by nx.captured_at
          limit 1
        ) n on true
        where s.captured_at < b.day_end
          and s.checked_at + ${COLLECT_INTERVAL}::interval > b.day_start
      ),
      daily as (
        select
          i.keyword,
          min(i.rank)::int as best_rank,
          max(i.traffic_value)::int as peak_traffic_value,
          min(seg.seg_start) as first_seen_at,
          round(sum(extract(epoch from (seg.seg_end - seg.seg_start))) / 60)::int as ranked_minutes
        from segments seg
        join public.snapshot_items i on i.snapshot_id = seg.id
        where seg.seg_end > seg.seg_start
        group by i.keyword
      )
      select
        d.*,
        k.news -> 0 ->> 'title' as headline_title,
        k.news -> 0 ->> 'source' as headline_source
      from daily d
      left join public.keywords k on k.keyword = d.keyword
      order by d.best_rank, d.ranked_minutes desc, d.first_seen_at
    `

    return rows.map((row) => ({
      keyword: row.keyword,
      bestRank: row.best_rank,
      peakTrafficValue: row.peak_traffic_value,
      firstSeenAt: row.first_seen_at.toISOString(),
      rankedMinutes: row.ranked_minutes,
      headline: row.headline_title
        ? { title: row.headline_title, source: row.headline_source ?? '' }
        : undefined,
    }))
  } catch (error) {
    console.error(`날짜별 검색어 조회 실패 (${dateKey}):`, error)
    return []
  }
}

/** 기록이 있는 날짜(KST) 키 목록. 최신순. */
export async function listArchiveDates(limit = 400): Promise<string[]> {
  const sql = getSql()
  if (!sql) return []

  try {
    const rows = await sql<{ date: string }[]>`
      select to_char(d, 'YYYY-MM-DD') as date
      from (
        select (captured_at at time zone 'Asia/Seoul')::date as d from public.snapshots
        union
        select (checked_at at time zone 'Asia/Seoul')::date as d from public.snapshots
      ) days
      order by d desc
      limit ${limit}
    `
    return rows.map((row) => row.date)
  } catch (error) {
    console.error('기록 날짜 목록 조회 실패:', error)
    return []
  }
}
