// Dish tag rules. See docs/game-mechanics.md.
import type { Ingredient, Recipe } from "../data/types";

export const MAX_INGREDIENTS = 5;
export const LARGE_PORTION = "Large Portion";
export const TREND_POPULAR = "Trend - Popular";
export const TREND_UNPOPULAR = "Trend - Unpopular";
export const DARK_MATTER = "Dark Matter";

/** [winner, loser]: when both are present the loser is removed. */
export const TAG_OVERRIDES: ReadonlyArray<readonly [string, string]> = [
  ["Meat", "Vegetarian"],
  [LARGE_PORTION, "Small Portion"],
  ["Filling", "Good w/ Alcohol"],
  ["Greasy", "Mild"],
  ["Hot", "Refreshing"],
];

/** Food tags the newspaper currently marks as popular / unpopular (several can be active at once). */
export interface Trend {
  popular: string[];
  unpopular: string[];
}

export const NO_TREND: Trend = { popular: [], unpopular: [] };

export interface DishTags {
  /** Final tags the customer sees, after overrides and trends. */
  tags: string[];
  /** Tags that came from extra ingredients (or Large Portion) and were not on the recipe. */
  added: string[];
  /** Tags removed by an override. */
  removed: string[];
  /** Added tags that the recipe forbids; non-empty means the dish is Dark Matter. */
  conflicts: string[];
}

export function computeDishTags(recipe: Recipe, extras: readonly Ingredient[], trend: Trend = NO_TREND): DishTags {
  const tags = new Set(recipe.tags);
  const added = new Set<string>();
  const banned = new Set(recipe.bannedTags);
  const conflicts = new Set<string>();

  const add = (t: string) => {
    if (banned.has(t)) conflicts.add(t);
    if (!tags.has(t)) {
      tags.add(t);
      added.add(t);
    }
  };

  for (const ing of extras) for (const t of ing.tags) add(t);
  if (extras.length > 0 && recipe.ingredients.length + extras.length === MAX_INGREDIENTS) add(LARGE_PORTION);

  const removed: string[] = [];
  for (const [winner, loser] of TAG_OVERRIDES) {
    if (tags.has(winner) && tags.has(loser)) {
      tags.delete(loser);
      added.delete(loser);
      removed.push(loser);
    }
  }

  if (trend.popular.some((t) => tags.has(t))) tags.add(TREND_POPULAR);
  if (trend.unpopular.some((t) => tags.has(t))) tags.add(TREND_UNPOPULAR);

  return { tags: [...tags], added: [...added], removed, conflicts: [...conflicts] };
}
