// Converts data/wiki-raw/*.lua into src/data/gamedata.json and writes a
// consistency report to data/wiki-report.md.
// Usage: node scripts/wiki/build.mjs
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { evalLuaModule } from "./lua.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const rawDir = join(root, "data", "wiki-raw");
const DLCS = ["BaseGame", "DLC1", "DLC2", "DLC3", "DLC4", "DLC5"];

const load = async (file) => evalLuaModule(await readFile(join(rawDir, file), "utf8"));
const manifest = JSON.parse(await readFile(join(rawDir, "manifest.json"), "utf8"));

const issues = [];
const warn = (msg) => issues.push(msg);

// Known spelling variants on the wiki, mapped to the canonical form.
const TAG_FIXES = {
  "Trend-Popular": "Trend - Popular",
  "Trend-Unpopular": "Trend - Unpopular",
  Beet: "Beer",
  "Cultural Background": "Cultural Heritage",
  Fungi: "Fungus",
  "Good with Alcohol": "Good w/ Alcohol",
};
const LOCATION_FIXES = { "Youkai Trial": "Youkai Trail", "Myouren Temple}": "Myouren Temple" };
// Values the wiki uses for "not documented yet".
const PLACEHOLDERS = new Set(["?????", "??", "Unknown", "None"]);

const fixTag = (t, where) => {
  const s = t.trim();
  if (TAG_FIXES[s]) {
    warn(`Tag "${s}" -> "${TAG_FIXES[s]}" (${where})`);
    return TAG_FIXES[s];
  }
  return s;
};
const tags = (list, where) =>
  (list ?? [])
    .flatMap((t) => t.split(","))
    .map((t) => t.trim())
    .filter((t) => t && !PLACEHOLDERS.has(t))
    .map((t) => fixTag(t, where));
// True when the wiki has not documented this customer's preferences yet.
const isUndocumented = (d) => [d.pref_cuisine, d.pref_beverage].some((l) => (l ?? []).some((t) => PLACEHOLDERS.has(t)));
const locs = (list, where) => (list ?? []).filter((l) => !PLACEHOLDERS.has(l)).map((l) => fixLocation(l, where));
const fixLocation = (l, where) => {
  if (LOCATION_FIXES[l]) {
    warn(`Location "${l}" -> "${LOCATION_FIXES[l]}" (${where})`);
    return LOCATION_FIXES[l];
  }
  return l;
};
const parseBudget = (s, where) => {
  const m = /^\s*(\d+)\s*-\s*(\d+)\s*$/.exec(s ?? "");
  if (PLACEHOLDERS.has(s)) return null;
  if (!m) {
    warn(`Unparseable budget "${s}" (${where})`);
    return null;
  }
  return { min: Number(m[1]), max: Number(m[2]) };
};

// ---------- Ingredients ----------
const ingRaw = await load("Ingredient_data.lua");
const ingredients = [];
for (const dlc of DLCS) {
  for (const [category, names] of Object.entries(ingRaw[dlc] ?? {})) {
    for (const name of names) {
      const d = ingRaw[name];
      if (!d) {
        warn(`Ingredient "${name}" listed in ${dlc} but has no data`);
        continue;
      }
      ingredients.push({ name, dlc, category, level: d.lv, price: d.value, tags: tags(d.props, name) });
    }
  }
}

// ---------- Beverages ----------
const bevRaw = await load("Beverage_data.lua");
const beverages = [];
for (const dlc of DLCS) {
  for (const name of bevRaw[dlc] ?? []) {
    const d = bevRaw[name];
    if (!d) {
      warn(`Beverage "${name}" listed in ${dlc} but has no data`);
      continue;
    }
    const alcohol = d.alcohol_content ? fixTag(d.alcohol_content, name) : null;
    const t = tags(d.props, name);
    if (alcohol && !t.includes(alcohol)) t.unshift(alcohol);
    beverages.push({ name, dlc, level: d.lv, price: d.cost, alcohol, tags: t });
  }
}

// ---------- Recipes ----------
const cuiRaw = await load("Cuisine_data.lua");
const recipes = [];
for (const dlc of DLCS) {
  for (const name of cuiRaw[dlc] ?? []) {
    const d = cuiRaw[name];
    if (!d) {
      warn(`Recipe "${name}" listed in ${dlc} but has no data`);
      continue;
    }
    recipes.push({
      name,
      dlc,
      level: d.lv,
      price: d.cost,
      tags: tags(d.props, name),
      bannedTags: tags(d.xprops, name),
      ingredients: d.ingredients ?? [],
      cookware: d.kitchenware,
      cookTime: d.cook_time,
    });
  }
}

// ---------- Customers & locations ----------
const custRaw = await load("Customer_data.lua");

