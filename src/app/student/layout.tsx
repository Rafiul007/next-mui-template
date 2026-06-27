import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { StudentShell } from "@/components/student/StudentShell";
import { StudentAuthGuard } from "@/components/student/StudentAuthGuard";
import { hasAuthSession } from "@/lib/auth/session";

export default async function StudentLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();

  if (!hasAuthSession(cookieStore)) {
    redirect("/login");
  }

  return (
    <StudentShell>
      <StudentAuthGuard>{children}</StudentAuthGuard>
    </StudentShell>
  );
}
