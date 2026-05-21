import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  scaffoldHookSchema,
  runScaffoldHook,
} from "../../tools/hooks/scaffold-hook.js";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("scaffoldHookSchema", () => {
  it("should accept valid input", () => {
    const result = scaffoldHookSchema.safeParse({
      hookName: "useCounter",
      hooksDir: "/Users/test/packages/hooks/src",
    });
    expect(result.success).toBe(true);
  });
});

describe("runScaffoldHook", () => {
  const testDir = join(tmpdir(), "scaffold-hook-test");

  beforeEach(() => {
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it("should create hook directory with files", async () => {
    const result = await runScaffoldHook({
      hookName: "useCounter",
      hooksDir: testDir,
    });

    const parsed = JSON.parse(result.content[0]!.text) as {
      created: { hookFile: string; testFile: string; indexFile: string };
    };

    expect(existsSync(parsed.created.hookFile)).toBe(true);
    expect(existsSync(parsed.created.testFile)).toBe(true);
    expect(existsSync(parsed.created.indexFile)).toBe(true);
  });

  it("should return INVALID_NAME for invalid hook name", async () => {
    const result = await runScaffoldHook({
      hookName: "counter",
      hooksDir: testDir,
    });
    const parsed = JSON.parse(result.content[0]!.text) as { error: string };
    expect(parsed.error).toBe("INVALID_NAME");
  });

  it("should return HOOK_EXISTS if hook already exists", async () => {
    mkdirSync(join(testDir, "useCounter"), { recursive: true });

    const result = await runScaffoldHook({
      hookName: "useCounter",
      hooksDir: testDir,
    });
    const parsed = JSON.parse(result.content[0]!.text) as { error: string };
    expect(parsed.error).toBe("HOOK_EXISTS");
  });
});
