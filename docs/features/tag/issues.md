# 태그 기능 이슈 분해

## 수직 슬라이싱 원칙

각 이슈는 UI → 로직 → 데이터 레이어를 수직으로 관통해 사용자에게 측정 가능한 가치를 전달한다.
의존 순서: Issue 1 → Issue 2 → Issue 3 → Issue 4, Issue 5 (4·5는 병렬 가능)

---

## Issue 1: Note 타입 & API 레이어에 tags 필드 추가

**설명**  
태그 기능의 기반이 되는 데이터 모델을 확장한다. `Note` 인터페이스에 `tags: string[]` 필드를 추가하고, 생성·수정 API 함수가 tags를 요청 바디에 포함하도록 변경한다. 이후 이슈들의 선행 조건이다.

**완료 조건 (Acceptance Criteria)**

- `Note` 인터페이스에 `tags: string[]` 필드가 존재한다.
- `createNote` 함수가 tags 배열을 요청 바디에 포함해 전송한다.
- `updateNote` 함수가 tags 배열을 요청 바디에 포함해 전송한다.
- `db.json` 시드 데이터의 기존 노트에 `"tags": []` 필드가 추가된다.
- TypeScript 컴파일 오류가 없다.

**시나리오**

_Given_ `db.json`에 `"tags"` 필드가 없는 기존 노트들이 있고, `Note` 인터페이스에 `tags` 필드가 없다  
_When_ `Note` 타입과 API 함수를 업데이트한다  
_Then_ 기존 노트는 `"tags": []`를 가지며, `createNote`·`updateNote` 호출 시 tags가 요청 바디에 포함된다

---

## Issue 2: NoteEditor에서 태그 추가·삭제

**설명**  
사용자가 NoteEditor에서 태그를 추가하고 삭제할 수 있는 인터랙션을 구현한다. `useTagInput` 훅으로 상태·로직을 캡슐화하고, `TagInput` 컴포넌트로 UI를 분리한 뒤 `NoteEditor`에 연결한다. 저장 연동은 Issue 4에서 다룬다.

**완료 조건 (Acceptance Criteria)**

- `useTagInput` 훅이 `tags`, `inputValue`, `setInputValue`, `addTag`, `removeTag`, `handleKeyDown`을 반환한다.
- `TagInput` 컴포넌트가 확정된 태그를 뱃지로 렌더링하고, 각 뱃지에 `×` 버튼이 있다.
- 입력 필드에서 `Enter` 또는 `,` 입력 시 현재 inputValue가 태그 뱃지로 확정되고 입력 필드가 초기화된다.
- `×` 버튼 클릭 시 해당 태그가 즉시 목록에서 제거된다.
- `NoteEditor`에 `<TagInput>`이 title/content 입력 영역과 함께 렌더링된다.
- 새 노트(`isCreating=true`) 진입 시 태그 목록이 `[]`로 초기화된다.
- 기존 노트 선택 시 해당 노트의 `note.tags`로 태그 목록이 초기화된다.

**시나리오 1 — 태그 추가 (Enter)**

_Given_ NoteEditor가 열려 있고 태그 입력 필드가 비어 있다  
_When_ 사용자가 "react"를 입력하고 Enter를 누른다  
_Then_ "react" 뱃지가 TagInput에 나타나고 입력 필드가 빈 문자열로 초기화된다

**시나리오 2 — 태그 추가 (쉼표)**

_Given_ NoteEditor가 열려 있고 태그 입력 필드가 비어 있다  
_When_ 사용자가 "typescript,"를 입력한다  
_Then_ "typescript" 뱃지가 추가되고 입력 필드가 초기화된다

**시나리오 3 — 태그 삭제**

_Given_ "react" 태그 뱃지가 존재한다  
_When_ 사용자가 해당 뱃지의 `×` 버튼을 클릭한다  
_Then_ "react" 뱃지가 즉시 사라진다

**시나리오 4 — 새 노트 초기화**

_Given_ 사용자가 새 노트 생성 버튼을 클릭한다  
_When_ NoteEditor가 새 노트 모드로 열린다  
_Then_ 태그 목록이 비어 있다

**시나리오 5 — 기존 노트 태그 로드**

_Given_ `note.tags = ["vue", "pinia"]`인 노트를 사이드바에서 선택한다  
_When_ NoteEditor가 해당 노트로 열린다  
_Then_ "vue"와 "pinia" 뱃지가 TagInput에 표시된다

---

## Issue 3: 태그 입력 검증 (normalize & 중복 방지)

**설명**  
잘못된 태그 입력이 조용히 무시되도록 `useTagInput`의 `addTag` 함수 내부에 normalize 및 검증 로직을 추가한다. 호출자(`TagInput`)는 raw 값을 그대로 전달하고, 훅이 normalize → 검증 → 추가 순서로 처리한다.

**완료 조건 (Acceptance Criteria)**

- 태그는 소문자 변환 + 앞뒤 trim + 내부 공백 제거(normalize)를 거쳐 저장된다.
- 공백만으로 이루어진 입력(normalize 결과가 빈 문자열)은 추가되지 않는다.
- normalize 후 20자를 초과하는 태그는 추가되지 않는다.
- normalize 후 이미 존재하는 태그와 동일한 값은 추가되지 않는다.
- 거부된 입력에 대해 에러 메시지나 UI 피드백이 없다(조용히 무시).

