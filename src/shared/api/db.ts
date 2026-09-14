import postgres from 'postgres'

/**
 * Supabase Postgres 연결. 서버 코드에서만 import한다.
 *
 * POSTGRES_URL은 Supavisor 트랜잭션 풀러(6543)라 prepared statement를 유지할 수 없다 → prepare: false.
 * Fluid Compute가 인스턴스를 재사용하므로 모듈 스코프에 하나만 만들어 둔다.
 */
let client: postgres.Sql | null | undefined

export function getSql(): postgres.Sql | null {
  if (client !== undefined) return client

  const url = process.env.POSTGRES_URL
  if (!url) {
    client = null
    return client
  }

  // Vercel 연동이 붙이는 supa= 같은 쿼리는 postgres.js가 서버 설정값으로 넘겨 접속이 거부된다.
  // 접속 정보만 남기고 SSL은 옵션으로 지정한다.
  const parsed = new URL(url)
  parsed.search = ''

  client = postgres(parsed.toString(), {
    prepare: false,
    ssl: 'require',
    max: 3,
    idle_timeout: 20,
    connect_timeout: 10,
  })
  return client
}
