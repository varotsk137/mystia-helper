import { useDeferredValue, useMemo, useState } from "react";
import type { GameData, Ingredient, RareCustomer } from "../data";
import { useAvailablePool, useGameData, useStore } from "../store";
import { TonightBar } from "../components/TonightBar";
import { FoodRequestPicker } from "../components/QuoteParts";
import { requestableFoodTags } from "../quotes";
import { NightPanel, type PinnedGuestView } from "../components/NightPanel";
import { IngredientHints } from "../components/IngredientHints";
import { SpellCards } from "../components/SpellCards";
import { GuestTabs, type SeatedGuest } from "../components/GuestTabs";
import { addGuest, removeGuest, setActiveGuest, setGuestOrder } from "../guests";
import { isSetPinned, pinnedGuestNames, removeGuestPins, togglePinnedSet, type PinnedSet } from "../pins";
import {
  findSavedSet,
  removeSavedSet,
  saveSet,
  savedSetsFor,
  SAVED_SET_ICON,
  type SavedSet,
  type SavedSetKind,
} from "../savedSets";
import { SaveSetForm, SavedSetList, type SavedSetView } from "../components/SavedSets";
import { useMediaQuery } from "../useMediaQuery";
import {
  budgetStatus,
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
import { IngredientShelf, SlotInfo, type ShelfItem } from "../components/IngredientShelf";
import { Popover } from "../components/Popover";
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

const draftOf = (s: Suggestion): Draft => ({
  recipe: s.dish.recipe.name,
  extras: s.dish.extras.map((e) => e.name),
  beverage: s.drink.beverage.name,
});

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
  const { state, setTrend, setCookware, updateGuests, setRanking, updatePins, clearNight, setStickyGuests, updateSavedSets } =
    useStore();
  const { trend, guests, ranking, pins, savedSets } = state;
  // Wide screens have room beside the page, so the pinned sets get a column of their own there.
  const wide = useMediaQuery("(min-width: 1760px)");
  const [sortKey, setSortKey] = useState<SortKey>("best");
  const [descending, setDescending] = useState(false);
  // Night Sparrow cookware in Hyper mode / after a perfect Sparrow Tune. Not saved: it only lasts a moment.
  const [ignoreRequests, setIgnoreRequests] = useState(false);
  // Hand-tuned sets, kept per guest so switching tabs doesn't lose them.
  const [drafts, setDrafts] = useState<Record<string, Draft | undefined>>({});
  // Guests whose complete order slip was opened again to change it; complete slips are otherwise collapsed.
  const [editing, setEditing] = useState<Record<string, boolean>>({});
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
  const setRequests = (food: string | null, drink: string | null) => {
    if (!customer) return;
    // The slip folds away when this pick completes the order, not on every change while editing it.
    if (!(foodRequest && drinkRequest) && food && drink) setEditing((all) => ({ ...all, [customer.name]: false }));
    updateGuests((g) => setGuestOrder(g, customer.name, { food, drink }));
  };
  const setFoodRequest = (food: string | null) => setRequests(food, drinkRequest);
  const setDrinkRequest = (drink: string | null) => setRequests(foodRequest, drink);
  const slipCollapsed = !!(customer && foodRequest && drinkRequest && !editing[customer.name]);
  const setSlipEditing = (on: boolean) => customer && setEditing((all) => ({ ...all, [customer.name]: on }));
  const trendTaste = customer ? describeTrendTaste(customer, t) : null;

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
  // Right after a guest switch the solution is still the previous guest's; showing it would let a set be
  // pinned to the wrong guest, so the list waits for the new one.
  const switching = stale && deferredOrder?.customer !== order?.customer;

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

  const pinOf = (guest: string, d: Draft): PinnedSet => ({ guest, recipe: d.recipe, extras: d.extras, beverage: d.beverage });

  // Pinned sets grouped by guest, each rated against that guest's current order.
  const pinnedViews = useMemo<PinnedGuestView[]>(() => {
    return pinnedGuestNames(pins).flatMap((name) => {
      const c = data.rareCustomers.find((x) => x.name === name);
      if (!c) return [];
      const go = guests.list.find((g) => g.name === name) ?? null;
      const guestOrder: RareOrder = { customer: c, foodRequest: go?.food ?? null, drinkRequest: go?.drink ?? null, trend, ignoreRequests };
      const sets = pins.sets
        .filter((s) => s.guest === name)
        .map((set) => ({ set, result: rateSet(data, solverPool.catalog, guestOrder, set) }));
      return [{ customer: c, order: go, sets }];
    });
  }, [pins, guests.list, data, trend, ignoreRequests, solverPool.catalog]);

  // The current guest's presets, rated against their current order.
  const savedViews = useMemo<SavedSetView[]>(
    () =>
      order
        ? savedSetsFor(savedSets, order.customer.name).map((saved) => ({
            saved,
            result: rateSet(data, solverPool.catalog, order, saved),
            pinned: isSetPinned(pins, saved),
          }))
        : [],
    [order, savedSets, data, solverPool.catalog, pins],
  );
  const savedOf = (set: PinnedSet) => findSavedSet(savedSets, set);
  const saveAs = (set: PinnedSet) => (name: string, kind: SavedSetKind) =>
    updateSavedSets((s) => saveSet(s, { ...set, name, kind }));
  const openSet = (set: PinnedSet) => {
    updateGuests((g) => setActiveGuest(g, set.guest));
    setDrafts((all) => ({ ...all, [set.guest]: { recipe: set.recipe, extras: set.extras, beverage: set.beverage } }));
  };

  const nightPanel = (
    <NightPanel
      guests={pinnedViews}
      active={guests.active}
      savedOf={savedOf}
      showEmpty={wide}
      onOpenGuest={(name) => updateGuests((g) => setActiveGuest(g, name))}
      onOpenSet={openSet}
      onUnpinSet={(set) => updatePins((p) => togglePinnedSet(p, set))}
    />
  );
  const savedList = customer && !customer.undocumented && (
    <SavedSetList
      guest={customer.shortName}
      views={savedViews}
      onTogglePin={(saved) => updatePins((p) => togglePinnedSet(p, saved))}
      onOpen={openSet}
      onDelete={(saved) => updateSavedSets((s) => removeSavedSet(s, saved.id))}
    />
  );

  if (pool.rareCustomers.length === 0 && seated.length === 0) {
    return (
      <div className="page">
        <p className="hint">{t("rare.noCustomers")}</p>
      </div>
    );
  }

  return (
    <div className={`page solver ${state.stickyGuests ? "has-sticky-guests" : ""} ${wide ? "has-rail" : ""}`}>
      <div className="solver-main">
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
            setEditing({});
          }}
        >
          <TonightBar
            trend={trend}
            onTrendChange={setTrend}
            cookware={state.cookware}
            onCookwareChange={setCookware}
            recipeCount={pool.recipes.length}
            ignoreRequests={ignoreRequests}
            onIgnoreRequestsChange={setIgnoreRequests}
          />
        </GuestTabs>

        {customer && order && slipCollapsed && (
          <>
            <section className="order order-compact" aria-label={t("rare.order")}>
              <ItemImage src={customer.image} name={customer.shortName} size={40} variant="portrait" />
              <div className="order-compact-body">
                <div className="order-compact-head">
                  <h2 className="order-name">{customer.name}</h2>
                  {customer.dislikedFoodTags.length > 0 && (
                    <span className="dislikes">
                      <span>{t("rare.dislikes")}</span>
                      {customer.dislikedFoodTags.map((tag) => (
                        <span key={tag} className="tag tag-disliked">
                          {tag}
                        </span>
                      ))}
                    </span>
                  )}
                  <span className="order-compact-spacer" />
                  <div className="budget">
                    <span>{t("rare.budget")}</span>
                    <strong>{customer.budget ? `${customer.budget.min}–${customer.budget.max}` : "?"}</strong>
                  </div>
                  <button className="btn btn-small order-toggle" aria-expanded={false} onClick={() => setSlipEditing(true)}>
                    {t("order.edit")}
                  </button>
                </div>
                {/* The guest orders again after every dish, so the requests stay one click away. */}
                <div className={`order-compact-requests ${ignoreRequests ? "is-ignored" : ""}`}>
                  <CompactRequestPicker
                    label={t("rare.foodRequest")}
                    tags={requestableFoodTags(customer)}
                    titleOf={(tag) =>
                      customer.foodQuotes
                        .filter((q) => q.tag === tag)
                        .map((q) => `“${q.text}”`)
                        .join("\n")
                    }
                    value={foodRequest}
                    onChange={setFoodRequest}
                  />
                  <CompactRequestPicker
                    label={t("rare.drinkRequest")}
                    tags={customer.likedDrinkTags}
                    value={drinkRequest}
                    onChange={setDrinkRequest}
                  />
                  {ignoreRequests && <span className="hint">{t("ignore.label")}</span>}
                </div>
              </div>
            </section>

            {savedList}
            <SpellCards customer={customer} />
          </>
        )}

        {customer && order && !slipCollapsed && (
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
                  {foodRequest && drinkRequest && (
                    <button className="btn btn-small order-toggle" aria-expanded={true} onClick={() => setSlipEditing(false)}>
                      {t("order.collapse")}
                    </button>
                  )}
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
                    {trendTaste && (
                      <div className="trend-taste">
                        <span className="request-label">{t("trend.label")}</span>
                        <span className="hint">
                          {trendTaste}
                          {trend.popular.length === 0 && trend.unpopular.length === 0 && ` · ${t("trend.unset")}`}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>

            {savedList}
            <SpellCards customer={customer} />
          </>
        )}

        {order && solution && (
          <div className="results">
            <section className={`suggestions ${stale ? "is-stale" : ""}`} aria-label={t("rare.suggestions")}>
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
              {switching && <p className="hint">{t("rare.solving")}</p>}
              {!switching && sorted.length === 0 && (
                <p className="hint">{ranking.pinkOnly && solution.suggestions.length > 0 ? t("rank.noPink") : t("rare.noRecipes")}</p>
              )}
              <ol className="suggestion-list">
                {!switching && sorted.map((s) => (
                  <SuggestionRow
                    // A new order starts every card from the solver's set again.
                    key={`${order.customer.name}|${foodRequest}|${drinkRequest}|${ignoreRequests}|${s.dish.recipe.name}`}
                    s={s}
                    order={order}
                    preset={ranking.preset}
                    food={ignoreRequests ? null : foodRequest}
                    drink={ignoreRequests ? null : drinkRequest}
                    ranked={solution.drinks}
                    rate={(d) => rateSet(data, solverPool.catalog, order, d)}
                    selected={draft?.recipe === s.dish.recipe.name}
                    isPinned={(d) => isSetPinned(pins, pinOf(order.customer.name, d))}
                    savedOf={(d) => savedOf(pinOf(order.customer.name, d))}
                    onPick={setDraft}
                    onTogglePin={(d) => updatePins((p) => togglePinnedSet(p, pinOf(order.customer.name, d)))}
                    onSave={(d) => saveAs(pinOf(order.customer.name, d))}
                  />
                ))}
              </ol>
            </section>
            <aside className="side-panel">
              {!wide && nightPanel}
              <div className="side-help">
                {draft ? (
                  <DishBuilder
                    order={order}
                    draft={draft}
                    onChange={setDraft}
                    onClose={() => setDraft(null)}
                    pinned={isSetPinned(pins, pinOf(order.customer.name, draft))}
                    onTogglePin={() => updatePins((p) => togglePinnedSet(p, pinOf(order.customer.name, draft)))}
                    saved={savedOf(pinOf(order.customer.name, draft))}
                    onSave={saveAs(pinOf(order.customer.name, draft))}
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
                      switching ? (
                        <p className="hint">{t("rare.solving")}</p>
                      ) : (
                        <DrinkRanking drinks={solution.drinks} />
                      )
                    ) : (
                      <IngredientHints
                        customer={order.customer}
                        foodRequest={ignoreRequests ? null : foodRequest}
                        ingredients={pool.ingredients}
                      />
                    )}
                  </section>
                )}
              </div>
            </aside>
          </div>
        )}
      </div>
      {wide && <aside className="night-rail">{nightPanel}</aside>}
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

