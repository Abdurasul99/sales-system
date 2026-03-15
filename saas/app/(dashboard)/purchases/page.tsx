import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { PurchasesClient } from "@/components/purchases/PurchasesClient";
import { CopilotDataProvider } from "@/components/ai/CopilotDataProvider";

export default async function PurchasesPage() {
  const user = await getCurrentUser();
  if (!user || !user.organizationId) redirect("/login");

  const [purchases, pendingPurchasesCount] = await Promise.all([
    prisma.purchase.findMany({
      where: { organizationId: user.organizationId },
      include: {
        supplier: { select: { companyName: true } },
        items: { include: { product: { select: { name: true, unit: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.purchase.count({
      where: { organizationId: user.organizationId, status: "PENDING" },
    }),
  ]);

  const suppliers = await prisma.supplier.findMany({
    where: { organizationId: user.organizationId, isActive: true },
    select: { id: true, companyName: true },
  });

  const productsRaw = await prisma.product.findMany({
    where: { organizationId: user.organizationId, isActive: true },
    select: { id: true, name: true, unit: true, costPrice: true },
  });
  const products = productsRaw.map((p) => ({ ...p, costPrice: Number(p.costPrice) }));

  return (
    <CopilotDataProvider data={{ pendingPurchases: pendingPurchasesCount }}>
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Закупки</h1>
          <p className="text-sm text-gray-500 mt-0.5">Управление поставками и приёмкой товаров</p>
        </div>
        <PurchasesClient
          purchases={JSON.parse(JSON.stringify(purchases))}
          suppliers={suppliers}
          products={products}
          organizationId={user.organizationId}
        />
      </div>
    </CopilotDataProvider>
  );
}
