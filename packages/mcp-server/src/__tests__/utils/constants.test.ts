import { describe, it, expect } from "vitest";
import { VITEST_CONFIGS, JEST_CONFIGS } from "../../utils/constants.js";

describe("constants", () => {
  describe("VITEST_CONFIGS", () => {
    it("should be an array", () => {
      expect(Array.isArray(VITEST_CONFIGS)).toBe(true);
    });

    it("should contain vitest.config.ts", () => {
      expect(VITEST_CONFIGS).toContain("vitest.config.ts");
    });

    it("should contain vitest.config.js", () => {
      expect(VITEST_CONFIGS).toContain("vitest.config.js");
    });

    it("should contain vitest.config.mts", () => {
      expect(VITEST_CONFIGS).toContain("vitest.config.mts");
    });

    it("should have exactly 3 config options", () => {
      expect(VITEST_CONFIGS.length).toBe(3);
    });
  });

  describe("JEST_CONFIGS", () => {
    it("should be an array", () => {
      expect(Array.isArray(JEST_CONFIGS)).toBe(true);
    });

    it("should contain jest.config.js", () => {
      expect(JEST_CONFIGS).toContain("jest.config.js");
    });

    it("should contain jest.config.ts", () => {
      expect(JEST_CONFIGS).toContain("jest.config.ts");
    });

    it("should contain jest.config.json", () => {
      expect(JEST_CONFIGS).toContain("jest.config.json");
    });

    it("should have exactly 3 config options", () => {
      expect(JEST_CONFIGS.length).toBe(3);
    });
  });
});
