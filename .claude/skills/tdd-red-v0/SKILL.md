---
name: tdd-red-v0
description: 승인된 테스트 시나리오를 실패하는 테스트 코드로 작성한다. TDD Red 단계 시작 시 사용한다.
argument-hint: <feature> <이슈 번호>
allowed-tools: Read Write Bash
---

`$ARGUMENTS`에서 feature 이름과 이슈 번호를 파싱해 해당 이슈의 승인된 시나리오를 실패하는 테스트 코드로 작성한다.

## 시작 전

### 인자 파싱

`$ARGUMENTS`를 공백으로 분리해 첫 번째 토큰을 `{feature}`, 두 번째 토큰을 `{issue}` 로 사용한다.

| 입력 예시           | feature  | issue |
| ------------------- | -------- | ----- |
| `/tdd-red tag 2`    | `tag`    | `2`   |
| `/tdd-red search 1` | `search` | `1`   |

누락된 값이 있으면 실행 전에 사용자에게 질문한다.

- `{feature}`가 없으면: "어떤 기능의 이슈인가요? (예: tag, search, ...)"
- `{issue}`가 없으면: "이슈 번호를 알려주세요."

두 값이 확정된 뒤 `docs/features/{feature}/issue-{issue}.md` 를 읽어 시그니처와 테스트 시나리오 목록을 파악한다.

- 시그니처 섹션: 테스트 대상 파일 경로 및 함수·컴포넌트명 확인
- 테스트 시나리오 섹션: 작성할 시나리오 목록 전체 수집

파일이 없으면 즉시 멈추고 사용자에게 알린다 (`/test-scenarios {feature} {issue}` 를 먼저 실행해야 한다는 안내 포함).

---

## 단계 1: 테스트 파일 준비

시그니처에서 테스트 대상 파일 경로를 추출하고 테스트 파일 경로를 결정한다.

### 파일 위치 규칙

| 구현 파일                      | 테스트 파일                         |
| ------------------------------ | ----------------------------------- |
| `src/api/tags.ts`              | `src/api/tags.test.ts`              |
| `src/components/TagInput.tsx`  | `src/components/TagInput.test.tsx`  |
| `src/context/NotesContext.tsx` | `src/context/NotesContext.test.tsx` |

- 테스트 파일이 이미 존재하면 기존 내용을 읽어 중복 `describe` 블록을 피한다.
- 테스트 파일이 없으면 새로 생성한다.

### 파일 헤더 (신규 생성 시)

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
// 컴포넌트 파일인 경우에만 추가:
// import { render, screen } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
```

---

## 단계 2: 시나리오를 테스트 코드로 작성

시나리오를 하나씩 `it()` 블록으로 변환한다. 한 번에 모두 작성하지 않고 **시나리오 하나 작성 → 실행 → 실패 확인 → 다음 시나리오** 순서를 반복한다.

### 테스트 이름 형식

```
should [기대 동작] when [조건]
```

### describe 블록 구조

함수·컴포넌트 단위로 묶는다.

```ts
describe('함수명 또는 컴포넌트명', () => {
  it('should [기대 동작] when [조건]', () => {
    // Red 단계: 구현이 없으므로 실패하는 코드만 작성
  });
});
```

### Red 테스트 작성 원칙

- 구현이 존재하지 않으므로 import가 실패하거나 호출이 오류를 던져야 한다.
- 억지로 통과시키려 하지 않는다. 실패 자체가 목표다.
- `expect`는 실제 기대 동작을 명확하게 표현한다. `expect(true).toBe(false)` 같은 더미 assertion은 사용하지 않는다.

**API 함수 예시**

```ts
import { addTag } from './tags';

describe('addTag', () => {
  it('should return updated note when valid tag is added', async () => {
    const result = await addTag('note-1', 'work');
    expect(result.tags).toContain('work');
  });

  it('should throw when tag is empty string', async () => {
    await expect(addTag('note-1', '')).rejects.toThrow();
  });
});
```

**컴포넌트 예시**

```ts
import { render, screen } from '@testing-library/react';
import { TagInput } from './TagInput';

describe('TagInput', () => {
  it('should render input when component is mounted', () => {
    render(<TagInput tags={[]} onAdd={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
```

---

## 단계 3: 시나리오별 실행 루프

각 시나리오를 작성한 직후 아래 명령으로 해당 테스트 파일만 실행한다.

```bash
npx vitest run <테스트-파일-경로> --reporter=verbose
```

- **실패 확인**: `FAIL` 또는 import 오류가 나오면 정상. 다음 시나리오로 이동한다.
- **통과**: 테스트가 의도치 않게 통과하면 즉시 멈추고 사용자에게 알린다. 구현 파일이 이미 존재하는지 확인한다.

---

## 단계 4: 전체 확인

모든 시나리오 작성이 끝나면 전체 테스트를 실행한다.

```bash
npm test
```

- 작성한 테스트 파일의 모든 케이스가 실패하는지 확인한다.
- 기존에 통과하던 테스트가 새로 실패하면 즉시 사용자에게 보고한다.

---

## 제약

- 테스트 파일(`*.test.ts`, `*.test.tsx`)만 생성하거나 수정한다.
- `src/` 안의 구현 코드(`*.ts`, `*.tsx`, `*.css` 등 테스트 파일 제외)는 절대 수정하지 않는다.
- 테스트가 통과하도록 mock이나 stub으로 우회하지 않는다.

---

## 산출물

- 작성된 테스트 파일 목록 및 경로
- 시나리오별 실패 메시지 요약
- `npm test` 결과: 실패한 테스트 수 / 전체 테스트 수
