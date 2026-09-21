import { z } from "zod";
import { PROVINCES } from "./config";

// ไทย 0xx-xxx-xxxx หรือสากล +xx... (7–15 หลัก)
const phone = z
  .string()
  .transform((s) => s.replace(/[-\s().]/g, ""))
  .refine((s) => /^(0\d{8,9}|\+?[1-9]\d{6,14})$/.test(s), "เบอร์โทรไม่ถูกต้อง");

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "เลือกวันเดินทาง");
const time = z.string().regex(/^\d{2}:\d{2}$/, "เลือกเวลา");

export const requestSchema = z
  .object({
    vehicleType: z.enum(["VAN_VIP8", "VAN_VIP10", "SUV", "SEDAN"]),
    vehicleCount: z.coerce.number().int().min(1).max(10).default(1),
    serviceType: z.enum(["AIRPORT", "POINT_TO_POINT", "DAILY_CHARTER", "MULTI_DAY"]),
    direction: z.enum(["FROM_AIRPORT", "TO_AIRPORT"]).optional(),
    pickupDate: date,
    pickupTime: time,
    pickupPlace: z.string().trim().min(1, "บอกจุดรับหน่อยครับ").max(200),
    dropoffPlace: z.string().trim().max(200).optional(),
    dropoffProvince: z.string().optional(),
    roundTrip: z.coerce.boolean().default(false),
    returnDate: z.string().optional(),
    returnTime: z.string().optional(),
    flightNo: z.string().trim().max(20).optional(),
    days: z.coerce.number().int().min(1).max(30).optional(),
    itinerary: z.string().trim().max(2000).optional(),
    passengers: z.coerce.number().int().min(1).max(200),
    luggage: z.coerce.number().int().min(0).max(200).default(0),
    customerName: z.string().trim().min(1, "ขอชื่อหน่อยครับ").max(100),
    phone,
    lineId: z.string().trim().max(50).optional(),
    email: z.string().trim().max(120).optional().refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "อีเมลไม่ถูกต้อง"),
    lang: z.enum(["th", "en"]).default("th"),
    company: z.string().trim().max(150).optional(),
    contactChannel: z.enum(["LINE", "PHONE", "WHATSAPP", "EMAIL"]).default("LINE"),
    customerNote: z.string().trim().max(1000).optional(),
    website: z.string().max(0).optional(), // honeypot — บอทชอบกรอก
  })
  .superRefine((v, ctx) => {
    if (v.serviceType === "POINT_TO_POINT") {
      if (!v.dropoffPlace) ctx.addIssue({ code: "custom", path: ["dropoffPlace"], message: "บอกจุดส่งหน่อยครับ" });
      if (v.dropoffProvince && !PROVINCES.includes(v.dropoffProvince))
        ctx.addIssue({ code: "custom", path: ["dropoffProvince"], message: "ตอนนี้รับเฉพาะภาคใต้" });
    }
    if (v.roundTrip && v.returnDate && !/^\d{4}-\d{2}-\d{2}$/.test(v.returnDate))
      ctx.addIssue({ code: "custom", path: ["returnDate"], message: "วันกลับไม่ถูกต้อง" });
  });

export type RequestInput = z.input<typeof requestSchema>;
export type RequestData = z.output<typeof requestSchema>;
