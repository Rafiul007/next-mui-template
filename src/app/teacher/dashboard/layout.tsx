import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { TeacherAuthGuard } from "@/components/teacher/TeacherAuthGuard";
import { teacherSidebarMenuItems } from "@/config/teacher-menu";
import { hasAuthSession } from "@/lib/auth/session";

export default async function TeacherDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();

  if (!hasAuthSession(cookieStore)) {
    redirect("/login");
  }

  return (
    <DashboardShell logoText="BongoEdu360" menuItems={teacherSidebarMenuItems}>
      <TeacherAuthGuard>{children}</TeacherAuthGuard>
    </DashboardShell>
  );
}
