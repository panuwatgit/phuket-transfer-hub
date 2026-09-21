# Phuket Transfer Hub

เว็บจัดหารถตู้ VIP / SUV / รถเก๋งพร้อมคนขับ (agent model) — ลูกค้าขอราคาผ่านฟอร์ม → แจ้ง LINE แอดมิน → หลังบ้านจัดรถ/ตั้งราคา/ติดตามสถานะ
สเปคทั้งหมดอยู่ใน [PLAN.md](PLAN.md) · prototype ที่อนุมัติอยู่ใน `prototype/`

## Stack
Next.js 16 (App Router) · Tailwind 4 · Prisma 7 + Postgres · LINE Messaging API · ฟอนต์ Kanit/Sarabun

## เริ่มใช้งาน (local)
```bash
pnpm install
createdb phuket_transfer_hub            # หรือชี้ DATABASE_URL ไป DB อื่น
cp .env.example .env                    # แล้วแก้ค่า
npx prisma migrate deploy && npx prisma generate
npx tsx tools/seed-partners.ts          # (ไม่บังคับ) พาร์ทเนอร์ตัวอย่าง 5 ราย
pnpm dev --port 3100
```
- หน้าเว็บ: http://localhost:3100 (ไทย) · http://localhost:3100/en (อังกฤษ) · ฟอร์ม `/request` · เงื่อนไข `/terms`
- ข้อความ 2 ภาษาอยู่ใน `lib/i18n/th.ts` และ `lib/i18n/en.ts` (หลังบ้านเป็นไทยอย่างเดียว)
- หลังบ้าน: http://localhost:3100/admin (รหัสผ่านจาก `ADMIN_PASSWORD`)

## ตั้งค่า LINE (เฟส 1)
1. สร้าง LINE Official Account → เปิด **Messaging API** ใน LINE Developers
2. เอา **Channel access token** และ **Channel secret** ใส่ `.env`
3. ตั้ง **Webhook URL** = `https://<โดเมน>/api/line/webhook` แล้วเปิด "Use webhook" (ปิด auto-reply ของ OA)
4. หา userId ของแอดมิน: แอด OA แล้วส่งข้อความอะไรก็ได้ → ดู log ของ webhook (`source.userId`) → ใส่ `LINE_ADMIN_USER_IDS` (คั่นด้วยจุลภาคได้หลายคน)
5. ตั้ง `NEXT_PUBLIC_LINE_OA_ID` เป็นไอดี OA เช่น `@phukettransfer` (ใช้ทำปุ่ม "ส่งเข้า LINE")

ยังไม่ตั้งค่า = ระบบยังใช้ได้ทุกอย่าง แค่แจ้งเตือนจะ log ลง console แทน

## แก้ค่าธุรกิจ
ทุกอย่างอยู่ใน [lib/config.ts](lib/config.ts): ชื่อ/สโลแกน/เบอร์/เวลาทำการ, ประเภทรถ+ที่นั่ง, บริการ, OT/ชั่วโมงเหมา, จังหวัด, นโยบายชำระ/ยกเลิก, เส้นทางยอดนิยม, FAQ

## โครงสร้าง
```
app/                 หน้าเว็บ + หลังบ้าน (app/admin) + webhook (app/api/line/webhook)
components/site      หน้าแรก · components/request ฟอร์ม · components/admin หลังบ้าน
lib/                 config · prisma · line · auth · validation · request-view (ข้อความ LINE/เส้นทาง)
prisma/              schema + migrations · tools/ seed scripts
```

## Deploy (Railway)
1 service (Next.js) + 1 Postgres · ตั้ง env ตาม `.env.example` · Build: `pnpm build` · Start: `npx prisma migrate deploy && pnpm start`
