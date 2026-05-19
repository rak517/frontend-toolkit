import { describe, it, expect } from "vitest";
import { detectFramework, detectTestEnvironment } from "../../detector.js";

describe("detectFramework", () => {
  it("should detect vitest from package.json dependencies", async () => {
    // 현재 프로젝트는 vitest를 devDependencies에 가지고 있음
    const result = await detectFramework(".");
    expect(result).toBe("vitest");
  });

  it("should return unknown for non-existent path", async () => {
    const result = await detectFramework("/nonexistent/path");
    expect(result).toBe("unknown");
  });

  it("should return unknown for path without package.json or config", async () => {
    // /tmp는 package.json이나 테스트 설정 파일이 없음
    const result = await detectFramework("/tmp");
    expect(result).toBe("unknown");
  });
});

describe("detectTestEnvironment", () => {
  it("should return complete environment info", async () => {
    const result = await detectTestEnvironment(".");

    expect(result).toEqual({
      framework: "vitest",
      hasTestingLibrary: false,
      testFilePattern: "*.test.ts",
      configFile: "vitest.config.ts",
    });
  });

  it("should detect vitest config file", async () => {
    const result = await detectTestEnvironment(".");
    expect(result.configFile).toBe("vitest.config.ts");
  });

  it("should return unknown framework for invalid path", async () => {
    const result = await detectTestEnvironment("/nonexistent/path");

    expect(result.framework).toBe("unknown");
    expect(result.configFile).toBeNull();
  });
});
