import { useState } from "react";
import { gameData } from "../data";
import type { Trend } from "../solver/tags";
import { useT } from "../i18n";
import { ItemImage } from "./ItemImage";
import { TrendChips, TrendPicker } from "./TrendPicker";
import { CookwarePicker } from "./CookwarePicker";

/**
 * What holds for every guest tonight: the newspaper's trends, the cookware on hand, and the Night Sparrow
 * "ignore requests" moment. A one-line summary; the trend and cookware pickers open below it.
 */
export function TonightBar({
  trend,
  onTrendChange,
  cookware,
  onCookwareChange,
  recipeCount,
  ignoreRequests,
  onIgnoreRequestsChange,
}: {
  trend: Trend;
  onTrendChange: (t: Trend) => void;
  cookware: string[];
  onCookwareChange: (next: string[]) => void;
  recipeCount: number;
  ignoreRequests: boolean;
  onIgnoreRequestsChange: (on: boolean) => void;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const picked = gameData.cookware.filter((c) => cookware.includes(c.name));
  return (
    <div className="tonight">
      <div className="tonight-summary">
        <span className="tonight-label">{t("tonight.label")}</span>
        <span className="tonight-item">
          <TrendChips trend={trend} />
        </span>
        <span className={`tonight-item tonight-cookware ${picked.length === 0 ? "is-empty" : ""}`}>
          {picked.map((c) => (
            <ItemImage key={c.name} src={c.image} name={c.name} size={18} />
          ))}
          <span>{picked.length === 0 ? t("tonight.noCookware") : t("cookware.count", { n: recipeCount })}</span>
        </span>
        <button className="link-btn" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? t("trend.done") : t("tonight.edit")}
        </button>
        <span className="tonight-spacer" />
        <label className={`ignore-switch ${ignoreRequests ? "is-on" : ""}`}>
          <input type="checkbox" checked={ignoreRequests} onChange={(e) => onIgnoreRequestsChange(e.target.checked)} />
          <span className="ignore-switch-label">{t("ignore.label")}</span>
        </label>
        <details className="help">
          <summary aria-label={t("ignore.label")} title={t("ignore.hint")}>
            ?
          </summary>
          <div className="help-body">
            <p>{t("ignore.hint")}</p>
          </div>
        </details>
      </div>
      {open && (
        <div className="tonight-panel">
          <TrendPicker trend={trend} onChange={onTrendChange} />
          <CookwarePicker value={cookware} onChange={onCookwareChange} recipeCount={recipeCount} />
        </div>
      )}
    </div>
  );
}
