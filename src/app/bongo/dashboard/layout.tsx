import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Box } from "@mui/material";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { BongoAuthGuard } from "@/components/bongo/BongoAuthGuard";
import { bongoSidebarMenuItems } from "@/config/bongo-menu";
import { hasAuthSession } from "@/lib/auth/session";

export default async function BongoDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();

  if (!hasAuthSession(cookieStore)) {
    redirect("/login");
  }

  return (
    <Box
      sx={{
        height: "100dvh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        bgcolor: "#09111c",
        overflow: "hidden",
      }}
    >
      <Sidebar logoText="Bongo Admin" menuItems={bongoSidebarMenuItems} />

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          bgcolor: "#09111c",
          overflow: "hidden",
        }}
      >
        <Topbar />

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
          <BongoAuthGuard>{children}</BongoAuthGuard>
        </Box>
      </Box>
    </Box>
  );
}
