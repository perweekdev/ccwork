# Issue 3 시그니처 & 테스트 시나리오

## 시그니처

### useTagInput — 공개 시그니처 변경 없음, addTag 내부 동작만 변경

```ts
// src/hooks/useTagInput.ts
// 반환 타입 변경 없음
function useTagInput(initialTags: string[]): {
  tags: string[];
  inputValue: string;
  setInputValue: (value: string) => void;
  addTag: (value: string) => void;
  removeTag: (tag: string) => void;
  handleKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  setTags: (tags: string[]) => void;
};
```

**addTag 처리 계약 (내부 순서)**

```
1. normalize: value.toLowerCase().trim().replace(/\s+/g, '')
2. normalized === '' → return (조용히 무시)
3. normalized.length > 20 → return (조용히 무시)
4. tags.includes(normalized) → return (조용히 무시)
5. setTags([...prev, normalized]) + setInputValue('')
```

### 에러 케이스

- normalize 후 빈 문자열 → 조용히 무시 (에러 없음)
- normalize 후 21자 이상 → 조용히 무시 (에러 없음)
- normalize 후 이미 존재하는 값 → 조용히 무시 (에러 없음)

---

## 테스트 시나리오

### useTagInput.addTag — normalize

- [정상] useTagInput.addTag — should store normalized value when input has uppercase letters (" React JS " → "reactjs")
- [정상] useTagInput.addTag — should clear inputValue after adding normalized tag

### useTagInput.addTag — 길이 검증

- [경계] useTagInput.addTag — should add tag when normalized length is exactly 20 characters
- [예외] useTagInput.addTag — should not add tag when normalized length exceeds 20 characters

### useTagInput.addTag — 공백 입력 거부

- [경계] useTagInput.addTag — should not add tag when input is whitespace-only string

### useTagInput.addTag — 중복 방지

- [예외] useTagInput.addTag — should not add tag when normalized value already exists in tags array
- [예외] useTagInput.addTag — should not add tag when input differs only in case from existing tag (e.g., "REACT" when "react" exists)

---

## AC 커버리지

| AC 항목                                                                    | 커버 시나리오                                                                           | 상태 |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---- |
| 태그는 소문자 변환 + 앞뒤 trim + 내부 공백 제거(normalize)를 거쳐 저장된다 | addTag — should store normalized value when input has uppercase letters                 | ✅   |
| 공백만으로 이루어진 입력(normalize 결과가 빈 문자열)은 추가되지 않는다     | addTag — should not add tag when input is whitespace-only string                        | ✅   |
| normalize 후 20자를 초과하는 태그는 추가되지 않는다                        | addTag — should not add tag when normalized length exceeds 20 characters                | ✅   |
| normalize 후 20자 이하는 추가된다 (경계)                                   | addTag — should add tag when normalized length is exactly 20 characters                 | ✅   |
| normalize 후 이미 존재하는 태그와 동일한 값은 추가되지 않는다              | addTag — should not add tag when normalized value already exists / differs only in case | ✅   |
| 거부된 입력에 대해 에러 메시지나 UI 피드백이 없다 (조용히 무시)            | 모든 거부 시나리오 (tags·inputValue 불변 확인)                                          | ✅   |
