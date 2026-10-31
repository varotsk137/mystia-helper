import { describe, expect, it } from "vitest";
import { findSavedSet, NO_SAVED_SETS, normalizeSavedSets, removeSavedSet, saveSet, savedSetsFor, type SavedSet } from "./savedSets";

const set = (guest: string, recipe: string, extras: string[] = [], beverage = "Mio"): Omit<SavedSet, "id"> => ({
  guest,
  name: recipe,
  kind: "economy",
  recipe,
  extras,
  beverage,
});

describe("saved sets", () => {
  it("saves sets per guest and finds them by content", () => {
    let s = saveSet(NO_SAVED_SETS, set("Chen", "Grilled Lamprey", ["Honey"]), "a");
    s = saveSet(s, set("Chen", "Rice Ball"), "b");
    s = saveSet(s, set("Rumia", "Rice Ball"), "c");
    expect(savedSetsFor(s, "Chen").map((x) => x.id)).toEqual(["a", "b"]);
    expect(findSavedSet(s, set("Chen", "Grilled Lamprey", ["Honey"]))?.id).toBe("a");
    expect(findSavedSet(s, set("Chen", "Grilled Lamprey", ["Egg"]))).toBeUndefined();
  });

  it("renames and re-kinds a set saved again instead of copying it", () => {
    let s = saveSet(NO_SAVED_SETS, set("Chen", "Rice Ball"), "a");
    s = saveSet(s, { ...set("Chen", "Rice Ball"), name: "Cheap one", kind: "custom" }, "b");
    expect(s.sets).toEqual([{ ...set("Chen", "Rice Ball"), name: "Cheap one", kind: "custom", id: "a" }]);
  });

  it("removes a set by id", () => {
    let s = saveSet(NO_SAVED_SETS, set("Chen", "Rice Ball"), "a");
    s = saveSet(s, set("Chen", "Tofu"), "b");
    expect(removeSavedSet(s, "a").sets.map((x) => x.id)).toEqual(["b"]);
  });

  it("repairs saved data", () => {
    const repaired = normalizeSavedSets({
      sets: [
        { id: "a", guest: "Chen", name: "", kind: "weird", recipe: "Rice Ball", extras: ["Honey", 3], beverage: "Mio" },
        { id: "a", guest: "Chen", name: "Dup", kind: "economy", recipe: "Rice Ball", extras: ["Honey"], beverage: "Mio" },
        { id: "b", guest: "Chen", recipe: "Tofu" },
        null,
      ],
    });
    expect(repaired.sets).toEqual([
      { id: "a", guest: "Chen", name: "Rice Ball", kind: "custom", recipe: "Rice Ball", extras: ["Honey"], beverage: "Mio" },
    ]);
    expect(normalizeSavedSets(undefined)).toEqual(NO_SAVED_SETS);
  });
});
