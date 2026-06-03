# 스타일 규칙

규칙 강도에 따라 두 단계로 분류한다.

| 강도     | 적용 방식                                                                 |
| -------- | ------------------------------------------------------------------------- |
| **강제** | CLAUDE.md 명시 + `PostToolUse` Hook 자동 검증 (`scripts/design-check.js`) |
| **권장** | CLAUDE.md 명시 (맥락 판단 필요, 기계 검증 불가)                           |

---

## 강제 규칙 (Hook 자동 검사)

파일 저장 시 `scripts/design-check.js`가 자동으로 검사한다.

### Don't

- **하드코딩 hex 색상 금지**: `#FFFFFF`, `#333` → 시맨틱 토큰 사용
- **`rgba()` 직접 사용 금지**: shadow 값 내부(`shadow-[...]`) 제외
- **인라인 `style={{}}` 신규 추가 금지**: `Layout.tsx` 기존 2곳 예외
- **Tailwind arbitrary 색상 금지**: `bg-[#fff]`, `text-[#333]`, `border-[rgb(...)]`
- **`text-black` 직접 사용 금지**: → `text-foreground` 사용
- **`text-white` 직접 사용 금지**: `bg-destructive` 컨텍스트만 예외 → 나머지는 `text-card`
- **`font-display` 남용 금지**: `<h1>` 태그 외 사용 금지

---

## 권장 규칙 (Claude 판단)

맥락 파악이 필요해 기계 검증이 어렵다. 작업 시 아래 규칙을 따른다.

### Do

- 선택/활성 상태: `bg-foreground text-card` 반전 패턴 + `transition-opacity`
- Destructive 계층: 카드 내 텍스트 링크 → `hover:text-destructive`, 모달 확인 버튼 → `bg-destructive text-white`
- 투명도 변형: `text-foreground/70`, `bg-muted/50`로 강도 조절
- 모든 인터랙티브 요소에 transition 적용 (`transition-colors` / `transition-opacity` / `transition-all`)
- 섹션 라벨: `text-xs font-semibold tracking-widest uppercase text-muted-foreground`

### Don't

- Shadow 임의 추가: 3단계 스케일만 사용 (`docs/design-system/components.md` 참조)
