import { useDeferredValue, useMemo, useState } from "react";
import type { Ingredient, RareCustomer } from "../data";
import { useAvailablePool, useGameData, useStore } from "../store";
import { TrendPicker } from "../components/TrendPicker";
import { CookwarePicker } from "../components/CookwarePicker";
import { FoodRequestPicker } from "../components/QuoteParts";
import { NightPanel, type PinnedGuestView } from "../components/NightPanel";
import { IngredientHints } from "../components/IngredientHints";
import { SpellCards } from "../components/SpellCards";
import { GuestTabs, type SeatedGuest } from "../components/GuestTabs";
import { addGuest, removeGuest, setActiveGuest, setGuestOrder } from "../guests";
import { isSetPinned, pinnedGuestNames, removeGuestPins, togglePinnedSet, type PinnedSet } from "../pins";
import {
  evaluateCombo,
  ingredientEffects,
  rankDrinks,
  solveRareOrder,
  Rating,
  type BudgetStatus,
  type DrinkOption,
  FACTORS,
  PRESETS,
  PRESET_IDS,
  dishProfit,
  makeCatalog,
  setCost,
  setTopLevel,
  valueOf,
  type Preset,
  type RareOrder,
  type Suggestion,
} from "../solver/rare";
import { MAX_INGREDIENTS, TREND_POPULAR, TREND_UNPOPULAR } from "../solver/tags";
import { ItemImage } from "../components/ItemImage";
import { useT, type MessageKey, type Translate } from "../i18n";

const RATING_CLASS: Record<Rating, "pink" | "orange" | "green" | "purple" | "black"> = {
  [Rating.Pink]: "pink",
  [Rating.Orange]: "orange",
  [Rating.Green]: "green",
  [Rating.Purple]: "purple",
  [Rating.Black]: "black",
};
const ratingLabel = (r: Rating, t: Translate) => t(`rating.${RATING_CLASS[r]}`);
const budgetLabel = (b: BudgetStatus, t: Translate) => t(`budget.${b}`);

type SortKey = "best" | "price" | "profit" | "cost" | "topLevel" | "score" | "extras" | "level" | "cookTime" | "name";
const SORTS: { key: SortKey; value: (s: Suggestion) => number | string }[] = [
  { key: "best", value: () => 0 },
  { key: "price", value: (s) => s.totalPrice },
  { key: "profit", value: dishProfit },
  { key: "cost", value: setCost },
  { key: "topLevel", value: setTopLevel },
  { key: "score", value: (s) => s.score },
  { key: "extras", value: (s) => s.dish.extras.length },
  { key: "level", value: (s) => s.dish.recipe.level },
  { key: "cookTime", value: (s) => s.dish.cookTime },
  { key: "name", value: (s) => s.dish.recipe.name },
];

interface Draft {
  recipe: string;
  extras: string[];
  beverage: string;
}

/** Why a set falls short of the requests, or the character-specific reaction that decides its rating. */
function warningFor(s: Suggestion, t: Translate): string | null {
  if (s.note) return t(`note.${s.note}`);
  if (s.dish.dish.conflicts.length) return t("builder.darkMatter", { tags: s.dish.dish.conflicts.join(", ") });
  if (s.requestsMet === 1) return t("rare.oneRequest");
  if (s.requestsMet === 0) return t("rare.noRequest");
  return null;
}

