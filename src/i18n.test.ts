import { describe, expect, it } from "vitest";
import { dlcLabel, messages, translate, type MessageKey } from "./i18n";
import { gameData } from "./data";

describe("messages", () => {
  const keys = Object.keys(messages) as MessageKey[];

  it("has non-empty Thai and English for every key", () => {
    for (const key of keys) {
      expect(messages[key].th.trim(), key).not.toBe("");
      expect(messages[key].en.trim(), key).not.toBe("");
    }
  });

  it("uses the same {placeholders} in both languages", () => {
    const vars = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    for (const key of keys) expect(vars(messages[key].en), key).toEqual(vars(messages[key].th));
  });

  it("has a label for every rating, budget status, sort, special note and spell card kind used in code", () => {
    for (const k of ["pink", "orange", "green", "purple", "black"]) expect(keys).toContain(`rating.${k}`);
    for (const k of ["safe", "risky", "over", "unknown"]) expect(keys).toContain(`budget.${k}`);
    for (const k of ["nitori-cucumber", "remilia-cake", "koishi-mousse", "medicine-dark-matter"]) expect(keys).toContain(`note.${k}`);
    for (const c of gameData.rareCustomers) for (const card of c.spellCards) expect(keys).toContain(`spell.${card.kind}`);
  });
});

describe("translate", () => {
  it("fills in placeholders", () => {
    expect(translate("en", "progress.summary", { n: 3, total: 10 })).toBe("3 of 10 unlocked. Click an item to toggle it.");
    expect(translate("th", "rare.points", { n: 4 })).toBe("4 แต้ม");
  });

  it("labels DLCs", () => {
    const t = (key: MessageKey) => translate("en", key);
    expect(dlcLabel("BaseGame", t)).toBe("Base game");
    expect(dlcLabel("DLC3", t)).toBe("DLC 3");
  });
});

describe("spell card data", () => {
  it("has a reward and a punishment for documented rare guests", () => {
    const wriggle = gameData.rareCustomers.find((c) => c.name === "Wriggle Nightbug")!;
    expect(wriggle.spellCards.map((c) => c.kind)).toEqual(["reward", "punishment"]);
    expect(wriggle.spellCards[0].name).toBe(`Lamp Sign "Firefly Phenomenon"`);
    expect(wriggle.spellCards[0].blocks[0].text).toContain("30%");
    const withCards = gameData.rareCustomers.filter((c) => c.spellCards.length > 0);
    expect(withCards.length).toBeGreaterThan(50);
  });

  it("keeps the wiki's note for guests without spell cards", () => {
    const meng = gameData.rareCustomers.find((c) => c.name === "Meng Chengguo")!;
    expect(meng.spellCards).toEqual([]);
    expect(meng.spellCardNote).toBe("This guest does not have spell cards.");
  });
});
