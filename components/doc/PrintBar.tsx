"use client";

export function PrintBar({ lang }: { lang: string }) {
  const en = lang === "en";
  return (
    <div className="print:hidden max-w-[794px] mx-auto flex items-center justify-between gap-3 mb-4 flex-wrap">
      <span className="text-sm text-ink-soft">{en ? "Save this document as PDF or print it" : "บันทึกเป็น PDF หรือพิมพ์ได้จากปุ่มนี้"}</span>
      <button className="btn btn-teal btn-sm" onClick={() => window.print()}>🖨️ {en ? "Save as PDF / Print" : "บันทึก PDF / พิมพ์"}</button>
    </div>
  );
}
