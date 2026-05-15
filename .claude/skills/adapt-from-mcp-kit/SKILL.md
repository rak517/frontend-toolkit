---
name: adapt-from-mcp-kit
description: "frontend-mcp-kit의 코드를 frontend-toolkit MCP 서버로 복사하고 경로를 적응시키는 워크플로우. vitest runner, analyzer, 도구 파일, 유틸리티, 테스트 파일을 대상으로 한다. 'mcp-kit에서 가져와', '코드 이식', 'adapt', '복사해와', 'test-toolkit 통합' 요청 시 반드시 이 스킬을 사용."
---

# Adapt from MCP Kit

frontend-mcp-kit의 코드를 frontend-toolkit으로 이식하는 워크플로우.

## 전제 조건
- frontend-mcp-kit 소스 코드에 접근 가능해야 한다
- `packages/mcp-server/` 패키지가 존재해야 한다

## 복사 대상 매핑

| 원본 (frontend-mcp-kit) | 대상 (frontend-toolkit) |
|------------------------|----------------------|
| src/runners/vitest-runner.ts | packages/mcp-server/src/runners/vitest-runner.ts |
| src/runners/jest-runner.ts | packages/mcp-server/src/runners/jest-runner.ts |
| src/analyzer.ts | packages/mcp-server/src/analyzer.ts |
| src/component-analyzer.ts | packages/mcp-server/src/component-analyzer.ts |
| src/detector.ts | packages/mcp-server/src/detector.ts |
| src/tools/* (9개) | packages/mcp-server/src/tools/test/* |
| src/utils/* | packages/mcp-server/src/utils/* |
| src/__tests__/* | packages/mcp-server/src/__tests__/* |

## 경로 적응 규칙

### 1. import 경로 수정
```typescript
// 원본 (tools/ 하위에서)
import { findProjectRoot } from '../utils/find-project-root';
// 적응 후 (tools/test/ 하위에서)
import { findProjectRoot } from '../../utils/find-project-root';
```

### 2. 프로젝트 루트 감지 (find-project-root.ts)
pnpm-workspace.yaml 또는 turbo.json 기반으로 변경.

### 3. 테스트 파일 경로 패턴
src/**/*.test.ts → packages/*/src/**/*.test.{ts,tsx}

### 4. vitest runner cwd
모노레포 루트 (process.cwd()) — vitest.config.ts가 루트에만 존재

## 워크플로우
1. 원본 소스 확인 — 파일 구조와 의존 관계 분석
2. 파일 복사 — 복사 대상 매핑에 따라
3. 경로 적응 — 위 규칙 적용
4. 빌드 확인 — `npx tsc --noEmit -p packages/mcp-server/tsconfig.json`
5. 테스트 실행 — `npx vitest run packages/mcp-server/src/__tests__/`
