import { gameData } from "../data";
import { ItemImage } from "./ItemImage";
import { useT } from "../i18n";

/** Toggle which cookware the izakaya has tonight. */
export function CookwarePicker({
  value,
  onChange,
  recipeCount,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  recipeCount: number;
}) {
  const t = useT();
  const toggle = (name: string) => onChange(value.includes(name) ? value.filter((c) => c !== name) : [...value, name]);
  return (
    <div className="cookware-picker" role="group" aria-label={t("cookware.label")}>
      <span className="request-label">{t("cookware.label")}</span>
      {gameData.cookware.map((c) => (
        <button key={c.name} className="cookware-chip" aria-pressed={value.includes(c.name)} onClick={() => toggle(c.name)}>
          <ItemImage src={c.image} name={c.name} size={22} />
          {c.name}
        </button>
      ))}
      <span className="hint">
        {value.length === 0 ? t("cookware.none") : t("cookware.count", { n: recipeCount })}
      </span>
    </div>
  );
}
