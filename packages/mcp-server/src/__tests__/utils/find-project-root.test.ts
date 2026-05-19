import { describe, it, expect } from "vitest";
import { findProjectRoot } from "../../utils/find-project-root.js";
import { resolve, join } from "node:path";
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";

describe("findProjectRoot", () => {
  describe("기존 모노레포에서", () => {
    it("현재 디렉토리에서 모노레포 루트를 찾는다", () => {
      const result = findProjectRoot(process.cwd());
      expect(result).toBe(process.cwd());
    });

    it("하위 디렉토리에서 모노레포 루트를 찾는다", () => {
      const subdir = resolve(process.cwd(), "packages/mcp-server/src");
      const result = findProjectRoot(subdir);
      expect(result).toBe(process.cwd());
    });

    it("깊은 하위 디렉토리에서 모노레포 루트를 찾는다", () => {
      const deepDir = resolve(process.cwd(), "packages/mcp-server/src/__tests__/tools");
      const result = findProjectRoot(deepDir);
      expect(result).toBe(process.cwd());
    });

    it("파일 경로에서 모노레포 루트를 찾는다", () => {
      const filePath = resolve(process.cwd(), "packages/mcp-server/src/index.ts");
      const result = findProjectRoot(filePath);
      expect(result).toBe(process.cwd());
    });
  });

  describe("임시 디렉토리에서", () => {
    it("pnpm-workspace.yaml이 있으면 루트를 찾는다", () => {
      const tempDir = mkdtempSync(join(tmpdir(), "test-"));
      writeFileSync(join(tempDir, "pnpm-workspace.yaml"), "packages:\n  - 'packages/*'");
      mkdirSync(join(tempDir, "src"));

      const result = findProjectRoot(join(tempDir, "src"));
      expect(result).toBe(tempDir);

      rmSync(tempDir, { recursive: true });
    });

    it("turbo.json이 있으면 루트를 찾는다", () => {
      const tempDir = mkdtempSync(join(tmpdir(), "test-"));
      writeFileSync(join(tempDir, "turbo.json"), "{}");
      mkdirSync(join(tempDir, "src"));

      const result = findProjectRoot(join(tempDir, "src"));
      expect(result).toBe(tempDir);

      rmSync(tempDir, { recursive: true });
    });

    it("모노레포 마커가 없으면 null을 반환한다", () => {
      const tempDir = mkdtempSync(join(tmpdir(), "test-"));
      mkdirSync(join(tempDir, "src"));

      const result = findProjectRoot(join(tempDir, "src"));
      expect(result).toBeNull();

      rmSync(tempDir, { recursive: true });
    });
  });

  describe("엣지 케이스", () => {
    it("존재하지 않는 경로에서 null을 반환한다", () => {
      const result = findProjectRoot("/nonexistent/path/that/does/not/exist");
      expect(result).toBeNull();
    });

    it("마커 없는 루트 디렉토리에서 null을 반환한다", () => {
      const result = findProjectRoot("/tmp");
      expect(result).toBeNull();
    });

    it("존재하지 않는 파일 경로를 처리한다", () => {
      const result = findProjectRoot(
        resolve(process.cwd(), "nonexistent-file.ts")
      );
      expect(result).toBe(process.cwd());
    });
  });
});
