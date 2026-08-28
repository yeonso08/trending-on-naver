# CLAUDE.md

이 저장소에서 작업할 때 참고할 가이드입니다.

## 프로젝트 개요

**키위 (Keywi)** — 실시간 검색어 순위와 검색어 트렌드 분석을 보여주는 Next.js 앱.

- 좌: **구글 트렌드 RSS**(`trends.google.co.kr/trending/rss?geo=KR`) 기반 실시간 인기 검색어 목록. 항목을 누르면 네이버 검색 결과로 이동.
- 우: **네이버 데이터랩 검색어 트렌드 API** 기반 키워드 검색량 추이 차트.

> 레포·Vercel 프로젝트 이름에는 아직 "naver"가 남아 있지만, 실시간 순위 데이터 출처는 구글 트렌드입니다. 화면 텍스트를 고칠 때 헷갈리지 말 것.

배포: Vercel (`@vercel/analytics`, `@vercel/speed-insights` 사용 중).
원격: https://github.com/yeonso08/trending-on-naver

## 브랜드

서비스명은 **키위**, 로마자 표기는 **`Keywi`**입니다. `Kiwi`가 아닙니다.

"키워드 순위"를 줄인 이름인데, 로마자를 `keywi`로 적으면 철자에 `key`가 남아 어원이 스스로
드러나고 과일 `kiwi`·기존 키위 브랜드들(키위플러스, 키위웍스, 키위디스크 등)과 검색 결과가
갈립니다. **표기를 `kiwi`로 되돌리지 마세요.** 그러면 두 이점이 한꺼번에 사라집니다.

⚠️ **이름이 세 군데에서 서로 다릅니다. 헷갈리지 마세요.**

| 대상            | 값                                              |
| --------------- | ----------------------------------------------- |
| 서비스 브랜드   | 키위 / Keywi                                    |
| GitHub 레포     | `trending-on-naver` (안 바꿨음)                 |
| Vercel 프로젝트 | `trending-on-naver` (안 바꿨음 — CLI 인자로 씀) |
| 도메인          | **`keywi.kr`** (2026-08-28 연결 완료)           |

- **정식 주소는 apex(`https://keywi.kr`)입니다.** `www.keywi.kr`과 `http://`는 둘 다 308로
  이쪽에 합쳐집니다. `SITE.url`이 `metadataBase`를 타고 canonical·sitemap·OG를 전부 결정하므로,
  여기를 www로 적으면 canonical이 리다이렉트되는 주소를 가리켜 색인이 꼬입니다.
- DNS는 가비아에 두고 A/CNAME만 Vercel로 넘깁니다(네임서버 위임 아님). 가비아 DNS 관리는
  **CNAME 값 끝에 마침표가 필수**입니다 — 해외 등록기관과 규칙이 반대라 헷갈리기 쉽습니다.
- 색 규칙: **`--brand`(키위 그린)와 `--brand-flesh`(과육 톤)는 로고·아이덴티티 전용,
  `--heat`(오렌지)는 순위·실시간 등 데이터 표시 전용.** 섞으면 차트에서 브랜드색과
  데이터색이 구분되지 않습니다.
- 심볼은 **지평선 위로 떠오른 반단면**입니다. 키위 단면이면서 부채꼴 차트로 읽힙니다.
  **과육 · 부챗살 · 씨앗이 톤을 달리하는 세 겹 구조**이고, 이 톤 차이가 인상을 만듭니다.
  한 번 그린/흰색 두 색으로 줄여 네거티브로 파내 봤는데 훨씬 딱딱해져서 되돌렸습니다.
  선을 굵게 하거나 층을 줄이지 마세요.
- **배경 타일(둥근 초록 사각형)은 없습니다.** 심볼만 배경 위에 얹습니다. 화면에서는
  `KEYWI_TOKENS`가 CSS 변수를 물고 있어 다크 모드를 따라가고, 정적 SVG는 `KEYWI_STATIC`
  리터럴을 씁니다. `icon.svg`에는 `prefers-color-scheme` 스타일을 심어 다크 탭에서도 버팁니다.
- ⚠️ **`apple-icon.tsx`만 예외적으로 배경을 깝니다.** iOS는 투명 픽셀을 검게 칠하므로
  배경 없는 애플 아이콘은 검은 사각형이 됩니다. 초록 타일 대신 앱 표면색(`#FDFCFB`)을 씁니다.
