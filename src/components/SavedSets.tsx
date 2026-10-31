import { useEffect, useState } from "react";
import { Rating, type Suggestion } from "../solver/rare";
import { SAVED_SET_ICON, SAVED_SET_KINDS, type SavedSet, type SavedSetKind } from "../savedSets";
import { useT } from "../i18n";
import { SetSummary } from "./SetSummary";

const RATING_CLASS: Record<Rating, "pink" | "orange" | "green" | "purple" | "black"> = {
  [Rating.Pink]: "pink",
  [Rating.Orange]: "orange",
  [Rating.Green]: "green",
  [Rating.Purple]: "purple",
  [Rating.Black]: "black",
};

/** Name and kind for a set being saved as a preset. Enter saves, Escape cancels. */
export function SaveSetForm({
  defaultName,
  defaultKind = "custom",
  onSave,
  onCancel,
}: {
  defaultName: string;
  defaultKind?: SavedSetKind;
  onSave: (name: string, kind: SavedSetKind) => void;
  onCancel: () => void;
}) {
  const t = useT();
  const [name, setName] = useState(defaultName);
  const [kind, setKind] = useState<SavedSetKind>(defaultKind);
  const submit = () => {
    const trimmed = name.trim();
    if (trimmed) onSave(trimmed, kind);
  };
  return (
    <div className="save-set-form" role="group" aria-label={t("saved.saveTitle")}>
      <input
        className="search"
        value={name}
        maxLength={40}
        aria-label={t("saved.name")}
        placeholder={t("saved.name")}
        autoFocus
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          if (e.key === "Escape") onCancel();
        }}
      />
      <span className="save-set-kinds" role="radiogroup" aria-label={t("saved.kind")}>
        {SAVED_SET_KINDS.map((k) => (
          <button key={k} role="radio" aria-checked={kind === k} className="kind-chip" onClick={() => setKind(k)}>
            {SAVED_SET_ICON[k]} {t(`saved.kind.${k}`)}
          </button>
        ))}
      </span>
      <button className="btn btn-small" disabled={!name.trim()} onClick={submit}>
        {t("saved.save")}
      </button>
      <button className="btn btn-small btn-quiet" onClick={onCancel}>
        {t("saved.cancel")}
      </button>
    </div>
  );
}

export interface SavedSetView {
  saved: SavedSet;
  /** The set rated against the guest's current order (null when its recipe or drink no longer exists). */
  result: Suggestion | null;
  pinned: boolean;
}

/** A guest's presets, shown when the guest is picked; each can be pinned for tonight or opened in the builder. */
export function SavedSetList({
  guest,
  views,
  onTogglePin,
  onOpen,
  onDelete,
}: {
  guest: string;
  views: SavedSetView[];
  onTogglePin: (saved: SavedSet) => void;
  onOpen: (saved: SavedSet) => void;
  onDelete: (saved: SavedSet) => void;
}) {
  const t = useT();
  if (views.length === 0) return <p className="hint saved-empty">{t("saved.empty", { name: guest })}</p>;
  return (
    <section className="saved-sets" aria-label={t("saved.title", { name: guest })}>
      <h3>{t("saved.title", { name: guest })}</h3>
      <ul className="saved-list">
        {views.map((view) => (
          <SavedSetItem key={view.saved.id} view={view} onTogglePin={onTogglePin} onOpen={onOpen} onDelete={onDelete} />
        ))}
      </ul>
    </section>
  );
}

function SavedSetItem({
  view: { saved, result, pinned },
  onTogglePin,
  onOpen,
  onDelete,
}: {
  view: SavedSetView;
  onTogglePin: (saved: SavedSet) => void;
  onOpen: (saved: SavedSet) => void;
  onDelete: (saved: SavedSet) => void;
}) {
  const t = useT();
  // Deleting needs a second click; the confirm state lapses after a few seconds.
  const [confirming, setConfirming] = useState(false);
  useEffect(() => {
    if (!confirming) return;
    const id = setTimeout(() => setConfirming(false), 4000);
    return () => clearTimeout(id);
  }, [confirming]);
  return (
    <li className={`saved-set saved-${saved.kind}`}>
      <div className="saved-set-head">
        <span className="saved-kind" title={t(`saved.kind.${saved.kind}`)}>
          {SAVED_SET_ICON[saved.kind]}
        </span>
        <strong className="saved-name">{saved.name}</strong>
        {result && (
          <span className={`rating-dot rating-${RATING_CLASS[result.rating]}`} title={t(`rating.${RATING_CLASS[result.rating]}`)} />
        )}
        {result && <span className="saved-price">{result.totalPrice}</span>}
      </div>
      <button className="saved-set-body" onClick={() => onOpen(saved)} title={t("saved.open")}>
        <SetSummary recipe={saved.recipe} extras={saved.extras} beverage={saved.beverage} />
      </button>
      <div className="saved-set-actions">
        <button className={`btn btn-small pin-btn ${pinned ? "is-pinned" : ""}`} aria-pressed={pinned} onClick={() => onTogglePin(saved)}>
          📌 {pinned ? t("pins.unpin") : t("pins.pin")}
        </button>
        <button
          className={`btn btn-small btn-quiet saved-delete ${confirming ? "is-confirming" : ""}`}
          onClick={() => {
            if (!confirming) return setConfirming(true);
            setConfirming(false);
            onDelete(saved);
          }}
        >
          {confirming ? t("saved.confirmDelete") : t("saved.delete")}
        </button>
      </div>
    </li>
  );
}
