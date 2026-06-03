---
name: design-check
description: 컴포넌트 파일이 디자인 시스템 강제 규칙을 위반하는지 점검한다. 스타일 작업 완료 후, 또는 기존 컴포넌트가 규칙을 준수하는지 확인하고 싶을 때 사용한다.
argument-hint: <파일경로>
allowed-tools: Bash
---

`$ARGUMENTS`에 해당하는 파일을 `scripts/design-check.js`로 검사한다.

## 실행 순서

1. `$ARGUMENTS`가 비어 있으면 검사할 파일 경로를 사용자에게 묻는다.
2. 아래 명령을 실행한다:
   ```
   node scripts/design-check.js $ARGUMENTS
   ```
3. 출력 결과를 사용자에게 보고한다.
4. 위반이 있으면 각 항목에 대해 수정 방법을 제안한다.
5. 수정 후 재검사가 필요하면 같은 명령을 다시 실행한다.

## 참고

검사 항목은 `docs/design-system/rules.md`의 **강제 규칙**만 해당한다.  
권장 규칙(shadow 스케일, transition 누락 등)은 CLAUDE.md를 참고해 판단한다.
