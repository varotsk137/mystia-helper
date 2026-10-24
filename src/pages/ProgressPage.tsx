import { useMemo, useState } from "react";
import { DLC_LABELS, type Dlc } from "../data";
import { useGameData, useStore, type ProgressKind } from "../store";
import { ItemImage } from "../components/ItemImage";

interface ProgressItem {
  name: string;
  dlc: Dlc;
  level: number | null;
  image: string | null;
  detail: string;
}

const TABS: { kind: ProgressKind; label: string }[] = [
  { kind: "recipes", label: "สูตรอาหาร" },
  { kind: "beverages", label: "เครื่องดื่ม" },
  { kind: "ingredients", label: "วัตถุดิบ" },
  { kind: "locations", label: "โซน" },
];

export function ProgressPage() {
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
        .map((r) => ({ name: r.name, dlc: r.dlc, level: r.level, image: r.image, detail: r.cookware })),
      beverages: data.beverages.map((b) => ({ name: b.name, dlc: b.dlc, level: b.level, image: b.image, detail: b.alcohol ?? "" })),
      ingredients: data.ingredients.map((i) => ({ name: i.name, dlc: i.dlc, level: i.level, image: i.image, detail: i.category })),
      locations: data.locations.map((l) => ({
        name: l.name,
        dlc: l.dlc,
        level: null,
        image: null,
        detail: l.rareCustomers.join(", "),
      })),
    }),
    [data],
  );

  const owned = (d: Dlc) => state.ownedDlcs.includes(d);
  const all = itemsByKind[kind].filter((i) => owned(i.dlc));
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
        <h1>ความคืบหน้า</h1>
        <label className="switch">
          <input type="checkbox" checked={state.progress.enabled} onChange={(e) => setProgressEnabled(e.target.checked)} />
          <span>ใช้ความคืบหน้าในการคำนวณ</span>
        </label>
        <p className="hint">
          {state.progress.enabled
            ? "ตัวช่วยจะแนะนำเฉพาะสูตร เครื่องดื่ม และวัตถุดิบที่ปลดล็อกแล้ว และแสดงเฉพาะลูกค้าในโซนที่เปิดแล้ว"
            : "ตอนนี้ตัวช่วยใช้ทุกอย่างจาก DLC ที่มี เปิดสวิตช์นี้เมื่อต้องการให้คำนวณตามสิ่งที่ปลดล็อกในเกมแล้วเท่านั้น"}
        </p>
      </header>

      <div className="tabs" role="tablist">
        {TABS.map((t) => {
          const total = itemsByKind[t.kind].filter((i) => owned(i.dlc));
          const done = total.filter((i) => state.progress.unlocked[t.kind].includes(i.name)).length;
          return (
            <button key={t.kind} role="tab" aria-selected={kind === t.kind} className="tab" onClick={() => setKind(t.kind)}>
              {t.label}
              <span className="tab-count">
                {done}/{total.length}
              </span>
            </button>
          );
        })}
      </div>

      <div className="toolbar">
        <input className="search" placeholder="ค้นหาชื่อ" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select value={dlc} onChange={(e) => setDlc(e.target.value as Dlc | "")}>
          <option value="">ทุก DLC</option>
          {state.ownedDlcs.map((d) => (
            <option key={d} value={d}>
              {DLC_LABELS[d]}
            </option>
          ))}
        </select>
        {levels.length > 0 && (
          <select value={maxLevel} onChange={(e) => setMaxLevel(e.target.value === "" ? "" : Number(e.target.value))}>
            <option value="">ทุกเลเวล</option>
            {levels.map((l) => (
              <option key={l} value={l}>
                ไม่เกิน Lv {l}
              </option>
            ))}
          </select>
        )}
        <span className="toolbar-spacer" />
        <button className="btn" onClick={() => setUnlocked(kind, shown.map((i) => i.name), true)}>
          ปลดล็อกที่แสดงอยู่ ({shown.length})
        </button>
        <button className="btn btn-quiet" onClick={() => setUnlocked(kind, shown.map((i) => i.name), false)}>
          ล็อกที่แสดงอยู่
        </button>
      </div>

      <p className="hint">
        ปลดล็อกแล้ว {unlockedCount} จาก {all.length} คลิกที่รายการเพื่อสลับสถานะ
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
      {shown.length === 0 && <p className="hint">ไม่มีรายการที่ตรงกับตัวกรอง ลองล้างคำค้นหาหรือเปลี่ยน DLC</p>}
    </div>
  );
}
