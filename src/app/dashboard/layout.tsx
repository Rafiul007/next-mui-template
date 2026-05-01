import type { ReactNode } from "react";
import { Box } from "@mui/material";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { dashboardSidebarMenuItems } from "@/config/dashboard-menu";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        height: "100dvh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        bgcolor: "#0f172a",
        overflow: "hidden",
      }}
    >
      <Sidebar logoText="BongoEdu360" menuItems={dashboardSidebarMenuItems} />

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
