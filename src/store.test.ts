import { describe, expect, it } from "vitest";
import { gameData } from "./data";
import { applyOverrides, availablePool, normalizeState } from "./store";

describe("applyOverrides", () => {
  it("patches only the edited item and keeps the rest", () => {
    const edited = applyOverrides(gameData, {
      recipes: { "Boiled Tofu": { price: 99, tags: ["Sweet"] } },
      ingredients: {},
      beverages: {},
      rareCustomers: { Chen: { budget: { min: 1, max: 2 } } },
    });
    const tofu = edited.recipes.find((r) => r.name === "Boiled Tofu")!;
    expect(tofu.price).toBe(99);
    expect(tofu.tags).toEqual(["Sweet"]);
    expect(tofu.ingredients).toEqual(["Tofu"]);
    expect(edited.rareCustomers.find((c) => c.name === "Chen")!.budget).toEqual({ min: 1, max: 2 });
    expect(gameData.recipes.find((r) => r.name === "Boiled Tofu")!.price).not.toBe(99);
    expect(edited.recipes.length).toBe(gameData.recipes.length);
  });
});

describe("availablePool", () => {
  const base = normalizeState({});

  it("keeps only recipes made with tonight's cookware", () => {
    const pool = availablePool(gameData, { ...base, cookware: ["Grill", "Steamer"] });
    expect(pool.recipes.length).toBeGreaterThan(0);
    expect(pool.recipes.every((r) => r.cookware === "Grill" || r.cookware === "Steamer")).toBe(true);
    expect(pool.recipes.some((r) => r.name === "Dark Matter")).toBe(false);
    expect(availablePool(gameData, { ...base, cookware: [] }).recipes).toEqual([]);
  });

  it("hides guests, recipes and drinks of disabled collaborations", () => {
    const all = availablePool(gameData, base);
    expect(all.rareCustomers.some((c) => c.name === "Hata no Kokoro")).toBe(true);
    expect(all.recipes.some((r) => r.name === "Scarlet Devil Cake")).toBe(true);

    const pool = availablePool(gameData, { ...base, collabs: ["blooming-soul"] });
    expect(pool.rareCustomers.some((c) => c.name === "Hata no Kokoro")).toBe(true);
    for (const name of ["Three Fairies", "Meng Chengguo", "Jien Yuu"])
      expect(pool.rareCustomers.some((c) => c.name === name)).toBe(false);
    expect(pool.recipes.some((r) => r.name === "Scarlet Devil Cake" || r.name === "Cubic Kedama Ice Cream")).toBe(false);
    expect(pool.beverages.some((b) => b.name === "GIANT Popsicle!" || b.name === "Iceberg Kedama Lemonade")).toBe(false);
    expect(pool.recipes.length).toBe(all.recipes.length - 4);
  });

  it("limits to unlocked items when progress tracking is on", () => {
    const progress = { enabled: true, unlocked: { recipes: ["Grilled Lamprey", "Rice Ball"], ingredients: [], beverages: [], locations: ["Youkai Trail"] } };
    const pool = availablePool(gameData, { ...base, cookware: ["Grill"], progress });
    expect(pool.recipes.map((r) => r.name)).toEqual(["Grilled Lamprey"]); // Rice Ball needs a Cutting Board
    expect(pool.rareCustomers.every((c) => c.locations.includes("Youkai Trail"))).toBe(true);
  });
});

describe("normalizeState", () => {
  it("fills in fields missing from an older save", () => {
    const s = normalizeState({ ownedDlcs: ["BaseGame"] });
    expect(s.ownedDlcs).toEqual(["BaseGame"]);
    expect(s.progress.enabled).toBe(false);
    expect(s.progress.unlocked.locations).toEqual([]);
    expect(s.overrides.rareCustomers).toEqual({});
    expect(s.trend).toEqual({ popular: [], unpopular: [] });
    expect(s.cookware).toEqual(gameData.cookware.map((c) => c.name));
    expect(s.collabs).toEqual(["mcgensokyo", "three-fairies", "blooming-chaos-2", "blooming-soul"]);
  });

  it("keeps saved trends and drops malformed ones", () => {
    expect(normalizeState({ trend: { popular: ["Sweet"], unpopular: ["Spicy"] } }).trend).toEqual({
      popular: ["Sweet"],
      unpopular: ["Spicy"],
    });
    // Saves from the single-trend version stored strings.
    expect(normalizeState({ trend: { popular: "Sweet", unpopular: null } }).trend).toEqual({ popular: [], unpopular: [] });
  });

  it("keeps saved progress and overrides", () => {
    const s = normalizeState({
      progress: { enabled: true, unlocked: { recipes: ["Rice Ball"] } },
      overrides: { recipes: { "Rice Ball": { price: 7 } } },
    });
    expect(s.progress.enabled).toBe(true);
    expect(s.progress.unlocked.recipes).toEqual(["Rice Ball"]);
    expect(s.progress.unlocked.beverages).toEqual([]);
    expect(s.overrides.recipes["Rice Ball"]).toEqual({ price: 7 });
  });
});
