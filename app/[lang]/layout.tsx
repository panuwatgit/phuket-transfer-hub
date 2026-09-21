import { notFound } from "next/navigation";
import { isLang, LANGS } from "@/lib/i18n";
import { HtmlLang } from "@/components/ui/HtmlLang";

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    <>
      <HtmlLang lang={lang} />
      {children}
    </>
  );
}
