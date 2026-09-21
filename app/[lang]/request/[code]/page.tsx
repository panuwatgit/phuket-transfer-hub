import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Nav } from "@/components/site/Nav";
import { Confetti } from "@/components/request/Confetti";
import { BRAND, lineAddFriendUrl, lineOaMessageUrl, mailtoUrl, whatsappUrl } from "@/lib/config";
import { getDict, href, isLang, type Lang } from "@/lib/i18n";
import { customerMessage } from "@/lib/request-view";

export async function generateMetadata({ params }: PageProps<"/[lang]/request/[code]">): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDict(isLang(lang) ? lang : "th").success.title };
}

export default async function SuccessPage({ params }: PageProps<"/[lang]/request/[code]">) {
  const { lang: raw, code } = await params;
  const lang: Lang = isLang(raw) ? raw : "th";
  const t = getDict(lang);
  const r = await prisma.bookingRequest.findUnique({ where: { code: code.toUpperCase() } });
  if (!r) notFound();
  const text = customerMessage(r, lang);
  // ไทย → LINE เป็นหลัก · อังกฤษ → WhatsApp เป็นหลัก · อีเมลเป็นทางเลือกทั้งคู่
  const linked = !!r.lineUserId;
  const primary = lang === "en" ? { href: whatsappUrl(text), label: t.success.waBtn } : linked ? { href: lineAddFriendUrl(), label: t.success.openLine } : { href: lineOaMessageUrl(text), label: t.success.lineBtn };
  const secondary = lang === "en" ? { href: mailtoUrl(t.success.mailSubject(r.code), text), label: t.success.mailBtn } : { href: whatsappUrl(text), label: t.success.waBtn };

  return (
    <>
      <Nav lang={lang} path="/request" links={false} />
      <Confetti />
      <main className="max-w-[760px] mx-auto px-5 pt-9 pb-32">
        <div className="card text-center px-7 py-12">
          <div className="w-24 h-24 rounded-[30px] bg-teal grid place-items-center mx-auto mb-5 text-white text-[44px] shadow-[0_20px_40px_-12px_rgba(20,184,166,.6)] [animation:pop_.5s_cubic-bezier(.2,.8,.2,1)]">✓</div>
          <h2 className="text-3xl font-semibold mb-1.5">{t.success.title}</h2>
          <div className="inline-block kanit font-semibold text-[34px] tracking-wide text-coral bg-coral-wash px-5 py-2 rounded-[14px] my-3.5">{r.code}</div>
          <p className="text-ink-soft max-w-[520px] mx-auto">{t.success.sub(BRAND.replyMinutes, t.hoursText)}</p>

          {linked && lang === "th" && <div className="mt-5 inline-block bg-[#E5F9EC] text-[#06A047] font-medium px-4 py-2 rounded-xl">{t.success.lineSent}</div>}
          <div className="mt-6 flex flex-col items-center gap-2.5">
            <a className="btn btn-line !text-lg !px-7 !py-[18px]" href={primary.href} target="_blank" rel="noopener">{primary.label}</a>
            <a className="btn btn-ghost btn-sm !rounded-full" href={secondary.href} target="_blank" rel="noopener">{secondary.label}</a>
          </div>
          <div className="mt-4 mx-auto max-w-[560px] text-left bg-white border-[1.5px] border-dashed border-lineapp rounded-2xl px-4 py-3.5 text-[13.5px] text-ink-soft whitespace-pre-line">
            <span className="block kanit font-medium text-[#06A047] mb-1.5 text-[13px]">{t.success.preview}</span>{text}
          </div>

          <div className="mt-7 mx-auto max-w-[560px] text-left bg-cream border border-line rounded-2xl p-5">
            <h4 className="text-base font-semibold mb-2.5">{t.success.nextTitle}</h4>
            <ol className="pl-5 list-decimal text-[14.5px] grid gap-1.5 text-ink-soft marker:font-semibold">
              {t.success.next.map((n) => <li key={n}>{n}</li>)}
            </ol>
          </div>
          <div className="flex gap-3 justify-center flex-wrap mt-6">
            <Link className="btn btn-ghost" href={href(lang)}>{t.success.home}</Link>
            <Link className="btn btn-ghost" href={href(lang, "/request")}>{t.success.again}</Link>
          </div>
          <p className="text-xs text-ink-faint mt-5">{t.success.fallback(r.phone)}</p>
        </div>
      </main>
    </>
  );
}
