import type { VehicleType } from "@prisma/client";

// illustration side-view ของรถ 4 ประเภท (จาก prototype)
const WHEELS = (a: number, b: number, r = 26) => (
  <>
    <circle cx={a} cy="152" r={r} fill="#1A2B3C" />
    <circle cx={a} cy="152" r={r / 2.2} fill="#F5EFE6" />
    <circle cx={b} cy="152" r={r} fill="#1A2B3C" />
    <circle cx={b} cy="152" r={r / 2.2} fill="#F5EFE6" />
  </>
);

export function VehicleArt({ type, className }: { type: VehicleType; className?: string }) {
  return (
    <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      {type === "VAN_VIP8" && (
        <>
          <path d="M40 140 L40 92 Q40 70 62 66 L120 52 Q135 48 150 48 L330 48 Q356 48 364 72 L372 100 Q380 105 380 118 L380 140 Q380 150 370 150 L50 150 Q40 150 40 140Z" fill="#14B8A6" />
          <path d="M40 118 L380 118 L380 140 Q380 150 370 150 L50 150 Q40 150 40 140Z" fill="#0F9488" />
          <path d="M66 76 L120 63 Q133 60 146 60 L160 60 L160 104 L52 104 Q52 82 66 76Z" fill="#DFF7F3" />
          <rect x="172" y="60" width="68" height="44" rx="6" fill="#DFF7F3" />
          <rect x="252" y="60" width="68" height="44" rx="6" fill="#DFF7F3" />
          <path d="M332 60 L340 60 Q352 60 356 72 L366 104 L332 104Z" fill="#DFF7F3" />
          <rect x="52" y="110" width="314" height="4" rx="2" fill="#FFC93C" />
          <rect x="372" y="98" width="10" height="14" rx="3" fill="#FFC93C" />
          <rect x="34" y="118" width="12" height="14" rx="3" fill="#FF6B6B" />
          {WHEELS(110, 300)}
        </>
      )}
      {type === "VAN_VIP10" && (
        <>
          <path d="M30 140 L30 92 Q30 70 52 66 L110 52 Q125 48 140 48 L340 48 Q366 48 374 72 L382 100 Q390 105 390 118 L390 140 Q390 150 380 150 L40 150 Q30 150 30 140Z" fill="#FFC93C" />
          <path d="M56 76 L110 63 Q123 60 136 60 L150 60 L150 104 L42 104 Q42 82 56 76Z" fill="#FFF6DA" />
          <rect x="162" y="60" width="56" height="44" rx="6" fill="#FFF6DA" />
          <rect x="228" y="60" width="56" height="44" rx="6" fill="#FFF6DA" />
          <rect x="294" y="60" width="44" height="44" rx="6" fill="#FFF6DA" />
          <path d="M346 60 L352 60 Q364 60 368 72 L376 104 L346 104Z" fill="#FFF6DA" />
          {WHEELS(100, 310)}
        </>
      )}
      {type === "SUV" && (
        <>
          <path d="M50 140 L50 100 Q50 84 66 80 L110 58 Q124 50 140 50 L270 50 Q290 50 300 62 L336 92 L362 98 Q380 102 380 118 L380 140 Q380 150 370 150 L60 150 Q50 150 50 140Z" fill="#FF6B6B" />
          <path d="M118 66 L140 60 L200 60 L200 96 L92 96Z" fill="#FFECEC" />
          <path d="M212 60 L268 60 Q282 60 290 70 L318 96 L212 96Z" fill="#FFECEC" />
          {WHEELS(120, 300, 28)}
        </>
      )}
      {type === "SEDAN" && (
        <>
          <path d="M50 140 L50 108 Q50 92 66 88 L120 68 Q134 60 150 60 L250 60 Q270 60 282 72 L316 100 L360 106 Q380 110 380 124 L380 140 Q380 150 370 150 L60 150 Q50 150 50 140Z" fill="#14B8A6" />
          <path d="M126 76 L150 70 L196 70 L196 100 L100 100Z" fill="#DFF7F3" />
          <path d="M208 70 L250 70 Q262 70 270 78 L296 100 L208 100Z" fill="#DFF7F3" />
          {WHEELS(120, 300)}
        </>
      )}
    </svg>
  );
}
