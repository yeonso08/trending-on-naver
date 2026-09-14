-- 검색어 이력 — 구글 트렌드 RSS 순위를 쌓아 순위에서 내려간 검색어 페이지를 유지한다.
-- 적용: Supabase 대시보드 SQL Editor에 붙여 넣거나 POSTGRES_URL_NON_POOLING으로 실행.
-- 앱은 postgres 역할로 직접 접속하므로 Data API(anon/authenticated)에는 열지 않는다.

-- 순위 목록이 바뀔 때만 한 줄 쌓인다. 같으면 checked_at만 갱신한다.
create table if not exists public.snapshots (
  id bigint generated always as identity primary key,
  captured_at timestamptz not null default now(),
  -- 이 목록이 마지막으로 확인된 시각. 수집이 멈춘 구간을 순위권 체류로 오해하지 않기 위함
  checked_at timestamptz not null default now(),
  -- 순위·검색어·검색량을 이어 붙인 값. 직전 스냅샷과 비교해 변경 여부를 판단한다
  signature text not null
);

create index if not exists snapshots_captured_at_idx on public.snapshots (captured_at desc);

create table if not exists public.snapshot_items (
  snapshot_id bigint not null references public.snapshots (id) on delete cascade,
  rank smallint not null,
  keyword text not null,
  traffic_value integer not null default 0,
  primary key (snapshot_id, rank)
);

create index if not exists snapshot_items_keyword_idx
  on public.snapshot_items (keyword, snapshot_id);

-- 검색어별 누적 요약. 상세 페이지는 순위에서 내려간 뒤 이 행으로 렌더한다.
create table if not exists public.keywords (
  keyword text primary key,
  first_seen_at timestamptz not null,
  last_seen_at timestamptz not null,
  best_rank smallint not null,
  peak_traffic_value integer not null default 0,
  approx_traffic text not null default '',
  picture text,
  picture_source text,
  news jsonb not null default '[]'::jsonb,
  -- 순위권에 새로 진입한 횟수 (직전 스냅샷에 없다가 나타나면 1 증가)
  entries integer not null default 1
);

create index if not exists keywords_last_seen_at_idx on public.keywords (last_seen_at desc);

alter table public.snapshots enable row level security;
alter table public.snapshot_items enable row level security;
alter table public.keywords enable row level security;

-- 정책을 만들지 않으므로 RLS만으로도 막히지만, 테이블 접근 권한 자체도 걷어 둔다.
revoke all on public.snapshots, public.snapshot_items, public.keywords from anon, authenticated;
