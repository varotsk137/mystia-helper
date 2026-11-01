import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";

const CLOSE_DELAY_MS = 180;
const EDGE_GAP = 8;

/** Right edge of the content area of the nearest scrolling ancestor (inside its scrollbar), or of the window. */
function rightEdge(el: HTMLElement): number {
  for (let p = el.parentElement; p; p = p.parentElement) {
    if (getComputedStyle(p).overflowX !== "visible") return p.getBoundingClientRect().left + p.clientLeft + p.clientWidth;
  }
  return document.documentElement.clientWidth;
}

/**
 * A button with a panel under it. Hovering opens the panel while the pointer stays on the button or the panel;
 * clicking keeps it open until another click, a click outside or Escape. The panel's content renders only
 * while it is open.
 */
export function Popover({
  label,
  button,
  buttonClassName,
  buttonTitle,
  disabled = false,
  className = "",
  children,
}: {
  /** Names the panel for screen readers. */
  label: string;
  button: ReactNode;
  buttonClassName?: string;
  buttonTitle?: string;
  disabled?: boolean;
  className?: string;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState<"hover" | "click" | null>(null);
  const anchor = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const id = useId();
  const close = () => setOpen(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!anchor.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  // Keep the panel inside its scroll area: shift it left when it would run past the right edge.
  useLayoutEffect(() => {
    const el = panel.current;
    if (!el) return;
    el.style.left = "";
    const overflow = el.getBoundingClientRect().right - (rightEdge(el) - EDGE_GAP);
    if (overflow > 0) el.style.left = `${-overflow}px`;
  }, [open]);

  const enter = () => {
    if (disabled) return;
    window.clearTimeout(timer.current);
    setOpen((o) => o ?? "hover");
  };
  const leave = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen((o) => (o === "hover" ? null : o)), CLOSE_DELAY_MS);
  };

  return (
    <span className={`popover-anchor ${className}`} ref={anchor} onMouseEnter={enter} onMouseLeave={leave}>
      <button
        type="button"
        className={buttonClassName}
        title={buttonTitle}
        disabled={disabled}
        aria-expanded={!!open}
        aria-controls={open ? id : undefined}
        aria-haspopup="dialog"
        onClick={() => setOpen((o) => (o === "click" ? null : "click"))}
      >
        {button}
      </button>
      {open && (
        <div id={id} ref={panel} className="popover" role="dialog" aria-label={label}>
          {children(close)}
        </div>
      )}
    </span>
  );
}
