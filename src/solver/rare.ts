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

export interface RareOrder {
  customer: RareCustomer;
  /** null = no specific request (planning mode). */
  foodRequest: string | null;
  drinkRequest: string | null;
  trend: Trend;
}

/**
 * What makes a set worth serving. Each factor is scored 0-1 against the other sets for the same order
 * (1 = best of them); a set's value is the weighted average of its factor scores.
 *  - profit: dish price minus ingredient cost (higher is better)
 *  - cost: value of everything used, ingredients and drink (lower is better)
 *  - rarity: highest level among the ingredients and the drink (lower is better, keeps rare stock)
 *  - speed: cooking time (shorter is better)
 *  - cheap: total price (lower is better, so the guest's budget lasts for more orders)
 *  - revenue: total price (higher is better, more money per order)
 *  - extras: number of extra ingredients (fewer is better)
 *  - budget: 1 within the guest's lower budget, 0.5 if unknown, 0 if it may go over
 */
export type Factor = "profit" | "cost" | "rarity" | "speed" | "cheap" | "revenue" | "extras" | "budget";
export const FACTORS: Factor[] = ["profit", "cost", "rarity", "speed", "cheap", "revenue", "extras", "budget"];
export type Weights = Partial<Record<Factor, number>>;

/**
 * Ready-made weightings. Rating always comes first, sets over the guest's budget last, and points above
 * what a rating needs never count (every pink set is equally good); the weights order the rest.
 */
export type Preset = "balanced" | "save" | "profit" | "fast" | "stay";
export const PRESET_IDS: Preset[] = ["balanced", "save", "profit", "fast", "stay"];
export const PRESETS: Record<Preset, Weights> = {
  balanced: { profit: 2, rarity: 2, cost: 1, speed: 1, extras: 1, budget: 1 },
  save: { rarity: 3, cost: 2, extras: 1 },
  profit: { profit: 3, revenue: 1, rarity: 1, budget: 1 },
  fast: { speed: 4, profit: 1, cost: 1 },
  stay: { cheap: 3, profit: 2, budget: 1 },
};
export const DEFAULT_PRESET: Preset = "balanced";

/** Every ingredient by name, used to price and level the recipe's own ingredients. */
export type Catalog = ReadonlyMap<string, Ingredient>;
export const makeCatalog = (list: readonly Ingredient[]): Catalog => new Map(list.map((i) => [i.name, i]));

