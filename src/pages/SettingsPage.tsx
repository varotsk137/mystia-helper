import { useState } from "react";
import { DLC_LABELS, gameData, type Dlc } from "../data";
import { normalizeState, useStore } from "../store";
import { ExternalLink } from "../components/ExternalLink";

export function SettingsPage() {
  const { state, setOwnedDlcs, replaceState } = useStore();
  const toggle = (dlc: Dlc) => {
    const owned = state.ownedDlcs.includes(dlc);
    setOwnedDlcs(owned ? state.ownedDlcs.filter((d) => d !== dlc) : [...state.ownedDlcs, dlc]);
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
                checked={state.ownedDlcs.includes(dlc)}
                disabled={dlc === "BaseGame"}
                onChange={() => toggle(dlc)}
              />
              {DLC_LABELS[dlc]}
            </label>
          ))}
        </div>
      </section>

      <BackupPanel json={JSON.stringify(state)} onImport={(raw) => replaceState(normalizeState(raw))} />

      <section className="panel">
        <h2>ข้อมูลเกม</h2>
        <p className="hint">
          ดึงจาก <ExternalLink href={gameData.meta.source}>Touhou Mystia's Izakaya Wiki</ExternalLink> เมื่อ{" "}
          {new Date(gameData.meta.fetchedAt).toLocaleString("th-TH")} ถ้า wiki มีข้อมูลใหม่ ให้รัน{" "}
          <code>npm run data:fetch</code> แล้วตามด้วย <code>npm run data:build</code>
        </p>
      </section>
    </div>
  );
}

function BackupPanel({ json, onImport }: { json: string; onImport: (raw: unknown) => void }) {
  const [text, setText] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setMessage("คัดลอกข้อมูลสำรองแล้ว นำไปวางเก็บในไฟล์ข้อความได้เลย");
    } catch {
      setText(json);
      setMessage("คัดลอกอัตโนมัติไม่ได้ ข้อมูลอยู่ในช่องด้านล่างแล้ว ให้เลือกทั้งหมดแล้วคัดลอกเอง");
    }
  };
  const restore = () => {
    try {
      onImport(JSON.parse(text));
      setText("");
      setMessage("นำเข้าข้อมูลสำรองแล้ว");
    } catch {
      setMessage("ข้อมูลที่วางไม่ใช่ JSON ที่ถูกต้อง ตรวจว่าคัดลอกมาครบทั้งหมด");
    }
  };

  return (
    <section className="panel">
      <h2>สำรองข้อมูล</h2>
      <p className="hint">ความคืบหน้าในเกมและข้อมูลที่แก้เอง เก็บอยู่ในเครื่องนี้เท่านั้น สำรองไว้ก่อนย้ายเครื่องหรือล้างข้อมูล</p>
      <div className="button-row">
        <button className="btn" onClick={copy}>
          คัดลอกข้อมูลสำรอง
        </button>
        <button className="btn" onClick={restore} disabled={!text.trim()}>
          นำเข้าจากช่องด้านล่าง
        </button>
      </div>
      <textarea
        className="backup-text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="วางข้อมูลสำรองที่นี่เพื่อนำเข้า"
        rows={4}
      />
      {message && <p className="hint">{message}</p>}
    </section>
  );
}
