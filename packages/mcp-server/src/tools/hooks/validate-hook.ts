import { z } from "zod";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { absolutePathSchema } from "../../schemas.js";
import type { McpToolResponse } from "../../types.js";
import { errorResponse } from "../../utils/error-response.js";
import { isValidHookName } from "../../utils/validate-hook-name.js";
import { findProjectRoot } from "../../utils/find-project-root.js";
import { runVitest } from "../../runners/vitest-runner.js";

export const validateHookSchema = z.object({
  hookName: z.string().describe("검증할 훅 이름 (예: useCalendar)"),
  hooksDir: absolutePathSchema.describe(
    "훅 패키지의 src 디렉토리 절대 경로"
  ),
  timeout: z
    .number()
    .optional()
    .default(30)
    .describe("테스트 실행 제한 시간 (초, 기본값: 30)"),
});

export type ValidateHookInput = z.infer<typeof validateHookSchema>;

export async function runValidateHook(
  input: ValidateHookInput
): Promise<McpToolResponse> {
  const { hookName, hooksDir, timeout = 30 } = input;

  if (!isValidHookName(hookName)) {
    return errorResponse(
      "INVALID_NAME",
      "훅 이름은 use로 시작하고 영숫자만 포함해야 합니다"
    );
  }

  const hookDir = join(hooksDir, hookName);
  if (!existsSync(hookDir)) {
    return errorResponse(
      "HOOK_NOT_FOUND",
      `훅을 찾을 수 없습니다: ${hookName}`
    );
  }

  const files = readdirSync(hookDir);
  const testFile = files.find((f) => f.includes(".test."));
  if (!testFile) {
    return errorResponse(
      "HOOK_NOT_FOUND",
      `테스트 파일을 찾을 수 없습니다: ${hookName}`
    );
  }

  const testPath = join(hookDir, testFile);
  const projectRoot = findProjectRoot(hooksDir);
  if (!projectRoot) {
    return errorResponse(
      "VITEST_NOT_FOUND",
      "프로젝트 루트를 찾을 수 없습니다"
    );
  }

  const result = await runVitest(testPath, projectRoot, timeout);

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({
          hookName,
          success: result.success,
          framework: result.framework,
          summary: result.summary,
          results: result.results,
          error: result.error,
        }),
      },
    ],
  };
}
