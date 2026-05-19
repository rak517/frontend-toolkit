import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { detectFramework } from "../../utils/detect-framework.js";
import { join } from "node:path";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";

describe("detectFramework", () => {
  describe("with current project", () => {
    it("should detect vitest for current project", async () => {
      const result = await detectFramework(process.cwd());
      expect(result).toBe("vitest");
    });
  });

  describe("with config files", () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = mkdtempSync(join(tmpdir(), "test-framework-"));
      writeFileSync(join(tempDir, "package.json"), "{}");
    });

    afterEach(() => {
      rmSync(tempDir, { recursive: true });
    });

    it("should detect vitest from vitest.config.ts", async () => {
      writeFileSync(join(tempDir, "vitest.config.ts"), "export default {}");

      const result = await detectFramework(tempDir);
      expect(result).toBe("vitest");
    });

    it("should detect vitest from vitest.config.js", async () => {
      writeFileSync(join(tempDir, "vitest.config.js"), "module.exports = {}");

      const result = await detectFramework(tempDir);
      expect(result).toBe("vitest");
    });

    it("should detect vitest from vitest.config.mts", async () => {
      writeFileSync(join(tempDir, "vitest.config.mts"), "export default {}");

      const result = await detectFramework(tempDir);
      expect(result).toBe("vitest");
    });

    it("should detect jest from jest.config.js", async () => {
      writeFileSync(join(tempDir, "jest.config.js"), "module.exports = {}");

      const result = await detectFramework(tempDir);
      expect(result).toBe("jest");
    });

    it("should detect jest from jest.config.ts", async () => {
      writeFileSync(join(tempDir, "jest.config.ts"), "export default {}");

      const result = await detectFramework(tempDir);
      expect(result).toBe("jest");
    });

    it("should detect jest from jest.config.json", async () => {
      writeFileSync(join(tempDir, "jest.config.json"), "{}");

      const result = await detectFramework(tempDir);
      expect(result).toBe("jest");
    });

    it("should prioritize vitest over jest when both exist", async () => {
      writeFileSync(join(tempDir, "vitest.config.ts"), "export default {}");
      writeFileSync(join(tempDir, "jest.config.js"), "module.exports = {}");

      const result = await detectFramework(tempDir);
      expect(result).toBe("vitest");
    });
  });

  describe("with package.json dependencies", () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = mkdtempSync(join(tmpdir(), "test-framework-"));
    });

    afterEach(() => {
      rmSync(tempDir, { recursive: true });
    });

    it("should detect vitest from dependencies", async () => {
      writeFileSync(
        join(tempDir, "package.json"),
        JSON.stringify({ dependencies: { vitest: "^1.0.0" } })
      );

      const result = await detectFramework(tempDir);
      expect(result).toBe("vitest");
    });

    it("should detect vitest from devDependencies", async () => {
      writeFileSync(
        join(tempDir, "package.json"),
        JSON.stringify({ devDependencies: { vitest: "^1.0.0" } })
      );

      const result = await detectFramework(tempDir);
      expect(result).toBe("vitest");
    });

    it("should detect jest from dependencies", async () => {
      writeFileSync(
        join(tempDir, "package.json"),
        JSON.stringify({ dependencies: { jest: "^29.0.0" } })
      );

      const result = await detectFramework(tempDir);
      expect(result).toBe("jest");
    });

    it("should detect jest from devDependencies", async () => {
      writeFileSync(
        join(tempDir, "package.json"),
        JSON.stringify({ devDependencies: { jest: "^29.0.0" } })
      );

      const result = await detectFramework(tempDir);
      expect(result).toBe("jest");
    });

    it("should prioritize vitest over jest in package.json", async () => {
      writeFileSync(
        join(tempDir, "package.json"),
        JSON.stringify({
          devDependencies: { vitest: "^1.0.0", jest: "^29.0.0" },
        })
      );

      const result = await detectFramework(tempDir);
      expect(result).toBe("vitest");
    });
  });

  describe("unknown framework", () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = mkdtempSync(join(tmpdir(), "test-framework-"));
    });

    afterEach(() => {
      rmSync(tempDir, { recursive: true });
    });

    it("should return unknown when no framework detected", async () => {
      writeFileSync(join(tempDir, "package.json"), "{}");

      const result = await detectFramework(tempDir);
      expect(result).toBe("unknown");
    });

    it("should return unknown when package.json is invalid", async () => {
      writeFileSync(join(tempDir, "package.json"), "invalid json");

      const result = await detectFramework(tempDir);
      expect(result).toBe("unknown");
    });

    it("should return unknown when no package.json exists", async () => {
      const result = await detectFramework(tempDir);
      expect(result).toBe("unknown");
    });
  });
});
