import { useDeferredValue, useMemo, useState } from "react";
import type { Ingredient, RareCustomer } from "../data";
import { useAvailablePool, useGameData, useStore } from "../store";
import { TrendPicker } from "../components/TrendPicker";
import { CookwarePicker } from "../components/CookwarePicker";
import { FoodRequestPicker, QuoteSearch } from "../components/QuoteParts";
import {
  evaluateCombo,
  ingredientEffects,
  rankDrinks,
  solveRareOrder,
  Rating,
  type BudgetStatus,
  type DrinkOption,
  type RareOrder,
  type Suggestion,
} from "../solver/rare";
import { MAX_INGREDIENTS, TREND_POPULAR, TREND_UNPOPULAR } from "../solver/tags";
import { ItemImage } from "../components/ItemImage";

const RATING_LABEL: Record<Rating, string> = {
  [Rating.Pink]: "ชมพู",
  [Rating.Orange]: "ส้ม",
  [Rating.Green]: "เขียว",
  [Rating.Purple]: "ม่วง",
  [Rating.Black]: "ดำ",
};
const RATING_CLASS: Record<Rating, string> = {
  [Rating.Pink]: "pink",
  [Rating.Orange]: "orange",
  [Rating.Green]: "green",
  [Rating.Purple]: "purple",
  [Rating.Black]: "black",
};
const BUDGET_LABEL: Record<BudgetStatus, string> = {
  safe: "ในงบ",
  risky: "อาจเกินงบ",
  over: "เกินงบ",
  unknown: "ไม่ทราบงบ",
};

type SortKey = "best" | "price" | "score" | "extras" | "level" | "cookTime" | "name";
const SORTS: { key: SortKey; label: string; value: (s: Suggestion) => number | string }[] = [
  { key: "best", label: "แนะนำ (เรตติ้ง, งบ, วัตถุดิบน้อย)", value: () => 0 },
  { key: "price", label: "ราคารวม", value: (s) => s.totalPrice },
  { key: "score", label: "แต้ม", value: (s) => s.score },
  { key: "extras", label: "จำนวนวัตถุดิบที่เติม", value: (s) => s.dish.extras.length },
  { key: "level", label: "เลเวลสูตร", value: (s) => s.dish.recipe.level },
  { key: "cookTime", label: "เวลาทำ", value: (s) => s.dish.recipe.cookTime },
  { key: "name", label: "ชื่ออาหาร", value: (s) => s.dish.recipe.name },
];

interface Draft {
  recipe: string;
  extras: string[];
  beverage: string;
}

function groupCustomers(customers: RareCustomer[]): [string, RareCustomer[]][] {
  const groups = new Map<string, RareCustomer[]>();
  for (const c of customers) {
    const key = c.kind === "special" ? "แขกพิเศษ" : (c.homeLocation ?? "อื่น ๆ");
    groups.set(key, [...(groups.get(key) ?? []), c]);
  }
  return [...groups];
}

