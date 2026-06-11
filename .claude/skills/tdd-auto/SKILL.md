---
name: tdd-auto
description: 이슈 번호 하나를 받아 7단계 TDD 사이클을 subagent로 격리 실행하며 사용자 개입 없이 완주한다. STOP 조건 발생 시 gh issue comment 후 종료.
argument-hint: <이슈 번호>
allowed-tools: Read Bash Agent
---

`$ARGUMENTS`를 이슈 번호로 받아 TDD 풀 사이클을 자율 실행한다.
사용자 개입 없이 7단계를 순서대로 완주하며, STOP 조건 발생 시 GitHub 이슈에 코멘트 후 종료한다.

---

## JSON Schema

모든 subagent는 아래 schema 중 해당 단계의 JSON **한 블록만** 반환한다. 추가 텍스트 금지. 변형 금지.

### 공통 단계 (scenarios / red / refactor / security)

```json
{
  "stage": "<stage-name>",
  "status": "ok",
  "stop_reason": null,
  "files_changed": ["src/example.ts"],
  "test_result": { "passed": 9, "failed": 0 }
}
```

### green

```json
{
  "stage": "green",
  "status": "ok",
  "attempt": 1,
  "stop_reason": null,
  "files_changed": ["src/example.ts"],
  "test_result": { "passed": 9, "failed": 0 }
}
```

### ac_verify

```json
{
  "stage": "ac_verify",
  "status": "ok",
  "ac_passed": true,
  "stop_reason": null,
  "gap_summary": null
}
```

### pr

```json
{
  "stage": "pr",
  "status": "ok",
  "stop_reason": null,
  "pr_url": "https://github.com/owner/repo/pull/1"
}
```

### complete (전체 완료 시 최종 출력)

```json
{
  "stage": "complete",
  "issue": 1,
  "pr_url": "https://github.com/owner/repo/pull/1",
  "stages_completed": ["scenarios", "red", "green", "ac_verify", "refactor", "security", "pr"]
}
```

---

## STOP 조건 테이블

| 단계      | STOP 조건                                      | stop_reason                                 |
| --------- | ---------------------------------------------- | ------------------------------------------- |
| scenarios | schema 위반 2회 / gh issue 없음                | `schema_violation` / `no_issue`             |
| red       | Import Error 해소 불가 / schema 위반 2회       | `import_error` / `schema_violation`         |
| green     | 3회 시도 후 전체 통과 실패                     | `max_retries_exceeded`                      |
| ac_verify | `ac_passed: false`                             | `ac_not_passed`                             |
| refactor  | 테스트 실패 후 rollback 불가 / schema 위반 2회 | `test_broken` / `schema_violation`          |
| security  | high/critical severity 미해소                  | `security_high`                             |
| pr        | commitlint 실패 / push 실패 / gh pr 생성 실패  | `commitlint_fail` / `push_fail` / `pr_fail` |

STOP 처리 절차:

```bash
gh issue comment $ARGUMENTS --body "tdd-auto STOP: {단계} — {stop_reason}"
```

출력 후 루프 종료:

```
[tdd-auto] STOP({단계}: {stop_reason})
```

---

## 자율 모드 지시문 (각 subagent 프롬프트 끝에 항상 포함)

```
---
## 자율 모드 지시
- 사용자 승인 게이트를 묻지 않고 자체 통과한다.
- 모호하거나 STOP 조건에 해당하면 즉시 처리한다. 추측 금지.
- 출력은 지정된 JSON 블록 하나만. 그 외 텍스트 출력 금지.
- schema 위반 시 1회 자체 수정 후 재시도. 그래도 실패하면 status=stop, stop_reason=schema_violation.
```

---

## 단계 0: 사전 점검 (오케스트레이터 직접 실행)

아래 항목을 순서대로 확인한다. 실패 시 즉시 STOP 처리 후 종료.

### 0-1. 이슈 AC 확인

```bash
gh issue view $ARGUMENTS
```

