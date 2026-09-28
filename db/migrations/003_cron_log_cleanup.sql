-- pg_cron 실행 로그(cron.job_run_details)를 7일만 남긴다.
-- 002의 1분 수집이 하루 1,440줄씩 쌓는데 pg_cron은 로그를 지우지 않는다. 2주 만에 9.5MB로 DB에서
-- 가장 큰 테이블이 됐다(2026-09-28, 전체 27MB). 장애를 볼 때는 최근 로그만 있으면 된다.
-- 검색어 기록(snapshots, snapshot_items, keywords)은 건드리지 않는다.

-- 매일 04:00 KST(19:00 UTC). 같은 이름으로 다시 실행하면 기존 작업을 덮어쓴다.
select cron.schedule(
  'keywi-cron-log-cleanup',
  '0 19 * * *',
  $$ delete from cron.job_run_details where end_time < now() - interval '7 days' $$
);

-- 확인:
--   select jobname, schedule, active from cron.job;
--   select min(end_time), count(*) from cron.job_run_details;
