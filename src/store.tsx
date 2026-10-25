// App state persisted in localStorage (kept by the Tauri webview between launches):
// owned DLCs, game progress (what the player has unlocked) and user edits layered over the wiki data.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { gameData, type Beverage, type Dlc, type GameData, type Ingredient, type RareCustomer, type Recipe } from "./data";
import { NO_TREND, type Trend } from "./solver/tags";
import { defaultLang, type Lang } from "./lang";
import { NO_GUESTS, normalizeGuests, type Guests } from "./guests";
import { DEFAULT_PRESET, PRESET_IDS, type Preset } from "./solver/rare";

/** Data kinds the player can edit. Keys match GameData. */
export type EditableKind = "recipes" | "ingredients" | "beverages" | "rareCustomers";
/** Data kinds the player unlocks over the course of the game. */
export type ProgressKind = "recipes" | "ingredients" | "beverages" | "locations";

type ItemOf<K extends EditableKind> = K extends "recipes"
  ? Recipe
  : K extends "ingredients"
    ? Ingredient
    : K extends "beverages"
      ? Beverage
      : RareCustomer;

export type Overrides = { [K in EditableKind]: Record<string, Partial<ItemOf<K>>> };

export interface Progress {
  /** When false, everything from owned DLCs counts as unlocked. */
  enabled: boolean;
  unlocked: Record<ProgressKind, string[]>;
}

export interface StoreState {
  ownedDlcs: Dlc[];
  progress: Progress;
  overrides: Overrides;
  /** Currently active newspaper trends. */
  trend: Trend;
  /** Cookware types available tonight; recipes needing anything else are skipped. */
  cookware: string[];
  /** Enabled collaboration ids; their guests, recipes and drinks are hidden otherwise. */
  collabs: string[];
  lang: Lang;
  /** Rare guests seated in the izakaya right now, with their orders. */
  guests: Guests;
  /** Weighting preset for the recommended order, and whether to list only pink-rated sets. */
  ranking: { preset: Preset; pinkOnly: boolean };
}

const STORAGE_KEY = "mystia-helper.settings";
const EMPTY_OVERRIDES: Overrides = { recipes: {}, ingredients: {}, beverages: {}, rareCustomers: {} };
const DEFAULTS: StoreState = {
  ownedDlcs: [...gameData.meta.dlcs],
  progress: { enabled: false, unlocked: { recipes: [], ingredients: [], beverages: [], locations: [] } },
  overrides: EMPTY_OVERRIDES,
  trend: NO_TREND,
  cookware: gameData.cookware.map((c) => c.name),
  collabs: gameData.collaborations.map((c) => c.id),
  lang: defaultLang(),
  guests: NO_GUESTS,
  ranking: { preset: DEFAULT_PRESET, pinkOnly: false },
};

/** Fills in fields missing from older or hand-edited saves. */
export function normalizeState(raw: unknown): StoreState {
  const s = (raw ?? {}) as Partial<StoreState>;
  return {
    ownedDlcs: Array.isArray(s.ownedDlcs) ? s.ownedDlcs : DEFAULTS.ownedDlcs,
    progress: {
      enabled: s.progress?.enabled ?? false,
      unlocked: { ...DEFAULTS.progress.unlocked, ...s.progress?.unlocked },
    },
    overrides: { ...EMPTY_OVERRIDES, ...s.overrides },
    trend: {
      popular: Array.isArray(s.trend?.popular) ? s.trend.popular : [],
      unpopular: Array.isArray(s.trend?.unpopular) ? s.trend.unpopular : [],
    },
    cookware: Array.isArray(s.cookware) ? s.cookware : DEFAULTS.cookware,
    collabs: Array.isArray(s.collabs) ? s.collabs : DEFAULTS.collabs,
    lang: s.lang === "th" || s.lang === "en" ? s.lang : DEFAULTS.lang,
    guests: normalizeGuests(s.guests),
    ranking: {
      // Saves from the goal version keep their choice: each goal became the preset of the same name.
      preset: [s.ranking?.preset, (s.ranking as { goal?: string } | undefined)?.goal].find((p): p is Preset =>
        PRESET_IDS.includes(p as Preset),
      ) ?? DEFAULT_PRESET,
      pinkOnly: s.ranking?.pinkOnly === true,
    },
  };
}

function load(): StoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    // Saves from before the language setting were made in the Thai-only UI, so they stay Thai.
    return raw ? normalizeState({ lang: "th", ...JSON.parse(raw) }) : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

