import type { ReactNode } from "react";
import type { Ingredient } from "../data";
import { useT } from "../i18n";
import { MAX_INGREDIENTS } from "../solver/tags";
import { ItemImage } from "./ItemImage";
import { Popover } from "./Popover";

export interface ShelfItem {
  name: string;
  ingredient: Ingredient | undefined;
  /** "base": part of the recipe; "extra": added on top, shown on a pink tile like the game's. */
  kind: "base" | "extra";
  /** Marks the tile: other ingredients give the same dish in this slot. */
  hasSubs?: boolean;
  /** Makes the tile open a menu (in place of the tooltip), with `close` to shut it after a choice. */
  menu?: (close: () => void) => ReactNode;
}

/**
 * The pot as the game shows it: five slots on a tray, the recipe's ingredients on plain tiles and the added
 * ones on pink tiles. Filled tiles explain themselves on hover, or open their `menu`; `renderEmpty` draws each
 * empty slot. `small` is a compact, non-interactive version for lists.
 */
export function IngredientShelf({
  items,
  small = false,
  liked = [],
  disliked = [],
  renderEmpty,
}: {
  items: ShelfItem[];
  small?: boolean;
  /** The guest's liked and disliked tags, to colour the tags in the tooltips. */
  liked?: string[];
  disliked?: string[];
  renderEmpty?: (index: number) => ReactNode;
}) {
  const t = useT();
  const empty = Math.max(0, MAX_INGREDIENTS - items.length);
  return (
    <span className={`shelf ${small ? "shelf-small" : ""}`} aria-label={t("rare.ingredientsUsed")}>
      {items.map((item, i) => {
        const cls = `slot slot-${item.kind}${item.hasSubs ? " has-subs" : ""}`;
        if (small)
          return (
            <span key={i} className={cls} title={item.name}>
              <ItemImage src={item.ingredient?.image} name={item.name} size={22} />
            </span>
          );
        if (item.menu)
          return (
            <Popover
              key={i}
              label={item.name}
              buttonClassName={cls}
              buttonTitle={item.name}
              button={<ItemImage src={item.ingredient?.image} name={item.name} size={34} />}
            >
              {item.menu}
            </Popover>
          );
        return (
          <span key={i} className={`${cls} slot-tip-host`} tabIndex={0} aria-label={item.name}>
            <ItemImage src={item.ingredient?.image} name={item.name} size={34} />
            <span className="slot-tip" role="tooltip">
              <SlotInfo item={item} liked={liked} disliked={disliked} />
            </span>
          </span>
        );
      })}
      {Array.from({ length: empty }, (_, i) =>
        !small && renderEmpty ? (
          <span key={`empty-${i}`} className="slot-empty-host">
            {renderEmpty(i)}
          </span>
        ) : (
          <span key={`empty-${i}`} className="slot slot-empty" aria-hidden />
        ),
      )}
    </span>
  );
}

/** An ingredient's picture, name, role in the pot and tags, coloured by what the guest likes. */
export function SlotInfo({ item, liked, disliked }: { item: ShelfItem; liked: string[]; disliked: string[] }) {
  const t = useT();
  const ing = item.ingredient;
  return (
    <span className="slot-info">
      <span className="slot-tip-head">
        <ItemImage src={ing?.image} name={item.name} size={30} />
        <span>
          <strong>{item.name}</strong>
          <span className={`slot-tip-role ${item.kind === "extra" ? "is-extra" : ""}`}>
            {item.kind === "base" ? t("slot.base") : `✦ ${t("slot.extra", { price: ing?.price ?? "?" })}`}
          </span>
        </span>
      </span>
      {ing && ing.tags.length > 0 && (
        <span className="slot-tip-tags">
          {ing.tags.map((tag) => (
            <span
              key={tag}
              className={`tag ${liked.includes(tag) ? "tag-liked" : disliked.includes(tag) ? "tag-disliked" : "tag-neutral"}`}
            >
              {tag}
            </span>
          ))}
        </span>
      )}
    </span>
  );
}
