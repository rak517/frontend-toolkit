import { describe, it, expect, afterEach } from "vitest";
import {
  existsSync,
  mkdirSync,
  rmSync,
  writeFileSync,
  readFileSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { runScaffoldHook } from "../../tools/hooks/scaffold-hook.js";
import { runValidateHook } from "../../tools/hooks/validate-hook.js";
import { runRegisterHook } from "../../tools/hooks/register-hook.js";
import { runReviewHook } from "../../tools/hooks/review-hook.js";
import { runListHooks } from "../../tools/hooks/list-hooks.js";
import { runGetHookDetails } from "../../tools/hooks/get-hook-details.js";

// ── helpers ──
function parseResult(result: { content: Array<{ text: string }> }) {
  return JSON.parse(result.content[0]!.text);
}

const REAL_HOOKS_DIR = join(process.cwd(), "packages/hooks/src");

// ═══════════════════════════════════════════════════════════
// 시나리오 1: scaffold → validate → register 파이프라인
// ═══════════════════════════════════════════════════════════
describe("시나리오 1: scaffold → validate → register", () => {
  const hookName = "useIntTestPipeline";
  const registerDir = join(tmpdir(), `integration-register-${Date.now()}`);

  afterEach(() => {
    rmSync(join(REAL_HOOKS_DIR, hookName), { recursive: true, force: true });
    rmSync(registerDir, { recursive: true, force: true });
  });

  it("scaffold 출력을 validate가 검증하고 register가 등록한다", async () => {
    // Step 1: scaffold — 실제 hooks 경로에 훅 생성 (validate가 vitest를 spawn할 수 있도록)
    const scaffoldResult = runScaffoldHook({
      hookName,
      hooksDir: REAL_HOOKS_DIR,
    });
    const scaffold = parseResult(scaffoldResult) as {
      created: { hookFile: string; testFile: string; indexFile: string };
    };
    expect(scaffold.created).toBeDefined();
    expect(existsSync(scaffold.created.hookFile)).toBe(true);
    expect(existsSync(scaffold.created.testFile)).toBe(true);
    expect(existsSync(scaffold.created.indexFile)).toBe(true);

    // Step 2: validate — scaffold가 생성한 테스트를 실제로 실행
    const validateResult = await runValidateHook({
      hookName,
      hooksDir: REAL_HOOKS_DIR,
    });
    const validate = parseResult(validateResult) as {
      success: boolean;
      hookName: string;
      summary: { total: number; passed: number };
    };
    expect(validate.success).toBe(true);
    expect(validate.hookName).toBe(hookName);
    expect(validate.summary.total).toBeGreaterThan(0);
    expect(validate.summary.passed).toBe(validate.summary.total);

    // Step 3: register — tmpdir에서 barrel export 등록 (실제 index.ts 보호)
    mkdirSync(registerDir, { recursive: true });
    mkdirSync(join(registerDir, hookName), { recursive: true });
    writeFileSync(
      join(registerDir, "index.ts"),
      "export * from './useCalendar';\n"
    );

    const registerResult = runRegisterHook({
      hookName,
      hooksDir: registerDir,
    });
    const register = parseResult(registerResult) as { registered: boolean };
    expect(register.registered).toBe(true);

    // Step 4: index.ts에 export 라인 존재 확인
    const indexContent = readFileSync(join(registerDir, "index.ts"), "utf-8");
    expect(indexContent).toContain(`export * from './${hookName}'`);
  }, 30_000);
});

// ═══════════════════════════════════════════════════════════
// 시나리오 2: scaffold → review 파이프라인
// ═══════════════════════════════════════════════════════════
describe("시나리오 2: scaffold → review", () => {
  const hookName = "useIntTestReview";
  const reviewDir = join(tmpdir(), `integration-review-${Date.now()}`);

  afterEach(() => {
    rmSync(reviewDir, { recursive: true, force: true });
  });

  it("scaffold 템플릿이 review에서 에러 0개를 반환한다", async () => {
    mkdirSync(reviewDir, { recursive: true });

    // Step 1: scaffold
    const scaffoldResult = runScaffoldHook({
      hookName,
      hooksDir: reviewDir,
    });
    const scaffold = parseResult(scaffoldResult) as {
      created: { hookFile: string };
    };
    expect(scaffold.created).toBeDefined();

    // Step 2: review
    const reviewResult = await runReviewHook({
      hookName,
      hooksDir: reviewDir,
    });
    const review = parseResult(reviewResult) as {
      hookName: string;
      findings: Array<{ rule: string; severity: string }>;
      summary: { errors: number; warnings: number; suggestions: number };
    };

    // Step 3: 에러 0개 확인 (scaffold 기본 템플릿은 규칙 위반 없음)
    expect(review.hookName).toBe(hookName);
    expect(review.summary.errors).toBe(0);
    expect(Array.isArray(review.findings)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════
// 시나리오 3: list → details (read 도구 체이닝)
// ═══════════════════════════════════════════════════════════
describe("시나리오 3: list → details 체이닝", () => {
  it("list_hooks 결과의 첫 번째 훅으로 get_hook_details를 호출한다", async () => {
    // Step 1: list_hooks로 실제 훅 목록 조회
    const listResult = runListHooks({ hooksDir: REAL_HOOKS_DIR });
    const list = parseResult(listResult) as {
      hooks: Array<{ name: string; path: string; hasTests: boolean }>;
      total: number;
    };
    expect(list.total).toBeGreaterThan(0);
    expect(list.hooks.length).toBeGreaterThan(0);

    // Step 2: 첫 번째 훅 이름으로 get_hook_details 호출
    const firstHook = list.hooks[0]!;
    const detailsResult = await runGetHookDetails({
      hookName: firstHook.name,
      hooksDir: REAL_HOOKS_DIR,
    });
    const details = parseResult(detailsResult) as {
      name: string;
      exports: unknown[];
      dependencies: unknown[];
      reactHooks: string[];
    };

    // Step 3: details 결과 검증
    expect(details.name).toBe(firstHook.name);
    expect(Array.isArray(details.exports)).toBe(true);
    expect(Array.isArray(details.dependencies)).toBe(true);
    expect(Array.isArray(details.reactHooks)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════
// 시나리오 4: 에러 전파
// ═══════════════════════════════════════════════════════════
describe("시나리오 4: 에러 전파", () => {
  const emptyDir = join(tmpdir(), `integration-error-${Date.now()}`);

  afterEach(() => {
    rmSync(emptyDir, { recursive: true, force: true });
  });

  it("존재하지 않는 훅에 대해 validate_hook이 HOOK_NOT_FOUND를 반환한다", async () => {
    const result = await runValidateHook({
      hookName: "useNonExistent",
      hooksDir: REAL_HOOKS_DIR,
    });
    const parsed = parseResult(result) as { error: string };
    expect(parsed.error).toBe("HOOK_NOT_FOUND");
  });

  it("존재하지 않는 훅에 대해 register_hook이 HOOK_NOT_FOUND를 반환한다", () => {
    mkdirSync(emptyDir, { recursive: true });
    writeFileSync(join(emptyDir, "index.ts"), "");

    const result = runRegisterHook({
      hookName: "useNonExistent",
      hooksDir: emptyDir,
    });
    const parsed = parseResult(result) as { error: string };
    expect(parsed.error).toBe("HOOK_NOT_FOUND");
  });

  it("이미 등록된 훅에 대해 register_hook이 ALREADY_REGISTERED를 반환한다", () => {
    mkdirSync(emptyDir, { recursive: true });
    mkdirSync(join(emptyDir, "useAlreadyRegistered"), { recursive: true });
    writeFileSync(
      join(emptyDir, "index.ts"),
      "export * from './useAlreadyRegistered';\n"
    );

    const result = runRegisterHook({
      hookName: "useAlreadyRegistered",
      hooksDir: emptyDir,
    });
    const parsed = parseResult(result) as { error: string };
    expect(parsed.error).toBe("ALREADY_REGISTERED");
  });
});
