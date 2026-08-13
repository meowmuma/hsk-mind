import { describe, expect, it } from "vitest";
import {
  meetsCompletionThreshold,
  normalizePinyinSortKey,
  stageCount,
} from "./index";

describe("foundation utilities", () => {
  it("normalizes tone marks, casing, whitespace, and punctuation", () => {
    expect(normalizePinyinSortKey(" Ài-Hào ")).toBe("aihao");
  });
  it("calculates dynamic stage counts", () => {
    expect(stageCount(0)).toBe(0);
    expect(stageCount(21)).toBe(2);
  });
  it("uses exact completion ratios", () => {
    expect(meetsCompletionThreshold(7, 10)).toBe(true);
    expect(meetsCompletionThreshold(6, 10)).toBe(false);
  });
});
