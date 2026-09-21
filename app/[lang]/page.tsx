import type { Metadata } from "next";
import Link from "next/link";
import { Nav, Footer, StickyBar, chatUrl } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { QuickBar } from "@/components/site/QuickBar";
import { VehicleCards } from "@/components/site/VehicleCards";
import { PhotoStrip } from "@/components/site/PhotoStrip";
import { Counter } from "@/components/site/Counter";
import { Reveal } from "@/components/ui/Reveal";
import { BRAND, REVIEWS, SERVICE_ORDER } from "@/lib/config";
import { getDict, href, isLang, type Lang } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  return lang === "en"
    ? { title: { absolute: `${BRAND.name} — Airport transfers, VIP vans & private drivers in Phuket` }, description: "VIP vans, SUVs and sedans with drivers across Phuket and Southern Thailand. Tell us where and when — we find the right car and quote within 30 minutes.", alternates: { canonical: "/en", languages: { th: "/", en: "/en" } } }
    : { alternates: { canonical: "/", languages: { th: "/", en: "/en" } } };
}

function SectionHead({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <Reveal className="text-center max-w-[640px] mx-auto mb-12">
      <span className="kicker">{kicker}</span>
      <h2 className="text-[clamp(30px,4vw,42px)] font-semibold mb-3">{title}</h2>
      {sub && <p className="text-ink-soft text-[17px]">{sub}</p>}
    </Reveal>
  );
}

