import { PTH_PATH } from "./brand-paths";

type Variant = "color" | "white" | "mono";
const V: Record<Variant, { bg: string; fg: string; road: [string, string] }> = {
  color: { bg: "#14B8A6", fg: "#fff", road: ["#FFC93C", "#FF6B6B"] },
  white: { bg: "#fff", fg: "#0F9488", road: ["#FFC93C", "#FF6B6B"] },
  mono: { bg: "#1A2B3C", fg: "#fff", road: ["#fff", "#fff"] },
};

/** PTH Badge — ตัวอักษรเป็น path แล้ว (generated) ใช้ได้โดยไม่พึ่งฟอนต์ */
export function BrandMark({ size = 40, variant = "color", tilt = true, className }: { size?: number; variant?: Variant; tilt?: boolean; className?: string }) {
  const c = V[variant];
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden>
      <g transform={tilt ? "rotate(-6 32 32)" : undefined}>
        <rect x="6" y="6" width="52" height="52" rx="17" fill={c.bg} />
        <path d={PTH_PATH} fill={c.fg} />
        <rect x="16" y="41" width="32" height="4" rx="2" fill={c.road[0]} />
        <rect x="28" y="41" width="8" height="4" rx="2" fill={c.road[1]} />
      </g>
    </svg>
  );
}
