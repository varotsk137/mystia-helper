// Parses the "Spell Card" section of a rare customer's wiki page: the reward card a pink rating
// triggers and the punishment card a black rating triggers.

/** Heading text without wiki/HTML formatting. */
export function plainHeading(text) {
  return text
    .replace(/<\/?[a-z][^>]*>/gi, "")
    .replace(/'{2,3}/g, "")
    .trim();
}

/** Plain text for display: no wiki links, bold/italic quotes or HTML tags. */
export function plainText(text) {
  return text
    .replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, "$1")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?[a-z][^>]*>/gi, "")
    .replace(/'{2,3}/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

/** Body of the level-2 section whose heading matches `pattern`, or null. */
export function level2Section(wikitext, pattern) {
  const lines = wikitext.split("\n");
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    const h = /^==([^=].*?)==\s*$/.exec(lines[i].trim());
    if (!h) continue;
    if (start >= 0) return lines.slice(start, i).join("\n");
    if (pattern.test(plainHeading(h[1]))) start = i + 1;
  }
  return start >= 0 ? lines.slice(start).join("\n") : null;
}

const KIND_LABELS = [
  [/\(\s*reward\s*\)/i, "reward"],
  [/\(\s*punishment\s*\)/i, "punishment"],
  [/\(\s*follow-?up\s*\)/i, "follow-up"],
];

/**
 * @typedef {{ type: "p" | "li" | "h", text: string }} Block
 * @typedef {{ name: string, kind: "reward" | "punishment" | "follow-up", blocks: Block[] }} SpellCard
 * @returns {SpellCard[]}
 */
export function parseSpellCards(section) {
  const cards = [];
  let card = null;
  for (const raw of section.split("\n")) {
    const line = raw.trim();
    const h3 = /^===([^=].*?)===\s*$/.exec(line);
    const h4 = /^====+([^=].*?)=+\s*$/.exec(line);
    if (h3) {
      const heading = plainHeading(h3[1]);
      const label = KIND_LABELS.find(([re]) => re.test(heading));
      let kind = label?.[1];
      // An unlabelled card is the other half of the pair: pages list the reward first.
      if (!kind) kind = cards.some((c) => c.kind === "reward") ? "punishment" : "reward";
      const name = heading.replace(/\(\s*(reward|punishment|follow-?up)\s*\)/i, "").trim();
      card = { name, kind, blocks: [] };
      cards.push(card);
      continue;
    }
    if (!card || !line) continue;
    if (h4) card.blocks.push({ type: "h", text: plainText(plainHeading(h4[1])) });
    else if (/^\*+/.test(line)) card.blocks.push({ type: "li", text: plainText(line.replace(/^\*+\s*/, "")) });
    else if (!/^\[\[(File|Category):/i.test(line)) card.blocks.push({ type: "p", text: plainText(line) });
  }
  return cards.filter((c) => c.blocks.length > 0 || c.name);
}
