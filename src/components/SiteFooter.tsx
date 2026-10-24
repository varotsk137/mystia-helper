// Credits and licensing shown under every page. The wiki text is CC BY-SA 3.0 (so is our derived data);
// the game's images are not, so their notice only appears in builds that ship them.
import { gameData } from "../data";
import { ExternalLink } from "./ExternalLink";
import { SHOW_IMAGES } from "./ItemImage";

const REPO_URL = "https://github.com/varotsk137/mystia-helper";
const CC_BY_SA_URL = "https://creativecommons.org/licenses/by-sa/3.0/";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>
        Mystia Helper เป็นเครื่องมือแฟนเมด ไม่เกี่ยวข้องกับผู้พัฒนาหรือผู้จัดจำหน่ายเกม · Touhou Mystia's Izakaya
        เป็นผลงานของ 二色幽紫蝶 และ Re零同人社 · Touhou Project เป็นผลงานของ 上海アリス幻樂団
      </p>
      <p>
        ข้อมูลเกมดัดแปลงจาก <ExternalLink href={gameData.meta.source}>Touhou Mystia's Izakaya Wiki</ExternalLink>{" "}
        ภายใต้สัญญาอนุญาต <ExternalLink href={CC_BY_SA_URL}>CC BY-SA 3.0</ExternalLink>{" "}
        ข้อมูลที่ดัดแปลงในเว็บนี้เผยแพร่ภายใต้สัญญาอนุญาตเดียวกัน
      </p>
      {SHOW_IMAGES && (
        <p>ภาพจากเกมเป็นลิขสิทธิ์ของเจ้าของผลงาน ไม่อยู่ภายใต้ CC BY-SA ใช้เพื่ออ้างอิงเท่านั้น หากเจ้าของสิทธิ์ต้องการให้นำออก แจ้งได้ทาง GitHub</p>
      )}
      <p>
        <ExternalLink href={REPO_URL}>ซอร์สโค้ดและแจ้งปัญหา (GitHub)</ExternalLink>
      </p>
    </footer>
  );
}
