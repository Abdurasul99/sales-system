import { redirect } from "next/navigation";
import { getCurrentUserBasic as getCurrentUser } from "@/lib/auth/session";
import { Sidebar } from "@/components/layout/Sidebar";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { NotificationBadge } from "@/components/layout/NotificationBadge";
import { WelcomeBanner } from "@/components/layout/WelcomeBanner";
import { TrialBanner } from "@/components/layout/TrialBanner";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { NotificationCountProvider } from "@/components/providers/NotificationCountProvider";
import { getLocaleFromCookies } from "@/lib/i18n/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (user.role === "SUPERADMIN") redirect("/superadmin");

  const planName = user.organization?.subscription?.plan?.name ?? null;
  const locale = await getLocaleFromCookies();

  const subscription = user.organization?.subscription;
  const isTrial = (subscription as any)?.isTrial ?? false;
  const trialEndsAt = (subscription as any)?.trialEndsAt
    ? new Date((subscription as any).trialEndsAt)
    : null;
  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / 86400000))
    : 0;
  const showTrialBanner = isTrial && trialDaysLeft <= 30;

  return (
    <LocaleProvider initialLocale={locale}>
      <NotificationCountProvider>
        <div className="flex h-screen bg-gray-50 overflow-hidden">
          {showTrialBanner && <TrialBanner daysLeft={trialDaysLeft} />}
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
              <span className="text-sm font-semibold text-gray-700 flex-1 text-center pl-10">
                {user.organization?.name ?? "Sales System"}
              </span>
              <GlobalSearch />
              <NotificationBadge />
            </div>
            {/* Desktop top bar */}
            <div className="hidden lg:flex items-center px-6 py-3 border-b border-gray-50 bg-white">
              <GlobalSearch />
            </div>
            <WelcomeBanner />
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </div>
      </NotificationCountProvider>
    </LocaleProvider>
  );
}
