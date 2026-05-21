import { z } from "zod";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { absolutePathSchema } from "../../schemas.js";
import type { McpToolResponse } from "../../types.js";
import { errorResponse } from "../../utils/error-response.js";
import { isValidHookName } from "../../utils/validate-hook-name.js";

export const scaffoldHookSchema = z.object({
  hookName: z.string().describe("생성할 훅 이름 (예: useCounter)"),
  hooksDir: absolutePathSchema.describe(
    "훅 패키지의 src 디렉토리 절대 경로"
  ),
});

export type ScaffoldHookInput = z.infer<typeof scaffoldHookSchema>;

function generateHookSource(hookName: string): string {
  return `import { useState } from 'react';

export function ${hookName}() {
  // TODO: 구현
  return {};
}
`;
}

function generateTestSource(hookName: string): string {
  return `import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { ${hookName} } from './${hookName}';

describe('${hookName}', () => {
  it('should be defined', () => {
    const { result } = renderHook(() => ${hookName}());
    expect(result.current).toBeDefined();
  });
});
`;
}

function generateIndexSource(hookName: string): string {
  return `export { ${hookName} } from './${hookName}';\n`;
}

export function runScaffoldHook(
  input: ScaffoldHookInput
): McpToolResponse {
  const { hookName, hooksDir } = input;

  if (!isValidHookName(hookName)) {
    return errorResponse(
      "INVALID_NAME",
      "훅 이름은 use로 시작하고 영숫자만 포함해야 합니다"
    );
  }

  const hookDir = join(hooksDir, hookName);
  if (existsSync(hookDir)) {
    return errorResponse("HOOK_EXISTS", `이미 존재하는 훅입니다: ${hookName}`);
  }

  const hookFile = join(hookDir, `${hookName}.ts`);
  const testFile = join(hookDir, `${hookName}.test.ts`);
  const indexFile = join(hookDir, "index.ts");

  try {
    mkdirSync(hookDir, { recursive: true });
    writeFileSync(hookFile, generateHookSource(hookName));
    writeFileSync(testFile, generateTestSource(hookName));
    writeFileSync(indexFile, generateIndexSource(hookName));
  } catch (err) {
    // 부분 실패 시 생성된 디렉토리 정리
    try {
      rmSync(hookDir, { recursive: true, force: true });
    } catch {
      // cleanup 실패는 무시
    }
    const message = err instanceof Error ? err.message : String(err);
    return errorResponse(
      "WRITE_ERROR",
      `훅 파일 생성에 실패했습니다: ${message}`
    );
  }

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({
          created: { hookFile, testFile, indexFile },
          hookName,
        }),
      },
    ],
  };
}
