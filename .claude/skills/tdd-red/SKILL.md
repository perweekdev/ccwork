---
name: tdd-red
description: 승인된 테스트 시나리오를 실패하는 테스트 코드로 작성한다. TDD Red 단계 시작 시 사용한다.
argument-hint: <이슈 번호>
allowed-tools: Read Write Bash
---

`$ARGUMENTS`에서 이슈 번호를 파싱해 해당 이슈의 승인된 시나리오를 실패하는 테스트 코드로 작성한다.

## 시작 전

### 인자 파싱

`$ARGUMENTS`를 이슈 번호(`{issue}`)로 사용한다.

`{feature}`는 현재 브랜치명에서 추출한다:

```bash
git branch --show-current
```

- `feature/<spec>-issue-N` 형태이면 `<spec>` 부분을 `{feature}`로 사용한다.
- `feature/<spec>` 형태이면 `<spec>` 부분을 `{feature}`로 사용한다 (`feature/` 제거).
- 추출이 불가능하면 사용자에게 질문한다: "어떤 기능의 이슈인가요? (예: tag, search)"

`{issue}`가 없으면: "이슈 번호를 알려주세요."

두 값이 확정된 뒤 `docs/features/{feature}/issue-{issue}.md` 를 읽어 시그니처와 테스트 시나리오 목록을 파악한다.

- 시그니처 섹션: 테스트 대상 파일 경로 및 함수·컴포넌트명 확인
- 테스트 시나리오 섹션: 작성할 시나리오 목록 전체 수집

파일이 없으면 즉시 멈추고 사용자에게 알린다 (`/test-scenarios {issue}` 를 먼저 실행해야 한다는 안내 포함).

---

## 단계 0: 스텁 생성

테스트 파일을 작성하기 전에, 이슈의 시그니처를 읽어 **아직 존재하지 않는 구현 파일**에 대해서만 최소 스텁을 생성한다.

### 목적

Import Error 때문에 테스트가 실행조차 되지 않으면, 테스트가 무엇을 거부하는지 알 수 없다. 스텁은 빌드를 통과시켜 테스트가 **Assertion Failure로 실패**하도록 만드는 것이 전부다.

### 스텁 작성 규칙

- **기존 파일이 있으면 건드리지 않는다.** 신규 파일만 생성한다.
- 시그니처의 파라미터·반환 타입을 그대로 선언한다. 구현 로직은 쓰지 않는다.
- 반환값은 타입을 만족하는 최솟값으로 고정한다.

| 반환 타입      | 스텁 반환값                     |
| -------------- | ------------------------------- |
| `string[]`     | `[]`                            |
| `string`       | `''`                            |
| `boolean`      | `false`                         |
| `Promise<T>`   | `Promise.resolve(/* 최솟값 */)` |
| React 컴포넌트 | `return <div />;`               |
| `void`         | _(반환 없음)_                   |

### 스텁 예시

**훅 (`src/hooks/useTagInput.ts`)**

```ts
import { useState } from 'react';

export function useTagInput(_initialTags: string[]) {
  const [tags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  return {
    tags,
    inputValue,
    setInputValue,
    addTag: (_value: string) => {},
    removeTag: (_tag: string) => {},
    handleKeyDown: (_e: React.KeyboardEvent<HTMLInputElement>) => {},
  };
}
```

**컴포넌트 (`src/components/TagInput.tsx`)**

```tsx
import { TagInputProps } from '../types'; // 필요 시 인라인 정의

export function TagInput(_props: TagInputProps) {
  return <div />;
}
```

**API 함수 (`src/api/tags.ts`)**

```ts
import { Note } from '../types/note';

export async function addTag(_noteId: string, _tag: string): Promise<Note> {
  return Promise.resolve({} as Note);
}
```

---

## 단계 1: 테스트 파일 준비

시그니처에서 테스트 파일 경로를 결정한다.

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

이슈의 시나리오 전체를 한 번에 `it()` 블록으로 변환한다.

### 테스트 이름 형식

```
should [기대 동작] when [조건]
```

### describe 블록 구조

함수·컴포넌트 단위로 묶는다.

```ts
describe('함수명 또는 컴포넌트명', () => {
  it('should [기대 동작] when [조건]', () => {
    // 스텁이 있으므로 import는 통과하고, assertion이 실패한다
  });
});
```

### Red 테스트 작성 원칙

- `expect`는 실제 기대 동작을 명확하게 표현한다. `expect(true).toBe(false)` 같은 더미 assertion은 사용하지 않는다.
- 스텁의 반환값(빈 배열, `<div />` 등)을 기준으로 assertion이 자연스럽게 실패하도록 작성한다.
- 테스트가 통과하도록 mock이나 stub으로 우회하지 않는다.

**API 함수 예시**

```ts
import { addTag } from './tags';

describe('addTag', () => {
  it('should return updated note when valid tag is added', async () => {
    const result = await addTag('note-1', 'work');
    expect(result.tags).toContain('work'); // 스텁은 {} 반환 → tags 없음 → Assertion Failure
  });

  it('should throw when tag is empty string', async () => {
    await expect(addTag('note-1', '')).rejects.toThrow(); // 스텁은 throw 안 함 → Assertion Failure
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
    expect(screen.getByRole('textbox')).toBeInTheDocument(); // 스텁은 <div /> → textbox 없음 → Assertion Failure
  });
});
```

---

## 단계 3: 실행 및 Red 품질 확인

모든 테스트 파일을 작성한 뒤 파일별로 실행한다.

```bash
npx vitest run <테스트-파일-경로> --reporter=verbose
```

### Red 품질 기준

| 실패 유형         | 판정           | 조치                                  |
| ----------------- | -------------- | ------------------------------------- |
| Assertion Failure | ✅ 올바른 Red  | 다음으로 진행                         |
| Runtime Error     | ✅ 허용        | 다음으로 진행                         |
| Import Error      | ❌ 스텁 누락   | 단계 0으로 돌아가 해당 파일 스텁 보완 |
| Syntax Error      | ❌ 테스트 오류 | 테스트 코드 수정                      |

- **Import Error가 발생하면 올바른 Red로 인정하지 않는다.** 스텁을 보완한 뒤 다시 실행한다.
- 테스트가 의도치 않게 통과하면 즉시 멈추고 사용자에게 알린다.

---

## 단계 4: 전체 확인

모든 파일의 Red 품질이 확인된 뒤 전체 테스트를 실행한다.

```bash
npm test
```

- 이슈에서 작성한 테스트 파일의 케이스가 모두 Assertion Failure로 실패하는지 확인한다.
- 기존에 통과하던 테스트가 새로 실패하면 즉시 사용자에게 보고한다.

---

## 제약

- 테스트 파일(`*.test.ts`, `*.test.tsx`)은 자유롭게 생성·수정한다.
- **기존 구현 파일은 수정하지 않는다.**
- 단, 존재하지 않는 구현 파일에 대해서는 컴파일 가능한 최소 계약 스텁을 생성할 수 있다.
- 스텁은 타입 만족 및 빌드 통과만을 목적으로 하며, 실제 비즈니스 로직을 포함하면 안 된다.

---

## 산출물

- 생성된 스텁 파일 목록 및 최솟값 반환 내용
- 작성된 테스트 파일 목록 및 경로
- 파일별 실패 유형 요약 (Assertion Failure / Runtime Error)
- `npm test` 결과: 실패한 테스트 수 / 전체 테스트 수
