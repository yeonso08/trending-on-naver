# 키위 (Keywi)

지금 뜨는 키워드와, 뜬 이유.

실시간 인기 검색어 순위와 검색어 트렌드 분석을 한 화면에서 보여주는 Next.js 앱입니다.

- **실시간 순위** — 구글 트렌드 공식 RSS(`geo=KR`) 기반. 검색량·썸네일·관련 뉴스까지 함께 받습니다.
- **트렌드 분석** — 네이버 데이터랩 검색어 트렌드 API로 키워드 검색량 추이를 비교합니다.
- **검색어 상세** — 관련 뉴스와 30일 추이를 묶어 "왜 떴는지"를 보여줍니다.

프로덕션: https://keywi.kr

## 시작하기

패키지 매니저는 **pnpm**입니다.

```bash
pnpm install
pnpm dev
```

트렌드 차트를 로컬에서 쓰려면 `.env.local`에 네이버 API 키가 필요합니다. 키가 없으면
`/api/trends`가 503을 반환하고 차트만 동작하지 않습니다 — 실시간 순위는 키 없이도 됩니다.

```
NAVER_API_HUB_KEY_ID=
NAVER_API_HUB_KEY=
```

## 명령어

```bash
pnpm dev      # 개발 서버 (turbopack)
pnpm build    # 배포 전 반드시 통과 확인
pnpm lint     # next lint --fix
pnpm format   # prettier --write
```

## 구조

Feature-Sliced Design을 따릅니다. 의존 방향은 `app → widgets → features → entities → shared`.

```
src/
  app/        Next.js App Router
  widgets/    페이지 단위 조합
  features/   기능 단위
  entities/   도메인 모델 + 데이터 조회
  shared/     설정 · 타입 · 공용 UI · 브랜드 자산
```

자세한 내용은 [CLAUDE.md](CLAUDE.md), 진행 상황은 [docs/PROGRESS.md](docs/PROGRESS.md)에 있습니다.

## 데이터 출처

실시간 인기 검색어는 Google 트렌드가 공식 제공하는 RSS 피드를, 검색어 트렌드는 네이버
데이터랩을 출처로 합니다. 본 서비스는 Google 및 네이버와 제휴 관계가 없습니다.
