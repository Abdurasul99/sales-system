import { getCurrentUserBasic as getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import prisma from "@/lib/db/prisma";
import { CurrencyPanel } from "@/components/shared/CurrencyPanel";

export default async function CurrencyPage() {
  const user = await getCurrentUser();
  if (!user || !user.organizationId) redirect("/login");

  const rates = await prisma.exchangeRate.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { effectiveDate: "desc" },
    take: 20,
  });

  // Get latest rate per currency pair
  const latestRates: Record<string, number> = {};
  for (const r of rates) {
    const key = `${r.fromCurrency}_${r.toCurrency}`;
    if (!latestRates[key]) latestRates[key] = Number(r.rate);
  }

  const currencies = ["USD", "EUR", "RUB", "CNY"];

  return (
    <div>
      <Header title="Валюта" subtitle="Курсы валют и конвертер" />
      <div className="p-6">
        <CurrencyPanel
          currencies={currencies}
          currentRates={latestRates}
          organizationId={user.organizationId}
          history={rates.slice(0, 10).map((r) => ({
            id: r.id, fromCurrency: r.fromCurrency, toCurrency: r.toCurrency,
            rate: Number(r.rate), source: r.source, effectiveDate: r.effectiveDate.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
