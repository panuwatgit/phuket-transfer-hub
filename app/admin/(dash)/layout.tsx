import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Sidebar } from "@/components/admin/Sidebar";
import { Toaster } from "@/components/admin/Toast";

export const metadata = { title: "หลังบ้าน" };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  const newCount = await prisma.bookingRequest.count({ where: { status: "NEW" } });
  return (
    <div className="grid md:grid-cols-[232px_1fr] min-h-screen bg-[#F6F1E9] text-[14.5px]">
      <Sidebar newCount={newCount} />
      <main className="px-3.5 py-3.5 md:px-6 md:py-5 pb-24 min-w-0">{children}</main>
      <Toaster />
    </div>
  );
}