- 도형 수치는 `src/shared/ui/brand/keywi-geometry.ts` 한 곳에만 있고, 화면용 컴포넌트
  (`keywi-mark.tsx`)와 애플 아이콘(`app/apple-icon.tsx`)이 그걸 함께 읽습니다.
  `public/brand/*.svg`와 `app/icon.svg`는 같은 수치로 뽑아낸 산출물이라 도형을 고치면
  함께 다시 만들어야 합니다.
- OG 이미지는 아직 없습니다. `ImageResponse`로 만들려면 한글 폰트 파일을 넘겨야 하는데
  Pretendard가 서브셋 92개로 쪼개져 있어 통짜 파일이 레포에 없습니다.

## 명령어

패키지 매니저는 **pnpm**. npm/yarn 쓰지 말 것.

⚠️ **로컬은 pnpm 11인데 Vercel은 pnpm 9를 씁니다**(프로젝트 생성 시점 기준). 의존성이나 빌드 설정을 건드렸다면 배포 전에 Vercel과 같은 조건으로 확인하세요.

```bash
npx pnpm@9 install --frozen-lockfile   # 통과해야 배포됨
```

```bash
pnpm dev      # next dev --turbopack
pnpm build    # 배포 전 반드시 통과 확인
pnpm start
pnpm lint     # next lint --fix
pnpm format   # prettier --write
```

## 환경 변수

`.env.local`이 레포에 없습니다(gitignore). 트렌드 차트를 로컬에서 쓰려면 필요:

```
# NAVER API HUB (권장 — 이관 후 방식)
NAVER_API_HUB_KEY_ID=   # 콘솔의 Client ID     → X-NCP-APIGW-API-KEY-ID
NAVER_API_HUB_KEY=      # 콘솔의 Client Secret → X-NCP-APIGW-API-KEY

# 구 개발자센터 방식 (2027-06-30까지). 위 키가 없을 때만 사용됨
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
```

둘 다 없으면 `/api/trends`가 503을 반환하고 차트만 동작하지 않습니다. 실시간 검색어 목록은 키 없이도 동작합니다.

## 배포 (Vercel)

프로덕션: https://keywi.kr

**환경 변수는 Vercel 프로젝트 설정에도 등록해야 합니다.** `.env.local`은 로컬 전용이라, 없으면 배포본에서 차트만 조용히 사라집니다(`/api/trends`가 503).

배포에서 실제로 겪은 함정들:

1. **`pnpm-workspace.yaml`을 커밋하지 마세요.** `allowBuilds`만 담긴 pnpm 11의 로컬 산출물인데, pnpm 9는 이 파일이 있으면 워크스페이스 선언으로 보고 `packages` 필드를 요구해 install 단계에서 죽습니다 (`ERROR packages field missing or empty`). `.gitignore`에 넣어 두었습니다.
2. **Vercel은 취약한 Next.js 버전의 배포를 차단합니다.** 빌드는 `Build Completed`까지 정상으로 끝나고 그 다음 `Deploying outputs...` 단계에서 실패하므로, 빌드 로그만 보면 원인을 못 찾습니다. 로그 마지막 줄을 확인하세요.

   ```
   Vulnerable version of Next.js detected, please update immediately.
   ```

   `pnpm audit`으로 필요한 최소 버전을 확인하고 올리면 됩니다.

3. **배포 로그는 CLI로 봅니다.** GitHub 체크에는 성공/실패만 나옵니다.

   ```bash
   npx vercel login                       # 최초 1회
   npx vercel ls trending-on-naver        # 배포 목록과 상태
   npx vercel inspect <배포URL> --logs    # 전체 로그
   ```

## 아키텍처 (FSD, Feature-Sliced Design)

