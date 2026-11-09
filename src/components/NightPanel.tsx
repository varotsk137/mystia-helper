import type { RareCustomer } from "../data";
import type { GuestOrder } from "../guests";
import type { PinnedSet } from "../pins";
import { Rating, type Suggestion } from "../solver/rare";
import { useT, type Translate } from "../i18n";
import { SAVED_SET_ICON, type SavedSet } from "../savedSets";
import { ItemImage } from "./ItemImage";
import { SetSummary } from "./SetSummary";

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

/** Sets suggested for one guest on the cookware that no pinned set uses yet. */
export interface FreeCookwareView {
  guest: string;
  sets: { set: PinnedSet; result: Suggestion }[];
}

/**
 * Tonight's pinned guests and sets, kept in view beside the results, then any `free` suggestions. With nothing
 * to show it renders nothing, or a hint when `showEmpty` (for a column of its own).
 */
export function NightPanel({
  guests,
  active,
  free,
  savedOf,
  showEmpty = false,
  onOpenGuest,
  onOpenSet,
  onUnpinSet,
  onPinSet,
}: {
  guests: PinnedGuestView[];
  active: string | null;
  free?: FreeCookwareView;
  /** The preset a pinned set was saved as, if any, to show its name. */
  savedOf: (set: PinnedSet) => SavedSet | undefined;
  showEmpty?: boolean;
  onOpenGuest: (name: string) => void;
  onOpenSet: (set: PinnedSet) => void;
  onUnpinSet: (set: PinnedSet) => void;
  onPinSet: (set: PinnedSet) => void;
}) {
  const t = useT();
  const hasFree = !!free && free.sets.length > 0;
  if (guests.length === 0 && !hasFree && !showEmpty) return null;
  return (
    <section className="night-panel" aria-label={t("pins.title")}>
      <h2>{t("pins.title")}</h2>
      {guests.length === 0 && <p className="hint night-empty">{t("pins.none")}</p>}
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
                  <li key={i} className={`night-set ${result ? `rate-${RATING_CLASS[result.rating]}` : ""}`}>
                    <SetButton set={set} result={result} saved={savedOf(set)} onOpen={onOpenSet} />
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
      {hasFree && (
        <div className="night-free">
          <h3>{t("pins.free", { guest: free.guest })}</h3>
          <ul className="night-sets">
            {free.sets.map(({ set, result }) => (
              <li key={set.recipe} className={`night-set rate-${RATING_CLASS[result.rating]}`}>
                <SetButton set={set} result={result} onOpen={onOpenSet} />
                <button className="night-set-unpin night-set-pin" aria-label={t("pins.pin")} title={t("pins.pin")} onClick={() => onPinSet(set)}>
                  📌
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/** A set as a button that opens it, with its picture, price and rating. */
function SetButton({
  set,
  result,
  saved,
  onOpen,
}: {
  set: PinnedSet;
  result: Suggestion | null;
  saved?: SavedSet;
  onOpen: (set: PinnedSet) => void;
}) {
  const t = useT();
  return (
    <button className="night-set-main" onClick={() => onOpen(set)} title={t("pins.open")}>
      <span className="night-set-text">
        {saved && (
          <span className="night-set-saved">
            {SAVED_SET_ICON[saved.kind]} {saved.name}
          </span>
        )}
        <SetSummary
          recipe={set.recipe}
          extras={set.extras}
          beverage={set.beverage}
          aside={
            result && (
              <span className="night-set-price">
                <strong>{result.totalPrice}</strong>
                <span className="night-set-rating">
                  {t(`rating.${RATING_CLASS[result.rating]}`)} {result.score}
                </span>
              </span>
            )
          }
        />
      </span>
    </button>
  );
}

function orderSummary(order: GuestOrder | null, t: Translate): string {
  if (!order) return t("pins.left");
  const parts = [order.food, order.drink].filter((x): x is string => !!x);
  return parts.length ? parts.join(" + ") : t("guests.noOrder");
}
