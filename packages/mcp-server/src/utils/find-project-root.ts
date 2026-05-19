import { existsSync, statSync } from "node:fs";
import { dirname, join, parse } from "node:path";

const MONOREPO_MARKERS = ["pnpm-workspace.yaml", "turbo.json"];

export function findProjectRoot(startPath: string): string | null {
  let dir = startPath;

  try {
    if (!statSync(dir).isDirectory()) {
      dir = dirname(startPath);
    }
  } catch {
    dir = dirname(startPath);
  }

  const root = parse(dir).root;
  while (dir !== root) {
    for (const marker of MONOREPO_MARKERS) {
      if (existsSync(join(dir, marker))) {
        return dir;
      }
    }
    dir = dirname(dir);
  }

  return null;
}
