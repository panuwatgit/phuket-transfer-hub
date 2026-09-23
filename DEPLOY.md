# Deploy — Railway (โดเมนฟรีก่อน แล้วค่อยต่อโดเมนจริง)

## 1. ขึ้น GitHub
```bash
gh repo create phuket-transfer-hub --private --source=. --push      # ถ้ามี gh CLI
# หรือสร้าง repo ว่างบน github.com แล้ว:
git remote add origin https://github.com/<user>/phuket-transfer-hub.git
git push -u origin main
```

## 2. Railway
1. railway.app → **New Project → Deploy from GitHub repo** → เลือก repo นี้
2. ในโปรเจกต์กด **+ New → Database → PostgreSQL** (Railway ใส่ `DATABASE_URL` ให้เอง ถ้าไม่มีให้ตั้งเป็น `${{Postgres.DATABASE_URL}}`)
3. เปิด service ของเว็บ → **Settings → Networking → Generate Domain** → ได้ `https://xxx.up.railway.app`
4. **Variables** → ใส่ค่าตามตารางข้างล่าง → Deploy ใหม่

`railway.json` ตั้งไว้แล้ว: pre-deploy รัน `prisma migrate deploy` (สร้างตารางอัตโนมัติ) · healthcheck `/api/health`

## 3. Variables ที่ต้องตั้ง
| คีย์ | ค่า |
|---|---|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
| `NEXT_PUBLIC_SITE_URL` | โดเมนที่ Railway ให้ (ไม่มี / ท้าย) |
| `ADMIN_PASSWORD` | **ตั้งใหม่ ไม่ซ้ำของ local** |
| `AUTH_SECRET` | สุ่มใหม่: `openssl rand -base64 32` |
| `LINE_CHANNEL_ACCESS_TOKEN` / `LINE_CHANNEL_SECRET` / `LINE_ADMIN_USER_IDS` | จาก Messaging API channel |
| `NEXT_PUBLIC_LINE_OA_ID` | `@024tyswy` |
| `LINE_LOGIN_CHANNEL_ID` / `LINE_LOGIN_CHANNEL_SECRET` | จาก LINE Login channel |
| `GOOGLE_MAPS_API_KEY` | key Places API (New) |
| `RECEIPT_ISSUER_NAME` / `RECEIPT_TAX_ID` / `RECEIPT_ADDRESS` | ข้อมูลบนใบเสร็จ |
| `RESEND_API_KEY` / `EMAIL_FROM` | (ไม่บังคับ) |

## 4. ตั้งค่าฝั่ง LINE ให้ชี้โดเมนใหม่
- Messaging API → **Webhook URL** = `https://<โดเมน>/api/line/webhook` → Verify → Use webhook ON
- LINE Login → **Callback URL** เพิ่ม `https://<โดเมน>/api/line/login/callback`

## 5. ใส่ข้อมูลตั้งต้น
DB บน production เริ่มว่าง → ล็อกอิน `/admin` แล้วเพิ่มพาร์ทเนอร์/รถจริงในหน้า "พาร์ทเนอร์ & รถ"
(ถ้าต้องการข้อมูลตัวอย่าง: `railway run npx tsx tools/seed-partners.ts`)

## 6. ต่อโดเมนจริงภายหลัง
Railway → Settings → Networking → **Custom Domain** → ใส่โดเมน → ตั้ง CNAME ตามที่ Railway บอก → SSL อัตโนมัติ
แล้วแก้ `NEXT_PUBLIC_SITE_URL` + URL ฝั่ง LINE ทั้ง 2 ที่
