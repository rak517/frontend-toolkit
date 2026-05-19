import { describe, it, expect } from "vitest";
import {
  suggestA11yTestsSchema,
  runSuggestA11yTests,
} from "../../tools/test/suggest-a11y-tests.js";
import { join } from "node:path";

const fixturesPath = join(import.meta.dirname, "../fixtures");

describe("suggestA11yTestsSchema", () => {
  it("should accept absolute path", () => {
    const result = suggestA11yTestsSchema.safeParse({
      filePath: "/Users/test/Button.tsx",
    });
    expect(result.success).toBe(true);
  });

  it("should reject relative path", () => {
    const result = suggestA11yTestsSchema.safeParse({
      filePath: "./components/Button.tsx",
    });
    expect(result.success).toBe(false);
  });
});

describe("runSuggestA11yTests", () => {
  it("should return McpToolResponse format", async () => {
    const result = await runSuggestA11yTests({
      filePath: join(fixturesPath, "SampleButton.tsx"),
    });

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0]).toHaveProperty("type", "text");
  });

  it("should return a11y analysis in JSON", async () => {
    const result = await runSuggestA11yTests({
      filePath: join(fixturesPath, "SampleButton.tsx"),
    });

    const parsed = JSON.parse(result.content[0]!.text);

    expect(parsed).toHaveProperty("hasIssues");
    expect(parsed).toHaveProperty("suggestions");
    expect(parsed).toHaveProperty("jestAxeExample");
  });

  it("should include jest-axe example code", async () => {
    const result = await runSuggestA11yTests({
      filePath: join(fixturesPath, "SampleButton.tsx"),
    });

    const parsed = JSON.parse(result.content[0]!.text);

    expect(parsed.jestAxeExample).toContain("jest-axe");
    expect(parsed.jestAxeExample).toContain("toHaveNoViolations");
  });

  it("should detect click without keyboard handler", async () => {
    const result = await runSuggestA11yTests({
      filePath: join(fixturesPath, "SampleButton.tsx"),
    });

    const parsed = JSON.parse(result.content[0]!.text);

    // SampleButton has onClick without onKeyDown on button
    const hasKeyboardSuggestion = parsed.suggestions.some(
      (s: { type: string }) => s.type === "keyboard"
    );
    expect(hasKeyboardSuggestion).toBe(true);
  });

  it("should return error response for non-existent file", async () => {
    const result = await runSuggestA11yTests({
      filePath: "/nonexistent/Component.tsx",
    });

    const parsed = JSON.parse(result.content[0]!.text);

    expect(parsed).toHaveProperty("error", true);
    expect(parsed).toHaveProperty("message");
  });
});
