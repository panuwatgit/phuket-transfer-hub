"use server";

import { prisma } from "@/lib/prisma";
import { requestSchema, type RequestInput } from "@/lib/validation";
import { nextRequestCode } from "@/lib/request-code";
import { defaultPaymentTerm, isCharter, BRAND } from "@/lib/config";
import { notifyAdmins, pushToUser } from "@/lib/line";
import { getLineProfile, loginConfigured } from "@/lib/line-login";
import { adminNotifyText, customerMessage } from "@/lib/request-view";
import { sendEmail } from "@/lib/email";
import { getDict } from "@/lib/i18n";

export type CreateResult = { ok: true; code: string } | { ok: false; errors: Record<string, string> };

export async function createRequest(input: RequestInput): Promise<CreateResult> {
  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) {
    // client ตรวจก่อนแล้ว ตรงนี้กันเฉพาะกรณีข้าม client — EN ให้ข้อความอังกฤษแบบสั้น
    const en = input.lang === "en";
    const EN: Record<string, string> = { phone: "Invalid phone number", email: "Invalid email", customerName: "Please enter your name", pickupPlace: "Please enter the pick-up point", pickupDate: "Please pick a date" };
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = String(issue.path[0] ?? "form");
      errors[k] = en ? EN[k] ?? "Please check this field" : issue.message;
    }
    return { ok: false, errors };
  }
  const d = parsed.data;
  if (d.website) return { ok: true, code: "PTH-0000-0000" }; // honeypot: pretend success

  const charter = isCharter(d.serviceType);
  const lp = await getLineProfile(); // เชื่อม LINE ไว้ในฟอร์ม → รู้ userId ตั้งแต่ตอนส่ง
  // ฟอร์มไทยบังคับเชื่อม LINE (กันกรณีข้าม UI มา) — ปิดได้ด้วย LINE_REQUIRED=0
  const lineRequired = d.lang === "th" && loginConfigured() && process.env.LINE_REQUIRED !== "0";
  if (lineRequired && !lp) return { ok: false, errors: { line: "กรุณาเชื่อม LINE ก่อนส่งคำขอ" } };
  const created = await prisma.$transaction(async (tx) => {
    const code = await nextRequestCode(tx);
    const r = await tx.bookingRequest.create({
      data: {
        code,
        lang: d.lang,
        vehicleType: d.vehicleType,
        vehicleCount: d.vehicleCount,
        serviceType: d.serviceType,
        direction: d.serviceType === "AIRPORT" ? (d.direction ?? "FROM_AIRPORT") : null,
        pickupDate: new Date(d.pickupDate + "T00:00:00Z"),
        pickupTime: d.pickupTime,
        pickupPlace: d.pickupPlace,
        dropoffPlace: d.serviceType === "POINT_TO_POINT" ? d.dropoffPlace : null,
        dropoffProvince: d.serviceType === "POINT_TO_POINT" ? (d.dropoffProvince ?? "ภูเก็ต") : null,
        roundTrip: !charter && d.roundTrip,
        returnDate: !charter && d.roundTrip && d.returnDate ? new Date(d.returnDate + "T00:00:00Z") : null,
        returnTime: !charter && d.roundTrip ? (d.returnTime ?? null) : null,
        flightNo: d.serviceType === "AIRPORT" ? d.flightNo || null : null,
        days: d.serviceType === "MULTI_DAY" ? (d.days ?? 2) : d.serviceType === "DAILY_CHARTER" ? 1 : null,
        itinerary: charter ? d.itinerary || null : null,
        passengers: d.passengers,
        luggage: d.luggage,
        customerName: d.customerName,
        phone: d.phone,
        lineId: d.lineId || null,
        email: d.email || null,
        company: d.company || null,
        contactChannel: d.contactChannel,
        customerNote: d.customerNote || null,
        paymentTerm: d.company ? "CREDIT" : defaultPaymentTerm(d.serviceType, d.dropoffProvince),
        // เก็บ userId ไว้เสมอเมื่อเชื่อม LINE แล้ว — สถานะ "เป็นเพื่อน" อาจยังไม่อัปเดตทันทีที่เพิ่งกดเพิ่มเพื่อน
        lineUserId: lp?.userId ?? null,
        lineLinkedAt: lp ? new Date() : null,
        statusLogs: { create: [{ toStatus: "NEW", note: "ลูกค้าส่งฟอร์ม", actor: "customer" }, ...(lp ? [{ toStatus: "NEW" as const, note: `เชื่อม LINE ตอนกรอกฟอร์ม (${lp.displayName}${lp.friend ? "" : " — ยังไม่ยืนยันเป็นเพื่อน"})`, actor: "customer" }] : [])] },
      },
    });
    return r;
  });

  // แจ้งเตือนแอดมิน (LINE + อีเมลกลาง) และยืนยันลูกค้าทางอีเมลถ้าให้มา — ไม่ให้ล้มถ้าส่งไม่ได้
  const adminText = adminNotifyText(created, `${BRAND.siteUrl}/admin/requests/${created.id}`);
  const dict = getDict(d.lang);
  await Promise.all([
    notifyAdmins(adminText),
    // ลูกค้าเชื่อม LINE แล้ว → ลองส่งสรุปเข้าแชทเลย (ถ้ายังไม่ได้เพิ่มเพื่อนจริง LINE จะปฏิเสธ แล้วเราค่อยส่งเองทีหลัง)
    lp ? pushToUser(lp.userId, `${dict.success.sub(BRAND.replyMinutes, dict.hoursText)}\n\n${customerMessage(created)}`) : Promise.resolve(false),
    sendEmail(BRAND.email, `ขอราคาใหม่ #${created.code}`, adminText),
    created.email ? sendEmail(created.email, dict.success.mailSubject(created.code), `${dict.success.sub(BRAND.replyMinutes, dict.hoursText)}\n\n${customerMessage(created)}`) : Promise.resolve(false),
  ]);

  return { ok: true, code: created.code };
}
