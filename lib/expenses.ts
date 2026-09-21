import type { ExpenseCategory } from "@prisma/client";

export const EXPENSE_CATEGORIES: Record<ExpenseCategory, { name: string; icon: string }> = {
  PARTNER_PAYOUT: { name: "ค่ารถ/คนขับพาร์ทเนอร์", icon: "🚐" },
  FUEL: { name: "น้ำมัน", icon: "⛽" },
  PARKING: { name: "ที่จอดรถ", icon: "🅿️" },
  MEAL: { name: "อาหาร/เบี้ยเลี้ยงคนขับ", icon: "🍱" },
  MAINTENANCE: { name: "ซ่อมบำรุง/ล้างรถ", icon: "🔧" },
  MARKETING: { name: "โฆษณา/การตลาด", icon: "📣" },
  FEE: { name: "ค่าธรรมเนียม/แพลตฟอร์ม", icon: "🧾" },
  OTHER: { name: "อื่น ๆ", icon: "📦" },
};
export const EXPENSE_ORDER: ExpenseCategory[] = ["PARTNER_PAYOUT", "FUEL", "PARKING", "MEAL", "MAINTENANCE", "MARKETING", "FEE", "OTHER"];
export const METHODS: Record<string, string> = { TRANSFER: "โอน", PROMPTPAY: "PromptPay", CASH: "เงินสด", CARD: "บัตร" };

export const MAX_ATTACHMENT = 4 * 1024 * 1024;
export const ATTACHMENT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];

/** ช่วงเดือน "YYYY-MM" → [start, end) */
export function monthRange(m?: string | null) {
  const now = new Date();
  const [y, mo] = (m && /^\d{4}-\d{2}$/.test(m) ? m : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`).split("-").map(Number);
  return { key: `${y}-${String(mo).padStart(2, "0")}`, start: new Date(Date.UTC(y, mo - 1, 1)), end: new Date(Date.UTC(y, mo, 1)), y, mo };
}
