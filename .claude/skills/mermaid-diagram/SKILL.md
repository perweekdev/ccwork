---
name: mermaid-diagram
description: src/를 분석해 컴포넌트 의존성·상태 흐름·CRUD 시퀀스·레이어 구조 4개의 Mermaid 다이어그램이 담긴 docs/architecture/index.html을 생성(또는 갱신)한다. 프로젝트 아키텍처를 시각화하거나 업데이트하고 싶을 때 사용한다.
disable-model-invocation: true
allowed-tools: Read Write Glob Bash
---

`src/`를 분석하고 `docs/architecture/index.html`을 재생성한다.

## 분석 대상 파일

- `src/types/*.ts` — 데이터 모델
- `src/api/*.ts` — API 함수와 HTTP 메서드
- `src/context/*.tsx` — Context 구조, 상태, 노출 함수
- `src/components/*.tsx` — props 인터페이스, useContext 호출, 컴포넌트 관계
- `src/App.tsx` — 최상위 상태와 컴포넌트 조합

## 생성할 다이어그램 4개

1. **graph TD — 컴포넌트 의존성**
   - 실선 화살표: props / 렌더 관계
   - 점선 화살표: 커스텀 훅을 통한 Context 구독
   - 레이어별 색상: UI(초록), State/Context(보라), API(노랑), Backend(빨강)
   - 각 노드에 보유 상태 표시

2. **stateDiagram-v2 — UI 상태 흐름**
   - 로컬 상태 변수에서 파생된 상태 (예: `isCreating`, `selectedNoteId`)
   - 전환을 유발하는 사용자 동작을 전환 레이블로 표시

3. **sequenceDiagram — CRUD 데이터 흐름**
   - 생성·수정·삭제 시나리오를 엔드투엔드로 표시
   - 참여자: 사용자 → 컴포넌트 → Context → API 레이어 → json-server

4. **graph LR — 레이어 구조**
   - 5개 레인: UI / State / API / Types / Backend
   - 각 레이어가 의존하는 레이어 표시

## 출력 형식

- Mermaid CDN v10 외 외부 리소스 없는 단일 HTML 파일
- 다이어그램 하나당 카드 하나의 섹션 레이아웃
- 화살표 의미가 여럿인 경우 범례 포함
- `docs/architecture/index.html`이 이미 있으면 덮어쓴다
- 모든 UI 텍스트(제목, 설명, 범례)는 한국어로 작성한다

## 파일 작성 후

기본 브라우저로 결과 파일을 바로 연다:

- Windows: `start "" "docs/architecture/index.html"`
- macOS: `open docs/architecture/index.html`
- Linux: `xdg-open docs/architecture/index.html`
