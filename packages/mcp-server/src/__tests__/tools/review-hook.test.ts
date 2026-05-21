import { describe, it, expect } from "vitest";
import {
  reviewHookSchema,
  runReviewHook,
} from "../../tools/hooks/review-hook.js";
import { join } from "node:path";

describe("reviewHookSchema", () => {
  it("should accept valid input", () => {
    const result = reviewHookSchema.safeParse({
      hookName: "useCalendar",
      hooksDir: "/Users/test/packages/hooks/src",
    });
    expect(result.success).toBe(true);
  });
});

describe("runReviewHook", () => {
  const hooksDir = join(process.cwd(), "packages/hooks/src");

  it("should review an existing hook and return findings", async () => {
    const result = await runReviewHook({
      hookName: "useCalendar",
      hooksDir,
    });

    const parsed = JSON.parse(result.content[0]!.text) as {
      hookName: string;
      findings: Array<{ rule: string; severity: string; message: string }>;
      summary: { errors: number; warnings: number; suggestions: number };
    };

    expect(parsed.hookName).toBe("useCalendar");
    expect(Array.isArray(parsed.findings)).toBe(true);
    expect(parsed.summary).toHaveProperty("errors");
    expect(parsed.summary).toHaveProperty("warnings");
    expect(parsed.summary).toHaveProperty("suggestions");
  });

  it("should return INVALID_NAME for invalid hook name", async () => {
    const result = await runReviewHook({
      hookName: "calendar",
      hooksDir,
    });
    const parsed = JSON.parse(result.content[0]!.text) as { error: string };
    expect(parsed.error).toBe("INVALID_NAME");
  });

  it("should return HOOK_NOT_FOUND for non-existent hook", async () => {
    const result = await runReviewHook({
      hookName: "useNonExistent",
      hooksDir,
    });
    const parsed = JSON.parse(result.content[0]!.text) as { error: string };
    expect(parsed.error).toBe("HOOK_NOT_FOUND");
  });

  it("should not report memoization error for useCalendar", async () => {
    const result = await runReviewHook({
      hookName: "useCalendar",
      hooksDir,
    });
    const parsed = JSON.parse(result.content[0]!.text) as {
      findings: Array<{ rule: string; severity: string }>;
    };

    const memoErrors = parsed.findings.filter(
      (f) => f.rule === "memoization" && f.severity === "error"
    );
    expect(memoErrors).toHaveLength(0);
  });
});
