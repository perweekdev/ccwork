#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

// 강제 규칙만 검사 (정규식으로 탐지 가능한 것)
const RULES = [
  {
    name: '하드코딩 hex 색상',
    pattern: /#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/,
    fix: '시맨틱 Tailwind 토큰 사용 (bg-card, text-foreground 등)',
    except: () => false,
  },
  {
    name: 'rgba() 직접 사용',
    pattern: /rgba?\s*\(/,
    fix: '시맨틱 토큰 + opacity modifier 사용 (text-foreground/70 등)',
    except: (line) => /shadow-\[/.test(line),
  },
  {
    name: '인라인 style={{}} 추가',
    pattern: /style=\{\{/,
    fix: 'Tailwind class 사용 (Layout.tsx 기존 2곳 예외)',
    except: (_line, filePath) => path.basename(filePath) === 'Layout.tsx',
  },
  {
    name: 'Tailwind arbitrary 색상',
    pattern: /(?:bg|text|border|ring)-\[[^\]]*(?:#[0-9a-fA-F]|rgb|hsl)/,
    fix: '시맨틱 토큰 사용 (bg-background, text-foreground 등)',
    except: () => false,
  },
  {
    name: 'text-black 직접 사용',
    pattern: /\btext-black\b/,
    fix: 'text-foreground 사용',
    except: () => false,
  },
  {
    name: 'text-white 직접 사용',
    pattern: /\btext-white\b/,
    fix: 'text-card 사용 (bg-destructive 컨텍스트만 예외)',
    except: (line) => /destructive/.test(line),
  },
  {
    name: 'font-display를 h1 외 사용',
    pattern: /\bfont-display\b/,
    fix: 'font-display(Boogaloo)는 헤더 h1 로고에만 사용',
    except: (line) => /<h1[\s>]/.test(line) || /fontFamily/.test(line),
  },
];

const COMPONENT_PATTERN = /src[/\\]components[/\\].+\.tsx$/;

function checkFile(filePath) {
  const normalized = filePath.replace(/\\/g, '/');

  if (!COMPONENT_PATTERN.test(normalized)) {
    process.exit(0);
  }

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch {
    process.exit(0);
  }

  const lines = content.split('\n');
  const violations = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const rule of RULES) {
      if (rule.pattern.test(line) && !rule.except(line, filePath)) {
        violations.push({
          lineNum: i + 1,
          rule: rule.name,
          fix: rule.fix,
          content: line.trim(),
        });
      }
    }
  }

  if (violations.length === 0) {
    console.log(`[design-check] ${normalized} — 위반 없음 ✓`);
    process.exit(0);
  }

  const summary = violations.map((v) => `✗ L${v.lineNum}:${v.rule}`).join(' | ');
  process.stderr.write(`[design-check] ${violations.length}건 위반 — ${summary}\n`);
  process.exit(1);
}

// 듀얼 모드: CLI 인자(Skill) 또는 stdin JSON(Hook)
fs.appendFileSync('design-check.log', `[${new Date().toISOString()}] hook triggered\n`);
const cliArg = process.argv[2];

if (cliArg) {
  checkFile(cliArg);
} else {
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => { raw += chunk; });
  process.stdin.on('end', () => {
    try {
      const input = JSON.parse(raw);
      const filePath = input.tool_input?.file_path;
      if (filePath) {
        checkFile(filePath);
      } else {
        process.exit(0);
      }
    } catch {
      process.exit(0);
    }
  });
}
