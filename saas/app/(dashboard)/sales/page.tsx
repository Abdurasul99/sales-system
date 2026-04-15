import { getCurrentUserBasic as getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { SalesPOS } from "@/components/sales/SalesPOS";
import prisma from "@/lib/db/prisma";

export default async function SalesPage() {
  const user = await getCurrentUser();
  if (!user || !user.organizationId) redirect("/login");

  const [products, categories, openShift] = await Promise.all([
    prisma.product.findMany({
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
    }),
    prisma.productCategory.findMany({
      where: { organizationId: user.organizationId, isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.cashierShift.findFirst({
      where: {
        cashierId: user.id,
        ...(user.branchId ? { branchId: user.branchId } : {}),
        status: "OPEN",
      },
      select: { id: true },
    }),
  ]);

  const productsData = products.map((product) => ({
    id: product.id,
    name: product.name,
    barcode: product.barcode,
    sku: product.sku,
    categoryId: product.categoryId,
    categoryName: product.category?.name ?? "Uncategorized",
    unit: product.unit,
    sellingPrice: Number(product.sellingPrice),
    costPrice: Number(product.costPrice),
    quantity: product.inventory.reduce((sum, inventory) => sum + Number(inventory.quantity), 0),
    imageUrl: product.imageUrl,
  }));

  const lowStockCount = products.filter((product) => {
    const quantity = product.inventory.reduce((sum, inventory) => sum + Number(inventory.quantity), 0);
    return quantity <= product.minStockLevel;
  }).length;

  return (
    <div className="h-full flex flex-col">
      <Header title="Sales" subtitle="Cashier workspace and order processing" />
      <SalesPOS
        products={productsData}
        categories={categories.map((category) => ({ id: category.id, name: category.name }))}
        cashierId={user.id}
        branchId={user.branchId ?? ""}
        organizationId={user.organizationId}
      />
    </div>
  );
}
