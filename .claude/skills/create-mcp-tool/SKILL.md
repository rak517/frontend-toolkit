---
name: create-mcp-tool
description: "새 MCP 도구를 scaffold하고 구현하는 워크플로우. 도메인 디렉토리 생성, Zod 스키마 정의, 핸들러 구현, 서버 등록, 테스트 파일 생성까지 수행한다. 'MCP 도구 만들어', '새 도구 추가', 'scaffold tool', 'MCP tool 구현' 요청 시 반드시 이 스킬을 사용."
---

# Create MCP Tool

새 MCP 도구를 처음부터 끝까지 생성하는 워크플로우.

## 전제 조건
- `packages/mcp-server/` 패키지가 존재해야 한다
- `@modelcontextprotocol/sdk`와 `zod`가 설치되어 있어야 한다

## 워크플로우

### Step 1: 도구 정보 확인
사용자로부터 다음을 확인한다:
- **도구 이름** (snake_case, 예: `list_hooks`)
- **도메인** (hooks, components, test 중 택 1)
- **도구 설명** (한 줄)
- **파라미터** (이름, 타입, 필수 여부)
- **반환값 구조**

### Step 2: 도구 파일 scaffold
파일 위치: `packages/mcp-server/src/tools/{domain}/{tool-name}.ts`

```typescript
import { z } from 'zod';
import type { McpToolResponse } from '../../types.js';
import { errorResponse } from '../../utils/error-response.js';

export const {ToolName}Schema = z.object({
  // 파라미터 정의
});

export async function run{ToolName}(
  args: z.infer<typeof {ToolName}Schema>
): Promise<McpToolResponse> {
  // 구현
}
```

### Step 3: 서버에 도구 등록
`packages/mcp-server/src/index.ts`에 도구를 등록한다:

```typescript
import {
  {ToolName}Schema,
  run{ToolName},
} from "./tools/{domain}/{tool-name}.js";

server.registerTool(
  "{tool_name}",
  {
    description: "{도구 설명}",
    inputSchema: {ToolName}Schema,
  },
  run{ToolName}
);
```

### Step 4: 테스트 파일 scaffold
파일 위치: `packages/mcp-server/src/__tests__/tools/{domain}/{tool-name}.test.ts`

테스트 케이스: 정상 동작 + 각 에러 코드별 + 경계값

### Step 5: 구현 + 테스트 실행
1. 핸들러 로직 구현
2. `npx vitest run packages/mcp-server/src/__tests__/tools/{domain}/{tool-name}` 실행
3. 실패 시 수정 후 재실행

### Step 6: 리뷰
- [ ] 도메인 디렉토리에 파일 위치
- [ ] Zod 스키마로 입력 검증
- [ ] 에러 코드 반환 패턴 준수
- [ ] 서버 엔트리포인트에 등록 완료
- [ ] 테스트 통과

## 에러 코드 체계
| 에러 코드 | 조건 | 메시지 |
|----------|------|--------|
| INVALID_NAME | 훅 이름이 use로 시작하지 않거나 특수문자 포함 | "훅 이름은 use로 시작하고 영숫자만 포함해야 합니다" |
| HOOK_NOT_FOUND | 지정된 훅 디렉토리 미존재 | "훅을 찾을 수 없습니다: {name}" |
| HOOK_EXISTS | scaffold 시 동일 이름 훅 존재 | "이미 존재하는 훅입니다: {name}" |
| WRITE_PERMISSION | 파일 쓰기 권한 없음 | "파일 쓰기 권한이 없습니다: {path}" |
| ALREADY_REGISTERED | barrel export에 이미 등록 | "이미 등록된 훅입니다: {name}" |
| VITEST_NOT_FOUND | vitest 미설치 | "vitest가 설치되지 않았습니다. pnpm install을 실행하세요" |
| INDEX_NOT_FOUND | barrel export 파일 미존재 | "barrel export 파일을 찾을 수 없습니다: {path}" |
| TIMEOUT | validate 시 30초 초과 | "테스트 실행 타임아웃 (30초)" |
