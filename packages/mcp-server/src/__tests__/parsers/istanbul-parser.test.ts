import { describe, it, expect, afterEach } from "vitest";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  parseCoverageSummary,
  parseUncoveredLines,
  parseCoverageFiles,
} from "../../parsers/istanbul-parser.js";

describe("parseCoverageSummary", () => {
  it("summary와 files 매핑이 올바르게 파싱된다", () => {
    const json = {
      total: {
        lines: { total: 100, covered: 80, pct: 80 },
        branches: { total: 50, covered: 40, pct: 80 },
        functions: { total: 30, covered: 25, pct: 83.33 },
        statements: { total: 120, covered: 90, pct: 75 },
      },
      "/src/foo.ts": {
        lines: { total: 50, covered: 40, pct: 80 },
        branches: { total: 20, covered: 15, pct: 75 },
        functions: { total: 10, covered: 8, pct: 80 },
        statements: { total: 60, covered: 45, pct: 75 },
      },
      "/src/bar.ts": {
        lines: { total: 50, covered: 40, pct: 80 },
        branches: { total: 30, covered: 25, pct: 83.33 },
        functions: { total: 20, covered: 17, pct: 85 },
        statements: { total: 60, covered: 45, pct: 75 },
      },
    };

    const result = parseCoverageSummary(json);

    expect(result.summary).toEqual({
      lines: { total: 100, covered: 80, pct: 80 },
      branches: { total: 50, covered: 40, pct: 80 },
      functions: { total: 30, covered: 25, pct: 83.33 },
      statements: { total: 120, covered: 90, pct: 75 },
    });

    expect(result.files.size).toBe(2);
    expect(result.files.has("/src/foo.ts")).toBe(true);
    expect(result.files.has("/src/bar.ts")).toBe(true);

    const foo = result.files.get("/src/foo.ts")!;
    expect(foo.lines).toEqual({ total: 50, covered: 40, pct: 80 });
    expect(foo.statements).toEqual({ total: 60, covered: 45, pct: 75 });
  });

  it("pct가 'Unknown'이면 0으로 변환된다", () => {
    const json = {
      total: {
        lines: { total: 0, covered: 0, pct: "Unknown" },
        branches: { total: 0, covered: 0, pct: "Unknown" },
        functions: { total: 0, covered: 0, pct: "Unknown" },
        statements: { total: 0, covered: 0, pct: "Unknown" },
      },
      "/src/empty.ts": {
        lines: { total: 0, covered: 0, pct: "Unknown" },
        branches: { total: 0, covered: 0, pct: "Unknown" },
        functions: { total: 0, covered: 0, pct: "Unknown" },
        statements: { total: 0, covered: 0, pct: "Unknown" },
      },
    };

    const result = parseCoverageSummary(json);

    expect(result.summary.lines.pct).toBe(0);
    expect(result.summary.branches.pct).toBe(0);
    expect(result.summary.functions.pct).toBe(0);
    expect(result.summary.statements.pct).toBe(0);

    const file = result.files.get("/src/empty.ts")!;
    expect(file.lines.pct).toBe(0);
    expect(file.statements.pct).toBe(0);
  });
});

describe("parseUncoveredLines", () => {
  it("count가 0인 statement의 line 번호를 추출한다", () => {
    const json = {
      "/src/foo.ts": {
        statementMap: {
          "0": { start: { line: 1 } },
          "1": { start: { line: 5 } },
          "2": { start: { line: 10 } },
          "3": { start: { line: 15 } },
        },
        s: {
          "0": 3,
          "1": 0,
          "2": 1,
          "3": 0,
        },
      },
    };

    const result = parseUncoveredLines(json);

    expect(result.get("/src/foo.ts")).toEqual([5, 15]);
  });

  it("여러 파일의 미커버 라인을 각각 추출한다", () => {
    const json = {
      "/src/a.ts": {
        statementMap: {
          "0": { start: { line: 3 } },
          "1": { start: { line: 7 } },
        },
        s: { "0": 0, "1": 0 },
      },
      "/src/b.ts": {
        statementMap: {
          "0": { start: { line: 20 } },
        },
        s: { "0": 1 },
      },
    };

    const result = parseUncoveredLines(json);

    expect(result.get("/src/a.ts")).toEqual([3, 7]);
    expect(result.get("/src/b.ts")).toEqual([]);
  });

  it("빈 coverage 데이터이면 빈 Map을 반환한다", () => {
    const result = parseUncoveredLines({});

    expect(result.size).toBe(0);
  });

  it("line 번호가 오름차순으로 정렬된다", () => {
    const json = {
      "/src/foo.ts": {
        statementMap: {
          "0": { start: { line: 30 } },
          "1": { start: { line: 10 } },
          "2": { start: { line: 20 } },
        },
        s: { "0": 0, "1": 0, "2": 0 },
      },
    };

    const result = parseUncoveredLines(json);

    expect(result.get("/src/foo.ts")).toEqual([10, 20, 30]);
  });
});

