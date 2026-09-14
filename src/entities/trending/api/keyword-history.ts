import type { KeywordRecord, RecordSnapshotResult } from '@/entities/trending/model/keyword-record'
import type { TrendingNewsItem, TrendingTopic } from '@/entities/trending/model/types'
import { getSql } from '@/shared/api/db'

interface KeywordRow {
  keyword: string
  first_seen_at: Date
  last_seen_at: Date
  best_rank: number
  peak_traffic_value: number
  approx_traffic: string
  picture: string | null
  picture_source: string | null
  news: TrendingNewsItem[]
  entries: number
}

function toRecord(row: KeywordRow): KeywordRecord {
  return {
    keyword: row.keyword,
    firstSeenAt: row.first_seen_at.toISOString(),
    lastSeenAt: row.last_seen_at.toISOString(),
    bestRank: row.best_rank,
    peakTrafficValue: row.peak_traffic_value,
    approxTraffic: row.approx_traffic,
    picture: row.picture ?? undefined,
    pictureSource: row.picture_source ?? undefined,
    news: row.news,
    entries: row.entries,
  }
}

/** 순위·검색어·검색량이 모두 같으면 같은 목록으로 본다. 뉴스는 자주 바뀌어 비교에서 뺀다. */
function buildSignature(topics: TrendingTopic[]): string {
  return topics.map((topic) => `${topic.rank}\t${topic.title}\t${topic.approxTraffic}`).join('\n')
}

/**
 * 현재 순위를 기록한다. 목록이 직전과 같으면 스냅샷은 늘리지 않고 확인 시각만 갱신한다.
 * DB 설정이 없으면 null.
 */
export async function recordSnapshot(
  topics: TrendingTopic[]
): Promise<RecordSnapshotResult | null> {
  const sql = getSql()
  if (!sql) return null

  const signature = buildSignature(topics)

  return sql.begin(async (tx) => {
    // 수집 요청이 겹쳐도 같은 목록이 두 번 쌓이지 않게 직렬화한다
    await tx`select pg_advisory_xact_lock(hashtext('keywi:collect'))`

    const [previous] = await tx<{ id: string; signature: string }[]>`
      select id, signature from public.snapshots order by captured_at desc limit 1
    `
    const previousKeywords = previous
      ? (
          await tx<{ keyword: string }[]>`
            select keyword from public.snapshot_items where snapshot_id = ${previous.id}
          `
        ).map((row) => row.keyword)
      : []

    let snapshotId: string
    const changed = !previous || previous.signature !== signature

    if (changed) {
      const [inserted] = await tx<{ id: string }[]>`
        insert into public.snapshots (signature) values (${signature}) returning id
      `
      snapshotId = inserted.id

      const items = topics.map((topic) => ({
        snapshot_id: snapshotId,
        rank: topic.rank,
        keyword: topic.title,
        traffic_value: topic.approxTrafficValue,
      }))
      await tx`insert into public.snapshot_items ${tx(items)}`
    } else {
      snapshotId = previous.id
      await tx`update public.snapshots set checked_at = now() where id = ${snapshotId}`
    }

    // ::jsonb만 붙이면 postgres.js가 파라미터를 jsonb로 추론해 문자열을 한 번 더 JSON 인코딩한다
    // (배열 대신 문자열 스칼라가 저장됨). text로 넘기고 DB에서 변환한다.
    for (const topic of topics) {
      await tx`
        insert into public.keywords (
          keyword, first_seen_at, last_seen_at, best_rank, peak_traffic_value,
          approx_traffic, picture, picture_source, news, entries
        ) values (
          ${topic.title}, now(), now(), ${topic.rank}, ${topic.approxTrafficValue},
          ${topic.approxTraffic}, ${topic.picture ?? null}, ${topic.pictureSource ?? null},
          ${JSON.stringify(topic.news)}::text::jsonb, 1
        )
        on conflict (keyword) do update set
          last_seen_at = excluded.last_seen_at,
          best_rank = least(keywords.best_rank, excluded.best_rank),
          peak_traffic_value = greatest(keywords.peak_traffic_value, excluded.peak_traffic_value),
          approx_traffic = excluded.approx_traffic,
          picture = coalesce(excluded.picture, keywords.picture),
          picture_source = case
            when excluded.picture is null then keywords.picture_source
            else excluded.picture_source
          end,
          news = case
            when jsonb_array_length(excluded.news) > 0 then excluded.news
            else keywords.news
          end,
          entries = keywords.entries + case
            when keywords.keyword = any(${previousKeywords}::text[]) then 0
            else 1
          end
      `
    }

    // bigint는 postgres.js가 문자열로 준다
    return { changed, snapshotId: Number(snapshotId), keywords: topics.length }
  })
}

/** 한 번이라도 순위권에 올랐던 검색어면 요약을, 아니면 null. DB 오류도 null로 흡수한다. */
export async function getKeywordRecord(keyword: string): Promise<KeywordRecord | null> {
  const sql = getSql()
  if (!sql) return null

  try {
    const [row] = await sql<KeywordRow[]>`
      select * from public.keywords where keyword = ${keyword}
    `
    return row ? toRecord(row) : null
  } catch (error) {
    console.error('검색어 이력 조회 실패:', error)
    return null
  }
}

/** 사이트맵용. 최근에 순위권이었던 순서로. */
export async function listRecordedKeywords(
  limit = 5000
): Promise<Array<{ keyword: string; lastSeenAt: string }>> {
  const sql = getSql()
  if (!sql) return []

  try {
    const rows = await sql<{ keyword: string; last_seen_at: Date }[]>`
      select keyword, last_seen_at from public.keywords order by last_seen_at desc limit ${limit}
    `
    return rows.map((row) => ({ keyword: row.keyword, lastSeenAt: row.last_seen_at.toISOString() }))
  } catch (error) {
    console.error('검색어 목록 조회 실패:', error)
    return []
  }
}
