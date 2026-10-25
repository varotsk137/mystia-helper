import { useMemo, useState } from "react";
import type { Dlc } from "../data";
import { useGameData, useStore, type ProgressKind } from "../store";
import { ItemImage } from "../components/ItemImage";
import { dlcLabel, useT, type MessageKey } from "../i18n";

interface ProgressItem {
  name: string;
  dlc: Dlc;
  level: number | null;
  image: string | null;
  detail: string;
  collab: string | null;
}

const TABS: { kind: ProgressKind; label: MessageKey }[] = [
  { kind: "recipes", label: "progress.tab.recipes" },
  { kind: "beverages", label: "progress.tab.beverages" },
  { kind: "ingredients", label: "progress.tab.ingredients" },
  { kind: "locations", label: "progress.tab.locations" },
];

export function ProgressPage() {
  const t = useT();
  const data = useGameData();
  const { state, setProgressEnabled, setUnlocked } = useStore();
  const [kind, setKind] = useState<ProgressKind>("recipes");
  const [query, setQuery] = useState("");
  const [dlc, setDlc] = useState<Dlc | "">("");
  const [maxLevel, setMaxLevel] = useState<number | "">("");

  const itemsByKind = useMemo<Record<ProgressKind, ProgressItem[]>>(
    () => ({
      recipes: data.recipes
        .filter((r) => r.name !== "Dark Matter")
        .map((r) => ({ name: r.name, dlc: r.dlc, level: r.level, image: r.image, detail: r.cookware, collab: r.collab })),
      beverages: data.beverages.map((b) => ({ name: b.name, dlc: b.dlc, level: b.level, image: b.image, detail: b.alcohol ?? "", collab: b.collab })),
      ingredients: data.ingredients.map((i) => ({ name: i.name, dlc: i.dlc, level: i.level, image: i.image, detail: i.category, collab: null })),
      locations: data.locations.map((l) => ({
        name: l.name,
        dlc: l.dlc,
        level: null,
        image: null,
        detail: l.rareCustomers.join(", "),
        collab: null,
      })),
    }),
    [data],
  );

  // Items from DLCs the player doesn't own, or from disabled collaborations, aren't listed.
  const owned = (i: ProgressItem) => state.ownedDlcs.includes(i.dlc) && (i.collab === null || state.collabs.includes(i.collab));
  const all = itemsByKind[kind].filter(owned);
  const shown = all.filter(
    (i) =>
      (!query || i.name.toLowerCase().includes(query.toLowerCase())) &&
      (!dlc || i.dlc === dlc) &&
      (maxLevel === "" || i.level === null || i.level <= maxLevel),
  );
  const unlocked = new Set(state.progress.unlocked[kind]);
  const unlockedCount = all.filter((i) => unlocked.has(i.name)).length;
  const levels = [...new Set(all.map((i) => i.level).filter((l): l is number => l !== null))].sort((a, b) => a - b);

  return (
    <div className="page">
      <header className="page-head">
        <h1>{t("progress.title")}</h1>
        <label className="switch">
          <input type="checkbox" checked={state.progress.enabled} onChange={(e) => setProgressEnabled(e.target.checked)} />
          <span>{t("progress.use")}</span>
        </label>
        <p className="hint">
          {state.progress.enabled ? t("progress.onHint") : t("progress.offHint")}
        </p>
      </header>

      <div className="tabs" role="tablist">
        {TABS.map((tab) => {
          const total = itemsByKind[tab.kind].filter(owned);
          const done = total.filter((i) => state.progress.unlocked[tab.kind].includes(i.name)).length;
          return (
            <button key={tab.kind} role="tab" aria-selected={kind === tab.kind} className="tab" onClick={() => setKind(tab.kind)}>
              {t(tab.label)}
              <span className="tab-count">
                {done}/{total.length}
              </span>
            </button>
          );
        })}
      </div>

      <div className="toolbar">
        <input className="search" placeholder={t("db.search")} value={query} onChange={(e) => setQuery(e.target.value)} />
        <select value={dlc} onChange={(e) => setDlc(e.target.value as Dlc | "")}>
          <option value="">{t("progress.allDlc")}</option>
          {state.ownedDlcs.map((d) => (
            <option key={d} value={d}>
              {dlcLabel(d, t)}
            </option>
          ))}
        </select>
        {levels.length > 0 && (
          <select value={maxLevel} onChange={(e) => setMaxLevel(e.target.value === "" ? "" : Number(e.target.value))}>
            <option value="">{t("progress.allLevels")}</option>
            {levels.map((l) => (
              <option key={l} value={l}>
                {t("progress.maxLevel", { n: l })}
              </option>
            ))}
          </select>
        )}
        <span className="toolbar-spacer" />
        <button className="btn" onClick={() => setUnlocked(kind, shown.map((i) => i.name), true)}>
          {t("progress.unlockShown", { n: shown.length })}
        </button>
        <button className="btn btn-quiet" onClick={() => setUnlocked(kind, shown.map((i) => i.name), false)}>
          {t("progress.lockShown")}
        </button>
      </div>

      <p className="hint">
        {t("progress.summary", { n: unlockedCount, total: all.length })}
      </p>

      <ul className={`unlock-grid ${kind === "locations" ? "unlock-grid-wide" : ""}`}>
        {shown.map((item) => {
          const isOn = unlocked.has(item.name);
          return (
            <li key={item.name}>
              <button
                className={`unlock-tile ${isOn ? "is-on" : ""}`}
                aria-pressed={isOn}
                onClick={() => setUnlocked(kind, [item.name], !isOn)}
              >
                {kind !== "locations" && <ItemImage src={item.image} name={item.name} size={44} />}
                <span className="unlock-text">
                  <span className="unlock-name">{item.name}</span>
                  <span className="unlock-detail">
                    {item.level !== null && `Lv ${item.level} `}
                    {item.detail}
                  </span>
                </span>
                <span className="unlock-check" aria-hidden>
                  {isOn ? "✓" : ""}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {shown.length === 0 && <p className="hint">{t("progress.empty")}</p>}
    </div>
  );
}
