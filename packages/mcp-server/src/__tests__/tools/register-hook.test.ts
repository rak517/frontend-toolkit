import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  registerHookSchema,
  runRegisterHook,
} from "../../tools/hooks/register-hook.js";
import { mkdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("registerHookSchema", () => {
  it("should accept valid input", () => {
    const result = registerHookSchema.safeParse({
      hookName: "useCounter",
      hooksDir: "/Users/test/packages/hooks/src",
    });
    expect(result.success).toBe(true);
  });
});

describe("runRegisterHook", () => {
  const testDir = join(tmpdir(), "register-hook-test");

  beforeEach(() => {
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it("should add export line to index.ts", async () => {
    writeFileSync(
      join(testDir, "index.ts"),
      "export * from './useCalendar';\n"
    );
    mkdirSync(join(testDir, "useCounter"), { recursive: true });

    const result = await runRegisterHook({
      hookName: "useCounter",
      hooksDir: testDir,
    });

    const parsed = JSON.parse(result.content[0]!.text) as {
      registered: boolean;
      hookName: string;
    };
    expect(parsed.registered).toBe(true);

    const indexContent = readFileSync(join(testDir, "index.ts"), "utf-8");
    expect(indexContent).toContain("export * from './useCounter'");
  });

  it("should return INVALID_NAME for invalid hook name", async () => {
    const result = await runRegisterHook({
      hookName: "counter",
      hooksDir: testDir,
    });
    const parsed = JSON.parse(result.content[0]!.text) as { error: string };
    expect(parsed.error).toBe("INVALID_NAME");
  });

  it("should return INDEX_NOT_FOUND if index.ts missing", async () => {
    mkdirSync(join(testDir, "useCounter"), { recursive: true });

    const result = await runRegisterHook({
      hookName: "useCounter",
      hooksDir: testDir,
    });
    const parsed = JSON.parse(result.content[0]!.text) as { error: string };
    expect(parsed.error).toBe("INDEX_NOT_FOUND");
  });

  it("should return ALREADY_REGISTERED if already exported", async () => {
    writeFileSync(
      join(testDir, "index.ts"),
      "export * from './useCounter';\n"
    );
    mkdirSync(join(testDir, "useCounter"), { recursive: true });

    const result = await runRegisterHook({
      hookName: "useCounter",
      hooksDir: testDir,
    });
    const parsed = JSON.parse(result.content[0]!.text) as { error: string };
    expect(parsed.error).toBe("ALREADY_REGISTERED");
  });

  it("should return HOOK_NOT_FOUND if hook dir missing", async () => {
    writeFileSync(join(testDir, "index.ts"), "");

    const result = await runRegisterHook({
      hookName: "useCounter",
      hooksDir: testDir,
    });
    const parsed = JSON.parse(result.content[0]!.text) as { error: string };
    expect(parsed.error).toBe("HOOK_NOT_FOUND");
  });

  it("should not false-positive on similar hook names", async () => {
    // useCounterAnimation이 있을 때 useCounter를 등록할 수 있어야 함
    writeFileSync(
      join(testDir, "index.ts"),
      "export * from './useCounterAnimation';\n"
    );
    mkdirSync(join(testDir, "useCounter"), { recursive: true });

    const result = runRegisterHook({
      hookName: "useCounter",
      hooksDir: testDir,
    });
    const parsed = JSON.parse(result.content[0]!.text) as {
      registered?: boolean;
      error?: string;
    };
    expect(parsed.registered).toBe(true);
    expect(parsed.error).toBeUndefined();
  });
});
