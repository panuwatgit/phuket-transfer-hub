"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/actions";
import { BrandMark } from "@/components/ui/BrandMark";

const NAV = [
  { href: "/admin", icon: "📋", label: "กระดาน" },
  { href: "/admin/list", icon: "🗂️", label: "รายการทั้งหมด" },
  { href: "/admin/partners", icon: "🚐", label: "พาร์ทเนอร์ & รถ" },
];
const LATER = [
  { icon: "📅", label: "ปฏิทินรถ" },
  { icon: "📈", label: "รายงาน" },
];

export function Sidebar({ newCount }: { newCount: number }) {
  const path = usePathname();
  const isOn = (h: string) => (h === "/admin" ? path === "/admin" || path.startsWith("/admin/requests") : path.startsWith(h));
  return (
    <>
      <aside className="hidden md:flex bg-white border-r border-line px-3.5 py-[18px] flex-col gap-1.5 sticky top-0 h-screen">
        <Link href="/admin" className="flex items-center gap-2.5 kanit font-semibold text-base px-2 pb-[18px]">
          <BrandMark size={40} className="-my-1" />
          <span>Transfer <span className="text-coral">Hub</span><small className="block text-[11px] font-normal text-ink-soft leading-none mt-0.5">หลังบ้าน</small></span>
        </Link>
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={`anav ${isOn(n.href) ? "on" : ""}`}>
            {n.icon} {n.label}
            {n.href === "/admin" && newCount > 0 && <span className="ml-auto bg-coral text-white text-xs px-2 rounded-full font-[family-name:var(--font-body)] font-semibold">{newCount}</span>}
          </Link>
        ))}
        {LATER.map((n) => (
          <span key={n.label} className="anav dis" title="เฟส 2">{n.icon} {n.label}<span className="ml-auto bg-line text-ink-soft text-[11px] px-2 rounded-full font-[family-name:var(--font-body)]">เฟส 2</span></span>
        ))}
        <div className="mt-auto flex items-center gap-2.5 p-2.5 border-t border-line text-[13px]">
          <div className="w-[34px] h-[34px] rounded-full bg-sun grid place-items-center kanit font-semibold">A</div>
          <div className="flex-1"><b>แอดมิน</b><br /><span className="inline-block w-2 h-2 rounded-full bg-green mr-1" /><span className="text-ink-soft">ออนไลน์</span></div>
          <form action={logout}><button className="text-ink-faint hover:text-coral-deep text-xs" title="ออกจากระบบ">ออก</button></form>
        </div>
      </aside>
      <nav className="md:hidden fixed left-0 right-0 bottom-0 bg-white border-t border-line z-[70] p-1.5 flex">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={`flex-1 text-center kanit text-xs py-2 px-1 rounded-[10px] ${isOn(n.href) ? "text-teal-deep bg-teal-wash" : "text-ink-soft"}`}>{n.icon} {n.label.replace("ทั้งหมด", "").replace("พาร์ทเนอร์ & ", "")}</Link>
        ))}
      </nav>
    </>
  );
}
