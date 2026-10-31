import { gameData } from "../data";
import { DARK_MATTER, TREND_POPULAR, TREND_UNPOPULAR, type Trend } from "../solver/tags";
import { useT } from "../i18n";

const TREND_TAGS = gameData.tags.food.filter((t) => t !== TREND_POPULAR && t !== TREND_UNPOPULAR && t !== DARK_MATTER);

type State = "popular" | "unpopular" | null;

/** The active trends as chips, or a note that none are picked. */
export function TrendChips({ trend }: { trend: Trend }) {
  const t = useT();
  if (trend.popular.length === 0 && trend.unpopular.length === 0) return <span className="hint">{t("trend.nonePicked")}</span>;
  return (
    <>
      {trend.popular.map((tag) => (
        <span key={tag} className="trend-chip trend-popular">
          {t("trend.popular", { tag })}
        </span>
      ))}
      {trend.unpopular.map((tag) => (
        <span key={tag} className="trend-chip trend-unpopular">
          {t("trend.unpopular", { tag })}
        </span>
      ))}
    </>
  );
}

/** Pick which food tags the newspaper currently marks as popular or unpopular. Several can be active. */
export function TrendPicker({ trend, onChange }: { trend: Trend; onChange: (t: Trend) => void }) {
  const t = useT();
  const stateOf = (tag: string): State =>
    trend.popular.includes(tag) ? "popular" : trend.unpopular.includes(tag) ? "unpopular" : null;

  // Click cycles: none -> popular -> unpopular -> none.
  const cycle = (tag: string) => {
    const popular = trend.popular.filter((x) => x !== tag);
    const unpopular = trend.unpopular.filter((x) => x !== tag);
    const current = stateOf(tag);
    if (current === null) popular.push(tag);
    else if (current === "popular") unpopular.push(tag);
    onChange({ popular, unpopular });
  };

  const empty = trend.popular.length === 0 && trend.unpopular.length === 0;

  return (
    <div className="trend-picker">
      <div className="trend-summary">
        <span className="request-label">{t("trend.now")}</span>
        <TrendChips trend={trend} />
        {!empty && (
          <button className="link-btn" onClick={() => onChange({ popular: [], unpopular: [] })}>
            {t("trend.clear")}
          </button>
        )}
      </div>
      <div className="trend-grid-wrap">
        <p className="hint">{t("trend.hint")}</p>
        <div className="trend-grid">
          {TREND_TAGS.map((tag) => {
            const s = stateOf(tag);
            return (
              <button
                key={tag}
                className={`trend-chip trend-option ${s ? `trend-${s}` : ""}`}
                aria-label={`${tag}: ${t(s === "popular" ? "trend.state.popular" : s === "unpopular" ? "trend.state.unpopular" : "trend.state.none")}`}
                onClick={() => cycle(tag)}
              >
                {s === "popular" && "▲ "}
                {s === "unpopular" && "▼ "}
                {tag}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
