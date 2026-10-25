import { describe, expect, it } from "vitest";
import { level2Section, parseSpellCards, plainText } from "./spellcards.mjs";

describe("level2Section", () => {
  it("matches headings wrapped in markup", () => {
    const page = "==Tag Requests==\n* Sweet: x\n== <i>Spell Card</i> ==\n===A (Reward)===\nGood.\n==Tasks==\nNope";
    expect(level2Section(page, /^spell cards?$/i)).toBe("===A (Reward)===\nGood.");
    expect(level2Section("==Other==\ntext", /^spell cards?$/i)).toBeNull();
  });
});

describe("plainText", () => {
  it("strips links, bold and HTML", () => {
    expect(plainText(`Serve [[Dark Matter|dark matter]] to <b>"Mystic Circle"</b> and '''win'''`)).toBe(
      `Serve dark matter to "Mystic Circle" and win`,
    );
  });
});

describe("parseSpellCards", () => {
  it("reads labelled reward and punishment cards", () => {
    const cards = parseSpellCards(
      [
        `=== Lamp Sign "Firefly Phenomenon" (Reward) ===`,
        "Guests are 30% more likely to appear.",
        "",
        `=== Wriggle Sign "Nightbug Tornado" (Punishment)===`,
        "Drives away every guest.",
      ].join("\n"),
    );
    expect(cards).toEqual([
      { name: `Lamp Sign "Firefly Phenomenon"`, kind: "reward", blocks: [{ type: "p", text: "Guests are 30% more likely to appear." }] },
      { name: `Wriggle Sign "Nightbug Tornado"`, kind: "punishment", blocks: [{ type: "p", text: "Drives away every guest." }] },
    ]);
  });

  it("keeps sub-effects and bullet points inside the card (Keine, Yuugi)", () => {
    const cards = parseSpellCards(
      [
        `===Land Sign "Three Sacred Treasures" (Reward)===`,
        "==== Three Sacred Treasures - Sword ====",
        "Randomly obtain two kinds of vegetables.",
        `==="From Song to Dance" (Reward)===`,
        "Levels up beverages.",
        "* Max chance to level up 3 Lv1 beverages.",
      ].join("\n"),
    );
    expect(cards[0].blocks).toEqual([
      { type: "h", text: "Three Sacred Treasures - Sword" },
      { type: "p", text: "Randomly obtain two kinds of vegetables." },
    ]);
    expect(cards[1].blocks[1]).toEqual({ type: "li", text: "Max chance to level up 3 Lv1 beverages." });
  });

  it("treats an unlabelled card after a reward as the punishment (Yuugi)", () => {
    const cards = parseSpellCards(`==="From Song to Dance" (Reward)===\nx\n===Big Four Arcanum "Knock Out in Three Steps"===\ny`);
    expect(cards.map((c) => c.kind)).toEqual(["reward", "punishment"]);
    expect(cards[1].name).toBe(`Big Four Arcanum "Knock Out in Three Steps"`);
  });

  it("recognises follow-up cards (Tewi)", () => {
    expect(parseSpellCards(`===Trick "Combo Disappearance Jutsu" (Follow-up)===\nz`)[0].kind).toBe("follow-up");
  });
});
