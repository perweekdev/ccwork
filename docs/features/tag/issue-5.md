# Issue 5 시그니처 & 테스트 시나리오

## 시그니처

### NoteItemProps — 변경 없음

```ts
// src/components/NoteItem.tsx — 기존 Props 그대로 유지
interface NoteItemProps {
  note: Note; // note.tags 는 여기서 직접 읽음
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}
```

ADR-4에 따라 `note.tags`를 기존 `note` prop에서 직접 접근한다. `NoteList` 호출부 변경 없음.

### NoteItem — 내부 렌더링 변경만 (exported 시그니처 없음)

```
// 추가될 렌더링 계약
// - note.tags.length > 0 일 때만 뱃지 영역을 렌더링
// - 각 태그를 소형 뱃지(NoteEditor 뱃지보다 작은 크기)로 표시
// - 뱃지에 × 버튼 없음 (읽기 전용 표시)
```

**변경 없는 항목**

- `NoteList.tsx` — `NoteItem` 호출부 변경 없음
- `Note` 타입 — 이미 `tags: string[]` 포함
- `NoteItemProps` — 시그니처 변경 없음

---

## 테스트 시나리오

### NoteItem — 태그 뱃지 렌더링

- [정상] NoteItem — should render a badge for each tag when note.tags contains values
- [정상] NoteItem — should render tag text within each badge element
- [경계] NoteItem — should not render any badge when note.tags is empty array

### NoteItem — tags prop 변경 반영

- [정상] NoteItem — should reflect updated tags when note prop is updated with new tags

---

## AC 커버리지

| AC 항목                                   | 커버 시나리오                                                    | 상태 |
| ----------------------------------------- | ---------------------------------------------------------------- | ---- |
| NoteItem이 note.tags를 소형 뱃지로 렌더링 | should render a badge for each tag / should render tag text      | ✅   |
| NoteItemProps 시그니처 변경 없음          | TypeScript 타입 체크로 검증 (테스트 불필요)                      | ✅   |
| NoteList 호출부 변경 없음                 | 기존 NoteList 코드 유지                                          | ✅   |
| tags가 빈 배열이면 뱃지 영역 렌더링 안 됨 | should not render any badge when note.tags is empty              | ✅   |
| NoteEditor 뱃지보다 작은 크기(소형)       | design-check 스크립트 + tdd-green 단계 디자인 토큰 적용으로 검증 | ✅   |
| 저장 후 사이드바 즉시 반영                | should reflect updated tags when note prop is updated            | ✅   |
