// Downloads every image src/data/gamedata.json points at into public/images/, skipping files already there.
// The images are not in git (they belong to the game's owners), so CI and fresh clones run this before a build.
// Unlike fetch-images.mjs it never re-matches names on the wiki, so the files always match the committed data.
// Usage: node scripts/wiki/download-images.mjs
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const API = "https://touhou-mystias-izakaya.fandom.com/api.php";
const UA = { "User-Agent": "MystiaHelper/0.1 (data import script)" };
const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const gamedata = JSON.parse(await readFile(join(root, "src", "data", "gamedata.json"), "utf8"));

/** Every `image` value anywhere in the data, e.g. "images/recipes/CuisineIconFoo.png". */
function imagePaths(node, out = new Set()) {
  if (Array.isArray(node)) node.forEach((n) => imagePaths(n, out));
  else if (node && typeof node === "object")
    for (const [k, v] of Object.entries(node)) {
      if (k === "image" && typeof v === "string") out.add(v);
      else imagePaths(v, out);
    }
  return out;
}

const paths = [...imagePaths(gamedata)];
const missing = [];
for (const p of paths) {
  if (!(await access(join(root, "public", p)).then(() => true, () => false))) missing.push(p);
}

/** File name -> CDN URL, 50 titles per API call (Special:FilePath answers scripts with 403). */
async function fileUrls(names) {
  const urls = new Map();
  for (let i = 0; i < names.length; i += 50) {
    const titles = names.slice(i, i + 50).map((n) => `File:${n}`).join("|");
    const params = new URLSearchParams({ action: "query", titles, prop: "imageinfo", iiprop: "url", format: "json", formatversion: "2" });
    const res = await fetch(`${API}?${params}`, { headers: UA });
    if (!res.ok) throw new Error(`imageinfo -> HTTP ${res.status}`);
    const body = await res.json();
    // The API normalizes titles (e.g. "_" -> " "); map back through its list.
    const original = new Map((body.query.normalized ?? []).map((n) => [n.to, n.from]));
    for (const page of body.query.pages) {
      const url = page.imageinfo?.[0]?.url;
      if (url) urls.set((original.get(page.title) ?? page.title).slice("File:".length), url);
    }
  }
  return urls;
}

const urls = await fileUrls([...new Set(missing.map((p) => basename(p)))]);
const failed = [];
async function download(p) {
  const url = urls.get(basename(p));
  if (!url) return failed.push(`${p} -> not on the wiki`);
  const res = await fetch(url, { headers: UA });
  if (!res.ok) return failed.push(`${p} -> HTTP ${res.status}`);
  const target = join(root, "public", p);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, Buffer.from(await res.arrayBuffer()));
}

// A few at a time: quick enough for a cold cache without hammering the wiki.
const queue = [...missing];
await Promise.all(Array.from({ length: 6 }, async () => {
  while (queue.length) await download(queue.shift());
}));

console.log(`images: ${paths.length - missing.length} already here, ${missing.length - failed.length} downloaded`);
if (failed.length) {
  console.error(`Could not download:\n  ${failed.join("\n  ")}`);
  process.exit(1);
}
