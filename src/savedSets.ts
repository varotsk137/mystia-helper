// Sets the player saves for a guest to reuse on later nights ("presets" in the UI). Each has a name and a
// kind, shown as an icon. Unlike pins they survive clearing the night.

export type SavedSetKind = "economy" | "expensive" | "custom";
export const SAVED_SET_KINDS: SavedSetKind[] = ["economy", "expensive", "custom"];
export const SAVED_SET_ICON: Record<SavedSetKind, string> = { economy: "🪙", expensive: "💰", custom: "⭐" };

export interface SavedSet {
  id: string;
  /** The guest the set is for. */
  guest: string;
  name: string;
  kind: SavedSetKind;
  recipe: string;
  extras: string[];
  beverage: string;
}

export interface SavedSets {
  sets: SavedSet[];
}

export const NO_SAVED_SETS: SavedSets = { sets: [] };

type SetContent = Pick<SavedSet, "guest" | "recipe" | "extras" | "beverage">;

const sameContent = (a: SetContent, b: SetContent) =>
  a.guest === b.guest && a.recipe === b.recipe && a.beverage === b.beverage && a.extras.join("|") === b.extras.join("|");

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** The saved set with exactly this guest, dish, extras and drink, if any. */
export function findSavedSet(saved: SavedSets, set: SetContent): SavedSet | undefined {
  return saved.sets.find((s) => sameContent(s, set));
}

/** Saves a set; saving the same set again renames it and changes its kind instead of adding a copy. */
export function saveSet(saved: SavedSets, set: Omit<SavedSet, "id">, id: string = newId()): SavedSets {
  const existing = findSavedSet(saved, set);
  if (existing) {
    return { sets: saved.sets.map((s) => (s === existing ? { ...s, name: set.name, kind: set.kind } : s)) };
  }
  return { sets: [...saved.sets, { ...set, extras: [...set.extras], id }] };
}

export function removeSavedSet(saved: SavedSets, id: string): SavedSets {
  return { sets: saved.sets.filter((s) => s.id !== id) };
}

/** A guest's saved sets, in the order they were saved. */
export function savedSetsFor(saved: SavedSets, guest: string): SavedSet[] {
  return saved.sets.filter((s) => s.guest === guest);
}

/** Repairs a saved value, dropping malformed entries and duplicates. */
export function normalizeSavedSets(raw: unknown): SavedSets {
  const r = (raw ?? {}) as Partial<SavedSets>;
  const sets: SavedSet[] = [];
  for (const s of Array.isArray(r.sets) ? r.sets : []) {
    if (!s || typeof s.guest !== "string" || typeof s.recipe !== "string" || typeof s.beverage !== "string") continue;
    const extras = Array.isArray(s.extras) ? s.extras.filter((e): e is string => typeof e === "string") : [];
    const set: SavedSet = {
      id: typeof s.id === "string" && s.id && !sets.some((x) => x.id === s.id) ? s.id : newId(),
      guest: s.guest,
      name: typeof s.name === "string" && s.name.trim() ? s.name : s.recipe,
      kind: SAVED_SET_KINDS.includes(s.kind) ? s.kind : "custom",
      recipe: s.recipe,
      extras,
      beverage: s.beverage,
    };
    if (!findSavedSet({ sets }, set)) sets.push(set);
  }
  return { sets };
}
