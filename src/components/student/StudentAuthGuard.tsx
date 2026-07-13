"use client";

import type { ReactNode } from "react";
import { DashboardAccessGuard } from "@/components/auth/DashboardAccessGuard";

// Students only. Everyone else is redirected to wherever they belong.
export function StudentAuthGuard({ children }: { children: ReactNode }) {
  return (
    <DashboardAccessGuard dashboardKey="student">{children}</DashboardAccessGuard>
  );
}
