import { spawn } from "node:child_process";
import type { RunTestsOutput, TestResult } from "../tools/test/run-tests.js";
import { NPX_BIN } from "../utils/constants.js";
import { parseErrorMessage } from "../utils/parse-error-message.js";
import { extractLocation } from "../utils/parse-stack-trace.js";
import { readSourceContext } from "../utils/read-source-context.js";

interface VitestAssertionResult {
  title: string;
  status: "passed" | "failed" | "pending";
  duration: number;
  failureMessages?: string[];
  location?: { line: number; column: number };
}

interface VitestTestResult {
  name: string;
  assertionResults: VitestAssertionResult[];
}

interface VitestJsonOutput {
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  numPendingTests: number;
  success: boolean;
  testResults: VitestTestResult[];
}

export async function runVitest(
  testPath: string,
  projectRoot: string,
  timeout: number
): Promise<RunTestsOutput> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (payload: RunTestsOutput) => {
      if (settled) return;
      settled = true;
      resolve(payload);
    };

    const args = ["vitest", "run", "--reporter=json", testPath];
    const child = spawn(NPX_BIN, args, {
      cwd: projectRoot,
    });

    const timer = setTimeout(() => {
      child.kill();
      finish({
        success: false,
        framework: "vitest",
        summary: {
          total: 0,
          passed: 0,
          failed: 0,
          skipped: 0,
          duration: timeout * 1000,
        },
        results: [],
        error: `테스트 실행이 ${timeout}초 타임아웃을 초과했습니다. 테스트 환경(jsdom, happy-dom)이나 비동기 처리를 확인하세요.`,
      });
    }, timeout * 1000);

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    child.on("close", () => {
      clearTimeout(timer);
      try {
        const json = JSON.parse(stdout) as VitestJsonOutput;
        const results: TestResult[] = [];

        for (const testFile of json.testResults) {
          for (const assertion of testFile.assertionResults) {
            const error = assertion.failureMessages?.[0]
              ? parseErrorMessage(assertion.failureMessages[0])
              : undefined;
            const stackLoc = error?.stack ? extractLocation(error.stack) : null;
            const loc = stackLoc ?? assertion.location;

            const sourceContext = loc?.line
              ? (readSourceContext(testFile.name, loc.line) ?? undefined)
              : undefined;

            results.push({
              name: assertion.title,
              status:
                assertion.status === "pending" ? "skipped" : assertion.status,
              duration: assertion.duration,
              location: { file: testFile.name, ...loc },
              error,
              sourceContext,
            });
          }
        }

        // vitest 1.x 감지: 실패한 assertion에 location은 있지만
        // failureMessages에 스택 트레이스가 없는 경우
        const hasV1LocationIssue = json.testResults.some((tf) =>
          tf.assertionResults.some(
            (a) =>
              a.status === "failed" &&
              a.location != null &&
              a.failureMessages?.[0] &&
              !a.failureMessages[0].includes("\n    at ")
          )
        );

        finish({
          success: json.success,
          framework: "vitest",
          summary: {
            total: json.numTotalTests,
            passed: json.numPassedTests,
            failed: json.numFailedTests,
            skipped: json.numPendingTests,
            duration: results.reduce((sum, r) => sum + r.duration, 0),
          },
          results,
          ...(hasV1LocationIssue && {
            warning:
              "vitest 1.x에서는 외부 라이브러리(testing-library 등) 에러의 실패 위치가 부정확할 수 있습니다. vitest 2.0 이상으로 업그레이드를 권장합니다.",
          }),
        });
      } catch {
        finish({
          success: false,
          framework: "vitest",
          summary: { total: 0, passed: 0, failed: 0, skipped: 0, duration: 0 },
          results: [],
          error: stderr || "vitest 실행 중 오류 발생",
        });
      }
    });

    child.on("error", (error) => {
      clearTimeout(timer);
      finish({
        success: false,
        framework: "vitest",
        summary: { total: 0, passed: 0, failed: 0, skipped: 0, duration: 0 },
        results: [],
        error: error.message,
      });
    });
  });
}
