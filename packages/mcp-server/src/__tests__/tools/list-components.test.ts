import { describe, it, expect } from "vitest";
import {
  listComponentsSchema,
  runListComponents,
} from "../../tools/components/list-components.js";
import { join } from "node:path";

describe("listComponentsSchema", () => {
  it("should accept valid absolute path", () => {
    const result = listComponentsSchema.safeParse({
      componentsDir: "/Users/test/packages/components/src",
    });
    expect(result.success).toBe(true);
  });

  it("should reject relative path", () => {
    const result = listComponentsSchema.safeParse({
      componentsDir: "./packages/components/src",
    });
    expect(result.success).toBe(false);
  });
});

describe("runListComponents", () => {
  it("should return McpToolResponse with components list", async () => {
    const componentsDir = join(process.cwd(), "packages/components/src");
    const result = await runListComponents({ componentsDir });

    expect(result.content).toHaveLength(1);
    expect(result.content[0]!.type).toBe("text");

    const parsed = JSON.parse(result.content[0]!.text) as {
      components: Array<{
        name: string;
        path: string;
        hasTests: boolean;
        hasReadme: boolean;
      }>;
      total: number;
    };
    expect(parsed.components.length).toBeGreaterThanOrEqual(2);

    const names = parsed.components.map((c) => c.name);
    expect(names).toContain("InViewTrigger");
    expect(names).toContain("SuspenseBoundary");
  });

  it("should detect test files", async () => {
    const componentsDir = join(process.cwd(), "packages/components/src");
    const result = await runListComponents({ componentsDir });
    const parsed = JSON.parse(result.content[0]!.text) as {
      components: Array<{ name: string; hasTests: boolean }>;
    };

    const inViewTrigger = parsed.components.find(
      (c) => c.name === "InViewTrigger"
    );
    expect(inViewTrigger?.hasTests).toBe(true);
  });

  it("should return error for non-existent directory", async () => {
    const result = await runListComponents({
      componentsDir: "/nonexistent/components",
    });
    const parsed = JSON.parse(result.content[0]!.text) as { error: string };
    expect(parsed.error).toBe("DIRECTORY_NOT_FOUND");
  });
});
