"use client";

import { useState, type ReactNode } from "react";
import { Box } from "@mui/material";
import { useQuery } from "@apollo/client/react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import type { SidebarMenuItem } from "@/config/dashboard-menu";
import { MeDocument } from "@/graphql/generated";
import { isCenterAdmin } from "@/lib/auth/roles";

// The tenant "Profile Setup" section is center-admin only, matching the route
// guard. Hidden from the nav for everyone else.
const CENTER_ADMIN_ONLY_KEYS = new Set(["tenant-setup"]);

type DashboardShellProps = {
  logoText: string;
  menuItems: SidebarMenuItem[];
  children: ReactNode;
};

export function DashboardShell({
  logoText,
  menuItems,
  children,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data } = useQuery(MeDocument, { fetchPolicy: "cache-first" });
  const me = data?.me ?? null;

  // Show center-admin-only sections while the role is still unknown, then hide
  // them once we positively know the user is not a center admin.
  const visibleMenuItems =
    !me || isCenterAdmin(me.roles)
      ? menuItems
      : menuItems.filter((item) => !CENTER_ADMIN_ONLY_KEYS.has(item.key));

  return (
    <Box
      sx={{
        height: "100dvh",
        display: "flex",
        flexDirection: "row",
        bgcolor: "#0f172a",
        overflow: "hidden",
      }}
    >
      <Sidebar
        logoText={logoText}
        menuItems={visibleMenuItems}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          bgcolor: "#0f172a",
          overflow: "hidden",
        }}
      >
        <Topbar onMenuClick={() => setMobileOpen(true)} />

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            bgcolor: "background.default",
            p: { xs: 2, md: 3 },
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
