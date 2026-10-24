import { useId, useState } from "react";

/** Editable list of tags (or names): remove with ×, add by typing or picking from suggestions. */
export function TagListEditor({
  value,
  onChange,
  suggestions,
  allowDuplicates = false,
  tone = "neutral",
}: {
  value: string[];
  onChange: (next: string[]) => void;
  suggestions: string[];
  allowDuplicates?: boolean;
  tone?: "neutral" | "liked" | "disliked";
}) {
  const [draft, setDraft] = useState("");
  const listId = useId();
  const add = () => {
    const t = draft.trim();
    if (!t || (!allowDuplicates && value.includes(t))) return;
    onChange([...value, t]);
    setDraft("");
  };
  return (
    <div className="tag-editor">
      {value.map((t, i) => (
        <span key={`${t}-${i}`} className={`tag tag-${tone} tag-editable`}>
          {t}
          <button aria-label={`ลบ ${t}`} onClick={() => onChange(value.filter((_, j) => j !== i))}>
            ×
          </button>
        </span>
      ))}
      <input
        className="tag-input"
        list={listId}
        value={draft}
        placeholder="+ เพิ่ม"
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") add();
        }}
        onBlur={add}
      />
      <datalist id={listId}>
        {suggestions
          .filter((s) => allowDuplicates || !value.includes(s))
          .map((s) => (
            <option key={s} value={s} />
          ))}
      </datalist>
    </div>
  );
}
