import { Header } from "@/components/layout/Header";
import prisma from "@/lib/db/prisma";
import { SuperAdminUsersTable } from "@/components/shared/SuperAdminUsersTable";

export default async function SuperAdminUsersPage() {
  const users = await prisma.user.findMany({
    where: { role: { not: "SUPERADMIN" } },
    include: {
      organization: { select: { name: true } },
      branch: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const plans = await prisma.subscriptionPlan.findMany({ where: { isActive: true } });
  const branches = await prisma.branch.findMany({ select: { id: true, name: true, organizationId: true } });
  const organizations = await prisma.organization.findMany({ select: { id: true, name: true } });

  return (
    <div>
      <Header title="Пользователи" subtitle="Управление всеми пользователями платформы" />
      <div className="p-6">
        <SuperAdminUsersTable
          users={users.map((u) => ({
            id: u.id, fullName: u.fullName, phone: u.phone, login: u.login,
            role: u.role, isActive: u.isActive, isBlocked: u.isBlocked,
            organizationName: u.organization?.name ?? "—",
            branchName: u.branch?.name ?? "—",
            lastActiveAt: u.lastActiveAt?.toISOString() ?? null,
            createdAt: u.createdAt.toISOString(),
          }))}
          plans={plans.map((p) => ({ id: p.id, name: p.name, slug: p.slug }))}
          branches={branches}
          organizations={organizations}
        />
      </div>
    </div>
  );
}
