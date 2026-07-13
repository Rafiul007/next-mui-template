"use client";

import type { ReactNode } from "react";
import { DashboardAccessGuard } from "@/components/auth/DashboardAccessGuard";

// The center-admin console, which also serves as the catch-all home for any
// signed-in user who belongs to no other dashboard. See src/lib/auth/roles.ts.
export function DashboardAuthGuard({ children }: { children: ReactNode }) {
  return (
    <DashboardAccessGuard dashboardKey="centerAdmin">
      {children}
    </DashboardAccessGuard>
  );
}
