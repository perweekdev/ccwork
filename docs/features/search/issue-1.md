# Issue 1 시그니처 & 테스트 시나리오

## 시그니처

### 순수 필터 함수

```ts
// src/components/NoteList.tsx (named export)
export function filterNotes(notes: Note[], query: string): Note[];
```

- `query`가 빈 문자열이면 `notes` 전체 반환
- `title`, `content` 모두 검사
- 비교 전 `query`와 노트 필드를 모두 `.toLowerCase()` 처리
- 에러 케이스 없음 — 항상 `Note[]` 반환

### NoteList 컴포넌트 (Props 변경 없음)

```ts
interface NoteListProps {
  selectedNoteId: string | null;
  onSelect: (id: string) => void;
}

// 내부 로컬 state (참고)
// const [searchQuery, setSearchQuery] = useState<string>('')
```

---

## 테스트 시나리오

### filterNotes 함수

| #   | 분류 | 시나리오                                                                                      |
| --- | ---- | --------------------------------------------------------------------------------------------- |
| 1   | 정상 | ✅ filterNotes — should return notes whose title contains the query                           |
| 2   | 정상 | ✅ filterNotes — should return notes whose content contains the query                         |
| 3   | 경계 | ✅ filterNotes — should return all notes when query is empty string                           |
| 4   | 경계 | ✅ filterNotes — should return empty array when no notes match query                          |
| 5   | 예외 | ✅ filterNotes — should match case-insensitively (uppercase query matches lowercase title)    |
| 6   | 예외 | ✅ filterNotes — should match case-insensitively (lowercase query matches mixed-case content) |

### NoteList 컴포넌트

| #   | 분류 | 시나리오                                                                         |
| --- | ---- | -------------------------------------------------------------------------------- |
| 7   | 정상 | ✅ NoteList — should render search input with placeholder "노트 검색..."         |
| 8   | 정상 | ✅ NoteList — should show only matching notes when search query is typed         |
| 9   | 경계 | ✅ NoteList — should show all notes when search query is cleared to empty string |
