import type { Metadata } from "next";
import { Nav, Footer, StickyBar } from "@/components/site/Nav";
import { BRAND } from "@/lib/config";
import { getDict, isLang, type Lang } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/terms">): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDict(isLang(lang) ? lang : "th").terms.title };
}

export default async function TermsPage({ params }: PageProps<"/[lang]/terms">) {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : "th";
  const t = getDict(lang);
  return (
    <>
      <Nav lang={lang} path="/terms" links={false} />
      <main className="max-w-[760px] mx-auto px-5 py-12 pb-32 md:pb-16">
        <h1 className="text-3xl font-semibold mb-2">{t.terms.title}</h1>
        <p className="text-ink-soft mb-8">{t.terms.intro(BRAND.name)}</p>
        {t.terms.sections.map((s) => (
          <section key={s.title} className="card p-6 mb-4 !shadow-none">
            <h2 className="text-xl font-semibold mb-3">{s.title}</h2>
            <ul className="grid gap-2 text-[15px] list-disc pl-5 marker:text-teal">{s.items.map((i) => <li key={i}>{i}</li>)}</ul>
          </section>
        ))}
        <p className="text-sm text-ink-soft">{t.footer.hours} {t.hoursText} · LINE {BRAND.lineOaId} · WhatsApp +{BRAND.whatsapp} · {BRAND.email}</p>
      </main>
      <Footer lang={lang} />
      <StickyBar lang={lang} />
    </>
  );
}
