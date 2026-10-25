// Parses the "Tag Requests" section of a rare customer's wiki page: the line the customer says
// in-game when ordering a dish with that tag.

/** Returns the wikitext of the "Tag Requests" section, or null when the page has none. */
export function tagRequestsSection(wikitext) {
  const m = /^==+\s*Tag Requests?\s*==+\s*$([\s\S]*?)(?=^==[^=]|(?![\s\S]))/m.exec(wikitext);
  return m ? m[1] : null;
}

/** Strips wiki markup and returns the text between the first pair of quote marks. */
export function cleanQuote(raw) {
  const text = raw
    .replace(/'{2,3}/g, "")
    .replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, "$1")
    .trim();
  const open = text.search(/["“]/);
  if (open < 0) return text;
  const rest = text.slice(open + 1);
  // A curly opener only closes on a curly closer, so straight quotes inside stay part of the line.
  const close = text[open] === "“" ? rest.lastIndexOf("”") : rest.search(/["”]/);
  if (close >= 0) return rest.slice(0, close).trim();
  // Unbalanced (e.g. “...~"): take the rest without a trailing quote mark.
  return rest.replace(/["”]\s*$/, "").trim();
}

/**
 * Parses bullet lines like `* Sweet: ''"Sweets please~"''`. A bold line on its own (e.g. `'''DLC 4'''`) starts a
 * variant: later quotes are tagged with it. Parsing stops at the next heading.
 * @returns {{ tag: string, text: string, variant: string | null }[]}
 */
export function parseTagRequests(section) {
  const quotes = [];
  let variant = null;
  for (const raw of section.split("\n")) {
    const line = raw.trim();
    if (/^=/.test(line)) break;
    const header = /^'''([^']+)'''$/.exec(line);
    if (header) {
      variant = header[1].trim();
      continue;
    }
    const m = /^\*+\s*(?:'{2,3})?([^:'"“”]+?)(?:'{2,3})?\s*:\s*(.+)$/.exec(line);
    if (!m) continue;
    const text = cleanQuote(m[2]);
    if (text) quotes.push({ tag: m[1].trim(), text, variant });
  }
  return quotes;
}
