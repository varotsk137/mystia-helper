// User settings persisted in localStorage (kept by the Tauri webview between launches).
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { gameData, type Dlc } from "./data";

export interface Settings {
  ownedDlcs: Dlc[];
}

const STORAGE_KEY = "mystia-helper.settings";
const DEFAULTS: Settings = { ownedDlcs: [...gameData.meta.dlcs] };

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

interface SettingsContextValue {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(load);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Storage unavailable: settings last for this session only.
    }
  }, [settings]);
  const value = useMemo(() => ({ settings, update: (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch })) }), [settings]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}

/** Game data filtered to the DLCs the player owns. */
export function useOwnedPool() {
  const { ownedDlcs } = useSettings().settings;
  return useMemo(() => {
    const owned = (dlc: Dlc | null) => dlc === null || ownedDlcs.includes(dlc);
    return {
      recipes: gameData.recipes.filter((r) => owned(r.dlc)),
      ingredients: gameData.ingredients.filter((i) => owned(i.dlc)),
      beverages: gameData.beverages.filter((b) => owned(b.dlc)),
      rareCustomers: gameData.rareCustomers.filter((c) => owned(c.dlc)),
      locations: gameData.locations.filter((l) => owned(l.dlc)),
    };
  }, [ownedDlcs]);
}
