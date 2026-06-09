---
name: e2e-write
description: PRD 사용자 스토리를 읽어 Playwright E2E 테스트를 작성한다. 새 기능의 E2E 테스트를 처음 작성할 때 사용한다.
argument-hint: <기능명>
allowed-tools: Read Write Bash Glob Grep
---

`$ARGUMENTS`에서 기능명을 파싱해 해당 기능의 E2E 테스트를 작성한다.

## 시작 전

### 인자 파싱

`$ARGUMENTS`를 `{feature}`로 사용한다.

`{feature}`가 없으면 실행 전 사용자에게 묻는다: "어떤 기능의 E2E 테스트를 작성할까요? (예: tag, search, ...)"

### 사전 읽기

아래 파일을 동시에 읽는다:

1. `docs/features/{feature}/prd.md` — 사용자 스토리 수집
2. `src/**/*.test.{ts,tsx}` — 단위 테스트가 커버 중인 항목 파악 (중복 방지)
3. `e2e/{feature}.spec.ts` — 이미 존재하면 기존 내용 확인

`prd.md`가 없으면 즉시 멈추고 사용자에게 알린다 (`/write-prd {feature}` 를 먼저 실행해야 한다는 안내 포함).

---

## 단계 1: E2E 커버 범위 결정

### 단위 테스트와 역할 분리 원칙

아래 항목은 단위 테스트가 담당한다. E2E에서 중복하지 않는다:

| 단위 테스트 담당 (E2E 제외)               | E2E 담당                                       |
| ----------------------------------------- | ---------------------------------------------- |
| normalize 로직 (소문자·trim·공백 제거)    | 사용자 동작 → UI 변화 전체 흐름                |
| 유효성 검사 규칙 (빈 문자열·길이 초과 등) | 저장 후 서버 반영 확인 (round-trip)            |
| 컴포넌트 props 렌더링                     | 여러 컴포넌트 간 데이터 연동 (Editor↔사이드바) |
| API 함수 단독 호출                        | 페이지 이동 후 상태 유지 또는 초기화           |

### PRD 사용자 스토리 → E2E 시나리오 매핑

PRD의 각 사용자 스토리를 읽어 아래 기준으로 E2E 시나리오를 도출한다:

- **포함 기준**: 사용자가 UI에서 직접 수행하는 동작 + 그 결과가 화면에 반영되는지 검증
- **제외 기준**: 단위 테스트가 이미 커버하는 로직 검증, Out of Scope 항목

시나리오 형식:

```
[사용자 스토리 번호] should [기대 결과] when [사용자 동작]
```

```
[GATE] 도출된 시나리오 목록을 사용자에게 보여주고 승인을 받는다.
수정 요청이 있으면 조정 후 다시 보여준다. 승인 전 코드 작성 금지.
```

---

## 단계 2: 테스트 파일 작성

### 파일 경로

`e2e/{feature}.spec.ts`

### 파일 헤더

```ts
import { test, expect, request } from '@playwright/test';
```

### 테스트 격리 전략

각 테스트는 **독립 실행 가능**해야 한다. json-server API를 직접 호출해 테스트 데이터를 생성하고 정리한다.

```ts
test.beforeEach(async ({ request }) => {
  // 테스트용 노트를 API로 생성
});

test.afterEach(async ({ request }) => {
  // 생성한 노트를 API로 삭제
});
```

### Locator 우선순위

1. `getByRole` — 가장 우선
2. `getByLabel` / `getByPlaceholder` — 폼 요소
3. `getByText` — 텍스트가 고유할 때
4. `data-testid` — role·label로 특정 불가능할 때만. 이 경우 구현 코드에 `data-testid` 속성을 추가한다.

### Assertion 규칙

- `expect(locator).toBeVisible()`, `toHaveText()`, `toContainText()` 등 **auto-retry assertion** 사용
- `waitForTimeout` 금지 — 대신 `waitForResponse` 또는 locator assertion으로 비동기 대기
- API 저장 확인: `page.waitForResponse('**/notes/**')` 패턴으로 서버 응답 대기

### 테스트 구조

```ts
test.describe('{기능명}', () => {
  // beforeEach: API로 테스트 노트 생성, 앱 열기
  // afterEach: API로 테스트 노트 삭제

  test('[시나리오 이름]', async ({ page }) => {
    // Arrange: 초기 상태 확인 또는 추가 설정
    // Act: 사용자 동작 (click, fill, press)
    // Assert: UI 변화 또는 서버 반영 확인
  });
});
```

### API base URL

json-server는 `http://localhost:3001`을 사용한다.

```ts
const API = 'http://localhost:3001';
```

---

## 단계 3: 실행 및 검증

모든 시나리오를 작성한 뒤 실행한다:

```bash
npx playwright test e2e/{feature}.spec.ts --reporter=list
```

### 판정 기준

| 결과        | 판정         | 조치                                     |
| ----------- | ------------ | ---------------------------------------- |
| 모두 통과   | ✅           | 다음 단계로 진행                         |
| 일부 실패   | ❌           | 실패 원인 파악 후 테스트 또는 구현 수정  |
| 타임아웃    | ❌ locator   | selector 재검토, `data-testid` 추가 검토 |
| 서버 미응답 | ❌ 환경 문제 | `npm run dev`가 실행 중인지 확인         |

---

## 단계 4: 기존 테스트 회귀 확인

```bash
npm run test:e2e
```

새로 작성한 테스트가 기존 테스트를 깨지 않는지 확인한다.

---

## 산출물

- `e2e/{feature}.spec.ts` 경로
- 작성된 시나리오 목록 (PRD 사용자 스토리 번호와 대응)
- 실행 결과: 통과 수 / 전체 수
