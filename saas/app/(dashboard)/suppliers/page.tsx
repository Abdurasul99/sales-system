import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import prisma from "@/lib/db/prisma";
import { SuppliersTable } from "@/components/shared/SuppliersTable";

export default async function SuppliersPage() {
  const user = await getCurrentUser();
  if (!user || !user.organizationId) redirect("/login");

  const suppliers = await prisma.supplier.findMany({
    where: { organizationId: user.organizationId },
    include: { _count: { select: { purchases: true } } },
    orderBy: { createdAt: "desc" },
  });

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
