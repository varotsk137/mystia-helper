import { describe, expect, it } from "vitest";
import { gameData } from "./data";
import { quoteWords, requestableFoodTags, searchQuotes } from "./quotes";

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

describe("searchQuotes", () => {
  it("ignores case and punctuation and matches word starts", () => {
    expect(quoteWords("Sweets can make you feel powerful!")).toEqual(["sweets", "can", "make", "you", "feel", "powerful"]);
    const hits = searchQuotes(gameData.rareCustomers, "insects CARNIV", null);
    expect(hits).toHaveLength(1);
    expect(hits[0].customer.name).toBe("Wriggle Nightbug");
    expect(hits[0].quote.tag).toBe("Meat");
  });

  it("puts the current customer's lines first", () => {
    const anyone = searchQuotes(gameData.rareCustomers, "sweet", null, 100);
    expect(anyone.length).toBeGreaterThan(1);
    const last = anyone[anyone.length - 1].customer.name;
    expect(searchQuotes(gameData.rareCustomers, "sweet", last, 100)[0].customer.name).toBe(last);
  });

  it("returns nothing for an empty query", () => {
    expect(searchQuotes(gameData.rareCustomers, "  ?! ", null)).toEqual([]);
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
