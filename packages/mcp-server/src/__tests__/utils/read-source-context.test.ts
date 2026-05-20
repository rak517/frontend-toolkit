import { describe, it, expect, afterAll } from "vitest";
import { readSourceContext } from "../../utils/read-source-context.js";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const TEMP_DIR = join(tmpdir(), "read-source-context-test");
const TEMP_FILE = join(TEMP_DIR, "sample.ts");

const SAMPLE_CONTENT = [
  'import { describe } from "vitest";',
  "",
  'describe("sample", () => {',
  '  it("test 1", () => {',
  "    const x = 1;",
  "    expect(x).toBe(2);",
  "  });",
  "",
  '  it("test 2", () => {',
  "    expect(true).toBe(true);",
  "  });",
  "});",
].join("\n");

mkdirSync(TEMP_DIR, { recursive: true });
writeFileSync(TEMP_FILE, SAMPLE_CONTENT);

afterAll(() => {
  rmSync(TEMP_DIR, { recursive: true, force: true });
});

describe("readSourceContext", () => {
  describe("컨텍스트 읽기", () => {
    it("실패 라인 기준 전후 3줄을 반환한다", () => {
      const result = readSourceContext(TEMP_FILE, 6);

      expect(result).not.toBeNull();
      const lines = result!.split("\n");
      // line 6 기준 ±3 → line 3~9
      expect(lines).toHaveLength(7);
    });

    it("실패 라인에 > 마커를 표시한다", () => {
      const result = readSourceContext(TEMP_FILE, 6);

      const lines = result!.split("\n");
      const failLine = lines.find((l) => l.startsWith(">"));
      expect(failLine).toBeDefined();
      expect(failLine).toContain("expect(x).toBe(2)");
    });

    it("다른 라인에는 공백 마커를 표시한다", () => {
      const result = readSourceContext(TEMP_FILE, 6);

      const lines = result!.split("\n");
      const nonFailLines = lines.filter((l) => l.startsWith(" "));
      expect(nonFailLines.length).toBe(6);
    });

    it("라인 번호를 4자리로 패딩한다", () => {
      const result = readSourceContext(TEMP_FILE, 6);

      expect(result).toMatch(/>\s+6 \|/);
      expect(result).toMatch(/\s+3 \|/);
    });
  });

  describe("파일 시작/끝 경계 처리", () => {
    it("첫 번째 줄이 실패하면 시작 부분만 반환한다", () => {
      const result = readSourceContext(TEMP_FILE, 1);

      const lines = result!.split("\n");
      expect(lines[0]).toMatch(/^>/);
      // line 1 기준: start=0, end=4 → 4줄
      expect(lines).toHaveLength(4);
    });

    it("마지막 줄이 실패하면 끝 부분만 반환한다", () => {
      const totalLines = SAMPLE_CONTENT.split("\n").length;

      const result = readSourceContext(TEMP_FILE, totalLines);

      const lines = result!.split("\n");
      const markerLine = lines.find((l) => l.startsWith(">"));
      expect(markerLine).toBeDefined();
    });
  });

  describe("에러 처리", () => {
    it("파일을 읽을 수 없으면 null을 반환한다", () => {
      const result = readSourceContext("/nonexistent/file.ts", 1);

      expect(result).toBeNull();
    });
  });
});
