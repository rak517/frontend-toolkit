import { z } from "zod";
import { detectTestEnvironment } from "../../detector.js";
import type { McpToolResponse } from "../../types.js";

// Tool 입력 스키마
export const detectTestEnvironmentSchema = z.object({
  projectPath: z
    .string()
    .optional()
    .default(".")
    .describe("프로젝트 경로 (기본값: 현재 디렉토리)"),
});

export type DetectTestEnvironmentInput = z.infer<
  typeof detectTestEnvironmentSchema
>;

// Tool 실행 함수
export async function runDetectTestEnvironment(
  input: DetectTestEnvironmentInput
): Promise<McpToolResponse> {
  const { projectPath } = input;

  const result = await detectTestEnvironment(projectPath);

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
