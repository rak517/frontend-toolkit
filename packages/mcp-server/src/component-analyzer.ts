import { parse } from "@typescript-eslint/typescript-estree";
import { readFile } from "node:fs/promises";
import type { ComponentAnalysis, EventInfo, HookInfo, PropInfo } from "./types.js";
import { basename } from "node:path";

const REACT_BUILTIN_HOOKS = [
  "useState",
  "useEffect",
  "useContext",
  "useReducer",
  "useCallback",
  "useMemo",
  "useRef",
  "useImperativeHandle",
  "useLayoutEffect",
  "useDebugValue",
  "useDeferredValue",
  "useTransition",
  "useId",
  "useSyncExternalStore",
  "useInsertionEffect",
];

async function parseFile(filePath: string) {
  const content = await readFile(filePath, "utf-8");
  return {
    ast: parse(content, { loc: true, jsx: true }),
    content,
  };
}

// Props 추출 (TypeScript interface/type에서)
function extractProps(content: string): PropInfo[] {
  const props: PropInfo[] = [];

  // interface Props { ... } 또는 type Props = { ... } 패턴 매칭
  const propsPattern =
    /(?:interface|type)\s+\w*Props\w*\s*(?:=\s*)?\{([^}]+)\}/g;
  const match = propsPattern.exec(content);

  if (match) {
    const propsBlock = match[1] ?? "";
    // 각 prop 라인 파싱: name?: type; 또는 name: type;
    const propLines = propsBlock.split(/[;\n]/).filter((line) => line.trim());

    for (const line of propLines) {
      const propMatch = line.trim().match(/^(\w+)(\?)?:\s*(.+?)$/);
      if (propMatch) {
        props.push({
          name: propMatch[1] ?? "",
          type: (propMatch[3] ?? "").trim(),
          required: !propMatch[2],
        });
      }
    }
  }

  return props;
}

// Hooks 추출
function extractHooks(ast: ReturnType<typeof parse>): HookInfo[] {
  const hooks: HookInfo[] = [];
  const seenHooks = new Set<string>();

  function traverse(node: unknown) {
    if (!node || typeof node !== "object") return;

    const n = node as Record<string, unknown>;

    // useXXX() 호출 찾기
    if (
      n.type === "CallExpression" &&
      n.callee &&
      (n.callee as Record<string, unknown>).type === "Identifier"
    ) {
      const callee = n.callee as Record<string, unknown>;
      const name = callee.name as string;

      if (name.startsWith("use") && !seenHooks.has(name)) {
        seenHooks.add(name);
        hooks.push({
          name,
          isCustom: !REACT_BUILTIN_HOOKS.includes(name),
        });
      }
    }

    // 재귀 탐색
    for (const value of Object.values(n)) {
      if (Array.isArray(value)) {
        value.forEach(traverse);
      } else if (value && typeof value === "object") {
        traverse(value);
      }
    }
  }

  traverse(ast);
  return hooks;
}

// Event Handlers 추출 (JSX에서 onXxx 속성 찾기)
function extractEvents(ast: ReturnType<typeof parse>): EventInfo[] {
  const events: EventInfo[] = [];
  const seenEvents = new Set<string>();

  function traverse(node: unknown) {
    if (!node || typeof node !== "object") return;

    const n = node as Record<string, unknown>;

    // JSX 속성에서 onXxx 찾기
    if (n.type === "JSXAttribute" && n.name) {
      const attrName = n.name as Record<string, unknown>;
      if (attrName.type === "JSXIdentifier") {
        const name = attrName.name as string;

        if (name.startsWith("on") && !seenEvents.has(name)) {
          seenEvents.add(name);

          // 핸들러 이름 추출
          let handlerName = "handler";
          if (
            n.value &&
            (n.value as Record<string, unknown>).type ===
              "JSXExpressionContainer"
          ) {
            const expr = (n.value as Record<string, unknown>)
              .expression as Record<string, unknown>;
            if (expr && expr.type === "Identifier") {
              handlerName = expr.name as string;
            }
          }

          events.push({ name, handlerName });
        }
      }
    }

    // 재귀 탐색
    for (const value of Object.values(n)) {
      if (Array.isArray(value)) {
        value.forEach(traverse);
      } else if (value && typeof value === "object") {
        traverse(value);
      }
    }
  }

  traverse(ast);
  return events;
}

// 컴포넌트 이름 추출
function extractComponentName(content: string, fileName: string): string {
  // export default function ComponentName
  const defaultFuncMatch = content.match(/export\s+default\s+function\s+(\w+)/);
  if (defaultFuncMatch?.[1]) return defaultFuncMatch[1];

  // export function ComponentName
  const namedFuncMatch = content.match(/export\s+function\s+(\w+)/);
  if (namedFuncMatch?.[1]) return namedFuncMatch[1];

  // const ComponentName = () => 또는 const ComponentName: FC =
  const constMatch = content.match(/(?:export\s+)?const\s+(\w+)\s*[=:]/);
  if (constMatch?.[1]) return constMatch[1];

  // 파일명에서 추출 (Button.tsx -> Button)
  return fileName.replace(/\.(tsx|jsx|ts|js)$/, "");
}

// children prop 사용 여부
function hasChildrenProp(content: string): boolean {
  return (
    content.includes("children") ||
    content.includes("PropsWithChildren") ||
    content.includes("{children}")
  );
}

// forwardRef 사용 여부
function isForwardRef(content: string): boolean {
  return content.includes("forwardRef");
}

// memo 사용 여부
function isMemo(content: string): boolean {
  return content.includes("memo(") || content.includes("React.memo");
}

// 메인 분석 함수
export async function analyzeComponent(
  filePath: string
): Promise<ComponentAnalysis> {
  const { ast, content } = await parseFile(filePath);
  const fileName = basename(filePath);

  return {
    componentName: extractComponentName(content, fileName),
    props: extractProps(content),
    hooks: extractHooks(ast),
    events: extractEvents(ast),
    hasChildren: hasChildrenProp(content),
    isForwardRef: isForwardRef(content),
    isMemo: isMemo(content),
  };
}
