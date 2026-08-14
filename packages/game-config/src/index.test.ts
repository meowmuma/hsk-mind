import { describe, expect, it } from "vitest";
import { GAME_BALANCE, unlockLevelFor } from "./index";

describe("game balance defaults", () => {
  it("starts every new player at HSK1", () => {
    expect(unlockLevelFor("HSK1")).toBe(1);
  });

  it("preserves approved matching and non-ranked Review defaults", () => {
    expect(GAME_BALANCE.matching.xpFor20Items).toEqual({
      three: 200,
      two: 150,
      one: 100,
      zero: 0,
    });
    expect(GAME_BALANCE.review.rankEligible).toBe(false);
  });
});
