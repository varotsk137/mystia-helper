import raw from "./gamedata.json";
import type { GameData } from "./types";

export const gameData = raw as GameData;
export * from "./types";

export const DLC_LABELS: Record<string, string> = {
  BaseGame: "เกมหลัก",
  DLC1: "DLC 1",
  DLC2: "DLC 2",
  DLC3: "DLC 3",
  DLC4: "DLC 4",
  DLC5: "DLC 5",
};
