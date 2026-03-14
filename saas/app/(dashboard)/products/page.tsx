import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import prisma from "@/lib/db/prisma";
import { ProductsTable } from "@/components/shared/ProductsTable";

export default async function ProductsPage() {
  const user = await getCurrentUser();
  if (!user || !user.organizationId) redirect("/login");

  const products = await prisma.product.findMany({
    where: { organizationId: user.organizationId, isArchived: false },
    include: {
      category: { select: { name: true } },
      inventory: { select: { quantity: true, branchId: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const categories = await prisma.productCategory.findMany({
    where: { organizationId: user.organizationId, isActive: true },
  });

  const data = products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    barcode: p.barcode,
    categoryName: p.category?.name ?? "—",
    unit: p.unit,
    costPrice: Number(p.costPrice),
    sellingPrice: Number(p.sellingPrice),
    quantity: p.inventory.reduce((sum, inv) => sum + Number(inv.quantity), 0),
    isActive: p.isActive,
    imageUrl: p.imageUrl,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div>
      <Header title="Товары" subtitle="Управление ассортиментом" />
      <div className="p-6">
        <ProductsTable
          products={data}
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          organizationId={user.organizationId}
        />
      </div>
    </div>
  );
}
