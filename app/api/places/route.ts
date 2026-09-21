import { NextResponse } from "next/server";
import { searchPlaces } from "@/lib/places";

// autocomplete สถานที่: รายชื่อของเรา + Google Places (ถ้าตั้ง GOOGLE_MAPS_API_KEY) — key อยู่ฝั่งเซิร์ฟเวอร์เท่านั้น
export type Suggestion = { label: string; sub?: string; icon: string; source: "local" | "google"; placeId?: string };

const SOUTH_TH = { low: { latitude: 6.0, longitude: 97.3 }, high: { latitude: 11.5, longitude: 102.2 } };

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const lang = url.searchParams.get("lang") === "en" ? "en" : "th";
  if (q.length < 2) return NextResponse.json([]);

  const local = searchPlaces(q, lang, 5);
  const key = process.env.GOOGLE_MAPS_API_KEY;
  let google: Suggestion[] = [];
  if (key) {
    try {
      const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key },
        body: JSON.stringify({ input: q, languageCode: lang, regionCode: "TH", locationRestriction: { rectangle: SOUTH_TH }, includedRegionCodes: ["th"] }),
        next: { revalidate: 0 },
      });
      if (res.ok) {
        const data = (await res.json()) as { suggestions?: { placePrediction?: { placeId: string; structuredFormat?: { mainText?: { text: string }; secondaryText?: { text: string } }; text?: { text: string } } }[] };
        google = (data.suggestions ?? [])
          .map((s) => s.placePrediction)
          .filter((p): p is NonNullable<typeof p> => !!p)
          .slice(0, 6)
          .map((p) => ({ label: p.structuredFormat?.mainText?.text ?? p.text?.text ?? "", sub: p.structuredFormat?.secondaryText?.text?.replace(/, ประเทศไทย$|, Thailand$/, ""), icon: "🏨", source: "google" as const, placeId: p.placeId }));
      } else console.error("[places] google", res.status, await res.text());
    } catch (e) { console.error("[places] google failed", e); }
  }
  // ตัดซ้ำ (ชื่อเหมือนกัน) ให้ของเราขึ้นก่อน
  const seen = new Set(local.map((l) => l.label.toLowerCase()));
  return NextResponse.json([...local, ...google.filter((g) => !seen.has(g.label.toLowerCase()))], { headers: { "Cache-Control": "private, max-age=60" } });
}
