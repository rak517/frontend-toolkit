import { readFile } from "node:fs/promises";
import { basename, extname } from "node:path";
import { parse, AST_NODE_TYPES } from "@typescript-eslint/typescript-estree";
import type { CodeAnalysis, ExportInfo } from "./types.js";

async function parseFile(filePath: string) {
  const content = await readFile(filePath, "utf-8");
  return parse(content, {
    loc: true,
    jsx: true,
  });
}

function extractExports(ast: ReturnType<typeof parse>): ExportInfo[] {
  const exports: ExportInfo[] = [];

  for (const node of ast.body) {
    // export function foo() {}
    if (
      node.type === AST_NODE_TYPES.ExportNamedDeclaration &&
      node.declaration?.type === AST_NODE_TYPES.FunctionDeclaration
    ) {
      const func = node.declaration;
      exports.push({
        name: func.id?.name ?? "anonymous",
        type: "function",
        params: func.params.map((p) => ({
          name: p.type === AST_NODE_TYPES.Identifier ? p.name : "param",
          type: "unknown",
        })),
        returnType: "unknown",
      });
    }

    // export const foo = () => {}
    if (
      node.type === AST_NODE_TYPES.ExportNamedDeclaration &&
      node.declaration?.type === AST_NODE_TYPES.VariableDeclaration
    ) {
      for (const decl of node.declaration.declarations) {
        if (decl.id.type === AST_NODE_TYPES.Identifier) {
          const isArrowFunc = decl.init?.type === AST_NODE_TYPES.ArrowFunctionExpression;
          exports.push({
            name: decl.id.name,
            type: isArrowFunc ? "function" : "const",
            params: [],
            returnType: "unknown",
          });
        }
      }
    }

    // export default function
    if (
      node.type === AST_NODE_TYPES.ExportDefaultDeclaration &&
      node.declaration.type === AST_NODE_TYPES.FunctionDeclaration
    ) {
      exports.push({
        name: node.declaration.id?.name ?? "default",
        type: "function",
        params: [],
        returnType: "unknown",
      });
    }
  }

  return exports;
}

function extractDependencies(ast: ReturnType<typeof parse>): string[] {
  const deps: string[] = [];

  for (const node of ast.body) {
    if (node.type === AST_NODE_TYPES.ImportDeclaration) {
      deps.push(String(node.source.value));
    }
  }

  return deps;
}

export async function analyzeCode(filePath: string): Promise<CodeAnalysis> {
  const ast = await parseFile(filePath);
  const fileName = basename(filePath);
  const fileExtension = extname(fileName).slice(1);

  return {
    fileName,
    fileExtension,
    exports: extractExports(ast),
    dependencies: extractDependencies(ast),
  };
}
