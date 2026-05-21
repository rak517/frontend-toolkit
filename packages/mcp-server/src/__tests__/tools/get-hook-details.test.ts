import { describe, it, expect } from "vitest";
import {
  getHookDetailsSchema,
  runGetHookDetails,
} from "../../tools/hooks/get-hook-details.js";
import { join } from "node:path";

describe("getHookDetailsSchema", () => {
  it("should accept valid input", () => {
    const result = getHookDetailsSchema.safeParse({
      hookName: "useCalendar",
      hooksDir: "/Users/test/packages/hooks/src",
    });
    expect(result.success).toBe(true);
  });

  it("should accept any string for hookName (validation in handler)", () => {
    const result = getHookDetailsSchema.safeParse({
      hookName: "calendar",
      hooksDir: "/Users/test/packages/hooks/src",
    });
    expect(result.success).toBe(true);
  });
});

describe("runGetHookDetails", () => {
  const hooksDir = join(process.cwd(), "packages/hooks/src");

  it("should return hook details for useCalendar", async () => {
    const result = await runGetHookDetails({
      hookName: "useCalendar",
      hooksDir,
    });

    const parsed = JSON.parse(result.content[0]!.text) as {
      name: string;
      exports: Array<{ name: string }>;
      dependencies: string[];
      reactHooks: string[];
    };

    expect(parsed.name).toBe("useCalendar");
    expect(parsed.exports.length).toBeGreaterThan(0);
    expect(parsed.dependencies).toContain("react");
  });

  it("should detect React hooks used inside", async () => {
    const result = await runGetHookDetails({
      hookName: "useCalendar",
      hooksDir,
    });

    const parsed = JSON.parse(result.content[0]!.text) as {
      reactHooks: string[];
    };

    expect(parsed.reactHooks).toContain("useState");
    expect(parsed.reactHooks).toContain("useMemo");
    expect(parsed.reactHooks).toContain("useCallback");
  });

  it("should return INVALID_NAME for invalid hook name", async () => {
    const result = await runGetHookDetails({
      hookName: "calendar",
      hooksDir,
    });
    const parsed = JSON.parse(result.content[0]!.text) as { error: string };
    expect(parsed.error).toBe("INVALID_NAME");
  });

  it("should return HOOK_NOT_FOUND for non-existent hook", async () => {
    const result = await runGetHookDetails({
      hookName: "useNonExistent",
      hooksDir,
    });
    const parsed = JSON.parse(result.content[0]!.text) as { error: string };
    expect(parsed.error).toBe("HOOK_NOT_FOUND");
  });
});
