import { z } from "zod";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { absolutePathSchema } from "../../schemas.js";
import type { McpToolResponse } from "../../types.js";
import { errorResponse } from "../../utils/error-response.js";
import { isValidHookName } from "../../utils/validate-hook-name.js";
import { analyzeCode } from "../../analyzer.js";

export const getHookDetailsSchema = z.object({
  hookName: z.string().describe("훅 이름 (예: useCalendar)"),
  hooksDir: absolutePathSchema.describe(
    "훅 패키지의 src 디렉토리 절대 경로"
  ),
});

export type GetHookDetailsInput = z.infer<typeof getHookDetailsSchema>;

function extractReactHooks(source: string): string[] {
  const hookCalls = new Set<string>();
  const regex = /\b(use[A-Z]\w*)\s*\(/g;
  let match;
  while ((match = regex.exec(source)) !== null) {
    if (match[1]) hookCalls.add(match[1]);
  }
  return [...hookCalls];
}

export async function runGetHookDetails(
  input: GetHookDetailsInput
): Promise<McpToolResponse> {
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

  const candidates = [`${hookName}.ts`, `${hookName}.tsx`, "index.ts"];
  let mainFile: string | null = null;

  for (const candidate of candidates) {
    const candidatePath = join(hookDir, candidate);
    if (existsSync(candidatePath)) {
      mainFile = candidatePath;
      break;
    }
  }

  if (!mainFile) {
    return errorResponse(
      "HOOK_NOT_FOUND",
      `훅 소스 파일을 찾을 수 없습니다: ${hookName}`
    );
  }

  try {
    const analysis = await analyzeCode(mainFile);
    const source = await readFile(mainFile, "utf-8");
    const reactHooks = extractReactHooks(source);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            name: hookName,
            mainFile,
            exports: analysis.exports,
            dependencies: analysis.dependencies,
            reactHooks,
          }),
        },
      ],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return errorResponse(
      "PARSE_ERROR",
      `훅 소스를 분석할 수 없습니다: ${message}`
    );
  }
}
