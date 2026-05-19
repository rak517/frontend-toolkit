import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { z } from "zod";
import { absolutePathSchema } from "../../schemas.js";
import type { McpToolResponse, TestGapAnalysis } from "../../types.js";
import { analyzeCode } from "../../analyzer.js";

export const analyzeTestGapsSchema = z.object({
  filePath: absolutePathSchema.describe("분석할 소스 파일의 절대 경로"),
});

export type AnalyzeTestGapsInput = z.infer<typeof analyzeTestGapsSchema>;

// 테스트 파일 경로 찾기
function findTestFile(sourceFile: string): string | null {
  const dir = dirname(sourceFile);
  const name = basename(sourceFile).replace(/\.(ts|tsx|js|jsx)$/, "");
  const ext = basename(sourceFile).match(/\.(ts|tsx|js|jsx)$/)?.[0] ?? ".ts";

  // 가능한 테스트 파일 경로들
  const candidates = [
    join(dir, `${name}.test${ext}`),
    join(dir, `${name}.spec${ext}`),
    join(dir, "__tests__", `${name}.test${ext}`),
    join(dir, "__tests__", `${name}.spec${ext}`),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

// 테스트 파일에서 테스트된 함수명 추출
async function extractTestedNames(testFilePath: string): Promise<string[]> {
  const content = await readFile(testFilePath, "utf-8");
  const testedNames: string[] = [];

  // describe("FunctionName", ...) 패턴만 추출
  // it/test 블록은 자연어 설명이므로 오탐 가능성이 높아 제외
  const describeMatches = content.matchAll(/describe\s*\(\s*["']([^"']+)["']/g);
  for (const match of describeMatches) {
    const captured = match[1];
    if (captured !== undefined) {
      testedNames.push(captured);
    }
  }

  return testedNames;
}

// 정규식 메타문자 이스케이프
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// 이름이 테스트되었는지 확인 (단어 경계 기반)
function isNameTested(exportName: string, testedNames: string[]): boolean {
  // 정규식 메타문자 이스케이프 후 단어 경계 패턴 생성
  const escapedName = escapeRegExp(exportName);
  const pattern = new RegExp(`\\b${escapedName}\\b`, "i");

  return testedNames.some((tested) => pattern.test(tested));
}

async function analyzeGaps(filePath: string): Promise<TestGapAnalysis> {
  const analysis = await analyzeCode(filePath);
  const testFile = findTestFile(filePath);

  const exportNames = analysis.exports.map((e) => e.name);

  if (!testFile) {
    return {
      sourceFile: filePath,
      testFile: null,
      tested: [],
      untested: exportNames,
    };
  }

  const testedNames = await extractTestedNames(testFile);
  const tested: string[] = [];
  const untested: string[] = [];

  for (const name of exportNames) {
    if (isNameTested(name, testedNames)) {
      tested.push(name);
    } else {
      untested.push(name);
    }
  }

  return {
    sourceFile: filePath,
    testFile,
    tested,
    untested,
  };
}

export async function runAnalyzeTestGaps(
  input: AnalyzeTestGapsInput
): Promise<McpToolResponse> {
  const { filePath } = input;
  const result = await analyzeGaps(filePath);

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
