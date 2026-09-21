// สถานที่ยอดนิยมของเรา (ไม่พึ่ง API) — ใช้เป็น autocomplete ชุดแรก และเผื่อคิดราคาตามโซนในอนาคต
export type Place = { th: string; en: string; zone: string; province: string; kind: "airport" | "pier" | "area" | "landmark" | "city" | "station" };

export const PLACES: Place[] = [
  // ภูเก็ต — สนามบิน / ท่าเรือ
  { th: "สนามบินภูเก็ต (HKT)", en: "Phuket Airport (HKT)", zone: "สนามบิน", province: "ภูเก็ต", kind: "airport" },
  { th: "ท่าเรือรัษฎา", en: "Rassada Pier", zone: "เมืองภูเก็ต", province: "ภูเก็ต", kind: "pier" },
  { th: "ท่าเรืออ่าวปอ", en: "Ao Po Grand Marina", zone: "อ่าวปอ", province: "ภูเก็ต", kind: "pier" },
  { th: "ท่าเรือบางโรง", en: "Bang Rong Pier", zone: "ป่าคลอก", province: "ภูเก็ต", kind: "pier" },
  { th: "ท่าเรือฉลอง", en: "Chalong Pier", zone: "ฉลอง", province: "ภูเก็ต", kind: "pier" },
  { th: "ท่าเรือรอยัลภูเก็ตมารีน่า", en: "Royal Phuket Marina", zone: "เกาะแก้ว", province: "ภูเก็ต", kind: "pier" },
  { th: "ท่าเรือโบ๊ทลากูน", en: "Boat Lagoon Marina", zone: "เกาะแก้ว", province: "ภูเก็ต", kind: "pier" },
  { th: "สถานีขนส่งภูเก็ต 2", en: "Phuket Bus Terminal 2", zone: "รัษฎา", province: "ภูเก็ต", kind: "station" },
  // ภูเก็ต — โซน/หาด
  { th: "ป่าตอง", en: "Patong", zone: "ป่าตอง", province: "ภูเก็ต", kind: "area" },
  { th: "กะตะ", en: "Kata", zone: "กะตะ", province: "ภูเก็ต", kind: "area" },
  { th: "กะตะน้อย", en: "Kata Noi", zone: "กะตะ", province: "ภูเก็ต", kind: "area" },
  { th: "กะรน", en: "Karon", zone: "กะรน", province: "ภูเก็ต", kind: "area" },
  { th: "กมลา", en: "Kamala", zone: "กมลา", province: "ภูเก็ต", kind: "area" },
  { th: "หาดสุรินทร์", en: "Surin Beach", zone: "สุรินทร์", province: "ภูเก็ต", kind: "area" },
  { th: "บางเทา", en: "Bang Tao", zone: "บางเทา", province: "ภูเก็ต", kind: "area" },
  { th: "ลากูน่า ภูเก็ต", en: "Laguna Phuket", zone: "บางเทา", province: "ภูเก็ต", kind: "area" },
  { th: "หาดในทอน", en: "Nai Thon Beach", zone: "ในทอน", province: "ภูเก็ต", kind: "area" },
  { th: "หาดในยาง", en: "Nai Yang Beach", zone: "ในยาง", province: "ภูเก็ต", kind: "area" },
  { th: "ไม้ขาว", en: "Mai Khao", zone: "ไม้ขาว", province: "ภูเก็ต", kind: "area" },
  { th: "ในหาน", en: "Nai Harn", zone: "ในหาน", province: "ภูเก็ต", kind: "area" },
  { th: "ราไวย์", en: "Rawai", zone: "ราไวย์", province: "ภูเก็ต", kind: "area" },
  { th: "แหลมพันวา", en: "Cape Panwa", zone: "พันวา", province: "ภูเก็ต", kind: "area" },
  { th: "ฉลอง", en: "Chalong", zone: "ฉลอง", province: "ภูเก็ต", kind: "area" },
  { th: "เมืองเก่าภูเก็ต", en: "Phuket Old Town", zone: "เมืองภูเก็ต", province: "ภูเก็ต", kind: "area" },
  { th: "ตัวเมืองภูเก็ต", en: "Phuket Town", zone: "เมืองภูเก็ต", province: "ภูเก็ต", kind: "city" },
  { th: "เกาะแก้ว", en: "Koh Kaew", zone: "เกาะแก้ว", province: "ภูเก็ต", kind: "area" },
  { th: "ถลาง", en: "Thalang", zone: "ถลาง", province: "ภูเก็ต", kind: "area" },
  { th: "เชิงทะเล", en: "Cherng Talay", zone: "บางเทา", province: "ภูเก็ต", kind: "area" },
  { th: "หาดไตรตรัง", en: "Tri Trang Beach", zone: "ป่าตอง", province: "ภูเก็ต", kind: "area" },
  { th: "หาดกะหลิม", en: "Kalim Beach", zone: "ป่าตอง", province: "ภูเก็ต", kind: "area" },
  // ภูเก็ต — จุดยอดนิยม
  { th: "เซ็นทรัล ภูเก็ต", en: "Central Phuket", zone: "เมืองภูเก็ต", province: "ภูเก็ต", kind: "landmark" },
  { th: "จังซีลอน ป่าตอง", en: "Jungceylon Patong", zone: "ป่าตอง", province: "ภูเก็ต", kind: "landmark" },
  { th: "พระใหญ่ภูเก็ต", en: "Big Buddha Phuket", zone: "ฉลอง", province: "ภูเก็ต", kind: "landmark" },
  { th: "วัดฉลอง", en: "Wat Chalong", zone: "ฉลอง", province: "ภูเก็ต", kind: "landmark" },
  { th: "แหลมพรหมเทพ", en: "Promthep Cape", zone: "ราไวย์", province: "ภูเก็ต", kind: "landmark" },
  { th: "ภูเก็ตแฟนตาซี", en: "Phuket FantaSea", zone: "กมลา", province: "ภูเก็ต", kind: "landmark" },
  { th: "คาร์นิวัลเมจิก", en: "Carnival Magic", zone: "กมลา", province: "ภูเก็ต", kind: "landmark" },
  { th: "โรงพยาบาลกรุงเทพภูเก็ต", en: "Bangkok Hospital Phuket", zone: "เมืองภูเก็ต", province: "ภูเก็ต", kind: "landmark" },
  { th: "โรงพยาบาลวชิระภูเก็ต", en: "Vachira Phuket Hospital", zone: "เมืองภูเก็ต", province: "ภูเก็ต", kind: "landmark" },
  { th: "บลูทรี ภูเก็ต", en: "Blue Tree Phuket", zone: "เชิงทะเล", province: "ภูเก็ต", kind: "landmark" },
  { th: "ม.สงขลานครินทร์ วิทยาเขตภูเก็ต", en: "Prince of Songkla University, Phuket", zone: "กะทู้", province: "ภูเก็ต", kind: "landmark" },
  // พังงา
  { th: "เขาหลัก", en: "Khao Lak", zone: "เขาหลัก", province: "พังงา", kind: "area" },
  { th: "ท่าเรือทับละมุ", en: "Thap Lamu Pier", zone: "เขาหลัก", province: "พังงา", kind: "pier" },
  { th: "ตัวเมืองพังงา", en: "Phang Nga Town", zone: "พังงา", province: "พังงา", kind: "city" },
  { th: "เกาะยาวน้อย (ท่าเรือ)", en: "Koh Yao Noi Pier", zone: "เกาะยาว", province: "พังงา", kind: "pier" },
  { th: "นาเตย / ท้ายเหมือง", en: "Natai / Thai Mueang", zone: "ท้ายเหมือง", province: "พังงา", kind: "area" },
  // กระบี่
  { th: "สนามบินกระบี่ (KBV)", en: "Krabi Airport (KBV)", zone: "สนามบิน", province: "กระบี่", kind: "airport" },
  { th: "อ่าวนาง", en: "Ao Nang", zone: "อ่าวนาง", province: "กระบี่", kind: "area" },
  { th: "ตัวเมืองกระบี่", en: "Krabi Town", zone: "กระบี่", province: "กระบี่", kind: "city" },
  { th: "ท่าเรือคลองจิหลาด", en: "Klong Jilad Pier", zone: "กระบี่", province: "กระบี่", kind: "pier" },
  { th: "ท่าเรือหาดนพรัตน์ธารา", en: "Nopparat Thara Pier", zone: "อ่าวนาง", province: "กระบี่", kind: "pier" },
  { th: "เกาะลันตา (ท่าเรือศาลาด่าน)", en: "Koh Lanta (Saladan Pier)", zone: "เกาะลันตา", province: "กระบี่", kind: "pier" },
  { th: "คลองม่วง", en: "Klong Muang", zone: "คลองม่วง", province: "กระบี่", kind: "area" },
  // สุราษฎร์ธานี
  { th: "สนามบินสุราษฎร์ธานี (URT)", en: "Surat Thani Airport (URT)", zone: "สนามบิน", province: "สุราษฎร์ธานี", kind: "airport" },
  { th: "ท่าเรือดอนสัก (เกาะสมุย/พะงัน)", en: "Don Sak Pier (Samui/Phangan ferries)", zone: "ดอนสัก", province: "สุราษฎร์ธานี", kind: "pier" },
  { th: "ตัวเมืองสุราษฎร์ธานี", en: "Surat Thani Town", zone: "สุราษฎร์", province: "สุราษฎร์ธานี", kind: "city" },
  { th: "เขาสก", en: "Khao Sok", zone: "เขาสก", province: "สุราษฎร์ธานี", kind: "area" },
  // ตรัง / สตูล / สงขลา / นครฯ / ชุมพร / ระนอง
  { th: "สนามบินตรัง (TST)", en: "Trang Airport (TST)", zone: "สนามบิน", province: "ตรัง", kind: "airport" },
  { th: "ท่าเรือปากเมง", en: "Pak Meng Pier", zone: "ปากเมง", province: "ตรัง", kind: "pier" },
  { th: "ท่าเรือปากบารา (เกาะหลีเป๊ะ)", en: "Pak Bara Pier (Koh Lipe)", zone: "ปากบารา", province: "สตูล", kind: "pier" },
  { th: "สนามบินหาดใหญ่ (HDY)", en: "Hat Yai Airport (HDY)", zone: "สนามบิน", province: "สงขลา", kind: "airport" },
  { th: "ตัวเมืองหาดใหญ่", en: "Hat Yai City", zone: "หาดใหญ่", province: "สงขลา", kind: "city" },
  { th: "สนามบินนครศรีธรรมราช (NST)", en: "Nakhon Si Thammarat Airport (NST)", zone: "สนามบิน", province: "นครศรีธรรมราช", kind: "airport" },
  { th: "ตัวเมืองชุมพร", en: "Chumphon Town", zone: "ชุมพร", province: "ชุมพร", kind: "city" },
  { th: "ตัวเมืองระนอง", en: "Ranong Town", zone: "ระนอง", province: "ระนอง", kind: "city" },
];