const MAX_BETTER_DRINKS = 6;
const MAX_ADD_OPTIONS = 8;

/** A pinned or saved set rated against a guest's order; null when its recipe or drink no longer exists. */
function rateSet(
  data: GameData,
  catalog: ReturnType<typeof makeCatalog>,
  order: RareOrder,
  set: { recipe: string; extras: string[]; beverage: string },
): Suggestion | null {
  const recipe = data.recipes.find((r) => r.name === set.recipe);
  const beverage = data.beverages.find((b) => b.name === set.beverage);
  const extras = set.extras
    .map((e) => data.ingredients.find((i) => i.name === e))
    .filter((x): x is Ingredient => !!x);
  return recipe && beverage ? evaluateCombo(order, recipe, extras, beverage, catalog) : null;
}

/** One request as a row of small chips; picking another tag switches straight to it. */
function CompactRequestPicker(props: {
  label: string;
  tags: string[];
  titleOf?: (tag: string) => string;
  value: string | null;
  onChange: (t: string) => void;
}) {
  return (
    <span className="compact-request" role="radiogroup" aria-label={props.label}>
      <span className="compact-request-label">{props.label}</span>
      {props.tags.map((tag) => (
        <button
          key={tag}
          role="radio"
          aria-checked={props.value === tag}
          className="request-chip"
          title={props.titleOf?.(tag) || undefined}
          onClick={() => props.onChange(tag)}
        >
          {tag}
        </button>
      ))}
    </span>
  );
}

