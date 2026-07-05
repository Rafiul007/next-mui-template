import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { HrAuthGuard } from "@/components/hr/HrAuthGuard";
import { hrSidebarMenuItems } from "@/config/hr-menu";
import { hasAuthSession } from "@/lib/auth/session";

export default async function HrDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();

  if (!hasAuthSession(cookieStore)) {
    redirect("/login");
  }

  return (
    <DashboardShell logoText="BongoEdu360" menuItems={hrSidebarMenuItems}>
      <HrAuthGuard>{children}</HrAuthGuard>
    </DashboardShell>
  );
}
