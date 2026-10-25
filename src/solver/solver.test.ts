import { describe, expect, it } from "vitest";
import { gameData } from "../data";
import { computeDishTags, NO_TREND } from "./tags";
import {
  budgetStatus,
  evaluateCombo,
  ingredientEffects,
  Rating,
  ratingCap,
  ratingFromScore,
  solveRareOrder,
  suggestionComparator,
  valueOf,
  setCost,
  setTopLevel,
  dishProfit,
  FACTORS,
  PRESETS,
  PRESET_IDS,
  type Preset,
  type RareOrder,
  type Suggestion,
} from "./rare";

const recipe = (name: string) => gameData.recipes.find((r) => r.name === name)!;
const ing = (name: string) => gameData.ingredients.find((i) => i.name === name)!;
const customer = (name: string) => gameData.rareCustomers.find((c) => c.name === name)!;
const pool = { recipes: gameData.recipes, ingredients: gameData.ingredients, beverages: gameData.beverages };
const zeroFactors = Object.fromEntries(FACTORS.map((f) => [f, 0])) as Suggestion["factors"];

describe("computeDishTags", () => {
  it("adds extra ingredient tags and marks them as added", () => {
    const r = computeDishTags(recipe("Boiled Tofu"), [ing("Honey")]);
    expect(r.tags).toContain("Sweet");
    expect(r.added).toEqual(["Sweet"]);
    expect(r.conflicts).toEqual([]);
  });

  it("applies overrides: Meat removes Vegetarian, Greasy removes Mild", () => {
    const r = computeDishTags(recipe("Boiled Tofu"), [ing("Pork"), ing("Butter")]);
    expect(r.tags).toContain("Meat");
    expect(r.tags).not.toContain("Vegetarian");
    expect(r.tags).not.toContain("Mild");
    expect(r.removed.sort()).toEqual(["Mild", "Vegetarian"]);
  });

  it("flags banned tags as conflicts (Dark Matter)", () => {
    const r = computeDishTags(recipe("Dew Runny Eggs"), [ing("Pork")]);
    expect(r.conflicts).toEqual(["Meat"]);
  });

  it("adds Large Portion only when extras bring the dish to 5 ingredients", () => {
    const tofu = recipe("Boiled Tofu"); // 1 base ingredient
    expect(computeDishTags(tofu, [ing("Egg"), ing("Egg"), ing("Egg")]).tags).not.toContain("Large Portion");
    const full = computeDishTags(tofu, [ing("Egg"), ing("Egg"), ing("Egg"), ing("Egg")]);
    expect(full.tags).toContain("Large Portion");
    expect(full.added).toContain("Large Portion");
    expect(computeDishTags(recipe("Beef Wellington"), []).tags).not.toContain("Large Portion");
  });

  it("Large Portion overrides Small Portion", () => {
    const r = computeDishTags(recipe("Boiled Tofu"), [ing("Plum"), ing("Egg"), ing("Egg"), ing("Egg")]);
    expect(r.tags).toContain("Large Portion");
    expect(r.tags).not.toContain("Small Portion");
  });

  it("adds trend tags when the dish has the trending tag", () => {
    const r = computeDishTags(recipe("Boiled Tofu"), [], { popular: ["Sweet", "Mild"], unpopular: ["Spicy"] });
    expect(r.tags).toContain("Trend - Popular");
    expect(r.tags).not.toContain("Trend - Unpopular");
  });
});

describe("rating", () => {
  it("maps score to rating", () => {
    expect(ratingFromScore(-1)).toBe(Rating.Black);
    expect(ratingFromScore(0)).toBe(Rating.Black);
    expect(ratingFromScore(2)).toBe(Rating.Green);
    expect(ratingFromScore(7)).toBe(Rating.Pink);
  });

  it("caps rating by fulfilled requests", () => {
    expect(ratingCap(0)).toBe(Rating.Purple);
    expect(ratingCap(1)).toBe(Rating.Orange);
    expect(ratingCap(2)).toBe(Rating.Pink);
  });

  it("classifies budget", () => {
    const wriggle = customer("Wriggle Nightbug"); // 200 - 400
    expect(budgetStatus(200, wriggle)).toBe("safe");
    expect(budgetStatus(300, wriggle)).toBe("risky");
    expect(budgetStatus(401, wriggle)).toBe("over");
  });
});