interface StoreContextValue {
  state: StoreState;
  setOwnedDlcs: (dlcs: Dlc[]) => void;
  setProgressEnabled: (enabled: boolean) => void;
  /** Unlocks (or locks) every named item of a kind. */
  setUnlocked: (kind: ProgressKind, names: string[], unlocked: boolean) => void;
  /** Replaces the user's edit for one item; pass null to restore the wiki value. */
  setOverride: <K extends EditableKind>(kind: K, name: string, patch: Partial<ItemOf<K>> | null) => void;
  setTrend: (trend: Trend) => void;
  setCookware: (cookware: string[]) => void;
  setCollabs: (collabs: string[]) => void;
  setLang: (lang: Lang) => void;
  /** Applies one of the guest operations from guests.ts. */
  updateGuests: (fn: (g: Guests) => Guests) => void;
  setRanking: (patch: Partial<StoreState["ranking"]>) => void;
  replaceState: (next: StoreState) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(load);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable: changes last for this session only.
    }
  }, [state]);
  useEffect(() => {
    document.documentElement.lang = state.lang;
  }, [state.lang]);

  const setOwnedDlcs = useCallback((ownedDlcs: Dlc[]) => setState((s) => ({ ...s, ownedDlcs })), []);
  const setProgressEnabled = useCallback(
    (enabled: boolean) => setState((s) => ({ ...s, progress: { ...s.progress, enabled } })),
    [],
  );
  const setUnlocked = useCallback((kind: ProgressKind, names: string[], unlocked: boolean) => {
    setState((s) => {
      const current = new Set(s.progress.unlocked[kind]);
      for (const n of names) {
        if (unlocked) current.add(n);
        else current.delete(n);
      }
      return { ...s, progress: { ...s.progress, unlocked: { ...s.progress.unlocked, [kind]: [...current] } } };
    });
  }, []);
  const setOverride = useCallback(<K extends EditableKind>(kind: K, name: string, patch: Partial<ItemOf<K>> | null) => {
    setState((s) => {
      const forKind = { ...s.overrides[kind] } as Record<string, unknown>;
      if (patch === null || Object.keys(patch).length === 0) delete forKind[name];
      else forKind[name] = patch;
      return { ...s, overrides: { ...s.overrides, [kind]: forKind } };
    });
  }, []);
  const setTrend = useCallback((trend: Trend) => setState((s) => ({ ...s, trend })), []);
  const setCookware = useCallback((cookware: string[]) => setState((s) => ({ ...s, cookware })), []);
  const setCollabs = useCallback((collabs: string[]) => setState((s) => ({ ...s, collabs })), []);
  const setLang = useCallback((lang: Lang) => setState((s) => ({ ...s, lang })), []);
  const updateGuests = useCallback((fn: (g: Guests) => Guests) => setState((s) => ({ ...s, guests: fn(s.guests) })), []);
  const setRanking = useCallback(
    (patch: Partial<StoreState["ranking"]>) => setState((s) => ({ ...s, ranking: { ...s.ranking, ...patch } })),
    [],
  );
  const replaceState = useCallback((next: StoreState) => setState(normalizeState(next)), []);

  const value = useMemo(
    () => ({ state, setOwnedDlcs, setProgressEnabled, setUnlocked, setOverride, setTrend, setCookware, setCollabs, setLang, updateGuests, setRanking, replaceState }),
    [
      state,
      setOwnedDlcs,
      setProgressEnabled,
      setUnlocked,
      setOverride,
      setTrend,
      setCookware,
      setCollabs,
      setLang,
      updateGuests,
      setRanking,
      replaceState,
    ],
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

/** Applies the user's edits on top of the wiki data. */
export function applyOverrides(data: GameData, overrides: Overrides): GameData {
  const merge = <T extends { name: string }>(list: T[], patches: Record<string, Partial<T>>) =>
    list.map((item) => (patches[item.name] ? { ...item, ...patches[item.name] } : item));
  return {
    ...data,
    recipes: merge(data.recipes, overrides.recipes),
    ingredients: merge(data.ingredients, overrides.ingredients),
    beverages: merge(data.beverages, overrides.beverages),
    rareCustomers: merge(data.rareCustomers, overrides.rareCustomers),
  };
}

/** Wiki data with the user's edits applied. */
export function useGameData(): GameData {
  const { overrides } = useStore().state;
  return useMemo(() => applyOverrides(gameData, overrides), [overrides]);
}

export interface AvailablePool {
  recipes: Recipe[];
  ingredients: Ingredient[];
  beverages: Beverage[];
  locations: GameData["locations"];
  rareCustomers: RareCustomer[];
}

/**
 * Game data limited to owned DLCs and tonight's cookware, and, when progress tracking is on,
 * to what the player has unlocked.
 */
export function availablePool(data: GameData, state: Pick<StoreState, "ownedDlcs" | "progress" | "cookware" | "collabs">): AvailablePool {
  const { ownedDlcs, progress } = state;
  const enabledCollabs = new Set(state.collabs);
  const owned = (dlc: Dlc | null, collab: string | null = null) =>
    (dlc === null || ownedDlcs.includes(dlc)) && (collab === null || enabledCollabs.has(collab));
  const unlocked = (kind: ProgressKind) => {
    if (!progress.enabled) return () => true;
    const set = new Set(progress.unlocked[kind]);
    return (name: string) => set.has(name);
  };
  const recipeOk = unlocked("recipes");
  const ingredientOk = unlocked("ingredients");
  const beverageOk = unlocked("beverages");
  const locationOk = unlocked("locations");
  const cookware = new Set(state.cookware);
  const locations = data.locations.filter((l) => owned(l.dlc) && locationOk(l.name));
  const openLocations = new Set(locations.map((l) => l.name));
  return {
    recipes: data.recipes.filter((r) => owned(r.dlc, r.collab) && recipeOk(r.name) && cookware.has(r.cookware)),
    ingredients: data.ingredients.filter((i) => owned(i.dlc) && ingredientOk(i.name)),
    beverages: data.beverages.filter((b) => owned(b.dlc, b.collab) && beverageOk(b.name)),
    locations,
    rareCustomers: data.rareCustomers.filter(
      (c) => owned(c.dlc, c.collab) && (!progress.enabled || c.locations.some((l) => openLocations.has(l))),
    ),
  };
}

export function useAvailablePool(): AvailablePool {
  const data = useGameData();
  const { ownedDlcs, progress, cookware, collabs } = useStore().state;
  return useMemo(
    () => availablePool(data, { ownedDlcs, progress, cookware, collabs }),
    [data, ownedDlcs, progress, cookware, collabs],
  );
}
