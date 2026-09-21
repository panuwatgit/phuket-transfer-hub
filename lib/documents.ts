import { randomBytes } from "node:crypto";
import type { BookingRequest, DocumentType, Prisma } from "@prisma/client";
import { BRAND, CHARTER, PAYMENT_TERMS, VEHICLES, SERVICES, isCharter } from "./config";
import { getDict, isLang, type Lang } from "./i18n";
import { routeText, whenText } from "./request-view";

export type DocItem = { desc: string; qty: number; unit: string; unitPrice: number; amount: number };

/** ผู้ออกเอกสาร — จาก .env (บุคคลธรรมดา จนกว่าจะจดบริษัท) */
export function issuer() {
  return {
    name: process.env.RECEIPT_ISSUER_NAME || BRAND.name,
    brand: BRAND.name,
    taxId: process.env.RECEIPT_TAX_ID || "",
    address: process.env.RECEIPT_ADDRESS || "",
    phone: BRAND.phone,
    email: BRAND.email,
    line: BRAND.lineOaId,
    whatsapp: BRAND.whatsapp,
  };
}

export const docLang = (r: { lang: string }): Lang => (isLang(r.lang) ? r.lang : "th");

/** ยอดรวมของงานตามที่หลังบ้านคิด (charter: ต่อวัน × วัน + OT) */
export function jobTotal(r: BookingRequest) {
  const price = r.sellPrice ?? 0;
  if (!isCharter(r.serviceType)) return price;
  return price * (r.days ?? 1) + r.otHours * r.otRate;
}

/** รายการในเอกสาร สร้างจาก request (ภาษาตามลูกค้า) */
export function buildItems(r: BookingRequest): DocItem[] {
  const lang = docLang(r);
  const en = lang === "en";
  const d = getDict(lang);
  const vehicle = d.vehicle[r.vehicleType].name;
  const service = d.service[r.serviceType].name;
  const price = r.sellPrice ?? 0;
  const items: DocItem[] = [];
  if (isCharter(r.serviceType)) {
    const days = r.days ?? 1;
    items.push({
      desc: `${service} — ${vehicle}${r.vehicleCount > 1 ? ` × ${r.vehicleCount}` : ""}\n${whenText(r, lang)} · ${routeText(r, lang)}\n${en ? `${CHARTER.hoursPerDay} hrs/day · fuel ${r.fuelIncluded ? "included" : "not included"}` : `${CHARTER.hoursPerDay} ชม./วัน · ${r.fuelIncluded ? "รวมน้ำมัน" : "ไม่รวมน้ำมัน"}`}`,
      qty: days, unit: en ? "day" : "วัน", unitPrice: price, amount: price * days,
    });
    if (r.otHours > 0) items.push({ desc: en ? "Overtime" : "ค่าล่วงเวลา (OT)", qty: r.otHours, unit: en ? "hr" : "ชม.", unitPrice: r.otRate, amount: r.otHours * r.otRate });
  } else {
    items.push({
      desc: `${service} — ${vehicle}${r.vehicleCount > 1 ? ` × ${r.vehicleCount}` : ""}\n${whenText(r, lang)} · ${routeText(r, lang)}${r.roundTrip ? (en ? "\nReturn trip included" : "\nรวมขากลับ") : ""}${r.flightNo ? ` · ✈️ ${r.flightNo}` : ""}`,
      qty: 1, unit: en ? "trip" : "งาน", unitPrice: price, amount: price,
    });
  }
  return items;
}

export function newToken() {
  return randomBytes(16).toString("base64url");
}

/** เลขเอกสาร QT-YYYY-NNNN / RC-YYYY-NNNN (atomic ผ่าน Counter) */
export async function nextDocNumber(tx: Prisma.TransactionClient, type: DocumentType, year = new Date().getFullYear()) {
  const prefix = type === "QUOTE" ? "QT" : "RC";
  const key = `${type.toLowerCase()}:${year}`;
  const c = await tx.counter.upsert({ where: { key }, create: { key, value: 1 }, update: { value: { increment: 1 } } });
  return `${prefix}-${year}-${String(c.value).padStart(4, "0")}`;
}

export function paymentTermText(term: string | null | undefined, lang: Lang) {
  if (!term) return "";
  const d = getDict(lang);
  return d.form.pay[term as keyof typeof d.form.pay]?.name ?? PAYMENT_TERMS[term as keyof typeof PAYMENT_TERMS]?.name ?? term;
}

export const PAYMENT_METHODS: Record<string, { th: string; en: string }> = {
  TRANSFER: { th: "โอนเงินผ่านธนาคาร", en: "Bank transfer" },
  PROMPTPAY: { th: "PromptPay QR", en: "PromptPay QR" },
  CASH: { th: "เงินสด", en: "Cash" },
  CARD: { th: "บัตรเครดิต", en: "Credit card" },
};

// ใช้ใน admin เพื่อ label สั้น ๆ
export const DOC_LABEL: Record<DocumentType, { th: string; en: string; short: string }> = {
  QUOTE: { th: "ใบเสนอราคา", en: "Quotation", short: "ใบเสนอราคา" },
  RECEIPT: { th: "ใบเสร็จรับเงิน", en: "Receipt", short: "ใบเสร็จ" },
};

export { VEHICLES, SERVICES };
