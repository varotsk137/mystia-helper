import raw from "./gamedata.json";
import type { GameData } from "./types";

export const gameData = raw as GameData;
export * from "./types";
