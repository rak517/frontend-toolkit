import { z } from "zod";
import { readFile } from "node:fs/promises";
import { absolutePathSchema } from "../../schemas.js";
import type { A11yAnalysis, A11ySuggestion, McpToolResponse } from "../../types.js";

export const suggestA11yTestsSchema = z.object({
  filePath: absolutePathSchema.describe(
    "분석할 React 컴포넌트 파일의 절대 경로"
  ),
});

export type SuggestA11yTestsInput = z.infer<typeof suggestA11yTestsSchema>;

// JSX 시작 태그 추출 (중괄호 깊이 추적하여 정확한 태그 경계 파악)
function extractJsxOpenTags(content: string): string[] {
  const tags: string[] = [];
  let i = 0;

  while (i < content.length) {
    // 시작 태그 찾기 (<로 시작하고 </가 아닌 것)
    if (content[i] === "<" && content[i + 1] !== "/") {
      let depth = 0;
      let j = i + 1;

      while (j < content.length) {
        if (content[j] === "{") depth++;
        else if (content[j] === "}") depth--;
        else if (content[j] === ">" && depth === 0) {
          tags.push(content.slice(i, j + 1));
          break;
        }
        j++;
      }
      i = j + 1;
    } else {
      i++;
    }
  }

  return tags;
}

// onClick이 있지만 키보드 핸들러가 없는 태그 검사
function checkClickWithoutKeyboard(content: string): boolean {
  const tags = extractJsxOpenTags(content);

  for (const tag of tags) {
    const hasOnClick = /onClick/.test(tag);
    const hasKeyboardHandler = /onKeyDown|onKeyPress|onKeyUp/.test(tag);

    if (hasOnClick && !hasKeyboardHandler) {
      return true;
    }
  }

  return false;
}

// 접근성 검사 규칙 (정규식 기반)
const A11Y_RULES = {
  // img 태그에 alt 속성 필요
  imgWithoutAlt: {
    pattern: /<img(?![^>]*alt=)[^>]*>/g,
    type: "aria" as const,
    element: "img",
    suggestion: "img 태그에 alt 속성 추가 필요",
  },
  // button에 텍스트 또는 aria-label 필요
  // aria-label/aria-labelledby가 없고 내용이 비어있는 버튼만 매칭
  buttonWithoutLabel: {
    pattern:
      /<button(?![^>]*aria-label(?:ledby)?=)[^>]*>[\s]*<\/button>|<button(?![^>]*aria-label(?:ledby)?=)[^>]*\/>/g,
    type: "aria" as const,
    element: "button",
    suggestion: "빈 button에 aria-label 또는 텍스트 콘텐츠 추가 필요",
  },
  // div/span에 onClick이 있지만 role/tabIndex가 없는 경우
  // role 또는 tabIndex가 이미 있으면 제외
  divClickable: {
    pattern: /<(?:div|span)(?![^>]*(?:role=|tabIndex=))[^>]*onClick[^>]*>/g,
    type: "aria" as const,
    element: "div/span",
    suggestion: "클릭 가능한 div/span에 role='button'과 tabIndex={0} 추가 필요",
  },
  // input에 label 연결 필요
  // aria-label, aria-labelledby, id가 모두 없는 input만 매칭
  inputWithoutLabel: {
    pattern: /<input(?![^>]*(?:aria-label(?:ledby)?=|id=))[^>]*>/g,
    type: "aria" as const,
    element: "input",
    suggestion: "input에 aria-label 또는 연결된 label 추가 필요",
  },
};

// jest-axe 예시 코드
const JEST_AXE_EXAMPLE = `import { axe, toHaveNoViolations } from 'jest-axe';

 expect.extend(toHaveNoViolations);

 it('should have no accessibility violations', async () => {
   const { container } = render(<Component />);
   const results = await axe(container);
   expect(results).toHaveNoViolations();
 });`;

async function analyzeA11y(filePath: string): Promise<A11yAnalysis> {
  const content = await readFile(filePath, "utf-8");
  const suggestions: A11ySuggestion[] = [];

  // 1. clickWithoutKeyboard 검사 (별도 함수로 처리)
  if (checkClickWithoutKeyboard(content)) {
    suggestions.push({
      type: "keyboard",
      suggestion:
        "onClick이 있는 요소에 키보드 이벤트 핸들러(onKeyDown) 추가 필요",
    });
  }

  // 2. 나머지 규칙 검사 (정규식 기반)
  for (const [, rule] of Object.entries(A11Y_RULES)) {
    const matches = content.match(rule.pattern);
    if (matches && matches.length > 0) {
      suggestions.push({
        type: rule.type,
        element: "element" in rule ? rule.element : undefined,
        suggestion: rule.suggestion,
      });
    }
  }

  return {
    hasIssues: suggestions.length > 0,
    suggestions,
    jestAxeExample: JEST_AXE_EXAMPLE,
  };
}

export async function runSuggestA11yTests(
  input: SuggestA11yTestsInput
): Promise<McpToolResponse> {
  const { filePath } = input;

  try {
    const result = await analyzeA11y(filePath);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류";

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              error: true,
              filePath,
              message: `파일 분석 실패: ${errorMessage}`,
            },
            null,
            2
          ),
        },
      ],
    };
  }
}
