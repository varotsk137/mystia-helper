import { useState } from "react";

/** Wiki icon or portrait, falling back to the item's initials when there is no image. */
export function ItemImage({
  src,
  name,
  size = 40,
  variant = "icon",
}: {
  src: string | null | undefined;
  name: string;
  size?: number;
  variant?: "icon" | "portrait";
}) {
  const [failed, setFailed] = useState(false);
  const style = { width: size, height: variant === "portrait" ? Math.round(size * 1.4) : size };
  if (!src || failed) {
    const initials = name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
    return (
      <span className={`item-image item-image-fallback item-image-${variant}`} style={style} aria-hidden>
        {initials}
      </span>
    );
  }
  return (
    <img
      className={`item-image item-image-${variant}`}
      src={`/${src}`}
      alt=""
      style={style}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
