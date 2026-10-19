import type { ReactNode } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";

const inTauri = "__TAURI_INTERNALS__" in window;

/** Opens in the system browser under Tauri, or a new tab in a plain browser. */
export function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => {
        if (!inTauri) return;
        e.preventDefault();
        void openUrl(href);
      }}
    >
      {children}
    </a>
  );
}
