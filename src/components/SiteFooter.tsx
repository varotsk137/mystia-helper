// Credits and licensing shown under every page. The wiki text is CC BY-SA 3.0 (so is our derived data);
// the game's images are not, so their notice only appears in builds that ship them.
import { gameData } from "../data";
import { ExternalLink } from "./ExternalLink";
import { SHOW_IMAGES } from "./ItemImage";
import { useT } from "../i18n";

const REPO_URL = "https://github.com/varotsk137/mystia-helper";
const CC_BY_SA_URL = "https://creativecommons.org/licenses/by-sa/3.0/";

export function SiteFooter() {
  const t = useT();
  return (
    <footer className="site-footer">
      <p>{t("footer.fan")}</p>
      <p>
        {t("footer.dataFrom")} <ExternalLink href={gameData.meta.source}>Touhou Mystia's Izakaya Wiki</ExternalLink>{" "}
        {t("footer.license")} <ExternalLink href={CC_BY_SA_URL}>CC BY-SA 3.0</ExternalLink>
        {t("footer.sameLicense")}
      </p>
      {SHOW_IMAGES && (
        <p>{t("footer.images")}</p>
      )}
      <p>
        <ExternalLink href={REPO_URL}>{t("footer.source")}</ExternalLink>
      </p>
    </footer>
  );
}
