"use client";

import { useState, type ReactNode } from "react";
import { Box } from "@mui/material";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import type { SidebarMenuItem } from "@/config/dashboard-menu";

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
        menuItems={menuItems}
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