이슈가 없거나 AC 항목이 없으면: STOP(`no_ac`)

### 0-2. 워킹 트리 클린 확인

```bash
git status --short
```

uncommitted changes가 있으면: STOP(`dirty_workdir`)

### 0-3. 현재 브랜치 확인

```bash
git branch --show-current
```

`feature/`로 시작하지 않으면: STOP(`wrong_base_branch`)

브랜치명에서 `{feature}` 추출:

- `feature/<spec>` → `{feature}` = `<spec>`
- `feature/<spec>-issue-N` → `{feature}` = `<spec>`

### 0-4. 이슈 브랜치 생성

```bash
git checkout -b feat/{feature}-issue-$ARGUMENTS
```

실패 시: STOP(`branch_create_failed`)

완료 출력:

```
[tdd-auto] 0단계 OK — feat/{feature}-issue-$ARGUMENTS 브랜치 생성
```

---

## 단계 1/7: scenarios

Agent를 아래 프롬프트로 spawn한다.

```
이슈 번호: {issue}, feature: {feature}

이슈의 시그니처를 확정하고 테스트 시나리오를 도출해 docs/features/{feature}/issue-{issue}.md에 저장한다.

### 수행 절차

1. `gh issue view {issue}` 실행 — 제목, 설명, AC 목록 수집
2. `docs/features/{feature}/prd.md` 읽기 (없으면 생략)
3. `src/types/`, `src/api/`, `src/context/`, `src/components/` 탐색해 기존 패턴 파악
4. 이슈 범위 내 신규/변경 함수·컴포넌트·훅의 시그니처만 도출 (구현 코드 작성 금지)
5. 시나리오 도출: 정상 1개 이상, 경계 1개 이상, 예외(에러 케이스 있으면) 1개 이상
6. 모든 AC에 시나리오 1개 이상 매핑 확인. 미커버 AC가 있으면 시나리오 추가
7. docs/features/{feature}/issue-{issue}.md 신규 작성 (시그니처 섹션 + 테스트 시나리오 섹션)

### 반환 JSON

{
  "stage": "scenarios",
  "status": "ok",
  "stop_reason": null,
  "files_changed": ["docs/features/{feature}/issue-{issue}.md"],
  "test_result": { "passed": 0, "failed": 0 }
}

---
## 자율 모드 지시
- 사용자 승인 게이트를 묻지 않고 자체 통과한다.
- 모호하거나 STOP 조건에 해당하면 즉시 처리한다. 추측 금지.
- 출력은 지정된 JSON 블록 하나만. 그 외 텍스트 출력 금지.
- schema 위반 시 1회 자체 수정 후 재시도. 그래도 실패하면 status=stop, stop_reason=schema_violation.
```

JSON 수신 후:

- `status == "stop"` → STOP 처리 후 종료
- `status == "ok"` → `[tdd-auto] 1/7 scenarios OK` 출력 후 다음 단계

---

## 단계 2/7: red

Agent를 아래 프롬프트로 spawn한다.

```
이슈 번호: {issue}, feature: {feature}

docs/features/{feature}/issue-{issue}.md를 읽어 실패하는 테스트 코드를 작성한다.

### 수행 절차

1. docs/features/{feature}/issue-{issue}.md 읽기 — 시그니처, 시나리오 목록 수집
2. 존재하지 않는 구현 파일에 대해서만 최소 스텁 생성 (기존 파일 수정 금지)
   반환값 최솟값: string[]→[], string→'', boolean→false, Promise<T>→Promise.resolve({} as T), React컴포넌트→return <div />;
3. 시나리오 전체를 it() 블록으로 변환. expect는 실제 기대 동작 명시 (더미 assertion 금지)
4. `npx vitest run <테스트파일> --reporter=verbose` 실행
5. Red 품질 확인: 모든 케이스 Assertion Failure 또는 Runtime Error여야 함
   - Import Error → 스텁 보완 후 재실행 (1회). 해소 불가 시 status=stop, stop_reason=import_error
   - 테스트가 의도치 않게 통과하면 status=stop, stop_reason=unexpected_pass
6. `npm test` 전체 실행 — 기존 테스트 회귀 없는지 확인

### 반환 JSON

{
  "stage": "red",
  "status": "ok",
  "stop_reason": null,
  "files_changed": ["src/..."],
  "test_result": { "passed": 0, "failed": 3 }
}

---
## 자율 모드 지시
- 사용자 승인 게이트를 묻지 않고 자체 통과한다.
- 모호하거나 STOP 조건에 해당하면 즉시 처리한다. 추측 금지.
- 출력은 지정된 JSON 블록 하나만. 그 외 텍스트 출력 금지.
- schema 위반 시 1회 자체 수정 후 재시도. 그래도 실패하면 status=stop, stop_reason=schema_violation.
```

