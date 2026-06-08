# Issue 2 시그니처 & 테스트 시나리오

## 시그니처

### useTagInput 훅 — 신규

```ts
// src/hooks/useTagInput.ts
function useTagInput(initialTags: string[]): {
  tags: string[];
  inputValue: string;
  setInputValue: (value: string) => void;
  addTag: (value: string) => void;
  removeTag: (tag: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};
```

### TagInput 컴포넌트 — 신규

```ts
// src/components/TagInput.tsx
interface TagInputProps {
  tags: string[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onRemove: (tag: string) => void;
}

export function TagInput({ tags, inputValue, onInputChange, onKeyDown, onRemove }: TagInputProps);
```

### NoteEditor — Props 변경 없음, 내부 변경만

```ts
// src/components/NoteEditor.tsx
// NoteEditorProps 변경 없음
// 내부: useTagInput(selectedNote?.tags ?? []) 호출 추가
// 내부: <TagInput> 렌더링 추가
```

### 에러 케이스

- `removeTag`에 존재하지 않는 태그 전달 → 조용히 무시 (tags 배열 변화 없음)
- `addTag`에 빈 문자열 전달 → 조용히 무시 (validate 로직은 Issue 3에서 추가)

---

## 테스트 시나리오

### useTagInput — 초기화

- [정상] useTagInput — should initialize tags with given initialTags array
- [경계] useTagInput — should initialize tags as empty array when initialTags is []

### useTagInput — addTag

- [정상] useTagInput.addTag — should append tag to tags array when called with non-empty string
- [정상] useTagInput.addTag — should clear inputValue after tag is added
- [경계] useTagInput.addTag — should do nothing when called with empty string

### useTagInput — removeTag

- [정상] useTagInput.removeTag — should remove tag from tags array when called with existing tag
- [경계] useTagInput.removeTag — should not mutate tags array when called with non-existing tag

### useTagInput — handleKeyDown

- [정상] useTagInput.handleKeyDown — should call addTag when Enter key is pressed
- [정상] useTagInput.handleKeyDown — should call addTag when comma(,) key is pressed
- [경계] useTagInput.handleKeyDown — should not call addTag when other keys are pressed

### TagInput 컴포넌트

- [정상] TagInput — should render a badge for each tag in tags prop
- [정상] TagInput — should render × button on each badge
- [정상] TagInput — should call onRemove with the tag when × button is clicked
- [정상] TagInput — should render input field with current inputValue
- [경계] TagInput — should render no badges when tags is empty array
- [경계] TagInput — should call onInputChange when input value changes
- [경계] TagInput — should call onKeyDown when a key is pressed in input field

### NoteEditor 통합

- [정상] NoteEditor — should render TagInput component
- [정상] NoteEditor — should initialize tags as [] when isCreating is true
- [정상] NoteEditor — should initialize tags from note.tags when an existing note is selected
- [경계] NoteEditor — should reset tags to [] when switching to new note creation mode

---

## AC 커버리지

| AC 항목                                                                                                  | 커버 시나리오                                                         | 상태 |
| -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---- |
| `useTagInput`이 `tags`, `inputValue`, `setInputValue`, `addTag`, `removeTag`, `handleKeyDown`을 반환한다 | useTagInput 초기화 / addTag / removeTag / handleKeyDown 시나리오 전체 | ✅   |
| `TagInput`이 확정된 태그를 뱃지로 렌더링하고 각 뱃지에 `×` 버튼이 있다                                   | TagInput — should render a badge / should render × button             | ✅   |
| `Enter` 또는 `,` 입력 시 태그가 확정되고 입력 필드가 초기화된다                                          | handleKeyDown Enter / comma / addTag clears inputValue                | ✅   |
| `×` 버튼 클릭 시 해당 태그가 즉시 제거된다                                                               | TagInput — should call onRemove / removeTag — should remove tag       | ✅   |
| `NoteEditor`에 `<TagInput>`이 렌더링된다                                                                 | NoteEditor — should render TagInput                                   | ✅   |
| 새 노트 진입 시 태그 목록이 `[]`로 초기화된다                                                            | NoteEditor — should initialize tags as [] when isCreating             | ✅   |
| 기존 노트 선택 시 `note.tags`로 태그 목록이 초기화된다                                                   | NoteEditor — should initialize tags from note.tags                    | ✅   |
