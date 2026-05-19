import type { RunTestsOutput } from "../tools/test/run-tests.js";

/**
 * AI 토큰 절약을 위한 적응형 포맷팅
 * - 전부 pass → results 생략, summary만 반환
 * - 실패 있음 → 실패만 상세, 성공은 name+status만
 */
export function formatResults(output: RunTestsOutput): RunTestsOutput {
  if (output.summary.failed === 0) {
    return {
      ...output,
      results: [],
    };
  }

  return {
    ...output,
    results: output.results.map((r) =>
      r.status === "failed"
        ? r
        : { name: r.name, status: r.status, duration: 0 }
    ),
  };
}
