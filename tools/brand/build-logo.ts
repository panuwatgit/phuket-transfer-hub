// สร้างไฟล์โลโก้ PTH Badge ทั้งชุดเป็น SVG (ตัวอักษรแปลงเป็น path แล้ว) → public/brand/
// รัน: npx tsx tools/brand/build-logo.ts
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import opentype from "opentype.js";

const dir = join(process.cwd(), "tools/brand");
const out = join(process.cwd(), "public/brand");
mkdirSync(out, { recursive: true });
const load = (f: string) => opentype.parse(readFileSync(join(dir, f)).buffer.slice(0) as ArrayBuffer);
const bold = load("Kanit-Bold.ttf");
const semi = load("Kanit-SemiBold.ttf");
const med = load("Kanit-Medium.ttf");

const C = { teal: "#14B8A6", tealDeep: "#0F9488", coral: "#FF6B6B", sun: "#FFC93C", ink: "#1A2B3C", inkSoft: "#5B6B7A", white: "#FFFFFF" };
const r2 = (n: number) => Math.round(n * 100) / 100;

/** serialize path เอง — opentype.js toPathData() มีบั๊กพ่น "NaN" กับบางค่า */
function pathData(p: opentype.Path, dp = 2) {
  const n = (v: number) => { const s = v.toFixed(dp); return s.replace(/\.?0+$/, "") || "0"; };
  return p.commands.map((c) => {
    switch (c.type) {
      case "M": return `M${n(c.x)} ${n(c.y)}`;
      case "L": return `L${n(c.x)} ${n(c.y)}`;
      case "Q": return `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`;
      case "C": return `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`;
      case "Z": return "Z";
    }
  }).join("");
}

/** path data ของข้อความ วางให้กึ่งกลางที่ cx (ถ้าให้) */
function textPath(font: opentype.Font, text: string, x: number, y: number, size: number, center = false) {
  const w = font.getAdvanceWidth(text, size);
  const p = font.getPath(text, center ? x - w / 2 : x, y, size);
  const d = pathData(p);
  if (d.includes("NaN")) throw new Error("NaN in path for " + text);
  return { d, width: r2(w) };
}

// ── mark 64×64 ────────────────────────────────────────────────────────────
const PTH = textPath(bold, "PTH", 32, 34, 21, true).d;
function mark(bg: string, fg: string, road = true, roadColors = [C.sun, C.coral]) {
  return `<g transform="rotate(-6 32 32)"><rect x="6" y="6" width="52" height="52" rx="17" fill="${bg}"/><path d="${PTH}" fill="${fg}"/>${road ? `<rect x="16" y="41" width="32" height="4" rx="2" fill="${roadColors[0]}"/><rect x="28" y="41" width="8" height="4" rx="2" fill="${roadColors[1]}"/>` : ""}</g>`;
}
const svg = (w: number, h: number, body: string, vb = `0 0 ${w} ${h}`) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${vb}">${body}</svg>\n`;

writeFileSync(join(out, "mark.svg"), svg(64, 64, mark(C.teal, C.white)));
writeFileSync(join(out, "mark-white.svg"), svg(64, 64, mark(C.white, C.tealDeep)));
writeFileSync(join(out, "mark-mono.svg"), svg(64, 64, mark(C.ink, C.white, true, [C.white, C.white])));
writeFileSync(join(out, "mark-mono-white.svg"), svg(64, 64, mark(C.white, C.ink, true, [C.ink, C.ink])));

// ── wordmark ──────────────────────────────────────────────────────────────
const W_SIZE = 34, T_SIZE = 12.5;
const w1 = textPath(semi, "Phuket Transfer ", 0, 0, W_SIZE);
const w2 = textPath(semi, "Hub", w1.width, 0, W_SIZE);
const tag = textPath(med, "คุยง่าย ราคาถูกใจ", 0, 0, T_SIZE);
const tagEn = textPath(med, "Phuket · Southern Thailand", 0, 0, T_SIZE);
const wordW = r2(w1.width + w2.width);