**시나리오 1 — normalize 적용**

_Given_ 태그 입력 필드가 비어 있다  
_When_ 사용자가 " React JS "를 입력하고 Enter를 누른다  
_Then_ "reactjs" 뱃지가 추가된다

**시나리오 2 — 공백 전용 입력 무시**

_Given_ 태그 입력 필드가 비어 있다  
_When_ 사용자가 " "를 입력하고 Enter를 누른다  
_Then_ 아무 뱃지도 추가되지 않고 UI에 아무 변화가 없다

**시나리오 3 — 20자 초과 무시**

_Given_ 태그 입력 필드가 비어 있다  
_When_ 사용자가 21자 이상의 문자열을 입력하고 Enter를 누른다  
_Then_ 아무 뱃지도 추가되지 않는다

**시나리오 4 — 중복 입력 무시**

_Given_ "react" 뱃지가 이미 존재한다  
_When_ 사용자가 "REACT"를 입력하고 Enter를 누른다  
_Then_ 뱃지 목록에 변화가 없다

---

## Issue 4: 태그 포함 일괄 저장

**설명**  
저장 버튼 클릭 시 `title`, `content`와 함께 `tags` 배열이 API로 전송되도록 NoteEditor의 저장 흐름을 확장한다. 저장 성공 후 Context 상태가 최신 tags를 반영한다.

**완료 조건 (Acceptance Criteria)**

- 저장 버튼 클릭 시 `updateNote` / `createNote`에 `tags` 배열이 전달된다.
- API PUT/POST 요청 바디에 `"tags"` 필드가 포함된다.
- 저장 성공 후 Context의 notes 배열이 최신 tags를 반영해 갱신된다.
- 저장 후 같은 노트를 다시 선택하면 저장된 태그가 에디터에 표시된다.
- 저장하지 않고 다른 노트로 이동하면 미확정 태그 변경이 버려진다.

**시나리오 1 — 기존 노트에 태그 추가 후 저장**

_Given_ NoteEditor에 "react", "typescript" 태그가 추가되어 있다  
_When_ 사용자가 저장 버튼을 클릭한다  
_Then_ API PUT 요청 바디에 `"tags": ["react", "typescript"]`가 포함되고 Context가 갱신된다

**시나리오 2 — 새 노트에 태그 추가 후 저장**

_Given_ 새 노트 모드에서 "vue" 태그를 추가했다  
_When_ 사용자가 저장 버튼을 클릭한다  
_Then_ API POST 요청 바디에 `"tags": ["vue"]`가 포함된다

**시나리오 3 — 태그 없이 저장**

_Given_ 태그를 추가하지 않은 노트가 있다  
_When_ 사용자가 저장 버튼을 클릭한다  
_Then_ API 요청 바디에 `"tags": []`가 포함된다

**시나리오 4 — 저장 없이 이동 시 변경 폐기**

_Given_ NoteEditor에 "discarded" 태그를 추가했지만 저장하지 않았다  
_When_ 사용자가 다른 노트를 사이드바에서 클릭한다  
_Then_ "discarded" 태그 변경이 폐기되고 서버 데이터는 변경되지 않는다

---

## Issue 5: NoteItem 사이드바 태그 뱃지 표시

**설명**  
사이드바의 각 `NoteItem`에 해당 노트의 태그를 소형 뱃지로 표시해 목록에서 태그를 한눈에 확인할 수 있게 한다. `NoteItemProps` 시그니처 변경 없이 기존 `note.tags`를 직접 접근한다.

**완료 조건 (Acceptance Criteria)**

- `NoteItem`이 `note.tags`를 읽어 소형 뱃지로 렌더링한다.
- `NoteItemProps` 시그니처 변경 없이 기존 `note` prop에서 `note.tags`를 직접 접근한다.
- `NoteList`에서 `NoteItem`을 렌더링하는 호출부 변경이 없다.
- `tags`가 빈 배열이면 뱃지 영역이 렌더링되지 않는다.
- 태그 뱃지는 NoteEditor 뱃지보다 작은 크기(소형)로 표시된다.
- 노트 저장 후 사이드바의 해당 NoteItem이 최신 tags를 즉시 반영한다.

**시나리오 1 — 태그 있는 노트**

_Given_ `note.tags = ["react", "typescript"]`인 노트가 노트 목록에 있다  
_When_ 사이드바가 렌더링된다  
_Then_ 해당 NoteItem에 "react"와 "typescript" 뱃지가 소형으로 표시된다

**시나리오 2 — 태그 없는 노트**

_Given_ `note.tags = []`인 노트가 노트 목록에 있다  
_When_ 사이드바가 렌더링된다  
_Then_ 해당 NoteItem에 태그 뱃지 영역이 표시되지 않는다

**시나리오 3 — 태그 저장 후 사이드바 즉시 반영**

_Given_ NoteEditor에서 "vue" 태그를 추가하고 저장했다  
_When_ 저장이 완료된다  
_Then_ 사이드바의 해당 NoteItem에 "vue" 뱃지가 즉시 표시된다