```
src/
  app/        Next.js App Router
    /                    실시간 검색어 순위 (ISR 60초)
    /analysis            검색어 트렌드 분석 (데이터랩)
    /keyword/[keyword]   검색어 상세 — 관련 뉴스 + 30일 추이 (SSG)
    /about /privacy /terms   정적 문서 (AdSense 심사에 필요)
    sitemap.ts robots.ts     SEO
    api/trends           네이버 데이터랩 프록시 (POST)
    api/trending         실시간 검색어 JSON (GET) — 열린 탭 폴링용
  widgets/    페이지 단위 조합 (site-header, site-footer, trends-dashboard, trending-searches)
  features/   기능 단위 (trend-analysis, trending-list, keyword-detail)
  entities/   도메인 모델 + 데이터 조회 (trending)
  shared/     config/site.ts, types/, ui/ (ad-slot, prose)
  components/ shadcn/ui 컴포넌트 + theme-provider, mode-toggle
  lib/        cn() 유틸
```

- 슬라이스 내부는 `ui/`, `model/`로 나눕니다.
- import 경로는 `@/*` alias (→ `src/*`).
- 의존 방향: app → widgets → features → entities → shared. 역방향 import 금지.
- `src/components/ui/*`는 shadcn/ui 생성물이므로 직접 수정 최소화 (재생성 시 덮어써짐).

### 데이터 흐름

- **실시간 검색어**: `entities/trending/api/get-trending-topics.ts`가 구글 RSS를 fetch → `fast-xml-parser`로 파싱 → `TrendingTopic[]` 반환. `next: { revalidate: 60 }`으로 1분 ISR. 페이지가 아니라 이 모듈이 유일한 진입점이므로 새 화면에서도 여기를 쓴다.
- RSS는 제목·시각 외에 **검색량(`ht:approx_traffic`), 썸네일, 관련 뉴스 목록**까지 준다. 상세 페이지 콘텐츠가 전부 여기서 나온다.
- **트렌드 분석**: `TrendsDashboard`(클라이언트) → `POST /api/trends` → 서버에서 네이버 API 호출. 클라이언트에 API 키가 노출되지 않도록 반드시 라우트 핸들러 경유.

#### 실시간 검색어를 실제로 최신으로 유지하는 두 축

ISR의 `revalidate: 60`은 "60초마다 자동 갱신"이 아니라 **stale-while-revalidate**입니다. 60초가 지난 뒤 _누군가 요청해야_ 백그라운드 재생성이 시작되고, 그 요청자에게는 여전히 옛 캐시가 나갑니다. 주간 방문자 30명 규모에서는 아무도 안 들어와 캐시가 수십 분씩 정체됩니다(실측 `age: 2333` / `x-vercel-cache: STALE`). 그래서 두 가지를 함께 씁니다.

1. **`.github/workflows/refresh-trending.yml`** — 10분마다 홈페이지에 `curl`을 보내 ISR 재생성을 트리거합니다. 방문자가 없어도 캐시가 최신을 유지합니다. **Vercel Hobby 플랜은 자체 Cron이 하루 1회로 제한**되어 못 쓰기 때문에 퍼블릭 레포의 무료 GitHub Actions로 대신합니다.
2. **`TrendingSearches`의 60초 클라이언트 폴링** — 이미 열어 둔 탭이 새로고침 없이 갱신됩니다. `GET /api/trending`을 호출하며, 그 안의 fetch는 같은 `revalidate: 60` 캐시를 타므로 폴링이 늘어도 구글 RSS 호출 빈도는 늘지 않습니다. 탭이 백그라운드면(`document.hidden`) 건너뛰고, 다시 보이면 즉시 한 번 갱신합니다.

- 화면의 "○○ 업데이트"는 **서버가 데이터를 실제로 가져온 시각(`fetchedAt`)**입니다. RSS의 `pubDate`(그 검색어가 트렌드에 오른 시각)가 아닙니다 — 예전에 그걸 쓰다가 갱신 시점과 어긋나 보였습니다.
- `TrendingSearches`는 `compact` prop이 있습니다. 300px 사이드바(`/analysis`, `/keyword/[keyword]`)에서는 켜서 썸네일과 인피드 광고를 뺍니다.

## 코드 스타일

`.prettierrc` 기준 — 세미콜론 없음, 홑따옴표, 2칸 들여쓰기, printWidth 100, trailingComma es5.

- ESLint에 `import/order` 규칙(그룹 간 개행 + 알파벳 정렬)이 있습니다.
- UI 텍스트는 전부 한국어.
- 커밋 메시지는 기존 관례를 따름: `feat : 내용`, `design : 내용`, `fix : 내용` (타입과 콜론 사이 공백 있음, 한국어 본문).

