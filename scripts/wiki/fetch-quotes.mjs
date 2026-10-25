// Downloads each rare customer's / special guest's wiki page and extracts the lines they say when
// requesting a food tag, into data/wiki-raw/quotes.json ({ customerName: { page, quotes } }).
// Run after build.mjs (it reads the customer list from gamedata.json), then run build.mjs again.
// Usage: node scripts/wiki/fetch-quotes.mjs
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseTagRequests, tagRequestsSection } from "./quotes.mjs";

const API = "https://touhou-mystias-izakaya.fandom.com/api.php";
const UA = { "User-Agent": "MystiaHelper/0.1 (data import script)" };
const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const gamedata = JSON.parse(await readFile(join(root, "src", "data", "gamedata.json"), "utf8"));

async function wikitext(title) {
  const params = new URLSearchParams({ action: "parse", page: title, prop: "wikitext", format: "json", formatversion: "2", redirects: "1" });
  const res = await fetch(`${API}?${params}`, { headers: UA });
  if (!res.ok) throw new Error(`${title} -> HTTP ${res.status}`);
  const body = await res.json();
  return body.error ? null : { title: body.parse.title, text: body.parse.wikitext };
}

const out = {};
let withQuotes = 0;
for (const c of gamedata.rareCustomers) {
  // Page titles use the full name; a few use the other name order or the short name.
  const candidates = [c.name, c.name.split(" ").reverse().join(" "), c.shortName];
  let page = null;
  for (const t of candidates) {
    page = await wikitext(t);
    if (page) break;
  }
  const section = page ? tagRequestsSection(page.text) : null;
  const quotes = section ? parseTagRequests(section) : [];
  if (quotes.length) withQuotes++;
  out[c.name] = { page: page?.title ?? null, quotes };
}
await writeFile(join(root, "data", "wiki-raw", "quotes.json"), JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`${withQuotes}/${gamedata.rareCustomers.length} customers have tag request quotes`);
