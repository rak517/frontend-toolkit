import { describe, it, expect } from "vitest";
import {
  findSimilarTestsSchema,
  runFindSimilarTests,
} from "../../tools/test/find-similar-tests.js";
import { join } from "node:path";

describe("findSimilarTestsSchema", () => {
  it("should accept absolute path with default maxResults", () => {
    const result = findSimilarTestsSchema.safeParse({
      filePath: "/Users/test/file.ts",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.maxResults).toBe(5);
    }
  });

  it("should accept custom maxResults", () => {
    const result = findSimilarTestsSchema.safeParse({
      filePath: "/Users/test/file.ts",
      maxResults: 10,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.maxResults).toBe(10);
    }
  });

  it("should reject relative path", () => {
    const result = findSimilarTestsSchema.safeParse({
      filePath: "./src/file.ts",
    });
    expect(result.success).toBe(false);
  });
});

describe("runFindSimilarTests", () => {
  it("should return McpToolResponse format", async () => {
    const result = await runFindSimilarTests({
      filePath: join(process.cwd(), "packages/mcp-server/src/analyzer.ts"),
      maxResults: 5,
    });

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0]).toHaveProperty("type", "text");
  });

  it("should return similar tests structure", async () => {
    const result = await runFindSimilarTests({
      filePath: join(process.cwd(), "packages/mcp-server/src/analyzer.ts"),
      maxResults: 5,
    });

    const parsed = JSON.parse(result.content[0]!.text);

    expect(parsed).toHaveProperty("sourceFile");
    expect(parsed).toHaveProperty("similarTests");
    expect(parsed).toHaveProperty("totalFound");
    expect(Array.isArray(parsed.similarTests)).toBe(true);
  });

  it("should respect maxResults limit", async () => {
    const result = await runFindSimilarTests({
      filePath: join(process.cwd(), "packages/mcp-server/src/analyzer.ts"),
      maxResults: 2,
    });

    const parsed = JSON.parse(result.content[0]!.text);

    expect(parsed.similarTests.length).toBeLessThanOrEqual(2);
  });

  it("should find similar tests with low similarity for different folder", async () => {
    const result = await runFindSimilarTests({
      filePath: join(process.cwd(), "packages/mcp-server/src/analyzer.ts"),
      maxResults: 10,
    });

    const parsed = JSON.parse(result.content[0]!.text);

    // __tests__/core/ 폴더의 테스트는 다른 폴더이므로 low similarity로 포함
    const analyzerTest = parsed.similarTests.find((t: { filePath: string }) =>
      t.filePath.includes("analyzer.test.ts")
    );

    // 포함되어 있으면 similarity가 low
    if (analyzerTest) {
      expect(analyzerTest.similarity).toBe("low");
    }
  });
});
