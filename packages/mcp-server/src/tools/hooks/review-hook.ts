import { z } from "zod";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { absolutePathSchema } from "../../schemas.js";
import type { McpToolResponse } from "../../types.js";
import { errorResponse } from "../../utils/error-response.js";
import { isValidHookName } from "../../utils/validate-hook-name.js";

export const reviewHookSchema = z.object({
  hookName: z.string().describe("리뷰할 훅 이름 (예: useCalendar)"),
  hooksDir: absolutePathSchema.describe(
    "훅 패키지의 src 디렉토리 절대 경로"
  ),
});

export type ReviewHookInput = z.infer<typeof reviewHookSchema>;

interface Finding {
  rule: string;
  severity: "error" | "warning" | "suggestion";
  message: string;
  line?: number;
}

function reviewNaming(source: string): Finding[] {
  const findings: Finding[] = [];
  const funcRegex = /export\s+function\s+(\w+)/g;
  let match;
  while ((match = funcRegex.exec(source)) !== null) {
    if (match[1] && !match[1].startsWith("use")) {
      findings.push({
        rule: "naming",
        severity: "error",
        message: `export 함수 "${match[1]}"이 use로 시작하지 않습니다`,
      });
    }
  }
  return findings;
}

function reviewDepsArray(source: string): Finding[] {
  const findings: Finding[] = [];
  const lines = source.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    if (/use(Effect|LayoutEffect)\s*\(/.test(line)) {
      const nearby = lines.slice(i, Math.min(i + 10, lines.length)).join("\n");
      if (/,\s*\[\s*\]\s*\)/.test(nearby)) {
        findings.push({
          rule: "deps-array",
          severity: "warning",
          message: `${String(i + 1)}번째 줄 근처: 빈 의존성 배열 []이 감지되었습니다. 마운트 시 1회 실행 의도가 맞는지 확인하세요.`,
          line: i + 1,
        });
      }
    }
  }

  return findings;
}

function reviewMemoization(source: string): Finding[] {
  const findings: Finding[] = [];

  const hasUseMemo = /\buseMemo\b/.test(source);
  const hasUseCallback = /\buseCallback\b/.test(source);

  if (/return\s*\{/.test(source) && !hasUseMemo && !hasUseCallback) {
    findings.push({
      rule: "memoization",
      severity: "suggestion",
      message:
        "반환 객체가 useMemo로 감싸져 있지 않습니다. 리렌더링 최적화를 고려하세요.",
    });
  }

  return findings;
}

function reviewConditionalHooks(source: string): Finding[] {
  const findings: Finding[] = [];
  const lines = source.split("\n");

  let depth = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const trimmed = line.trim();

    if (/^(if|for|while)\s*\(/.test(trimmed)) {
      depth++;
    }

    if (depth > 0 && /\buse[A-Z]\w*\s*\(/.test(trimmed)) {
      findings.push({
        rule: "conditional-hook",
        severity: "error",
        message: `${String(i + 1)}번째 줄: 조건문 내부에서 훅을 호출하고 있습니다. React 훅 규칙 위반입니다.`,
        line: i + 1,
      });
    }

    const opens = (trimmed.match(/{/g) ?? []).length;
    const closes = (trimmed.match(/}/g) ?? []).length;
    if (closes > opens && depth > 0) {
      depth = Math.max(0, depth - (closes - opens));
    }
  }

  return findings;
}

export async function runReviewHook(
  input: ReviewHookInput
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
    const source = await readFile(mainFile, "utf-8");

    const findings: Finding[] = [
      ...reviewNaming(source),
      ...reviewDepsArray(source),
      ...reviewMemoization(source),
      ...reviewConditionalHooks(source),
    ];

    const summary = {
      errors: findings.filter((f) => f.severity === "error").length,
      warnings: findings.filter((f) => f.severity === "warning").length,
      suggestions: findings.filter((f) => f.severity === "suggestion").length,
    };

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({ hookName, mainFile, findings, summary }),
        },
      ],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return errorResponse(
      "PARSE_ERROR",
      `훅 소스를 읽을 수 없습니다: ${message}`
    );
  }
}
