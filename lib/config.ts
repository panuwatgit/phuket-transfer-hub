// ค่าคงที่ของธุรกิจ — แก้ที่นี่ที่เดียว (ดู PLAN.md)
import type { VehicleType, ServiceType, RequestStatus, PaymentTerm } from "@prisma/client";

export const BRAND = {
  name: "Phuket Transfer Hub",
  short: "PTH",
  slogan: "คุยง่าย ราคาถูกใจ",
  sloganFull: "คุยง่าย ราคาถูกใจ ใช้งาน Phuket Transfer Hub",
  company: "", // ใส่ชื่อบริษัทเมื่อจดทะเบียนแล้ว — ว่าง = ไม่แสดง
  phone: "086-422-6141",
  whatsapp: "66864226141", // รูปแบบสากล ไม่มี + (ใช้ทำลิงก์ wa.me)
  email: "phukettransferhub@gmail.com",
  lineOaId: process.env.NEXT_PUBLIC_LINE_OA_ID || "@024tyswy",
  lineAddUrl: "https://lin.ee/qbJP2Hg",
  googleReviewUrl: "", // TODO ลิงก์รีวิว Google Business Profile — ว่าง = ซ่อนปุ่ม
  facebookUrl: "", // TODO
  googleRating: "", // เช่น "4.9" — ว่าง = ไม่โชว์
  hours: "08:00–22:00 ทุกวัน",
  replyMinutes: 30,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3100",
};

