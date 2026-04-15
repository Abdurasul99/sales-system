import { redirect } from "next/navigation";
import { getCurrentUserBasic as getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { BillingClient } from "@/components/billing/BillingClient";

export default async function BillingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "CASHIER" || user.role === "WAREHOUSE_CLERK") redirect("/analytics");

  const org = await prisma.organization.findUnique({
    where: { id: user.organizationId! },
    include: {
      subscription: {
        include: { plan: { include: { features: true } } },
      },
    },
  });

  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    include: { features: true },
    orderBy: { sortOrder: "asc" },
  });

  const sub = org?.subscription;
  const currentPlan = sub?.plan;

  const isTrial = (sub as any)?.isTrial ?? false;
  const trialEndsAt = (sub as any)?.trialEndsAt
    ? new Date((sub as any).trialEndsAt)
    : null;
  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / 86400000))
    : 0;

  return (
    <BillingClient
      currentPlan={currentPlan ? {
        id: currentPlan.id,
        name: currentPlan.name,
        slug: currentPlan.slug,
        priceUzs: Number(currentPlan.priceUzs),
      } : null}
      isTrial={isTrial}
      trialDaysLeft={trialDaysLeft}
      trialEndsAt={trialEndsAt?.toISOString() ?? null}
      plans={plans.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        priceUzs: Number(p.priceUzs),
        maxProducts: p.maxProducts,
        maxEmployees: p.maxEmployees,
        maxBranches: p.maxBranches,
        features: p.features.map(f => ({ feature: String(f.feature), enabled: f.enabled })),
      }))}
    />
  );
}
