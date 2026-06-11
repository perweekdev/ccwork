---
name: create-pr
description: 현재 브랜치의 변경사항을 분석해 PR 초안을 생성하고, E2E 테스트 통과 후 GitHub PR을 생성한다. "PR 만들어줘", "PR 올려줘", "PR 보내줘", "이거 머지하자", "create-pr" 요청 시 자동으로 실행한다.
disable-model-invocation: true
allowed-tools: Read Bash Glob Grep
---

현재 브랜치의 변경사항을 분석해 PR 초안을 작성하고, E2E 검증 후 GitHub PR을 생성한다.

## 단계 1: 브랜치 상태 파악

아래 명령을 실행해 변경사항을 수집한다.

```bash
git status
git log main...HEAD --oneline
git diff main...HEAD --stat
git diff main...HEAD -- src/
```

수집 결과를 바탕으로 다음 항목을 파악한다:

- 변경된 파일 목록과 성격 (신규/수정/삭제)
- 커밋 이력 요약
- 구현된 기능 또는 수정된 버그

---

## 단계 2: PR 초안 생성

파악된 내용을 바탕으로 PR 초안을 작성한다.

### 제목 규칙

- `{타입}: {한 줄 요약}` 형식 (commitlint 타입과 동일: feat / fix / refactor / test / docs / chore / style)
- 70자 이내

### 본문 구조

```
## Summary
- (변경사항 핵심을 2~4개 bullet으로)

## 변경 파일
- (주요 파일과 역할을 간략히)

## Test plan
- [ ] npm test 통과
- [ ] npm run test:e2e 통과
- (기능별 수동 확인 항목 추가)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

초안을 사용자에게 출력한 뒤 아래 메시지를 표시한다:

```
위 초안으로 PR을 진행할까요?
수정이 필요하면 변경 내용을 알려주세요. 그대로 진행하려면 "승인" 또는 "ㅇㅇ"을 입력하세요.
```

**사용자 승인을 받은 뒤에만 다음 단계로 진행한다.**

---

## 단계 3: E2E 테스트 실행

```bash
npm run test:e2e
```

---

## 단계 4: E2E 결과 분기

### 실패한 경우 — PR 생성 중단

PR을 생성하지 않고 아래 안내를 출력한다:

```
E2E 테스트가 실패했습니다. PR 생성을 중단합니다.

다음 순서로 근본 원인을 수정하세요.

① Trace Viewer로 실패 지점 확인
   npx playwright show-report

② 어느 레이어에서 깨졌는지 판별
   - API 레이어: fetch 응답 / 상태 코드 이상
   - 렌더링 레이어: DOM 구조 / 텍스트 불일치
   - 로직 레이어: 상태 전이 / 이벤트 핸들러 오작동

③ 해당 레이어의 단위 테스트에 실패 케이스 추가 (Red)

④ 프로덕션 코드를 수정해 단위 테스트를 통과시킨 뒤 (Green)
   다시 /create-pr 을 실행하세요.

⚠ E2E 테스트 코드 자체를 수정해 통과시키는 것은 금지입니다.
  근본 원인을 회피하는 행위입니다.
```

여기서 중단한다. 이후 단계를 실행하지 않는다.

### 통과한 경우 — 다음 단계로 진행

---

## 단계 5: 원격 브랜치 Push

```bash
git push -u origin HEAD
```

push가 실패하면 오류 메시지를 출력하고 중단한다. `--force` 옵션은 사용하지 않는다.

---

## 단계 6: PR 생성

베이스 브랜치를 결정한다:

- 현재 브랜치가 `feature/` 접두사인 경우 `main`을 베이스로 사용한다.
- 현재 브랜치가 이슈 번호 브랜치(`feature/tag-*` 등)이고 부모 feature 브랜치가 원격에 존재하면 해당 feature 브랜치를 베이스로 사용한다.
- 판단이 어려우면 `main`을 기본값으로 사용한다.

승인된 제목과 본문으로 PR을 생성한다:

```bash
gh pr create --title "{승인된 제목}" --base {베이스 브랜치} --body "$(cat <<'EOF'
{승인된 본문}
EOF
)"
```

PR 생성 후 URL을 출력한다.

---

## 제약

- 사용자 승인 없이 push 또는 PR 생성을 실행하지 않는다.
- E2E 실패 시 PR 생성을 강행하지 않는다.
- E2E 테스트 파일(`*.spec.ts`)을 수정해 통과시키지 않는다.
- `git push --force` 사용 금지.
- `gh pr create` 실행 전 반드시 push가 완료되어야 한다.