const normalRaw = custRaw["Normal Customers"];
const normalCustomers = [];
for (const dlc of DLCS) {
  for (const name of normalRaw[dlc] ?? []) {
    const d = normalRaw[name];
    if (!d) {
      warn(`Normal customer "${name}" listed in ${dlc} but has no data`);
      continue;
    }
    normalCustomers.push({
      name,
      dlc,
      locations: locs(d.locations, name),
      likesAllTags: (d.pref_cuisine ?? []).includes("All Tags"),
      undocumented: isUndocumented(d),
      likedFoodTags: tags(d.pref_cuisine, name).filter((t) => t !== "All Tags"),
      likedDrinkTags: tags(d.pref_beverage, name).filter((t) => t !== "All Tags"),
      description: d.description ?? "",
    });
  }
}

// Rare customers: keys appear in order  DLC group -> location list -> customer entries.
const rareRaw = custRaw["Rare Customers"];
const locations = [];
const rareCustomers = [];
let curDlc = null;
let curLocation = null;
for (const [key, value] of Object.entries(rareRaw)) {
  if (DLCS.includes(key)) {
    curDlc = key;
    for (const loc of value) {
      locations.push({ name: loc, dlc: key, rareCustomers: [] });
    }
  } else if (Array.isArray(value)) {
    curLocation = key;
  } else {
    const loc = locations.find((l) => l.name === curLocation);
    loc?.rareCustomers.push(key);
    rareCustomers.push({
      name: key,
      shortName: value.short_name ?? key,
      kind: "rare",
      dlc: curDlc,
      homeLocation: curLocation,
      budget: parseBudget(value.budget, key),
      locations: locs(value.locations, key),
      undocumented: isUndocumented(value),
      likedFoodTags: tags(value.pref_cuisine, key),
      dislikedFoodTags: tags(value.x_cuisine, key),
      likedDrinkTags: tags(value.pref_beverage, key),
    });
  }
}

const specialRaw = custRaw["Special Guests"];
for (const name of specialRaw.order ?? []) {
  const d = specialRaw[name];
  if (!d) {
    warn(`Special guest "${name}" listed in order but has no data`);
    continue;
  }
  rareCustomers.push({
    name,
    shortName: d.short_name ?? name,
    kind: "special",
    dlc: null,
    homeLocation: null,
    budget: parseBudget(d.budget, name),
    locations: locs(d.locations, name),
    undocumented: isUndocumented(d),
    likedFoodTags: tags(d.pref_cuisine, name),
    dislikedFoodTags: tags(d.x_cuisine, name),
    likedDrinkTags: tags(d.pref_beverage, name),
  });
}

// ---------- Merchants ----------
const merRaw = await load("Merchant_data.lua");
const merchants = [];
for (const dlc of DLCS) {
  for (const name of merRaw[dlc] ?? []) {
    const d = merRaw[name];
    if (!d) {
      warn(`Merchant "${name}" listed in ${dlc} but has no data`);
      continue;
    }
    const order = d.item_order ?? Object.keys(d.items ?? {});
    merchants.push({
      name,
      dlc,
      location: d.location ? fixLocation(d.location, name) : null,
      priceMultiplier: d.price_multiplier ? { min: d.price_multiplier.lower, max: d.price_multiplier.upper } : null,
      items: order
        .filter((item) => d.items?.[item])
        .map((item) => {
          const it = d.items[item];
          return {
            name: item,
            type: it.type,
            probability: it.probability,
            amount: it.amount ? { min: it.amount.lower, max: it.amount.upper } : null,
          };
        }),
    });
  }
}

// ---------- Partners ----------
const parRaw = await load("Partner_data.lua");
const partners = [];
for (const dlc of DLCS) {
  for (const name of parRaw[dlc] ?? []) {
    const d = parRaw[name];
    if (!d) {
      warn(`Partner "${name}" listed in ${dlc} but has no data`);
      continue;
    }
    partners.push({
      name,
      shortName: d.short_name ?? name,
      dlc,
      movementSpeed: d.movement_speed,
      workSpeed: d.work_speed,
      revenueShare: d.daily_revenue_taken,
    });
  }
}

// ---------- Cross-reference checks ----------
const ingNames = new Set(ingredients.map((i) => i.name));
const bevNames = new Set(beverages.map((b) => b.name));
const locNames = new Set(locations.map((l) => l.name));
for (const r of recipes)
  for (const i of r.ingredients) if (!ingNames.has(i)) warn(`Recipe "${r.name}" uses unknown ingredient "${i}"`);
