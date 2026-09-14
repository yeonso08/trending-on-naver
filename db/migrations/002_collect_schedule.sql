-- 1분마다 https://keywi.kr/api/collect 를 호출해 검색어 이력을 쌓는다.
-- 구글 RSS는 약 10분마다 목록을 바꾸고 1~2분 뒤 순위·검색량을 한 번 더 고치는 일이 잦다(2026-09-14 실측).
-- 5분 주기로는 그 보정을 놓치고, 수집이 Next.js 데이터 캐시를 데우는 역할도 해서 화면 지연이 최대 5분까지 벌어졌다.
-- /api/collect가 프로덕션에 배포되고 Vercel에 CRON_SECRET이 등록된 뒤에 적용한다.
--
-- 토큰은 이 파일에 적지 않는다. Vault에 한 번만 따로 넣는다(값은 Vercel의 CRON_SECRET과 같게).
--   select vault.create_secret('<CRON_SECRET 값>', 'keywi_cron_secret');
-- 바꿀 때는:
--   select vault.update_secret(
--     (select id from vault.secrets where name = 'keywi_cron_secret'), '<새 값>');

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

-- 같은 이름으로 다시 실행하면 기존 작업을 덮어쓴다.
select cron.schedule(
  'keywi-collect',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://keywi.kr/api/collect',
    headers := jsonb_build_object(
      'Authorization',
      'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'keywi_cron_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 20000
  );
  $$
);

-- 확인:
--   select * from cron.job_run_details order by start_time desc limit 5;
--   select status_code, content from net._http_response order by created desc limit 5;
