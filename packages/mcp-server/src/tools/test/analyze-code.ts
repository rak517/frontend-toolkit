import { z } from "zod";
import { analyzeCode } from "../../analyzer.js";
import { absolutePathSchema } from "../../schemas.js";
import type { McpToolResponse } from "../../types.js";

export const analyzeCodeSchema = z.object({
  filePath: absolutePathSchema.describe("분석할 파일의 절대 경로"),
});

export type AnalyzeCodeInput = z.infer<typeof analyzeCodeSchema>;

export async function runAnalyzeCode(
  input: AnalyzeCodeInput
): Promise<McpToolResponse> {
  const { filePath } = input;

  const result = await analyzeCode(filePath);

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
