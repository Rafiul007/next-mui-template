"use client";

import type { ReactNode } from "react";
import { DashboardAccessGuard } from "@/components/auth/DashboardAccessGuard";

// Bongo platform admins (userType === "BONGO") only. network-only keeps the
// platform-admin check fresh rather than trusting a cached identity.
export function BongoAuthGuard({ children }: { children: ReactNode }) {
  return (
    <DashboardAccessGuard dashboardKey="bongo" fetchPolicy="network-only">
      {children}
    </DashboardAccessGuard>
  );
}
