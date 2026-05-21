import { z } from "zod";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { absolutePathSchema } from "../../schemas.js";
import type { McpToolResponse } from "../../types.js";
import { errorResponse } from "../../utils/error-response.js";
import { isValidHookName } from "../../utils/validate-hook-name.js";

export const registerHookSchema = z.object({
  hookName: z.string().describe("등록할 훅 이름 (예: useCounter)"),
  hooksDir: absolutePathSchema.describe(
    "훅 패키지의 src 디렉토리 절대 경로"
  ),
});

export type RegisterHookInput = z.infer<typeof registerHookSchema>;

export function runRegisterHook(
  input: RegisterHookInput
): McpToolResponse {
  const { hookName, hooksDir } = input;

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

  const indexPath = join(hooksDir, "index.ts");
  if (!existsSync(indexPath)) {
    return errorResponse(
      "INDEX_NOT_FOUND",
      `barrel export 파일을 찾을 수 없습니다: ${indexPath}`
    );
  }

  const content = readFileSync(indexPath, "utf-8");
  const exportLine = `export * from './${hookName}';`;

  // 정확한 export 라인 또는 훅 이름이 단어 경계로 존재하는지 확인
  const hookPattern = new RegExp(`['"]\\./` + hookName + `['"]`);
  if (hookPattern.test(content)) {
    return errorResponse(
      "ALREADY_REGISTERED",
      `이미 등록된 훅입니다: ${hookName}`
    );
  }

  const newContent = content.endsWith("\n")
    ? content + exportLine + "\n"
    : content + "\n" + exportLine + "\n";

  writeFileSync(indexPath, newContent);

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({
          registered: true,
          hookName,
          indexPath,
          exportLine,
        }),
      },
    ],
  };
}
