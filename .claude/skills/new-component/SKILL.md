---
name: new-component
description: 디자인 시스템 패턴을 적용한 새 React 컴포넌트를 스캐폴딩한다. 새 컴포넌트를 만들기 전에 사용한다.
argument-hint: <컴포넌트명> [leaf|container|layout]
allowed-tools: Read Write Glob Bash
---

`$ARGUMENTS`로 전달된 이름의 컴포넌트를 생성한다.

## 인자 파싱

- 첫 번째 단어: 컴포넌트 이름 (PascalCase)
- 두 번째 단어(선택): 컴포넌트 역할
  - `leaf` — 리프 컴포넌트 (props만 받고 Context 미사용)
  - `container` — 컨테이너 컴포넌트 (`useNotes()` 사용)
  - `layout` — 레이아웃 전용 (ReactNode 슬롯 방식)
  - 생략 시 용도를 사용자에게 묻는다.

## 실행 순서

1. `docs/design-system/tokens.md`와 `docs/design-system/components.md`를 읽어 토큰과 패턴을 파악한다.
2. `src/components/` 아래 기존 컴포넌트 파일을 1~2개 읽어 코드 스타일을 확인한다.
3. 역할에 따라 아래 템플릿을 기반으로 `src/components/<ComponentName>.tsx`를 생성한다.

## 역할별 템플릿 규칙

**leaf**

- props만 받고 Context 미사용
- 모든 데이터는 props로 전달
- `NoteItem.tsx`를 참고 스타일로 사용

**container**

- `useNotes()` 직접 호출
- `NoteList.tsx` 또는 `NoteEditor.tsx`를 참고 스타일로 사용

**layout**

- `ReactNode`를 슬롯으로 받아 구조만 담당
- `Layout.tsx`를 참고 스타일로 사용

## 공통 코드 규칙

- Named export: `export function ComponentName()`
- Props 타입: 컴포넌트 바로 위에 `interface ComponentNameProps` 정의
- `React.FC<>` 미사용
- 색상·여백은 `docs/design-system/tokens.md` 시맨틱 토큰만 사용
- 인라인 `style={{}}` 추가 금지
- 이벤트 핸들러 props: `on` 접두사, 로컬 핸들러: `handle` 접두사
- 불리언 state/props: `is` 접두사

## 파일 생성 후

1. 아래 명령을 실행해 강제 규칙 위반 여부를 검사한다:
   ```
   node scripts/design-check.js src/components/<ComponentName>.tsx
   ```
2. 위반이 있으면 즉시 수정하고 재검사한다. 위반이 없을 때 완료로 간주한다.
3. 생성된 파일 경로를 사용자에게 알려준다.