export function RareSolverPage() {
  const pool = useAvailablePool();
  const [customerName, setCustomerName] = useState(pool.rareCustomers[0]?.name ?? "");
  const [foodRequest, setFoodRequest] = useState<string | null>(null);
  const [drinkRequest, setDrinkRequest] = useState<string | null>(null);
  const { state, setTrend, setCookware } = useStore();
  const trend = state.trend;
  const [sortKey, setSortKey] = useState<SortKey>("best");
  const [descending, setDescending] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);

  const customer = pool.rareCustomers.find((c) => c.name === customerName) ?? pool.rareCustomers[0];
  const groups = useMemo(() => groupCustomers(pool.rareCustomers), [pool.rareCustomers]);

  const order = useMemo<RareOrder | null>(
    () => (customer ? { customer, foodRequest, drinkRequest, trend } : null),
    [customer, foodRequest, drinkRequest, trend],
  );
  const deferredOrder = useDeferredValue(order);
  const solution = useMemo(
    () => (deferredOrder && !deferredOrder.customer.undocumented ? solveRareOrder(deferredOrder, pool, 1000) : null),
    [deferredOrder, pool],
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
    return indexed.map((x) => x.s);
  }, [solution, sortKey, descending]);

  const selectCustomer = (name: string) => {
    setCustomerName(name);
    setFoodRequest(null);
    setDrinkRequest(null);
    setDraft(null);
  };
  const pick = (s: Suggestion) =>
    setDraft({ recipe: s.dish.recipe.name, extras: s.dish.extras.map((e) => e.name), beverage: s.drink.beverage.name });

  if (!customer || !order) {
    return (
      <div className="page">
        <p className="hint">ยังไม่มีลูกค้าแรร์ที่พบได้ ตรวจ DLC ที่เลือกไว้ในหน้าตั้งค่า หรือโซนที่ปลดล็อกในหน้าความคืบหน้า</p>
      </div>
    );
  }
  const trendNote = describeTrendTaste(customer);

  return (
    <div className="page solver">
      <section className="order" aria-label="ออเดอร์">
        <ItemImage src={customer.image} name={customer.shortName} size={76} variant="portrait" />
        <div className="order-body">
          <div className="order-row">
            <label className="field customer-field">
              <span>ลูกค้า</span>
              <select value={customer.name} onChange={(e) => selectCustomer(e.target.value)}>
                {groups.map(([group, list]) => (
                  <optgroup key={group} label={group}>
                    {list.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.shortName}
                        {c.undocumented ? " (ยังไม่มีข้อมูล)" : ""}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
            <div className="budget">
              <span>งบ</span>
              <strong>{customer.budget ? `${customer.budget.min}–${customer.budget.max}` : "?"}</strong>
            </div>
          </div>

          <QuoteSearch
            customers={pool.rareCustomers}
            currentName={customer.name}
            onPick={(c, tag) => {
              selectCustomer(c.name);
              setFoodRequest(tag);
            }}
          />

          {customer.undocumented ? (
            <p className="hint">Wiki ยังไม่มีข้อมูลรสนิยมของ {customer.shortName} ใส่ข้อมูลเองได้ที่หน้าข้อมูลเกม</p>
          ) : (
            <>
              <FoodRequestPicker customer={customer} value={foodRequest} onChange={setFoodRequest} />
              <RequestPicker label="ขอเครื่องดื่ม" tags={customer.likedDrinkTags} value={drinkRequest} onChange={setDrinkRequest} />
              <div className="dislikes">
                <span>ไม่ชอบ</span>
                {customer.dislikedFoodTags.length ? (
                  customer.dislikedFoodTags.map((t) => (
                    <span key={t} className="tag tag-disliked">
                      {t}
                    </span>
                  ))
                ) : (
                  <span className="hint">ไม่มี</span>
                )}
              </div>
              <TrendPicker trend={trend} onChange={setTrend} customerNote={trendNote} />
              <CookwarePicker value={state.cookware} onChange={setCookware} recipeCount={pool.recipes.length} />
            </>
          )}
        </div>
      </section>

      {solution && (
        <div className={`results ${stale ? "is-stale" : ""}`}>
          <section className="suggestions" aria-label="ชุดที่แนะนำ">
            <div className="results-head">
              <h2>ชุดที่แนะนำ</h2>
              <label className="sort">
                <span>เรียงตาม</span>
                <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
                  {SORTS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
                {sortKey !== "best" && (
                  <button className="btn btn-quiet" onClick={() => setDescending(!descending)}>
                    {descending ? "มากไปน้อย" : "น้อยไปมาก"}
                  </button>
                )}
              </label>
            </div>
            {foodRequest === null && drinkRequest === null && (
              <p className="hint">เลือก tag ที่ลูกค้าขอด้านบน ผลลัพธ์จะเรียงให้ตรงกับออเดอร์</p>
            )}
            {sorted.length === 0 && <p className="hint">ไม่มีสูตรที่ทำได้ ลองเลือกอุปกรณ์เพิ่มด้านบน หรือปลดล็อกสูตรเพิ่มในหน้าความคืบหน้า</p>}
            <ol className="suggestion-list">
              {sorted.map((s) => (
                <SuggestionRow
                  key={s.dish.recipe.name}
                  s={s}
                  selected={draft?.recipe === s.dish.recipe.name}
                  onPick={() => pick(s)}
                />
              ))}
            </ol>
          </section>
          <aside className="side-panel">
            {draft ? (
              <DishBuilder order={order} draft={draft} onChange={setDraft} onClose={() => setDraft(null)} />
            ) : (
              <DrinkRanking drinks={solution.drinks} />
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
      {props.tags.map((t) => (
        <button
          key={t}
          role="radio"
          aria-checked={props.value === t}
          className="request-chip"
          onClick={() => props.onChange(props.value === t ? null : t)}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

/** How this customer reacts to trends, or null when trends don't affect their score. */
function describeTrendTaste(c: RareCustomer): string | null {
  const parts: string[] = [];
  if (c.likedFoodTags.includes(TREND_POPULAR)) parts.push("ชอบของที่ฮิต");
  if (c.dislikedFoodTags.includes(TREND_POPULAR)) parts.push("ไม่ชอบของที่ฮิต");
  if (c.likedFoodTags.includes(TREND_UNPOPULAR)) parts.push("ชอบของที่ไม่ฮิต");
  if (c.dislikedFoodTags.includes(TREND_UNPOPULAR)) parts.push("ไม่ชอบของที่ไม่ฮิต");
  return parts.length ? `${c.shortName} ${parts.join(" และ")}` : `Trend ไม่มีผลกับแต้มของ ${c.shortName}`;
}

function RatingBadge({ s, compact = false }: { s: Suggestion; compact?: boolean }) {
  return (
    <div className={`rating rating-${RATING_CLASS[s.rating]} ${compact ? "rating-compact" : ""}`}>
      <span className="rating-name">{RATING_LABEL[s.rating]}</span>
      <span className="rating-score">{s.score} แต้ม</span>
    </div>
  );
}

function DishTagLine({ s }: { s: Suggestion }) {
  const { dish, drink } = s;
  const added = new Set(dish.dish.added);
  return (
    <div className="tag-line">
      {dish.dish.tags.map((t) => (
        <span key={t} className={tagClass(t, dish.liked, dish.disliked, added.has(t))}>
          {t}
        </span>
      ))}
      {dish.dish.removed.map((t) => (
        <s key={t} className="tag tag-removed" title="ถูก tag อื่นทับ">
          {t}
        </s>
      ))}
      <span className="tag-sep" aria-hidden />
      {drink.beverage.tags.map((t) => (
        <span key={t} className={tagClass(t, drink.liked, [], false)}>
          {t}
        </span>
      ))}
    </div>
  );
}

function SuggestionRow({ s, selected, onPick }: { s: Suggestion; selected: boolean; onPick: () => void }) {
  const { dish, drink } = s;
  return (
    <li className={`suggestion ${selected ? "is-selected" : ""}`}>
      <RatingBadge s={s} />
      <div className="suggestion-body">
        <div className="dish-line">
          <ItemImage src={dish.recipe.image} name={dish.recipe.name} size={32} />
          <strong className="dish-name">{dish.recipe.name}</strong>
          <Extras dish={dish} />
          <span className="with">กับ</span>
          <ItemImage src={drink.beverage.image} name={drink.beverage.name} size={28} />
          <strong className="drink-name">{drink.beverage.name}</strong>
          {s.altDrinks.length > 0 && <span className="or">(หรือ {s.altDrinks.map((d) => d.beverage.name).join(", ")})</span>}
        </div>
        <IngredientStrip dish={dish} />
        <DishTagLine s={s} />
        {(s.note || s.requestsMet < 2) && (
          <div className="warn">
            {s.note ?? (s.requestsMet === 1 ? "ทำได้แค่ 1 ใน 2 อย่างที่ลูกค้าขอ" : "ไม่ตรงกับที่ลูกค้าขอเลย")}
          </div>
        )}
        {s.alternatives.length > 0 && (
          <details className="alternatives">
            <summary>
              เติมแบบอื่นที่ได้{RATING_LABEL[s.rating]}เหมือนกัน ({s.alternatives.length})
            </summary>
            <ul>
              {s.alternatives.map((alt, i) => (
                <li key={i}>
                  {alt.dish.extras.length === 0 ? <span className="with">ไม่ต้องเติม</span> : <Extras dish={alt.dish} />}
                  <span className="with">กับ</span>
                  <span>{alt.drink.beverage.name}</span>
                  <span className="alt-meta">
                    {alt.score} แต้ม, {alt.totalPrice}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
      <div className={`price price-${s.budget}`}>
        <strong>{s.totalPrice}</strong>
        <span>{BUDGET_LABEL[s.budget]}</span>
        <span className="cookware">
          {dish.recipe.cookware}, {dish.recipe.cookTime}s
        </span>
        <button className="btn btn-small" aria-pressed={selected} onClick={onPick}>
          {selected ? "กำลังปรับ" : "ปรับเอง"}
        </button>
      </div>
    </li>
  );
}

/** Everything that goes into the pot: the recipe's base ingredients, then the extras. */
function IngredientStrip({ dish }: { dish: Suggestion["dish"] }) {
  const data = useGameData();
  const image = (name: string) => data.ingredients.find((i) => i.name === name)?.image;
  return (
    <div className="ingredient-strip" aria-label="วัตถุดิบที่ใช้">
      <span className="strip-label">วัตถุดิบ</span>
      {dish.recipe.ingredients.map((n, i) => (
        <span key={`base-${i}`} className="ing-chip ing-chip-base" title="วัตถุดิบตั้งต้นของสูตร">
          <ItemImage src={image(n)} name={n} size={20} /> {n}
        </span>
      ))}
      {dish.extras.map((e, i) => (
        <span key={`extra-${i}`} className="ing-chip ing-chip-extra" title="วัตถุดิบที่เติม">
          <ItemImage src={e.image} name={e.name} size={20} /> {e.name}
        </span>
      ))}
    </div>
  );
}

/** "+ Honey (หรือ Peach)" for each extra ingredient, collapsing repeated fillers into "×n". */
function Extras({ dish }: { dish: Suggestion["dish"] }) {
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
          {it.subs.length > 0 && <span className="or"> (หรือ {it.subs.join(", ")})</span>}
        </span>
      ))}
    </>
  );
}

function DrinkRanking({ drinks }: { drinks: DrinkOption[] }) {
  return (
    <section aria-label="เครื่องดื่ม">
      <h2>เครื่องดื่ม</h2>
      <p className="hint">กด "ปรับเอง" ที่ชุดใดชุดหนึ่ง เพื่อเปลี่ยนวัตถุดิบหรือเครื่องดื่มเอง</p>
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
}: {
  order: RareOrder;
  draft: Draft;
  onChange: (d: Draft) => void;
  onClose: () => void;
}) {
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
  if (!recipe || !beverage) return null;

  const result = evaluateCombo(order, recipe, extras, beverage);
  const slotsLeft = MAX_INGREDIENTS - recipe.ingredients.length - extras.length;
  const effects = ingredientEffects(order, recipe, extras, beverage, pool.ingredients);
  const shownEffects = helpfulOnly
    ? effects.filter((e) => !e.darkMatter && (e.delta > 0 || e.result.requestsMet > result.requestsMet || e.result.rating > result.rating))
    : effects;

  return (
    <section className="builder" aria-label="จัดชุดเอง">
      <div className="builder-head">
        <h2>จัดชุดเอง</h2>
        <button className="btn btn-quiet btn-small" onClick={onClose}>
          ปิด
        </button>
      </div>

      <div className="builder-summary">
        <RatingBadge s={result} />
        <div>
          <div className="builder-dish">
            <ItemImage src={recipe.image} name={recipe.name} size={40} />
            <strong>{recipe.name}</strong>
          </div>
          <div className={`price-inline price-${result.budget}`}>
            ราคารวม {result.totalPrice} ({BUDGET_LABEL[result.budget]})
          </div>
        </div>
      </div>
      {(result.note || result.requestsMet < 2) && (
        <div className="warn">
          {result.note ??
            (result.dish.dish.conflicts.length
              ? `กลายเป็น Dark Matter เพราะเติม ${result.dish.dish.conflicts.join(", ")}`
              : result.requestsMet === 1
                ? "ทำได้แค่ 1 ใน 2 อย่างที่ลูกค้าขอ"
                : "ไม่ตรงกับที่ลูกค้าขอเลย")}
        </div>
      )}
      <DishTagLine s={result} />

      <h3>วัตถุดิบ</h3>
      <div className="builder-ingredients">
        {recipe.ingredients.map((n, i) => {
          const ing = byName(data.ingredients, n);
          return (
            <span key={`base-${i}`} className="ing-chip ing-chip-base" title="วัตถุดิบตั้งต้นของสูตร">
              <ItemImage src={ing?.image} name={n} size={22} /> {n}
            </span>
          );
        })}
        {extras.map((e, i) => (
          <span key={`extra-${i}`} className="ing-chip ing-chip-extra">
            <ItemImage src={e.image} name={e.name} size={22} /> {e.name}
            <button
              aria-label={`เอา ${e.name} ออก`}
              onClick={() => onChange({ ...draft, extras: draft.extras.filter((_, j) => j !== i) })}
            >
              ×
            </button>
          </span>
        ))}
        <span className="hint">
          {slotsLeft > 0 ? `เติมได้อีก ${slotsLeft}` : "ครบ 5 อย่างแล้ว"}
        </span>
      </div>

      <label className="field">
        <span>เครื่องดื่ม</span>
        <select value={beverage.name} onChange={(e) => onChange({ ...draft, beverage: e.target.value })}>
          {drinks.map((d) => (
            <option key={d.beverage.name} value={d.beverage.name}>
              {d.beverage.name} (+{d.score}
              {d.requestMet ? "" : ", ไม่ตรงที่ขอ"}, {d.beverage.price})
            </option>
          ))}
        </select>
      </label>

      {slotsLeft > 0 && (
        <>
          <div className="builder-effects-head">
            <h3>เติมวัตถุดิบ</h3>
            <label className="check">
              <input type="checkbox" checked={helpfulOnly} onChange={(e) => setHelpfulOnly(e.target.checked)} />
              เฉพาะที่ช่วยได้
            </label>
          </div>
          {shownEffects.length === 0 && (
            <p className="hint">ไม่มีวัตถุดิบที่ช่วยเพิ่มแต้มได้แล้ว เอาติ๊ก "เฉพาะที่ช่วยได้" ออกเพื่อดูทั้งหมด</p>
          )}
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
                          {e.gainedTags.map((t) => (
                            <span key={t} className={tagClass(t, e.result.dish.liked, e.result.dish.disliked, true)}>
                              +{t}
                            </span>
                          ))}
                          {e.lostTags.map((t) => (
                            <s key={t} className="tag tag-removed">
                              {t}
                            </s>
                          ))}
                          {e.gainedTags.length === 0 && e.lostTags.length === 0 && <span className="alt-meta">ไม่เพิ่ม tag ใหม่</span>}
                        </>
                      )}
                    </span>
                  </span>
                  <span className={`effect-delta ${e.delta > 0 ? "up" : e.delta < 0 ? "down" : ""}`}>
                    {e.delta > 0 ? `+${e.delta}` : e.delta}
                  </span>
                  <span className={`rating-dot rating-${RATING_CLASS[e.result.rating]}`} title={RATING_LABEL[e.result.rating]} />
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
