import { describe, it, expect } from "vitest";
import { absolutePathSchema } from "../../schemas.js";

describe("absolutePathSchema", () => {
  it("should accept absolute path", () => {
    const result = absolutePathSchema.safeParse("/Users/test/file.ts");
    expect(result.success).toBe(true);
  });

  it("should reject relative path", () => {
    const result = absolutePathSchema.safeParse("./src/file.ts");
    expect(result.success).toBe(false);
  });

  it("should reject path without leading slash", () => {
    const result = absolutePathSchema.safeParse("src/file.ts");
    expect(result.success).toBe(false);
  });
});
