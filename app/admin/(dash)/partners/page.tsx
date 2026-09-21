import { prisma } from "@/lib/prisma";
import { PartnersView } from "@/components/admin/PartnersView";

export default async function PartnersPage() {
  const partners = await prisma.partner.findMany({ include: { vehicles: { orderBy: { id: "asc" } } }, orderBy: [{ rating: "desc" }, { name: "asc" }] });
  return <PartnersView partners={partners} />;
}
