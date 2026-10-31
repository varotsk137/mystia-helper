import { describe, expect, it } from "vitest";
import { isSetPinned, NO_PINS, normalizePins, pinnedGuestNames, removeGuestPins, togglePinnedSet, type PinnedSet } from "./pins";

const set = (guest: string, recipe: string, extras: string[] = [], beverage = "Mio"): PinnedSet => ({ guest, recipe, extras, beverage });

describe("pins", () => {
  it("toggles a set on and off; the same dish with other extras or drink is a different set", () => {
    let p = togglePinnedSet(NO_PINS, set("Chen", "Grilled Lamprey", ["Honey"]));
    expect(isSetPinned(p, set("Chen", "Grilled Lamprey", ["Honey"]))).toBe(true);
    expect(isSetPinned(p, set("Chen", "Grilled Lamprey", ["Egg"]))).toBe(false);
    expect(isSetPinned(p, set("Chen", "Grilled Lamprey", ["Honey"], "Sake"))).toBe(false);
    expect(isSetPinned(p, set("Rumia", "Grilled Lamprey", ["Honey"]))).toBe(false);
    p = togglePinnedSet(p, set("Chen", "Grilled Lamprey", ["Honey"]));
    expect(p.sets).toEqual([]);
  });

  it("lists guests in the order their first set was pinned", () => {
    let p = togglePinnedSet(NO_PINS, set("Rumia", "Rice Ball"));
    p = togglePinnedSet(p, set("Chen", "Rice Ball"));
    p = togglePinnedSet(p, set("Rumia", "Tofu"));
    expect(pinnedGuestNames(p)).toEqual(["Rumia", "Chen"]);
  });

  it("drops a guest's sets when they leave", () => {
    let p = togglePinnedSet(NO_PINS, set("Chen", "Rice Ball"));
    p = togglePinnedSet(p, set("Rumia", "Rice Ball"));
    expect(removeGuestPins(p, "Chen")).toEqual({ sets: [set("Rumia", "Rice Ball")] });
  });

  it("repairs saved data", () => {
    expect(normalizePins(undefined)).toEqual(NO_PINS);
    expect(
      normalizePins({
        sets: [set("Chen", "Rice Ball"), set("Chen", "Rice Ball"), { guest: "X" }, { ...set("Rumia", "Tofu"), extras: ["Egg", 4] }],
      }),
    ).toEqual({ sets: [set("Chen", "Rice Ball"), set("Rumia", "Tofu", ["Egg"])] });
  });
});