/** How this customer reacts to trends, or null when trends don't change their points. */
function describeTrendTaste(c: RareCustomer, t: Translate): string | null {
  const parts: MessageKey[] = [];
  if (c.likedFoodTags.includes(TREND_POPULAR)) parts.push("trend.likesPopular");
  if (c.dislikedFoodTags.includes(TREND_POPULAR)) parts.push("trend.dislikesPopular");
  if (c.likedFoodTags.includes(TREND_UNPOPULAR)) parts.push("trend.likesUnpopular");
  if (c.dislikedFoodTags.includes(TREND_UNPOPULAR)) parts.push("trend.dislikesUnpopular");
  if (parts.length === 0) return null;
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

/** "● Pink · 4 pts" in the rating's colour; the points turn gold when a swap on the card raised them. */
function RatingPill({ s, raised }: { s: Suggestion; raised: boolean }) {
  const t = useT();
  return (
    <span className={`rating-pill ${raised ? "is-raised" : ""}`}>
      <span className="rating-pill-dot" aria-hidden />
      {ratingLabel(s.rating, t)} · <span className="rating-pill-pts">{t("rare.points", { n: s.score })}</span>
    </span>
  );
}

/**
 * The dish's tags on one line and the drink's on the next. Tags that change the rating (liked, disliked or
 * asked for) show first; the rest, and tags another tag overrode, fold into "+N" unless `showAll`.
 */
function DishTagLine({
  s,
  food,
  drink: drinkRequest,
  showAll = false,
}: {
  s: Suggestion;
  food: string | null;
  drink: string | null;
  showAll?: boolean;
}) {
  const t = useT();
  const [all, setAll] = useState(showAll);
  const { dish, drink } = s;
  const added = new Set(dish.dish.added);
  const dishShown = dish.dish.tags.filter((tag) => all || tag === food || dish.liked.includes(tag) || dish.disliked.includes(tag));
  const drinkShown = drink.beverage.tags.filter((tag) => all || tag === drinkRequest || drink.liked.includes(tag));
  const hidden = all
    ? 0
    : dish.dish.tags.length - dishShown.length + dish.dish.removed.length + drink.beverage.tags.length - drinkShown.length;
  return (
    <div className="tag-lines">
      <div className="tag-line">
        <span className="tag-group">{t("tags.dish")}</span>
        {dishShown.map((tag) => (
          <span key={tag} className={tagClass(tag, dish.liked, dish.disliked, added.has(tag), tag === food)}>
            {tag}
          </span>
        ))}
        {all &&
          dish.dish.removed.map((tag) => (
            <s key={tag} className="tag tag-removed" title={t("rare.overridden")}>
              {tag}
            </s>
          ))}
      </div>
      <div className="tag-line">
        <span className="tag-group">{t("tags.drink")}</span>
        {drinkShown.map((tag) => (
          <span key={tag} className={tagClass(tag, drink.liked, [], false, tag === drinkRequest)}>
            {tag}
          </span>
        ))}
        {(hidden > 0 || (all && !showAll)) && (
          <button className="link-btn tag-more" aria-expanded={all} title={t("tags.moreHint")} onClick={() => setAll(!all)}>
            {all ? t("tags.fewer") : t("tags.more", { n: hidden })}
          </button>
        )}
      </div>
    </div>
  );
}

/** What was changed on a card: the drink, and the extra ingredients; null keeps the solver's choice. */
interface CardSwap {
  beverage: string | null;
  extras: string[] | null;
}
const NO_SWAP: CardSwap = { beverage: null, extras: null };
const sameList = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);

