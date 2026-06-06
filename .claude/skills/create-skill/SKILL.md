---
name: create-skill
description: 새로운 Claude Code 스킬(커스텀 슬래시 커맨드)을 생성한다. 반복되는 작업 흐름, 체크리스트, 지시문을 재사용 가능한 /커맨드로 저장하고 싶을 때 사용한다.
argument-hint: [스킬-이름]
disable-model-invocation: true
allowed-tools: Read Write Bash
---

**$ARGUMENTS** 라는 이름의 프로젝트 레벨 스킬을 생성한다.

## 실행 순서

1. 현재 대화 컨텍스트에서 스킬의 목적을 파악한다.
   - `$ARGUMENTS`가 비어 있으면 스킬 이름과 목적을 사용자에게 먼저 묻는다.

2. 스킬 디렉토리를 생성한다:

   ```
   .claude/skills/$ARGUMENTS/
   ```

3. `.claude/skills/$ARGUMENTS/SKILL.md`를 아래 구조에 따라 작성한다.

## 작성할 SKILL.md 구조

```
---
name: <스킬-이름>
description: <한 문장 — 스킬이 하는 일과 Claude가 자동으로 실행해야 하는 상황>
argument-hint: [선택적-인자]        # 인자가 없으면 생략
disable-model-invocation: true       # 배포·커밋 등 사이드이펙트가 있을 때만 추가
allowed-tools: <공백으로 구분>       # 사전 승인 도구가 없으면 생략
---

<스킬 지시문>
```

## 스킬 본문 작성 규칙

- 모든 내용은 **한국어**로 작성한다.
- 무엇을 할지만 적는다. 방법이나 이유는 적지 않는다.
- 사용자 입력이 들어갈 자리에는 `$ARGUMENTS`를 사용한다.
- 실시간 컨텍스트가 필요하면 `` !`<shell 명령>` `` 으로 주입한다 (예: git diff, 파일 내용).
- 본문은 300줄 이내로 유지한다. 대용량 참고 자료는 같은 디렉토리 내 별도 파일로 분리한다.
- 스킬 포맷 자체에 대한 설명 주석은 넣지 않는다.

## 파일 작성 후

- 생성된 파일 경로와 사용 가능한 슬래시 커맨드를 사용자에게 보여준다.
- 새로 만든 스킬을 자동으로 실행하지 않는다.
