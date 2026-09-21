# Phuket Transfer Hub — โลโก้ (PTH Badge)

ทุกไฟล์ SVG ตัวอักษรถูกแปลงเป็น path แล้ว ใช้ได้โดยไม่ต้องติดตั้งฟอนต์ · แก้แล้วรันใหม่ด้วย `npx tsx tools/brand/build-logo.ts`

| ไฟล์ | ใช้ตอนไหน |
|---|---|
| `logo-horizontal.svg` / `-en.svg` | หัวเว็บ, เอกสาร, ใบเสนอราคา (พื้นขาว/สว่าง) |
| `logo-horizontal-white.svg` / `logo-on-teal.svg` | บนพื้นเข้ม/สีเขียว เช่น ป้ายรถ ปกเพจ |
| `logo-horizontal-mono.svg` | พิมพ์ขาวดำ / ปั๊ม |
| `logo-stacked.svg` | รูปโปรไฟล์แนวตั้ง, สติกเกอร์ |
| `profile-512.svg` + `png/profile-1024.png` | รูปโปรไฟล์ LINE OA / Facebook / Google Business |
| `mark*.svg` + `png/mark-1024.png` | ไอคอนอย่างเดียว (แอป, ลายน้ำ) |
| `png/` | PNG ความละเอียดสูงสำหรับที่ที่ใช้ SVG ไม่ได้ |

สี: teal `#14B8A6` · teal-deep `#0F9488` · coral `#FF6B6B` · sun `#FFC93C` · ink `#1A2B3C` · cream `#FFFBF5` · ฟอนต์ Kanit

## ไดคัตรูปรถ (ตัดฉากหลัง)
`tools/brand/cutout.swift` ใช้ Vision ของ macOS — คอมไพล์ครั้งเดียวแล้วใช้กับรูปอื่นได้:
```bash
swiftc -O -o /tmp/cutout tools/brand/cutout.swift
/tmp/cutout input.jpg public/vehicles/<type>-cutout.png
```
แล้วเพิ่มใน `VEHICLE_IMAGE` (lib/config.ts)
