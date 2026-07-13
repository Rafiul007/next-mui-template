"use client";

import type { ReactNode } from "react";
import { DashboardAccessGuard } from "@/components/auth/DashboardAccessGuard";

// HR staff own this portal. Center admins and other admins are also allowed in
// (they oversee HR); the registry's `canAccess` for the "hr" dashboard handles
// that. Everyone else is redirected to wherever they belong.
export function HrAuthGuard({ children }: { children: ReactNode }) {
  return <DashboardAccessGuard dashboardKey="hr">{children}</DashboardAccessGuard>;
}
