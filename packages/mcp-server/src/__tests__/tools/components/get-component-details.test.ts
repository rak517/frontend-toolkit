import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getComponentDetailsSchema,
  runGetComponentDetails,
} from "../../../tools/components/get-component-details.js";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

/* ------------------------------------------------------------------ */
/*  Schema tests                                                       */
/* ------------------------------------------------------------------ */

describe("getComponentDetailsSchema", () => {
  it("should accept valid input", () => {
    const result = getComponentDetailsSchema.safeParse({
      name: "Button",
      componentsDir: "/Users/test/packages/components/src",
    });
    expect(result.success).toBe(true);
  });

  it("should reject relative path for componentsDir", () => {
    const result = getComponentDetailsSchema.safeParse({
      name: "Button",
      componentsDir: "./packages/components/src",
    });
    expect(result.success).toBe(false);
  });

  it("should require name field", () => {
    const result = getComponentDetailsSchema.safeParse({
      componentsDir: "/Users/test/packages/components/src",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty string for name", () => {
    const result = getComponentDetailsSchema.safeParse({
      name: "",
      componentsDir: "/Users/test/packages/components/src",
    });
    expect(result.success).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/*  Handler tests                                                      */
/* ------------------------------------------------------------------ */

describe("runGetComponentDetails", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "mcp-comp-details-"));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  /* ---------- helper ---------- */

  function createComponent(
    name: string,
    opts: {
      fileName?: string;
      source: string;
      testFile?: boolean;
    }
  ) {
    const dir = join(tmpDir, name);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, opts.fileName ?? `${name}.tsx`), opts.source);
    if (opts.testFile) {
      writeFileSync(join(dir, `${name}.test.tsx`), "// test stub");
    }
  }

  /* ---------- 정상 케이스 ---------- */

  it("should return component details with props, hooks, dependencies", async () => {
    createComponent("Button", {
      source: `
import React, { useState, useCallback } from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, onClick, disabled }: ButtonProps) {
  const [pressed, setPressed] = useState(false);
  const handleClick = useCallback(() => onClick(), [onClick]);
  return <button disabled={disabled} onClick={handleClick}>{label}</button>;
}
`,
      testFile: true,
    });

    const result = await runGetComponentDetails({
      name: "Button",
      componentsDir: tmpDir,
    });

    expect(result.content).toHaveLength(1);
    expect(result.content[0]!.type).toBe("text");

    const parsed = JSON.parse(result.content[0]!.text) as {
      name: string;
      filePath: string;
      props: Array<{ name: string; type: string; required: boolean }>;
      hooks: string[];
      dependencies: string[];
      hasTests: boolean;
    };

    expect(parsed.name).toBe("Button");
    expect(parsed.filePath).toBe(join(tmpDir, "Button", "Button.tsx"));
    expect(parsed.hasTests).toBe(true);

    // props
    expect(parsed.props).toHaveLength(3);
    const labelProp = parsed.props.find((p) => p.name === "label");
    expect(labelProp).toEqual({ name: "label", type: "string", required: true });
    const disabledProp = parsed.props.find((p) => p.name === "disabled");
    expect(disabledProp?.required).toBe(false);

    // hooks
    expect(parsed.hooks).toContain("useState");
    expect(parsed.hooks).toContain("useCallback");

    // dependencies
    expect(parsed.dependencies).toContain("react");
  });

  it("should detect index.tsx as fallback main file", async () => {
    createComponent("Card", {
      fileName: "index.tsx",
      source: `
import React from 'react';

interface CardProps {
  title: string;
}

export function Card({ title }: CardProps) {
  return <div>{title}</div>;
}
`,
    });

    const result = await runGetComponentDetails({
      name: "Card",
      componentsDir: tmpDir,
    });

    const parsed = JSON.parse(result.content[0]!.text) as {
      name: string;
      filePath: string;
      hasTests: boolean;
    };

    expect(parsed.name).toBe("Card");
    expect(parsed.filePath).toBe(join(tmpDir, "Card", "index.tsx"));
    expect(parsed.hasTests).toBe(false);
  });

  it("should return empty props when no Props interface exists", async () => {
    createComponent("Divider", {
      source: `
import React from 'react';
export function Divider() {
  return <hr />;
}
`,
    });

    const result = await runGetComponentDetails({
      name: "Divider",
      componentsDir: tmpDir,
    });

    const parsed = JSON.parse(result.content[0]!.text) as {
      props: Array<{ name: string }>;
    };
    expect(parsed.props).toHaveLength(0);
  });

  it("should return empty hooks when no hooks are used", async () => {
    createComponent("StaticText", {
      source: `
import React from 'react';

interface StaticTextProps {
  text: string;
}

export function StaticText({ text }: StaticTextProps) {
  return <span>{text}</span>;
}
`,
    });

    const result = await runGetComponentDetails({
      name: "StaticText",
      componentsDir: tmpDir,
    });

    const parsed = JSON.parse(result.content[0]!.text) as {
      hooks: string[];
    };
    expect(parsed.hooks).toHaveLength(0);
  });

  /* ---------- 에러 케이스 ---------- */

  it("should return COMPONENT_NOT_FOUND for non-existent component", async () => {
    const result = await runGetComponentDetails({
      name: "NonExistent",
      componentsDir: tmpDir,
    });

    const parsed = JSON.parse(result.content[0]!.text) as {
      error: string;
      message: string;
    };
    expect(parsed.error).toBe("COMPONENT_NOT_FOUND");
    expect(parsed.message).toContain("NonExistent");
  });

  it("should return COMPONENT_NOT_FOUND when directory exists but no source file", async () => {
    // 디렉토리만 만들고 소스 파일은 생성하지 않음
    mkdirSync(join(tmpDir, "Empty"), { recursive: true });
    writeFileSync(join(tmpDir, "Empty", "README.md"), "# Empty");

    const result = await runGetComponentDetails({
      name: "Empty",
      componentsDir: tmpDir,
    });

    const parsed = JSON.parse(result.content[0]!.text) as {
      error: string;
      message: string;
    };
    expect(parsed.error).toBe("COMPONENT_NOT_FOUND");
  });

  /* ---------- 경계값 ---------- */

  it("should return COMPONENT_NOT_FOUND for empty string name", async () => {
    const result = await runGetComponentDetails({
      name: "",
      componentsDir: tmpDir,
    });

    const parsed = JSON.parse(result.content[0]!.text) as {
      error: string;
    };
    // 빈 문자열 → 디렉토리 = tmpDir 자체, 소스 파일 후보 없음
    expect(parsed.error).toBe("COMPONENT_NOT_FOUND");
  });

  it("should return COMPONENT_NOT_FOUND for name with special characters", async () => {
    const result = await runGetComponentDetails({
      name: "../escape-attempt",
      componentsDir: tmpDir,
    });

    const parsed = JSON.parse(result.content[0]!.text) as {
      error: string;
    };
    expect(parsed.error).toBe("COMPONENT_NOT_FOUND");
  });

  it("should return COMPONENT_NOT_FOUND for name with spaces", async () => {
    const result = await runGetComponentDetails({
      name: "My Component",
      componentsDir: tmpDir,
    });

    const parsed = JSON.parse(result.content[0]!.text) as {
      error: string;
    };
    expect(parsed.error).toBe("COMPONENT_NOT_FOUND");
  });

  /* ---------- 실제 프로젝트 컴포넌트 ---------- */

  it("should work with real InViewTrigger component", async () => {
    const componentsDir = join(process.cwd(), "packages/components/src");
    const result = await runGetComponentDetails({
      name: "InViewTrigger",
      componentsDir,
    });

    const parsed = JSON.parse(result.content[0]!.text) as {
      name: string;
      filePath: string;
      hooks: string[];
      hasTests: boolean;
      dependencies: string[];
    };

    expect(parsed.name).toBe("InViewTrigger");
    expect(parsed.filePath).toContain("InViewTrigger.tsx");
    expect(parsed.hasTests).toBe(true);
    expect(parsed.hooks).toContain("useCallback");
    expect(parsed.hooks).toContain("useEffect");
  });
});