const STEP_STYLE = ["bg-teal text-white shadow-[0_12px_24px_-8px_rgba(20,184,166,.6)]", "bg-sun text-ink shadow-[0_12px_24px_-8px_rgba(255,201,60,.7)]", "bg-coral text-white shadow-[0_12px_24px_-8px_rgba(255,107,107,.7)]", "bg-ink text-white"];
const STAT_STYLE = ["text-teal-deep", "text-coral", "text-[#C99400]"];

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang: raw } = await params;
  const lang: Lang = isLang(raw) ? raw : "th";
  const t = getDict(lang);
  return (
    <>
      <Nav lang={lang} path="/" />
      <Hero lang={lang} />
      <QuickBar lang={lang} />

      {/* ป้ายรับรอง */}
      <div className="max-w-[1140px] mx-auto px-5 mt-8">
        <Reveal className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {t.trust.items.map((b) => (
            <div key={b.t} className="flex items-center gap-3 bg-white/70 border border-line rounded-2xl px-4 py-3">
              <span className="text-2xl">{b.icon}</span>
              <div><b className="kanit font-medium text-[14.5px] block leading-tight">{b.t}</b><small className="text-ink-soft text-[12.5px]">{b.d}</small></div>
            </div>
          ))}
        </Reveal>
      </div>

      <section id="vehicles" className="pt-[90px] pb-14">
        <div className="max-w-[1140px] mx-auto px-5">
          <SectionHead kicker={t.vehicle.kicker} title={t.vehicle.title} sub={t.vehicle.sub} />
          <VehicleCards lang={lang} />
        </div>
      </section>

      {/* บรรยากาศในรถ — รูปจริง */}
      <section id="gallery" className="pb-[90px]">
        <div className="max-w-[1140px] mx-auto px-5">
          <SectionHead kicker={t.gallery.kicker} title={t.gallery.title} sub={t.gallery.sub} />
          <Reveal><PhotoStrip lang={lang} /></Reveal>
        </div>
      </section>

      <section id="services" className="py-[90px] bg-white border-y border-line">
        <div className="max-w-[1140px] mx-auto px-5">
          <SectionHead kicker={t.service.kicker} title={t.service.title} sub={t.service.sub} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[18px]">
            {SERVICE_ORDER.map((k, i) => {
              const s = t.service[k];
              const ic = ["bg-teal-wash", "bg-sun-wash", "bg-coral-wash", "bg-[#EEF2FF]"][i];
              const icon = ["🛬", "📍", "🚐", "🗺️"][i];
              return (
                <Reveal key={k} className="scard" delay={i * 80}>
                  <div className={`w-[52px] h-[52px] rounded-2xl grid place-items-center mb-4 text-2xl ${ic}`}>{icon}</div>
                  <h3 className="text-[19px] font-semibold mb-1.5">{s.name}</h3>
                  <p className="text-[14.5px] text-ink-soft">{s.desc}</p>
                  <div className="note mt-3 text-[13px] flex flex-wrap gap-1.5">{s.tags.map((tag) => <span key={tag} className="bg-white border border-line px-2 py-0.5 rounded-lg font-medium transition-colors">{tag}</span>)}</div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how" className="py-[90px]">
        <div className="max-w-[1140px] mx-auto px-5">
          <SectionHead kicker={t.how.kicker} title={t.how.title} />
          <Reveal className="steps-line mx-[8%] mb-7" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {t.how.steps.map(([title, desc], i) => (
              <Reveal key={title} className="step text-center p-2.5" delay={i * 100}>
                <div className={`n w-16 h-16 rounded-[22px] mx-auto mb-4 grid place-items-center kanit font-semibold text-[22px] ${STEP_STYLE[i]}`}>{i + 1}</div>
                <h3 className="text-[19px] font-semibold mb-1.5">{title}</h3>
                <p className="text-[14.5px] text-ink-soft">{desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="airport" className="pb-[90px]">
        <div className="max-w-[1140px] mx-auto px-5">
          <SectionHead kicker={t.airport.kicker} title={t.airport.title} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[18px]">
            {t.airport.items.map((a, i) => (
              <Reveal key={a.t} className="card p-6 !shadow-none hover:shadow-soft transition-shadow" delay={i * 80}>
                <div className="w-12 h-12 rounded-2xl bg-sun-wash grid place-items-center text-2xl mb-3.5">{a.icon}</div>
                <h3 className="text-[18px] font-semibold mb-1.5">{a.t}</h3>
                <p className="text-[14.5px] text-ink-soft">{a.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="routes" className="py-[90px] bg-ink text-white rounded-[40px] mx-5">
        <div className="max-w-[1140px] mx-auto px-5">
          <Reveal className="text-center max-w-[640px] mx-auto mb-12">
            <span className="kicker !bg-white/10 !text-sun">{t.routes.kicker}</span>
            <h2 className="text-[clamp(30px,4vw,42px)] font-semibold mb-3">{t.routes.title}</h2>
            <p className="opacity-70 text-[17px]">{t.routes.sub}</p>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-[18px]">
            {t.routes.items.map((r, i) => (
              <Reveal key={r.to} className="rcard" delay={i * 100}>
                <div className="flex justify-between kanit font-medium text-lg mb-2.5"><span>{r.from}</span><span>{r.to}</span></div>
                <svg viewBox="0 0 300 40" className="w-full h-10 overflow-visible"><path className="path" d="M8 20 C 80 -10, 200 50, 290 20" /><circle className="car" r="6" fill={r.color} style={{ animationDelay: `${-i * 1.2}s` }} /></svg>
                <div className="flex justify-between text-sm opacity-75 mt-2"><span>{r.time}</span><b className="text-sun font-semibold">{r.cars}</b></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* รีวิว — แสดงเมื่อมีรีวิวจริง (sample: false) อย่างน้อย 1 อัน */}
      {REVIEWS.some((r) => !r.sample) && <section id="reviews" className="pt-[90px]">
        <div className="max-w-[1140px] mx-auto px-5">
          <SectionHead kicker={t.reviews.kicker} title={t.reviews.title} />
          <div className="grid md:grid-cols-3 gap-[18px]">
            {REVIEWS.filter((r) => !r.sample).map((r, i) => (
              <Reveal key={r.name} className="card p-6 !shadow-none relative" delay={i * 100}>
                {r.sample && <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wide bg-sun-wash text-[#8A6200] px-2 py-0.5 rounded-full" title={t.reviews.sample}>sample</span>}
                <div className="text-sun tracking-wider mb-2">{"★".repeat(r.stars)}</div>
                <p className="text-[15px] mb-4">“{r.text[lang]}”</p>
                <div className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-full bg-teal-wash grid place-items-center kanit font-medium text-teal-deep">{r.name[0]}</div><div className="text-[13px]"><b className="block">{r.name}</b><span className="text-ink-soft">{r.where}</span></div></div>
              </Reveal>
            ))}
          </div>
          {BRAND.googleReviewUrl && <div className="text-center mt-6"><a className="btn btn-ghost" href={BRAND.googleReviewUrl} target="_blank" rel="noopener">{BRAND.googleRating ? `★ ${BRAND.googleRating} · ` : ""}{t.reviews.google}</a></div>}
        </div>
      </section>}

      <section id="policy" className="py-[90px]">
        <div className="max-w-[1140px] mx-auto px-5">
          <div className="grid sm:grid-cols-3 gap-[18px] mb-12">
            {t.stats.map((s, i) => (
              <Reveal key={s.label} className="card p-[26px] text-center" delay={i * 100}>
                <Counter to={s.n} suffix={s.suffix} className={`kanit text-[44px] font-semibold leading-none ${STAT_STYLE[i]}`} />
                <p className="text-ink-soft mt-1.5 text-[15px]">{s.label}</p>
              </Reveal>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-[18px]">
            <PolicyCard icon="💳" title={t.policy.payment.title} items={t.policy.payment.items} />
            <PolicyCard icon="🗓️" title={t.policy.cancel.title} items={t.policy.cancel.items} delay={100} />
          </div>
        </div>
      </section>

      <section id="faq" className="pb-[90px]">
        <div className="max-w-[1140px] mx-auto px-5">
          <SectionHead kicker={t.faq.kicker} title={t.faq.title} />
          <Reveal className="max-w-[760px] mx-auto">
            {t.faq.items.map((f) => (
              <details key={f.q} className="faq"><summary>{f.q}</summary><p className="pb-[18px] text-ink-soft text-[15px]">{f.a}</p></details>
            ))}
          </Reveal>
        </div>
      </section>

      <div className="px-5 pb-[90px]">
        <div className="max-w-[1140px] mx-auto">
          <Reveal className="relative overflow-hidden rounded-[36px] px-10 py-16 text-center text-white bg-gradient-to-br from-teal to-[#2DD4BF] before:absolute before:w-[300px] before:h-[300px] before:rounded-full before:bg-white/10 before:-top-[120px] before:-right-20 after:absolute after:w-[200px] after:h-[200px] after:rounded-full after:bg-white/10 after:-bottom-[90px] after:-left-10">
            <h2 className="relative text-[clamp(30px,4vw,44px)] font-semibold mb-2.5">{t.final.title}</h2>
            <p className="relative opacity-90 text-[17px] mb-6">{t.final.sub(BRAND.replyMinutes, t.hoursText)}</p>
            <div className="relative flex gap-3 justify-center flex-wrap">
              <Link className="btn !bg-white !text-teal-deep hover:!bg-sun-wash shadow-[0_10px_24px_-8px_rgba(0,0,0,.25)]" href={href(lang, "/request")}>{t.final.cta}</Link>
              <a className="btn btn-line" href={chatUrl(lang)} target="_blank" rel="noopener">{t.final.chat}</a>
            </div>
          </Reveal>
        </div>
      </div>

      <Footer lang={lang} />
      <StickyBar lang={lang} />
    </>
  );
}

function PolicyCard({ icon, title, items, delay = 0 }: { icon: string; title: string; items: [string, string][]; delay?: number }) {
  return (
    <Reveal className="card p-[26px] !shadow-none" delay={delay}>
      <h3 className="text-[19px] font-semibold mb-3 flex items-center gap-2.5"><i className="not-italic w-8 h-8 rounded-[10px] grid place-items-center bg-teal-wash text-base">{icon}</i>{title}</h3>
      <ul className="grid gap-2 text-[15px]">
        {items.map(([k, text]) => (
          <li key={text} className="flex gap-2.5 items-start"><span className={`font-bold shrink-0 ${k === "ok" ? "text-teal" : "text-coral"}`}>{k === "ok" ? "✓" : "✕"}</span>{text}</li>
        ))}
      </ul>
    </Reveal>
  );
}
