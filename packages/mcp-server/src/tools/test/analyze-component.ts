import { z } from "zod";
import { analyzeComponent } from "../../component-analyzer.js";
import { absolutePathSchema } from "../../schemas.js";
import type { McpToolResponse } from "../../types.js";

export const analyzeComponentSchema = z.object({
  filePath: absolutePathSchema.describe(
    "분석할 React 컴포넌트 파일의 절대 경로"
  ),
});

export type AnalyzeComponentInput = z.infer<typeof analyzeComponentSchema>;

export async function runAnalyzeComponent(
  input: AnalyzeComponentInput
): Promise<McpToolResponse> {
  const { filePath } = input;

  const result = await analyzeComponent(filePath);

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
