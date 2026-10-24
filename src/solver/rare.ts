// Finds the best dish (+ extra ingredients) and drink for a rare customer's order.
// Scoring rules: docs/game-mechanics.md.
import type { Beverage, Ingredient, RareCustomer, Recipe } from "../data/types";
import { computeDishTags, DARK_MATTER, MAX_INGREDIENTS, TAG_OVERRIDES, LARGE_PORTION, TREND_POPULAR, TREND_UNPOPULAR, type DishTags, type Trend } from "./tags";

export enum Rating {
  Black = 0,
  Purple = 1,
  Green = 2,
  Orange = 3,
  Pink = 4,
}

/** safe: total <= budget.min, risky: <= budget.max, over: > budget.max */
export type BudgetStatus = "safe" | "risky" | "over" | "unknown";
const BUDGET_ORDER: Record<BudgetStatus, number> = { safe: 0, unknown: 1, risky: 2, over: 3 };

export interface RareOrder {
  customer: RareCustomer;
  /** null = no specific request (planning mode). */
  foodRequest: string | null;
  drinkRequest: string | null;
  trend: Trend;
}

export interface SolverPool {
  recipes: readonly Recipe[];
  ingredients: readonly Ingredient[];
  beverages: readonly Beverage[];
}

export interface DishOption {
  recipe: Recipe;
  extras: Ingredient[];
  dish: DishTags;
  liked: string[];
  disliked: string[];
  score: number;
  requestMet: boolean;
  extraCost: number;
  /** Per extra: other ingredients that add exactly the same tags (same dish result). */
  substitutes: Ingredient[][];
}

export interface DrinkOption {
  beverage: Beverage;
  liked: string[];
  score: number;
  requestMet: boolean;
}

export interface Suggestion {
  dish: DishOption;
  drink: DrinkOption;
  score: number;
  rating: Rating;
  /** Rating the score alone would give, before the request cap. */
  uncappedRating: Rating;
  requestsMet: number;
  totalPrice: number;
  budget: BudgetStatus;
  note: string | null;
  /** Other extra-ingredient choices for the same recipe with the same rating and budget status. */
  alternatives: Suggestion[];
  /** Other drinks that give the same rating and budget status with this dish. */
  altDrinks: DrinkOption[];
}

export interface RareSolution {
  suggestions: Suggestion[];
  drinks: DrinkOption[];
}

export function ratingFromScore(score: number): Rating {
  if (score <= 0) return Rating.Black;
  if (score >= 4) return Rating.Pink;
  return score as Rating;
}

/** Highest rating reachable when only `met` of the two requests are fulfilled. */
export function ratingCap(met: number): Rating {
  return met >= 2 ? Rating.Pink : met === 1 ? Rating.Orange : Rating.Purple;
}

export function budgetStatus(total: number, customer: RareCustomer): BudgetStatus {
  const b = customer.budget;
  if (!b) return "unknown";
  if (total <= b.min) return "safe";
  if (total <= b.max) return "risky";
  return "over";
}

/** Character-specific reactions listed on the wiki's Customers page. */
function specialRule(customer: RareCustomer, dish: DishOption): { rating: Rating; note: string; mode: "min" | "force" } | null {
  const usesIngredient = (name: string) => dish.recipe.ingredients.includes(name) || dish.extras.some((e) => e.name === name);
  if (customer.name === "Nitori Kawashiro" && usesIngredient("Cucumber"))
    return { rating: Rating.Orange, note: "Nitori ได้แตงกวา: อย่างน้อยส้ม", mode: "min" };
  if (customer.name === "Remilia Scarlet" && dish.recipe.name === "Scarlet Devil Cake")
    return { rating: Rating.Pink, note: "Remilia ได้เค้กทรงหมวกตัวเอง: ชมพูเสมอ", mode: "force" };
  if (customer.name === "Koishi Komeiji" && dish.recipe.name === "Unconscious Youkai Mousse")
    return { rating: Rating.Black, note: "Koishi ได้มูสทรงหมวกตัวเอง: ดำเสมอ", mode: "force" };
  if (customer.name === "Medicine Melancholy" && dish.dish.conflicts.length > 0)
    return { rating: Rating.Orange, note: "Medicine ได้ Dark Matter: อย่างน้อยส้ม", mode: "min" };
  return null;
}

