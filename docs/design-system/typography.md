# Typography

## Font Family

| 역할                   | 폰트                | CSS Variable     | Tailwind Class       | 로딩 방식                 |
| ---------------------- | ------------------- | ---------------- | -------------------- | ------------------------- |
| 본문 (기본)            | Pretendard Variable | `--font-sans`    | `font-sans` (기본값) | `index.html` CDN          |
| 디스플레이 (로고 전용) | Boogaloo            | `--font-display` | `font-display`       | `index.html` Google Fonts |

> `font-display`는 Layout.tsx 헤더 로고(`<h1>`)에만 사용. 다른 요소에 적용 금지.

## Type Scale

컴포넌트에서 실제 사용 중인 텍스트 단계:

| 역할           | Tailwind Class                                    | 사용 컴포넌트            |
| -------------- | ------------------------------------------------- | ------------------------ |
| 헤더 로고      | `text-2xl font-bold font-display`                 | `Layout` `<h1>`          |
| 노트 제목 입력 | `text-xl font-bold`                               | `NoteEditor` 제목 input  |
| 노트 카드 제목 | `text-sm font-semibold`                           | `NoteItem` `<h3>`        |
| 섹션 라벨      | `text-xs font-semibold tracking-widest uppercase` | `NoteEditor`·`NoteList`  |
| 본문 텍스트    | `text-base leading-relaxed`                       | `NoteEditor` textarea    |
| 미리보기·보조  | `text-xs leading-relaxed`                         | `NoteItem` 내용 미리보기 |
| 날짜·메타      | `text-[10px]`                                     | `NoteItem` 날짜          |

## 텍스트 오버플로 처리

| 상황               | Class                                  |
| ------------------ | -------------------------------------- |
| 한 줄 말줄임       | `line-clamp-1`                         |
| 두 줄 말줄임       | `line-clamp-2`                         |
| placeholder 스타일 | `placeholder:text-muted-foreground/50` |