## 알려진 이슈 / 주의사항

1. **파일명은 kebab-case입니다.** 대부분 정리됐습니다(`trend-chart.tsx`, `search-form.tsx`, `trends-dashboard.tsx`). 남은 PascalCase가 보이면 손대는 김에 함께 바꾸세요.
2. **날짜·시각을 화면에 찍을 때는 `timeZone: 'Asia/Seoul'`을 반드시 명시하세요.** 서버(Vercel 서버리스)는 UTC로 돌기 때문에 타임존 없이 `Intl.DateTimeFormat`을 쓰면 9시간 어긋난 시각이 나갑니다. 로컬(KST)에서는 멀쩡해 보여서 발견이 어렵습니다.
3. **`/keyword/[keyword]`는 현재 순위권 검색어만 렌더합니다.** 순위에서 내려가면 not-found 화면이 나옵니다. 축적된 SEO 자산을 지키려면 검색어 이력을 저장할 DB가 필요합니다 — 지금은 영속 계층이 없습니다.
4. **순위 밖 검색어는 soft 404입니다.** `notFound()`를 호출하지만 ISR 캐시를 거치면서 HTTP 상태가 200으로 나갑니다(Next.js의 알려진 동작). `generateMetadata`가 `noindex, nofollow`를 붙이므로 색인되지는 않습니다. `dynamicParams = false`로 바꾸면 진짜 404가 되지만, 그러면 빌드 이후 새로 뜬 검색어가 전부 404가 되므로 쓰면 안 됩니다.
5. **`AdSlot`은 아직 자리표시자입니다.** `debug` prop을 켜 둔 상태라 점선 박스가 보입니다. 실제 광고를 넣을 때 `shared/ui/ad-slot.tsx` 내부만 교체하면 되고, 지면 크기를 미리 잡아 두었으므로 레이아웃은 건드리지 않아도 됩니다.
6. **`about/page.tsx`의 `CONTACT_EMAIL`이 placeholder입니다.** AdSense 심사는 연락 수단을 확인하므로 공개용 주소로 교체해야 합니다.
7. **`.next` 캐시가 소스 변경을 반영하지 못하는 경우가 있습니다.** 화면이 예전 그대로면 `rm -rf .next` 후 다시 빌드하세요.
8. **`generateStaticParams`에는 인코딩하지 않은 원본 문자열을 넘겨야 합니다.** Next.js가 URL 인코딩을 담당하므로 `encodeURIComponent`한 값을 넘기면 이중 인코딩됩니다. 렌더 시점에 `decodeURIComponent`를 한 번 해도 `%EA%B0%84...`가 남아 검색어 매칭에 실패하고, 한글 검색어 페이지가 전부 not-found로 프리렌더됩니다. 라틴 문자 검색어(`mlb`)만 멀쩡해서 눈치채기 어렵습니다. `TrendingTopic.slug`는 **링크·사이트맵 전용**입니다.

## 폰트

**Pretendard Variable**(SIL OFL 1.1, 상업적 이용 가능)을 **자체 호스팅**합니다.

- 실물: `public/fonts/pretendard/` — 동적 서브셋 92개 woff2 (+ `OFL.txt`)
- `@font-face` 선언: `src/app/fonts.css` (각 `unicode-range` 보유), `layout.tsx`에서 import되어 CSS 번들에 포함
- Tailwind `fontFamily.sans`가 Pretendard를 가리키고, `globals.css`의 `body`에 `font-sans` 적용

전체 variable 파일은 2MB라 통짜로 쓰지 않습니다. 서브셋 방식이면 브라우저가 `unicode-range`를 보고 실제 필요한 조각만 받습니다 — 메인 페이지 기준 **8개 / 약 206KB**.

`layout.tsx`의 `PRELOADED_FONT_SUBSETS`는 사용 빈도 상위 3개(91, 90, 89 — 라틴 + 최빈 한글)를 preload합니다. Pretendard는 빈도가 높은 글리프일수록 뒤쪽 인덱스에 배치합니다.

폰트를 바꿀 일이 생기면 `public/fonts/`와 `src/app/fonts.css`를 함께 교체해야 합니다. `next/font`는 `unicode-range`를 지원하지 않아 쓰지 않았습니다.

