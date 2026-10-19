import { useState } from "react";
import { RareSolverPage } from "./pages/RareSolverPage";
import { SettingsPage } from "./pages/SettingsPage";

type Page = "rare" | "settings";

const PAGES: { id: Page; label: string; icon: string }[] = [
  { id: "rare", label: "ลูกค้าแรร์", icon: "🏮" },
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
      <main className="main">{page === "rare" ? <RareSolverPage /> : <SettingsPage />}</main>
    </div>
  );
}