describe("solveRareOrder", () => {
  const order = (name: string, food: string | null, drink: string | null): RareOrder => ({
    customer: customer(name),
    foodRequest: food,
    drinkRequest: drink,
    trend: NO_TREND,
  });

  it("finds pink, in-budget suggestions for Wriggle (Sweet + Chillable)", () => {
    const { suggestions } = solveRareOrder(order("Wriggle Nightbug", "Sweet", "Chillable"), pool);
    const top = suggestions[0];
    expect(top.rating).toBe(Rating.Pink);
    expect(top.dish.dish.tags).toContain("Sweet");
    expect(top.drink.beverage.tags).toContain("Chillable");
    expect(top.budget).toBe("safe");
    for (const s of suggestions) {
      expect(s.dish.dish.conflicts).toEqual([]);
      expect(s.dish.recipe.ingredients.length + s.dish.extras.length).toBeLessThanOrEqual(5);
    }
  });

  it("never returns a suggestion that misses a request above the cap", () => {
    const { suggestions } = solveRareOrder(order("Hieda no Akyuu", "Soup", "Sake"), pool);
    for (const s of suggestions) expect(s.rating).toBeLessThanOrEqual(ratingCap(s.requestsMet));
  });

  it("returns one suggestion per recipe", () => {
    const { suggestions } = solveRareOrder(order("Chen", "Grilled", "Dry"), pool, 1000);
    const names = suggestions.map((s) => s.dish.recipe.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("offers equally rated alternatives and drinks", () => {
    const { suggestions } = solveRareOrder(order("Wriggle Nightbug", "Sweet", "Chillable"), pool, 1000);
    expect(suggestions.some((s) => s.alternatives.length > 0)).toBe(true);
    expect(suggestions.some((s) => s.altDrinks.length > 0)).toBe(true);
    for (const s of suggestions) {
      for (const alt of s.alternatives) {
        expect(alt.rating).toBe(s.rating);
        expect(alt.budget).toBe(s.budget);
        expect(alt.dish.recipe.name).toBe(s.dish.recipe.name);
      }
    }
  });

  it("lists substitutes that produce exactly the same dish tags", () => {
    const { suggestions } = solveRareOrder(order("Wriggle Nightbug", "Sweet", "Chillable"), pool, 1000);
    const all = suggestions.flatMap((s) => [s, ...s.alternatives]);
    const withSubs = all.filter((s) => s.dish.substitutes.some((list) => list.length > 0));
    expect(withSubs.length).toBeGreaterThan(0);
    for (const s of withSubs) {
      s.dish.substitutes.forEach((subs, i) => {
        for (const sub of subs) {
          const swapped = s.dish.extras.map((e, j) => (j === i ? sub : e));
          const tags = computeDishTags(s.dish.recipe, swapped).tags.sort();
          expect(tags).toEqual(computeDishTags(s.dish.recipe, s.dish.extras).tags.sort());
        }
      });
    }
  });

  it("evaluates a hand-built dish, including Dark Matter", () => {
    const o = order("Wriggle Nightbug", "Sweet", "Chillable");
    const drink = gameData.beverages.find((b) => b.name === "Fruity Highball")!;
    const ok = evaluateCombo(o, recipe("Boiled Tofu"), [ing("Honey"), ing("Pork")], drink);
    expect(ok.dish.dish.tags).toContain("Sweet");
    expect(ok.dish.dish.tags).not.toContain("Vegetarian"); // Meat overrides it
    const dark = evaluateCombo(o, recipe("Dew Runny Eggs"), [ing("Pork")], drink);
    expect(dark.dish.dish.tags).toEqual(["Dark Matter"]);
    expect(dark.dish.score).toBe(-2);
    expect(dark.dish.requestMet).toBe(false);
  });

  it("ranks ingredient effects and flags Dark Matter", () => {
    const o = order("Wriggle Nightbug", "Sweet", "Chillable");
    const drink = gameData.beverages.find((b) => b.name === "Fruity Highball")!;
    const effects = ingredientEffects(o, recipe("Dew Runny Eggs"), [], drink, gameData.ingredients);
    expect(effects.length).toBe(gameData.ingredients.length);
    const honey = effects.find((e) => e.ingredient.name === "Honey")!;
    expect(honey.gainedTags).toContain("Sweet");
    expect(honey.delta).toBeGreaterThan(0);
    expect(effects.find((e) => e.ingredient.name === "Pork")!.darkMatter).toBe(true);
    // Dark Matter options sort last.
    const firstDark = effects.findIndex((e) => e.darkMatter);
    expect(effects.slice(firstDark).every((e) => e.darkMatter)).toBe(true);
    // A full dish can't take more.
    expect(ingredientEffects(o, recipe("Beef Wellington"), [], drink, gameData.ingredients)).toEqual([]);
  });

  it("scores active trends for customers who care about them", () => {
    // Chen likes Trend - Popular and dislikes Trend - Unpopular.
    const chen = customer("Chen");
    const trend = { popular: ["Grilled", "Sweet"], unpopular: ["Aquatic"] };
    const { suggestions } = solveRareOrder({ customer: chen, foodRequest: "Meat", drinkRequest: "Dry", trend }, pool, 1000);
    // A popular tag on the dish counts as liked, an unpopular one as disliked.
    const grilled = suggestions.find((s) => s.dish.dish.tags.includes("Grilled"));
    expect(grilled?.dish.liked).toContain("Trend - Popular");
    const aquatic = suggestions.find((s) => s.dish.dish.tags.includes("Aquatic"));
    expect(aquatic?.dish.disliked).toContain("Trend - Unpopular");
    expect(suggestions[0].rating).toBe(Rating.Pink);
  });

  it("ranks by rating, puts over-budget sets last, then by value, then by the stock used", () => {
    const fake = (name: string, rating: Rating, budget: string, value: number, cost: number) =>
      ({
        rating,
        budget,
        value,
        totalPrice: 100,
        drink: { beverage: { price: 0, level: 1 } },
        dish: { extras: [], ingredientCost: cost, topLevel: 1, recipe: { name } },
      }) as unknown as Suggestion;
    const list = [
      fake("orange-best-value", Rating.Orange, "safe", 1, 0),
      fake("pink-over", Rating.Pink, "over", 1, 0),
      fake("pink-low", Rating.Pink, "safe", 0.4, 0),
      fake("pink-high-costly", Rating.Pink, "risky", 0.9, 50),
      fake("pink-high-cheap", Rating.Pink, "safe", 0.9, 10),
    ];
    expect(list.sort(suggestionComparator()).map((s) => s.dish.recipe.name)).toEqual([
      "pink-high-cheap",
      "pink-high-costly",
      "pink-low",
      "pink-over",
      "orange-best-value",
    ]);
  });

  it("scores factors 0-1 against the other sets and averages them by weight", () => {
    expect(valueOf({ ...zeroFactors, profit: 1, rarity: 0.5 }, { profit: 3, rarity: 1 })).toBeCloseTo(0.875);
    expect(valueOf({ ...zeroFactors, profit: 1 }, {})).toBe(0);
    const { suggestions } = solveRareOrder(order("Hieda no Akyuu", "Cultural Heritage", "Heatable"), pool, 1000);
    for (const s of suggestions) {
      for (const f of FACTORS) {
        expect(s.factors[f]).toBeGreaterThanOrEqual(0);
        expect(s.factors[f]).toBeLessThanOrEqual(1);
      }
      expect(s.value).toBeCloseTo(valueOf(s.factors, PRESETS.balanced));
    }
    // Factors are relative to every candidate set, so check the ordering: cheaper never scores lower on cost.
    const inBudget = suggestions.filter((s) => s.budget !== "over");
    for (const a of inBudget)
      for (const b of inBudget) if (setCost(a) < setCost(b)) expect(a.factors.cost).toBeGreaterThanOrEqual(b.factors.cost);
  });

  it("makes each preset's top pick lean the way the preset says", () => {
    const o = order("Hieda no Akyuu", "Cultural Heritage", "Heatable");
    const top = (p: Preset) => solveRareOrder(o, pool, 1, PRESETS[p]).suggestions[0];
    const picks = Object.fromEntries(PRESET_IDS.map((p) => [p, top(p)])) as Record<Preset, Suggestion>;
    for (const p of PRESET_IDS) expect(picks[p].rating).toBe(Rating.Pink);
    for (const p of PRESET_IDS) {
      expect(setTopLevel(picks.save)).toBeLessThanOrEqual(setTopLevel(picks[p]));
      expect(dishProfit(picks.profit)).toBeGreaterThanOrEqual(dishProfit(picks[p]));
      expect(picks.fast.dish.cookTime).toBeLessThanOrEqual(picks[p].dish.cookTime);
    }
    expect(picks.stay.totalPrice).toBeLessThan(picks.profit.totalPrice);
  });

  it("counts the recipe's own ingredients in the cost and level", () => {
    const { suggestions } = solveRareOrder(order("Hieda no Akyuu", "Cultural Heritage", "Heatable"), pool, 1000);
    for (const s of suggestions.slice(0, 20)) {
      const parts = [...s.dish.recipe.ingredients.map(ing), ...s.dish.extras];
      expect(s.dish.ingredientCost).toBe(parts.reduce((sum, p) => sum + p.price, 0));
      expect(s.dish.topLevel).toBe(Math.max(...parts.map((p) => p.level)));
    }
  });

  it("rates by points alone when requests are ignored (Night Sparrow cookware)", () => {
    const normal = order("Hieda no Akyuu", "Soup", "Sake");
    const ignored = { ...normal, ignoreRequests: true };
    const pinkWithoutSoup = (o: RareOrder) =>
      solveRareOrder(o, pool, 1000).suggestions.filter((s) => s.rating === Rating.Pink && !s.dish.dish.tags.includes("Soup"));
    // Normally a set without Soup is capped below pink; with requests ignored it can be pink.
    expect(pinkWithoutSoup(normal)).toEqual([]);
    expect(pinkWithoutSoup(ignored).length).toBeGreaterThan(0);
    // Nothing is reported as missing a request, and drinks no longer need the requested tag.
    const { suggestions, drinks } = solveRareOrder(ignored, pool, 1000);
    expect(suggestions.every((s) => s.requestsMet === 2)).toBe(true);
    expect(drinks.every((d) => d.requestMet)).toBe(true);
    const drink = gameData.beverages.find((b) => !b.tags.includes("Sake"))!;
    expect(evaluateCombo(ignored, recipe("Boiled Tofu"), [], drink).requestsMet).toBe(2);
    // Night Sparrow cookware cooks 25% slower.
    expect(recipe("Boiled Tofu").cookTime).toBe(4.2);
    expect(evaluateCombo(ignored, recipe("Boiled Tofu"), [], drink).dish.cookTime).toBe(5.3);
    expect(evaluateCombo(normal, recipe("Boiled Tofu"), [], drink).dish.cookTime).toBe(4.2);
  });

  it("applies Nitori's cucumber rule", () => {
    const { suggestions } = solveRareOrder(order("Nitori Kawashiro", "Salty", "Sake"), pool, 1000);
    const cucumber = suggestions.filter((s) => s.note === "nitori-cucumber");
    expect(cucumber.length).toBeGreaterThan(0);
    for (const s of cucumber) expect(s.rating).toBeGreaterThanOrEqual(Rating.Orange);
  });

  it("solves every rare customer quickly", () => {
    const start = performance.now();
    for (const c of gameData.rareCustomers.filter((c) => !c.undocumented)) {
      solveRareOrder({ customer: c, foodRequest: c.likedFoodTags[0], drinkRequest: c.likedDrinkTags[0], trend: NO_TREND }, pool);
    }
    const perCustomer = (performance.now() - start) / gameData.rareCustomers.length;
    expect(perCustomer).toBeLessThan(500);
    // Solving all ~60 guests in a row takes several seconds; the per-guest average is what matters.
  }, 30_000);
});
