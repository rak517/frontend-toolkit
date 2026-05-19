export const VITEST_CONFIGS = [
  "vitest.config.ts",
  "vitest.config.js",
  "vitest.config.mts",
];

export const JEST_CONFIGS = [
  "jest.config.js",
  "jest.config.ts",
  "jest.config.json",
];

export const NPX_BIN = process.platform === "win32" ? "npx.cmd" : "npx";

// eslint no-control-regex 우회: \x1b(ESC) 를 String.fromCharCode로 생성
const ESC = String.fromCharCode(27);
export const ANSI_REGEX = new RegExp(`${ESC}\\[[0-9;]*m`, "g");
