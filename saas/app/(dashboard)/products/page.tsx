import { redirect } from "next/navigation";
import { getCurrentUserBasic as getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { Header } from "@/components/layout/Header";
import { ProductsTable } from "@/components/shared/ProductsTable";
import { unstable_cache } from "next/cache";

async function fetchProducts(orgId: string) {
  return Promise.all([
    prisma.product.findMany({
      where: { organizationId: orgId, isArchived: false },
      include: {
        category: { select: { name: true } },
        inventory: { select: { quantity: true, branchId: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.productCategory.findMany({
      where: { organizationId: orgId, isActive: true },
    }),
  ]);
}

export default async function ProductsPage() {
  const user = await getCurrentUser();
  if (!user || !user.organizationId) {
    redirect("/login");
  }

  const [products, categories] = await unstable_cache(
    () => fetchProducts(user.organizationId!),
    [`products-${user.organizationId}`],
    { revalidate: 120, tags: [`products-${user.organizationId}`] }
  )();

  const data = products.map((product) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    barcode: product.barcode,
    categoryId: product.categoryId,
    categoryName: product.category?.name ?? "Uncategorized",
    unit: product.unit,
    costPrice: Number(product.costPrice),
    sellingPrice: Number(product.sellingPrice),
    minStockLevel: product.minStockLevel,
    safetyStockLevel: product.safetyStockLevel,
    reorderPoint: product.reorderPoint,
    targetStockLevel: product.targetStockLevel,
    leadTimeDays: product.leadTimeDays,
    description: product.description,
    quantity: product.inventory.reduce((sum, inventory) => sum + Number(inventory.quantity), 0),
    isActive: product.isActive,
    imageUrl: product.imageUrl,
    createdAt: product.createdAt.toISOString(),
  }));

  const lowStockCount = data.filter((product) => product.quantity <= product.minStockLevel).length;

  const lowStockItems = data
    .filter((product) => product.quantity <= product.minStockLevel)
    .slice(0, 5)
    .map((product) => ({
      name: product.name,
      qty: product.quantity,
      min: product.minStockLevel,
    }));

  return (
    <div>
      <Header title="Products" subtitle="Manage catalog, pricing, and stock policy" />
      <div className="p-6">
        <ProductsTable
          products={data}
          categories={categories.map((category) => ({
            id: category.id,
            name: category.name,
          }))}
          organizationId={user.organizationId}
        />
      </div>
    </div>
  );
}
