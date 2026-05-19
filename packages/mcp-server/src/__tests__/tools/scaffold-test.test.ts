import { describe, it, expect } from "vitest";
import {
  scaffoldTestSchema,
  runScaffoldTest,
} from "../../tools/test/scaffold-test.js";
import { join } from "node:path";

describe("scaffoldTestSchema", () => {
  it("should accept absolute path with default framework", () => {
    const result = scaffoldTestSchema.safeParse({
      filePath: "/Users/test/file.ts",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.framework).toBe("auto");
    }
  });

  it("should accept vitest framework", () => {
    const result = scaffoldTestSchema.safeParse({
      filePath: "/Users/test/file.ts",
      framework: "vitest",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.framework).toBe("vitest");
    }
  });

  it("should accept jest framework", () => {
    const result = scaffoldTestSchema.safeParse({
      filePath: "/Users/test/file.ts",
      framework: "jest",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid framework", () => {
    const result = scaffoldTestSchema.safeParse({
      filePath: "/Users/test/file.ts",
      framework: "mocha",
    });
    expect(result.success).toBe(false);
  });

  it("should reject relative path", () => {
    const result = scaffoldTestSchema.safeParse({
      filePath: "./src/file.ts",
    });
    expect(result.success).toBe(false);
  });
});

describe("runScaffoldTest", () => {
  it("should return McpToolResponse format", async () => {
    const result = await runScaffoldTest({
      filePath: join(process.cwd(), "packages/mcp-server/src/analyzer.ts"),
      framework: "auto",
    });

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0]).toHaveProperty("type", "text");
  });

  it("should return scaffold info in JSON", async () => {
    const result = await runScaffoldTest({
      filePath: join(process.cwd(), "packages/mcp-server/src/analyzer.ts"),
      framework: "auto",
    });

    const parsed = JSON.parse(result.content[0]!.text);

    expect(parsed).toHaveProperty("testFilePath");
    expect(parsed).toHaveProperty("framework");
    expect(parsed).toHaveProperty("sourceFile");
  });

  it("should auto-detect vitest framework", async () => {
    const result = await runScaffoldTest({
      filePath: join(process.cwd(), "packages/mcp-server/src/analyzer.ts"),
      framework: "auto",
    });

    const parsed = JSON.parse(result.content[0]!.text);

    expect(parsed.framework).toBe("vitest");
  });

  it("should use specified framework when provided", async () => {
    const result = await runScaffoldTest({
      filePath: join(process.cwd(), "packages/mcp-server/src/analyzer.ts"),
      framework: "jest",
    });

    const parsed = JSON.parse(result.content[0]!.text);

    expect(parsed.framework).toBe("jest");
  });

  it("should include source file analysis", async () => {
    const result = await runScaffoldTest({
      filePath: join(process.cwd(), "packages/mcp-server/src/analyzer.ts"),
      framework: "auto",
    });

    const parsed = JSON.parse(result.content[0]!.text);

    expect(parsed.sourceFile).toHaveProperty("fileName");
    expect(parsed.sourceFile).toHaveProperty("exports");
    expect(parsed.sourceFile).toHaveProperty("dependencies");
  });

  it("should throw error for non-existent file", async () => {
    await expect(
      runScaffoldTest({
        filePath: "/nonexistent/file.ts",
        framework: "auto",
      })
    ).rejects.toThrow();
  });
});
