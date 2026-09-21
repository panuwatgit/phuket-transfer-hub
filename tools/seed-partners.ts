// ข้อมูลพาร์ทเนอร์ตัวอย่าง (จาก prototype) — รัน: npx tsx tools/seed-partners.ts
import "dotenv/config";
import { prisma } from "../lib/prisma";
import { VEHICLES } from "../lib/config";
import type { VehicleType } from "@prisma/client";

const DATA: { name: string; phone: string; lineId?: string; rating: number; note?: string; vehicles: { plate: string; type: VehicleType; model: string; costAirport: number; costDaily: number; active?: boolean }[] }[] = [
  { name: "พี่หนุ่ม (ถลาง)", phone: "081-111-2222", lineId: "noom_van", rating: 5, note: "ตรงเวลา รถใหม่ รับงานสนามบินดึกได้", vehicles: [
    { plate: "ฮข 1234 ภูเก็ต", type: "VAN_VIP10", model: "Toyota Commuter 2023", costAirport: 900, costDaily: 2200 },
    { plate: "ฮค 5678 ภูเก็ต", type: "VAN_VIP8", model: "Hyundai H1 2022", costAirport: 1000, costDaily: 2500 } ] },
  { name: "เจ๊แดง ป่าตอง", phone: "089-333-4444", lineId: "daeng.van", rating: 4, note: "มีหลายคัน เหมาะกรุ๊ปใหญ่", vehicles: [
    { plate: "ฮง 2468 ภูเก็ต", type: "VAN_VIP10", model: "Toyota Commuter 2021", costAirport: 850, costDaily: 2000 },
    { plate: "ฮง 1357 ภูเก็ต", type: "VAN_VIP10", model: "Toyota Commuter 2020", costAirport: 800, costDaily: 1900, active: false } ] },
  { name: "บังยา กะรน", phone: "086-555-6666", rating: 4, note: "SUV สภาพดี ขับนุ่ม", vehicles: [
    { plate: "กข 9012 ภูเก็ต", type: "SUV", model: "Toyota Fortuner 2022", costAirport: 900, costDaily: 2400 } ] },
  { name: "น้องเอ็ม สนามบิน", phone: "092-777-8888", lineId: "m.driver", rating: 5, note: "เก๋งรับสนามบินเป็นหลัก รับงานเช้ามาก", vehicles: [
    { plate: "ขค 3344 ภูเก็ต", type: "SEDAN", model: "Toyota Camry 2021", costAirport: 600, costDaily: 1800 },
    { plate: "ขง 7788 ภูเก็ต", type: "SEDAN", model: "Honda Accord 2020", costAirport: 550, costDaily: 1700 } ] },
  { name: "ลุงชัย กระบี่", phone: "084-999-0000", rating: 3, note: "อยู่กระบี่ เหมาะงานขากลับจากกระบี่", vehicles: [
    { plate: "ฮจ 1122 กระบี่", type: "VAN_VIP8", model: "Toyota Commuter 2019", costAirport: 1100, costDaily: 2300 } ] },
];

async function main() {
  if ((await prisma.partner.count()) > 0) { console.log("มีพาร์ทเนอร์อยู่แล้ว ข้าม seed"); return; }
  for (const p of DATA) {
    await prisma.partner.create({ data: { name: p.name, phone: p.phone, lineId: p.lineId, rating: p.rating, note: p.note, vehicles: { create: p.vehicles.map((v) => ({ ...v, seats: VEHICLES[v.type].seats, active: v.active ?? true })) } } });
  }
  console.log(`seeded ${DATA.length} partners`);
}
main().finally(() => prisma.$disconnect());
