import { describe, it, expect } from "vitest";
import { analyzeCode } from "../../analyzer.js";
import { join } from "node:path";

describe("analyzeCode", () => {
  it("should return correct file metadata", async () => {
    // 현재 프로젝트의 실제 파일 분석
    const result = await analyzeCode(join(process.cwd(), "packages/mcp-server/src/analyzer.ts"));

    expect(result.fileName).toBe("analyzer.ts");
    expect(result.fileExtension).toBe("ts");
  });

  it("should extract named function exports", async () => {
    const result = await analyzeCode(join(process.cwd(), "packages/mcp-server/src/analyzer.ts"));

    const analyzeCodeExport = result.exports.find(
      (e) => e.name === "analyzeCode"
    );

    expect(analyzeCodeExport).toBeDefined();
    expect(analyzeCodeExport?.type).toBe("function");
    expect(analyzeCodeExport?.params).toHaveLength(1);
    expect(analyzeCodeExport?.params[0]?.name).toBe("filePath");
  });

  it("should extract import dependencies", async () => {
    const result = await analyzeCode(join(process.cwd(), "packages/mcp-server/src/analyzer.ts"));

    expect(result.dependencies).toContain("node:fs/promises");
    expect(result.dependencies).toContain("node:path");
    expect(result.dependencies).toContain(
      "@typescript-eslint/typescript-estree"
    );
    expect(result.dependencies).toContain("./types.js");
  });

  it("should extract const/arrow function exports", async () => {
    // schemas.ts는 export const 패턴 사용
    const result = await analyzeCode(join(process.cwd(), "packages/mcp-server/src/schemas.ts"));

    const schemaExport = result.exports.find(
      (e) => e.name === "absolutePathSchema"
    );

    expect(schemaExport).toBeDefined();
    expect(schemaExport?.type).toBe("const");
  });

  it("should throw error for non-existent file", async () => {
    await expect(analyzeCode("/nonexistent/file.ts")).rejects.toThrow();
  });

  it("should handle multiple exports in single file", async () => {
    // detector.ts는 여러 함수 export
    const result = await analyzeCode(join(process.cwd(), "packages/mcp-server/src/detector.ts"));

    const exportNames = result.exports.map((e) => e.name);

    expect(exportNames).toContain("detectFramework");
    expect(exportNames).toContain("detectTestEnvironment");
    expect(result.exports.length).toBeGreaterThanOrEqual(2);
  });
});
