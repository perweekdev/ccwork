# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

React 19 + TypeScript + Vite 기반 노트 앱 실습 프로젝트. 백엔드는 `db.json`을 감시하는 json-server로 구성된다.

- 앱: http://localhost:5173
- API: http://localhost:3001/notes

## 개발 명령어

```bash
npm run dev          # Vite + json-server 동시 실행 (concurrently)
npm run build        # tsc + vite build
npm run lint         # ESLint --fix
npm run format       # Prettier --write
npm test             # Vitest one-shot
npm run test:watch   # Vitest watch 모드
npm run server       # json-server 단독 실행
```

## 아키텍처

```
App.tsx (selectedNoteId, isCreating 상태 관리)
└── NotesProvider (Context)
    └── Layout
        ├── NoteList (사이드바)
        │   └── NoteItem
        └── NoteEditor (메인 패널)
```

**데이터 흐름**:

1. `src/api/notes.ts` — 순수 fetch() 래퍼. REST CRUD만 담당. `createdAt`/`updatedAt` 타임스탬프를 API 레이어에서 직접 생성해 요청 바디에 포함한다 (서버에서 생성하지 않음).
2. `src/context/NotesContext.tsx` — API 호출 + `notes[]` 상태를 보유하는 단일 전역 Context. `useNotes()` hook으로 소비하며, Provider 외부에서 호출하면 즉시 throw한다.
3. `src/App.tsx` — `selectedNoteId`와 `isCreating` 두 UI 상태만 관리. Context에 직접 접근하지 않고 Layout/NoteList/NoteEditor에 props로 전달한다.

## 핵심 타입

```ts
// src/types/note.ts
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string; // ISO 8601
  updatedAt: string;
  // tags 필드 없음 — 강의에서 추가 예정
}
```

## 스타일링

Tailwind CSS v4 (`@tailwindcss/vite` 플러그인 방식). 별도 `tailwind.config.*` 파일 없음. 시맨틱 컬러 토큰(`text-foreground`, `bg-card`, `text-muted-foreground` 등)을 사용한다.

## 스타일 작업

스타일 관련 작업(컴포넌트 생성, 색상·레이아웃 수정 등) 시 반드시 아래 디자인 스킬 중 **하나 이상**을 활용한다.

| 스킬                          | 용도                                                                   |
| ----------------------------- | ---------------------------------------------------------------------- |
| `/design-check <파일경로>`    | 작업 완료 후 디자인 규칙 위반 점검                                     |
| `/new-component <컴포넌트명>` | 디자인 시스템 패턴으로 컴포넌트 스캐폴딩                               |
| `/token-add <이름> <값>`      | 새 토큰을 `src/index.css`와 `docs/design-system/tokens.md`에 동시 추가 |

전체 디자인 시스템 문서: `docs/design-system/`

@docs/design-system/rules.md

## 테스트

- Vitest + Testing Library + jsdom
- 설정: `vite.config.ts` 내 `test` 블록 (별도 vitest.config 없음)
- 셋업 파일: `src/test-setup.ts`

## 구현 패턴

### 컴포넌트

- **Named export** 사용. `export function ComponentName()` 형태.
- Props 타입은 컴포넌트 바로 위에 `interface {ComponentName}Props` 로 정의하고 구조분해로 받는다. `React.FC<>` 미사용.
- **역할에 따른 계층 분리**: 리프 컴포넌트(`NoteItem`)는 Context에 직접 접근하지 않고 모든 데이터를 props로 받는다. 목록/에디터 컴포넌트(`NoteList`, `NoteEditor`)는 `useNotes()`를 직접 호출한다.
- 레이아웃 전용 컴포넌트(`Layout`)는 `ReactNode`를 슬롯(`sidebar`, `main`)으로 받아 구조만 담당한다.

### 상태 관리

| 상태 종류                                          | 위치                     |
| -------------------------------------------------- | ------------------------ |
| 서버 데이터 (`notes[]`, `loading`, `error`)        | `NotesContext`           |
| 전역 UI 선택 상태 (`selectedNoteId`, `isCreating`) | `App.tsx` local state    |
| 폼 입력값 (`title`, `content`, `saving`)           | `NoteEditor` local state |

- 상태는 필요한 최소 범위에 둔다. Context는 서버 동기화 목적에만 사용.
- 낙관적 업데이트 없음. API 호출 성공 후 `setNotes`로 로컬 상태를 직접 갱신한다 (refetch 없음).

### API 호출

- 전용 라이브러리 없이 `fetch()` 직접 사용.
- 모든 API 함수는 `res.ok` 검사 후 실패 시 `new Error('...')` throw. 커스텀 에러 클래스 없음.
- `createdAt` / `updatedAt` 타임스탬프는 클라이언트 API 레이어에서 생성 (`new Date().toISOString()`). json-server가 생성하지 않음.
- API base URL은 모듈 상단 상수로 선언: `const API_URL = 'http://localhost:3001'`.
- **동사 통일**: API 레이어(`src/api/notes.ts`)와 Context 노출 함수 모두 `createNote` / `updateNote` / `deleteNote` CRUD 동사를 사용한다.

### 네이밍

- **파일**: 컴포넌트·Context는 PascalCase(`.tsx`), API·타입 모듈은 camelCase(`.ts`).
- **이벤트 핸들러 props**: `on` 접두사 (`onSelect`, `onDelete`, `onDone`, `onNewNote`).
- **로컬 핸들러 함수**: `handle` 접두사 (`handleSave`, `handleSelectNote`, `handleDone`).
- **불리언 state/props**: `is` 접두사 (`isCreating`, `isSelected`).
- **커스텀 hook**: `use` 접두사 (`useNotes`).

## 커밋 메시지 규칙

commitlint (`@commitlint/config-conventional`) + husky `commit-msg` hook으로 강제된다.

```
타입: 제목 (필수)

본문 첫 번째 줄 (필수)
본문 두 번째 줄 (필수, 최소 2줄)
```

| 타입       | 용도                                 |
| ---------- | ------------------------------------ |
| `feat`     | 새 기능                              |
| `fix`      | 버그 수정                            |
| `chore`    | 빌드·설정·패키지 변경                |
| `docs`     | 문서                                 |
| `refactor` | 동작 변경 없는 코드 정리             |
| `test`     | 테스트 추가·수정                     |
| `style`    | 포맷·세미콜론 등 코드 의미 없는 변경 |

## 일관성이 없는 패턴 (주의)

1. **`App.tsx`만 default export** — 나머지 모든 컴포넌트는 named export인데 `App`만 `export default App`. 새 컴포넌트는 named export로 작성할 것.

2. **`Layout.tsx`의 인라인 `style={{}}`** — `fontFamily`와 `height: 'calc(100vh - 65px)'` 두 곳이 Tailwind 대신 인라인 스타일로 작성되어 있다. 프로젝트 전반은 Tailwind 전용으로 의도되어 있으나 이 부분만 예외.

3. **`NoteEditor.tsx:27`의 `eslint-disable` 주석** — `useEffect` 의존성 배열에서 `selectedNote`를 의도적으로 제외하고 lint를 억제. 선택된 노트 객체가 바뀌어도 `selectedNoteId` 자체가 바뀌지 않으면 폼이 동기화되지 않는다는 점을 인지하고 건드릴 것.
