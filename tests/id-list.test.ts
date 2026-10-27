import { describe, expect, it } from "vitest";
import { COMPARE_MAX, parseIds, toggleId } from "@/lib/id-list";

describe("id lists (compare / favorites)", () => {
  it("parses untrusted cookie values", () => {
    expect(parseIds("3.x.3.-1.0.7.1e3", 10)).toEqual([3, 7, 1000]);
    expect(parseIds(undefined, 4)).toEqual([]);
  });

  it("toggles without duplicates and caps at the max", () => {
    let list: number[] = [];
    for (const id of [1, 2, 2, 3, 4, 5]) list = toggleId(list, id, COMPARE_MAX);
    expect(list).toEqual([1, 3, 4, 5]);
    expect(toggleId(list, 9, COMPARE_MAX)).toEqual(list);
    expect(toggleId(list, 3, COMPARE_MAX)).toEqual([1, 4, 5]);
  });
});
