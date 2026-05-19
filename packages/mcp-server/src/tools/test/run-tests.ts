import { z } from "zod";
import { absolutePathSchema } from "../../schemas.js";
import {
  findProjectRoot,
  detectFramework,
  formatResults,
} from "../../utils/index.js";
import type { McpToolResponse } from "../../types.js";
import { runVitest, runJest } from "../../runners/index.js";

export const runTestsSchema = z.object({
  testPath: absolutePathSchema.describe(
    "실행할 테스트 파일 또는 폴더의 절대 경로"
  ),
  projectPath: z
    .string()
    .optional()
    .describe("프로젝트 루트 경로 (미지정 시 자동 탐색)"),

  timeout: z
    .number()
    .optional()
    .default(30)
    .describe("테스트 실행 제한 시간 (초, 기본값: 30"),
});

export type RunTestsInput = z.infer<typeof runTestsSchema>;

export interface TestErrorInfo {
  message: string;
  expected?: string;
  actual?: string;
  stack?: string[];
}

export interface TestLocation {
  file: string;
  line?: number;
  column?: number;
}

export interface TestResult {
  name: string;
  status: "passed" | "failed" | "skipped";
  duration: number;
  error?: TestErrorInfo;
  location?: TestLocation;
  sourceContext?: string;
}

export interface RunTestsOutput {
  success: boolean;
  framework: "vitest" | "jest" | "unknown";
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
  results: TestResult[];
  error?: string;
  warning?: string;
}

export async function runTests(input: RunTestsInput): Promise<McpToolResponse> {
  const { testPath, projectPath, timeout = 30 } = input;

  const root = projectPath ?? findProjectRoot(testPath);
  if (!root) {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            success: false,
            error: "프로젝트 루트를 찾을 수 없습니다",
          }),
        },
      ],
    };
  }

  const framework = await detectFramework(root);
  if (framework === "unknown") {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            success: false,
            error: "테스트 프레임워크를 감지할 수 없습니다 (vitest/jest)",
          }),
        },
      ],
    };
  }

  let result: RunTestsOutput;

  if (framework === "vitest") {
    result = await runVitest(testPath, root, timeout);
  } else {
    result = await runJest(testPath, root, timeout);
  }

  result = formatResults(result);

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