/**
 * One suggested set. The pot shows as five slots; an empty slot lists ingredients that add points and the drink
 * lists the other drinks, and picking one there changes the set on this card. Pin, save and adjust act on the
 * set as it is shown.
 */
function SuggestionRow({
  s,
  order,
  preset,
  food,
  drink: drinkRequest,
  ranked,
  rate,
  selected,
  isPinned,
  savedOf,
  onPick,
  onTogglePin,
  onSave,
}: {
  s: Suggestion;
  order: RareOrder;
  preset: Preset;
  /** The requests that count (null while requests are ignored), to mark them among the tags. */
  food: string | null;
  drink: string | null;
  /** Every drink ranked for this order, best first. */
  ranked: DrinkOption[];
  /** Rates a changed set against the order. */
  rate: (set: Draft) => Suggestion | null;
  selected: boolean;
  isPinned: (set: Draft) => boolean;
  /** The preset a set was saved as, if any. */
  savedOf: (set: Draft) => SavedSet | undefined;
  /** Opens a set in the builder. */
  onPick: (set: Draft) => void;
  onTogglePin: (set: Draft) => void;
  onSave: (set: Draft) => (name: string, kind: SavedSetKind) => void;
}) {
  const t = useT();
  const data = useGameData();
  const [saving, setSaving] = useState(false);
  const [swap, setSwap] = useState<CardSwap>(NO_SWAP);
  const base = draftOf(s);
  const extras = swap.extras ?? base.extras;
  const set: Draft = { ...base, extras, beverage: swap.beverage ?? base.beverage };
  const changed = swap.beverage !== null || swap.extras !== null;
  const shown = (changed && rate(set)) || s;
  const { dish } = shown;
  const station = data.cookware.find((c) => c.name === dish.recipe.cookware);
  const ingredient = (name: string) => data.ingredients.find((i) => i.name === name);
  const warning = warningFor(shown, t);
  const saved = savedOf(set);
  const liked = order.customer.likedFoodTags;
  const disliked = order.customer.dislikedFoodTags;
  const setExtras = (next: string[]) => setSwap({ ...swap, extras: sameList(next, base.extras) ? null : next });
  // Ingredients that add the same tags as one of the solver's extras give the same dish in its place.
  const subsOf = (name: string): Ingredient[] => {
    const j = s.dish.extras.findIndex((e, k) => e.name === name || s.dish.substitutes[k]?.some((x) => x.name === name));
    return j < 0 ? [] : [s.dish.extras[j], ...(s.dish.substitutes[j] ?? [])].filter((x) => x.name !== name);
  };
  const items: ShelfItem[] = [
    ...dish.recipe.ingredients.map((name) => ({ name, ingredient: ingredient(name), kind: "base" as const })),
    ...extras.map((name, i) => {
      const item: ShelfItem = { name, ingredient: ingredient(name), kind: "extra", hasSubs: subsOf(name).length > 0 };
      item.menu = (close) => (
        <ExtraMenu
          item={item}
          liked={liked}
          disliked={disliked}
          subs={subsOf(name)}
          shown={shown}
          without={() => rate({ ...set, extras: extras.filter((_, j) => j !== i) })}
          onReplace={(sub) => {
            setExtras(extras.map((x, j) => (j === i ? sub : x)));
            close();
          }}
          onRemove={() => {
            setExtras(extras.filter((_, j) => j !== i));
            close();
          }}
        />
      );
      return item;
    }),
  ];
  return (
    <li className={`suggestion rate-${RATING_CLASS[shown.rating]} ${selected ? "is-selected" : ""}`}>
      <div className="card-head">
        <span className="dish-tile">
          <ItemImage src={dish.recipe.image} name={dish.recipe.name} size={44} />
        </span>
        <div className="card-title">
          <strong className="dish-name">{dish.recipe.name}</strong>
          <span className="card-station">
            {station && <ItemImage src={station.image} name={station.name} size={18} />}
            {dish.recipe.cookware}
          </span>
        </div>
        <div className="card-score">
          <RatingPill s={shown} raised={shown.score > s.score} />
          <span className={`card-price price-${shown.budget}`}>
            <strong>{shown.totalPrice}</strong>
            <span>{budgetLabel(shown.budget, t)}</span>
          </span>
        </div>
      </div>
      <div className="card-build">
        <IngredientShelf
          items={items}
          liked={liked}
          disliked={disliked}
          renderEmpty={() => <AddIngredient order={order} current={shown} onAdd={(name) => setExtras([...extras, name])} />}
        />
        <span className="card-plus" aria-hidden>
          +
        </span>
        <DrinkPicker
          shown={shown}
          ranked={ranked}
          customer={order.customer}
          rate={(beverage) => rate({ ...set, beverage })}
          onPick={(beverage) => setSwap({ ...swap, beverage: beverage === base.beverage ? null : beverage })}
        />
        {changed && (
          <span className="card-changed">
            {t("card.changed")} ·{" "}
            <button className="link-btn" onClick={() => setSwap(NO_SWAP)}>
              {t("card.reset")}
            </button>
          </span>
        )}
      </div>
      <DishTagLine s={shown} food={food} drink={drinkRequest} />
      {warning && <div className="warn">{warning}</div>}
      {!changed && s.alternatives.length > 0 && (
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
      <div className="card-foot">
        <Metrics s={shown} preset={changed ? undefined : preset} />
        <span className="card-actions">
          <PinButton pinned={isPinned(set)} onToggle={() => onTogglePin(set)} />
          <button className="btn btn-small btn-quiet" aria-pressed={selected} onClick={() => onPick(set)}>
            {selected ? t("rare.adjusting") : t("rare.adjust")}
          </button>
          <SaveButton saved={saved} open={saving} onToggle={() => setSaving(!saving)} />
        </span>
      </div>
      {saving && (
        <SaveSetForm
          defaultName={saved?.name ?? dish.recipe.name}
          defaultKind={saved?.kind}
          onSave={(name, kind) => {
            onSave(set)(name, kind);
            setSaving(false);
          }}
          onCancel={() => setSaving(false)}
        />
      )}
    </li>
  );
}

/**
 * The set's drink as a tile that opens the other drinks that meet the request, grouped against the drink in the
 * set now: worth more points, worth the same, and worth fewer (once the dish carries more points, a cheaper drink
 * can keep the rating). Each row shows the rating the set gets with it.
 */
function DrinkPicker({
  shown,
  ranked,
  customer,
  rate,
  onPick,
}: {
  /** The set as the card shows it now. */
  shown: Suggestion;
  ranked: DrinkOption[];
  customer: RareCustomer;
  /** Rates the card's set with another drink. */
  rate: (beverage: string) => Suggestion | null;
  onPick: (beverage: string) => void;
}) {
  const t = useT();
  const current = shown.drink;
  const usable = ranked.filter((d) => d.requestMet);
  const better = usable.filter((d) => d.score > current.score).slice(0, MAX_BETTER_DRINKS);
  const same = usable.filter((d) => d.score === current.score && d.beverage.name !== current.beverage.name);
  const fewer = usable.filter((d) => d.score < current.score).slice(0, MAX_BETTER_DRINKS);
  const top = better[0] ?? null;
  return (
    <Popover
      label={t("drinks.title")}
      className="drink-picker"
      buttonClassName="drink-slot"
      button={
        <>
          <span className="slot slot-base">
            <ItemImage src={current.beverage.image} name={current.beverage.name} size={34} />
          </span>
          <span className="drink-slot-text">
            <strong>{current.beverage.name}</strong>
            <small>
              <b>+{current.score}</b> {t("drinks.points", { price: current.beverage.price })} ▾
            </small>
          </span>
          {top && (
            <span className="drink-flag" title={t("drinks.flag", { n: top.score })}>
              ▲ +{top.score}
            </span>
          )}
        </>
      }
    >
      {(close) => {
        const pick = (name: string) => {
          onPick(name);
          close();
        };
        const rowOf = (d: DrinkOption) => (
          <DrinkRow key={d.beverage.name} d={d} shown={shown} customer={customer} rated={rate(d.beverage.name)} onPick={pick} />
        );
        return (
          <>
            {better.length > 0 ? (
              <>
                <h4 className="pick-head">
                  <span>▲ {t("rare.betterDrinks")}</span>
                  <span>{t("drinks.total")}</span>
                </h4>
                <ul className="pick-rows">{better.map(rowOf)}</ul>
              </>
            ) : (
              <p className="pick-foot">{t("drinks.none")}</p>
            )}
            <h4 className="pick-head">
              <span>{t("drinks.same", { n: current.score })}</span>
              <span>{t("drinks.total")}</span>
            </h4>
            <ul className="pick-rows">{[current, ...same].map(rowOf)}</ul>
            {fewer.length > 0 && (
              <>
                <h4 className="pick-head">
                  <span>▼ {t("drinks.fewer")}</span>
                  <span>{t("drinks.total")}</span>
                </h4>
                <ul className="pick-rows">{fewer.map(rowOf)}</ul>
              </>
            )}
            <p className="pick-foot">{t("drinks.foot", { dish: shown.dish.score })}</p>
          </>
        );
      }}
    </Popover>
  );
}

/** A drink in the picker: its points and what it changes, the set's rating with it, then the set's total. */
function DrinkRow({
  d,
  shown,
  customer,
  rated,
  onPick,
}: {
  d: DrinkOption;
  shown: Suggestion;
  customer: RareCustomer;
  /** The set rated with this drink. */
  rated: Suggestion | null;
  onPick: (beverage: string) => void;
}) {
  const t = useT();
  const isCurrent = d.beverage.name === shown.drink.beverage.name;
  const total = shown.totalPrice - shown.drink.beverage.price + d.beverage.price;
  const gain = d.score - shown.drink.score;
  const diff = total - shown.totalPrice;
  return (
    <li>
      <button
        className={`pick-row ${isCurrent ? "is-current" : ""}`}
        disabled={isCurrent}
        aria-current={isCurrent || undefined}
        onClick={() => onPick(d.beverage.name)}
      >
        <ItemImage src={d.beverage.image} name={d.beverage.name} size={28} />
        <span className="pick-row-name">
          {d.beverage.name}
          {isCurrent && " ✓"}
          <small>{t("drinks.price", { n: d.beverage.price })}</small>
        </span>
        <span className="pick-row-pts">
          {rated && (
            <span
              className={`rating-dot rating-${RATING_CLASS[rated.rating]}`}
              title={t("drinks.rating", { rating: ratingLabel(rated.rating, t), n: rated.score })}
            />
          )}
          +{d.score}
          <small>
            {gain > 0 ? t("drinks.gain", { n: gain }) : gain < 0 ? t("drinks.loss", { n: -gain }) : t("drinks.samePts")}
          </small>
        </span>
        <span className={`pick-row-price price-${budgetStatus(total, customer)}`}>
          {total}
          <small>{diff === 0 ? t("drinks.samePrice") : `${diff > 0 ? "+" : ""}${diff}`}</small>
        </span>
      </button>
    </li>
  );
}

/**
 * The menu of an extra ingredient on a card: what it is, the ingredients that give the same dish in its place
 * (with their value), and taking it out, with the points that would cost.
 */
function ExtraMenu({
  item,
  liked,
  disliked,
  subs,
  shown,
  without,
  onReplace,
  onRemove,
}: {
  item: ShelfItem;
  liked: string[];
  disliked: string[];
  subs: Ingredient[];
  shown: Suggestion;
  /** The set rated without this ingredient. */
  without: () => Suggestion | null;
  onReplace: (name: string) => void;
  onRemove: () => void;
}) {
  const t = useT();
  const after = without();
  const price = item.ingredient?.price ?? 0;
  const change = after ? after.score - shown.score : 0;
  return (
    <>
      <SlotInfo item={item} liked={liked} disliked={disliked} />
      {subs.length > 0 ? (
        <>
          <h4 className="pick-head pick-head-gap">
            <span>⇄ {t("slot.swapTitle")}</span>
            <span>{t("slot.value")}</span>
          </h4>
          <ul className="pick-rows">
            {subs.map((x) => (
              <li key={x.name}>
                <button className="pick-row pick-row-3" onClick={() => onReplace(x.name)}>
                  <ItemImage src={x.image} name={x.name} size={28} />
                  <span className="pick-row-name">
                    {x.name}
                    <small>{x.tags.join(" · ")}</small>
                  </span>
                  <span className="pick-row-price">
                    {x.price}
                    <small>{x.price === price ? t("drinks.samePrice") : `${x.price > price ? "+" : ""}${x.price - price}`}</small>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="pick-foot pick-head-gap">{t("slot.noSubs")}</p>
      )}
      <button className="pick-row pick-row-2 pick-remove" onClick={onRemove}>
        <span className="pick-remove-icon" aria-hidden>
          ✕
        </span>
        <span className="pick-row-name">
          {t("slot.takeOut")}
          {after && (
            <small>
              {t("slot.takeOutEffect", { n: change > 0 ? `+${change}` : change === 0 ? "±0" : change, rating: ratingLabel(after.rating, t) })}
            </small>
          )}
        </span>
      </button>
    </>
  );
}

/** An empty slot that lists the ingredients that would add points, and adds the one picked to the card. */
function AddIngredient({ order, current, onAdd }: { order: RareOrder; current: Suggestion; onAdd: (name: string) => void }) {
  const t = useT();
  return (
    <Popover label={t("slot.empty")} buttonClassName="slot slot-empty is-open" buttonTitle={t("slot.empty")} button="+">
      {(close) => (
        <AddIngredientList
          order={order}
          current={current}
          onAdd={(name) => {
            onAdd(name);
            close();
          }}
        />
      )}
    </Popover>
  );
}

function AddIngredientList({ order, current, onAdd }: { order: RareOrder; current: Suggestion; onAdd: (name: string) => void }) {
  const t = useT();
  const pool = useAvailablePool();
  const data = useGameData();
  const catalog = useMemo(() => makeCatalog(data.ingredients), [data.ingredients]);
  const { recipe, extras } = current.dish;
  const liked = order.customer.likedFoodTags;
  const effects = ingredientEffects(order, recipe, extras, current.drink.beverage, pool.ingredients, catalog)
    .filter((e) => !e.darkMatter && (e.delta > 0 || e.result.requestsMet > current.requestsMet || e.result.rating > current.rating))
    .slice(0, MAX_ADD_OPTIONS);
  const left = MAX_INGREDIENTS - recipe.ingredients.length - extras.length;
  if (effects.length === 0) return <p className="pick-foot">{t("builder.noneHelpful")}</p>;
  return (
    <>
      <h4 className="pick-head">
        <span>{t("slot.addTitle", { n: left })}</span>
      </h4>
      <ul className="pick-rows">
        {effects.map((e) => (
          <li key={e.ingredient.name}>
            <button className="pick-row" onClick={() => onAdd(e.ingredient.name)}>
              <ItemImage src={e.ingredient.image} name={e.ingredient.name} size={28} />
              <span className="pick-row-name">
                {e.ingredient.name}
                <small>
                  {[...e.gainedTags].sort((a, b) => Number(liked.includes(b)) - Number(liked.includes(a))).map((tag) => (
                    <span key={tag} className={liked.includes(tag) ? "gain-liked" : ""}>
                      +{tag}{" "}
                    </span>
                  ))}
                  {e.lostTags.map((tag) => (
                    <s key={tag}>{tag} </s>
                  ))}
                </small>
              </span>
              <span className="pick-row-pts">
                {e.delta > 0 ? `+${e.delta}` : e.delta}
                <small>{ratingLabel(e.result.rating, t)}</small>
              </span>
              <span className="pick-row-price">
                {e.ingredient.price}
                <small>{t("slot.value")}</small>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="pick-foot">{t("slot.addFoot")}</p>
    </>
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
/** Opens the form that saves a set as a preset; once saved it shows the preset's icon. */
function SaveButton({ saved, open, onToggle }: { saved: SavedSet | undefined; open: boolean; onToggle: () => void }) {
  const t = useT();
  return (
    <button
      className="btn btn-small btn-quiet save-btn"
      aria-expanded={open}
      title={saved ? `${SAVED_SET_ICON[saved.kind]} ${saved.name}` : t("saved.saveTitle")}
      onClick={onToggle}
    >
      {saved ? `${SAVED_SET_ICON[saved.kind]} ${t("saved.saved")}` : `💾 ${t("saved.save")}`}
    </button>
  );
}

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
  saved,
  onSave,
}: {
  order: RareOrder;
  draft: Draft;
  onChange: (d: Draft) => void;
  onClose: () => void;
  pinned: boolean;
  onTogglePin: () => void;
  saved: SavedSet | undefined;
  onSave: (name: string, kind: SavedSetKind) => void;
}) {
  const t = useT();
  const pool = useAvailablePool();
  const data = useGameData();
  const [helpfulOnly, setHelpfulOnly] = useState(true);
  const [saving, setSaving] = useState(false);
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
          <SaveButton saved={saved} open={saving} onToggle={() => setSaving(!saving)} />
          <button className="btn btn-quiet btn-small" onClick={onClose}>
            {t("builder.close")}
          </button>
        </span>
      </div>
      {saving && (
        <SaveSetForm
          defaultName={saved?.name ?? recipe.name}
          defaultKind={saved?.kind}
          onSave={(name, kind) => {
            onSave(name, kind);
            setSaving(false);
          }}
          onCancel={() => setSaving(false)}
        />
      )}

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
      <DishTagLine
        s={result}
        food={order.ignoreRequests ? null : order.foodRequest}
        drink={order.ignoreRequests ? null : order.drinkRequest}
        showAll
      />

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

function tagClass(tag: string, liked: string[], disliked: string[], added: boolean, requested = false): string {
  const kind = liked.includes(tag) ? "tag-liked" : disliked.includes(tag) ? "tag-disliked" : "tag-neutral";
  return `tag ${kind}${added ? " tag-added" : ""}${requested ? " tag-requested" : ""}`;
}