export function RareSolverPage() {
  const t = useT();
  const pool = useAvailablePool();
  const data = useGameData();
  const { state, setTrend, setCookware, updateGuests, setRanking, updatePins, clearNight, setStickyGuests } = useStore();
  const { trend, guests, ranking, pins } = state;
  const [sortKey, setSortKey] = useState<SortKey>("best");
  const [descending, setDescending] = useState(false);
  // Night Sparrow cookware in Hyper mode / after a perfect Sparrow Tune. Not saved: it only lasts a moment.
  const [ignoreRequests, setIgnoreRequests] = useState(false);
  // Hand-tuned sets, kept per guest so switching tabs doesn't lose them.
  const [drafts, setDrafts] = useState<Record<string, Draft | undefined>>({});
  const [sideTab, setSideTab] = useState<"drinks" | "ingredients">("ingredients");

  // The recipe's own ingredients are priced from the full list, even ones not unlocked or owned.
  const solverPool = useMemo(() => ({ ...pool, catalog: makeCatalog(data.ingredients) }), [pool, data.ingredients]);

  // Seated guests stay listed even if a settings change hides them from the picker.
  const seated = useMemo(
    () =>
      guests.list.flatMap((order) => {
        const customer = data.rareCustomers.find((c) => c.name === order.name);
        return customer ? [{ order, customer }] : [];
      }),
    [guests.list, data.rareCustomers],
  );
  // Best rating per guest for the tab dots; only for guests whose order has a tag picked.
  const seatedWithBest = useMemo<SeatedGuest[]>(
    () =>
      seated.map(({ order, customer }) => {
        if (customer.undocumented || (!ignoreRequests && !order.food && !order.drink)) return { order, customer, best: null };
        const top = solveRareOrder(
          { customer, foodRequest: order.food, drinkRequest: order.drink, trend, ignoreRequests },
          solverPool,
          1,
        ).suggestions[0];
        return { order, customer, best: top?.rating ?? null };
      }),
    [seated, trend, solverPool, ignoreRequests],
  );

  const current = seated.find((s) => s.order.name === guests.active) ?? null;
  const customer = current?.customer ?? null;
  const foodRequest = current?.order.food ?? null;
  const drinkRequest = current?.order.drink ?? null;
  const draft = customer ? (drafts[customer.name] ?? null) : null;
  const setDraft = (d: Draft | null) => customer && setDrafts((all) => ({ ...all, [customer.name]: d ?? undefined }));
  const setFoodRequest = (food: string | null) => customer && updateGuests((g) => setGuestOrder(g, customer.name, { food }));
  const setDrinkRequest = (drink: string | null) => customer && updateGuests((g) => setGuestOrder(g, customer.name, { drink }));

  const order = useMemo<RareOrder | null>(
    () => (customer ? { customer, foodRequest, drinkRequest, trend, ignoreRequests } : null),
    [customer, foodRequest, drinkRequest, trend, ignoreRequests],
  );
  const deferredOrder = useDeferredValue(order);
  const solution = useMemo(
    () =>
      deferredOrder && !deferredOrder.customer.undocumented
        ? solveRareOrder(deferredOrder, solverPool, 1000, PRESETS[ranking.preset])
        : null,
    [deferredOrder, solverPool, ranking.preset],
  );
  const stale = deferredOrder !== order;

  const sorted = useMemo(() => {
    if (!solution) return [];
    const sort = SORTS.find((s) => s.key === sortKey)!;
    const indexed = solution.suggestions.map((s, i) => ({ s, i }));
    indexed.sort((a, b) => {
      const va = sort.value(a.s);
      const vb = sort.value(b.s);
      const cmp = typeof va === "string" ? va.localeCompare(vb as string) : va - (vb as number);
      return (descending ? -cmp : cmp) || a.i - b.i;
    });
    const list = indexed.map((x) => x.s);
    return ranking.pinkOnly ? list.filter((s) => s.rating === Rating.Pink) : list;
  }, [solution, sortKey, descending, ranking.pinkOnly]);

  const pick = (s: Suggestion) =>
    setDraft({ recipe: s.dish.recipe.name, extras: s.dish.extras.map((e) => e.name), beverage: s.drink.beverage.name });
  const pinOf = (guest: string, d: Draft): PinnedSet => ({ guest, recipe: d.recipe, extras: d.extras, beverage: d.beverage });
  const draftOf = (s: Suggestion): Draft => ({
    recipe: s.dish.recipe.name,
    extras: s.dish.extras.map((e) => e.name),
    beverage: s.drink.beverage.name,
  });

  // Pinned sets grouped by guest, each rated against that guest's current order.
  const pinnedViews = useMemo<PinnedGuestView[]>(() => {
    const byName = <T extends { name: string }>(list: readonly T[], name: string) => list.find((x) => x.name === name);
    return pinnedGuestNames(pins).flatMap((name) => {
      const c = byName(data.rareCustomers, name);
      if (!c) return [];
      const go = guests.list.find((g) => g.name === name) ?? null;
      const guestOrder: RareOrder = { customer: c, foodRequest: go?.food ?? null, drinkRequest: go?.drink ?? null, trend, ignoreRequests };
      const sets = pins.sets
        .filter((s) => s.guest === name)
        .map((set) => {
          const recipe = byName(data.recipes, set.recipe);
          const beverage = byName(data.beverages, set.beverage);
          const extras = set.extras.map((e) => byName(data.ingredients, e)).filter((x): x is Ingredient => !!x);
          const result = recipe && beverage ? evaluateCombo(guestOrder, recipe, extras, beverage, solverPool.catalog) : null;
          return { set, result };
        });
      return [{ customer: c, order: go, sets }];
    });
  }, [pins, guests.list, data, trend, ignoreRequests, solverPool.catalog]);

  if (pool.rareCustomers.length === 0 && seated.length === 0) {
    return (
      <div className="page">
        <p className="hint">{t("rare.noCustomers")}</p>
      </div>
    );
  }

  return (
    <div className={`page solver ${state.stickyGuests ? "has-sticky-guests" : ""}`}>
      <GuestTabs
        seated={seatedWithBest}
        active={guests.active}
        customers={pool.rareCustomers}
        onSelect={(name) => updateGuests((g) => setActiveGuest(g, name))}
        sticky={state.stickyGuests}
        canClear={guests.list.length > 0 || pins.sets.length > 0}
        onRemove={(name) => {
          updateGuests((g) => removeGuest(g, name));
          updatePins((p) => removeGuestPins(p, name));
          setDrafts((all) => ({ ...all, [name]: undefined }));
        }}
        onAdd={(name) => updateGuests((g) => addGuest(g, name))}
        onToggleSticky={() => setStickyGuests(!state.stickyGuests)}
        onClearNight={() => {
          clearNight();
          setDrafts({});
        }}
      />

      {customer && order && (
        <>
          <section className="order" aria-label={t("rare.order")}>
            <ItemImage src={customer.image} name={customer.shortName} size={76} variant="portrait" />
            <div className="order-body">
              <div className="order-row">
                <h2 className="order-name">{customer.name}</h2>
                <div className="budget">
                  <span>{t("rare.budget")}</span>
                  <strong>{customer.budget ? `${customer.budget.min}–${customer.budget.max}` : "?"}</strong>
                </div>
              </div>

              {customer.undocumented ? (
                <p className="hint">{t("rare.undocumented", { name: customer.shortName })}</p>
              ) : (
                <>
                  <div className={`requests ${ignoreRequests ? "is-ignored" : ""}`}>
                    {ignoreRequests && <p className="ignore-note">{t("ignore.active")}</p>}
                    <FoodRequestPicker customer={customer} value={foodRequest} onChange={setFoodRequest} />
                    <RequestPicker
                      label={t("rare.drinkRequest")}
                      tags={customer.likedDrinkTags}
                      value={drinkRequest}
                      onChange={setDrinkRequest}
                    />
                  </div>
                  <div className="dislikes">
                    <span>{t("rare.dislikes")}</span>
                    {customer.dislikedFoodTags.length ? (
                      customer.dislikedFoodTags.map((tag) => (
                        <span key={tag} className="tag tag-disliked">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="hint">{t("rare.none")}</span>
                    )}
                  </div>
                  <TrendPicker trend={trend} onChange={setTrend} customerNote={describeTrendTaste(customer, t)} />
                  <CookwarePicker value={state.cookware} onChange={setCookware} recipeCount={pool.recipes.length} />
                  <label className="ignore-switch">
                    <input type="checkbox" checked={ignoreRequests} onChange={(e) => setIgnoreRequests(e.target.checked)} />
                    <span className="ignore-switch-label">{t("ignore.label")}</span>
                    <span className="hint">{t("ignore.hint")}</span>
                  </label>
                </>
              )}
            </div>
          </section>

          <SpellCards customer={customer} />
        </>
      )}

      {order && solution && (
        <div className={`results ${stale ? "is-stale" : ""}`}>
          <section className="suggestions" aria-label={t("rare.suggestions")}>
            <div className="results-head">
              <h2>{t("rare.suggestions")}</h2>
              <label className="check">
                <input type="checkbox" checked={ranking.pinkOnly} onChange={(e) => setRanking({ pinkOnly: e.target.checked })} />
                {t("rank.pinkOnly")}
              </label>
              <label className="sort">
                <span>{t("rare.sortBy")}</span>
                <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
                  {SORTS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {t(`sort.${s.key}`)}
                    </option>
                  ))}
                </select>
                {sortKey !== "best" && (
                  <button className="btn btn-quiet" onClick={() => setDescending(!descending)}>
                    {descending ? t("rare.descending") : t("rare.ascending")}
                  </button>
                )}
              </label>
            </div>
            <div className="ranking">
              <label>
                <span>{t("goal.label")}</span>
                <select value={ranking.preset} onChange={(e) => setRanking({ preset: e.target.value as Preset })}>
                  {PRESET_IDS.map((p) => (
                    <option key={p} value={p}>
                      {t(`goal.${p}`)}
                    </option>
                  ))}
                </select>
              </label>
              <details className="help">
                <summary aria-label={t("goal.help")} title={t(`goal.${ranking.preset}.hint`)}>
                  ?
                </summary>
                <div className="help-body">
                  <p>{t(`goal.${ranking.preset}.hint`)}</p>
                  <p>{t("goal.weights", { list: weightList(ranking.preset, t) })}</p>
                  <p className="hint">{t("goal.common")}</p>
                </div>
              </details>
            </div>
            {!ignoreRequests && foodRequest === null && drinkRequest === null && <p className="hint">{t("rare.pickRequest")}</p>}
            {sorted.length === 0 && (
              <p className="hint">{ranking.pinkOnly && solution.suggestions.length > 0 ? t("rank.noPink") : t("rare.noRecipes")}</p>
            )}
            <ol className="suggestion-list">
              {sorted.map((s) => (
                <SuggestionRow
                  key={s.dish.recipe.name}
                  s={s}
                  preset={ranking.preset}
                  selected={draft?.recipe === s.dish.recipe.name}
                  pinned={isSetPinned(pins, pinOf(order.customer.name, draftOf(s)))}
                  onPick={() => pick(s)}
                  onTogglePin={() => updatePins((p) => togglePinnedSet(p, pinOf(order.customer.name, draftOf(s))))}
                />
              ))}
            </ol>
          </section>
          <aside className="side-panel">
            <NightPanel
              guests={pinnedViews}
              active={guests.active}
              onOpenGuest={(name) => updateGuests((g) => setActiveGuest(g, name))}
              onOpenSet={(set) => {
                updateGuests((g) => setActiveGuest(g, set.guest));
                setDrafts((all) => ({ ...all, [set.guest]: { recipe: set.recipe, extras: set.extras, beverage: set.beverage } }));
              }}
              onUnpinSet={(set) => updatePins((p) => togglePinnedSet(p, set))}
            />
            {draft ? (
              <DishBuilder
                order={order}
                draft={draft}
                onChange={setDraft}
                onClose={() => setDraft(null)}
                pinned={isSetPinned(pins, pinOf(order.customer.name, draft))}
                onTogglePin={() => updatePins((p) => togglePinnedSet(p, pinOf(order.customer.name, draft)))}
              />
            ) : (
              <section aria-label={t("side.title")}>
                <div className="side-tabs" role="tablist">
                  <button role="tab" aria-selected={sideTab === "ingredients"} onClick={() => setSideTab("ingredients")}>
                    {t("hints.title")}
                  </button>
                  <button role="tab" aria-selected={sideTab === "drinks"} onClick={() => setSideTab("drinks")}>
                    {t("rare.drinks")}
                  </button>
                </div>
                {sideTab === "drinks" ? (
                  <DrinkRanking drinks={solution.drinks} />
                ) : (
                  <IngredientHints
                    customer={order.customer}
                    foodRequest={ignoreRequests ? null : foodRequest}
                    ingredients={pool.ingredients}
                  />
                )}
              </section>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

function RequestPicker(props: { label: string; tags: string[]; value: string | null; onChange: (t: string | null) => void }) {
  return (
    <div className="request" role="radiogroup" aria-label={props.label}>
      <span className="request-label">{props.label}</span>
      {props.tags.map((tag) => (
        <button
          key={tag}
          role="radio"
          aria-checked={props.value === tag}
          className="request-chip"
          onClick={() => props.onChange(props.value === tag ? null : tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}

/** How this customer reacts to trends. */
function describeTrendTaste(c: RareCustomer, t: Translate): string {
  const parts: MessageKey[] = [];
  if (c.likedFoodTags.includes(TREND_POPULAR)) parts.push("trend.likesPopular");
  if (c.dislikedFoodTags.includes(TREND_POPULAR)) parts.push("trend.dislikesPopular");
  if (c.likedFoodTags.includes(TREND_UNPOPULAR)) parts.push("trend.likesUnpopular");
  if (c.dislikedFoodTags.includes(TREND_UNPOPULAR)) parts.push("trend.dislikesUnpopular");
  if (parts.length === 0) return t("trend.noEffect", { name: c.shortName });
  return t("trend.taste", { name: c.shortName, parts: parts.map((p) => t(p)).join(t("trend.and")) });
}

function RatingBadge({ s }: { s: Suggestion }) {
  const t = useT();
  return (
    <div className={`rating rating-${RATING_CLASS[s.rating]}`}>
      <span className="rating-name">{ratingLabel(s.rating, t)}</span>
      <span className="rating-score">{t("rare.points", { n: s.score })}</span>
    </div>
  );
}

function DishTagLine({ s }: { s: Suggestion }) {
  const t = useT();
  const { dish, drink } = s;
  const added = new Set(dish.dish.added);
  return (
    <div className="tag-line">
      {dish.dish.tags.map((tag) => (
        <span key={tag} className={tagClass(tag, dish.liked, dish.disliked, added.has(tag))}>
          {tag}
        </span>
      ))}
      {dish.dish.removed.map((tag) => (
        <s key={tag} className="tag tag-removed" title={t("rare.overridden")}>
          {tag}
        </s>
      ))}
      <span className="tag-sep" aria-hidden />
      {drink.beverage.tags.map((tag) => (
        <span key={tag} className={tagClass(tag, drink.liked, [], false)}>
          {tag}
        </span>
      ))}
    </div>
  );
}

function SuggestionRow({
  s,
  preset,
  selected,
  pinned,
  onPick,
  onTogglePin,
}: {
  s: Suggestion;
  preset: Preset;
  selected: boolean;
  pinned: boolean;
  onPick: () => void;
  onTogglePin: () => void;
}) {
  const t = useT();
  const { dish, drink } = s;
  const warning = warningFor(s, t);
  return (
    <li className={`suggestion ${selected ? "is-selected" : ""}`}>
      <RatingBadge s={s} />
      <div className="suggestion-body">
        <div className="dish-line">
          <ItemImage src={dish.recipe.image} name={dish.recipe.name} size={32} />
          <strong className="dish-name">{dish.recipe.name}</strong>
          <Extras dish={dish} />
          <span className="with">{t("rare.with")}</span>
          <ItemImage src={drink.beverage.image} name={drink.beverage.name} size={28} />
          <strong className="drink-name">{drink.beverage.name}</strong>
          {s.altDrinks.length > 0 && (
            <span className="or">{t("rare.orList", { list: s.altDrinks.map((d) => d.beverage.name).join(", ") })}</span>
          )}
        </div>
        <IngredientStrip dish={dish} />
        <Metrics s={s} preset={preset} />
        <DishTagLine s={s} />
        {warning && <div className="warn">{warning}</div>}
        {s.alternatives.length > 0 && (
          <details className="alternatives">
            <summary>{t("rare.alternatives", { rating: ratingLabel(s.rating, t), n: s.alternatives.length })}</summary>
            <ul>
              {s.alternatives.map((alt, i) => (
                <li key={i}>
                  {alt.dish.extras.length === 0 ? <span className="with">{t("rare.noExtras")}</span> : <Extras dish={alt.dish} />}
                  <span className="with">{t("rare.with")}</span>
                  <span>{alt.drink.beverage.name}</span>
                  <span className="alt-meta">{t("rare.altMeta", { n: alt.score, price: alt.totalPrice })}</span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
      <div className={`price price-${s.budget}`}>
        <strong>{s.totalPrice}</strong>
        <span>{budgetLabel(s.budget, t)}</span>
        <span className="cookware">{dish.recipe.cookware}</span>
        <button className="btn btn-small" aria-pressed={selected} onClick={onPick}>
          {selected ? t("rare.adjusting") : t("rare.adjust")}
        </button>
        <PinButton pinned={pinned} onToggle={onTogglePin} />
      </div>
    </li>
  );
}

const pct = (x: number) => Math.round(x * 100);

/** "Dish profit ×2, Spares rare stock ×2, ..." for a preset, heaviest first. */
function weightList(preset: Preset, t: Translate): string {
  return Object.entries(PRESETS[preset])
    .sort((a, b) => b[1] - a[1])
    .map(([f, w]) => `${t(`factor.${f}` as MessageKey)} ×${w}`)
    .join(", ");
}

/**
 * Value under the chosen goal, plus estimated cost and profit, rarest stock and cooking time. The value
 * opens to show each factor's score and what the set would score under the other goals.
 */
function Metrics({ s, preset }: { s: Suggestion; preset?: Preset }) {
  const t = useT();
  return (
    <div className="metrics">
      {preset && <ValueBreakdown s={s} preset={preset} />}
      <span title={t("metric.note")}>{t("metric.cost", { n: setCost(s) })}</span>
      <span title={t("metric.note")}>{t("metric.profit", { n: dishProfit(s) })}</span>
      <span>{t("metric.level", { n: setTopLevel(s) })}</span>
      <span>{t("metric.time", { n: s.dish.cookTime })}</span>
    </div>
  );
}

function ValueBreakdown({ s, preset }: { s: Suggestion; preset: Preset }) {
  const t = useT();
  const weights = PRESETS[preset];
  const factors = FACTORS.filter((f) => (weights[f] ?? 0) > 0).sort((a, b) => (weights[b] ?? 0) - (weights[a] ?? 0));
  return (
    <details className="value">
      <summary>{t("value.label", { n: pct(s.value) })}</summary>
      <div className="value-body">
        <p className="hint">{t("value.factors")}</p>
        <ul className="value-factors">
          {factors.map((f) => (
            <li key={f}>
              <span className="value-factor-name">
                {t(`factor.${f}`)} ×{weights[f]}
              </span>
              <span className="value-bar" aria-hidden>
                <span style={{ width: `${pct(s.factors[f])}%` }} />
              </span>
              <span className="value-num">{pct(s.factors[f])}</span>
            </li>
          ))}
        </ul>
        <p className="hint">{t("value.presets")}</p>
        <ul className="value-presets">
          {PRESET_IDS.map((p) => (
            <li key={p} className={p === preset ? "is-current" : ""}>
              <span>{t(`goal.${p}`)}</span>
              <span className="value-num">{pct(valueOf(s.factors, PRESETS[p]))}</span>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}

/** Everything that goes into the pot: the recipe's base ingredients, then the extras. */
function IngredientStrip({ dish }: { dish: Suggestion["dish"] }) {
  const t = useT();
  const data = useGameData();
  const image = (name: string) => data.ingredients.find((i) => i.name === name)?.image;
  return (
    <div className="ingredient-strip" aria-label={t("rare.ingredientsUsed")}>
      <span className="strip-label">{t("rare.ingredients")}</span>
      {dish.recipe.ingredients.map((n, i) => (
        <span key={`base-${i}`} className="ing-chip ing-chip-base" title={t("rare.baseIngredient")}>
          <ItemImage src={image(n)} name={n} size={20} /> {n}
        </span>
      ))}
      {dish.extras.map((e, i) => (
        <span key={`extra-${i}`} className="ing-chip ing-chip-extra" title={t("rare.extraIngredient")}>
          <ItemImage src={e.image} name={e.name} size={20} /> {e.name}
        </span>
      ))}
    </div>
  );
}

/** "+ Honey (or Peach)" for each extra ingredient, collapsing repeated fillers into "×n". */
function Extras({ dish }: { dish: Suggestion["dish"] }) {
  const t = useT();
  const items: { ing: Ingredient; count: number; subs: string[] }[] = [];
  dish.extras.forEach((e, i) => {
    const last = items[items.length - 1];
    if (last && last.ing.name === e.name) last.count++;
    else items.push({ ing: e, count: 1, subs: dish.substitutes[i]?.map((x) => x.name) ?? [] });
  });
  return (
    <>
      {items.map((it, i) => (
        <span key={i} className="extra">
          + <ItemImage src={it.ing.image} name={it.ing.name} size={22} /> {it.ing.name}
          {it.count > 1 && ` ×${it.count}`}
          {it.subs.length > 0 && <span className="or"> {t("rare.orList", { list: it.subs.join(", ") })}</span>}
        </span>
      ))}
    </>
  );
}

/** Pins a set to tonight's list in the right-hand panel, or unpins it. */
function PinButton({ pinned, onToggle }: { pinned: boolean; onToggle: () => void }) {
  const t = useT();
  return (
    <button className={`btn btn-small pin-btn ${pinned ? "is-pinned" : ""}`} aria-pressed={pinned} onClick={onToggle}>
      📌 {pinned ? t("pins.unpin") : t("pins.pin")}
    </button>
  );
}

function DrinkRanking({ drinks }: { drinks: DrinkOption[] }) {
  const t = useT();
  return (
    <section aria-label={t("rare.drinks")}>
      <p className="hint">{t("rare.drinksHint")}</p>
      <ol className="drink-list">
        {drinks.slice(0, 14).map((d) => (
          <li key={d.beverage.name} className={`drink ${d.requestMet ? "" : "is-off"}`}>
            <ItemImage src={d.beverage.image} name={d.beverage.name} size={24} />
            <span className="drink-row-name">{d.beverage.name}</span>
            <span className="drink-row-score">+{d.score}</span>
            <span className="drink-row-price">{d.beverage.price}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Hand-tune a dish: change extras and drink, and see what each ingredient would add. */
function DishBuilder({
  order,
  draft,
  onChange,
  onClose,
  pinned,
  onTogglePin,
}: {
  order: RareOrder;
  draft: Draft;
  onChange: (d: Draft) => void;
  onClose: () => void;
  pinned: boolean;
  onTogglePin: () => void;
}) {
  const t = useT();
  const pool = useAvailablePool();
  const data = useGameData();
  const [helpfulOnly, setHelpfulOnly] = useState(true);
  const byName = <T extends { name: string }>(list: readonly T[], name: string) => list.find((x) => x.name === name);
  // Look up in the full (edited) lists too, so a draft survives progress changes.
  const recipe = byName(pool.recipes, draft.recipe) ?? byName(data.recipes, draft.recipe);
  const beverage = byName(pool.beverages, draft.beverage) ?? byName(data.beverages, draft.beverage);
  const extras = draft.extras
    .map((n) => byName(pool.ingredients, n) ?? byName(data.ingredients, n))
    .filter((x): x is Ingredient => !!x);
  const drinks = useMemo(() => rankDrinks(order, pool.beverages), [order, pool.beverages]);
  const catalog = useMemo(() => makeCatalog(data.ingredients), [data.ingredients]);
  if (!recipe || !beverage) return null;

  const result = evaluateCombo(order, recipe, extras, beverage, catalog);
  const warning = warningFor(result, t);
  const slotsLeft = MAX_INGREDIENTS - recipe.ingredients.length - extras.length;
  const effects = ingredientEffects(order, recipe, extras, beverage, pool.ingredients, catalog);
  const shownEffects = helpfulOnly
    ? effects.filter((e) => !e.darkMatter && (e.delta > 0 || e.result.requestsMet > result.requestsMet || e.result.rating > result.rating))
    : effects;

  return (
    <section className="builder" aria-label={t("builder.title")}>
      <div className="builder-head">
        <h2>{t("builder.title")}</h2>
        <span className="builder-actions">
          <PinButton pinned={pinned} onToggle={onTogglePin} />
          <button className="btn btn-quiet btn-small" onClick={onClose}>
            {t("builder.close")}
          </button>
        </span>
      </div>

      <div className="builder-summary">
        <RatingBadge s={result} />
        <div>
          <div className="builder-dish">
            <ItemImage src={recipe.image} name={recipe.name} size={40} />
            <strong>{recipe.name}</strong>
          </div>
          <div className={`price-inline price-${result.budget}`}>
            {t("builder.total", { price: result.totalPrice, budget: budgetLabel(result.budget, t) })}
          </div>
        </div>
      </div>
      <Metrics s={result} />
      {warning && <div className="warn">{warning}</div>}
      <DishTagLine s={result} />

      <h3>{t("rare.ingredients")}</h3>
      <div className="builder-ingredients">
        {recipe.ingredients.map((n, i) => {
          const ing = byName(data.ingredients, n);
          return (
            <span key={`base-${i}`} className="ing-chip ing-chip-base" title={t("rare.baseIngredient")}>
              <ItemImage src={ing?.image} name={n} size={22} /> {n}
            </span>
          );
        })}
        {extras.map((e, i) => (
          <span key={`extra-${i}`} className="ing-chip ing-chip-extra">
            <ItemImage src={e.image} name={e.name} size={22} /> {e.name}
            <button
              aria-label={t("builder.remove", { name: e.name })}
              onClick={() => onChange({ ...draft, extras: draft.extras.filter((_, j) => j !== i) })}
            >
              ×
            </button>
          </span>
        ))}
        <span className="hint">{slotsLeft > 0 ? t("builder.slotsLeft", { n: slotsLeft }) : t("builder.full")}</span>
      </div>

      <label className="field">
        <span>{t("builder.drink")}</span>
        <select value={beverage.name} onChange={(e) => onChange({ ...draft, beverage: e.target.value })}>
          {drinks.map((d) => (
            <option key={d.beverage.name} value={d.beverage.name}>
              {d.beverage.name} (+{d.score}
              {d.requestMet ? "" : t("builder.notRequested")}, {d.beverage.price})
            </option>
          ))}
        </select>
      </label>

      {slotsLeft > 0 && (
        <>
          <div className="builder-effects-head">
            <h3>{t("builder.addIngredient")}</h3>
            <label className="check">
              <input type="checkbox" checked={helpfulOnly} onChange={(e) => setHelpfulOnly(e.target.checked)} />
              {t("builder.helpfulOnly")}
            </label>
          </div>
          {shownEffects.length === 0 && <p className="hint">{t("builder.noneHelpful")}</p>}
          <ul className="effect-list">
            {shownEffects.map((e) => (
              <li key={e.ingredient.name}>
                <button
                  className={`effect ${e.darkMatter ? "is-dark" : ""}`}
                  onClick={() => onChange({ ...draft, extras: [...draft.extras, e.ingredient.name] })}
                >
                  <ItemImage src={e.ingredient.image} name={e.ingredient.name} size={30} />
                  <span className="effect-body">
                    <span className="effect-name">
                      {e.ingredient.name} <span className="alt-meta">{e.ingredient.price}</span>
                    </span>
                    <span className="effect-tags">
                      {e.darkMatter ? (
                        <span className="tag tag-disliked">Dark Matter</span>
                      ) : (
                        <>
                          {e.gainedTags.map((tag) => (
                            <span key={tag} className={tagClass(tag, e.result.dish.liked, e.result.dish.disliked, true)}>
                              +{tag}
                            </span>
                          ))}
                          {e.lostTags.map((tag) => (
                            <s key={tag} className="tag tag-removed">
                              {tag}
                            </s>
                          ))}
                          {e.gainedTags.length === 0 && e.lostTags.length === 0 && (
                            <span className="alt-meta">{t("builder.noNewTags")}</span>
                          )}
                        </>
                      )}
                    </span>
                  </span>
                  <span className={`effect-delta ${e.delta > 0 ? "up" : e.delta < 0 ? "down" : ""}`}>
                    {e.delta > 0 ? `+${e.delta}` : e.delta}
                  </span>
                  <span className={`rating-dot rating-${RATING_CLASS[e.result.rating]}`} title={ratingLabel(e.result.rating, t)} />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function tagClass(tag: string, liked: string[], disliked: string[], added: boolean): string {
  const kind = liked.includes(tag) ? "tag-liked" : disliked.includes(tag) ? "tag-disliked" : "tag-neutral";
  return `tag ${kind}${added ? " tag-added" : ""}`;
}
