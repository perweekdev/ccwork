---
name: tdd-loop
description: 이슈 번호 하나를 받아 test-scenarios → tdd-red → tdd-green → ac-verifier → tdd-refactor → security-review → create-pr 의 TDD 풀 사이클을 순서대로 실행한다. 각 스킬 내부의 승인 게이트는 그대로 유지된다.
argument-hint: <이슈 번호>
allowed-tools: Read Bash Glob Grep
---

`$ARGUMENTS`를 이슈 번호로 받아 TDD 풀 사이클 7단계를 순서대로 진행한다.

## 시작 전

`$ARGUMENTS`가 비어 있으면: "이슈 번호를 알려주세요."

---

## 단계 0: 사전 점검

아래 항목을 순서대로 확인한다. 하나라도 실패하면 사용자에게 알리고 중단한다.

### 0-1. 이슈 본문 확인

```bash
gh issue view $ARGUMENTS
```

이슈가 존재하지 않으면 중단: "이슈 #$ARGUMENTS 를 찾을 수 없습니다."

### 0-2. 워킹 트리 상태 확인

```bash
git status --short
```

uncommitted changes가 있으면 중단:
"커밋되지 않은 변경이 있습니다. 먼저 커밋하거나 stash한 뒤 다시 실행하세요."

### 0-3. 현재 브랜치 확인

```bash
git branch --show-current
```

`feature/`로 시작하지 않으면 중단:
"feature/<spec> 브랜치에서 실행해야 합니다. 현재 브랜치: {branch}"

현재 브랜치명에서 `<spec>` 부분을 추출한다 (예: `feature/search-realtime-filter` → `search-realtime-filter`).

### 0-4. 이슈 브랜치 처리

이슈 번호로 slug를 생성한다 (`issue-$ARGUMENTS`).

```bash
git branch --list "feature/*issue-$ARGUMENTS*"
```

- **브랜치가 이미 존재하면**: 동일 이슈 재실행으로 간주하고 사용자에게 확인:
  "feature/...-issue-$ARGUMENTS 브랜치가 이미 있습니다. 이어서 진행할까요, 아니면 취소할까요?"
  - 이어서: 해당 브랜치로 체크아웃
  - 취소: 중단

- **브랜치가 없으면**: 현재 feature 브랜치에서 분기 후 체크아웃:
  ```bash
  git checkout -b feature/<spec>-issue-$ARGUMENTS
  ```

사전 점검 완료 후 아래 메시지를 출력한다:

```
[tdd-loop] 사전 점검 완료. 이슈 #$ARGUMENTS TDD 사이클을 시작합니다.
브랜치: feature/<spec>-issue-$ARGUMENTS
단계: 0/7 완료
```

---

## 단계 1: /test-scenarios

```
[tdd-loop] 단계 1/7 — test-scenarios 시작
```

`/test-scenarios $ARGUMENTS` 를 실행한다.

- 시그니처 승인 게이트 (스킬 내부에서 작동)
- 시나리오 승인 게이트 (스킬 내부에서 작동)

완료 후:

```
[tdd-loop] 단계 1/7 완료 → 단계 2/7 tdd-red 시작
```

---

## 단계 2: /tdd-red

```
[tdd-loop] 단계 2/7 — tdd-red 시작
```

`/tdd-red $ARGUMENTS` 를 실행한다.

- 실패 테스트 작성 및 Red 품질 확인 (스킬 내부에서 작동)
- collect 실패(Import Error) 발생 시 스킬 내부에서 stub 안내

완료 후:

```
[tdd-loop] 단계 2/7 완료 → 단계 3/7 tdd-green 시작
```

---

## 단계 3: /tdd-green

```
[tdd-loop] 단계 3/7 — tdd-green 시작
```

`/tdd-green $ARGUMENTS` 를 실행한다.

- 최소 구현 및 5회 피드백 루프 (스킬 내부에서 작동)
- 5회 초과 실패 시 스킬 내부에서 중단 및 사용자 보고

완료 후:

```
[tdd-loop] 단계 3/7 완료 → 단계 4/7 ac-verifier 시작
```

---

## 단계 4: @ac-verifier

```
[tdd-loop] 단계 4/7 — ac-verifier 시작
```

`@ac-verifier $ARGUMENTS` 를 실행한다.

- AC 충족 독립 검증 (에이전트 내부에서 작동)
- 갭이 있으면 에이전트가 보고하고 사용자가 판단

완료 후:

```
[tdd-loop] 단계 4/7 완료 → 단계 5/7 tdd-refactor 시작
```

---

## 단계 5: /tdd-refactor

```
[tdd-loop] 단계 5/7 — tdd-refactor 시작
```

`/tdd-refactor $ARGUMENTS` 를 실행한다.

- 리팩토링 목록 승인 게이트 (스킬 내부에서 작동)
- 변경마다 npm test 실행 (스킬 내부에서 작동)

완료 후:

```
[tdd-loop] 단계 5/7 완료 → 단계 6/7 security-review 시작
```

---

## 단계 6: /security-review

```
[tdd-loop] 단계 6/7 — security-review 시작
```

`/security-review $ARGUMENTS` 를 실행한다.

- tsc / npm audit / 환경변수 노출 점검 (스킬 내부에서 작동)
- "즉시 수정 필요" 항목 승인 게이트 (스킬 내부에서 작동)

완료 후:

```
[tdd-loop] 단계 6/7 완료 → 단계 7/7 create-pr 시작
```

---

## 단계 7: /create-pr

```
[tdd-loop] 단계 7/7 — create-pr 시작
```

`/create-pr` 을 실행한다. 단, PR 생성 시 아래 조건을 추가로 적용한다.

- **PR base**: 현재 feature/<spec>-issue-N 의 부모인 `feature/<spec>` 브랜치
- **PR body 필수 포함**: `Closes #$ARGUMENTS`
- **이슈 코멘트**: PR 생성 완료 후 아래 명령으로 이슈에 PR 링크를 코멘트한다:
  ```bash
  gh issue comment $ARGUMENTS --body "PR: {PR_URL}"
  ```

완료 후:

```
[tdd-loop] 전체 완료 🎉
이슈 #$ARGUMENTS TDD 사이클 7단계 완료.
PR: {PR_URL}
```

---

## 단계 실패 처리

각 단계에서 스킬/에이전트가 중단을 보고하면 아래 형식으로 출력하고 종료한다:

```
[tdd-loop] 단계 {N}/7 에서 중단됨.
원인: {스킬이 보고한 내용}
재개하려면 해당 단계의 스킬을 직접 실행하세요: /{스킬명} $ARGUMENTS
```

---

## 제약

- 컨테이너는 각 단계 사이에 진행 메시지만 출력한다.
- 각 스킬 내부의 승인 게이트를 건너뛰거나 자동 응답하지 않는다.
- "다음 단계 진행할까요?" 같은 추가 게이트를 만들지 않는다.
- `git push --force` 사용 금지.
- 테스트 파일(`*.test.ts`, `*.test.tsx`) 직접 수정 금지.
