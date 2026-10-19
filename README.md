# Mystia Helper

แอปตัวช่วยสำหรับเกม Touhou Mystia's Izakaya สร้างด้วย Tauri 2 + React + TypeScript

## ฟีเจอร์

- **ลูกค้าแรร์**: เลือกลูกค้าและ tag ที่ลูกค้าขอ แล้วแอปจะแนะนำชุดอาหาร วัตถุดิบที่ควรเติม และเครื่องดื่ม พร้อมเรตติ้งที่คาดว่าจะได้และสถานะงบ
  - แสดงวัตถุดิบทดแทนที่ให้ผลเหมือนกัน, ชุดวัตถุดิบเติมแบบอื่นที่ได้เรตติ้งเท่ากัน และเครื่องดื่มอื่นที่ได้ผลเท่ากัน
- **ตั้งค่า**: เลือก DLC ที่มี

กฎการคำนวณอยู่ใน [docs/game-mechanics.md](docs/game-mechanics.md)

## การพัฒนา

ต้องมี Node.js, Rust และ Visual Studio Build Tools (C++)

```bash
npm install
npm run tauri dev   # เปิดเป็นแอปเดสก์ท็อป
npm run dev         # เปิดในเบราว์เซอร์ที่ http://localhost:1420
npm test            # unit test ของตัวคำนวณ
npm run tauri build # สร้างไฟล์ติดตั้ง
```

## ข้อมูลเกม

ข้อมูลมาจาก Lua data module ของ [Touhou Mystia's Izakaya Wiki](https://touhou-mystias-izakaya.fandom.com) ผ่าน MediaWiki API

```bash
npm run data:fetch  # ดาวน์โหลด module ล่าสุดลง data/wiki-raw/
npm run data:build  # แปลงเป็น src/data/gamedata.json และเขียนรายงานที่ data/wiki-report.md
```

`data:build` จะแก้ชื่อ tag/สถานที่ที่สะกดไม่ตรงกันบน wiki และบันทึกทุกจุดที่แก้ไว้ในรายงาน
