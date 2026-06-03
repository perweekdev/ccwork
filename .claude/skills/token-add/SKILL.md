---
name: token-add
description: 새 디자인 토큰을 src/index.css와 docs/design-system/tokens.md에 동시에 추가한다. 새 색상이나 디자인 값을 시스템에 등록할 때 사용한다.
argument-hint: <토큰이름> <값> [설명]
allowed-tools: Read Edit
---

`$ARGUMENTS`로 전달된 토큰을 코드와 문서에 동시에 추가한다.

## 인자 파싱

형식: `<토큰이름> <값> [설명]`

- `토큰이름`: kebab-case (예: `accent`, `success`, `warning`)
- `값`: CSS 색상 값 (예: `hsl(16 100% 67%)`, `#FF7A59`)
- `설명`: 선택사항. 없으면 토큰 이름에서 유추한다.

인자가 비어 있으면 이름·값·설명을 사용자에게 먼저 묻는다.

## 실행 순서

1. `src/index.css`를 읽어 `@theme` 블록 위치를 확인한다.
2. `docs/design-system/tokens.md`를 읽어 Semantic Tokens 표 위치를 확인한다.
3. `src/index.css` `@theme` 블록에 `--color-<토큰이름>: <값>;` 행을 추가한다.
4. `docs/design-system/tokens.md` Semantic Tokens 표에 새 행을 추가한다:
   - CSS Variable: `--color-<토큰이름>`
   - HSL 값 또는 입력된 값
   - 근사 HEX (hex 입력이면 그대로, hsl이면 변환)
   - Tailwind Class: `bg-<토큰이름>`, `text-<토큰이름>`
   - 의미: 전달된 설명 또는 이름에서 유추

## 완료 후

추가된 내용을 요약해서 보여준다:

- `src/index.css`에 추가된 CSS 변수
- 사용 가능한 Tailwind utility class 목록
- `docs/design-system/tokens.md` 업데이트 내용
