import { describe, it, expect, vi } from "vitest";
import { readSourceContext } from "../../utils/read-source-context.js";
import * as fs from "node:fs";

vi.mock("node:fs");

const SAMPLE_FILE = `import { describe } from "vitest";

describe("sample", () => {
  it("test 1", () => {
    const x = 1;
    expect(x).toBe(2);
  });

  it("test 2", () => {
    expect(true).toBe(true);
  });
});
`;

describe("readSourceContext", () => {
  describe("컨텍스트 읽기", () => {
    it("실패 라인 기준 전후 3줄을 반환한다", () => {
      vi.mocked(fs.readFileSync).mockReturnValue(SAMPLE_FILE);

      const result = readSourceContext("/src/test.ts", 6);

      expect(result).not.toBeNull();
      const lines = result!.split("\n");
      // line 6 기준 ±3 → line 3~9
      expect(lines).toHaveLength(7);
    });

    it("실패 라인에 > 마커를 표시한다", () => {
      vi.mocked(fs.readFileSync).mockReturnValue(SAMPLE_FILE);

      const result = readSourceContext("/src/test.ts", 6);

      const lines = result!.split("\n");
      const failLine = lines.find((l) => l.startsWith(">"));
      expect(failLine).toBeDefined();
      expect(failLine).toContain("expect(x).toBe(2)");
    });

    it("다른 라인에는 공백 마커를 표시한다", () => {
      vi.mocked(fs.readFileSync).mockReturnValue(SAMPLE_FILE);

      const result = readSourceContext("/src/test.ts", 6);

      const lines = result!.split("\n");
      const nonFailLines = lines.filter((l) => l.startsWith(" "));
      expect(nonFailLines.length).toBe(6);
    });

    it("라인 번호를 4자리로 패딩한다", () => {
      vi.mocked(fs.readFileSync).mockReturnValue(SAMPLE_FILE);

      const result = readSourceContext("/src/test.ts", 6);

      expect(result).toMatch(/>\s+6 \|/);
      expect(result).toMatch(/\s+3 \|/);
    });
  });

  describe("파일 시작/끝 경계 처리", () => {
    it("첫 번째 줄이 실패하면 시작 부분만 반환한다", () => {
      vi.mocked(fs.readFileSync).mockReturnValue(SAMPLE_FILE);

      const result = readSourceContext("/src/test.ts", 1);

      const lines = result!.split("\n");
      expect(lines[0]).toMatch(/^>/);
      // line 1 기준: start=0, end=4 → 4줄
      expect(lines).toHaveLength(4);
    });

    it("마지막 줄이 실패하면 끝 부분만 반환한다", () => {
      const totalLines = SAMPLE_FILE.split("\n").length;
      vi.mocked(fs.readFileSync).mockReturnValue(SAMPLE_FILE);

      const result = readSourceContext("/src/test.ts", totalLines);

      const lines = result!.split("\n");
      const markerLine = lines.find((l) => l.startsWith(">"));
      expect(markerLine).toBeDefined();
    });
  });

  describe("에러 처리", () => {
    it("파일을 읽을 수 없으면 null을 반환한다", () => {
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error("ENOENT");
      });

      const result = readSourceContext("/nonexistent/file.ts", 1);

      expect(result).toBeNull();
    });
  });
});
