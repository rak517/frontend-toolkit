import { z } from "zod";
import { existsSync, readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { absolutePathSchema } from "../../schemas.js";
import type { McpToolResponse } from "../../types.js";
import { errorResponse } from "../../utils/error-response.js";
import { analyzeCode } from "../../analyzer.js";

export const getComponentDetailsSchema = z.object({
  name: z
    .string()
    .min(1, "컴포넌트 이름은 필수입니다")
    .refine((s) => !s.includes("/") && !s.includes(".."), {
      message: "컴포넌트 이름에 경로 문자를 포함할 수 없습니다",
    })
    .describe("컴포넌트 이름 (예: Button)"),
  componentsDir: absolutePathSchema.describe(
    "컴포넌트 패키지의 src 디렉토리 절대 경로 (예: /Users/.../packages/components/src)"
  ),
});

export type GetComponentDetailsInput = z.infer<
  typeof getComponentDetailsSchema
>;

/** 소스에서 props 인터페이스/타입의 프로퍼티를 추출한다 */
function extractProps(
  source: string,
  componentName: string
): Array<{ name: string; type: string; required: boolean }> {
  const props: Array<{ name: string; type: string; required: boolean }> = [];

  // {ComponentName}Props 패턴의 interface/type 찾기
  const propsName = `${componentName}Props`;
  const interfaceRegex = new RegExp(
    `(?:interface|type)\\s+${propsName}[^{]*\\{([^}]*)\\}`,
    "s"
  );
  const match = interfaceRegex.exec(source);
  if (!match?.[1]) return props;

  const body = match[1];
  // 각 프로퍼티 라인 파싱: name?: type; 또는 name: type;
  const propRegex = /(\w+)(\?)?:\s*([^;\n]+)/g;
  let propMatch;
  while ((propMatch = propRegex.exec(body)) !== null) {
    if (propMatch[1] && propMatch[3]) {
      props.push({
        name: propMatch[1],
        type: propMatch[3].trim(),
        required: !propMatch[2],
      });
    }
  }

  return props;
}

/** 소스에서 React 훅 호출을 추출한다 */
function extractReactHooks(source: string): string[] {
  const hookCalls = new Set<string>();
  const regex = /\b(use[A-Z]\w*)\s*\(/g;
  let match;
  while ((match = regex.exec(source)) !== null) {
    if (match[1]) hookCalls.add(match[1]);
  }
  return [...hookCalls];
}

export async function runGetComponentDetails(
  input: GetComponentDetailsInput
): Promise<McpToolResponse> {
  const { name, componentsDir } = input;

  const componentDir = join(componentsDir, name);
  if (!existsSync(componentDir)) {
    return errorResponse(
      "COMPONENT_NOT_FOUND",
      `컴포넌트를 찾을 수 없습니다: ${name}`
    );
  }

  // 메인 소스 파일 찾기 (우선순위: {name}.tsx > {name}.ts > index.tsx > index.ts)
  const candidates = [`${name}.tsx`, `${name}.ts`, "index.tsx", "index.ts"];
  let mainFile: string | null = null;

  for (const candidate of candidates) {
    const candidatePath = join(componentDir, candidate);
    if (existsSync(candidatePath)) {
      mainFile = candidatePath;
      break;
    }
  }

  if (!mainFile) {
    return errorResponse(
      "COMPONENT_NOT_FOUND",
      `컴포넌트 소스 파일을 찾을 수 없습니다: ${name}`
    );
  }

  try {
    const source = await readFile(mainFile, "utf-8");
    const analysis = await analyzeCode(mainFile);
    const props = extractProps(source, name);
    const hooks = extractReactHooks(source);

    // 테스트 파일 존재 여부 확인
    const files = readdirSync(componentDir);
    const hasTests = files.some((f) => f.includes(".test."));

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            name,
            filePath: mainFile,
            props,
            dependencies: analysis.dependencies,
            hooks,
            hasTests,
          }),
        },
      ],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return errorResponse(
      "PARSE_ERROR",
      `컴포넌트 소스를 분석할 수 없습니다: ${message}`
    );
  }
}