for (const m of merchants) {
  if (m.location && !locNames.has(m.location)) warn(`Merchant "${m.name}" at unknown location "${m.location}"`);
  for (const it of m.items) {
    const known = it.type === "Beverage" ? bevNames.has(it.name) : it.type === "Ingredient" ? ingNames.has(it.name) : true;
    if (!known) warn(`Merchant "${m.name}" sells unknown ${it.type} "${it.name}"`);
  }
}
for (const c of [...normalCustomers, ...rareCustomers])
  for (const l of c.locations) if (!locNames.has(l)) warn(`Customer "${c.name}" at unknown location "${l}"`);
for (const c of rareCustomers.filter((c) => c.undocumented)) warn(`Customer "${c.name}" preferences not documented on wiki`);

const foodTagsOnItems = new Set([...recipes.flatMap((r) => r.tags), ...ingredients.flatMap((i) => i.tags)]);
const drinkTagsOnItems = new Set(beverages.flatMap((b) => b.tags));
const requestedFood = new Set([
  ...normalCustomers.flatMap((c) => c.likedFoodTags),
  ...rareCustomers.flatMap((c) => [...c.likedFoodTags, ...c.dislikedFoodTags]),
]);
const requestedDrink = new Set([
  ...normalCustomers.flatMap((c) => c.likedDrinkTags),
  ...rareCustomers.flatMap((c) => c.likedDrinkTags),
]);
const foodTagsOnlyOnCustomers = [...requestedFood].filter((t) => !foodTagsOnItems.has(t)).sort();
const drinkTagsOnlyOnCustomers = [...requestedDrink].filter((t) => !drinkTagsOnItems.has(t)).sort();

// ---------- Tag request quotes (from fetch-quotes.mjs, optional) ----------
const quotes = await readFile(join(rawDir, "quotes.json"), "utf8").then(JSON.parse, () => ({}));
for (const c of rareCustomers) {
  c.foodQuotes = (quotes[c.name]?.quotes ?? []).map((q) => ({ ...q, tag: fixTag(q.tag, `${c.name} quote`) }));
  for (const q of c.foodQuotes)
    if (!c.likedFoodTags.includes(q.tag)) warn(`Quote for "${q.tag}" but ${c.name} does not list it as liked`);
}

// ---------- Images (from fetch-images.mjs, optional) ----------
const images = await readFile(join(rawDir, "images.json"), "utf8").then(JSON.parse, () => ({}));
const attachImages = (list, kind) => {
  for (const item of list) item.image = images[kind]?.[item.name] ?? null;
};
attachImages(recipes, "recipes");
attachImages(ingredients, "ingredients");
attachImages(beverages, "beverages");
attachImages(rareCustomers, "customers");
for (const c of normalCustomers) c.image = null;
// The five cookware types recipes use ("Any" is only Dark Matter).
const cookware = [...new Set(recipes.map((r) => r.cookware))]
  .filter((name) => name && name !== "Any")
  .sort()
  .map((name) => ({ name, image: images.cookware?.[name] ?? null }));

// ---------- Output ----------
const gamedata = {
  meta: {
    source: "https://touhou-mystias-izakaya.fandom.com",
    fetchedAt: manifest.fetchedAt,
    builtAt: new Date().toISOString(),
    dlcs: DLCS,
  },
  locations,
  cookware,
  ingredients,
  beverages,
  recipes,
  normalCustomers,
  rareCustomers,
  merchants,
  partners,
  tags: {
    food: [...new Set([...foodTagsOnItems, ...requestedFood])].sort(),
    drink: [...new Set([...drinkTagsOnItems, ...requestedDrink])].sort(),
  },
};
await mkdir(join(root, "src", "data"), { recursive: true });
await writeFile(join(root, "src", "data", "gamedata.json"), JSON.stringify(gamedata, null, 1) + "\n", "utf8");

const counts = Object.entries(gamedata)
  .filter(([, v]) => Array.isArray(v))
  .map(([k, v]) => `| ${k} | ${v.length} |`);
const report = [
  "# Wiki data report",
  "",
  `Fetched: ${manifest.fetchedAt}`,
  "",
  "| Dataset | Count |",
  "|---|---|",
  ...counts,
  "",
  "## Food tags customers use that no recipe/ingredient carries",
  "These are tags the game adds dynamically (price, trend, etc.) or wiki inconsistencies.",
  "",
  ...foodTagsOnlyOnCustomers.map((t) => `- ${t}`),
  "",
  "## Drink tags customers use that no beverage carries",
  "",
  ...drinkTagsOnlyOnCustomers.map((t) => `- ${t}`),
  "",
  `## Issues (${issues.length})`,
  "",
  ...[...new Set(issues)].map((i) => `- ${i}`),
  "",
].join("\n");
await writeFile(join(root, "data", "wiki-report.md"), report, "utf8");
console.log(counts.join("\n"));
console.log(`${issues.length} issues, see data/wiki-report.md`);
