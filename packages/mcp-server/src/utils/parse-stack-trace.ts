import type { TestLocation } from "../tools/test/run-tests.js";
import { ANSI_REGEX } from "./constants.js";

/**
 * failureMessage에서 스택 트레이스를 추출하고 정리
 * - ANSI escape 코드 제거
 * - node_modules, node:internal 라인 필터링
 * - 프로젝트 내부 경로만 남김
 */
export function parseStackTrace(failureMessage: string): string[] {
  const cleaned = failureMessage.replace(ANSI_REGEX, "");
  const lines = cleaned.split("\n");

  return lines
    .filter((line) => line.trimStart().startsWith("at "))
    .filter(
      (line) =>
        !line.includes("node_modules") && !line.includes("node:internal")
    );
}

/**
 * 정리된 스택에서 첫 번째 프레임의 file:line:column 추출
 */
export function extractLocation(
  stack: string[]
): Pick<TestLocation, "line" | "column"> | null {
  if (stack.length === 0) return null;

  const frame = stack.find((f) => !f.includes("eval"));
  if (!frame) return null;

  // file:line:column (컬럼 있음)
  const fullMatch = frame.match(/:(\d+):(\d+)\)?$/);
  if (fullMatch) {
    return {
      line: Number(fullMatch[1]),
      column: Number(fullMatch[2]),
    };
  }

  // file:line (컬럼 없음)
  const lineOnly = frame.match(/:(\d+)\)?$/);
  if (lineOnly) {
    return {
      line: Number(lineOnly[1]),
    };
  }

  return null;
}
