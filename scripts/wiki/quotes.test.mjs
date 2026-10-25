import { describe, expect, it } from "vitest";
import { cleanQuote, parseTagRequests, tagRequestsSection } from "./quotes.mjs";

describe("cleanQuote", () => {
  it("keeps only the quoted words, dropping editor notes", () => {
    expect(cleanQuote(`''"Raw meat tastes better!Are you a weirdo''?" ''(Lacks a space between sentences)''`)).toBe(
      "Raw meat tastes better!Are you a weirdo?",
    );
  });

  it("handles curly and mixed quote marks", () => {
    expect(cleanQuote(`''“As an insect, I never say no to abnormal food~"''`)).toBe("As an insect, I never say no to abnormal food~");
    expect(cleanQuote(`''“With "legends" come youkai.”''`)).toBe(`With "legends" come youkai.`);
  });

  it("unwraps wiki links", () => {
    expect(cleanQuote(`''“I love [[Dew Runny Eggs|runny eggs]]”''`)).toBe("I love runny eggs");
  });
});

describe("parseTagRequests", () => {
  const page = [
    "== Descriptions ==",
    "Some text",
    "==Tag Requests==",
    "",
    "*Sweet: ''\"It would be great if all dishes tasted sweet~\"''",
    "* Good with Alcohol: ''“Some matching dishes have to go with it.”''",
    "'''DLC 4'''",
    "* Raw: ''“Of course. . . a vampire eats raw.”''",
    "",
    "=== Strategies ===",
    "* Not a quote: ignored",
    "==Spell Card==",
  ].join("\n");

  it("finds the section and parses each tag line", () => {
    const section = tagRequestsSection(page);
    expect(section).not.toBeNull();
    expect(parseTagRequests(section)).toEqual([
      { tag: "Sweet", text: "It would be great if all dishes tasted sweet~", variant: null },
      { tag: "Good with Alcohol", text: "Some matching dishes have to go with it.", variant: null },
      { tag: "Raw", text: "Of course. . . a vampire eats raw.", variant: "DLC 4" },
    ]);
  });

  it("returns null when the page has no Tag Requests section", () => {
    expect(tagRequestsSection("== Description ==\nhello")).toBeNull();
  });
});