describe("parseCoverageFiles", () => {
  let tmpDir: string;

  afterEach(async () => {
    if (tmpDir) {
      await rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("tmpDir에서 두 JSON 파일을 읽어 CoverageResult를 반환한다", async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "istanbul-parser-test-"));

    const summaryJson = {
      total: {
        lines: { total: 100, covered: 80, pct: 80 },
        branches: { total: 50, covered: 40, pct: 80 },
        functions: { total: 30, covered: 25, pct: 83.33 },
        statements: { total: 120, covered: 90, pct: 75 },
      },
      "/src/foo.ts": {
        lines: { total: 50, covered: 40, pct: 80 },
        branches: { total: 20, covered: 15, pct: 75 },
        functions: { total: 10, covered: 8, pct: 80 },
        statements: { total: 60, covered: 50, pct: 83.33 },
      },
      "/src/bar.ts": {
        lines: { total: 50, covered: 40, pct: 80 },
        branches: { total: 30, covered: 25, pct: 83.33 },
        functions: { total: 20, covered: 17, pct: 85 },
        statements: { total: 60, covered: 40, pct: 66.67 },
      },
    };

    const finalJson = {
      "/src/foo.ts": {
        statementMap: {
          "0": { start: { line: 1 } },
          "1": { start: { line: 5 } },
        },
        s: { "0": 3, "1": 0 },
      },
      "/src/bar.ts": {
        statementMap: {
          "0": { start: { line: 10 } },
          "1": { start: { line: 20 } },
        },
        s: { "0": 0, "1": 0 },
      },
    };

    await writeFile(
      join(tmpDir, "coverage-summary.json"),
      JSON.stringify(summaryJson)
    );
    await writeFile(
      join(tmpDir, "coverage-final.json"),
      JSON.stringify(finalJson)
    );

    const result = await parseCoverageFiles(tmpDir);

    expect(result.summary.lines.pct).toBe(80);
    expect(result.summary.statements.pct).toBe(75);

    expect(result.files).toHaveLength(2);

    // statements.pct 오름차순 정렬 확인 (bar: 66.67 < foo: 83.33)
    expect(result.files[0].file).toBe("/src/bar.ts");
    expect(result.files[0].statements.pct).toBe(66.67);
    expect(result.files[0].uncoveredLines).toEqual([10, 20]);

    expect(result.files[1].file).toBe("/src/foo.ts");
    expect(result.files[1].statements.pct).toBe(83.33);
    expect(result.files[1].uncoveredLines).toEqual([5]);
  });

  it("파일 미존재 시 에러를 던진다", async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "istanbul-parser-test-"));

    await expect(parseCoverageFiles(tmpDir)).rejects.toThrow();
  });

  it("coverage-summary.json만 존재하면 에러를 던진다", async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "istanbul-parser-test-"));

    const summaryJson = {
      total: {
        lines: { total: 0, covered: 0, pct: 0 },
        branches: { total: 0, covered: 0, pct: 0 },
        functions: { total: 0, covered: 0, pct: 0 },
        statements: { total: 0, covered: 0, pct: 0 },
      },
    };

    await writeFile(
      join(tmpDir, "coverage-summary.json"),
      JSON.stringify(summaryJson)
    );

    await expect(parseCoverageFiles(tmpDir)).rejects.toThrow();
  });
});
