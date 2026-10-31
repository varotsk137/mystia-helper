import { describe, expect, it } from "vitest";
import { gameData } from "./data";
import { requestableFoodTags } from "./quotes";

const customer = (name: string) => gameData.rareCustomers.find((c) => c.name === name)!;

describe("quote data", () => {
  it("is attached to most rare customers", () => {
    const withQuotes = gameData.rareCustomers.filter((c) => c.foodQuotes.length > 0);
    expect(withQuotes.length).toBeGreaterThan(45);
    expect(customer("Wriggle Nightbug").foodQuotes.map((q) => q.tag).sort()).toEqual(["Meat", "Peculiar", "Raw", "Sweet"]);
  });

  it("includes special guests the wiki left out of its order list", () => {
    const kokoro = customer("Hata no Kokoro");
    expect(kokoro.kind).toBe("special");
    expect(kokoro.budget).toEqual({ min: 514, max: 805 });
    expect(kokoro.foodQuotes.length).toBe(6);
  });
});

describe("requestableFoodTags", () => {
  it("adds tags that only appear in order lines (Youmu's first visit)", () => {
    const tags = requestableFoodTags(customer("Youmu Konpaku"));
    expect(tags).toContain("Legendary");
    expect(tags).toContain("Japanese");
    for (const t of customer("Youmu Konpaku").likedFoodTags) expect(tags).toContain(t);
  });
});
