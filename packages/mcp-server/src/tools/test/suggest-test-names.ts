import { z } from "zod";
import { analyzeCode } from "../../analyzer.js";
import { analyzeComponent } from "../../component-analyzer.js";
import { absolutePathSchema } from "../../schemas.js";
import type { McpToolResponse, TestNameSuggestion } from "../../types.js";

export const suggestTestNamesSchema = z.object({
  filePath: absolutePathSchema.describe("분석할 소스 파일의 절대 경로"),
});

export type SuggestTestNamesInput = z.infer<typeof suggestTestNamesSchema>;

// 함수용 테스트 이름 생성
function generateFunctionTests(_name: string, params: string[]): string[] {
  const tests: string[] = [
    `should return expected result`,
    `should handle empty input`,
  ];

  if (params.length > 0) {
    tests.push(`should throw error when ${params[0]} is invalid`);
  }

  return tests;
}

// 컴포넌트용 테스트 이름 생성
function generateComponentTests(
  _name: string,
  props: string[],
  events: string[],
  hooks: string[]
): string[] {
  const tests: string[] = [`should render correctly`];

  // props 기반 테스트
  for (const prop of props.slice(0, 3)) {
    tests.push(`should render with ${prop} prop`);
  }

  // 이벤트 기반 테스트
  for (const event of events.slice(0, 2)) {
    const eventName = event.replace(/^on/, "").toLowerCase();
    tests.push(`should handle ${eventName} event`);
  }

  // 커스텀 훅 기반 테스트
  const customHooks = hooks.filter(
    (h) =>
      !["useState", "useEffect", "useRef", "useMemo", "useCallback"].includes(h)
  );
  if (customHooks.length > 0) {
    tests.push(`should work with ${customHooks[0]}`);
  }

  return tests;
}

async function suggestNames(filePath: string): Promise<TestNameSuggestion[]> {
  const suggestions: TestNameSuggestion[] = [];
  const addedNames = new Set<string>(); // 중복 방지용

  // 파일 확장자로 컴포넌트 여부 판단
  const isComponent = filePath.endsWith(".tsx") || filePath.endsWith(".jsx");

  if (isComponent) {
    try {
      const analysis = await analyzeComponent(filePath);
      const propNames = analysis.props.map((p) => p.name);
      const eventNames = analysis.events.map((e) => e.name);
      const hookNames = analysis.hooks.map((h) => h.name);

      suggestions.push({
        describe: analysis.componentName,
        tests: generateComponentTests(
          analysis.componentName,
          propNames,
          eventNames,
          hookNames
        ),
      });
      addedNames.add(analysis.componentName); // 추가된 이름 기록
    } catch {
      // 컴포넌트 분석 실패 시 기본 코드 분석으로 폴백
    }
  }

  // 일반 코드 분석
  const codeAnalysis = await analyzeCode(filePath);

  for (const exp of codeAnalysis.exports) {
    // 이미 추가된 이름은 건너뛰기 (중복 방지)
    if (addedNames.has(exp.name)) {
      continue;
    }

    if (exp.type === "function") {
      const paramNames = exp.params.map((p) => p.name);
      suggestions.push({
        describe: exp.name,
        tests: generateFunctionTests(exp.name, paramNames),
      });
      addedNames.add(exp.name);
    }
  }

  return suggestions;
}

export async function runSuggestTestNames(
  input: SuggestTestNamesInput
): Promise<McpToolResponse> {
  const { filePath } = input;
  const result = await suggestNames(filePath);

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
