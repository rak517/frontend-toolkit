import { describe, it, expect } from "vitest";
import { analyzeCodeSchema, runAnalyzeCode } from "../../tools/test/analyze-code.js";
import { join } from "node:path";

describe("analyzeCodeSchema", () => {
  it("should accept absolute path", () => {
    const result = analyzeCodeSchema.safeParse({
      filePath: "/Users/test/file.ts",
    });
    expect(result.success).toBe(true);
  });

  it("should reject relative path", () => {
    const result = analyzeCodeSchema.safeParse({
      filePath: "./src/file.ts",
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing filePath", () => {
    const result = analyzeCodeSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("runAnalyzeCode", () => {
  it("should return McpToolResponse format", async () => {
    const result = await runAnalyzeCode({
      filePath: join(process.cwd(), "packages/mcp-server/src/analyzer.ts"),
    });

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0]).toHaveProperty("type", "text");
    expect(result.content[0]).toHaveProperty("text");
  });

  it("should return valid JSON in text content", async () => {
    const result = await runAnalyzeCode({
      filePath: join(process.cwd(), "packages/mcp-server/src/analyzer.ts"),
    });

    const parsed = JSON.parse(result.content[0]!.text);

    expect(parsed).toHaveProperty("fileName");
    expect(parsed).toHaveProperty("fileExtension");
    expect(parsed).toHaveProperty("exports");
    expect(parsed).toHaveProperty("dependencies");
  });

  it("should throw error for non-existent file", async () => {
    await expect(
      runAnalyzeCode({ filePath: "/nonexistent/file.ts" })
    ).rejects.toThrow();
  });
});
