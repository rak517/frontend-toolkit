import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { TestFramework, TestEnvironment } from "./types.js";

// 설정 파일 목록
const VITEST_CONFIGS = [
  "vitest.config.ts",
  "vitest.config.js",
  "vitest.config.mts",
];

const JEST_CONFIGS = ["jest.config.js", "jest.config.ts", "jest.config.json"];

// package.json 읽기
async function readPackageJson(
  projectPath: string
): Promise<Record<string, unknown> | null> {
  try {
    const content = await readFile(join(projectPath, "package.json"), "utf-8");
    return JSON.parse(content) as Record<string, unknown>;
  } catch {
    return null;
  }
}

// 설정 파일 찾기
function findConfigFile(projectPath: string, configs: string[]): string | null {
  for (const config of configs) {
    if (existsSync(join(projectPath, config))) {
      return config;
    }
  }
  return null;
}

// 프레임워크 감지
export async function detectFramework(
  projectPath: string
): Promise<TestFramework> {
  const pkg = await readPackageJson(projectPath);

  if (pkg) {
    const deps = {
      ...(pkg.dependencies as Record<string, string>),
      ...(pkg.devDependencies as Record<string, string>),
    };

    // 1순위: dependencies 확인
    if (deps["vitest"]) return "vitest";
    if (deps["jest"]) return "jest";
  }

  // 2순위: 설정 파일 확인
  if (findConfigFile(projectPath, VITEST_CONFIGS)) return "vitest";
  if (findConfigFile(projectPath, JEST_CONFIGS)) return "jest";

  return "unknown";
}

// 테스트 환경 전체 감지
export async function detectTestEnvironment(
  projectPath: string
): Promise<TestEnvironment> {
  const pkg = await readPackageJson(projectPath);
  const framework = await detectFramework(projectPath);

  const deps = pkg
    ? {
        ...(pkg.dependencies as Record<string, string>),
        ...(pkg.devDependencies as Record<string, string>),
      }
    : {};

  // Testing Library 확인
  const hasTestingLibrary = Boolean(deps["@testing-library/react"]);

  // 설정 파일 찾기
  const configFile =
    framework === "vitest"
      ? findConfigFile(projectPath, VITEST_CONFIGS)
      : framework === "jest"
        ? findConfigFile(projectPath, JEST_CONFIGS)
        : null;

  // 테스트 파일 패턴 (기본값)
  const testFilePattern = hasTestingLibrary ? "*.test.tsx" : "*.test.ts";

  return {
    framework,
    hasTestingLibrary,
    testFilePattern,
    configFile,
  };
}
