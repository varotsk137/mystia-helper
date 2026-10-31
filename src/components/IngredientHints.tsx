import type { Ingredient, RareCustomer } from "../data";
import { useT } from "../i18n";
import { ItemImage } from "./ItemImage";

export interface IngredientHint {
  ingredient: Ingredient;
  liked: string[];
  disliked: string[];
  requested: boolean;
}

/**
 * Ingredients that carry a tag this guest likes (or asked for), best first: more liked tags and fewer disliked
 * ones, the requested tag, then cheaper. Not tied to a dish, so recipe bans and tag overrides still apply.
 */
export function ingredientHints(customer: RareCustomer, foodRequest: string | null, ingredients: readonly Ingredient[]): IngredientHint[] {
  const liked = new Set(customer.likedFoodTags);
  if (foodRequest) liked.add(foodRequest);
  return ingredients
    .map((ingredient) => ({
      ingredient,
      liked: ingredient.tags.filter((t) => liked.has(t)),
      disliked: ingredient.tags.filter((t) => customer.dislikedFoodTags.includes(t)),
      requested: foodRequest !== null && ingredient.tags.includes(foodRequest),
    }))
    .filter((h) => h.liked.length > 0)
    .sort(
      (a, b) =>
        b.liked.length - b.disliked.length - (a.liked.length - a.disliked.length) ||
        Number(b.requested) - Number(a.requested) ||
        a.ingredient.price - b.ingredient.price,
    );
}

const MAX_HINTS = 25;

/** Which extra ingredients add tags this guest likes, for picking extras by hand. */
export function IngredientHints({
  customer,
  foodRequest,
  ingredients,
}: {
  customer: RareCustomer;
  foodRequest: string | null;
  ingredients: readonly Ingredient[];
}) {
  const t = useT();
  const hints = ingredientHints(customer, foodRequest, ingredients).slice(0, MAX_HINTS);
  return (
    <section aria-label={t("hints.title")}>
      <p className="hint">{t("hints.note")}</p>
      {hints.length === 0 && <p className="hint">{t("hints.none")}</p>}
      <ol className="hint-list">
        {hints.map((h) => (
          <li key={h.ingredient.name} className="hint-row">
            <ItemImage src={h.ingredient.image} name={h.ingredient.name} size={24} />
            <span className="hint-body">
              <span className="hint-name">
                {h.ingredient.name} <span className="alt-meta">{h.ingredient.price}</span>
              </span>
              <span className="effect-tags">
                {h.ingredient.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`tag ${h.liked.includes(tag) ? "tag-liked" : h.disliked.includes(tag) ? "tag-disliked" : "tag-neutral"}${
                      tag === foodRequest ? " tag-requested" : ""
                    }`}
                  >
                    +{tag}
                  </span>
                ))}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