## 데이터 소스와 라이선스 (영리 서비스 전제)

이 프로젝트는 광고 수익을 목표로 하므로 데이터 출처의 이용 조건이 중요합니다.

### 네이버 — NAVER API HUB로 이관됨

2026년 6월 25일 **NAVER API HUB**(네이버클라우드 플랫폼)가 출시되면서 developers.naver.com의 검색 API·검색어 트렌드·쇼핑인사이트가 이관됐습니다. 구 개발자센터 방식은 **2027년 6월 30일**까지만 동작합니다.

공식 문서: https://api.ncloud-docs.com/docs/naver-api-hub-search-trend

|           | 구 방식                                            | NAVER API HUB                                                      |
| --------- | -------------------------------------------------- | ------------------------------------------------------------------ |
| URL       | `POST https://openapi.naver.com/v1/datalab/search` | `POST https://naverapihub.apigw.ntruss.com/search-trend/v1/search` |
| 인증 헤더 | `X-Naver-Client-Id` / `X-Naver-Client-Secret`      | `X-NCP-APIGW-API-KEY-ID` / `X-NCP-APIGW-API-KEY`                   |

**요청·응답 바디는 두 방식이 완전히 같습니다.** 그래서 `shared/api/naver-datalab.ts`가 엔드포인트와 헤더만 갈아끼우는 식으로 양쪽을 모두 지원합니다. API HUB 키(`NAVER_API_HUB_KEY_ID`)가 있으면 그쪽을 먼저 쓰고, 없으면 구 방식으로 넘어갑니다. 이관이 끝나면 구 방식 분기를 지우면 됩니다.

- 검색어 트렌드 요금 (공식 요금표 기준):
  - `0 ~ 30,000건` — 0원 (**기본 무료 제공**)
  - `30,001 ~ 50,000건` — 0원 (**한시적 무료 제공**. 구간 자체는 '유료'로 분류되어 있어 언젠가 과금될 수 있음)
  - 콘솔에 보이는 "당월 50,000회"는 이 둘을 합친 값입니다. **안정적으로 기댈 수 있는 무료치는 30,000건으로 잡는 편이 안전합니다.**
- 문서상 429는 "하루 허용량 초과"로 설명되어 있어 월 한도와 별개로 일 한도가 있을 수 있습니다.
- 검색어 상세 페이지의 추이는 **서버에서 `getKeywordTrend`(`unstable_cache`, TTL 6시간)로 조회**합니다. 검색어 하나당 하루 최대 4회로 호출이 묶이므로 페이지뷰가 늘어도 쿼터가 비례해서 늘지 않습니다. 클라이언트에서 `/api/trends`를 부르지 마세요.
- `/api/trends` 라우트는 이제 `/analysis`의 사용자 직접 조회에만 쓰입니다. 사람이 버튼을 눌러야 호출되므로 자연히 상한이 있습니다.
- `device` 값은 `pc` / `mo`입니다 (`m`이 아닙니다 — 과거 코드의 버그였음)

### 구글 트렌드 — 공식 RSS 피드 (문제 없음)

`trends.google.co.kr/trending/rss?geo=KR`은 **Google 트렌드가 공식적으로 제공하는 내보내기 형식**입니다. 실시간 인기 페이지의 `내보내기` 메뉴에 CSV·클립보드와 나란히 `RSS 피드` 항목이 있고, 그 항목이 정확히 이 URL로 연결됩니다.

- 브라우저 User-Agent 위장은 불필요합니다. 없어도 정상 응답합니다 (제거 완료).
- Google 데이터를 재사용할 때는 **출처 표기가 요구됩니다.** 랭킹 위젯 하단과 사이트 푸터에 표기해 두었으니 지우지 마세요.
- 참고: 실시간 인기(Trending Now)에는 **임베드 위젯이 제공되지 않습니다.** 임베드는 `탐색(Explore)`의 키워드 관심도 차트에만 있습니다.

## 현재 작업 방향

방치했던 프로젝트를 영리 서비스로 되살리는 중입니다 (주간 방문자 ~30명).

진행 상황과 다음 할 일은 **[docs/PROGRESS.md](docs/PROGRESS.md)** 에 정리해 두었습니다. 작업을 시작하기 전에 그 문서부터 확인하세요.
