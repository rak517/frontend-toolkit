import { describe, it, expect } from "vitest";
import {
  listHooksSchema,
  runListHooks,
} from "../../tools/hooks/list-hooks.js";
import { join } from "node:path";

describe("listHooksSchema", () => {
  it("should accept valid absolute path", () => {
    const result = listHooksSchema.safeParse({
      hooksDir: "/Users/test/packages/hooks/src",
    });
    expect(result.success).toBe(true);
  });

  it("should reject relative path", () => {
    const result = listHooksSchema.safeParse({
      hooksDir: "./packages/hooks/src",
    });
    expect(result.success).toBe(false);
  });
});

describe("runListHooks", () => {
  it("should return McpToolResponse with hooks list", async () => {
    const hooksDir = join(process.cwd(), "packages/hooks/src");
    const result = await runListHooks({ hooksDir });

    expect(result.content).toHaveLength(1);
    expect(result.content[0]!.type).toBe("text");

    const parsed = JSON.parse(result.content[0]!.text) as {
      hooks: Array<{
        name: string;
        path: string;
        hasTests: boolean;
        hasReadme: boolean;
      }>;
      total: number;
    };
    expect(parsed.hooks.length).toBeGreaterThanOrEqual(6);

    const names = parsed.hooks.map((h) => h.name);
    expect(names).toContain("useCalendar");
    expect(names).toContain("useDebounce");
  });

  it("should detect test files", async () => {
    const hooksDir = join(process.cwd(), "packages/hooks/src");
    const result = await runListHooks({ hooksDir });
    const parsed = JSON.parse(result.content[0]!.text) as {
      hooks: Array<{ name: string; hasTests: boolean }>;
    };

    const useCalendar = parsed.hooks.find((h) => h.name === "useCalendar");
    expect(useCalendar?.hasTests).toBe(true);
  });

  it("should return error for non-existent directory", async () => {
    const result = await runListHooks({ hooksDir: "/nonexistent/hooks" });
    const parsed = JSON.parse(result.content[0]!.text) as { error: string };
    expect(parsed.error).toBe("DIRECTORY_NOT_FOUND");
  });
});
