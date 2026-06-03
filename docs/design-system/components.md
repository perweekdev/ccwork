# Component Patterns

## Shape Tokens

### Border Radius

| Tailwind Class | 값     | 사용처                              |
| -------------- | ------ | ----------------------------------- |
| `rounded-xl`   | `12px` | 버튼, 입력 필드, ConfirmDialog 버튼 |
| `rounded-2xl`  | `16px` | NoteItem 카드, ConfirmDialog 모달   |
| `rounded-3xl`  | `24px` | NoteEditor 패널                     |

### Shadow Scale

3단계 계층. **새 shadow를 임의로 추가하지 않는다.**

| 단계          | 값                                     | 사용처             |
| ------------- | -------------------------------------- | ------------------ |
| 1 — subtle    | `shadow-[0_1px_4px_rgba(0,0,0,0.06)]`  | Layout 헤더        |
| 2 — card      | `shadow-[0_2px_8px_rgba(0,0,0,0.07)]`  | NoteItem hover     |
| 3 — elevated  | `shadow-[0_2px_12px_rgba(0,0,0,0.07)]` | NoteEditor 패널    |
| 3+ — selected | `shadow-[0_2px_12px_rgba(0,0,0,0.12)]` | NoteItem 선택 상태 |
| modal         | `shadow-lg`                            | ConfirmDialog 모달 |

---

## 컴포넌트별 클래스 패턴

### Layout

```
전체 배경:  min-h-screen bg-background
헤더:       bg-card border-b border-border px-6 py-4 + shadow-1
사이드바:   w-72 bg-muted/50 border-r border-border p-3 space-y-2
메인:       flex-1 overflow-y-auto p-8
```

### NoteItem

```
컨테이너:   bg-card rounded-2xl p-4 border transition-all
  기본:     border-border
  hover:    hover:shadow-2 (shadow-[0_2px_8px_rgba(0,0,0,0.07)])
  선택됨:   border-foreground shadow-selected (shadow-[0_2px_12px_rgba(0,0,0,0.12)])

제목:       text-sm font-semibold text-foreground line-clamp-1
내용:       text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed
날짜:       text-[10px] text-muted-foreground/70 mt-2
삭제버튼:  text-muted-foreground hover:text-destructive text-xs transition-colors
```

### NoteEditor

```
컨테이너:   bg-card rounded-3xl px-8 sm:px-12 py-8 shadow-3 border border-border max-w-2xl
섹션 라벨:  text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-6
제목 input: text-xl font-bold text-foreground bg-transparent border-none outline-none
구분선:     h-px bg-border
본문 textarea: text-base text-foreground/70 bg-transparent border-none outline-none resize-none leading-relaxed
```

### ConfirmDialog

```
오버레이:   fixed inset-0 z-50 flex items-center justify-center bg-black/40
모달:       bg-card border border-border rounded-2xl p-6 w-80 shadow-lg
```

---

## 버튼 변형

| 변형        | Class 패턴                                                                                                    | 사용처            |
| ----------- | ------------------------------------------------------------------------------------------------------------- | ----------------- |
| Primary     | `bg-foreground text-card rounded-xl px-5 py-2 text-sm font-semibold hover:opacity-75 transition-opacity`      | 저장, + 새 노트   |
| Secondary   | `bg-muted text-muted-foreground rounded-xl px-5 py-2 text-sm font-semibold hover:bg-border transition-colors` | 취소              |
| Destructive | `bg-destructive text-white rounded-lg px-4 py-1.5 text-sm hover:opacity-90 transition-opacity`                | 삭제 확인 모달    |
| Ghost text  | `text-muted-foreground hover:text-destructive text-xs transition-colors`                                      | 카드 내 삭제 링크 |

---

## 빈 상태 (Empty State)

```
컨테이너:  flex items-center justify-center h-full
내부:      text-center space-y-3
텍스트:    text-muted-foreground text-sm
```
