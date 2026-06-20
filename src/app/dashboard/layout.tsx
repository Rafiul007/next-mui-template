import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardAuthGuard } from "@/components/dashboard/DashboardAuthGuard";
import { dashboardSidebarMenuItems } from "@/config/dashboard-menu";
import { hasAuthSession } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();

  if (!hasAuthSession(cookieStore)) {
    redirect("/login");
  }

  return (
    <DashboardShell
      logoText="BongoEdu360"
      menuItems={dashboardSidebarMenuItems}
    >
      <DashboardAuthGuard>{children}</DashboardAuthGuard>
    </DashboardShell>
  );
}
