import { DLC_LABELS, gameData, type Dlc } from "../data";
import { useSettings } from "../settings";
import { ExternalLink } from "../components/ExternalLink";

export function SettingsPage() {
  const { settings, update } = useSettings();
  const toggle = (dlc: Dlc) => {
    const owned = settings.ownedDlcs.includes(dlc);
    update({ ownedDlcs: owned ? settings.ownedDlcs.filter((d) => d !== dlc) : [...settings.ownedDlcs, dlc] });
  };

  return (
    <div className="page">
      <header className="page-head">
        <h1>ตั้งค่า</h1>
      </header>

      <section className="panel">
        <h2>DLC ที่มี</h2>
        <p className="hint">สูตร วัตถุดิบ เครื่องดื่ม และลูกค้าจาก DLC ที่ไม่ได้เลือกจะไม่ถูกนำมาคำนวณ</p>
        <div className="dlc-list">
          {gameData.meta.dlcs.map((dlc) => (
            <label key={dlc} className="check">
              <input
                type="checkbox"
                checked={settings.ownedDlcs.includes(dlc)}
                disabled={dlc === "BaseGame"}
                onChange={() => toggle(dlc)}
              />
              {DLC_LABELS[dlc]}
            </label>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>ข้อมูลเกม</h2>
        <p className="hint">
          ดึงจาก{" "}
          <ExternalLink href={gameData.meta.source}>Touhou Mystia's Izakaya Wiki</ExternalLink>{" "}
          เมื่อ {new Date(gameData.meta.fetchedAt).toLocaleString("th-TH")} ถ้า wiki มีข้อมูลใหม่ ให้รัน{" "}
          <code>npm run data:fetch</code> แล้วตามด้วย <code>npm run data:build</code>
        </p>
      </section>
    </div>
  );
}
