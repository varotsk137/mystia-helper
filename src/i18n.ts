// UI text in Thai and English. Game data (names, tags, quotes, spell cards) stays in English as on the wiki.
import { useCallback } from "react";
import type { Lang } from "./lang";
import { useStore } from "./store";

export const messages = {
  // Navigation
  "nav.main": { th: "เมนูหลัก", en: "Main menu" },
  "nav.rare": { th: "ลูกค้าแรร์", en: "Rare guests" },
  "nav.progress": { th: "ความคืบหน้า", en: "Progress" },
  "nav.database": { th: "ข้อมูลเกม", en: "Game data" },
  "nav.settings": { th: "ตั้งค่า", en: "Settings" },
  "dlc.base": { th: "เกมหลัก", en: "Base game" },

  // Ratings and budget
  "rating.pink": { th: "ชมพู", en: "Pink" },
  "rating.orange": { th: "ส้ม", en: "Orange" },
  "rating.green": { th: "เขียว", en: "Green" },
  "rating.purple": { th: "ม่วง", en: "Purple" },
  "rating.black": { th: "ดำ", en: "Black" },
  "budget.safe": { th: "ในงบ", en: "In budget" },
  "budget.risky": { th: "อาจเกินงบ", en: "May go over" },
  "budget.over": { th: "เกินงบ", en: "Over budget" },
  "budget.unknown": { th: "ไม่ทราบงบ", en: "Budget unknown" },

  // Rare guest page
  "sort.best": { th: "แนะนำ (เรตติ้ง, งบ, วัตถุดิบน้อย)", en: "Recommended (rating, budget, fewest extras)" },
  "sort.price": { th: "ราคารวม", en: "Total price" },
  "sort.score": { th: "แต้ม", en: "Points" },
  "sort.extras": { th: "จำนวนวัตถุดิบที่เติม", en: "Extra ingredients" },
  "sort.level": { th: "เลเวลสูตร", en: "Recipe level" },
  "sort.cookTime": { th: "เวลาทำ", en: "Cooking time" },
  "sort.name": { th: "ชื่ออาหาร", en: "Dish name" },
  "rare.groupSpecial": { th: "แขกพิเศษ", en: "Special guests" },
  "rare.groupOther": { th: "อื่น ๆ", en: "Other" },
  "rare.noCustomers": {
    th: "ยังไม่มีลูกค้าแรร์ที่พบได้ ตรวจ DLC ที่เลือกไว้ในหน้าตั้งค่า หรือโซนที่ปลดล็อกในหน้าความคืบหน้า",
    en: "No rare guests can appear yet. Check the DLCs in Settings, or the unlocked areas on the Progress page.",
  },
  "rare.order": { th: "ออเดอร์", en: "Order" },
  "rare.customer": { th: "ลูกค้า", en: "Guest" },
  "rare.noDataSuffix": { th: " (ยังไม่มีข้อมูล)", en: " (no data yet)" },
  "rare.budget": { th: "งบ", en: "Budget" },
  "rare.undocumented": {
    th: "Wiki ยังไม่มีข้อมูลรสนิยมของ {name} ใส่ข้อมูลเองได้ที่หน้าข้อมูลเกม",
    en: "The wiki doesn't list {name}'s tastes yet. You can add them on the Game data page.",
  },
  "rare.foodRequest": { th: "ขออาหาร", en: "Food request" },
  "rare.drinkRequest": { th: "ขอเครื่องดื่ม", en: "Drink request" },
  "rare.dislikes": { th: "ไม่ชอบ", en: "Dislikes" },
  "rare.none": { th: "ไม่มี", en: "None" },
  "rare.suggestions": { th: "ชุดที่แนะนำ", en: "Suggested sets" },
  "rare.sortBy": { th: "เรียงตาม", en: "Sort by" },
  "rare.descending": { th: "มากไปน้อย", en: "High to low" },
  "rare.ascending": { th: "น้อยไปมาก", en: "Low to high" },
  "rare.pickRequest": {
    th: "เลือก tag ที่ลูกค้าขอด้านบน ผลลัพธ์จะเรียงให้ตรงกับออเดอร์",
    en: "Pick the tags the guest asks for above to rank sets for that order.",
  },
  "rare.noRecipes": {
    th: "ไม่มีสูตรที่ทำได้ ลองเลือกอุปกรณ์เพิ่มด้านบน หรือปลดล็อกสูตรเพิ่มในหน้าความคืบหน้า",
    en: "No recipe can be made. Pick more cookware above, or unlock more recipes on the Progress page.",
  },
  "rare.points": { th: "{n} แต้ม", en: "{n} pts" },
  "rare.overridden": { th: "ถูก tag อื่นทับ", en: "Overridden by another tag" },
  "rare.with": { th: "กับ", en: "with" },
  "rare.orList": { th: "(หรือ {list})", en: "(or {list})" },
  "rare.oneRequest": { th: "ทำได้แค่ 1 ใน 2 อย่างที่ลูกค้าขอ", en: "Meets only 1 of the 2 requests" },
  "rare.noRequest": { th: "ไม่ตรงกับที่ลูกค้าขอเลย", en: "Meets neither request" },
  "rare.alternatives": { th: "เติมแบบอื่นที่ได้{rating}เหมือนกัน ({n})", en: "Other extras that also get {rating} ({n})" },
  "rare.noExtras": { th: "ไม่ต้องเติม", en: "No extras" },
  "rare.altMeta": { th: "{n} แต้ม, {price}", en: "{n} pts, {price}" },
  "rare.adjusting": { th: "กำลังปรับ", en: "Adjusting" },
  "rare.adjust": { th: "ปรับเอง", en: "Adjust" },
  "rare.ingredientsUsed": { th: "วัตถุดิบที่ใช้", en: "Ingredients used" },
  "rare.ingredients": { th: "วัตถุดิบ", en: "Ingredients" },
  "rare.baseIngredient": { th: "วัตถุดิบตั้งต้นของสูตร", en: "The recipe's own ingredient" },
  "rare.extraIngredient": { th: "วัตถุดิบที่เติม", en: "Added ingredient" },
  "rare.drinks": { th: "เครื่องดื่ม", en: "Drinks" },
  "rare.drinksHint": {
    th: "กด \"ปรับเอง\" ที่ชุดใดชุดหนึ่ง เพื่อเปลี่ยนวัตถุดิบหรือเครื่องดื่มเอง",
    en: "Press \"Adjust\" on a set to change its ingredients or drink yourself.",
  },
  "trend.likesPopular": { th: "ชอบของที่ฮิต", en: "likes popular dishes" },
  "trend.dislikesPopular": { th: "ไม่ชอบของที่ฮิต", en: "dislikes popular dishes" },
  "trend.likesUnpopular": { th: "ชอบของที่ไม่ฮิต", en: "likes unpopular dishes" },
  "trend.dislikesUnpopular": { th: "ไม่ชอบของที่ไม่ฮิต", en: "dislikes unpopular dishes" },
  "trend.and": { th: " และ", en: " and " },
  "trend.taste": { th: "{name} {parts}", en: "{name} {parts}" },
  "trend.noEffect": { th: "Trend ไม่มีผลกับแต้มของ {name}", en: "Trends don't change {name}'s points" },

  // Dish builder
  "builder.title": { th: "จัดชุดเอง", en: "Build your own" },
  "builder.close": { th: "ปิด", en: "Close" },
  "builder.total": { th: "ราคารวม {price} ({budget})", en: "Total {price} ({budget})" },
  "builder.darkMatter": { th: "กลายเป็น Dark Matter เพราะเติม {tags}", en: "Turns into Dark Matter because of {tags}" },
  "builder.remove": { th: "เอา {name} ออก", en: "Remove {name}" },
  "builder.slotsLeft": { th: "เติมได้อีก {n}", en: "{n} more can be added" },
  "builder.full": { th: "ครบ 5 อย่างแล้ว", en: "All 5 slots used" },
  "builder.drink": { th: "เครื่องดื่ม", en: "Drink" },
  "builder.notRequested": { th: ", ไม่ตรงที่ขอ", en: ", not requested" },
  "builder.addIngredient": { th: "เติมวัตถุดิบ", en: "Add an ingredient" },
  "builder.helpfulOnly": { th: "เฉพาะที่ช่วยได้", en: "Helpful only" },
  "builder.noneHelpful": {
    th: "ไม่มีวัตถุดิบที่ช่วยเพิ่มแต้มได้แล้ว เอาติ๊ก \"เฉพาะที่ช่วยได้\" ออกเพื่อดูทั้งหมด",
    en: "No ingredient adds points any more. Untick \"Helpful only\" to see them all.",
  },
  "builder.noNewTags": { th: "ไม่เพิ่ม tag ใหม่", en: "No new tags" },

  // Character-specific reactions (codes come from the solver)
  "note.nitori-cucumber": { th: "Nitori ได้แตงกวา: อย่างน้อยส้ม", en: "Nitori gets cucumber: at least orange" },
  "note.remilia-cake": { th: "Remilia ได้เค้กทรงหมวกตัวเอง: ชมพูเสมอ", en: "Remilia gets the cake shaped like her hat: always pink" },
  "note.koishi-mousse": { th: "Koishi ได้มูสทรงหมวกตัวเอง: ดำเสมอ", en: "Koishi gets the mousse shaped like her hat: always black" },
  "note.medicine-dark-matter": { th: "Medicine ได้ Dark Matter: อย่างน้อยส้ม", en: "Medicine gets Dark Matter: at least orange" },

  // Spell cards
  "spell.title": { th: "สเปลการ์ด", en: "Spell cards" },
  "spell.reward": { th: "รางวัล (ได้เรตติ้งชมพู)", en: "Reward (pink rating)" },
  "spell.punishment": { th: "บทลงโทษ (ได้เรตติ้งดำ)", en: "Punishment (black rating)" },
  "spell.follow-up": { th: "ต่อเนื่อง", en: "Follow-up" },
  "spell.none": { th: "Wiki ยังไม่มีข้อมูลสเปลการ์ดของ {name}", en: "The wiki has no spell card details for {name} yet." },
  "spell.source": { th: "คำอธิบายจาก wiki (ภาษาอังกฤษ)", en: "Descriptions from the wiki" },

  // Order slip parts
  "cookware.label": { th: "อุปกรณ์คืนนี้", en: "Cookware tonight" },
  "cookware.none": { th: "ยังไม่ได้เลือกอุปกรณ์ เลือกอย่างน้อย 1 อย่าง", en: "No cookware picked. Pick at least one." },
  "cookware.count": { th: "ทำได้ {n} สูตร", en: "{n} recipes possible" },
  "quote.search": { th: "ค้นจากคำพูด", en: "Search by quote" },
  "quote.placeholder": { th: "พิมพ์คำที่ลูกค้าพูดในเกม เช่น carnivores", en: "Type words the guest says in-game, e.g. carnivores" },
  "quote.noResults": {
    th: "ไม่พบคำพูดที่มีคำเหล่านี้ ลองพิมพ์คำอื่นจากประโยค",
    en: "No order line has these words. Try other words from the line.",
  },
  "trend.now": { th: "Trend ตอนนี้", en: "Current trends" },
  "trend.nonePicked": { th: "ยังไม่ได้เลือก", en: "None picked" },
  "trend.popular": { th: "ฮิต: {tag}", en: "Popular: {tag}" },
  "trend.unpopular": { th: "ไม่ฮิต: {tag}", en: "Unpopular: {tag}" },
  "trend.done": { th: "เสร็จ", en: "Done" },
  "trend.pick": { th: "เลือก Trend", en: "Pick trends" },
  "trend.clear": { th: "ล้าง", en: "Clear" },
  "trend.hint": {
    th: "ดู Trend จากหนังสือพิมพ์ในเกม แล้วคลิก tag: 1 ครั้ง = ฮิต, 2 ครั้ง = ไม่ฮิต, 3 ครั้ง = ยกเลิก",
    en: "Check the in-game newspaper, then click a tag: once = popular, twice = unpopular, three times = clear.",
  },
  "trend.state.none": { th: "ไม่มี Trend", en: "no trend" },
  "trend.state.popular": { th: "ฮิต", en: "popular" },
  "trend.state.unpopular": { th: "ไม่ฮิต", en: "unpopular" },
  "tagEditor.remove": { th: "ลบ {tag}", en: "Remove {tag}" },
  "tagEditor.add": { th: "+ เพิ่ม", en: "+ Add" },

  // Game data page
  "db.title": { th: "ข้อมูลเกม", en: "Game data" },
  "db.hint": {
    th: "ถ้าข้อมูลจาก wiki ไม่ตรงกับในเกม เลือกรายการแล้วแก้ได้เลย ตัวช่วยจะใช้ค่าที่แก้แทนค่าจาก wiki",
    en: "If the wiki doesn't match the game, pick an item and fix it. The helper then uses your values instead.",
  },
  "db.tab.recipes": { th: "อาหาร", en: "Dishes" },
  "db.tab.beverages": { th: "เครื่องดื่ม", en: "Drinks" },
  "db.tab.ingredients": { th: "วัตถุดิบ", en: "Ingredients" },
  "db.tab.rareCustomers": { th: "ลูกค้าแรร์", en: "Rare guests" },
  "db.editedCount": { th: "แก้ {n}", en: "{n} edited" },
  "db.search": { th: "ค้นหาชื่อ", en: "Search by name" },
  "db.allTags": { th: "ทุก tag", en: "All tags" },
  "db.count": { th: "{n} รายการ", en: "{n} items" },
  "db.edited": { th: "แก้ไขแล้ว", en: "Edited" },
  "db.editing": { th: "แก้ไข {name}", en: "Edit {name}" },
  "db.special": { th: "แขกพิเศษ", en: "Special guest" },
  "db.reset": { th: "คืนค่าทั้งหมดเป็นข้อมูลจาก wiki", en: "Restore all wiki values" },
  "db.pick": { th: "เลือกรายการทางซ้ายเพื่อดูรายละเอียดและแก้ไข", en: "Pick an item on the left to see and edit it." },
  "db.to": { th: "ถึง", en: "to" },
  "field.price": { th: "ราคา", en: "Price" },
  "field.level": { th: "เลเวล", en: "Level" },
  "field.cookTime": { th: "เวลาทำ (วินาที)", en: "Cooking time (s)" },
  "field.cookware": { th: "เครื่องครัว", en: "Cookware" },
  "field.ingredients": { th: "วัตถุดิบตั้งต้น", en: "Base ingredients" },
  "field.tags": { th: "Tag", en: "Tags" },
  "field.bannedTags": { th: "Tag ต้องห้าม (เติมแล้วเป็น Dark Matter)", en: "Banned tags (adding one makes Dark Matter)" },
  "field.alcohol": { th: "ระดับแอลกอฮอล์", en: "Alcohol level" },
  "field.budget": { th: "งบ", en: "Budget" },
  "field.likedFoodTags": { th: "Tag อาหารที่ชอบ", en: "Liked food tags" },
  "field.dislikedFoodTags": { th: "Tag อาหารที่ไม่ชอบ", en: "Disliked food tags" },
  "field.likedDrinkTags": { th: "Tag เครื่องดื่มที่ชอบ", en: "Liked drink tags" },

  // Progress page
  "progress.title": { th: "ความคืบหน้า", en: "Progress" },
  "progress.use": { th: "ใช้ความคืบหน้าในการคำนวณ", en: "Use progress in suggestions" },
  "progress.onHint": {
    th: "ตัวช่วยจะแนะนำเฉพาะสูตร เครื่องดื่ม และวัตถุดิบที่ปลดล็อกแล้ว และแสดงเฉพาะลูกค้าในโซนที่เปิดแล้ว",
    en: "Suggestions use only unlocked recipes, drinks and ingredients, and list only guests from unlocked areas.",
  },
  "progress.offHint": {
    th: "ตอนนี้ตัวช่วยใช้ทุกอย่างจาก DLC ที่มี เปิดสวิตช์นี้เมื่อต้องการให้คำนวณตามสิ่งที่ปลดล็อกในเกมแล้วเท่านั้น",
    en: "Suggestions currently use everything from your DLCs. Turn this on to use only what you've unlocked in the game.",
  },
  "progress.tab.recipes": { th: "สูตรอาหาร", en: "Recipes" },
  "progress.tab.beverages": { th: "เครื่องดื่ม", en: "Drinks" },
  "progress.tab.ingredients": { th: "วัตถุดิบ", en: "Ingredients" },
  "progress.tab.locations": { th: "โซน", en: "Areas" },
  "progress.allDlc": { th: "ทุก DLC", en: "All DLCs" },
  "progress.allLevels": { th: "ทุกเลเวล", en: "All levels" },
  "progress.maxLevel": { th: "ไม่เกิน Lv {n}", en: "Up to Lv {n}" },
  "progress.unlockShown": { th: "ปลดล็อกที่แสดงอยู่ ({n})", en: "Unlock shown ({n})" },
  "progress.lockShown": { th: "ล็อกที่แสดงอยู่", en: "Lock shown" },
  "progress.summary": {
    th: "ปลดล็อกแล้ว {n} จาก {total} คลิกที่รายการเพื่อสลับสถานะ",
    en: "{n} of {total} unlocked. Click an item to toggle it.",
  },
  "progress.empty": {
    th: "ไม่มีรายการที่ตรงกับตัวกรอง ลองล้างคำค้นหาหรือเปลี่ยน DLC",
    en: "Nothing matches the filters. Clear the search or pick another DLC.",
  },

  // Settings page
  "settings.title": { th: "ตั้งค่า", en: "Settings" },
  "settings.language": { th: "ภาษา", en: "Language" },
  "settings.languageHint": {
    th: "ชื่อไอเทม tag คำพูด และสเปลการ์ดเป็นภาษาอังกฤษตาม wiki",
    en: "Item names, tags, quotes and spell cards are in English, as on the wiki.",
  },
  "settings.dlc": { th: "DLC ที่มี", en: "Owned DLCs" },
  "settings.dlcHint": {
    th: "สูตร วัตถุดิบ เครื่องดื่ม และลูกค้าจาก DLC ที่ไม่ได้เลือกจะไม่ถูกนำมาคำนวณ",
    en: "Recipes, ingredients, drinks and guests from unticked DLCs are left out of suggestions.",
  },
  "settings.collabs": { th: "คอลแลบ", en: "Collaborations" },
  "settings.collabsHint": {
    th: "เปิดใช้คอลแลบได้ที่ collaboration terminal ข้างบ้าน Mystia ในเกม ปิดคอลแลบไหน แขก สูตร และเครื่องดื่มของคอลแลบนั้นจะไม่ถูกแนะนำ",
    en: "Collaborations are enabled at the collaboration terminal next to Mystia's house. A disabled collaboration's guests, recipes and drinks aren't suggested.",
  },
  "settings.collabGuests": { th: "แขก: {list}", en: "Guests: {list}" },
  "settings.collabRecipes": { th: "สูตร: {list}", en: "Recipes: {list}" },
  "settings.collabDrinks": { th: "เครื่องดื่ม: {list}", en: "Drinks: {list}" },
  "settings.backup": { th: "สำรองข้อมูล", en: "Backup" },
  "settings.backupHint": {
    th: "ความคืบหน้าในเกมและข้อมูลที่แก้เอง เก็บอยู่ในเครื่องนี้เท่านั้น สำรองไว้ก่อนย้ายเครื่องหรือล้างข้อมูล",
    en: "Your progress and edits are stored on this device only. Back them up before switching devices or clearing data.",
  },
  "settings.copy": { th: "คัดลอกข้อมูลสำรอง", en: "Copy backup" },
  "settings.import": { th: "นำเข้าจากช่องด้านล่าง", en: "Import from the box below" },
  "settings.importPlaceholder": { th: "วางข้อมูลสำรองที่นี่เพื่อนำเข้า", en: "Paste a backup here to import it" },
  "settings.copied": { th: "คัดลอกข้อมูลสำรองแล้ว นำไปวางเก็บในไฟล์ข้อความได้เลย", en: "Backup copied. Paste it into a text file to keep it." },
  "settings.copyFailed": {
    th: "คัดลอกอัตโนมัติไม่ได้ ข้อมูลอยู่ในช่องด้านล่างแล้ว ให้เลือกทั้งหมดแล้วคัดลอกเอง",
    en: "Couldn't copy automatically. The backup is in the box below; select it all and copy it.",
  },
  "settings.imported": { th: "นำเข้าข้อมูลสำรองแล้ว", en: "Backup imported." },
  "settings.importInvalid": {
    th: "ข้อมูลที่วางไม่ใช่ JSON ที่ถูกต้อง ตรวจว่าคัดลอกมาครบทั้งหมด",
    en: "That isn't valid backup JSON. Check that you copied all of it.",
  },
  "settings.data": { th: "ข้อมูลเกม", en: "Game data" },
  "settings.dataFrom": { th: "ดึงจาก", en: "Taken from" },
  "settings.dataWhen": { th: "เมื่อ {date} ถ้า wiki มีข้อมูลใหม่ ให้รัน", en: "on {date}. When the wiki changes, run" },
  "settings.dataThen": { th: "แล้วตามด้วย", en: "followed by" },

  // Footer
  "footer.fan": {
    th: "Mystia Helper เป็นเครื่องมือแฟนเมด ไม่เกี่ยวข้องกับผู้พัฒนาหรือผู้จัดจำหน่ายเกม · Touhou Mystia's Izakaya เป็นผลงานของ 二色幽紫蝶 และ Re零同人社 · Touhou Project เป็นผลงานของ 上海アリス幻樂団",
    en: "Mystia Helper is a fan-made tool, not affiliated with the game's developers or publishers. Touhou Mystia's Izakaya is by 二色幽紫蝶 and Re零同人社; Touhou Project is by 上海アリス幻樂団.",
  },
  "footer.dataFrom": { th: "ข้อมูลเกมดัดแปลงจาก", en: "Game data adapted from" },
  "footer.license": { th: "ภายใต้สัญญาอนุญาต", en: "under" },
  "footer.sameLicense": {
    th: " ข้อมูลที่ดัดแปลงในเว็บนี้เผยแพร่ภายใต้สัญญาอนุญาตเดียวกัน",
    en: ". The adapted data on this site is shared under the same license.",
  },
  "footer.images": {
    th: "ภาพจากเกมเป็นลิขสิทธิ์ของเจ้าของผลงาน ไม่อยู่ภายใต้ CC BY-SA ใช้เพื่ออ้างอิงเท่านั้น หากเจ้าของสิทธิ์ต้องการให้นำออก แจ้งได้ทาง GitHub",
    en: "Images from the game belong to their owners, are not under CC BY-SA, and are used for reference only. Rights holders can ask for removal on GitHub.",
  },
  "footer.source": { th: "ซอร์สโค้ดและแจ้งปัญหา (GitHub)", en: "Source code and issues (GitHub)" },
} satisfies Record<string, Record<Lang, string>>;

export type MessageKey = keyof typeof messages;
export type Translate = (key: MessageKey, vars?: Record<string, string | number>) => string;

export function translate(lang: Lang, key: MessageKey, vars?: Record<string, string | number>): string {
  const text: string = messages[key][lang];
  return vars ? text.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? String(vars[name]) : m)) : text;
}

/** Translator for the current language. */
export function useT(): Translate {
  const lang = useStore().state.lang;
  return useCallback<Translate>((key, vars) => translate(lang, key, vars), [lang]);
}

/** "Base game" / "เกมหลัก" for BaseGame, otherwise "DLC n". */
export function dlcLabel(dlc: string, t: Translate): string {
  return dlc === "BaseGame" ? t("dlc.base") : dlc.replace(/^DLC(\d)$/, "DLC $1");
}
