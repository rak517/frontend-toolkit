import { readdir, stat } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { z } from "zod";
import { absolutePathSchema } from "../../schemas.js";
import type { McpToolResponse, SimilarTest } from "../../types.js";
import { findProjectRoot } from "../../utils/find-project-root.js";

export const findSimilarTestsSchema = z.object({
  filePath: absolutePathSchema.describe(
    "테스트를 작성할 소스 파일의 절대 경로"
  ),
  maxResults: z
    .number()
    .optional()
    .default(5)
    .describe("반환할 최대 결과 수 (기본값: 5)"),
});

export type FindSimilarTestsInput = z.infer<typeof findSimilarTestsSchema>;

// 테스트 파일인지 확인
function isTestFile(fileName: string): boolean {
  return /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(fileName);
}

// 재귀적으로 테스트 파일 검색
async function findTestFiles(
  dir: string,
  files: string[] = []
): Promise<string[]> {
  try {
    const entries = await readdir(dir);

    for (const entry of entries) {
      if (entry === "node_modules" || entry === "dist" || entry === ".git") {
        continue;
      }

      const fullPath = join(dir, entry);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        await findTestFiles(fullPath, files);
      } else if (isTestFile(entry)) {
        files.push(fullPath);
      }
    }
  } catch {
    // 권한 오류 등 무시
  }

  return files;
}

// 유사도 계산
function calculateSimilarity(
  sourceFile: string,
  testFile: string
): SimilarTest | null {
  const sourceName = basename(sourceFile).replace(/\.(ts|tsx|js|jsx)$/, "");
  const sourceDir = dirname(sourceFile);
  const testName = basename(testFile).replace(
    /\.(test|spec)\.(ts|tsx|js|jsx)$/,
    ""
  );
  const testDir = dirname(testFile);

  // 같은 파일의 테스트 제외
  if (sourceName === testName) {
    // 같은 폴더의 테스트 (Button.tsx -> Button.test.tsx)
    if (sourceDir === testDir) {
      return null;
    }
    // __tests__ 폴더 내 테스트 (Button.tsx -> __tests__/Button.test.tsx)
    if (basename(testDir) === "__tests__" && dirname(testDir) === sourceDir) {
      return null;
    }
  }

  // 같은 폴더 + 이름에 공통 단어 포함 (Button, IconButton)
  if (sourceDir === testDir) {
    if (
      testName.includes(sourceName) ||
      sourceName.includes(testName) ||
      hasCommonWord(sourceName, testName)
    ) {
      return {
        filePath: testFile,
        similarity: "high",
        reason: `같은 폴더의 유사한 컴포넌트 (${testName})`,
      };
    }
    return {
      filePath: testFile,
      similarity: "medium",
      reason: "같은 폴더의 테스트 파일",
    };
  }

  // 같은 상위 폴더 (components/buttons vs components/inputs)
  const sourceParent = dirname(sourceDir);
  const testParent = dirname(testDir);
  if (sourceParent === testParent) {
    return {
      filePath: testFile,
      similarity: "medium",
      reason: "인접 폴더의 테스트 파일",
    };
  }

  // 이름 유사성만 있는 경우
  if (
    testName.includes(sourceName) ||
    sourceName.includes(testName) ||
    hasCommonWord(sourceName, testName)
  ) {
    return {
      filePath: testFile,
      similarity: "low",
      reason: `유사한 이름의 컴포넌트 (${testName})`,
    };
  }

  return null;
}

// 공통 단어 확인 (Button, SubmitButton -> "Button" 공통)
function hasCommonWord(name1: string, name2: string): boolean {
  const words1 = splitCamelCase(name1);
  const words2 = splitCamelCase(name2);
  return words1.some((w) => words2.includes(w) && w.length > 2);
}

// CamelCase 분리 (IconButton -> ["Icon", "Button"])
function splitCamelCase(str: string): string[] {
  return str.split(/(?=[A-Z])/).filter((s) => s.length > 0);
}

export async function runFindSimilarTests(
  input: FindSimilarTestsInput
): Promise<McpToolResponse> {
  const { filePath, maxResults } = input;

  const projectRoot = findProjectRoot(filePath) ?? dirname(filePath);
  const allTestFiles = await findTestFiles(projectRoot);

  const similarTests: SimilarTest[] = [];

  for (const testFile of allTestFiles) {
    const similarity = calculateSimilarity(filePath, testFile);
    if (similarity) {
      similarTests.push(similarity);
    }
  }

  // 유사도 순 정렬 (high > medium > low)
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  similarTests.sort(
    (a, b) => priorityOrder[a.similarity] - priorityOrder[b.similarity]
  );

  const result = {
    sourceFile: filePath,
    similarTests: similarTests.slice(0, maxResults),
    totalFound: similarTests.length,
  };

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