export interface SolverPool {
  recipes: readonly Recipe[];
  ingredients: readonly Ingredient[];
  beverages: readonly Beverage[];
  /** All ingredients, for recipes whose own ingredients aren't in `ingredients`; defaults to `ingredients`. */
  catalog?: Catalog;
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
  /**
   * Value of every ingredient in the pot (the recipe's own plus the extras), from the wiki. Merchants charge
   * 30-150% of this and gathered ingredients are free, so it is for comparing sets, not an exact cost.
   */
  ingredientCost: number;
  /** Highest ingredient level in the pot, as a measure of how rare the ingredients are. */
  topLevel: number;
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
  /** Character-specific reaction that overrides the usual rating; the UI translates it. */
  note: SpecialNote | null;
  /** Score 0-1 per factor, relative to the other sets for the same order (0 outside solveRareOrder). */
  factors: Record<Factor, number>;
  /** Weighted average of `factors` under the weights the order was solved with, 0-1. */
  value: number;
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
export type SpecialNote = "nitori-cucumber" | "remilia-cake" | "koishi-mousse" | "medicine-dark-matter";

function specialRule(customer: RareCustomer, dish: DishOption): { rating: Rating; note: SpecialNote; mode: "min" | "force" } | null {
  const usesIngredient = (name: string) => dish.recipe.ingredients.includes(name) || dish.extras.some((e) => e.name === name);
  if (customer.name === "Nitori Kawashiro" && usesIngredient("Cucumber"))
    return { rating: Rating.Orange, note: "nitori-cucumber", mode: "min" };
  if (customer.name === "Remilia Scarlet" && dish.recipe.name === "Scarlet Devil Cake")
    return { rating: Rating.Pink, note: "remilia-cake", mode: "force" };
  if (customer.name === "Koishi Komeiji" && dish.recipe.name === "Unconscious Youkai Mousse")
    return { rating: Rating.Black, note: "koishi-mousse", mode: "force" };
  if (customer.name === "Medicine Melancholy" && dish.dish.conflicts.length > 0)
    return { rating: Rating.Orange, note: "medicine-dark-matter", mode: "min" };
  return null;
}

/** Cost and top level of the recipe's own ingredients. */
function baseMetrics(recipe: Recipe, catalog: Catalog): { cost: number; topLevel: number } {
  let cost = 0;
  let topLevel = 0;
  for (const name of recipe.ingredients) {
    const ing = catalog.get(name);
    cost += ing?.price ?? 0;
    topLevel = Math.max(topLevel, ing?.level ?? 0);
  }
  return { cost, topLevel };
}

function costFields(recipe: Recipe, extras: Ingredient[], catalog: Catalog) {
  const base = baseMetrics(recipe, catalog);
  const extraCost = extras.reduce((sum, e) => sum + e.price, 0);
  return {
    extraCost,
    ingredientCost: base.cost + extraCost,
    topLevel: Math.max(base.topLevel, ...extras.map((e) => e.level)),
  };
}

/** Like scoreDish, but a dish with a banned tag is scored as Dark Matter (−2, request not met). */
function scoreAnyDish(order: RareOrder, recipe: Recipe, extras: Ingredient[], catalog: Catalog): DishOption {
  const opt = scoreDish(order, recipe, extras, catalog);
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
    ...costFields(recipe, extras, catalog),
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
export function evaluateCombo(
  order: RareOrder,
  recipe: Recipe,
  extras: Ingredient[],
  beverage: Beverage,
  catalog: Catalog = makeCatalog(extras),
): Suggestion {
  return combine(order, scoreAnyDish(order, recipe, extras, catalog), drinkOption(order, beverage));
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
  catalog: Catalog = makeCatalog(ingredients),
): IngredientEffect[] {
  if (recipe.ingredients.length + extras.length >= MAX_INGREDIENTS) return [];
  const current = evaluateCombo(order, recipe, extras, beverage, catalog);
  const before = new Set(current.dish.dish.tags);
  return ingredients
    .map((ingredient) => {
      const result = evaluateCombo(order, recipe, [...extras, ingredient], beverage, catalog);
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

function scoreDish(order: RareOrder, recipe: Recipe, extras: Ingredient[], catalog: Catalog): DishOption | null {
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
    ...costFields(recipe, extras, catalog),
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

/** How many dish variants to keep per number of extras, for each of the two orderings (cheapest, rarest-free). */
const VARIANTS_PER_SIZE = 3;

/**
 * Candidate extra-ingredient choices for one recipe: per number of extras, the cheapest few and the few with the
 * lowest top ingredient level. Any weighting of the factors prefers one of these, since a set's other factors
 * (price, cooking time, budget) don't depend on which extras it uses.
 */
function dishVariants(
  order: RareOrder,
  recipe: Recipe,
  ingredients: readonly Ingredient[],
  wanted: Set<string>,
  catalog: Catalog,
): DishOption[] {
  const slots = Math.max(0, MAX_INGREDIENTS - recipe.ingredients.length);
  const { useful, substitutes, filler } = candidateExtras(order, recipe, ingredients, wanted);
  const padForLargePortion = wantsLargePortion(order);
  // Any drink meeting the drink request scores at least 1, because requests come from liked tags.
  const pinkDishScore = Rating.Pink - (order.drinkRequest ? 1 : 0);
  const byCost = (a: DishOption, b: DishOption) =>
    compareDish(a, b, pinkDishScore) || a.ingredientCost - b.ingredientCost || a.topLevel - b.topLevel;
  const byLevel = (a: DishOption, b: DishOption) =>
    compareDish(a, b, pinkDishScore) || a.topLevel - b.topLevel || a.ingredientCost - b.ingredientCost;
  const cheapest = new Map<number, DishOption[]>();
  const lowest = new Map<number, DishOption[]>();
  const keep = (store: Map<number, DishOption[]>, opt: DishOption, cmp: (a: DishOption, b: DishOption) => number) => {
    const kept = store.get(opt.extras.length) ?? [];
    if (kept.length === VARIANTS_PER_SIZE && cmp(opt, kept[kept.length - 1]) >= 0) return;
    kept.push(opt);
    kept.sort(cmp);
    if (kept.length > VARIANTS_PER_SIZE) kept.pop();
    store.set(opt.extras.length, kept);
  };
  const pink: { cost: number; level: number }[] = [];
  const consider = (extras: Ingredient[]) => {
    const opt = scoreDish(order, recipe, extras, catalog);
    if (!opt) return;
    if (opt.requestMet && opt.score >= pinkDishScore) pink.push({ cost: opt.ingredientCost, level: opt.topLevel });
    keep(cheapest, opt, byCost);
    keep(lowest, opt, byLevel);
  };
  // Lower bounds for any set of `n` extras. Sets are distinct useful ingredients, except Large Portion
  // padding, which may repeat the filler.
  const candidates = [...useful, ...(filler ? [filler] : [])];
  const cheapestExtra = Math.min(...candidates.map((i) => i.price));
  const lowestLevel = Math.min(...candidates.map((i) => i.level));
  const prices = useful.map((i) => i.price).sort((a, b) => a - b);
  const cheapestN = (n: number) =>
    padForLargePortion ? n * cheapestExtra : n > prices.length ? Infinity : prices.slice(0, n).reduce((s, p) => s + p, 0);
  const base = baseMetrics(recipe, catalog);
  for (let size = 0; size <= slots; size++) {
    for (const combo of combinations(useful, size)) {
      consider([...combo]);
      // Duplicates add no new tags; the only reason to repeat an ingredient is to reach 5 for Large Portion.
      if (padForLargePortion && combo.length < slots) {
        const pad = filler ?? combo[0];
        if (pad) consider([...combo, ...Array<Ingredient>(slots - combo.length).fill(pad)]);
      }
    }
    // A larger set has more extras, so it can only rank higher by costing less or using lower-level
    // ingredients. Stop once a pink set already found is at least as cheap and as low-level as any larger set could be.
    const costBound = base.cost + cheapestN(size + 1);
    const levelBound = Math.max(base.topLevel, lowestLevel);
    if (pink.some((p) => p.cost <= costBound && p.level <= levelBound)) break;
  }
  const variants = [...new Set([...cheapest.values(), ...lowest.values()].flat())];
  for (const v of variants) v.substitutes = v.extras.map((e) => substitutes.get(e.name) ?? []);
  return variants;
}

function wantsLargePortion(order: RareOrder): boolean {
  const c = order.customer;
  return c.likedFoodTags.includes(LARGE_PORTION) || c.dislikedFoodTags.includes("Small Portion") || order.foodRequest === LARGE_PORTION;
}

/** Points beyond `enough` (what pink needs) don't make a dish better, so they're capped before comparing. */
function compareDish(a: DishOption, b: DishOption, enough: number): number {
  return Number(b.requestMet) - Number(a.requestMet) || Math.min(b.score, enough) - Math.min(a.score, enough);
}

/** Dish price minus the value of its ingredients (an estimate; see DishOption.ingredientCost). */
export const dishProfit = (s: Suggestion) => s.dish.recipe.price - s.dish.ingredientCost;

/**
 * Value of everything a set uses up: the ingredients plus the drink. On this basis a drink's value equals its
 * price, so serving it adds nothing to profit; what it costs is the drink itself.
 */
export const setCost = (s: Suggestion) => s.dish.ingredientCost + s.drink.beverage.price;

/** Highest level among the set's ingredients and its drink. */
export const setTopLevel = (s: Suggestion) => Math.max(s.dish.topLevel, s.drink.beverage.level);

/** Weighted average of a set's factor scores, 0-1. */
export function valueOf(factors: Record<Factor, number>, weights: Weights): number {
  let sum = 0;
  let total = 0;
  for (const f of FACTORS) {
    const w = weights[f] ?? 0;
    sum += w * factors[f];
    total += w;
  }
  return total > 0 ? sum / total : 0;
}

const BUDGET_FACTOR: Record<BudgetStatus, number> = { safe: 1, unknown: 0.5, risky: 0, over: 0 };

/** Scores each candidate 0-1 on every factor, relative to the other candidates (1 = best of them). */
function scoreFactors(all: Suggestion[]): void {
  const pool = all.some((s) => s.budget !== "over") ? all.filter((s) => s.budget !== "over") : all;
  const raw: Record<Exclude<Factor, "budget">, (s: Suggestion) => number> = {
    profit: dishProfit,
    cost: setCost,
    rarity: setTopLevel,
    speed: (s) => s.dish.recipe.cookTime,
    cheap: (s) => s.totalPrice,
    revenue: (s) => s.totalPrice,
    extras: (s) => s.dish.extras.length,
  };
  const higherIsBetter = new Set<Factor>(["profit", "revenue"]);
  const ranges = Object.fromEntries(
    Object.entries(raw).map(([f, get]) => {
      const values = pool.map(get);
      return [f, { min: Math.min(...values), max: Math.max(...values) }];
    }),
  ) as Record<keyof typeof raw, { min: number; max: number }>;
  for (const s of all) {
    const factors = { budget: BUDGET_FACTOR[s.budget] } as Record<Factor, number>;
    for (const [f, get] of Object.entries(raw) as [keyof typeof raw, (s: Suggestion) => number][]) {
      const { min, max } = ranges[f];
      const t = max === min ? 1 : Math.min(1, Math.max(0, (get(s) - min) / (max - min)));
      factors[f] = higherIsBetter.has(f) ? t : 1 - t;
    }
    s.factors = factors;
  }
}

/**
 * Rating first, over-budget last, then value (as already set on each suggestion); at equal value, the set that
 * uses up less stock. Points above the rating don't count.
 */
export function suggestionComparator(): (a: Suggestion, b: Suggestion) => number {
  const over = (s: Suggestion) => Number(s.budget === "over");
  return (a, b) =>
    b.rating - a.rating ||
    over(a) - over(b) ||
    b.value - a.value ||
    setCost(a) - setCost(b) ||
    a.dish.extras.length - b.dish.extras.length ||
    a.dish.recipe.name.localeCompare(b.dish.recipe.name);
}

const NO_FACTORS = Object.fromEntries(FACTORS.map((f) => [f, 0])) as Record<Factor, number>;

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
    factors: NO_FACTORS,
    value: 0,
    alternatives: [],
    altDrinks: [],
  };
}

const MAX_ALTERNATIVES = 4;
const MAX_ALT_DRINKS = 4;

/**
 * Returns the best suggestion per recipe, best first, each with equally rated alternatives. Sets are ranked by
 * rating, then over-budget last, then by value under `weights` (see PRESETS).
 */
export function solveRareOrder(
  order: RareOrder,
  pool: SolverPool,
  limit = 50,
  weights: Weights = PRESETS[DEFAULT_PRESET],
): RareSolution {
  const drinks = rankDrinks(order, pool.beverages);
  const wanted = wantedTags(order);
  const catalog = pool.catalog ?? makeCatalog(pool.ingredients);

  // 1. Candidates: per recipe, per kept dish variant, each drink that gives the variant its best rating.
  const groups: Suggestion[][][] = [];
  for (const recipe of pool.recipes) {
    if (recipe.name === "Dark Matter") continue;
    const perVariant: Suggestion[][] = [];
    for (const dish of dishVariants(order, recipe, pool.ingredients, wanted, catalog)) {
      const combos = drinks.map((drink) => combine(order, dish, drink));
      const top = Math.max(...combos.map((c) => c.rating));
      perVariant.push(combos.filter((c) => c.rating === top));
    }
    if (perVariant.length > 0) groups.push(perVariant);
  }

  // 2. Score every candidate against the others for this order.
  const all = groups.flat(2);
  scoreFactors(all);
  for (const s of all) s.value = valueOf(s.factors, weights);
  const compare = suggestionComparator();

  // 3. Best set per recipe, with the recipe's other equally rated variants and drinks.
  const suggestions: Suggestion[] = [];
  for (const perVariant of groups) {
    const bestPerVariant = perVariant.map((combos) => combos.sort(compare)[0]);
    const ranked = bestPerVariant.map((s, i) => ({ s, i })).sort((a, b) => compare(a.s, b.s));
    const { s: best, i: bestIndex } = ranked[0];
    best.altDrinks = perVariant[bestIndex]
      .filter((s) => s !== best && s.budget === best.budget)
      .slice(0, MAX_ALT_DRINKS)
      .map((s) => s.drink);
    best.alternatives = ranked
      .slice(1)
      .map((x) => x.s)
      .filter((s) => s.rating === best.rating && s.budget === best.budget)
      .slice(0, MAX_ALTERNATIVES);
    suggestions.push(best);
  }
  suggestions.sort(compare);
  return { suggestions: suggestions.slice(0, limit), drinks };
}