function wordmark(ink: string, accent: string, sub: string, tagline: { d: string } | null, x: number, y: number) {
  return `<g transform="translate(${x} ${y})"><path d="${w1.d}" fill="${ink}"/><path d="${w2.d}" fill="${accent}"/>${tagline ? `<g transform="translate(1 20)"><path d="${tagline.d}" fill="${sub}"/></g>` : ""}</g>`;
}

// horizontal lockup: mark 84px + gap 18 + wordmark
const MH = 84, GAP = 18, PAD = 12;
const LW = r2(PAD + MH + GAP + wordW + PAD), LH = 108;
function lockup(bg: string | null, markSvg: string, ink: string, accent: string, sub: string, tagline: { d: string } | null) {
  const markG = `<g transform="translate(${PAD} ${(LH - MH) / 2}) scale(${MH / 64})">${markSvg}</g>`;
  const ty = tagline ? LH / 2 + 4 : LH / 2 + 12;
  return svg(LW, LH, `${bg ? `<rect width="${LW}" height="${LH}" rx="24" fill="${bg}"/>` : ""}${markG}${wordmark(ink, accent, sub, tagline, PAD + MH + GAP, ty)}`);
}
writeFileSync(join(out, "logo-horizontal.svg"), lockup(null, mark(C.teal, C.white), C.ink, C.coral, C.inkSoft, tag));
writeFileSync(join(out, "logo-horizontal-en.svg"), lockup(null, mark(C.teal, C.white), C.ink, C.coral, C.inkSoft, tagEn));
writeFileSync(join(out, "logo-horizontal-white.svg"), lockup(null, mark(C.white, C.tealDeep), C.white, C.sun, "rgba(255,255,255,.75)", tag));
writeFileSync(join(out, "logo-horizontal-mono.svg"), lockup(null, mark(C.ink, C.white, true, [C.white, C.white]), C.ink, C.ink, C.ink, tag));
writeFileSync(join(out, "logo-on-teal.svg"), lockup(C.tealDeep, mark(C.white, C.tealDeep), C.white, C.sun, "rgba(255,255,255,.75)", tag));

// stacked (square-ish, for profile pictures / LINE OA)
const SW = 360, SH = 300;
const stackWordScale = 0.78;
writeFileSync(join(out, "logo-stacked.svg"), svg(SW, SH, `<g transform="translate(${(SW - 140) / 2} 22) scale(${140 / 64})">${mark(C.teal, C.white)}</g><g transform="translate(${(SW - wordW * stackWordScale) / 2} 222) scale(${stackWordScale})">${wordmark(C.ink, C.coral, C.inkSoft, tag, 0, 0)}</g>`));

// social profile 512 (LINE OA / Facebook): mark ใหญ่กลางพื้น cream
writeFileSync(join(out, "profile-512.svg"), svg(512, 512, `<rect width="512" height="512" fill="#FFFBF5"/><g transform="translate(64 64) scale(6)">${mark(C.teal, C.white)}</g>`));

// favicon (mark only, ไม่เอียง เพื่อชัดที่ 16px) + apple-touch base
writeFileSync(join(process.cwd(), "app/icon.svg"), svg(64, 64, `<rect x="4" y="4" width="56" height="56" rx="18" fill="${C.teal}"/><path d="${textPath(bold, "PTH", 32, 34.5, 22, true).d}" fill="${C.white}"/><rect x="15" y="42" width="34" height="4.5" rx="2.25" fill="${C.sun}"/><rect x="28" y="42" width="8" height="4.5" rx="2.25" fill="${C.coral}"/>`));

// export path data for React component
writeFileSync(join(process.cwd(), "components/ui/brand-paths.ts"), `// generated by tools/brand/build-logo.ts — อย่าแก้มือ\nexport const PTH_PATH = "${PTH}";\n`);
console.log("brand files written:", LW, "x", LH);
