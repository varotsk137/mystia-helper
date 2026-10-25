import { useId, useState } from "react";
import { useT } from "../i18n";

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
  const t = useT();
  const [draft, setDraft] = useState("");
  const listId = useId();
  const add = () => {
    const tag = draft.trim();
    if (!tag || (!allowDuplicates && value.includes(tag))) return;
    onChange([...value, tag]);
    setDraft("");
  };
  return (
    <div className="tag-editor">
      {value.map((tag, i) => (
        <span key={`${tag}-${i}`} className={`tag tag-${tone} tag-editable`}>
          {tag}
          <button aria-label={t("tagEditor.remove", { tag })} onClick={() => onChange(value.filter((_, j) => j !== i))}>
            ×
          </button>
        </span>
      ))}
      <input
        className="tag-input"
        list={listId}
        value={draft}
        placeholder={t("tagEditor.add")}
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
