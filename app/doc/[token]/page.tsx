import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DocumentView } from "@/components/doc/DocumentView";
import { PrintBar } from "@/components/doc/PrintBar";
import { DOC_LABEL } from "@/lib/documents";

export async function generateMetadata({ params }: PageProps<"/doc/[token]">): Promise<Metadata> {
  const { token } = await params;
  const d = await prisma.document.findUnique({ where: { token } });
  return { title: d ? `${DOC_LABEL[d.type][d.lang === "en" ? "en" : "th"]} ${d.number}` : "Document", robots: { index: false, follow: false } };
}

export default async function DocPage({ params }: PageProps<"/doc/[token]">) {
  const { token } = await params;
  const doc = await prisma.document.findUnique({ where: { token }, include: { request: true } });
  if (!doc) notFound();
  return (
    <main className="min-h-screen bg-[#F6F1E9] print:bg-white px-4 py-6 md:py-10 print:p-0">
      <PrintBar lang={doc.lang} />
      <DocumentView doc={doc} request={doc.request} />
    </main>
  );
}
