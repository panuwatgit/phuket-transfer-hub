import type { BookingRequest } from "@prisma/client";
import { SERVICES, VEHICLES, isCharter, CHARTER } from "./config";
import { thDate } from "./format";
import { fmtDate, getDict, isLang, type Lang } from "./i18n";

type R = Pick<
  BookingRequest,
  "serviceType" | "direction" | "pickupPlace" | "dropoffPlace" | "dropoffProvince" | "days" | "vehicleType" | "vehicleCount" | "passengers" | "luggage" | "roundTrip" | "returnDate" | "returnTime" | "pickupDate" | "pickupTime" | "flightNo" | "customerName" | "phone" | "code" | "customerNote"
> & { lang?: string };

const langOf = (r: R, lang?: Lang): Lang => lang ?? (r.lang && isLang(r.lang) ? r.lang : "th");

/** ข้อความเส้นทางสั้น ๆ ใช้ทั้งการ์ด, LINE/WhatsApp, หน้าสำเร็จ — ภาษาตาม lang (default ภาษาของ request) */
export function routeText(r: R, lang?: Lang) {
  const t = getDict(langOf(r, lang)).route;
  switch (r.serviceType) {
    case "AIRPORT":
      return r.direction === "TO_AIRPORT" ? `${r.pickupPlace} → ${t.airport}` : `${t.airport} → ${r.pickupPlace}`;
    case "POINT_TO_POINT":
      return `${r.pickupPlace} → ${r.dropoffPlace ?? "…"}${r.dropoffProvince ? ` (${r.dropoffProvince})` : ""}`;
    case "DAILY_CHARTER":
      return `${t.pickupAt} ${r.pickupPlace} · ${t.charterDay(CHARTER.hoursPerDay)}`;
    case "MULTI_DAY":
      return `${t.pickupAt} ${r.pickupPlace} · ${t.days(r.days ?? 1)}`;
  }
}

export function vehicleText(r: R, lang?: Lang) {
  const l = langOf(r, lang);
  const d = getDict(l);
  return d.vehicle[r.vehicleType].name + (r.vehicleCount > 1 ? d.form.summary.cars(r.vehicleCount) : "");
}

export function whenText(r: R, lang?: Lang) {
  const l = langOf(r, lang);
  let s = `${fmtDate(r.pickupDate, l)} ${r.pickupTime}`;
  if (r.roundTrip && r.returnDate) s += ` · ${getDict(l).route.back} ${fmtDate(r.returnDate, l)} ${r.returnTime ?? ""}`;
  return s;
}

/** ข้อความที่พิมพ์ให้ลูกค้าส่งเข้า LINE / WhatsApp / อีเมล (มีเลข request ให้จับคู่) */
export function customerMessage(r: R, lang?: Lang) {
  const l = langOf(r, lang);
  const d = getDict(l);
  const lines = [
    d.success.msgHead(r.code),
    `🚐 ${vehicleText(r, l)}`,
    `🧭 ${d.service[r.serviceType].name}`,
    `📅 ${whenText(r, l)}`,
    `📍 ${routeText(r, l)}`,
    `👥 ${d.success.msgPax(r.passengers, r.luggage)}`,
    `👤 ${r.customerName} ${r.phone}`,
  ];
  if (r.flightNo) lines.push(`✈️ ${r.flightNo}`);
  if (r.customerNote) lines.push(`📝 ${r.customerNote}`);
  return lines.join("\n");
}

/** ข้อความแจ้งแอดมิน (ไทยเสมอ) */
export function adminNotifyText(r: R, adminUrl: string) {
  const l = langOf(r);
  return [
    `🔔 ขอราคาใหม่ #${r.code}${l === "en" ? " 🇬🇧 EN" : ""}`,
    `${VEHICLES[r.vehicleType].name}${r.vehicleCount > 1 ? ` × ${r.vehicleCount}` : ""} · ${SERVICES[r.serviceType].short}`,
    `📅 ${thDate(r.pickupDate)} ${r.pickupTime}`,
    `📍 ${routeText(r, "th")}`,
    `👥 ${r.passengers} คน${isCharter(r.serviceType) ? "" : ` · กระเป๋า ${r.luggage}`}`,
    `👤 ${r.customerName} ${r.phone}`,
    r.customerNote ? `📝 ${r.customerNote}` : "",
    adminUrl,
  ]
    .filter(Boolean)
    .join("\n");
}
