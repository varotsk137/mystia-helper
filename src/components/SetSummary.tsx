import { useT } from "../i18n";
import { useGameData } from "../store";
import { ItemImage } from "./ItemImage";

/** A set at a glance: the dish's picture, name and station, the drink, then everything that goes into the pot. */
export function SetSummary({ recipe, extras, beverage }: { recipe: string; extras: string[]; beverage: string }) {
  const t = useT();
  const data = useGameData();
  const dish = data.recipes.find((r) => r.name === recipe);
  const station = dish ? data.cookware.find((c) => c.name === dish.cookware) : undefined;
  const drink = data.beverages.find((b) => b.name === beverage);
  const image = (name: string) => data.ingredients.find((i) => i.name === name)?.image;
  return (
    <span className="set-summary">
      <ItemImage src={dish?.image} name={recipe} size={36} />
      <span className="set-summary-text">
        <span className="set-summary-title">
          <strong>{recipe}</strong>
          {station && (
            <span className="set-station" title={station.name}>
              <ItemImage src={station.image} name={station.name} size={16} />
              {station.name}
            </span>
          )}
        </span>
        <span className="set-summary-drink">
          <span className="with">{t("rare.with")}</span>
          <ItemImage src={drink?.image} name={beverage} size={18} />
          {beverage}
        </span>
        <span className="set-ings" aria-label={t("rare.ingredientsUsed")}>
          {(dish?.ingredients ?? []).map((n, j) => (
            <span key={`b${j}`} className="ing-chip ing-chip-base" title={t("rare.baseIngredient")}>
              <ItemImage src={image(n)} name={n} size={16} /> {n}
            </span>
          ))}
          {extras.map((n, j) => (
            <span key={`e${j}`} className="ing-chip ing-chip-extra" title={t("rare.extraIngredient")}>
              <ItemImage src={image(n)} name={n} size={16} /> {n}
            </span>
          ))}
        </span>
      </span>
    </span>
  );
}
