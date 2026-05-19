import { describe, it, expect } from "vitest";
import {
  detectTestEnvironmentSchema,
  runDetectTestEnvironment,
} from "../../tools/test/detect-test-environment.js";

describe("detectTestEnvironmentSchema", () => {
  it("should accept empty object (uses default)", () => {
    const result = detectTestEnvironmentSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.projectPath).toBe(".");
    }
  });

  it("should accept custom projectPath", () => {
    const result = detectTestEnvironmentSchema.safeParse({
      projectPath: "/custom/path",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.projectPath).toBe("/custom/path");
    }
  });
});

describe("runDetectTestEnvironment", () => {
  it("should return McpToolResponse format", async () => {
    const result = await runDetectTestEnvironment({ projectPath: "." });

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0]).toHaveProperty("type", "text");
  });

  it("should return test environment info in JSON", async () => {
    const result = await runDetectTestEnvironment({ projectPath: "." });

    const parsed = JSON.parse(result.content[0]!.text);

    expect(parsed).toHaveProperty("framework");
    expect(parsed).toHaveProperty("hasTestingLibrary");
    expect(parsed).toHaveProperty("testFilePattern");
    expect(parsed).toHaveProperty("configFile");
  });

  it("should detect vitest for current project", async () => {
    const result = await runDetectTestEnvironment({ projectPath: "." });

    const parsed = JSON.parse(result.content[0]!.text);

    expect(parsed.framework).toBe("vitest");
  });

  it("should return unknown for invalid path", async () => {
    const result = await runDetectTestEnvironment({
      projectPath: "/nonexistent/path",
    });

    const parsed = JSON.parse(result.content[0]!.text);

    expect(parsed.framework).toBe("unknown");
  });
});
