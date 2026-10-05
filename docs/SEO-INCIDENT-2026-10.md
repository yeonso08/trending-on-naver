# 구글 검색 노출 급감 조사 (2026년 10월)

작성: 2026-10-05 · 담당: Claude

> 요약: 9월 28일쯤부터 "키위 실시간", "실시간 키위" 같은 검색에서 keywi.kr이 구글에 전혀 보이지 않게 됐습니다.
> 원인으로 가장 유력한 것은 **Next.js의 스트리밍 메타데이터** 때문에 Googlebot이 받는 HTML에서 `title`·`canonical`·`robots`가
> `<head>`가 아니라 `<body>` 중간에 있던 문제입니다. 9월 28일 ISR → 동적 렌더 전환으로 `/keyword/*`·`/daily/*`도
> 이 영향권에 들어갔습니다. 10월 2일 `/keyword/*` noindex가 겹쳤습니다. 10월 5일
> `htmlLimitedBots`에 Googlebot을 더해 고쳤고([PR #31](https://github.com/yeonso08/trending-on-naver/pull/31)), 같은 날 주요 페이지 8개의 색인 생성을 다시 요청했습니다.

## 1. 증상

- 사용자가 여러 대의 PC와 휴대폰에서 확인한 결과, 9월 28일 전에는 "키위 실시간"·"실시간 키위"로 검색하면
  keywi.kr 페이지가 구글 1페이지에 여러 개 보였습니다. 그 뒤로는 10페이지를 넘겨도 하나도 없습니다.
- 10월 5일 직접 확인한 결과도 같았습니다. "키위 실시간"은 키위디스크·키위스코어·블랙키위 등이 차지하고, keywi.kr은 없습니다.
- 사이트 자체가 색인에서 빠진 것은 아닙니다. `site:keywi.kr`에는 홈·날짜별 기록·글이 나오고, URL 검사에서 홈은 "Google에 등록되어 있음"입니다.

## 2. 타임라인

| 날짜         | 일                                                                                                                                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 8월 21일     | Next.js 15.5.23으로 업그레이드. 스트리밍 메타데이터(15.2+)가 이때부터 켜져 있었음                                                                                                                                        |
| 8월 28일     | keywi.kr 도메인 연결                                                                                                                                                                                                     |
| 9월 13\~22일 | "인기검색어" 검색어로 홈 게재 순위 4.5\~7.8위                                                                                                                                                                            |
| 9월 23\~25일 | 같은 검색어 게재 순위 8\~10위로 하락, 노출 3\~5회                                                                                                                                                                        |
| 9월 26일     | 같은 검색어 노출 0 (이후 계속 0)                                                                                                                                                                                         |
| **9월 28일** | ISR Writes 한도 초과 대응([PR #25](https://github.com/yeonso08/trending-on-naver/pull/25)). `/keyword/*`·`/daily/*`를 ISR에서 `force-dynamic`으로 전환 → 이 페이지들의 메타데이터가 Googlebot 응답에서 `<body>`로 밀려남 |
| 10월 2일     | AdSense 대응으로 `/keyword/*`에 `noindex` ([PR #28](https://github.com/yeonso08/trending-on-naver/pull/28))                                                                                                              |
| 10월 5일     | 사용자 보고 → 조사 → `htmlLimitedBots` 수정 배포 ([PR #31](https://github.com/yeonso08/trending-on-naver/pull/31)), 홈 제목 변경, 색인 생성 요청 8건                                                                     |

## 3. 원인

### 3-1. 스트리밍 메타데이터 (핵심)

Next.js 15.2부터는 동적 렌더 페이지의 메타데이터(`generateMetadata`·`metadata` 결과)를 `<head>`에 바로 넣지 않습니다.
본문을 먼저 흘려보낸 뒤 `<body>` 중간에 끼워 넣습니다. 예외로 처음부터 `<head>`에 넣어 주는 봇 목록
(`HTML_LIMITED_BOT_UA_RE`)이 있는데, 여기에는 일반 `Googlebot`이 **없습니다**.

```
[\w-]+-Google|Google-[\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|...|Bingbot|...
```

- `Googlebot/2.1`은 `-Google`로 끝나지도, `Google-`로 시작하지도 않아서 목록에 걸리지 않습니다.
- 반대로 Search Console의 URL 검사 도구(`Google-InspectionTool`)는 `Google-[\w-]+`에 걸려 **정상 HTML을 받습니다.**
  그래서 URL 검사로는 문제가 보이지 않습니다.
- 구글은 `<body>` 안의 `rel=canonical`을 **무시합니다**. `robots` 메타는 body에 있어도 읽습니다.
- `title`이 head에 없으면 구글은 JS 렌더링 결과에 의존해야 합니다. 렌더링 대기열을 거쳐야 하므로 반영이 늦어지거나 불안정해질 수 있습니다.

### 3-2. 9월 28일 작업과의 관계

9월 28일 전에도 홈은 `force-dynamic`이라 이 문제를 안고 있었습니다. 9월 28일에 바뀐 것은 다음입니다.

- `/keyword/*`(약 1,900개)와 `/daily/*`가 **ISR → 동적 렌더**로 바뀌었습니다. ISR 페이지는 미리 만들어진 HTML이라
  메타데이터가 `<head>`에 정상으로 있었지만, 이날부터 Googlebot에게는 `<body>`로 나갔습니다.
- "키위 실시간"에 걸리던 것은 이 검색어 페이지들로 보입니다. 순위권 검색어 페이지의 제목이
  `정부 - 실시간 인기 검색어 순위 | 키위`처럼 "실시간"과 "키위"를 둘 다 담고 있었고, 그런 페이지가 수백 개였습니다.
  사용자가 본 "1페이지에 여러 개"와 맞습니다.

즉 사용자가 의심한 "미리 만들어 두지 않게 된 것"은 방향이 맞았습니다. 정확히는 미리 만들지 않으면서 **Googlebot이 받는 HTML 구조가 바뀐 것**이 문제였습니다.

### 3-3. 10월 2일 noindex

`/keyword/*`에 `noindex`를 붙인 뒤 이 페이지들의 노출은 하루 41\~80회(9월 26일\~10월 1일)에서 10월 2일 2회로 떨어졌습니다.
noindex는 AdSense 반려 대응으로 유지하기로 했습니다(사용자 결정, 10월 5일). 따라서 검색어 페이지로 받던 "키위 실시간"
노출은 돌아오지 않을 수 있습니다. 대신 홈 제목을 `키위(Keywi) — 실시간 인기 검색어 순위`로 바꿔 홈이 이 검색을 받게 했습니다.

## 4. 측정 근거

### 배포본 HTML (10월 5일, 수정 전)

`curl -A "Googlebot/2.1"`로 받은 HTML에서 각 태그가 `</head>` 앞에 있는지 확인했습니다.

| 페이지                       | title·canonical·robots 위치    |
| ---------------------------- | ------------------------------ |
| `/`                          | **body** (약 24KB 지점)        |
| `/daily/2026-10-01`          | **body** (약 25만 바이트 지점) |
| `/keyword/정부`              | **body** (약 25KB 지점)        |
| `/articles` (`force-static`) | head                           |

### 수정 후 (10월 5일, 배포본)

| UA            | `/`  | `/daily` | `/daily/2026-10-01` | `/keyword/지민` | `/analysis` |
| ------------- | ---- | -------- | ------------------- | --------------- | ----------- |
| Googlebot     | head | head     | head                | head            | head        |
| 일반 브라우저 | body | head     | body                | body            | body        |

일반 브라우저는 스트리밍을 유지하므로 방문자 체감 속도는 그대로입니다.

### Search Console (데이터는 10월 2일까지)

- 홈 페이지 게재 순위: 9월 15\~22일 7\~16위 → 9월 23\~27일 18\~37위 → 9월 28일\~10월 1일 18\~29위 → 10월 2일 63.5위(노출 6회).
- `/keyword/*` 노출: 9월 26일\~10월 1일 하루 41\~80회 → 10월 2일 2회.
- 크롤링 통계: 응답 100% 성공(200), 평균 응답 258ms. 서버 오류나 크롤링 중단은 없었습니다.
- 색인 생성 보고서는 9월 21일 이후 갱신되지 않아 9월 28일 이후 변화는 아직 볼 수 없습니다.
- 10월 5일 URL 검사 결과 `/daily`, `/analysis`, `/articles`는 "크롤링됨 - 현재 색인이 생성되지 않음"이었습니다.
  `/daily/2026-10-01·03·04`와 새 주간 리포트는 "Google에 아직 알려지지 않은 URL"이었습니다.

## 5. 같은 사례

- [vercel/next.js Discussion #88315](https://github.com/vercel/next.js/discussions/88315) — 메타데이터 스트리밍으로 Googlebot이 빈 `<title>`을 색인한 사례.
- [The Next.js SEO Bug That Made Google Ignore My Entire Site](https://dev.to/federico_sciuca/the-nextjs-seo-bug-that-made-google-ignore-my-entire-site-and-how-i-found-it-2mg0) — 색인이 거의 안 되다가 `htmlLimitedBots` 한 줄 추가 후 며칠 만에 색인 페이지가 176개로 늘어남.
- [Search Console Shows Your Canonical Tag. Googlebot Never Gets It.](https://dev.to/ai_changewatch/search-console-shows-your-canonical-tag-googlebot-never-gets-it-256k) — URL 검사 도구와 실제 Googlebot이 다른 HTML을 받는 구조를 설명. 우리와 같은 증상.
- [The metadata streaming controversy in Next.js 15.1+](https://neuralcovenant.com/2025/06/the-metadata-streaming-controversy-in-next.js-15.1-/) — 업그레이드 뒤 노출이 급감했다는 보고 모음.
- [Sitebulb: Canonical outside of head](https://sitebulb.com/hints/indexability/canonical-outside-of-head/) — body의 canonical은 무시됨.
- [Google: Robots meta tag 명세](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag) — robots 메타는 body에 있어도 인정.

## 6. 조치

1. `next.config.ts`에 `htmlLimitedBots`를 추가했습니다.

   ```ts
   htmlLimitedBots: new RegExp(`Googlebot|${HTML_LIMITED_BOT_UA_RE.source}`, 'i'),
   ```

   이 옵션은 기본 목록을 **대체**하므로 Next 기본 목록에 이어 붙였습니다. `/Googlebot/i`만 쓰면 Bingbot 등이 빠집니다.

2. 홈 제목 `실시간 인기 검색어 순위 | 키위` → `키위(Keywi) — 실시간 인기 검색어 순위`.
3. Search Console 색인 생성 요청(10월 5일, 8건): `/`, `/daily`, `/analysis`, `/articles`,
   `/articles/weekly-trending-2026-09-28`, `/daily/2026-10-01`, `/daily/2026-10-03`, `/daily/2026-10-04`.
4. CLAUDE.md "알려진 이슈" 12번에 재발 방지 규칙을 적었습니다.

## 7. 확정하지 못한 것

- **홈의 하락 시작(9월 23일쯤)은 이 원인만으로 설명되지 않습니다.** 홈은 8월 21일부터 같은 문제를 안고도 9월 중순까지 순위가
  좋았습니다. 새 도메인의 순위 재평가 등 다른 요인이 겹쳤을 수 있습니다.
- **"키위 실시간" 검색어 자체의 수치는 볼 수 없습니다.** Search Console은 검색한 사람이 적은 검색어를 익명 처리해 보여 주지 않습니다.
- 9월 28일 직후 `/keyword/*` 노출은 바로 줄지 않았습니다(10월 1일까지 하루 41\~80회). 9월 28일 효과와 10월 2일 noindex 효과를
  수치로 완전히 분리하지는 못했습니다.

## 8. 다시 확인하는 법

```bash
# </head> 앞에 태그가 있어야 정상
curl -s -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" https://keywi.kr/ \
  | python3 -c "import sys,re;s=sys.stdin.read();h=s.find('</head>');print({t:(s.find(t)<h and s.find(t)>=0) for t in ['<title>','rel=\"canonical\"','name=\"robots\"']})"
```

- URL 검사 도구로는 확인하지 마세요. 검사 도구는 처음부터 정상 HTML을 받습니다.
- 새 라우트를 동적 렌더로 만들 때도 위 명령으로 확인합니다.

## 9. 후속 일정

- **10월 중순:** Search Console에서 홈 게재 순위, "인기검색어"·"실시간" 계열 검색어의 노출, 색인 생성 보고서(9월 21일 이후 갱신 여부)를 확인합니다.
- 회복이 없으면 홈·날짜별 기록을 동적 렌더 대신 짧은 주기 ISR로 돌리는 방안을 ISR Writes 한도와 함께 계산해 봅니다.