/** Like scoreDish, but a dish with a banned tag is scored as Dark Matter (−2, request not met). */
function scoreAnyDish(order: RareOrder, recipe: Recipe, extras: Ingredient[]): DishOption {
  const opt = scoreDish(order, recipe, extras);
  if (opt) return opt;
  const dish = computeDishTags(recipe, extras, order.trend);
  return {
    recipe,
    extras,
    dish: { ...dish, tags: [DARK_MATTER] },
    liked: [],
    disliked: [],
    score: -2,
    requestMet: false,
    extraCost: extras.reduce((sum, e) => sum + e.price, 0),
    substitutes: [],
  };
}

function drinkOption(order: RareOrder, beverage: Beverage): DrinkOption {
  const liked = beverage.tags.filter((t) => order.customer.likedDrinkTags.includes(t));
  return {
    beverage,
    liked,
    score: liked.length,
    requestMet: order.drinkRequest === null || beverage.tags.includes(order.drinkRequest),
  };
}

/** Rates one specific dish (recipe + extras) and drink for the order. */
export function evaluateCombo(order: RareOrder, recipe: Recipe, extras: Ingredient[], beverage: Beverage): Suggestion {
  return combine(order, scoreAnyDish(order, recipe, extras), drinkOption(order, beverage));
}

export interface IngredientEffect {
  ingredient: Ingredient;
  result: Suggestion;
  /** Score change compared with the dish without this ingredient. */
  delta: number;
  gainedTags: string[];
  lostTags: string[];
  darkMatter: boolean;
}

/** What adding each ingredient would do to the current dish. Empty when the dish already has 5 ingredients. */
export function ingredientEffects(
  order: RareOrder,
  recipe: Recipe,
  extras: Ingredient[],
  beverage: Beverage,
  ingredients: readonly Ingredient[],
): IngredientEffect[] {
  if (recipe.ingredients.length + extras.length >= MAX_INGREDIENTS) return [];
  const current = evaluateCombo(order, recipe, extras, beverage);
  const before = new Set(current.dish.dish.tags);
  return ingredients
    .map((ingredient) => {
      const result = evaluateCombo(order, recipe, [...extras, ingredient], beverage);
      const after = new Set(result.dish.dish.tags);
      return {
        ingredient,
        result,
        delta: result.score - current.score,
        gainedTags: [...after].filter((t) => !before.has(t)),
        lostTags: [...before].filter((t) => !after.has(t)),
        darkMatter: result.dish.dish.conflicts.length > 0,
      };
    })
    .sort(
      (a, b) =>
        Number(a.darkMatter) - Number(b.darkMatter) ||
        b.result.rating - a.result.rating ||
        b.delta - a.delta ||
        a.ingredient.price - b.ingredient.price,
    );
}

function scoreDish(order: RareOrder, recipe: Recipe, extras: Ingredient[]): DishOption | null {
  const dish = computeDishTags(recipe, extras, order.trend);
  if (dish.conflicts.length > 0) return null;
  const { likedFoodTags, dislikedFoodTags } = order.customer;
  const liked = dish.tags.filter((t) => likedFoodTags.includes(t));
  const disliked = dish.tags.filter((t) => dislikedFoodTags.includes(t));
  return {
    recipe,
    extras,
    dish,
    liked,
    disliked,
    score: liked.length - disliked.length,
    requestMet: order.foodRequest === null || dish.tags.includes(order.foodRequest),
    extraCost: extras.reduce((sum, e) => sum + e.price, 0),
    substitutes: [],
  };
}

export function rankDrinks(order: RareOrder, beverages: readonly Beverage[]): DrinkOption[] {
  return beverages
    .map((beverage) => drinkOption(order, beverage))
    .sort((a, b) => Number(b.requestMet) - Number(a.requestMet) || b.score - a.score || a.beverage.price - b.beverage.price);
}

