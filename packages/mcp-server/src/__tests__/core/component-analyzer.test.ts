import { describe, it, expect } from "vitest";
import { analyzeComponent } from "../../component-analyzer.js";
import { join } from "node:path";

const fixturesPath = join(import.meta.dirname, "../fixtures");

describe("analyzeComponent", () => {
  describe("componentName extraction", () => {
    it("should extract component name from named export function", async () => {
      const result = await analyzeComponent(
        join(fixturesPath, "SampleButton.tsx")
      );

      expect(result.componentName).toBe("SampleButton");
    });

    it("should extract component name from const export", async () => {
      const result = await analyzeComponent(
        join(fixturesPath, "SampleInput.tsx")
      );

      expect(result.componentName).toBe("SampleInput");
    });
  });

  describe("props extraction", () => {
    it("should extract props from interface", async () => {
      const result = await analyzeComponent(
        join(fixturesPath, "SampleButton.tsx")
      );

      expect(result.props).toHaveLength(3);

      const labelProp = result.props.find((p) => p.name === "label");
      expect(labelProp).toEqual({
        name: "label",
        type: "string",
        required: true,
      });

      const disabledProp = result.props.find((p) => p.name === "disabled");
      expect(disabledProp?.required).toBe(false);
    });

    it("should extract props from type alias", async () => {
      const result = await analyzeComponent(
        join(fixturesPath, "SampleInput.tsx")
      );

      expect(result.props.length).toBeGreaterThan(0);

      const valueProp = result.props.find((p) => p.name === "value");
      expect(valueProp).toBeDefined();
    });
  });

  describe("hooks extraction", () => {
    it("should extract built-in hooks", async () => {
      const result = await analyzeComponent(
        join(fixturesPath, "SampleButton.tsx")
      );

      const useState = result.hooks.find((h) => h.name === "useState");
      const useCallback = result.hooks.find((h) => h.name === "useCallback");

      expect(useState).toEqual({ name: "useState", isCustom: false });
      expect(useCallback).toEqual({ name: "useCallback", isCustom: false });
    });

    it("should detect custom hooks", async () => {
      const result = await analyzeComponent(
        join(fixturesPath, "SampleInput.tsx")
      );

      const customHook = result.hooks.find(
        (h) => h.name === "useCustomValidation"
      );

      expect(customHook).toBeDefined();
      expect(customHook?.isCustom).toBe(true);
    });
  });

  describe("events extraction", () => {
    it("should extract event handlers from JSX", async () => {
      const result = await analyzeComponent(
        join(fixturesPath, "SampleButton.tsx")
      );

      const eventNames = result.events.map((e) => e.name);

      expect(eventNames).toContain("onClick");
      expect(eventNames).toContain("onMouseEnter");
      expect(eventNames).toContain("onMouseLeave");
    });

    it("should extract handler names", async () => {
      const result = await analyzeComponent(
        join(fixturesPath, "SampleButton.tsx")
      );

      const clickEvent = result.events.find((e) => e.name === "onClick");
      expect(clickEvent?.handlerName).toBe("handleClick");
    });
  });

  describe("component flags", () => {
    it("should detect children usage", async () => {
      const buttonResult = await analyzeComponent(
        join(fixturesPath, "SampleButton.tsx")
      );
      const inputResult = await analyzeComponent(
        join(fixturesPath, "SampleInput.tsx")
      );

      expect(buttonResult.hasChildren).toBe(false);
      expect(inputResult.hasChildren).toBe(true);
    });

    it("should detect forwardRef usage", async () => {
      const buttonResult = await analyzeComponent(
        join(fixturesPath, "SampleButton.tsx")
      );
      const inputResult = await analyzeComponent(
        join(fixturesPath, "SampleInput.tsx")
      );

      expect(buttonResult.isForwardRef).toBe(false);
      expect(inputResult.isForwardRef).toBe(true);
    });

    it("should detect memo usage", async () => {
      const buttonResult = await analyzeComponent(
        join(fixturesPath, "SampleButton.tsx")
      );
      const inputResult = await analyzeComponent(
        join(fixturesPath, "SampleInput.tsx")
      );

      expect(buttonResult.isMemo).toBe(false);
      expect(inputResult.isMemo).toBe(true);
    });
  });

  describe("error handling", () => {
    it("should throw error for non-existent file", async () => {
      await expect(
        analyzeComponent("/nonexistent/Component.tsx")
      ).rejects.toThrow();
    });
  });
});
