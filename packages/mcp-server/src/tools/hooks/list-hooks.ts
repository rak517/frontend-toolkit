import { z } from "zod";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { absolutePathSchema } from "../../schemas.js";
import type { McpToolResponse } from "../../types.js";
import { errorResponse } from "../../utils/error-response.js";

export const listHooksSchema = z.object({
  hooksDir: absolutePathSchema.describe(
    "훅 패키지의 src 디렉토리 절대 경로 (예: /Users/.../packages/hooks/src)"
  ),
});

export type ListHooksInput = z.infer<typeof listHooksSchema>;

interface HookEntry {
  name: string;
  path: string;
  hasTests: boolean;
  hasReadme: boolean;
}

export function runListHooks(
  input: ListHooksInput
): McpToolResponse {
  const { hooksDir } = input;

  if (!existsSync(hooksDir)) {
    return errorResponse(
      "DIRECTORY_NOT_FOUND",
      `디렉토리를 찾을 수 없습니다: ${hooksDir}`
    );
  }

  const entries = readdirSync(hooksDir);
  const hooks: HookEntry[] = [];

  for (const entry of entries) {
    if (!entry.startsWith("use")) continue;

    const entryPath = join(hooksDir, entry);

    try {
      if (!statSync(entryPath).isDirectory()) continue;
    } catch {
      continue; // 삭제되었거나 접근 불가한 엔트리 무시
    }

    const files = readdirSync(entryPath);
    hooks.push({
      name: entry,
      path: entryPath,
      hasTests: files.some((f) => f.includes(".test.")),
      hasReadme: files.some((f) => f.toLowerCase() === "readme.md"),
    });
  }

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({ hooks, total: hooks.length }),
      },
    ],
  };
}