export const lineAddFriendUrl = () => BRAND.lineAddUrl;
export const lineOaMessageUrl = (text: string) => `https://line.me/R/oaMessage/${encodeURIComponent(BRAND.lineOaId)}/?${encodeURIComponent(text)}`;
export const whatsappUrl = (text = "") => `https://wa.me/${BRAND.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
export const mailtoUrl = (subject: string, body: string) => `mailto:${BRAND.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

export const VEHICLES: Record<
  VehicleType,
  { key: VehicleType; name: string; short: string; seats: number; luggage: number; tagline: string; badge: string; color: string }
> = {
  VAN_VIP8: { key: "VAN_VIP8", name: "รถตู้ VIP 8 ที่นั่ง", short: "VIP 8", seats: 8, luggage: 6, tagline: "ครอบครัว · กรุ๊ปเล็ก นั่งสบายเต็มที่", badge: "ยอดนิยม", color: "teal" },
  VAN_VIP10: { key: "VAN_VIP10", name: "รถตู้ VIP 10 ที่นั่ง", short: "VIP 10", seats: 10, luggage: 8, tagline: "กรุ๊ปทัวร์ · บริษัท · สัมมนา", badge: "กรุ๊ปทัวร์", color: "sun" },
  SUV: { key: "SUV", name: "SUV 5 ที่นั่ง", short: "SUV", seats: 5, luggage: 3, tagline: "ครอบครัวเล็ก · ลูกค้าพรีเมียม", badge: "พรีเมียม", color: "coral" },
  SEDAN: { key: "SEDAN", name: "รถเก๋ง 4 ที่นั่ง", short: "เก๋ง", seats: 4, luggage: 2, tagline: "รับส่งสนามบิน 1–3 คน คุ้มสุด", badge: "ประหยัด", color: "teal" },
};
export const VEHICLE_ORDER: VehicleType[] = ["VAN_VIP8", "VAN_VIP10", "SUV", "SEDAN"];

export const SERVICES: Record<ServiceType, { key: ServiceType; name: string; short: string; icon: string; desc: string; tags: string[] }> = {
  AIRPORT: { key: "AIRPORT", name: "รับ-ส่งสนามบิน", short: "สนามบิน", icon: "🛬", desc: "สนามบินภูเก็ต ↔ ทุกโซน เที่ยวเดียวหรือไป-กลับ รอรับหน้าประตู", tags: ["เที่ยวบินไม่บังคับ", "ชำระเต็มหลังตกลงราคา"] },
  POINT_TO_POINT: { key: "POINT_TO_POINT", name: "รับ-ส่งจุดต่อจุด", short: "จุดต่อจุด", icon: "📍", desc: "ในภูเก็ต หรือข้ามจังหวัด กระบี่ พังงา สุราษฎร์ หาดใหญ่", tags: ["14 จังหวัดภาคใต้"] },
  DAILY_CHARTER: { key: "DAILY_CHARTER", name: "เหมารายวันพร้อมคนขับ", short: "เหมารายวัน", icon: "🚐", desc: "เที่ยวได้ทั้งวัน แวะได้ตามใจ 8 ชั่วโมงเต็ม", tags: ["8 ชม./วัน", "OT ชม.ละ 300", "ไม่รวมน้ำมัน"] },
  MULTI_DAY: { key: "MULTI_DAY", name: "ทริปหลายวัน", short: "หลายวัน", icon: "🗺️", desc: "ทัวร์ภาคใต้ สัมมนาบริษัท ดูงาน จัดรถให้ครบทุกวัน", tags: ["มัดจำ 50%", "วางบิลได้ (บริษัท)"] },
};
export const SERVICE_ORDER: ServiceType[] = ["AIRPORT", "POINT_TO_POINT", "DAILY_CHARTER", "MULTI_DAY"];

export const CHARTER = { hoursPerDay: 8, otRate: 300 };

export const PROVINCES = ["ภูเก็ต", "พังงา", "กระบี่", "สุราษฎร์ธานี", "ตรัง", "นครศรีธรรมราช", "สงขลา", "สตูล", "พัทลุง", "ระนอง", "ชุมพร", "ปัตตานี", "ยะลา", "นราธิวาส"];

export const STATUSES: Record<RequestStatus, { name: string; color: string; wash: string }> = {
  NEW: { name: "ใหม่", color: "#FF6B6B", wash: "#FFECEC" },
  SOURCING: { name: "กำลังหารถ", color: "#EF9F27", wash: "#FFF6DA" },
  QUOTED: { name: "เสนอราคาแล้ว", color: "#8B5CF6", wash: "#F1EBFF" },
  CONFIRMED: { name: "ยืนยันแล้ว", color: "#14B8A6", wash: "#E6FAF7" },
  COMPLETED: { name: "จบงาน", color: "#22C55E", wash: "#E9F9EF" },
  CANCELLED: { name: "ยกเลิก", color: "#9AA8B4", wash: "#F1EFE8" },
};
export const STATUS_ORDER: RequestStatus[] = ["NEW", "SOURCING", "QUOTED", "CONFIRMED", "COMPLETED", "CANCELLED"];
export const NEXT_STATUS: Partial<Record<RequestStatus, RequestStatus>> = { NEW: "SOURCING", SOURCING: "QUOTED", QUOTED: "CONFIRMED", CONFIRMED: "COMPLETED" };

export const PAYMENT_TERMS: Record<PaymentTerm, { name: string; desc: string }> = {
  FULL_PREPAID: { name: "ชำระเต็ม 100% หลังตกลงราคา", desc: "งานเล็ก ไม่ต้องจ่ายหน้างาน · ยกเลิกก่อน 24 ชม. คืนเต็ม" },
  DEPOSIT_50: { name: "มัดจำ 50% หลังตกลงราคา", desc: "ส่วนที่เหลือก่อนวันเดินทาง · ยกเลิกก่อน 3 วัน คืนเต็ม" },
  CREDIT: { name: "วางบิล (บริษัท)", desc: "ชำระตามรอบที่ตกลง" },
};

/** เงื่อนไขชำระเงินที่ระบบเลือกให้ตามประเภทงาน (แอดมินแก้รายเคสได้) */
export function defaultPaymentTerm(service: ServiceType, dropoffProvince?: string | null): PaymentTerm {
  if (service === "AIRPORT") return "FULL_PREPAID";
  if (service === "POINT_TO_POINT" && (!dropoffProvince || dropoffProvince === "ภูเก็ต")) return "FULL_PREPAID";
  return "DEPOSIT_50";
}

export const isCharter = (s: ServiceType) => s === "DAILY_CHARTER" || s === "MULTI_DAY";

export const POPULAR_ROUTES = [
  { from: "🛬 สนามบินภูเก็ต", to: "ป่าตอง", time: "≈ 45 นาที · 40 กม.", cars: "เก๋ง / VIP8", color: "#FFC93C" },
  { from: "ภูเก็ต", to: "กระบี่ 🏝️", time: "≈ 2.5 ชม. · 165 กม.", cars: "VIP8 / VIP10", color: "#FF6B6B" },
  { from: "ภูเก็ต", to: "เขาหลัก 🌴", time: "≈ 1.5 ชม. · 100 กม.", cars: "SUV / VIP8", color: "#14B8A6" },
];

export const FAQ = [
  { q: "ราคารวมน้ำมันไหม?", a: "รับส่งสนามบินและจุดต่อจุด — รวมน้ำมันแล้ว ค่าเข้าสถานที่จ่ายตามจริง · เหมารายวัน — ไม่รวมน้ำมัน จ่ายตามจริงหรือคุยราคาเหมาได้" },
  { q: "เหมารายวันเกิน 8 ชั่วโมงคิดยังไง?", a: "คิด OT ชั่วโมงละ 300 บาท นับจากชั่วโมงที่ 9 เป็นต้นไป แจ้งคนขับล่วงหน้าได้เลย" },
  { q: "รู้ได้ยังไงว่ารถจะมาแน่?", a: "หลังยืนยันเราส่งชื่อคนขับ เบอร์โทร และทะเบียนรถให้ก่อนวันเดินทาง และคนขับจะทักหาคุณล่วงหน้า ถ้ามีปัญหาเราหารถสำรองให้ทันที" },
];

/** รีวิวลูกค้า — ตัวอย่าง (sample: true จะโชว์ป้าย "ตัวอย่าง") แทนที่ด้วยรีวิวจริงแล้วตั้ง sample: false */
export const REVIEWS: { name: string; where: string; text: { th: string; en: string }; stars: number; sample?: boolean }[] = [
  { name: "คุณโอ๊ต", where: "ครอบครัว 9 คน · สนามบิน → ไม้ขาว", stars: 5, sample: true, text: { th: "ทักไลน์ตอนสี่ทุ่ม ตีห้าครึ่งรถมารอที่สนามบินแล้ว คนขับช่วยยกกระเป๋าทุกใบ ราคาตามที่คุยไม่มีบวก", en: "Messaged at 10pm, the van was waiting at the airport by 5:30am. Driver helped with every bag. Price exactly as quoted." } },
  { name: "บ.สยามเทค", where: "สัมมนา 18 คน · 3 วัน กระบี่–ตรัง", stars: 5, sample: true, text: { th: "ใช้รถตู้ 2 คัน 3 วัน จัดตารางให้ครบ วางบิลได้ สะดวกกับฝ่ายจัดซื้อมาก", en: "Two vans for three days, schedule handled end to end, invoiced — made it easy for our procurement team." } },
  { name: "Sarah M.", where: "Airport → Kata · late flight", stars: 5, sample: true, text: { th: "เที่ยวบินดีเลย์ชั่วโมงกว่า คนขับก็ยังรออยู่พร้อมป้ายชื่อ ประทับใจมาก", en: "Our flight was over an hour late and the driver was still there with our name on a sign. Brilliant." } },
];

/** รูปไดคัตประจำหมวด (รูปเดียว ไม่ผูกกับคันใดคันหนึ่ง) — ไม่มี = ใช้ภาพวาด · วางไฟล์ใน public/vehicles/ */
export const VEHICLE_IMAGE: Partial<Record<VehicleType, { src: string; w: number; h: number }>> = {
  VAN_VIP8: { src: "/vehicles/vip8-cutout.png", w: 447, h: 334 },
  VAN_VIP10: { src: "/vehicles/vip10-cutout.png", w: 1001, h: 876 },
  SUV: { src: "/vehicles/suv-cutout.png", w: 1001, h: 641 },
  SEDAN: { src: "/vehicles/sedan-cutout.png", w: 1001, h: 608 },
};

/** รูปบรรยากาศจริง (หน้าแรก "บรรยากาศในรถ") — เพิ่มได้เรื่อย ๆ วางไฟล์ใน public/gallery/ */
export const GALLERY: { src: string; alt: { th: string; en: string }; w: number; h: number }[] = [
  { src: "/gallery/vip-interior-1.jpg", alt: { th: "รถตู้ VIP 8 ที่นั่ง: เบาะหนังปรับเอน พร้อมน้ำดื่ม", en: "VIP 8-seater: reclining leather seats with drinking water" }, w: 600, h: 800 },
  { src: "/gallery/vip-interior-2.jpg", alt: { th: "รถตู้ VIP 8 ที่นั่ง: กัปตันซีท ที่วางแขน ที่วางแก้ว", en: "VIP 8-seater: captain seats with armrests and cup holders" }, w: 600, h: 800 },
  { src: "/gallery/vip-interior-3.jpg", alt: { th: "รถตู้ VIP 8 ที่นั่ง: เพดานไฟดาว ไฟแอมเบียนท์ ทางเดินกลาง", en: "VIP 8-seater: starlight ceiling, ambient lighting, centre aisle" }, w: 600, h: 800 },
  { src: "/gallery/vip10-interior-1.jpg", alt: { th: "รถตู้ VIP 10 ที่นั่ง: เบาะหนัง 3 แถว กว้าง นั่งสบายทั้งกรุ๊ป", en: "VIP 10-seater: three rows of wide leather seats for the whole group" }, w: 1400, h: 1050 },
  { src: "/gallery/vip10-interior-2.jpg", alt: { th: "รถตู้ VIP 10 ที่นั่ง: ประตูสไลด์ ขึ้น-ลงสะดวก ผ้าม่านทุกบาน", en: "VIP 10-seater: sliding door, easy boarding, curtains on every window" }, w: 1050, h: 1400 },
  { src: "/gallery/vip10-interior-3.jpg", alt: { th: "รถตู้ VIP 10 ที่นั่ง: ที่วางแก้ว ไฟแอมเบียนท์ ห้องโดยสารกว้าง", en: "VIP 10-seater: cup holders, ambient lighting, roomy cabin" }, w: 1050, h: 1400 },
];
