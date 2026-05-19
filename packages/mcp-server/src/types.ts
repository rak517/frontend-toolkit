// 테스트 프레임워크
export type TestFramework = "vitest" | "jest" | "unknown";

// 테스트 환경 정보
export interface TestEnvironment {
  framework: TestFramework;
  hasTestingLibrary: boolean;
  testFilePattern: string;
  configFile: string | null;
}

// 파라미터 정보
export interface ParamInfo {
  name: string;
  type: string;
}

// Export 정보
export interface ExportInfo {
  name: string;
  type: "function" | "component" | "hook" | "const";
  params: ParamInfo[];
  returnType: string;
}

// 코드 분석 결과
export interface CodeAnalysis {
  fileName: string;
  fileExtension: string;
  exports: ExportInfo[];
  dependencies: string[];
}

// Props 정보
export interface PropInfo {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
}

// Hook 정보
export interface HookInfo {
  name: string;
  isCustom: boolean; // use로 시작하지만 React 내장 아닌 경우
}

// Event Handler 정보
export interface EventInfo {
  name: string;
  handlerName: string;
}

// 컴포넌트 분석 결과
export interface ComponentAnalysis {
  componentName: string;
  props: PropInfo[];
  hooks: HookInfo[];
  events: EventInfo[];
  hasChildren: boolean;
  isForwardRef: boolean;
  isMemo: boolean;
}

// 유사 테스트 검색 결과
export interface SimilarTest {
  filePath: string;
  similarity: "high" | "medium" | "low";
  reason: string;
}

// MCP Tool 응답 타입
export interface McpToolResponse {
  [key: string]: unknown;
  content: Array<{
    type: "text";
    text: string;
  }>;
}

// 접근성 제안 항목
export interface A11ySuggestion {
  type: "aria" | "keyboard" | "contrast" | "focus";
  element?: string;
  suggestion: string;
}

// 접근성 분석 결과
export interface A11yAnalysis {
  hasIssues: boolean;
  suggestions: A11ySuggestion[];
  jestAxeExample: string;
}

// 테스트 갭 분석 결과
export interface TestGapAnalysis {
  sourceFile: string;
  testFile: string | null;
  tested: string[];
  untested: string[];
}

// 테스트 이름 제안 결과
export interface TestNameSuggestion {
  describe: string;
  tests: string[];
}
