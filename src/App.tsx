import { useState } from "react";
import { RareSolverPage } from "./pages/RareSolverPage";
import { ProgressPage } from "./pages/ProgressPage";
import { DatabasePage } from "./pages/DatabasePage";
import { SettingsPage } from "./pages/SettingsPage";
import { SiteFooter } from "./components/SiteFooter";
import { useT, type MessageKey } from "./i18n";
import { LANGS } from "./lang";
import { useStore } from "./store";

type Page = "rare" | "progress" | "database" | "settings";

const PAGES: { id: Page; label: MessageKey; icon: string }[] = [
  { id: "rare", label: "nav.rare", icon: "🏮" },
  { id: "progress", label: "nav.progress", icon: "🗝" },
  { id: "database", label: "nav.database", icon: "📖" },
  { id: "settings", label: "nav.settings", icon: "⚙" },
];

export default function App() {
  const [page, setPage] = useState<Page>("rare");
  const t = useT();
  const { state, setLang } = useStore();
  return (
    <div className="shell">
      <nav className="rail" aria-label={t("nav.main")}>
        <div className="rail-brand" title="Mystia Helper">
          夜雀
        </div>
        {PAGES.map((p) => (
          <button
            key={p.id}
            className="rail-item"
            aria-current={page === p.id ? "page" : undefined}
            onClick={() => setPage(p.id)}
          >
            <span className="rail-icon" aria-hidden>
              {p.icon}
            </span>
            <span className="rail-label">{t(p.label)}</span>
          </button>
        ))}
        <div className="rail-lang" role="group" aria-label={t("settings.language")}>
          {LANGS.map((l) => (
            <button key={l.id} aria-pressed={state.lang === l.id} lang={l.id} onClick={() => setLang(l.id)}>
              {l.id.toUpperCase()}
            </button>
          ))}
        </div>
      </nav>
      <main className="main">
        {page === "rare" && <RareSolverPage />}
        {page === "progress" && <ProgressPage />}
        {page === "database" && <DatabasePage />}
        {page === "settings" && <SettingsPage />}
        <SiteFooter />
      </main>
    </div>
  );
}
