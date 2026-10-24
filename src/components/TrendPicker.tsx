import { useState } from "react";
import { gameData } from "../data";
import { DARK_MATTER, TREND_POPULAR, TREND_UNPOPULAR, type Trend } from "../solver/tags";

const TREND_TAGS = gameData.tags.food.filter((t) => t !== TREND_POPULAR && t !== TREND_UNPOPULAR && t !== DARK_MATTER);

type State = "popular" | "unpopular" | null;

/** Pick which food tags the newspaper currently marks as popular or unpopular. Several can be active. */
export function TrendPicker({ trend, onChange, customerNote }: { trend: Trend; onChange: (t: Trend) => void; customerNote: string | null }) {
  const [open, setOpen] = useState(false);
  const stateOf = (tag: string): State =>
    trend.popular.includes(tag) ? "popular" : trend.unpopular.includes(tag) ? "unpopular" : null;

  // Click cycles: none -> popular -> unpopular -> none.
  const cycle = (tag: string) => {
    const popular = trend.popular.filter((t) => t !== tag);
    const unpopular = trend.unpopular.filter((t) => t !== tag);
    const current = stateOf(tag);
    if (current === null) popular.push(tag);
    else if (current === "popular") unpopular.push(tag);
    onChange({ popular, unpopular });
  };

  const empty = trend.popular.length === 0 && trend.unpopular.length === 0;

  return (
    <div className="trend-picker">
      <div className="trend-summary">
        <span className="request-label">Trend ตอนนี้</span>
        {empty && <span className="hint">ยังไม่ได้เลือก</span>}
        {trend.popular.map((t) => (
          <span key={t} className="trend-chip trend-popular">
            ฮิต: {t}
          </span>
        ))}
        {trend.unpopular.map((t) => (
          <span key={t} className="trend-chip trend-unpopular">
            ไม่ฮิต: {t}
          </span>
        ))}
        <button className="link-btn" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? "เสร็จ" : "เลือก Trend"}
        </button>
        {!empty && (
          <button className="link-btn" onClick={() => onChange({ popular: [], unpopular: [] })}>
            ล้าง
          </button>
        )}
      </div>
      {customerNote && <p className="hint trend-note">{customerNote}</p>}
      {open && (
        <div className="trend-grid-wrap">
          <p className="hint">ดู Trend จากหนังสือพิมพ์ในเกม แล้วคลิก tag: 1 ครั้ง = ฮิต, 2 ครั้ง = ไม่ฮิต, 3 ครั้ง = ยกเลิก</p>
          <div className="trend-grid">
            {TREND_TAGS.map((t) => {
              const s = stateOf(t);
              return (
                <button
                  key={t}
                  className={`trend-chip trend-option ${s ? `trend-${s}` : ""}`}
                  aria-label={`${t}: ${s === "popular" ? "ฮิต" : s === "unpopular" ? "ไม่ฮิต" : "ไม่มี Trend"}`}
                  onClick={() => cycle(t)}
                >
                  {s === "popular" && "▲ "}
                  {s === "unpopular" && "▼ "}
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
