import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";

const jsonRecordSchema = z.record(z.unknown());

export interface CoverageMetric {
  total: number;
  covered: number;
  pct: number;
}

export interface FileCoverage {
  file: string;
  lines: CoverageMetric;
  branches: CoverageMetric;
  functions: CoverageMetric;
  statements: CoverageMetric;
  uncoveredLines: number[];
}

export interface CoverageResult {
  summary: {
    lines: CoverageMetric;
    branches: CoverageMetric;
    functions: CoverageMetric;
    statements: CoverageMetric;
  };
  files: FileCoverage[];
}

function toMetric(raw: unknown): CoverageMetric {
  const m = raw as {
    total: number;
    covered: number;
    pct: number | "Unknown";
  };
  return {
    total: m.total,
    covered: m.covered,
    pct: m.pct === "Unknown" ? 0 : m.pct,
  };
}

export function parseCoverageSummary(json: Record<string, unknown>): {
  summary: CoverageResult["summary"];
  files: Map<string, Omit<FileCoverage, "file" | "uncoveredLines">>;
} {
  const total = json["total"] as Record<string, unknown>;
  const summary = {
    lines: toMetric(total["lines"]),
    branches: toMetric(total["branches"]),
    functions: toMetric(total["functions"]),
    statements: toMetric(total["statements"]),
  };

  const files = new Map<
    string,
    Omit<FileCoverage, "file" | "uncoveredLines">
  >();
  for (const [key, value] of Object.entries(json)) {
    if (key === "total") continue;
    const metrics = value as Record<string, unknown>;
    files.set(key, {
      lines: toMetric(metrics["lines"]),
      branches: toMetric(metrics["branches"]),
      functions: toMetric(metrics["functions"]),
      statements: toMetric(metrics["statements"]),
    });
  }

  return { summary, files };
}

export function parseUncoveredLines(
  json: Record<string, unknown>
): Map<string, number[]> {
  const result = new Map<string, number[]>();

  for (const [filePath, fileData] of Object.entries(json)) {
    const data = fileData as Record<string, unknown>;
    const statementMap = data["statementMap"] as Record<
      string,
      { start: { line?: number } }
    >;
    const s = data["s"] as Record<string, number>;

    const lines = new Set<number>();
    for (const [id, count] of Object.entries(s)) {
      if (count === 0) {
        const line = statementMap[id]?.start?.line;
        if (typeof line === "number") {
          lines.add(line);
        }
      }
    }

    result.set(
      filePath,
      Array.from(lines).sort((a, b) => a - b)
    );
  }

  return result;
}

export async function parseCoverageFiles(
  dirPath: string
): Promise<CoverageResult> {
  // 1. coverage-summary.json 읽기 + JSON.parse
  const summaryPath = join(dirPath, "coverage-summary.json");
  const summaryRaw = jsonRecordSchema.parse(
    JSON.parse(await readFile(summaryPath, "utf-8"))
  );
  const { summary, files: fileMetrics } = parseCoverageSummary(summaryRaw);

  // 2. coverage-final.json 읽기 + JSON.parse
  const finalPath = join(dirPath, "coverage-final.json");
  const finalRaw = jsonRecordSchema.parse(
    JSON.parse(await readFile(finalPath, "utf-8"))
  );
  const uncoveredMap = parseUncoveredLines(finalRaw);

  // 3. fileMetrics와 uncoveredMap을 합쳐서 FileCoverage[] 생성
  const files: FileCoverage[] = [];
  for (const [filePath, metrics] of fileMetrics) {
    files.push({
      file: filePath,
      ...metrics,
      uncoveredLines: uncoveredMap.get(filePath) ?? [],
    });
  }

  // 4. statements.pct 오름차순 정렬 (최저 커버리지 우선)
  files.sort((a, b) => a.statements.pct - b.statements.pct);

  return { summary, files };
}
