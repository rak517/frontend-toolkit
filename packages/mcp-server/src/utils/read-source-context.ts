import { readFileSync } from "node:fs";

const CONTEXT_LINES = 3;

/**
 * 실패 라인 기준 ±3줄을 읽어서 컨텍스트 문자열로 반환
 * 실패 라인에 > 마커 표시
 */
export function readSourceContext(
  filePath: string,
  line: number
): string | null {
  try {
    const content = readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    const start = Math.max(0, line - 1 - CONTEXT_LINES);
    const end = Math.min(lines.length, line + CONTEXT_LINES);

    return lines
      .slice(start, end)
      .map((text, i) => {
        const lineNum = start + i + 1;
        const marker = lineNum === line ? ">" : " ";
        return `${marker} ${String(lineNum).padStart(4)} | ${text}`;
      })
      .join("\n");
  } catch {
    return null;
  }
}