JSON 수신 후:

- `status == "stop"` → STOP 처리 후 종료
- `status == "ok"` → `[tdd-auto] 2/7 red OK` 출력 후 다음 단계

---

## 단계 3/7: green (최대 3회 재시도)

`attempt = 1`로 초기화.

Agent를 아래 프롬프트로 spawn한다. `status == "stop"` 이고 `stop_reason == "test_not_passing"` 또는 `"regression"` 이면 attempt를 증가시켜 재spawn. `attempt > 3`이면 STOP(`max_retries_exceeded`).

```
이슈 번호: {issue}, feature: {feature}, attempt: {attempt}

실패 중인 테스트를 통과시키는 최소 구현 코드를 작성한다.

### 수행 절차

1. docs/features/{feature}/issue-{issue}.md 읽기
2. `npm test` 실행 — 실패 테스트 목록 수집
3. 체크박스(- [ ]) 수와 vitest Tests 수 비교. 불일치 시 누락 스텁 생성 후 재실행
4. 구현 대상이 UI 컴포넌트이면 docs/design-system/components.md, docs/design-system/tokens.md 읽기 (없으면 생략)
5. 실패 테스트를 하나씩 최소 구현 작성 → `npm test` → 통과 확인 반복
   - 단일 테스트 최대 5회 피드백 루프 후 실패 지속 시: status=stop, stop_reason=test_not_passing
   - 기존 통과 테스트가 새로 실패하면: 즉시 git restore, status=stop, stop_reason=regression
6. 전체 통과 시 docs/features/{feature}/issue-{issue}.md 체크박스 [ ] → [x] 업데이트

### 반환 JSON

{
  "stage": "green",
  "status": "ok",
  "attempt": 1,
  "stop_reason": null,
  "files_changed": ["src/..."],
  "test_result": { "passed": 9, "failed": 0 }
}

---
## 자율 모드 지시
- 사용자 승인 게이트를 묻지 않고 자체 통과한다.
- 모호하거나 STOP 조건에 해당하면 즉시 처리한다. 추측 금지.
- 출력은 지정된 JSON 블록 하나만. 그 외 텍스트 출력 금지.
- schema 위반 시 1회 자체 수정 후 재시도. 그래도 실패하면 status=stop, stop_reason=schema_violation.
```

JSON 수신 후:

- `stop_reason` 이 `test_not_passing` 또는 `regression` 이고 `attempt < 3` → attempt 증가 후 재spawn
- `attempt >= 3` 또는 다른 stop_reason → STOP(`max_retries_exceeded`)
- `status == "ok"` → `[tdd-auto] 3/7 green OK (attempt {attempt})` 출력 후 다음 단계

---

## 단계 4/7: ac_verify

**Green subagent와 반드시 분리된 별도 Agent로 spawn한다.**

Agent를 아래 프롬프트로 spawn한다.

