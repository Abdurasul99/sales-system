import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { Sidebar } from "@/components/layout/Sidebar";
import { AICopilot } from "@/components/ai/AICopilot";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (user.role === "SUPERADMIN") redirect("/superadmin");

  const planName = user.organization?.subscription?.plan?.name ?? null;

  const copilotUser = {
    fullName: user.fullName,
    role: user.role,
    planName,
    organizationName: user.organization?.name ?? null,
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        user={{
          fullName: user.fullName,
          role: user.role,
          organizationName: user.organization?.name ?? null,
          planName,
        }}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden h-14 shrink-0 bg-white border-b border-gray-100 flex items-center px-14">
          <span className="text-sm font-semibold text-gray-700">{user.organization?.name ?? "Sales System"}</span>
        </div>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      {/* AI Copilot — context is set per page via data-* attrs; layout provides user */}
      <AICopilot user={copilotUser} />
    </div>
  );
}
