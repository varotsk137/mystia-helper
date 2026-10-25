import { useMemo, useState } from "react";
import { gameData, type Dlc } from "../data";
import { useGameData, useStore, type EditableKind } from "../store";
import { ItemImage } from "../components/ItemImage";
import { TagListEditor } from "../components/TagListEditor";
import { dlcLabel, useT, type MessageKey } from "../i18n";

type FieldType = "number" | "foodTags" | "drinkTags" | "ingredients" | "cookware" | "alcohol" | "budget";
interface Field {
  /** Also names the label: "field.<key>". */
  key: string;
  type: FieldType;
  tone?: "liked" | "disliked";
}

const FIELDS: Record<EditableKind, Field[]> = {
  recipes: [
    { key: "price", type: "number" },
    { key: "level", type: "number" },
    { key: "cookTime", type: "number" },
    { key: "cookware", type: "cookware" },
    { key: "ingredients", type: "ingredients" },
    { key: "tags", type: "foodTags" },
    { key: "bannedTags", type: "foodTags", tone: "disliked" },
  ],
  ingredients: [
    { key: "price", type: "number" },
    { key: "level", type: "number" },
    { key: "tags", type: "foodTags" },
  ],
  beverages: [
    { key: "price", type: "number" },
    { key: "level", type: "number" },
    { key: "alcohol", type: "alcohol" },
    { key: "tags", type: "drinkTags" },
  ],
  rareCustomers: [
    { key: "budget", type: "budget" },
    { key: "likedFoodTags", type: "foodTags", tone: "liked" },
    { key: "dislikedFoodTags", type: "foodTags", tone: "disliked" },
    { key: "likedDrinkTags", type: "drinkTags", tone: "liked" },
  ],
};

const TABS: EditableKind[] = ["recipes", "beverages", "ingredients", "rareCustomers"];

const COOKWARE = ["Boiling Pot", "Cutting Board", "Frying Pan", "Grill", "Steamer"];
const ALCOHOL = ["No Alcohol", "Low Alcohol", "Mid Alcohol", "High Alcohol"];

type AnyItem = { name: string; image: string | null; dlc: Dlc | null; [key: string]: unknown };

