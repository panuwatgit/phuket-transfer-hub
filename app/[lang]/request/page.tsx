import type { Metadata } from "next";
import { Nav } from "@/components/site/Nav";
import { RequestForm } from "@/components/request/RequestForm";
import { BRAND } from "@/lib/config";
import { getDict, isLang, type Lang } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/request">): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDict(isLang(lang) ? lang : "th").form.title };
}

export default async function RequestPage({ params, searchParams }: PageProps<"/[lang]/request">) {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : "th";
  const t = getDict(lang);
  const sp = await searchParams;
  const pick = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  return (
    <>
      <Nav lang={lang} path="/request" links={false} />
      <main className="max-w-[1140px] mx-auto px-5 pt-9 pb-32">
        <div className="flex justify-between items-end gap-5 mb-5 flex-wrap">
          <div><h1 className="text-[clamp(26px,3.5vw,36px)] font-semibold">{t.form.title}</h1><p className="text-ink-soft">{t.form.sub}</p></div>
          <span className="text-sm text-ink-soft">{t.form.meta(BRAND.replyMinutes)}</span>
        </div>
        <RequestForm lang={lang} prefill={{ type: pick("type"), to: pick("to"), date: pick("date"), pax: pick("pax") }} />
      </main>
    </>
  );
}
