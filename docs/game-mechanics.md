# Game mechanics used by the helper

Sources:

- the wiki's `Customers` and `Tags` pages (https://touhou-mystias-izakaya.fandom.com), read 2026-10-19;
- my own play, marked *observed in-game*. These come from a few tests each, so they can be wrong;
- the scorer of [izakaya.cc](https://izakaya.cc), where noted (see
  [issue #1](https://github.com/varotsk137/mystia-helper/issues/1)).

## Dish tags

A served dish's tag set is built as:

1. Recipe's own tags (`recipes[].tags`).
2. Plus every tag of every **extra** ingredient added by the player.
3. Plus `Large Portion` if an **extra** ingredient brings the dish to **5 ingredients total**.
   Recipes whose base already has 5 ingredients do not get it automatically.
4. Plus `Trend - Popular` if the dish carries any tag the newspaper currently marks as popular, and
   `Trend - Unpopular` likewise. Several tags can be popular or unpopular at the same time; the player
   picks them in the app. While the shop is a Famous Shop (Aya's reward spell card), `Signature` is a
   popular trend too; the player marks it in the trend picker.
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
- Adding ingredients does not change the dish price (*observed in-game*).
- Cookware has a hidden tag used only for album search; customers never request it.

Beverages cannot be modified; their tags (including alcohol level) are fixed.

## Rare customers and special guests

The customer requests **one food tag** and **one drink tag**.

Score:

- +1 per tag on the dish that the customer likes
- +1 per tag on the drink that the customer likes
- −1 per tag on the dish that the customer dislikes
- A Dark Matter dish scores 0 and never fulfils the food request, so only the drink counts.

Rating from score, capped by how many of the two requested tags were fulfilled:

| Score | Rating | Cap |
|---|---|---|
| ≤ 0 | Black (punishment spell card) | |
| 1 | Purple | max if neither request fulfilled |
| 2 | Green | |
| 3 | Orange | max if only one request fulfilled |
| ≥ 4 | Pink (reward spell card) | |

If **both** requested tags are fulfilled, the rating is at least **Green**, however low the score.

A dish carrying **any tag the guest dislikes** is capped at **Orange**, however high the score
(*observed in-game*: a dish with a disliked tag stopped at Orange). Not settled: izakaya.cc has no such
cap, and there each disliked tag only takes away 1 point, so such a dish can still reach Pink. To settle it, serve
a dish that meets both requests and carries one disliked tag but still scores 5 or more; Pink means the
cap is wrong.

Other rules:

- Going over budget: the customer pays what they can and leaves; if it is far over, they may trigger the punishment card.
- Night Sparrow cookware with Hyper mode or a perfect Sparrow Tune: requested tags are ignored and the guest
  rates the dish by their own preferences. This covers the drink request too (*observed in-game*). Only Mystia cooking triggers it (not a partner chef), and this
  cookware cooks 25% slower. The app's "ignore requests" switch models this. There is no Green floor in
  this mode, and a Dark Matter dish doesn't get the effect: its requests count as usual.
- Special cases (override everything above). A Dark Matter dish is no longer its recipe or ingredients, so
  only Medicine's rule applies to it.
  - Koishi + Unconscious Youkai Mousse → black.
  - Nitori + anything containing Cucumber → at least orange.
  - Momiji + anything containing Cocoa Bean → at most purple.
  - Medicine + Dark Matter → orange.
  - Remilia + Scarlet Devil Cake → pink.
  - Yuuma + Deep Fried Tofu → orange.
  - Marisa + Two-flavor Beef Hotpot → pink.
  - Toyohime or Yorihime + Peach Braised Pork → black.

The Green floor, the Dark Matter score, the Night Sparrow exception for Dark Matter and the Momiji, Yuuma,
Marisa and Watatsuki rules follow the scorer of [izakaya.cc](https://izakaya.cc) (checked 2026-10-31); the
wiki doesn't list them.

## Normal customers

They order only from tonight's menu. All of them also like `Trend - Popular`.

| Rating | Condition |
|---|---|
| Black | Wrong dish or drink served |
| Green | Requested dish and drink served |
| Orange | Requested dish and drink served, and at least one **added** food tag matches the customer's preferences |
