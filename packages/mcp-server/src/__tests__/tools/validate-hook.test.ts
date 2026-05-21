import { describe, it, expect } from "vitest";
import {
  validateHookSchema,
  runValidateHook,
} from "../../tools/hooks/validate-hook.js";
import { join } from "node:path";

describe("validateHookSchema", () => {
  it("should accept valid input", () => {
    const result = validateHookSchema.safeParse({
      hookName: "useCalendar",
      hooksDir: "/Users/test/packages/hooks/src",
    });
    expect(result.success).toBe(true);
  });

  it("should accept optional timeout", () => {
    const result = validateHookSchema.safeParse({
      hookName: "useCalendar",
      hooksDir: "/Users/test/packages/hooks/src",
      timeout: 60,
    });
    expect(result.success).toBe(true);
  });
});

describe("runValidateHook", () => {
  it("should return INVALID_NAME for invalid hook name", async () => {
    const result = await runValidateHook({
      hookName: "calendar",
      hooksDir: "/some/path",
    });
    const parsed = JSON.parse(result.content[0]!.text) as { error: string };
    expect(parsed.error).toBe("INVALID_NAME");
  });

  it("should return HOOK_NOT_FOUND for non-existent hook", async () => {
    const hooksDir = join(process.cwd(), "packages/hooks/src");
    const result = await runValidateHook({
      hookName: "useNonExistent",
      hooksDir,
    });
    const parsed = JSON.parse(result.content[0]!.text) as { error: string };
    expect(parsed.error).toBe("HOOK_NOT_FOUND");
  });

  it("should run tests for existing hook with test file", async () => {
    const hooksDir = join(process.cwd(), "packages/hooks/src");
    const result = await runValidateHook({
      hookName: "useCalendar",
      hooksDir,
    });

    const parsed = JSON.parse(result.content[0]!.text) as {
      success: boolean;
      hookName: string;
      summary: { total: number; passed: number };
    };

    expect(parsed.hookName).toBe("useCalendar");
    expect(parsed.success).toBe(true);
    expect(parsed.summary.total).toBeGreaterThan(0);
  }, 30_000);
});
