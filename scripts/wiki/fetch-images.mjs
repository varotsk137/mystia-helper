// Downloads item icons and customer portraits from the wiki into public/images/
// and writes data/wiki-raw/images.json ({ kind: { itemName: "images/kind/file.png" } }).
// Run after fetch.mjs + build.mjs so gamedata.json lists every item.
// Usage: node scripts/wiki/fetch-images.mjs
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const API = "https://touhou-mystias-izakaya.fandom.com/api.php";
const UA = { "User-Agent": "MystiaHelper/0.1 (data import script)" };
const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const gamedata = JSON.parse(await readFile(join(root, "src", "data", "gamedata.json"), "utf8"));

async function allImages() {
  const out = [];
  let cont = null;
  do {
    const params = new URLSearchParams({ action: "query", list: "allimages", ailimit: "500", aiprop: "url", format: "json", formatversion: "2" });
    if (cont) params.set("aicontinue", cont);
    const res = await fetch(`${API}?${params}`, { headers: UA });
    if (!res.ok) throw new Error(`allimages -> HTTP ${res.status}`);
    const body = await res.json();
    out.push(...body.query.allimages);
    cont = body.continue?.aicontinue ?? null;
  } while (cont);
  return out;
}

// Wiki file names are "<Prefix><Name in PascalCase>.png" with punctuation mostly kept; compare loosely.
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

const KINDS = [
  { kind: "recipes", prefixes: ["CuisineIcon"], items: gamedata.recipes.map((r) => r.name) },
  { kind: "ingredients", prefixes: ["IngredientIcon"], items: gamedata.ingredients.map((i) => i.name) },
  { kind: "beverages", prefixes: ["BeverageIcon"], items: gamedata.beverages.map((b) => b.name) },
  { kind: "cookware", prefixes: ["KitchenwareDefault"], items: (gamedata.cookware ?? []).map((c) => c.name) },
  {
    kind: "customers",
    prefixes: ["RareCustomerDefaultPortrait", "SpecialGuestDefaultPortrait", "PartnerDefaultPortrait"],
    items: gamedata.rareCustomers.flatMap((c) => [c.name]),
    // Portraits sometimes use "Given Family" order or the short name.
    aliases: (name) => {
      const c = gamedata.rareCustomers.find((x) => x.name === name);
      const parts = name.split(" ");
      return [name, parts.slice().reverse().join(" "), c?.shortName ?? name];
    },
  },
];

const images = await allImages();
const mapping = {};
const missing = [];
for (const { kind, prefixes, items, aliases } of KINDS) {
  const candidates = images.filter((img) => prefixes.some((p) => img.name.startsWith(p)) && img.name.endsWith(".png"));
  const index = new Map();
  for (const img of candidates) {
    const prefix = prefixes.find((p) => img.name.startsWith(p));
    index.set(norm(img.name.slice(prefix.length, -4)), img);
  }
  const dir = join(root, "public", "images", kind);
  await mkdir(dir, { recursive: true });
  mapping[kind] = {};
  for (const name of items) {
    const keys = (aliases ? aliases(name) : [name]).map(norm);
    const img = keys.map((k) => index.get(k)).find(Boolean);
    if (!img) {
      missing.push(`${kind}: ${name}`);
      continue;
    }
    const file = img.name;
    const target = join(dir, file);
    const exists = await access(target).then(() => true, () => false);
    if (!exists) {
      const res = await fetch(img.url, { headers: UA });
      if (!res.ok) throw new Error(`${img.name} -> HTTP ${res.status}`);
      await writeFile(target, Buffer.from(await res.arrayBuffer()));
    }
    mapping[kind][name] = `images/${kind}/${file}`;
  }
  console.log(`${kind}: ${Object.keys(mapping[kind]).length}/${items.length}`);
}
await writeFile(join(root, "data", "wiki-raw", "images.json"), JSON.stringify(mapping, null, 2) + "\n", "utf8");
if (missing.length) console.log(`No image found for:\n  ${missing.join("\n  ")}`);
