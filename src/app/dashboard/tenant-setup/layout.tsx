import type { ReactNode } from "react";
import { CenterAdminGuard } from "@/components/dashboard/CenterAdminGuard";

// Every tenant "Profile Setup" route (center details, branches, calendar,
// org structure, roles & permissions) is center-admin only.
export default function TenantSetupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <CenterAdminGuard>{children}</CenterAdminGuard>;
}
