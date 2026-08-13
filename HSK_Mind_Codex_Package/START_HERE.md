# HSK Mind — START HERE FOR CODEX

อ่าน `HSK_Mind_Codex_Spec.md` ทั้งฉบับก่อนเริ่มแก้โค้ด และใช้ภาพใน `design-reference/` เป็น Source of Truth ด้าน UX/UI

## เป้าหมายแรก

สร้าง MVP ตามลำดับ ไม่ทำทุกอย่างพร้อมกัน:

1. ตรวจ repository ปัจจุบันและสรุปสิ่งที่มี/ขาด
2. Scaffold monorepo: Next.js web + NestJS API + PostgreSQL/Prisma
3. สร้าง Prisma schema/migrations/seed HSK1–4
4. ทำ Register/Login/Onboarding และ HSK1 initial unlock
5. ทำ Vocabulary + Persistent Stage Engine (Pinyin A–Z, 20 คำ/Stage)
6. ทำ Core Loop แรก: Flashcard + Quiz + XP/Stars/Progress/Review tracking
7. จึงขยาย Listening, Matching, Review, Unlock, Daily Mission, Ranking, Mascot, Admin ตาม Phase ใน Spec

## กฎห้ามผิด

- ห้าม redesign UX/UI เอง
- ห้าม Client คำนวณหรือกำหนด XP/Stars/Unlock/Ranking
- ห้ามแจก XP ซ้ำจาก replay ที่ไม่เข้าเงื่อนไข
- ห้าม reset Total XP/Level/Stars/Progress เมื่อเปลี่ยนเดือน
- ห้าม regenerate Stage mapping อัตโนมัติหลัง Production
- Balance values ต้องอยู่ใน config/database และมี test

## Stack

- Frontend: Next.js App Router + TypeScript + Tailwind CSS + TanStack Query
- Backend: NestJS + TypeScript + REST/OpenAPI
- Database: PostgreSQL + Prisma ORM
- Testing: Unit/Integration + Playwright E2E
- Local: pnpm workspaces + Docker Compose PostgreSQL

เริ่มงานโดยเสนอ implementation plan ของ Phase 0–1 และ Prisma schema ก่อน จากนั้นจึงลงมือสร้างโค้ดทีละส่วน
