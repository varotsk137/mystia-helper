import { useState } from "react";
import { RareSolverPage } from "./pages/RareSolverPage";
import { ProgressPage } from "./pages/ProgressPage";
import { DatabasePage } from "./pages/DatabasePage";
import { SettingsPage } from "./pages/SettingsPage";
import { SiteFooter } from "./components/SiteFooter";

type Page = "rare" | "progress" | "database" | "settings";

const PAGES: { id: Page; label: string; icon: string }[] = [
  { id: "rare", label: "ลูกค้าแรร์", icon: "🏮" },
  { id: "progress", label: "ความคืบหน้า", icon: "🗝" },
  { id: "database", label: "ข้อมูลเกม", icon: "📖" },
  { id: "settings", label: "ตั้งค่า", icon: "⚙" },
];

export default function App() {
  const [page, setPage] = useState<Page>("rare");
  return (
    <div className="shell">
      <nav className="rail" aria-label="เมนูหลัก">
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
            <span className="rail-label">{p.label}</span>
          </button>
        ))}
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
