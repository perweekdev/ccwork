# Issue 1 시그니처 & 테스트 시나리오

## 시그니처

### Note 인터페이스 — tags 필드 추가

```ts
// src/types/note.ts
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}
```

### createNote (API) — 시그니처 변경 없음

```ts
// src/api/notes.ts
// Omit<Note, 'id' | 'createdAt' | 'updatedAt'>가 tags: string[] 를 자동 포함
export async function createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note>;
```

### updateNote (API) — 시그니처 변경 없음

```ts
// src/api/notes.ts
// Partial<Note>가 tags?: string[] 를 자동 포함
export async function updateNote(id: string, updates: Partial<Note>): Promise<Note>;
```

### Context createNote — 공개 시그니처 변경 없음, 내부 호출만 수정

```ts
// src/context/NotesContext.tsx
// 공개 타입: createNote: (title: string, content: string) => Promise<void>
// 내부 api 호출: api.createNote({ title, content, tags: [] })
```

### db.json — 시드 데이터

```
기존 노트 4개 모두에 "tags": [] 필드 추가
```

---

## 테스트 시나리오

### createNote (API)

- [정상] createNote — should include tags in request body when called with title, content, and non-empty tags
- [경계] createNote — should include empty array in request body when called with tags: []
- [예외] createNote — should throw Error('Failed to create note') when response is not ok

### updateNote (API)

- [정상] updateNote — should include tags in request body when tags are provided in updates
- [경계] updateNote — should succeed without tags field when tags is omitted from updates (Partial)
- [예외] updateNote — should throw Error('Failed to update note') when response is not ok

### Note 타입

- [정상] Note — should accept tags: string[] field without TypeScript error
- [경계] Note — should accept tags: [] (empty array) as valid value

### AC 커버리지

| AC 항목                                                | 커버 시나리오                                     | 상태 |
| ------------------------------------------------------ | ------------------------------------------------- | ---- |
| `Note` 인터페이스에 `tags: string[]` 필드가 존재한다   | Note — should accept tags: string[] field         | ✅   |
| `createNote`가 tags 배열을 요청 바디에 포함해 전송한다 | createNote — should include tags in request body  | ✅   |
| `updateNote`가 tags 배열을 요청 바디에 포함해 전송한다 | updateNote — should include tags in request body  | ✅   |
| `db.json` 기존 노트에 `"tags": []` 필드가 추가된다     | (런타임 데이터 — 테스트 대상 외)                  | ✅   |
| TypeScript 컴파일 오류가 없다                          | Note / createNote / updateNote 타입 시나리오 전체 | ✅   |
