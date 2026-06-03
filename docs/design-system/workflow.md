# 디자인 작업 요청 흐름

Claude Code로 디자인 작업 시 시나리오별 사용 방법.

---

## 새 컴포넌트 만들 때

```
/new-component TagBadge leaf
```

1. Claude가 `tokens.md`, `components.md` 읽고 컴포넌트 생성
2. 생성 후 `scripts/design-check.js` 자동 실행
3. 위반 있으면 즉시 수정 후 재검사까지 완료

추가 요구사항은 이후 자연어로 요청하면 된다.

```
"호버 시 색상 바뀌도록 해줘"
```

저장 시 Hook이 자동으로 재검증한다.

---

## 기존 컴포넌트 수정할 때

스킬 호출 없이 자연어로 요청한다.

```
"NoteItem에 태그 목록 추가해줘"
```

- Claude가 CLAUDE.md에 @import된 `rules.md`를 참고해 작업
- 파일 저장 시 `PostToolUse` Hook이 자동으로 `design-check.js` 실행
- 위반이 감지되면 Claude 컨텍스트에 결과가 유입되고 수정 제안

---

## 새 색상·토큰 필요할 때

```
/token-add accent hsl(16 100% 67%) 강조 색상
```

- `src/index.css` `@theme` 블록과 `docs/design-system/tokens.md`를 동시에 업데이트
- 이후 `bg-accent`, `text-accent` 등 Tailwind utility로 즉시 사용 가능

---

## 규칙 위반 직접 확인할 때

```
/design-check src/components/NoteItem.tsx
```

- 강제 규칙 7개를 즉시 점검하고 위반 항목·수정 방법을 보고
- IDE에서 직접 파일을 수정했을 때 Hook이 발동하지 않으므로 이 방법으로 수동 검증

---

## 한눈에 보기

| 작업               | 방법                           | 검증              |
| ------------------ | ------------------------------ | ----------------- |
| 새 컴포넌트 생성   | `/new-component <이름> <역할>` | 스킬 내 자동 실행 |
| 기존 컴포넌트 수정 | 자연어 요청                    | Hook 자동 검증    |
| 새 토큰 추가       | `/token-add <이름> <값>`       | —                 |
| 수동 점검          | `/design-check <파일>`         | —                 |

> Hook은 **Claude가 파일을 편집할 때**만 자동 발동한다.  
> IDE에서 직접 수정한 파일은 `/design-check`로 수동 검증이 필요하다.
