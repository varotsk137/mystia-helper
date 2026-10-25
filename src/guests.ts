// Rare guests currently in the izakaya, each with their own order. Several can be seated at once.

export interface GuestOrder {
  /** Rare customer name. */
  name: string;
  food: string | null;
  drink: string | null;
}

export interface Guests {
  list: GuestOrder[];
  /** Name of the guest shown on the page, or null when nobody is seated. */
  active: string | null;
}

export const NO_GUESTS: Guests = { list: [], active: null };

/** Seats a guest (or switches to them if already seated) and makes them active. */
export function addGuest(g: Guests, name: string, food?: string | null): Guests {
  const existing = g.list.find((x) => x.name === name);
  const list = existing
    ? food === undefined
      ? g.list
      : g.list.map((x) => (x.name === name ? { ...x, food } : x))
    : [...g.list, { name, food: food ?? null, drink: null }];
  return { list, active: name };
}

/** Removes a guest who left. If they were active, the next guest (or the previous one) becomes active. */
export function removeGuest(g: Guests, name: string): Guests {
  const i = g.list.findIndex((x) => x.name === name);
  if (i < 0) return g;
  const list = g.list.filter((x) => x.name !== name);
  if (g.active !== name) return { list, active: g.active };
  return { list, active: (list[i] ?? list[i - 1])?.name ?? null };
}

export function setActiveGuest(g: Guests, name: string): Guests {
  return g.list.some((x) => x.name === name) ? { ...g, active: name } : g;
}

export function setGuestOrder(g: Guests, name: string, patch: Partial<Pick<GuestOrder, "food" | "drink">>): Guests {
  return { ...g, list: g.list.map((x) => (x.name === name ? { ...x, ...patch } : x)) };
}

/** Repairs a saved value: drops malformed entries and duplicates, and fixes a dangling active name. */
export function normalizeGuests(raw: unknown): Guests {
  const r = (raw ?? {}) as Partial<Guests>;
  const list: GuestOrder[] = [];
  for (const x of Array.isArray(r.list) ? r.list : []) {
    if (!x || typeof x.name !== "string" || list.some((y) => y.name === x.name)) continue;
    list.push({
      name: x.name,
      food: typeof x.food === "string" ? x.food : null,
      drink: typeof x.drink === "string" ? x.drink : null,
    });
  }
  const active = list.some((x) => x.name === r.active) ? (r.active as string) : (list[0]?.name ?? null);
  return { list, active };
}
