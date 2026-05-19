import { describe, it, expect } from "vitest";
import { runVitest } from "../../runners/vitest-runner.js";
import { resolve } from "node:path";

describe("runVitest", () => {
  const projectRoot = process.cwd();
  const defaultTimeout = 30;

  describe("정상 실행", () => {
    it("RunTestsOutput 형태를 반환한다", async () => {
      const testPath = resolve(
        projectRoot,
        "packages/mcp-server/src/__tests__/core/schemas.test.ts"
      );

      const result = await runVitest(testPath, projectRoot, defaultTimeout);

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("framework", "vitest");
      expect(result).toHaveProperty("summary");
      expect(result).toHaveProperty("results");
    }, 30000);

    it("올바른 summary 구조를 반환한다", async () => {
      const testPath = resolve(
        projectRoot,
        "packages/mcp-server/src/__tests__/core/schemas.test.ts"
      );

      const result = await runVitest(testPath, projectRoot, defaultTimeout);

      expect(result.summary).toHaveProperty("total");
      expect(result.summary).toHaveProperty("passed");
      expect(result.summary).toHaveProperty("failed");
      expect(result.summary).toHaveProperty("skipped");
      expect(result.summary).toHaveProperty("duration");
    }, 30000);

    it("통과하는 테스트는 success: true를 반환한다", async () => {
      const testPath = resolve(
        projectRoot,
        "packages/mcp-server/src/__tests__/core/schemas.test.ts"
      );

      const result = await runVitest(testPath, projectRoot, defaultTimeout);

      expect(result.success).toBe(true);
      expect(result.summary.passed).toBeGreaterThan(0);
      expect(result.summary.failed).toBe(0);
    }, 30000);

    it("개별 테스트 결과에 필수 필드가 포함된다", async () => {
      const testPath = resolve(
        projectRoot,
        "packages/mcp-server/src/__tests__/core/schemas.test.ts"
      );

      const result = await runVitest(testPath, projectRoot, defaultTimeout);

      expect(result.results.length).toBeGreaterThan(0);

      for (const testResult of result.results) {
        expect(testResult).toHaveProperty("name");
        expect(testResult).toHaveProperty("status");
        expect(testResult).toHaveProperty("duration");
        expect(testResult).toHaveProperty("location");
        expect(["passed", "failed", "skipped"]).toContain(testResult.status);
      }
    }, 30000);

    it("결과에 파일 경로가 포함된다", async () => {
      const testPath = resolve(
        projectRoot,
        "packages/mcp-server/src/__tests__/core/schemas.test.ts"
      );

      const result = await runVitest(testPath, projectRoot, defaultTimeout);

      expect(result.results[0]?.location?.file).toContain("schemas.test.ts");
    }, 30000);
  });

  describe("에러 처리", () => {
    it("존재하지 않는 파일은 실패를 반환한다", async () => {
      const testPath = resolve(projectRoot, "nonexistent.test.ts");

      const result = await runVitest(testPath, projectRoot, defaultTimeout);

      expect(result.success).toBe(false);
    }, 30000);

    it("존재하지 않는 파일에서 framework 정보를 유지한다", async () => {
      const testPath = resolve(projectRoot, "nonexistent.test.ts");

      const result = await runVitest(testPath, projectRoot, defaultTimeout);

      expect(result.success).toBe(false);
      expect(result.framework).toBe("vitest");
    }, 30000);

    it("에러 시 빈 결과를 반환한다", async () => {
      const testPath = resolve(projectRoot, "nonexistent.test.ts");

      const result = await runVitest(testPath, projectRoot, defaultTimeout);

      expect(result.results).toEqual([]);
      expect(result.summary.total).toBe(0);
    }, 30000);
  });

  describe("폴더 실행", () => {
    it("폴더 내 모든 테스트를 실행한다", async () => {
      const testPath = resolve(projectRoot, "packages/mcp-server/src/__tests__/core");

      const result = await runVitest(testPath, projectRoot, defaultTimeout);

      expect(result.success).toBe(true);
      expect(result.summary.total).toBeGreaterThan(5);
    }, 60000);
  });

  describe("실패 테스트 처리", () => {
    it("실패 테스트에서 location에 line과 column이 포함된다", async () => {
      const testPath = resolve(
        projectRoot,
        "packages/mcp-server/src/__tests__/fixtures/__fail_fixture.test.ts"
      );

      const result = await runVitest(testPath, projectRoot, defaultTimeout);

      expect(result.success).toBe(false);
      const failed = result.results.find((r) => r.status === "failed");
      expect(failed).toBeDefined();
      expect(failed!.location?.line).toBeTypeOf("number");
      expect(failed!.location?.column).toBeTypeOf("number");
    }, 30000);

    it("실패 테스트에서 error에 message, expected, actual이 포함된다", async () => {
      const testPath = resolve(
        projectRoot,
        "packages/mcp-server/src/__tests__/fixtures/__fail_fixture.test.ts"
      );

      const result = await runVitest(testPath, projectRoot, defaultTimeout);

      const failed = result.results.find((r) => r.status === "failed");
      expect(failed!.error).toBeDefined();
      expect(failed!.error!.message).toContain("expected");
      expect(failed!.error!.expected).toBe("world");
      expect(failed!.error!.actual).toBe("hello");
    }, 30000);

    it("실패 테스트에서 sourceContext가 포함된다", async () => {
      const testPath = resolve(
        projectRoot,
        "packages/mcp-server/src/__tests__/fixtures/__fail_fixture.test.ts"
      );

      const result = await runVitest(testPath, projectRoot, defaultTimeout);

      const failed = result.results.find((r) => r.status === "failed");
      expect(failed!.sourceContext).toBeDefined();
      expect(failed!.sourceContext).toContain(">");
      expect(failed!.sourceContext).toContain("expect");
    }, 30000);

    it("실패 테스트에서 error.stack이 배열로 반환된다", async () => {
      const testPath = resolve(
        projectRoot,
        "packages/mcp-server/src/__tests__/fixtures/__fail_fixture.test.ts"
      );

      const result = await runVitest(testPath, projectRoot, defaultTimeout);

      const failed = result.results.find((r) => r.status === "failed");
      expect(Array.isArray(failed!.error!.stack)).toBe(true);
    }, 30000);
  });

  describe("타임아웃", () => {
    it("제한 시간 초과 시 프로세스를 종료하고 에러를 반환한다", async () => {
      const testPath = resolve(projectRoot, "packages/mcp-server/src/__tests__/core");

      // 0.001초(1ms)는 vitest 기동 시간보다 짧아서 반드시 타임아웃 발생
      const result = await runVitest(testPath, projectRoot, 0.001);

      expect(result.success).toBe(false);
      expect(result.error).toContain("타임아웃");
    }, 10000);

    it("타임아웃 에러에 제한 시간이 포함된다", async () => {
      const testPath = resolve(projectRoot, "packages/mcp-server/src/__tests__/core");

      const result = await runVitest(testPath, projectRoot, 0.001);

      expect(result.error).toContain("0.001초");
    }, 10000);

    it("타임아웃 시 framework 정보를 유지한다", async () => {
      const testPath = resolve(projectRoot, "packages/mcp-server/src/__tests__/core");

      const result = await runVitest(testPath, projectRoot, 0.001);

      expect(result.framework).toBe("vitest");
    }, 10000);

    it("타임아웃 시 빈 결과와 요약을 반환한다", async () => {
      const testPath = resolve(projectRoot, "packages/mcp-server/src/__tests__/core");

      const result = await runVitest(testPath, projectRoot, 0.001);

      expect(result.results).toEqual([]);
      expect(result.summary.total).toBe(0);
    }, 10000);

    it("충분한 시간이면 정상 완료한다", async () => {
      const testPath = resolve(
        projectRoot,
        "packages/mcp-server/src/__tests__/core/schemas.test.ts"
      );

      const result = await runVitest(testPath, projectRoot, 60);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    }, 65000);
  });
});
