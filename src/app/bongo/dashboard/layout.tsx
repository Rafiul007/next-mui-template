import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BongoAuthGuard } from "@/components/bongo/BongoAuthGuard";
import { bongoSidebarMenuItems } from "@/config/bongo-menu";
import { hasAuthSession } from "@/lib/auth/session";

export default async function BongoDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();

  if (!hasAuthSession(cookieStore)) {
    redirect("/login");
  }

  return (
    <DashboardShell logoText="Bongo Admin" menuItems={bongoSidebarMenuItems}>
      <BongoAuthGuard>{children}</BongoAuthGuard>
    </DashboardShell>
  );
}
