import { describe, it, expect } from "vitest";
import {
  parseStackTrace,
  extractLocation,
} from "../../utils/parse-stack-trace.js";

describe("parseStackTrace", () => {
  describe("스택 프레임 필터링", () => {
    it("'at ' 으로 시작하는 라인만 추출한다", () => {
      const message = `AssertionError: expected true to be false
    at Object.<anonymous> (/src/test.ts:10:5)
some random line
    at run (/src/runner.ts:20:3)`;

      const result = parseStackTrace(message);

      expect(result).toHaveLength(2);
      expect(result[0]).toContain("/src/test.ts:10:5");
      expect(result[1]).toContain("/src/runner.ts:20:3");
    });

    it("node_modules 경로를 제외한다", () => {
      const message = `Error: fail
    at Object.<anonymous> (/src/test.ts:10:5)
    at Module._compile (node_modules/vitest/dist/index.js:1:1)
    at run (/src/runner.ts:20:3)`;

      const result = parseStackTrace(message);

      expect(result).toHaveLength(2);
      expect(result.some((l) => l.includes("node_modules"))).toBe(false);
    });

    it("node:internal 경로를 제외한다", () => {
      const message = `Error: fail
    at Object.<anonymous> (/src/test.ts:10:5)
    at Module._compile (node:internal/modules/cjs/loader:1218:14)`;

      const result = parseStackTrace(message);

      expect(result).toHaveLength(1);
      expect(result[0]).toContain("/src/test.ts");
    });
  });

  describe("ANSI 이스케이프 코드 처리", () => {
    it("ANSI 코드가 포함된 스택을 정상 파싱한다", () => {
      const ESC = String.fromCharCode(27);
      const message = `${ESC}[31mError${ESC}[0m
    at Object.<anonymous> (${ESC}[1m/src/test.ts${ESC}[0m:10:5)`;

      const result = parseStackTrace(message);

      expect(result).toHaveLength(1);
      expect(result[0]).not.toContain(String.fromCharCode(27));
    });
  });

  describe("엣지 케이스", () => {
    it("스택 트레이스가 없으면 빈 배열을 반환한다", () => {
      const message = "TypeError: Cannot read property 'foo' of undefined";

      const result = parseStackTrace(message);

      expect(result).toEqual([]);
    });

    it("빈 문자열이면 빈 배열을 반환한다", () => {
      expect(parseStackTrace("")).toEqual([]);
    });

    it("모든 프레임이 node_modules이면 빈 배열을 반환한다", () => {
      const message = `Error
    at Module._compile (node_modules/vitest/dist/index.js:1:1)
    at node:internal/modules/cjs/loader:1218:14`;

      const result = parseStackTrace(message);

      expect(result).toEqual([]);
    });
  });
});

describe("extractLocation", () => {
  describe("라인/컬럼 추출", () => {
    it("file:line:column 형식에서 line과 column을 추출한다", () => {
      const stack = ["    at Object.<anonymous> (/src/test.ts:10:5)"];

      const result = extractLocation(stack);

      expect(result).toEqual({ line: 10, column: 5 });
    });

    it("file:line 형식에서 line만 추출한다", () => {
      const stack = ["    at Object.<anonymous> (/src/test.ts:42)"];

      const result = extractLocation(stack);

      expect(result).toEqual({ line: 42 });
    });

    it("첫 번째 프레임만 사용한다", () => {
      const stack = [
        "    at first (/src/a.ts:10:5)",
        "    at second (/src/b.ts:20:3)",
      ];

      const result = extractLocation(stack);

      expect(result).toEqual({ line: 10, column: 5 });
    });
  });

  describe("엣지 케이스", () => {
    it("빈 배열이면 null을 반환한다", () => {
      expect(extractLocation([])).toBeNull();
    });

    it("eval 프레임이면 null을 반환한다", () => {
      const stack = ["    at eval (eval at <anonymous>, <anonymous>:1:1)"];

      expect(extractLocation(stack)).toBeNull();
    });

    it("eval 프레임을 건너뛰고 다음 프레임에서 추출한다", () => {
      const stack = [
        "    at eval (eval at <anonymous>, <anonymous>:1:1)",
        "    at Object.<anonymous> (/src/test.ts:15:5)",
      ];

      const result = extractLocation(stack);

      expect(result).toEqual({ line: 15, column: 5 });
    });

    it("매칭되지 않는 형식이면 null을 반환한다", () => {
      const stack = ["    at Object.<anonymous> (unknown)"];

      expect(extractLocation(stack)).toBeNull();
    });
  });
});
