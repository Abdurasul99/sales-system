import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { SalesPOS } from "@/components/sales/SalesPOS";
import prisma from "@/lib/db/prisma";

export default async function SalesPage() {
  const user = await getCurrentUser();
  if (!user || !user.organizationId) redirect("/login");

  const products = await prisma.product.findMany({
    where: { organizationId: user.organizationId, isActive: true, isArchived: false },
    include: {
      category: { select: { name: true } },
      inventory: {
        where: user.branchId ? { branchId: user.branchId } : {},
        select: { quantity: true, branchId: true },
      },
    },
    orderBy: { name: "asc" },
    take: 500,
  });

  const categories = await prisma.productCategory.findMany({
    where: { organizationId: user.organizationId, isActive: true },
    orderBy: { name: "asc" },
  });

  const productsData = products.map((p) => ({
    id: p.id,
    name: p.name,
    barcode: p.barcode,
    sku: p.sku,
    categoryId: p.categoryId,
    categoryName: p.category?.name ?? "Без категории",
    unit: p.unit,
    sellingPrice: Number(p.sellingPrice),
    costPrice: Number(p.costPrice),
    quantity: p.inventory.reduce((sum, inv) => sum + Number(inv.quantity), 0),
    imageUrl: p.imageUrl,
  }));

  return (
    <div className="h-full flex flex-col">
      <Header title="Продажи" subtitle="Касса и оформление заказов" />
      <SalesPOS
        products={productsData}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        cashierId={user.id}
        branchId={user.branchId ?? ""}
        organizationId={user.organizationId}
      />
    </div>
  );
}
