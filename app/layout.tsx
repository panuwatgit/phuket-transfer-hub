import type { Metadata } from "next";
import { Kanit, Sarabun } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/lib/config";

// ฟอนต์ไทยทันสมัย — Kanit หัวข้อ, Sarabun เนื้อหา (PLAN.md §9)
const kanit = Kanit({ variable: "--font-kanit", subsets: ["latin", "thai"], weight: ["400", "500", "600", "700"], display: "swap" });
const sarabun = Sarabun({ variable: "--font-sarabun", subsets: ["latin", "thai"], weight: ["400", "500", "600"], display: "swap" });

export const metadata: Metadata = {
  title: { default: `${BRAND.name} — ${BRAND.slogan}`, template: `%s — ${BRAND.name}` },
  description: "จัดหารถตู้ VIP, SUV และรถเก๋งพร้อมคนขับ ทั่วภูเก็ตและภาคใต้ บอกความต้องการ เราหารถที่ใช่และเสนอราคาให้ภายใน 30 นาที",
  metadataBase: new URL(BRAND.siteUrl),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${kanit.variable} ${sarabun.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
