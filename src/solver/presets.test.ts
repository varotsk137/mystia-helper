import { describe, expect, it } from "vitest";
import { gameData } from "../data";
import { NO_TREND } from "./tags";
import { PRESETS, solveRareOrder, type RareOrder } from "./rare";

const pool = { recipes: gameData.recipes, ingredients: gameData.ingredients, beverages: gameData.beverages };
const order = (name: string, food: string, drink: string): RareOrder => ({
  customer: gameData.rareCustomers.find((c) => c.name === name)!,
  foodRequest: food,
  drinkRequest: drink,
  trend: NO_TREND,
});

describe("the few-ingredients goal", () => {
  it("puts fewer extras first among sets of the same rating and budget", () => {
    const { suggestions } = solveRareOrder(order("Hieda no Akyuu", "Cultural Heritage", "Heatable"), pool, 1000, PRESETS.few);
    const same = suggestions.filter((s) => s.rating === suggestions[0].rating && s.budget !== "over");
    expect(same.length).toBeGreaterThan(1);
    for (let i = 1; i < same.length; i++)
      expect(same[i].dish.extras.length).toBeGreaterThanOrEqual(same[i - 1].dish.extras.length);
  });
});