/** Tags an extra ingredient can usefully add for this order: liked, requested, trending, or overriding a disliked tag. */
function wantedTags(order: RareOrder): Set<string> {
  const { likedFoodTags, dislikedFoodTags } = order.customer;
  const wanted = new Set(likedFoodTags);
  if (order.foodRequest) wanted.add(order.foodRequest);
  if (likedFoodTags.includes(TREND_POPULAR)) for (const t of order.trend.popular) wanted.add(t);
  if (likedFoodTags.includes(TREND_UNPOPULAR)) for (const t of order.trend.unpopular) wanted.add(t);
  for (const [winner, loser] of TAG_OVERRIDES) if (dislikedFoodTags.includes(loser)) wanted.add(winner);
  return wanted;
}

/**
 * Extras worth trying on `recipe`: not banned, and adding at least one wanted tag the recipe lacks.
 * Ingredients that would add exactly the same new tags give identical dishes, so the search uses the
 * cheapest one and the others are reported as substitutes.
 * The filler is the cheapest harmless ingredient, used only to reach 5 ingredients for Large Portion.
 */
function candidateExtras(
  order: RareOrder,
  recipe: Recipe,
  ingredients: readonly Ingredient[],
  wanted: Set<string>,
): { useful: Ingredient[]; substitutes: Map<string, Ingredient[]>; filler: Ingredient | null } {
  const disliked = order.customer.dislikedFoodTags;
  const bySignature = new Map<string, Ingredient[]>();
  let filler: Ingredient | null = null;
  for (const ing of ingredients) {
    if (ing.tags.some((t) => recipe.bannedTags.includes(t))) continue;
    const newTags = ing.tags.filter((t) => !recipe.tags.includes(t));
    if (newTags.some((t) => wanted.has(t))) {
      const sig = newTags.sort().join("|");
      bySignature.set(sig, [...(bySignature.get(sig) ?? []), ing]);
    } else if (!newTags.some((t) => disliked.includes(t)) && (!filler || ing.price < filler.price)) {
      filler = ing;
    }
  }
  const useful: Ingredient[] = [];
  const substitutes = new Map<string, Ingredient[]>();
  for (const group of bySignature.values()) {
    const [cheapest, ...rest] = group.sort((a, b) => a.price - b.price);
    useful.push(cheapest);
    substitutes.set(cheapest.name, rest);
  }
  return { useful, substitutes, filler };
}

/** All subsets of `items` with exactly `size` elements. */
function* combinations<T>(items: readonly T[], size: number, start = 0, current: T[] = []): Generator<T[]> {
  if (current.length === size) {
    yield current;
    return;
  }
  for (let i = start; i <= items.length - (size - current.length); i++) {
    current.push(items[i]);
    yield* combinations(items, size, i + 1, current);
    current.pop();
  }
}

/** How many dish variants to keep per number of extras, so equally good alternatives can be shown. */
const VARIANTS_PER_SIZE = 6;

/** The best few dish variants per number of extras, for one recipe. */
function dishVariants(order: RareOrder, recipe: Recipe, ingredients: readonly Ingredient[], wanted: Set<string>): DishOption[] {
  const slots = Math.max(0, MAX_INGREDIENTS - recipe.ingredients.length);
  const { useful, substitutes, filler } = candidateExtras(order, recipe, ingredients, wanted);
  const padForLargePortion = wantsLargePortion(order);
  const bySize = new Map<number, DishOption[]>();
  const consider = (extras: Ingredient[]) => {
    const opt = scoreDish(order, recipe, extras);
    if (!opt) return;
    const kept = bySize.get(extras.length) ?? [];
    if (kept.length === VARIANTS_PER_SIZE && compareDish(opt, kept[kept.length - 1]) >= 0) return;
    kept.push(opt);
    kept.sort(compareDish);
    if (kept.length > VARIANTS_PER_SIZE) kept.pop();
    bySize.set(extras.length, kept);
  };
  // Any drink meeting the drink request scores at least 1, because requests come from liked tags.
  const pinkDishScore = Rating.Pink - (order.drinkRequest ? 1 : 0);
  for (let size = 0; size <= slots; size++) {
    for (const combo of combinations(useful, size)) {
      consider([...combo]);
      // Duplicates add no new tags; the only reason to repeat an ingredient is to reach 5 for Large Portion.
      if (padForLargePortion && combo.length < slots) {
        const pad = filler ?? combo[0];
        if (pad) consider([...combo, ...Array<Ingredient>(slots - combo.length).fill(pad)]);
      }
    }
    // Fewer extras rank higher at equal rating, so once this size guarantees pink, larger sizes can't win.
    const best = bySize.get(size)?.[0];
    if (best && best.requestMet && best.score >= pinkDishScore) break;
  }
  const variants = [...bySize.values()].flat();
  for (const v of variants) v.substitutes = v.extras.map((e) => substitutes.get(e.name) ?? []);
  return variants;
}