const KIND_ICON: Record<Place["kind"], string> = { airport: "✈️", pier: "⛴️", area: "🏖️", landmark: "📍", city: "🏙️", station: "🚌" };
export const placeIcon = (k: Place["kind"]) => KIND_ICON[k];

/** ค้นหาในรายชื่อของเรา (ไทย/อังกฤษ ไม่สนตัวพิมพ์) */
export function searchPlaces(q: string, lang: "th" | "en", limit = 6) {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  const score = (p: Place) => {
    const a = p.th.toLowerCase(), b = p.en.toLowerCase(), z = p.zone.toLowerCase();
    if (a.startsWith(s) || b.startsWith(s)) return 3;
    if (a.includes(s) || b.includes(s)) return 2;
    if (z.includes(s) || p.province.includes(s)) return 1;
    return 0;
  };
  return PLACES.map((p) => ({ p, sc: score(p) })).filter((x) => x.sc > 0).sort((x, y) => y.sc - x.sc).slice(0, limit).map(({ p }) => ({ label: lang === "en" ? p.en : p.th, sub: lang === "en" ? `${p.zone === p.province ? "" : p.zone + " · "}${provinceEn(p.province)}` : `${p.zone === p.province ? "" : p.zone + " · "}${p.province}`, icon: placeIcon(p.kind), source: "local" as const }));
}

const PROV_EN: Record<string, string> = { "ภูเก็ต": "Phuket", "พังงา": "Phang Nga", "กระบี่": "Krabi", "สุราษฎร์ธานี": "Surat Thani", "ตรัง": "Trang", "นครศรีธรรมราช": "Nakhon Si Thammarat", "สงขลา": "Songkhla", "สตูล": "Satun", "พัทลุง": "Phatthalung", "ระนอง": "Ranong", "ชุมพร": "Chumphon", "ปัตตานี": "Pattani", "ยะลา": "Yala", "นราธิวาส": "Narathiwat" };
export const provinceEn = (th: string) => PROV_EN[th] ?? th;
