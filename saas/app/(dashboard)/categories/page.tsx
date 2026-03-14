import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import prisma from "@/lib/db/prisma";
import { CategoriesManager } from "@/components/shared/CategoriesManager";

export default async function CategoriesPage() {
  const user = await getCurrentUser();
  if (!user || !user.organizationId) redirect("/login");

  const categories = await prisma.productCategory.findMany({
    where: { organizationId: user.organizationId },
    include: { _count: { select: { products: true } } },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <Header title="Категории" subtitle="Управление категориями товаров" />
      <div className="p-6">
        <CategoriesManager
          categories={categories.map((c) => ({
            id: c.id, name: c.name, slug: c.slug, isActive: c.isActive,
            color: c.color, productCount: c._count.products,
          }))}
          organizationId={user.organizationId}
        />
      </div>
    </div>
  );
}