function wantsLargePortion(order: RareOrder): boolean {
  const c = order.customer;
  return c.likedFoodTags.includes(LARGE_PORTION) || c.dislikedFoodTags.includes("Small Portion") || order.foodRequest === LARGE_PORTION;
}

function compareDish(a: DishOption, b: DishOption): number {
  return Number(b.requestMet) - Number(a.requestMet) || b.score - a.score || a.extraCost - b.extraCost;
}

function compareSuggestion(a: Suggestion, b: Suggestion): number {
  return (
    b.rating - a.rating ||
    BUDGET_ORDER[a.budget] - BUDGET_ORDER[b.budget] ||
    a.dish.extras.length - b.dish.extras.length ||
    b.score - a.score ||
    b.totalPrice - a.totalPrice ||
    a.dish.extraCost - b.dish.extraCost
  );
}

function combine(order: RareOrder, dish: DishOption, drink: DrinkOption): Suggestion {
  const score = dish.score + drink.score;
  const requestsMet = Number(dish.requestMet) + Number(drink.requestMet);
  const uncappedRating = ratingFromScore(score);
  let rating = Math.min(uncappedRating, ratingCap(requestsMet)) as Rating;
  const special = specialRule(order.customer, dish);
  if (special) rating = special.mode === "force" ? special.rating : (Math.max(rating, special.rating) as Rating);
  const totalPrice = dish.recipe.price + drink.beverage.price;
  return {
    dish,
    drink,
    score,
    rating,
    uncappedRating,
    requestsMet,
    totalPrice,
    budget: budgetStatus(totalPrice, order.customer),
    note: special?.note ?? null,
    alternatives: [],
    altDrinks: [],
  };
}

const MAX_ALTERNATIVES = 4;
const MAX_ALT_DRINKS = 4;

/** Returns the best suggestion per recipe, best first, each with equally rated alternatives. */
export function solveRareOrder(order: RareOrder, pool: SolverPool, limit = 50): RareSolution {
  const drinks = rankDrinks(order, pool.beverages);
  const wanted = wantedTags(order);

  const suggestions: Suggestion[] = [];
  for (const recipe of pool.recipes) {
    if (recipe.name === "Dark Matter") continue;
    const perVariant: Suggestion[] = [];
    for (const dish of dishVariants(order, recipe, pool.ingredients, wanted)) {
      const combos = drinks.map((drink) => combine(order, dish, drink)).sort(compareSuggestion);
      const [best, ...others] = combos;
      if (!best) continue;
      best.altDrinks = others
        .filter((s) => s.rating === best.rating && s.budget === best.budget)
        .slice(0, MAX_ALT_DRINKS)
        .map((s) => s.drink);
      perVariant.push(best);
    }
    if (perVariant.length === 0) continue;
    perVariant.sort(compareSuggestion);
    const [best, ...rest] = perVariant;
    best.alternatives = rest.filter((s) => s.rating === best.rating && s.budget === best.budget).slice(0, MAX_ALTERNATIVES);
    suggestions.push(best);
  }
  suggestions.sort(compareSuggestion);
  return { suggestions: suggestions.slice(0, limit), drinks };
}