```
이슈 번호: {issue}, feature: {feature}

이슈의 Acceptance Criteria 충족 여부를 검증한다. 테스트 통과 여부가 아닌 AC 의도를 코드와 직접 대조한다.

### 수행 절차

1. `gh issue view {issue}` 로 AC 목록 수집. 실패 시 docs/features/{feature}/issue-{issue}.md의 AC 섹션 파싱
2. 각 AC 항목에 대해:
   a. 해당 AC를 검증하는 it() 블록이 src/**/*.test.* 에 존재하는지 확인
   b. expect assertion이 AC 의도를 정확히 표현하는지 확인 (더미 assertion 금지)
   c. 구현 파일에 실제 동작이 존재하는지 확인
3. 하나라도 미충족(❌) 또는 부분 충족(⚠️)이면 ac_passed=false

### 반환 JSON

{
  "stage": "ac_verify",
  "status": "ok",
  "ac_passed": true,
  "stop_reason": null,
  "gap_summary": null
}

ac_passed=false인 경우:
{
  "stage": "ac_verify",
  "status": "stop",
  "ac_passed": false,
  "stop_reason": "ac_not_passed",
  "gap_summary": "AC 2 미충족: 검색어 초기화 시 전체 노트 표시 테스트 없음"
}

---
## 자율 모드 지시
- 사용자 승인 게이트를 묻지 않고 자체 통과한다.
- 모호하거나 STOP 조건에 해당하면 즉시 처리한다. 추측 금지.
- 출력은 지정된 JSON 블록 하나만. 그 외 텍스트 출력 금지.
- schema 위반 시 1회 자체 수정 후 재시도. 그래도 실패하면 status=stop, stop_reason=schema_violation.
```

JSON 수신 후:

- `ac_passed == false` → STOP(`ac_not_passed`) — gap_summary를 gh issue comment에 포함
- `status == "ok"` → `[tdd-auto] 4/7 ac_verify OK` 출력 후 다음 단계

---

## 단계 5/7: refactor

Agent를 아래 프롬프트로 spawn한다.

```
이슈 번호: {issue}, feature: {feature}

이슈에서 변경된 코드를 리팩토링한다. 테스트를 깨뜨리지 않는다.

### 수행 절차

1. `npm test` 실행 — 전체 통과 확인 (실패 시 status=stop, stop_reason=test_broken)
2. `git diff main...HEAD --name-only -- src/` — 변경 파일 수집, 테스트 파일(*.test.*) 제외
3. 각 파일에 대해 점검: 중복 / 네이밍 명확성 / 단일 책임 / 불필요 복잡도 / 컨벤션 불일치
4. 개선 항목 하나씩 적용 → `npm test` → 통과 확인 반복
   - 실패 시: 즉시 git restore 후 해당 항목 건너뜀 (STOP 아님)
5. 신규 기능 추가 금지. 테스트 파일 수정 금지.

### 반환 JSON

{
  "stage": "refactor",
  "status": "ok",
  "stop_reason": null,
  "files_changed": ["src/..."],
  "test_result": { "passed": 9, "failed": 0 }
}

---
## 자율 모드 지시
- 사용자 승인 게이트를 묻지 않고 자체 통과한다.
- 모호하거나 STOP 조건에 해당하면 즉시 처리한다. 추측 금지.
- 출력은 지정된 JSON 블록 하나만. 그 외 텍스트 출력 금지.
- schema 위반 시 1회 자체 수정 후 재시도. 그래도 실패하면 status=stop, stop_reason=schema_violation.
```

JSON 수신 후:

- `status == "stop"` → STOP 처리 후 종료
- `status == "ok"` → `[tdd-auto] 5/7 refactor OK` 출력 후 다음 단계

---

## 단계 6/7: security

Agent를 아래 프롬프트로 spawn한다.

