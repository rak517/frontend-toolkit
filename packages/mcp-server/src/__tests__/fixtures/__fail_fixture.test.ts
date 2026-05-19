import { describe, it, expect } from "vitest";

describe("fixture", () => {
  it("의도적 실패", () => {
    expect("hello").toBe("world");
  });
});
