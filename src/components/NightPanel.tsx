import type { RareCustomer } from "../data";
import type { GuestOrder } from "../guests";
import type { PinnedSet } from "../pins";
import { Rating, type Suggestion } from "../solver/rare";
import { useT, type Translate } from "../i18n";
import { ItemImage } from "./ItemImage";

const RATING_CLASS: Record<Rating, "pink" | "orange" | "green" | "purple" | "black"> = {
  [Rating.Pink]: "pink",
  [Rating.Orange]: "orange",
  [Rating.Green]: "green",
  [Rating.Purple]: "purple",
  [Rating.Black]: "black",
};

export interface PinnedGuestView {
  customer: RareCustomer;
  /** The guest's current order, or null if they are no longer seated. */
  order: GuestOrder | null;
  /** Pinned sets, each rated against the guest's current order (null when its recipe or drink no longer exists). */
  sets: { set: PinnedSet; result: Suggestion | null }[];
}

/** Tonight's pinned guests and sets, kept in view in the right-hand panel. */
export function NightPanel({
  guests,
  active,
  onOpenGuest,
  onOpenSet,
  onUnpinSet,
}: {
  guests: PinnedGuestView[];
  active: string | null;
  onOpenGuest: (name: string) => void;
  onOpenSet: (set: PinnedSet) => void;
  onUnpinSet: (set: PinnedSet) => void;
}) {
  const t = useT();
  if (guests.length === 0) return null;
  return (
    <section className="night-panel" aria-label={t("pins.title")}>
      <h2>{t("pins.title")}</h2>
      <ul className="night-guests">
        {guests.map(({ customer, order, sets }) => (
          <li key={customer.name} className={`night-guest ${customer.name === active ? "is-active" : ""}`}>
            <button className="night-guest-head" onClick={() => onOpenGuest(customer.name)}>
              <ItemImage src={customer.image} name={customer.shortName} size={24} variant="portrait" />
              <span className="night-guest-name">{customer.shortName}</span>
              <span className="night-guest-order">{orderSummary(order, t)}</span>
            </button>
            {sets.length === 0 ? (
              <p className="hint night-empty">{t("pins.noSets")}</p>
            ) : (
              <ul className="night-sets">
                {sets.map(({ set, result }, i) => (
                  <li key={i} className="night-set">
                    <button className="night-set-main" onClick={() => onOpenSet(set)} title={t("pins.open")}>
                      {result && (
                        <span
                          className={`rating-dot rating-${RATING_CLASS[result.rating]}`}
                          title={t(`rating.${RATING_CLASS[result.rating]}`)}
                        />
                      )}
                      <span className="night-set-text">
                        <strong>{set.recipe}</strong>
                        {set.extras.length > 0 && <span className="extra"> + {set.extras.join(" + ")}</span>}
                        <span className="with"> {t("rare.with")} </span>
                        {set.beverage}
                      </span>
                      {result && <span className="night-set-price">{result.totalPrice}</span>}
                    </button>
                    <button
                      className="night-set-unpin"
                      aria-label={t("pins.unpin")}
                      title={t("pins.unpin")}
                      onClick={() => onUnpinSet(set)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function orderSummary(order: GuestOrder | null, t: Translate): string {
  if (!order) return t("pins.left");
  const parts = [order.food, order.drink].filter((x): x is string => !!x);
  return parts.length ? parts.join(" + ") : t("guests.noOrder");
}
