---
name: test-mcp-tool
description: "MCP 도구의 단위/통합 테스트를 작성하고 실행하는 워크플로우. vitest 4.x 기반, 정상/에러 케이스 커버리지, 파이프라인 통합 테스트를 수행한다. 'MCP 테스트', '도구 테스트', 'test tool', '테스트 작성', '테스트 실행' 요청 시 반드시 이 스킬을 사용."
---

# Test MCP Tool

MCP 도구의 테스트를 작성하고 실행하는 워크플로우.

## 테스트 파일 위치
- 단위 테스트: `packages/mcp-server/src/__tests__/tools/{domain}/{tool-name}.test.ts`
- 통합 테스트: `packages/mcp-server/src/__tests__/integration/{pipeline-name}.test.ts`

## 단위 테스트 템플릿

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

describe('{tool_name}', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should {expected behavior}', async () => {
    // 정상 케이스
  });

  it('should return {ERROR_CODE} for {condition}', async () => {
    // 에러 케이스 — 각 에러 코드별
  });
});
```

## 통합 테스트: scaffold → validate → register 파이프라인

임시 모노레포 구조를 생성하여 파이프라인 전체를 테스트.

## 실행 방법
```bash
npx vitest run packages/mcp-server/src/__tests__/tools/{domain}/{tool-name}
npx vitest run packages/mcp-server/src/__tests__/integration/
npx vitest run packages/mcp-server/ --coverage
```

## 테스트 작성 원칙
- 파일 시스템 테스트: 반드시 tmp 디렉토리 사용, afterEach에서 정리
- 프로세스 실행 테스트: 30초 타임아웃 설정
- 모든 에러 코드에 대한 테스트 케이스 필수
- 경계값: 빈 문자열, 특수문자, 매우 긴 이름
