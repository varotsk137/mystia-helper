# Game mechanics used by the helper

Source: the wiki's `Customers` and `Tags` pages (https://touhou-mystias-izakaya.fandom.com), read 2026-10-19.

## Dish tags

A served dish's tag set is built as:

1. Recipe's own tags (`recipes[].tags`).
2. Plus every tag of every **extra** ingredient added by the player.
3. Plus `Large Portion` if an **extra** ingredient brings the dish to **5 ingredients total**.
   Recipes whose base already has 5 ingredients do not get it automatically.
4. Plus `Trend - Popular` if the dish carries any tag the newspaper currently marks as popular, and
   `Trend - Unpopular` likewise. Several tags can be popular or unpopular at the same time; the player
   picks them in the app.
5. Then overrides are applied (left wins, right is removed):
   - Meat > Vegetarian
   - Large Portion > Small Portion
   - Filling > Good w/ Alcohol
   - Greasy > Mild
   - Hot > Refreshing

Constraints:

- Max **5 ingredients** per dish (base + extra).
- If an **added** tag is in the recipe's `bannedTags`, the dish becomes **Dark Matter**.
  No recipe bans `Large Portion`, so the automatic tag never causes this.
- `Expensive` (price > 60) and `Economical` (price < 20) are fixed on the recipe; they are already in the data.
- Adding ingredients does not change the dish price (confirmed by the user in-game).
- Cookware has a hidden tag used only for album search; customers never request it.

Beverages cannot be modified; their tags (including alcohol level) are fixed.

## Rare customers and special guests

The customer requests **one food tag** and **one drink tag**.

Score:

- +1 per tag on the dish that the customer likes
- +1 per tag on the drink that the customer likes
- −1 per tag on the dish that the customer dislikes
- −2 if the dish is Dark Matter

Rating from score, capped by how many of the two requested tags were fulfilled:

| Score | Rating | Cap |
|---|---|---|
| ≤ 0 | Black (punishment spell card) | |
| 1 | Purple | max if neither request fulfilled |
| 2 | Green | |
| 3 | Orange | max if only one request fulfilled |
| ≥ 4 | Pink (reward spell card) | |

Other rules:

- Going over budget: the customer pays what they can and leaves; if it is far over, they may trigger the punishment card.
- Night Sparrow cookware with Hyper mode or a perfect Sparrow Tune: requested tags are ignored and the guest
  rates the dish by their own preferences. Only Mystia cooking triggers it (not a partner chef), and this
  cookware cooks 25% slower. The app's "ignore requests" switch models this.
- Special cases (override everything above):
  - Koishi + Unconscious Youkai Mousse → black.
  - Nitori + anything containing Cucumber → at least orange.
  - Medicine + Dark Matter → at least orange.
  - Remilia + Scarlet Devil Cake → pink.

## Normal customers

They order only from tonight's menu. All of them also like `Trend - Popular`.

| Rating | Condition |
|---|---|
| Black | Wrong dish or drink served |
| Green | Requested dish and drink served |
| Orange | Requested dish and drink served, and at least one **added** food tag matches the customer's preferences |
