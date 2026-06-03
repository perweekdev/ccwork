# Design Tokens

## Semantic Tokens

`src/index.css` `@theme` 블록에 정의된 실제 구현 토큰. **코드에서는 반드시 Tailwind utility class를 사용한다.**

| 의미             | CSS Variable               | HSL 값             | 근사 HEX  | Tailwind Class                                          |
| ---------------- | -------------------------- | ------------------ | --------- | ------------------------------------------------------- |
| 앱 배경          | `--color-background`       | `hsl(0 0% 94%)`    | `#F0F0F0` | `bg-background`                                         |
| 카드·패널 표면   | `--color-card`             | `hsl(0 0% 100%)`   | `#FFFFFF` | `bg-card`, `text-card`                                  |
| 주요 텍스트·강조 | `--color-foreground`       | `hsl(220 35% 14%)` | `#17233A` | `text-foreground`, `bg-foreground`, `border-foreground` |
| 미묘한 배경      | `--color-muted`            | `hsl(0 0% 90%)`    | `#E6E6E6` | `bg-muted`                                              |
| 보조 텍스트      | `--color-muted-foreground` | `hsl(0 0% 42%)`    | `#6B6B6B` | `text-muted-foreground`                                 |
| 구분선·테두리    | `--color-border`           | `hsl(0 0% 88%)`    | `#E0E0E0` | `border-border`, `bg-border`                            |
| 삭제·위험 액션   | `--color-destructive`      | `hsl(0 84% 60%)`   | `#F05C5C` | `bg-destructive`, `text-destructive`                    |

## Primary Palette (디자인 스펙 참고용)

Primary 톤은 `--color-foreground`(`#17233A`, primary-900)로 구현된다.

| 토큰            | HEX       | 상태                          |
| --------------- | --------- | ----------------------------- |
| `--primary-900` | `#17233A` | `--color-foreground`로 구현됨 |
| `--primary-800` | `#22304D` | 미사용                        |
| `--primary-700` | `#2C3E63` | 미사용                        |

## Accent

| 토큰              | HEX       | 상태                          |
| ----------------- | --------- | ----------------------------- |
| `--accent-orange` | `#FF7A59` | CSS 토큰 미정의 (현재 미사용) |

## Gray Scale (디자인 스펙 참고용)

| 토큰         | HEX       | 대응 Tailwind             |
| ------------ | --------- | ------------------------- |
| `--gray-50`  | `#FAFAFA` | —                         |
| `--gray-100` | `#F4F4F4` | —                         |
| `--gray-200` | `#EAEAEA` | ≈ `bg-muted`              |
| `--gray-300` | `#DCDCDC` | ≈ `border-border`         |
| `--gray-400` | `#B5B5B5` | —                         |
| `--gray-500` | `#8D8D8D` | —                         |
| `--gray-600` | `#666666` | ≈ `text-muted-foreground` |
| `--gray-700` | `#4A4A4A` | —                         |
| `--gray-800` | `#333333` | —                         |
| `--gray-900` | `#1E1E1E` | ≈ `text-foreground`       |

> 중간 그레이 단계가 필요하면 opacity modifier로 표현한다: `text-foreground/70`, `bg-muted/50`.

## 새 토큰 추가 방법

`src/index.css` `@theme` 블록에 추가하면 Tailwind utility가 자동 생성된다.

```css
@theme {
  --color-accent: hsl(16 100% 67%); /* #FF7A59 */
}
```

추가 후 `bg-accent`, `text-accent`로 사용 가능. 이 파일 Semantic Tokens 표에도 반영한다.  
(`/token-add` 스킬을 사용하면 코드·문서를 동시에 업데이트할 수 있다.)
