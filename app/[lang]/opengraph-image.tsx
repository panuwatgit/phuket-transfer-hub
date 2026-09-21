import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/config";

// รูปตอนแชร์ลิงก์ใน LINE / Facebook / WhatsApp — สร้างจากโค้ด ไม่ต้องทำรูป
export const alt = "Phuket Transfer Hub";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function font(family: string, text: string) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@600&text=${encodeURIComponent(text)}`, { headers: { "User-Agent": "Mozilla/5.0" } })).text();
  const url = css.match(/src: url\((.+?)\) format\('(?:woff2|truetype|opentype)'\)/)?.[1];
  return url ? await (await fetch(url)).arrayBuffer() : null;
}

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const en = lang === "en";
  const title = en ? "Easy to talk to. Prices you'll like." : "คุยง่าย ราคาถูกใจ";
  const sub = en ? "VIP vans · SUV · Sedan with driver — Phuket & Southern Thailand" : "รถตู้ VIP · SUV · รถเก๋ง พร้อมคนขับ — ภูเก็ตและภาคใต้";
  const kanit = await font("Kanit", title + sub + BRAND.name + "PTH");
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, background: "linear-gradient(135deg,#FFFBF5 0%,#E6FAF7 60%,#FFF6DA 100%)", fontFamily: "Kanit", color: "#1A2B3C", position: "relative" }}>
        <div style={{ position: "absolute", right: -80, top: -80, width: 360, height: 360, borderRadius: 999, background: "#FFC93C", opacity: 0.35 }} />
        <div style={{ position: "absolute", left: 620, bottom: -160, width: 420, height: 420, borderRadius: 999, background: "#14B8A6", opacity: 0.18 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 72, height: 72, borderRadius: 22, background: "#14B8A6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 600, transform: "rotate(-6deg)" }}>PTH</div>
          <div style={{ fontSize: 34, fontWeight: 600 }}>{BRAND.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: en ? 66 : 84, fontWeight: 600, lineHeight: 1.1, display: "flex" }}>
            <span>{en ? "Easy to talk to." : "คุยง่าย"}</span>
            <span style={{ color: "#FF6B6B", marginLeft: 22 }}>{en ? "Prices you'll like." : "ราคาถูกใจ"}</span>
          </div>
          <div style={{ fontSize: 30, color: "#5B6B7A" }}>{sub}</div>
        </div>
        <div style={{ display: "flex", gap: 14, fontSize: 24 }}>
          {[en ? "Reply within 30 min" : "ตอบกลับใน 30 นาที", en ? "No night surcharge" : "ไม่บวกค่าดึก", en ? "100% refund if no car" : "หารถไม่ได้ คืนเงิน 100%"].map((x) => (
            <div key={x} style={{ background: "#fff", border: "2px solid #EEE6DA", borderRadius: 999, padding: "10px 22px" }}>{x}</div>
          ))}
        </div>
      </div>
    ),
    { ...size, fonts: kanit ? [{ name: "Kanit", data: kanit, weight: 600, style: "normal" }] : [] },
  );
}
