import { spawn } from "node:child_process";
import type { RunTestsOutput, TestResult } from "../tools/test/run-tests.js";
import { NPX_BIN } from "../utils/constants.js";
import { parseErrorMessage } from "../utils/parse-error-message.js";
import { extractLocation } from "../utils/parse-stack-trace.js";
import { readSourceContext } from "../utils/read-source-context.js";

interface JestAssertionResult {
  title: string;
  status: "passed" | "failed" | "pending" | "todo";
  duration: number;
  failureMessages?: string[];
}

interface JestTestResult {
  name: string;
  assertionResults: JestAssertionResult[];
}

interface JestJsonOutput {
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  numPendingTests: number;
  success: boolean;
  testResults: JestTestResult[];
}

export async function runJest(
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

    const args = ["jest", "--json", testPath];
    const child = spawn(NPX_BIN, args, {
      cwd: projectRoot,
    });

    const timer = setTimeout(() => {
      child.kill();
      finish({
        success: false,
        framework: "jest",
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
        const json = JSON.parse(stdout) as JestJsonOutput;
        const results: TestResult[] = [];

        for (const testFile of json.testResults) {
          for (const assertion of testFile.assertionResults) {
            const error = assertion.failureMessages?.[0]
              ? parseErrorMessage(assertion.failureMessages[0])
              : undefined;

            const loc = error?.stack ? extractLocation(error.stack) : null;

            const sourceContext = loc?.line
              ? (readSourceContext(testFile.name, loc.line) ?? undefined)
              : undefined;

            results.push({
              name: assertion.title,
              status:
                assertion.status === "pending" || assertion.status === "todo"
                  ? "skipped"
                  : assertion.status,
              duration: assertion.duration ?? 0,
              location: { file: testFile.name, ...loc },
              error,
              sourceContext,
            });
          }
        }

        finish({
          success: json.success,
          framework: "jest",
          summary: {
            total: json.numTotalTests,
            passed: json.numPassedTests,
            failed: json.numFailedTests,
            skipped: json.numPendingTests,
            duration: results.reduce((sum, r) => sum + r.duration, 0),
          },
          results,
        });
      } catch {
        finish({
          success: false,
          framework: "jest",
          summary: { total: 0, passed: 0, failed: 0, skipped: 0, duration: 0 },
          results: [],
          error: stderr || "jest 실행 중 오류 발생",
        });
      }
    });

    child.on("error", (error) => {
      clearTimeout(timer);
      finish({
        success: false,
        framework: "jest",
        summary: { total: 0, passed: 0, failed: 0, skipped: 0, duration: 0 },
        results: [],
        error: error.message,
      });
    });
  });
}
