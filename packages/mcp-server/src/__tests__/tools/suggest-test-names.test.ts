import { describe, it, expect } from "vitest";
import {
  suggestTestNamesSchema,
  runSuggestTestNames,
} from "../../tools/test/suggest-test-names.js";
import { join } from "node:path";

const fixturesPath = join(import.meta.dirname, "../fixtures");

describe("suggestTestNamesSchema", () => {
  it("should accept absolute path", () => {
    const result = suggestTestNamesSchema.safeParse({
      filePath: "/Users/test/file.ts",
    });
    expect(result.success).toBe(true);
  });

  it("should reject relative path", () => {
    const result = suggestTestNamesSchema.safeParse({
      filePath: "./src/file.ts",
    });
    expect(result.success).toBe(false);
  });
});

describe("runSuggestTestNames", () => {
  it("should return McpToolResponse format", async () => {
    const result = await runSuggestTestNames({
      filePath: join(process.cwd(), "packages/mcp-server/src/analyzer.ts"),
    });

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0]).toHaveProperty("type", "text");
  });

  it("should return array of test suggestions", async () => {
    const result = await runSuggestTestNames({
      filePath: join(process.cwd(), "packages/mcp-server/src/analyzer.ts"),
    });

    const parsed = JSON.parse(result.content[0]!.text);

    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThan(0);
  });

  it("should include describe and tests for each suggestion", async () => {
    const result = await runSuggestTestNames({
      filePath: join(process.cwd(), "packages/mcp-server/src/analyzer.ts"),
    });

    const parsed = JSON.parse(result.content[0]!.text);

    for (const suggestion of parsed) {
      expect(suggestion).toHaveProperty("describe");
      expect(suggestion).toHaveProperty("tests");
      expect(Array.isArray(suggestion.tests)).toBe(true);
    }
  });

  it("should generate component tests for tsx files", async () => {
    const result = await runSuggestTestNames({
      filePath: join(fixturesPath, "SampleButton.tsx"),
    });

    const parsed = JSON.parse(result.content[0]!.text);

    const componentSuggestion = parsed.find(
      (s: { describe: string }) => s.describe === "SampleButton"
    );

    expect(componentSuggestion).toBeDefined();
    expect(componentSuggestion.tests).toContain("should render correctly");
  });

  it("should generate function tests for ts files", async () => {
    const result = await runSuggestTestNames({
      filePath: join(process.cwd(), "packages/mcp-server/src/analyzer.ts"),
    });

    const parsed = JSON.parse(result.content[0]!.text);

    const functionSuggestion = parsed.find(
      (s: { describe: string }) => s.describe === "analyzeCode"
    );

    expect(functionSuggestion).toBeDefined();
    expect(functionSuggestion.tests).toContain("should return expected result");
  });

  it("should not duplicate describe names", async () => {
    const result = await runSuggestTestNames({
      filePath: join(fixturesPath, "SampleButton.tsx"),
    });

    const parsed = JSON.parse(result.content[0]!.text);
    const describeNames = parsed.map((s: { describe: string }) => s.describe);
    const uniqueNames = [...new Set(describeNames)];

    expect(describeNames.length).toBe(uniqueNames.length);
  });

  it("should throw error for non-existent file", async () => {
    await expect(
      runSuggestTestNames({ filePath: "/nonexistent/file.ts" })
    ).rejects.toThrow();
  });
});
