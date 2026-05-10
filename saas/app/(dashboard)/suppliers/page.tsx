import { getCurrentUserBasic as getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import prisma from "@/lib/db/prisma";
import { SuppliersTable } from "@/components/shared/SuppliersTable";
import { unstable_cache } from "next/cache";

export default async function SuppliersPage() {
  const user = await getCurrentUser();
  if (!user || !user.organizationId) redirect("/login");

  const orgId = user.organizationId;
  const suppliers = await unstable_cache(
    () => prisma.supplier.findMany({
      where: { organizationId: orgId },
      include: { _count: { select: { purchases: true } } },
      orderBy: { createdAt: "desc" },
    }),
    [`suppliers-${orgId}`],
    { revalidate: 120, tags: [`suppliers-${orgId}`] }
  )();

  return (
    <div>
      <Header title="Поставщики" subtitle="Управление поставщиками" />
      <div className="p-6">
        <SuppliersTable
          suppliers={suppliers.map((s) => ({
            id: s.id, companyName: s.companyName, contactName: s.contactName,
            phone: s.phone, email: s.email, inn: s.inn, isActive: s.isActive,
            currentBalance: Number(s.currentBalance), purchasesCount: s._count.purchases,
          }))}
          organizationId={user.organizationId}
        />
      </div>
    </div>
  );
}
