import { useDeferredValue, useMemo, useState } from "react";
import { gameData, type RareCustomer } from "../data";
import { useOwnedPool } from "../settings";
import { solveRareOrder, Rating, type BudgetStatus, type DrinkOption, type Suggestion } from "../solver/rare";
import { TREND_POPULAR, TREND_UNPOPULAR, type Trend } from "../solver/tags";

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

function groupCustomers(customers: RareCustomer[]): [string, RareCustomer[]][] {
  const groups = new Map<string, RareCustomer[]>();
  for (const c of customers) {
    const key = c.kind === "special" ? "แขกพิเศษ" : (c.homeLocation ?? "อื่น ๆ");
    groups.set(key, [...(groups.get(key) ?? []), c]);
  }
  return [...groups];
}

export function RareSolverPage() {
  const pool = useOwnedPool();
  const [customerName, setCustomerName] = useState(pool.rareCustomers[0]?.name ?? "");
  const [foodRequest, setFoodRequest] = useState<string | null>(null);
  const [drinkRequest, setDrinkRequest] = useState<string | null>(null);
  const [trend, setTrend] = useState<Trend>({ popular: null, unpopular: null });

  const customer = pool.rareCustomers.find((c) => c.name === customerName) ?? pool.rareCustomers[0];
  const groups = useMemo(() => groupCustomers(pool.rareCustomers), [pool.rareCustomers]);

  const order = useMemo(() => ({ customer, foodRequest, drinkRequest, trend }), [customer, foodRequest, drinkRequest, trend]);
  const deferredOrder = useDeferredValue(order);
  const solution = useMemo(
    () => (deferredOrder.customer && !deferredOrder.customer.undocumented ? solveRareOrder(deferredOrder, pool, 40) : null),
    [deferredOrder, pool],
  );
  const stale = deferredOrder !== order;

  const selectCustomer = (name: string) => {
    setCustomerName(name);
    setFoodRequest(null);
    setDrinkRequest(null);
  };

  if (!customer) return <div className="page">ไม่มีลูกค้าใน DLC ที่เลือกไว้</div>;
  const caresAboutTrend = [...customer.likedFoodTags, ...customer.dislikedFoodTags].some(
    (t) => t === TREND_POPULAR || t === TREND_UNPOPULAR,
  );

  return (
    <div className="page solver">
      <section className="order" aria-label="ออเดอร์">
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

        {customer.undocumented ? (
          <p className="hint">Wiki ยังไม่มีข้อมูลรสนิยมของ {customer.shortName} จึงคำนวณให้ไม่ได้</p>
        ) : (
          <>
            <RequestPicker
              label="ขออาหาร"
              tags={customer.likedFoodTags}
              value={foodRequest}
              onChange={setFoodRequest}
            />
            <RequestPicker
              label="ขอเครื่องดื่ม"
              tags={customer.likedDrinkTags}
              value={drinkRequest}
              onChange={setDrinkRequest}
            />
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
            {caresAboutTrend && <TrendPicker trend={trend} onChange={setTrend} />}
          </>
        )}
      </section>

      {solution && (
        <div className={`results ${stale ? "is-stale" : ""}`}>
          <section className="suggestions" aria-label="ชุดที่แนะนำ">
            <h2>ชุดที่แนะนำ</h2>
            {foodRequest === null && drinkRequest === null && (
              <p className="hint">เลือก tag ที่ลูกค้าขอด้านบน ผลลัพธ์จะเรียงให้ตรงกับออเดอร์</p>
            )}
            <ol className="suggestion-list">
              {solution.suggestions.map((s) => (
                <SuggestionRow key={s.dish.recipe.name} s={s} />
              ))}
            </ol>
          </section>
          <aside className="drinks" aria-label="เครื่องดื่ม">
            <h2>เครื่องดื่ม</h2>
            <ol className="drink-list">
              {solution.drinks.slice(0, 12).map((d) => (
                <DrinkRow key={d.beverage.name} d={d} />
              ))}
            </ol>
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

function TrendPicker({ trend, onChange }: { trend: Trend; onChange: (t: Trend) => void }) {
  const select = (key: keyof Trend, label: string) => (
    <label className="field">
      <span>{label}</span>
      <select value={trend[key] ?? ""} onChange={(e) => onChange({ ...trend, [key]: e.target.value || null })}>
        <option value="">ไม่ทราบ</option>
        {gameData.tags.food
          .filter((t) => !t.startsWith("Trend"))
          .map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
      </select>
    </label>
  );
  return (
    <div className="trend">
      {select("popular", "Trend วันนี้: ฮิต")}
      {select("unpopular", "ไม่ฮิต")}
    </div>
  );
}

function SuggestionRow({ s }: { s: Suggestion }) {
  const { dish, drink } = s;
  const added = new Set(dish.dish.added);
  return (
    <li className="suggestion">
      <div className={`rating rating-${RATING_CLASS[s.rating]}`}>
        <span className="rating-name">{RATING_LABEL[s.rating]}</span>
        <span className="rating-score">{s.score} แต้ม</span>
      </div>
      <div className="suggestion-body">
        <div className="dish-line">
          <strong className="dish-name">{dish.recipe.name}</strong>
          <Extras dish={dish} />
          <span className="with">กับ</span>
          <strong className="drink-name">{drink.beverage.name}</strong>
          {s.altDrinks.length > 0 && <span className="or">(หรือ {s.altDrinks.map((d) => d.beverage.name).join(", ")})</span>}
        </div>
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
        <span className="cookware">{dish.recipe.cookware}</span>
      </div>
    </li>
  );
}

/** "+ Honey (หรือ Peach)" for each extra ingredient, collapsing repeated fillers into "×n". */
function Extras({ dish }: { dish: Suggestion["dish"] }) {
  const items: { name: string; count: number; subs: string[] }[] = [];
  dish.extras.forEach((e, i) => {
    const last = items[items.length - 1];
    if (last && last.name === e.name) last.count++;
    else items.push({ name: e.name, count: 1, subs: dish.substitutes[i]?.map((x) => x.name) ?? [] });
  });
  return (
    <>
      {items.map((it, i) => (
        <span key={i} className="extra">
          + {it.name}
          {it.count > 1 && ` ×${it.count}`}
          {it.subs.length > 0 && <span className="or"> (หรือ {it.subs.join(", ")})</span>}
        </span>
      ))}
    </>
  );
}

function DrinkRow({ d }: { d: DrinkOption }) {
  return (
    <li className={`drink ${d.requestMet ? "" : "is-off"}`}>
      <span className="drink-row-name">{d.beverage.name}</span>
      <span className="drink-row-score">+{d.score}</span>
      <span className="drink-row-price">{d.beverage.price}</span>
    </li>
  );
}

function tagClass(tag: string, liked: string[], disliked: string[], added: boolean): string {
  const kind = liked.includes(tag) ? "tag-liked" : disliked.includes(tag) ? "tag-disliked" : "tag-neutral";
  return `tag ${kind}${added ? " tag-added" : ""}`;
}
