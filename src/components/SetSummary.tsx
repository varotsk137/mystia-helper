import type { ReactNode } from "react";
import { useGameData } from "../store";
import { IngredientShelf } from "./IngredientShelf";
import { ItemImage } from "./ItemImage";

/**
 * A set at a glance, laid out like a suggestion card: the dish on its tile with the station and drink names
 * (and `aside`, such as the price, on the right), then the pot as five slots plus the drink.
 */
export function SetSummary({
  recipe,
  extras,
  beverage,
  aside,
}: {
  recipe: string;
  extras: string[];
  beverage: string;
  aside?: ReactNode;
}) {
  const data = useGameData();
  const dish = data.recipes.find((r) => r.name === recipe);
  const station = dish ? data.cookware.find((c) => c.name === dish.cookware) : undefined;
  const drink = data.beverages.find((b) => b.name === beverage);
  const ingredient = (name: string) => data.ingredients.find((i) => i.name === name);
  return (
    <span className="set-summary">
      <span className="set-summary-head">
        <span className="dish-tile dish-tile-small">
          <ItemImage src={dish?.image} name={recipe} size={30} />
        </span>
        <span className="set-summary-text">
          <strong>{recipe}</strong>
          <span className="set-summary-sub">
            {station && (
              <span className="set-station">
                <ItemImage src={station.image} name={station.name} size={15} />
                {station.name}
              </span>
            )}
            <span className="set-summary-drink">{beverage}</span>
          </span>
        </span>
        {aside}
      </span>
      <span className="set-summary-build">
        <IngredientShelf
          small
          items={[
            ...(dish?.ingredients ?? []).map((name) => ({ name, ingredient: ingredient(name), kind: "base" as const })),
            ...extras.map((name) => ({ name, ingredient: ingredient(name), kind: "extra" as const })),
          ]}
        />
        <span className="set-summary-plus" aria-hidden>
          +
        </span>
        <span className="shelf shelf-small" title={beverage}>
          <span className="slot slot-base">
            <ItemImage src={drink?.image} name={beverage} size={22} />
          </span>
        </span>
      </span>
    </span>
  );
}
