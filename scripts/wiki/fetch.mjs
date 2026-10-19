// Downloads the wiki's Lua data modules into data/wiki-raw/.
// Usage: node scripts/wiki/fetch.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const API = "https://touhou-mystias-izakaya.fandom.com/api.php";
const MODULES = [
  "Ingredient/data",
  "Beverage/data",
  "Cuisine/data",
  "Customer/data",
  "Customer/locations",
  "Merchant/data",
  "Partner/data",
];

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const outDir = join(root, "data", "wiki-raw");

async function fetchModule(name) {
  const url = new URL(API);
  url.search = new URLSearchParams({
    action: "query",
    prop: "revisions",
    rvprop: "content|timestamp",
    rvslots: "main",
    titles: `Module:${name}`,
    format: "json",
    formatversion: "2",
  }).toString();
  const res = await fetch(url, { headers: { "User-Agent": "MystiaHelper/0.1 (data import script)" } });
  if (!res.ok) throw new Error(`Module:${name} -> HTTP ${res.status}`);
  const page = (await res.json()).query.pages[0];
  if (page.missing) throw new Error(`Module:${name} does not exist`);
  const rev = page.revisions[0];
  return { content: rev.slots.main.content, timestamp: rev.timestamp };
}

await mkdir(outDir, { recursive: true });
const manifest = { fetchedAt: new Date().toISOString(), modules: {} };
for (const name of MODULES) {
  const { content, timestamp } = await fetchModule(name);
  const file = `${name.replace("/", "_")}.lua`;
  await writeFile(join(outDir, file), content, "utf8");
  manifest.modules[name] = { file, revisionTimestamp: timestamp };
  console.log(`Module:${name} -> ${file} (rev ${timestamp})`);
}
await writeFile(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");
