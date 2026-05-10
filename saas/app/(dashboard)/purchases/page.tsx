import { getCurrentUserBasic as getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { PurchasesClient } from "@/components/purchases/PurchasesClient";
import { unstable_cache } from "next/cache";

async function fetchPurchasesData(orgId: string) {
  const [[purchases, pendingPurchasesCount], suppliers, productsRaw] = await Promise.all([
    Promise.all([
      prisma.purchase.findMany({
        where: { organizationId: orgId },
        include: {
          supplier: { select: { companyName: true } },
          items: { include: { product: { select: { name: true, unit: true } } } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.purchase.count({ where: { organizationId: orgId, status: "PENDING" } }),
    ]),
    prisma.supplier.findMany({
      where: { organizationId: orgId, isActive: true },
      select: { id: true, companyName: true },
    }),
    prisma.product.findMany({
      where: { organizationId: orgId, isActive: true },
      select: { id: true, name: true, unit: true, costPrice: true },
    }),
  ]);
  return { purchases, pendingPurchasesCount, suppliers, products: productsRaw.map((p) => ({ ...p, costPrice: Number(p.costPrice) })) };
}

export default async function PurchasesPage() {
  const user = await getCurrentUser();
  if (!user || !user.organizationId) redirect("/login");

  const { purchases, suppliers, products } = await unstable_cache(
    () => fetchPurchasesData(user.organizationId!),
    [`purchases-${user.organizationId}`],
    { revalidate: 120, tags: [`purchases-${user.organizationId}`] }
  )();

  return (
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
  );
}
