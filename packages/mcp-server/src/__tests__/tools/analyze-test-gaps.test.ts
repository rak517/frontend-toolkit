import { describe, it, expect } from "vitest";
import {
  analyzeTestGapsSchema,
  runAnalyzeTestGaps,
} from "../../tools/test/analyze-test-gaps.js";
import { join } from "node:path";

describe("analyzeTestGapsSchema", () => {
  it("should accept absolute path", () => {
    const result = analyzeTestGapsSchema.safeParse({
      filePath: "/Users/test/file.ts",
    });
    expect(result.success).toBe(true);
  });

  it("should reject relative path", () => {
    const result = analyzeTestGapsSchema.safeParse({
      filePath: "./src/file.ts",
    });
    expect(result.success).toBe(false);
  });
});

describe("runAnalyzeTestGaps", () => {
  it("should return McpToolResponse format", async () => {
    const result = await runAnalyzeTestGaps({
      filePath: join(process.cwd(), "packages/mcp-server/src/analyzer.ts"),
    });

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0]).toHaveProperty("type", "text");
  });

  it("should return gap analysis in JSON", async () => {
    const result = await runAnalyzeTestGaps({
      filePath: join(process.cwd(), "packages/mcp-server/src/analyzer.ts"),
    });

    const parsed = JSON.parse(result.content[0]!.text);

    expect(parsed).toHaveProperty("sourceFile");
    expect(parsed).toHaveProperty("testFile");
    expect(parsed).toHaveProperty("tested");
    expect(parsed).toHaveProperty("untested");
  });

  it("should return null when test file not in standard location", async () => {
    // 테스트 파일이 __tests__/core/에 있어 표준 위치가 아님
    const result = await runAnalyzeTestGaps({
      filePath: join(process.cwd(), "packages/mcp-server/src/analyzer.ts"),
    });

    const parsed = JSON.parse(result.content[0]!.text);

    // findTestFile은 같은 폴더 또는 직접 하위 __tests__ 폴더만 검색
    // src/__tests__/core/는 찾지 못함
    expect(parsed.testFile).toBeNull();
  });

  it("should mark all exports as untested when no test file found", async () => {
    const result = await runAnalyzeTestGaps({
      filePath: join(process.cwd(), "packages/mcp-server/src/analyzer.ts"),
    });

    const parsed = JSON.parse(result.content[0]!.text);

    // 테스트 파일을 못 찾으면 모든 export가 untested
    expect(parsed.untested).toContain("analyzeCode");
    expect(parsed.tested).toHaveLength(0);
  });

  it("should return null testFile for untested module", async () => {
    const result = await runAnalyzeTestGaps({
      filePath: join(process.cwd(), "packages/mcp-server/src/types.ts"),
    });

    const parsed = JSON.parse(result.content[0]!.text);

    expect(parsed.testFile).toBeNull();
  });

  it("should throw error for non-existent file", async () => {
    await expect(
      runAnalyzeTestGaps({ filePath: "/nonexistent/file.ts" })
    ).rejects.toThrow();
  });
});
