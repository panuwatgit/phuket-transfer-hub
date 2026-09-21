import Link from "next/link";
import { BRAND, lineAddFriendUrl, whatsappUrl } from "@/lib/config";
import { getDict, href, type Lang } from "@/lib/i18n";

export function Logo({ lang = "th", sub = BRAND.slogan }: { lang?: Lang; sub?: string }) {
  return (
    <Link href={href(lang)} className="flex items-center gap-2.5 font-[family-name:var(--font-display)] font-semibold text-lg">
      <span className="w-10 h-10 rounded-xl bg-teal text-white grid place-items-center text-sm tracking-wide -rotate-6 shadow-[0_8px_16px_-6px_rgba(20,184,166,.6)]">{BRAND.short}</span>
      <span>{BRAND.name}<small className="block text-[11px] font-normal text-ink-soft leading-none">{sub}</small></span>
    </Link>
  );
}

/** ลิงก์แชทหลักตามภาษา: ไทย = LINE, อังกฤษ = WhatsApp */
export const chatUrl = (lang: Lang) => (lang === "en" ? whatsappUrl() : lineAddFriendUrl());

export function LangSwitch({ lang, path }: { lang: Lang; path: string }) {
  const other: Lang = lang === "th" ? "en" : "th";
  return (
    <Link href={href(other, path)} hrefLang={other} className="kanit text-sm font-medium pl-2.5 pr-3 py-1.5 rounded-full border-2 border-line bg-white hover:border-teal hover:text-teal-deep transition-colors inline-flex items-center gap-1.5" aria-label={other === "en" ? "English" : "ภาษาไทย"}>
      <span className="text-base leading-none">{other === "en" ? "🇬🇧" : "🇹🇭"}</span>{getDict(lang).nav.switch}
    </Link>
  );
}

export function Nav({ lang, path = "/", links = true }: { lang: Lang; path?: string; links?: boolean }) {
  const t = getDict(lang);
  const items: [string, string][] = [["#vehicles", t.nav.vehicles], ["#services", t.nav.services], ["#routes", t.nav.routes], ["#policy", t.nav.policy], ["#faq", t.nav.faq]];
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-cream/80 border-b border-line/70">
      <div className="max-w-[1140px] mx-auto px-5 h-[72px] flex items-center justify-between gap-3">
        <Logo lang={lang} sub={lang === "en" ? "Phuket · Southern Thailand" : BRAND.slogan} />
        {links && (
          <ul className="hidden lg:flex gap-7 font-medium">
            {items.map(([h, label]) => (
              <li key={h}><a href={`${href(lang)}${h}`} className="relative py-1.5 after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-0 after:bg-teal after:rounded after:transition-all hover:after:w-full">{label}</a></li>
            ))}
          </ul>
        )}
        <div className="flex gap-2.5 items-center">
          <LangSwitch lang={lang} path={path} />
          <a className="btn btn-ghost btn-sm !rounded-full hidden md:inline-flex" href={chatUrl(lang)} target="_blank" rel="noopener">{t.nav.chat}</a>
          <Link className="btn btn-primary btn-sm !rounded-full" href={href(lang, "/request")}>{t.nav.quote}</Link>
        </div>
      </div>
    </nav>
  );
}

export function StickyBar({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  return (
    <div className="md:hidden fixed left-3 right-3 bottom-3 z-[60] flex gap-2 bg-white/90 backdrop-blur-lg p-2.5 rounded-[20px] shadow-lift border border-line">
      <a className="btn btn-ghost !py-3 !px-4" href={`tel:${BRAND.phone.replace(/-/g, "")}`} aria-label={t.sticky.call}>📞</a>
      <a className="btn btn-line flex-1 !py-3" href={chatUrl(lang)} target="_blank" rel="noopener">{t.sticky.chat}</a>
      <Link className="btn btn-primary flex-1 !py-3" href={href(lang, "/request")}>{t.sticky.quote}</Link>
    </div>
  );
}

export function Footer({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  return (
    <footer className="bg-white border-t border-line py-10 pb-28 md:pb-10 text-sm text-ink-soft">
      <div className="max-w-[1140px] mx-auto px-5 flex justify-between flex-wrap gap-5">
        <div><b className="kanit text-ink">{BRAND.name}</b><br />{BRAND.company ? `${BRAND.company} · ` : ""}{lang === "en" ? "Phuket, Thailand" : "ภูเก็ต ประเทศไทย"}<br />{t.footer.line}: {BRAND.lineOaId} · {t.footer.phone}: {BRAND.phone}<br />{t.footer.email}: <a href={`mailto:${BRAND.email}`} className="hover:text-teal-deep">{BRAND.email}</a></div>
        <div>{t.footer.hours} {t.hoursText}<br /><Link href={href(lang, "/terms")} className="underline decoration-line hover:text-teal-deep">{t.footer.terms}</Link></div>
        <div>© {new Date().getFullYear()} {BRAND.name}</div>
      </div>
    </footer>
  );
}
