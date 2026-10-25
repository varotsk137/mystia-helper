import { useState } from "react";
import { gameData, type Dlc } from "../data";
import { normalizeState, useStore } from "../store";
import { ExternalLink } from "../components/ExternalLink";
import { dlcLabel, useT, type MessageKey } from "../i18n";
import { LANGS } from "../lang";

export function SettingsPage() {
  const t = useT();
  const { state, setOwnedDlcs, setCollabs, setLang, replaceState } = useStore();
  const toggle = (dlc: Dlc) => {
    const owned = state.ownedDlcs.includes(dlc);
    setOwnedDlcs(owned ? state.ownedDlcs.filter((d) => d !== dlc) : [...state.ownedDlcs, dlc]);
  };

  return (
    <div className="page">
      <header className="page-head">
        <h1>{t("settings.title")}</h1>
      </header>

      <section className="panel">
        <h2>{t("settings.language")}</h2>
        <div className="dlc-list" role="radiogroup" aria-label={t("settings.language")}>
          {LANGS.map((l) => (
            <label key={l.id} className="check" lang={l.id}>
              <input type="radio" name="lang" checked={state.lang === l.id} onChange={() => setLang(l.id)} />
              {l.label}
            </label>
          ))}
        </div>
        <p className="hint">{t("settings.languageHint")}</p>
      </section>

      <section className="panel">
        <h2>{t("settings.dlc")}</h2>
        <p className="hint">{t("settings.dlcHint")}</p>
        <div className="dlc-list">
          {gameData.meta.dlcs.map((dlc) => (
            <label key={dlc} className="check">
              <input
                type="checkbox"
                checked={state.ownedDlcs.includes(dlc)}
                disabled={dlc === "BaseGame"}
                onChange={() => toggle(dlc)}
              />
              {dlcLabel(dlc, t)}
            </label>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>{t("settings.collabs")}</h2>
        <p className="hint">{t("settings.collabsHint")}</p>
        <ul className="collab-list">
          {gameData.collaborations.map((c) => {
            const on = state.collabs.includes(c.id);
            return (
              <li key={c.id}>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => setCollabs(on ? state.collabs.filter((id) => id !== c.id) : [...state.collabs, c.id])}
                  />
                  {c.name}
                </label>
                <div className="collab-contents">
                  <span>{t("settings.collabGuests", { list: c.customers.join(", ") })}</span>
                  {c.recipes.length > 0 && <span>{t("settings.collabRecipes", { list: c.recipes.join(", ") })}</span>}
                  {c.beverages.length > 0 && <span>{t("settings.collabDrinks", { list: c.beverages.join(", ") })}</span>}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <BackupPanel json={JSON.stringify(state)} onImport={(raw) => replaceState(normalizeState(raw))} />

      <section className="panel">
        <h2>{t("settings.data")}</h2>
        <p className="hint">
          {t("settings.dataFrom")} <ExternalLink href={gameData.meta.source}>Touhou Mystia's Izakaya Wiki</ExternalLink>{" "}
          {t("settings.dataWhen", {
            date: new Date(gameData.meta.fetchedAt).toLocaleString(state.lang === "th" ? "th-TH" : "en-GB"),
          })}{" "}
          <code>npm run data:fetch</code> {t("settings.dataThen")} <code>npm run data:build</code>
        </p>
      </section>
    </div>
  );
}

function BackupPanel({ json, onImport }: { json: string; onImport: (raw: unknown) => void }) {
  const t = useT();
  const [text, setText] = useState("");
  // A message key rather than text, so it follows a language change.
  const [message, setMessage] = useState<MessageKey | null>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setMessage("settings.copied");
    } catch {
      setText(json);
      setMessage("settings.copyFailed");
    }
  };
  const restore = () => {
    try {
      onImport(JSON.parse(text));
      setText("");
      setMessage("settings.imported");
    } catch {
      setMessage("settings.importInvalid");
    }
  };

  return (
    <section className="panel">
      <h2>{t("settings.backup")}</h2>
      <p className="hint">{t("settings.backupHint")}</p>
      <div className="button-row">
        <button className="btn" onClick={copy}>
          {t("settings.copy")}
        </button>
        <button className="btn" onClick={restore} disabled={!text.trim()}>
          {t("settings.import")}
        </button>
      </div>
      <textarea
        className="backup-text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("settings.importPlaceholder")}
        rows={4}
      />
      {message && <p className="hint">{t(message)}</p>}
    </section>
  );
}