```
이슈 번호: {issue}, feature: {feature}

변경 코드의 타입 오류·보안 취약점·환경변수 노출을 점검한다.

### 수행 절차

1. `npx tsc --noEmit` 실행 — 타입 오류 수집
2. `npm audit` 실행 — 취약점 수집
3. src/ 디렉토리에서 process.env 직접 참조, 하드코딩된 환경변수 패턴 검색
4. 결과 분류:
   - high/critical severity → status=stop, stop_reason=security_high
   - moderate severity → files_changed에 기록, status=ok (즉시 수정 불필요)
   - 타입 오류(빌드 실패 수준) → status=stop, stop_reason=type_error
5. high/critical 아닌 취약점은 `npm audit fix` (--force 금지)

### 반환 JSON

{
  "stage": "security",
  "status": "ok",
  "stop_reason": null,
  "files_changed": [],
  "test_result": { "passed": 9, "failed": 0 }
}

---
## 자율 모드 지시
- 사용자 승인 게이트를 묻지 않고 자체 통과한다.
- 모호하거나 STOP 조건에 해당하면 즉시 처리한다. 추측 금지.
- 출력은 지정된 JSON 블록 하나만. 그 외 텍스트 출력 금지.
- schema 위반 시 1회 자체 수정 후 재시도. 그래도 실패하면 status=stop, stop_reason=schema_violation.
```

JSON 수신 후:

- `status == "stop"` → STOP 처리 후 종료
- `status == "ok"` → `[tdd-auto] 6/7 security OK` 출력 후 다음 단계

---

## 단계 7/7: pr

Agent를 아래 프롬프트로 spawn한다.

```
이슈 번호: {issue}, feature: {feature}, base_branch: feature/{feature}

변경사항으로 PR을 생성한다.

### 수행 절차

1. `git log feature/{feature}...HEAD --oneline` — 커밋 목록 수집
2. `git diff feature/{feature}...HEAD --stat` — 변경 파일 수집
3. PR 제목 작성: `{타입}: {한 줄 요약}` (70자 이내, commitlint 규칙: feat/fix/chore/docs/refactor/test/style, 소문자)
   commitlint 검증: 규칙 위반 시 status=stop, stop_reason=commitlint_fail
4. PR body 구성:
   - ## Summary (변경 핵심 2~4 bullet)
   - ## Test plan (npm test 통과 체크리스트)
   - Closes #{issue} (필수 포함)
5. body를 pr-body.md에 저장 후 push:
   `git push -u origin HEAD`
   실패 시 status=stop, stop_reason=push_fail
6. PR 생성:
   `gh pr create --title "{제목}" --base feature/{feature} --body-file pr-body.md`
   실패 시 status=stop, stop_reason=pr_fail
7. PR 생성 성공 후:
   `gh issue comment {issue} --body "PR: {PR_URL}"`

### 반환 JSON

{
  "stage": "pr",
  "status": "ok",
  "stop_reason": null,
  "pr_url": "https://github.com/owner/repo/pull/N"
}

---
## 자율 모드 지시
- 사용자 승인 게이트를 묻지 않고 자체 통과한다.
- 모호하거나 STOP 조건에 해당하면 즉시 처리한다. 추측 금지.
- 출력은 지정된 JSON 블록 하나만. 그 외 텍스트 출력 금지.
- schema 위반 시 1회 자체 수정 후 재시도. 그래도 실패하면 status=stop, stop_reason=schema_violation.
```

JSON 수신 후:

- `status == "stop"` → STOP 처리 후 종료
- `status == "ok"` → `[tdd-auto] 7/7 pr OK` 출력 후 완료 JSON 출력

---

## 완료 출력

7단계 모두 ok 시 아래 JSON을 출력한다:

```json
{
  "stage": "complete",
  "issue": 0,
  "pr_url": "https://github.com/owner/repo/pull/N",
  "stages_completed": ["scenarios", "red", "green", "ac_verify", "refactor", "security", "pr"]
}
```

---

## 제약

- 오케스트레이터는 src/ 파일을 직접 읽거나 수정하지 않는다. subagent만 다룬다.
- AC 검증(4단계)은 반드시 Green(3단계)과 별도 Agent로 spawn한다.
- `git push --force` 사용 금지.
- 테스트 파일(`*.test.ts`, `*.test.tsx`) 직접 수정 금지.
- `npm audit fix --force` 사용 금지.
