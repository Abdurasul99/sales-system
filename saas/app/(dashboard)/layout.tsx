import { redirect } from "next/navigation";
import Link from "next/link";
import { Bell } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { Sidebar } from "@/components/layout/Sidebar";
import { AICopilot } from "@/components/ai/AICopilot";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (user.role === "SUPERADMIN") redirect("/superadmin");

  const planName = user.organization?.subscription?.plan?.name ?? null;

  const subscription = user.organization?.subscription;
  const isTrial = (subscription as any)?.isTrial ?? false;
  const trialEndsAt = (subscription as any)?.trialEndsAt
    ? new Date((subscription as any).trialEndsAt)
    : null;
  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / 86400000))
    : 0;
  const showTrialBanner = isTrial && trialDaysLeft <= 30;

  const copilotUser = {
    fullName: user.fullName,
    role: user.role,
    planName,
    organizationName: user.organization?.name ?? null,
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {showTrialBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white text-center py-2 px-4 text-sm font-medium flex items-center justify-center gap-3">
          <span>
            ⏱ Пробный период: осталось {trialDaysLeft}{" "}
            {trialDaysLeft === 1 ? "день" : trialDaysLeft < 5 ? "дня" : "дней"}
          </span>
          <span className="text-amber-200">•</span>
          <span>Выберите тариф чтобы продолжить работу</span>
        </div>
      )}
      <Sidebar
        user={{
          fullName: user.fullName,
          role: user.role,
          organizationName: user.organization?.name ?? null,
          planName,
        }}
      />
      <div className={`flex-1 flex flex-col overflow-hidden${showTrialBanner ? " pt-10" : ""}`}>
        {/* Mobile top bar */}
        <div className="lg:hidden h-14 shrink-0 bg-white border-b border-gray-100 flex items-center px-4 gap-3">
          <span className="text-sm font-semibold text-gray-700 flex-1 text-center pl-10">{user.organization?.name ?? "Sales System"}</span>
          <Link href="/notifications" className="relative p-2 rounded-lg hover:bg-gray-100">
            <Bell className="w-5 h-5 text-gray-600" />
          </Link>
        </div>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      {/* AI Copilot — context is set per page via data-* attrs; layout provides user */}
      <AICopilot user={copilotUser} />
    </div>
  );
}
