# Issue 4 시그니처 & 테스트 시나리오

## 시그니처

### NotesContext — createNote 시그니처 변경

```ts
// src/context/NotesContext.tsx (NotesContextType 내)
createNote: (title: string, content: string, tags: string[]) => Promise<void>;
```

기존 `createNote` 내부에서 `tags: []` 하드코딩 제거. `tags` 파라미터를 `api.createNote`에 그대로 전달한다.

### NoteEditor.handleSave — 내부 구현 변경 (exported 시그니처 없음)

```ts
// src/components/NoteEditor.tsx (handleSave 내부)
// Before
await createNote(title, content);
await updateNote(selectedNoteId, { title, content });

// After
await createNote(title, content, tags);
await updateNote(selectedNoteId, { title, content, tags });
```

`tags`는 `useTagInput` 훅에서 이미 관리 중. 전달만 추가.

**변경 없는 항목**

- `api/notes.ts` — `updateNote(id, updates: Partial<Note>)` 이미 tags 포함 가능
- `NotesContext.updateNote` — `updates: Partial<Note>` 이미 tags 수용 가능
- `NoteEditorProps` / `TagInput` / `useTagInput` — 변경 없음

---

## 테스트 시나리오

### NoteEditor.handleSave — createNote에 tags 전달

- [정상] NoteEditor.handleSave — should call createNote with tags array when save is clicked in create mode
- [경계] NoteEditor.handleSave — should call createNote with empty tags array when no tags are added in create mode

### NoteEditor.handleSave — updateNote에 tags 전달

- [정상] NoteEditor.handleSave — should call updateNote with updates including tags array when save is clicked in edit mode

### NoteEditor — 저장 없이 이동 시 태그 변경 폐기

- [정상] NoteEditor — should discard unsaved tag changes when switching to a different note

---

## AC 커버리지

| AC 항목                                            | 커버 시나리오                                                   | 상태 |
| -------------------------------------------------- | --------------------------------------------------------------- | ---- |
| 저장 버튼 클릭 시 createNote에 tags 배열 전달      | handleSave — should call createNote with tags array             | ✅   |
| 저장 버튼 클릭 시 createNote에 빈 tags 전달 (경계) | handleSave — should call createNote with empty tags array       | ✅   |
| 저장 버튼 클릭 시 updateNote에 tags 배열 전달      | handleSave — should call updateNote with tags array             | ✅   |
| API PUT/POST 바디에 tags 포함                      | api.notes.ts의 Partial<Note> 처리로 충족, Context 변경으로 연결 | ✅   |
| 저장 성공 후 Context notes 갱신                    | Context.updateNote의 setNotes 기존 구현 + 시나리오 3 간접 검증  | ✅   |
| 저장 후 같은 노트 재선택 시 tags 표시              | Context 갱신 결과이므로 시나리오 3으로 충족                     | ✅   |
| 저장 없이 이동 시 미확정 태그 변경 폐기            | NoteEditor — should discard unsaved tag changes                 | ✅   |
