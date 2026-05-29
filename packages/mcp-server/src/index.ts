#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  detectTestEnvironmentSchema,
  runDetectTestEnvironment,
} from "./tools/test/detect-test-environment.js";
import { analyzeCodeSchema, runAnalyzeCode } from "./tools/test/analyze-code.js";
import { runScaffoldTest, scaffoldTestSchema } from "./tools/test/scaffold-test.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  analyzeComponentSchema,
  runAnalyzeComponent,
} from "./tools/test/analyze-component.js";
import {
  findSimilarTestsSchema,
  runFindSimilarTests,
} from "./tools/test/find-similar-tests.js";
import {
  runSuggestA11yTests,
  suggestA11yTestsSchema,
} from "./tools/test/suggest-a11y-tests.js";
import {
  analyzeTestGapsSchema,
  runAnalyzeTestGaps,
} from "./tools/test/analyze-test-gaps.js";
import {
  runSuggestTestNames,
  suggestTestNamesSchema,
} from "./tools/test/suggest-test-names.js";
import { runTests, runTestsSchema } from "./tools/test/run-tests.js";
import { listHooksSchema, runListHooks } from "./tools/hooks/list-hooks.js";
import {
  getHookDetailsSchema,
  runGetHookDetails,
} from "./tools/hooks/get-hook-details.js";
import {
  listComponentsSchema,
  runListComponents,
} from "./tools/components/list-components.js";
import {
  getComponentDetailsSchema,
  runGetComponentDetails,
} from "./tools/components/get-component-details.js";
import {
  scaffoldHookSchema,
  runScaffoldHook,
} from "./tools/hooks/scaffold-hook.js";
import {
  validateHookSchema,
  runValidateHook,
} from "./tools/hooks/validate-hook.js";
import {
  registerHookSchema,
  runRegisterHook,
} from "./tools/hooks/register-hook.js";
import {
  reviewHookSchema,
  runReviewHook,
} from "./tools/hooks/review-hook.js";

const server = new McpServer({
  name: "frontend-toolkit",
  version: "0.0.1",
});

// Tool 1: 테스트 환경 감지
server.registerTool(
  "detect_test_environment",
  {
    description: "프로젝트의 테스트 프레임워크와 환경을 감지합니다",
    inputSchema: detectTestEnvironmentSchema,
  },
  runDetectTestEnvironment
);

// Tool 2: 코드 분석
server.registerTool(
  "analyze_code",
  {
    description:
      "TypeScript/JavaScript 파일을 분석하여 exports와 dependencies를 추출합니다",
    inputSchema: analyzeCodeSchema,
  },
  runAnalyzeCode
);

// Tool 3: 테스트 뼈대 정보 생성
server.registerTool(
  "scaffold_test",
  {
    description: "소스 파일 분석 후 테스트 작성에 필요한 정보를 제공합니다",
    inputSchema: scaffoldTestSchema,
  },
  runScaffoldTest
);

// Tool 4: React 컴포넌트 분석
server.registerTool(
  "analyze_component",
  {
    description:
      "React 컴포넌트를 분석하여 props, hooks, events 정보를 추출합니다",
    inputSchema: analyzeComponentSchema,
  },
  runAnalyzeComponent
);

// Tool 5: 유사 테스트 검색
server.registerTool(
  "find_similar_tests",
  {
    description:
      "프로젝트 내 유사한 테스트 파일을 검색하여 참고할 수 있도록 합니다",
    inputSchema: findSimilarTestsSchema,
  },
  runFindSimilarTests
);

// Tool 6: 접근성 테스트 제안
server.registerTool(
  "suggest_a11y_tests",
  {
    description:
      "React 컴포넌트의 접근성 테스트 포인트를 분석하고 jest-axe 사용법을 제안합니다",
    inputSchema: suggestA11yTestsSchema,
  },
  runSuggestA11yTests
);

// Tool 7: 테스트 갭 분석
server.registerTool(
  "analyze_test_gaps",
  {
    description:
      "소스 파일과 테스트 파일을 비교하여 테스트되지 않은 함수를 식별합니다",
    inputSchema: analyzeTestGapsSchema,
  },
  runAnalyzeTestGaps
);

// Tool 8: 테스트 이름 제안
server.registerTool(
  "suggest_test_names",
  {
    description:
      "소스 파일 분석 기반으로 describe/it 블록 구조와 테스트 이름을 제안합니다",
    inputSchema: suggestTestNamesSchema,
  },
  runSuggestTestNames
);

// Tool 9: 테스트 실행
server.registerTool(
  "run_tests",
  {
    description: "테스트를 실행하고 결과를 반환합니다 (vitest/jest 지원)",
    inputSchema: runTestsSchema,
  },
  runTests
);

// Tool 10: 훅 목록 조회
server.registerTool(
  "list_hooks",
  {
    description: "packages/hooks/src 하위의 훅 목록을 조회합니다",
    inputSchema: listHooksSchema,
  },
  runListHooks
);

// Tool 11: 훅 상세 정보
server.registerTool(
  "get_hook_details",
  {
    description:
      "특정 훅의 소스를 분석하여 파라미터, 의존성, 사용된 React 훅 목록을 반환합니다",
    inputSchema: getHookDetailsSchema,
  },
  runGetHookDetails
);

// Tool 12: 컴포넌트 목록 조회
server.registerTool(
  "list_components",
  {
    description: "packages/components/src 하위의 컴포넌트 목록을 조회합니다",
    inputSchema: listComponentsSchema,
  },
  runListComponents
);

// Tool 13: 컴포넌트 상세 정보
server.registerTool(
  "get_component_details",
  {
    description:
      "특정 컴포넌트의 소스를 분석하여 props, 의존성, 사용된 훅 목록을 반환합니다",
    inputSchema: getComponentDetailsSchema,
  },
  runGetComponentDetails
);

// Tool 14: 훅 스캐폴딩
server.registerTool(
  "scaffold_hook",
  {
    description: "새 훅 디렉토리 + 소스 파일 + 테스트 파일을 생성합니다",
    inputSchema: scaffoldHookSchema,
  },
  runScaffoldHook
);

// Tool 14: 훅 테스트 검증
server.registerTool(
  "validate_hook",
  {
    description: "훅의 테스트를 실행하고 결과를 반환합니다",
    inputSchema: validateHookSchema,
  },
  runValidateHook
);

// Tool 15: 훅 barrel export 등록
server.registerTool(
  "register_hook",
  {
    description: "훅을 barrel export(index.ts)에 등록합니다",
    inputSchema: registerHookSchema,
  },
  runRegisterHook
);

// Tool 16: 훅 코드 리뷰
server.registerTool(
  "review_hook",
  {
    description:
      "훅 코드를 구조적으로 검증합니다 (네이밍, deps 배열, 메모이제이션, 조건부 훅 호출)",
    inputSchema: reviewHookSchema,
  },
  runReviewHook
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("frontend-toolkit MCP server running");
}

main().catch(console.error);