export function DatabasePage() {
  const t = useT();
  const data = useGameData();
  const { state, setOverride } = useStore();
  const [kind, setKind] = useState<EditableKind>("recipes");
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const items = data[kind] as unknown as AnyItem[];
  const original = gameData[kind] as unknown as AnyItem[];
  const overrides = state.overrides[kind] as Record<string, Record<string, unknown>>;

  const tagsOf = (item: AnyItem): string[] =>
    kind === "rareCustomers"
      ? [...(item.likedFoodTags as string[]), ...(item.likedDrinkTags as string[])]
      : (item.tags as string[]);
  const allTags = useMemo(() => [...new Set(items.flatMap(tagsOf))].sort(), [items, kind]);

  const shown = items.filter(
    (i) =>
      (i.dlc === null || state.ownedDlcs.includes(i.dlc)) &&
      i.name !== "Dark Matter" &&
      (!query || i.name.toLowerCase().includes(query.toLowerCase())) &&
      (!tag || tagsOf(i).includes(tag)),
  );
  const current = items.find((i) => i.name === selected) ?? null;

  /** Stores only the fields that differ from the wiki value. */
  const updateField = (key: string, value: unknown) => {
    if (!current) return;
    const base = original.find((i) => i.name === current.name)!;
    const patch: Record<string, unknown> = { ...overrides[current.name], [key]: value };
    // A beverage's alcohol level is also one of its tags; keep them in sync.
    if (kind === "beverages" && key === "alcohol") {
      const tags = (current.tags as string[]).filter((x) => !ALCOHOL.includes(x));
      patch.tags = [value as string, ...tags];
    }
    for (const k of Object.keys(patch)) if (JSON.stringify(patch[k]) === JSON.stringify(base[k])) delete patch[k];
    setOverride(kind, current.name, patch);
  };

  return (
    <div className="page">
      <header className="page-head">
        <h1>{t("db.title")}</h1>
        <p className="hint">{t("db.hint")}</p>
      </header>

      <div className="tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={kind === tab}
            className="tab"
            onClick={() => {
              setKind(tab);
              setSelected(null);
              setTag("");
            }}
          >
            {t(`db.tab.${tab}`)}
            {Object.keys(state.overrides[tab]).length > 0 && (
              <span className="tab-count">{t("db.editedCount", { n: Object.keys(state.overrides[tab]).length })}</span>
            )}
          </button>
        ))}
      </div>

      <div className="toolbar">
        <input className="search" placeholder={t("db.search")} value={query} onChange={(e) => setQuery(e.target.value)} />
        <select value={tag} onChange={(e) => setTag(e.target.value)}>
          <option value="">{t("db.allTags")}</option>
          {allTags.map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>
        <span className="hint">{t("db.count", { n: shown.length })}</span>
      </div>

      <div className="db-layout">
        <ul className="db-list">
          {shown.map((item) => (
            <li key={item.name}>
              <button
                className={`db-row ${item.name === selected ? "is-selected" : ""}`}
                onClick={() => setSelected(item.name)}
              >
                <ItemImage
                  src={item.image}
                  name={item.name}
                  size={kind === "rareCustomers" ? 34 : 40}
                  variant={kind === "rareCustomers" ? "portrait" : "icon"}
                />
                <span className="db-row-text">
                  <span className="db-row-name">
                    {item.name}
                    {overrides[item.name] && <span className="edited-dot" title={t("db.edited")} />}
                  </span>
                  <span className="db-row-tags">{tagsOf(item).join(", ")}</span>
                </span>
                <span className="db-row-meta">
                  {kind === "rareCustomers"
                    ? (item.budget as { min: number; max: number } | null)
                      ? `${(item.budget as { min: number }).min}–${(item.budget as { max: number }).max}`
                      : "?"
                    : `${item.price}`}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {current ? (
          <section className="panel db-editor" aria-label={t("db.editing", { name: current.name })}>
            <div className="db-editor-head">
              <ItemImage
                src={current.image}
                name={current.name}
                size={kind === "rareCustomers" ? 72 : 64}
                variant={kind === "rareCustomers" ? "portrait" : "icon"}
              />
              <div>
                <h2>{current.name}</h2>
                <p className="hint">{current.dlc ? dlcLabel(current.dlc, t) : t("db.special")}</p>
              </div>
            </div>
            {FIELDS[kind].map((f) => (
              <FieldEditor
                key={f.key}
                field={f}
                value={current[f.key]}
                edited={overrides[current.name]?.[f.key] !== undefined}
                onChange={(v) => updateField(f.key, v)}
                ingredientNames={data.ingredients.map((i) => i.name)}
              />
            ))}
            {overrides[current.name] && (
              <button className="btn btn-quiet" onClick={() => setOverride(kind, current.name, null)}>
                {t("db.reset")}
              </button>
            )}
          </section>
        ) : (
          <section className="panel db-editor db-empty">
            <p className="hint">{t("db.pick")}</p>
          </section>
        )}
      </div>
    </div>
  );
}

function FieldEditor({
  field,
  value,
  edited,
  onChange,
  ingredientNames,
}: {
  field: Field;
  value: unknown;
  edited: boolean;
  onChange: (v: unknown) => void;
  ingredientNames: string[];
}) {
  const t = useT();
  let input;
  switch (field.type) {
    case "number":
      input = (
        <input
          type="number"
          className="num-input"
          value={value as number}
          onChange={(e) => e.target.value !== "" && onChange(Number(e.target.value))}
        />
      );
      break;
    case "foodTags":
    case "drinkTags":
      input = (
        <TagListEditor
          value={value as string[]}
          onChange={onChange}
          suggestions={field.type === "foodTags" ? gameData.tags.food : gameData.tags.drink}
          tone={field.tone}
        />
      );
      break;
    case "ingredients":
      input = <TagListEditor value={value as string[]} onChange={onChange} suggestions={ingredientNames} allowDuplicates />;
      break;
    case "cookware":
    case "alcohol":
      input = (
        <select value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}>
          {(field.type === "cookware" ? COOKWARE : ALCOHOL).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
      break;
    case "budget": {
      const b = (value as { min: number; max: number } | null) ?? { min: 0, max: 0 };
      input = (
        <span className="budget-input">
          <input type="number" className="num-input" value={b.min} onChange={(e) => onChange({ ...b, min: Number(e.target.value) })} />
          <span>{t("db.to")}</span>
          <input type="number" className="num-input" value={b.max} onChange={(e) => onChange({ ...b, max: Number(e.target.value) })} />
        </span>
      );
      break;
    }
  }
  return (
    <div className="field-row">
      <span className="field-label">
        {t(`field.${field.key}` as MessageKey)}
        {edited && <span className="edited-dot" title={t("db.edited")} />}
      </span>
      {input}
    </div>
  );
}
