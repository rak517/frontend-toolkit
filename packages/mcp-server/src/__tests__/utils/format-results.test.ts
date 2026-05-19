import { describe, it, expect } from "vitest";
import { formatResults } from "../../utils/format-results.js";
import type { RunTestsOutput } from "../../tools/test/run-tests.js";

function createOutput(overrides: Partial<RunTestsOutput> = {}): RunTestsOutput {
  return {
    success: true,
    framework: "vitest",
    summary: {
      total: 2,
      passed: 2,
      failed: 0,
      skipped: 0,
      duration: 100,
    },
    results: [
      {
        name: "테스트 1",
        status: "passed",
        duration: 50,
        location: { file: "/src/test.ts", line: 10 },
      },
      {
        name: "테스트 2",
        status: "passed",
        duration: 50,
        location: { file: "/src/test.ts", line: 20 },
      },
    ],
    ...overrides,
  };
}

describe("formatResults", () => {
  describe("전부 성공 시", () => {
    it("results를 빈 배열로 반환한다", () => {
      const output = createOutput();

      const result = formatResults(output);

      expect(result.results).toEqual([]);
    });

    it("summary는 그대로 유지한다", () => {
      const output = createOutput();

      const result = formatResults(output);

      expect(result.summary).toEqual(output.summary);
    });

    it("success, framework 등 메타 정보를 유지한다", () => {
      const output = createOutput();

      const result = formatResults(output);

      expect(result.success).toBe(true);
      expect(result.framework).toBe("vitest");
    });
  });

  describe("실패 있을 때", () => {
    it("실패 테스트는 전체 정보를 유지한다", () => {
      const output = createOutput({
        success: false,
        summary: {
          total: 2,
          passed: 1,
          failed: 1,
          skipped: 0,
          duration: 100,
        },
        results: [
          {
            name: "성공 테스트",
            status: "passed",
            duration: 50,
            location: { file: "/src/test.ts", line: 10 },
          },
          {
            name: "실패 테스트",
            status: "failed",
            duration: 50,
            error: {
              message: "expected true to be false",
              expected: "false",
              actual: "true",
              stack: ["    at /src/test.ts:20:5"],
            },
            location: { file: "/src/test.ts", line: 20, column: 5 },
            sourceContext: ">   20 | expect(true).toBe(false)",
          },
        ],
      });

      const result = formatResults(output);

      const failed = result.results.find((r) => r.status === "failed");
      expect(failed).toBeDefined();
      expect(failed!.error).toBeDefined();
      expect(failed!.location).toBeDefined();
      expect(failed!.sourceContext).toBeDefined();
      expect(failed!.duration).toBe(50);
    });

    it("성공 테스트는 name과 status만 남긴다", () => {
      const output = createOutput({
        success: false,
        summary: {
          total: 2,
          passed: 1,
          failed: 1,
          skipped: 0,
          duration: 100,
        },
        results: [
          {
            name: "성공 테스트",
            status: "passed",
            duration: 50,
            location: { file: "/src/test.ts", line: 10 },
          },
          {
            name: "실패 테스트",
            status: "failed",
            duration: 50,
            error: { message: "fail" },
          },
        ],
      });

      const result = formatResults(output);

      const passed = result.results.find((r) => r.status === "passed");
      expect(passed).toEqual({
        name: "성공 테스트",
        status: "passed",
        duration: 0,
      });
    });

    it("skipped 테스트도 축소한다", () => {
      const output = createOutput({
        success: false,
        summary: {
          total: 3,
          passed: 1,
          failed: 1,
          skipped: 1,
          duration: 100,
        },
        results: [
          { name: "스킵", status: "skipped", duration: 0 },
          { name: "성공", status: "passed", duration: 50 },
          {
            name: "실패",
            status: "failed",
            duration: 50,
            error: { message: "fail" },
          },
        ],
      });

      const result = formatResults(output);

      const skipped = result.results.find((r) => r.status === "skipped");
      expect(skipped).toEqual({
        name: "스킵",
        status: "skipped",
        duration: 0,
      });
    });
  });

  describe("엣지 케이스", () => {
    it("results가 빈 배열이면 그대로 반환한다", () => {
      const output = createOutput({
        summary: {
          total: 0,
          passed: 0,
          failed: 0,
          skipped: 0,
          duration: 0,
        },
        results: [],
      });

      const result = formatResults(output);

      expect(result.results).toEqual([]);
    });

    it("원본 output을 변경하지 않는다", () => {
      const output = createOutput();
      const originalResults = [...output.results];

      formatResults(output);

      expect(output.results).toEqual(originalResults);
    });
  });
});
