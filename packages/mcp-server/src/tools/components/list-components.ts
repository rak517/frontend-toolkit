import { z } from "zod";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { absolutePathSchema } from "../../schemas.js";
import type { McpToolResponse } from "../../types.js";
import { errorResponse } from "../../utils/error-response.js";

export const listComponentsSchema = z.object({
  componentsDir: absolutePathSchema.describe(
    "컴포넌트 패키지의 src 디렉토리 절대 경로 (예: /Users/.../packages/components/src)"
  ),
});

export type ListComponentsInput = z.infer<typeof listComponentsSchema>;

interface ComponentEntry {
  name: string;
  path: string;
  hasTests: boolean;
  hasReadme: boolean;
}

export function runListComponents(
  input: ListComponentsInput
): McpToolResponse {
  const { componentsDir } = input;

  if (!existsSync(componentsDir)) {
    return errorResponse(
      "DIRECTORY_NOT_FOUND",
      `디렉토리를 찾을 수 없습니다: ${componentsDir}`
    );
  }

  const entries = readdirSync(componentsDir);
  const components: ComponentEntry[] = [];

  for (const entry of entries) {
    if (!/^[A-Z]/.test(entry)) continue;

    const entryPath = join(componentsDir, entry);

    try {
      if (!statSync(entryPath).isDirectory()) continue;
    } catch {
      continue; // 삭제되었거나 접근 불가한 엔트리 무시
    }

    const files = readdirSync(entryPath);
    components.push({
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
        text: JSON.stringify({ components, total: components.length }),
      },
    ],
  };
}
