import { useEffect, useState } from "react";
import type { RareCustomer } from "../data";
import type { GuestOrder } from "../guests";
import { Rating } from "../solver/rare";
import { useT, type Translate } from "../i18n";
import { ItemImage } from "./ItemImage";

const RATING_CLASS: Record<Rating, "pink" | "orange" | "green" | "purple" | "black"> = {
  [Rating.Pink]: "pink",
  [Rating.Orange]: "orange",
  [Rating.Green]: "green",
  [Rating.Purple]: "purple",
  [Rating.Black]: "black",
};

export interface SeatedGuest {
  order: GuestOrder;
  customer: RareCustomer;
  /** Best reachable rating for the current order, or null before any tag is picked. */
  best: Rating | null;
}

/**
 * One tab per guest in the izakaya; a button that opens the picker to seat another; a pin that keeps the bar
 * stuck to the top of the screen; and "clear night", which needs a second click to confirm.
 */
export function GuestTabs({
  seated,
  active,
  customers,
  sticky,
  canClear,
  onSelect,
  onRemove,
  onAdd,
  onToggleSticky,
  onClearNight,
}: {
  seated: SeatedGuest[];
  active: string | null;
  customers: readonly RareCustomer[];
  /** Whether the bar stays at the top of the screen while scrolling. */
  sticky: boolean;
  /** Whether there is anything (guests or pins) to clear. */
  canClear: boolean;
  onSelect: (name: string) => void;
  onRemove: (name: string) => void;
  onAdd: (name: string) => void;
  onToggleSticky: () => void;
  onClearNight: () => void;
}) {
  const t = useT();
  const [picking, setPicking] = useState(false);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const pickerOpen = picking || seated.length === 0;
  // The confirm state lapses after a few seconds so a stray click later doesn't clear the night.
  useEffect(() => {
    if (!confirmingClear) return;
    const id = setTimeout(() => setConfirmingClear(false), 4000);
    return () => clearTimeout(id);
  }, [confirmingClear]);
  return (
    <section className={`guests ${sticky ? "is-sticky" : ""}`} aria-label={t("guests.title")}>
      <div className="guest-tabs" role="tablist" aria-label={t("guests.title")}>
        {seated.map(({ order, customer, best }) => {
          const isActive = order.name === active;
          return (
            <div key={order.name} className={`guest-tab ${isActive ? "is-active" : ""}`}>
              <button role="tab" aria-selected={isActive} className="guest-tab-main" onClick={() => onSelect(order.name)}>
                <ItemImage src={customer.image} name={customer.shortName} size={28} variant="portrait" />
                <span className="guest-tab-text">
                  <span className="guest-tab-name">{customer.shortName}</span>
                  <span className="guest-tab-order">{orderSummary(order, t)}</span>
                </span>
                {best !== null && (
                  <span className={`rating-dot rating-${RATING_CLASS[best]}`} title={t(`rating.${RATING_CLASS[best]}`)} />
                )}
              </button>
              <button
                className="guest-tab-close"
                aria-label={t("guests.remove", { name: customer.shortName })}
                title={t("guests.remove", { name: customer.shortName })}
                onClick={() => onRemove(order.name)}
              >
                ×
              </button>
            </div>
          );
        })}
        {seated.length > 0 && (
          <button className="guest-add" aria-expanded={pickerOpen} onClick={() => setPicking(!picking)}>
            {picking ? t("builder.close") : t("guests.add")}
          </button>
        )}
        <span className="guest-tabs-spacer" />
        <button
          className="guest-sticky"
          aria-pressed={sticky}
          title={sticky ? t("guests.unstick") : t("guests.stick")}
          aria-label={sticky ? t("guests.unstick") : t("guests.stick")}
          onClick={onToggleSticky}
        >
          📌
        </button>
        {canClear && (
          <button
            className={`guest-clear ${confirmingClear ? "is-confirming" : ""}`}
            title={t("night.clearHint")}
            onClick={() => {
              if (!confirmingClear) return setConfirmingClear(true);
              setConfirmingClear(false);
              onClearNight();
            }}
          >
            {confirmingClear ? t("night.confirm") : t("night.clear")}
          </button>
        )}
      </div>
      {pickerOpen && (
        <GuestPicker
          customers={customers}
          seatedNames={seated.map((s) => s.order.name)}
          empty={seated.length === 0}
          onPick={(name) => {
            onAdd(name);
            setPicking(false);
          }}
        />
      )}
    </section>
  );
}

function orderSummary(order: GuestOrder, t: Translate): string {
  const parts = [order.food, order.drink].filter((x): x is string => !!x);
  return parts.length ? parts.join(" + ") : t("guests.noOrder");
}

/** Portrait grid of every rare guest that can appear, grouped by home area, with a name filter. */
function GuestPicker({
  customers,
  seatedNames,
  empty,
  onPick,
}: {
  customers: readonly RareCustomer[];
  seatedNames: string[];
  empty: boolean;
  onPick: (name: string) => void;
}) {
  const t = useT();
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const shown = customers.filter((c) => !q || c.name.toLowerCase().includes(q) || c.shortName.toLowerCase().includes(q));
  const groups = new Map<string, RareCustomer[]>();
  for (const c of shown) {
    const key = c.kind === "special" ? t("rare.groupSpecial") : (c.homeLocation ?? t("rare.groupOther"));
    groups.set(key, [...(groups.get(key) ?? []), c]);
  }
  return (
    <div className="guest-picker">
      <div className="guest-picker-head">
        <span>{empty ? t("guests.empty") : t("guests.pick")}</span>
        <input
          type="search"
          className="search"
          value={query}
          placeholder={t("db.search")}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus={!empty}
        />
      </div>
      {[...groups].map(([group, list]) => (
        <div key={group} className="guest-picker-group">
          <span className="guest-picker-area">{group}</span>
          <div className="guest-picker-grid">
            {list.map((c) => {
              const here = seatedNames.includes(c.name);
              return (
                <button
                  key={c.name}
                  className={`guest-choice ${here ? "is-here" : ""}`}
                  title={here ? t("guests.here") : c.name + (c.undocumented ? t("rare.noDataSuffix") : "")}
                  onClick={() => onPick(c.name)}
                >
                  <ItemImage src={c.image} name={c.shortName} size={40} variant="portrait" />
                  <span>
                    {c.shortName}
                    {c.undocumented && <span className="guest-choice-note">{t("rare.noDataSuffix")}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {shown.length === 0 && <p className="hint">{t("guests.noMatch")}</p>}
    </div>
  );
}
