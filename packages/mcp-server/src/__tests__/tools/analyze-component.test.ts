import { describe, it, expect } from "vitest";
import {
  analyzeComponentSchema,
  runAnalyzeComponent,
} from "../../tools/test/analyze-component.js";
import { join } from "node:path";

const fixturesPath = join(import.meta.dirname, "../fixtures");

describe("analyzeComponentSchema", () => {
  it("should accept absolute path", () => {
    const result = analyzeComponentSchema.safeParse({
      filePath: "/Users/test/Button.tsx",
    });
    expect(result.success).toBe(true);
  });

  it("should reject relative path", () => {
    const result = analyzeComponentSchema.safeParse({
      filePath: "./components/Button.tsx",
    });
    expect(result.success).toBe(false);
  });
});

describe("runAnalyzeComponent", () => {
  it("should return McpToolResponse format", async () => {
    const result = await runAnalyzeComponent({
      filePath: join(fixturesPath, "SampleButton.tsx"),
    });

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0]).toHaveProperty("type", "text");
  });

  it("should return component analysis in JSON", async () => {
    const result = await runAnalyzeComponent({
      filePath: join(fixturesPath, "SampleButton.tsx"),
    });

    const parsed = JSON.parse(result.content[0]!.text);

    expect(parsed).toHaveProperty("componentName");
    expect(parsed).toHaveProperty("props");
    expect(parsed).toHaveProperty("hooks");
    expect(parsed).toHaveProperty("events");
  });

  it("should throw error for non-existent file", async () => {
    await expect(
      runAnalyzeComponent({ filePath: "/nonexistent/Component.tsx" })
    ).rejects.toThrow();
  });
});
