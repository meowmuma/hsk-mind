import { describe, expect, it } from "vitest";
import { GAME_MODES, HSK_CODES, STAGED_GAME_MODES } from "./index";

describe("shared domain constants", () => {
  it("keeps the MVP scope at HSK1 through HSK4", () => {
    expect(HSK_CODES).toEqual(["HSK1", "HSK2", "HSK3", "HSK4"]);
  });

  it("keeps Review outside staged modes", () => {
    expect(GAME_MODES).toContain("REVIEW");
    expect(STAGED_GAME_MODES).not.toContain("REVIEW");
  });
});
