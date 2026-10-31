// Sets the player pins for tonight; shown in the right-hand panel until the night is cleared.

export interface PinnedSet {
  /** The guest the set is for. */
  guest: string;
  recipe: string;
  extras: string[];
  beverage: string;
}

export interface Pins {
  sets: PinnedSet[];
}

export const NO_PINS: Pins = { sets: [] };

const sameSet = (a: PinnedSet, b: PinnedSet) =>
  a.guest === b.guest && a.recipe === b.recipe && a.beverage === b.beverage && a.extras.join("|") === b.extras.join("|");

export function isSetPinned(pins: Pins, set: PinnedSet): boolean {
  return pins.sets.some((s) => sameSet(s, set));
}

/** Pins the set, or unpins it if it already is. */
export function togglePinnedSet(pins: Pins, set: PinnedSet): Pins {
  return isSetPinned(pins, set)
    ? { sets: pins.sets.filter((s) => !sameSet(s, set)) }
    : { sets: [...pins.sets, { ...set, extras: [...set.extras] }] };
}

/** Drops a guest's pinned sets, for when they leave. */
export function removeGuestPins(pins: Pins, guest: string): Pins {
  return { sets: pins.sets.filter((s) => s.guest !== guest) };
}

/** Guests that have pinned sets, in the order their first set was pinned. */
export function pinnedGuestNames(pins: Pins): string[] {
  return [...new Set(pins.sets.map((s) => s.guest))];
}

/** Repairs a saved value, dropping malformed entries. */
export function normalizePins(raw: unknown): Pins {
  const r = (raw ?? {}) as Partial<Pins>;
  const sets: PinnedSet[] = [];
  for (const s of Array.isArray(r.sets) ? r.sets : []) {
    if (!s || typeof s.guest !== "string" || typeof s.recipe !== "string" || typeof s.beverage !== "string") continue;
    const extras = Array.isArray(s.extras) ? s.extras.filter((e): e is string => typeof e === "string") : [];
    const set = { guest: s.guest, recipe: s.recipe, extras, beverage: s.beverage };
    if (!sets.some((x) => sameSet(x, set))) sets.push(set);
  }
  return { sets };
}
