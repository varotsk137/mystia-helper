import { gameData } from "../data";
import { ItemImage } from "./ItemImage";

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
  const toggle = (name: string) => onChange(value.includes(name) ? value.filter((c) => c !== name) : [...value, name]);
  return (
    <div className="cookware-picker" role="group" aria-label="อุปกรณ์คืนนี้">
      <span className="request-label">อุปกรณ์คืนนี้</span>
      {gameData.cookware.map((c) => (
        <button key={c.name} className="cookware-chip" aria-pressed={value.includes(c.name)} onClick={() => toggle(c.name)}>
          <ItemImage src={c.image} name={c.name} size={22} />
          {c.name}
        </button>
      ))}
      <span className="hint">
        {value.length === 0 ? "ยังไม่ได้เลือกอุปกรณ์ เลือกอย่างน้อย 1 อย่าง" : `ทำได้ ${recipeCount} สูตร`}
      </span>
    </div>
  );
}
