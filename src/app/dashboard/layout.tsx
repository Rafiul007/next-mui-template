import type { ReactNode } from "react";
import {
  AssessmentRounded,
  SchoolRounded,
  InsertEmoticonOutlined,
  LocationCityOutlined,
} from "@mui/icons-material";
import { Box } from "@mui/material";
import { Sidebar, type SidebarMenuItem } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";

const sidebarMenuItems: SidebarMenuItem[] = [
  {
    label: "School",
    icon: <LocationCityOutlined />,
    href: "/dashboard",
  },
  {
    label: "Exam",
    icon: <SchoolRounded />,
    children: [
      {
        label: "Exam List",
        href: "/dashboard/exam-list",
        icon: <InsertEmoticonOutlined />,
      },
      {
        label: "Create Exam",
        href: "/dashboard/create-exam",
        icon: <InsertEmoticonOutlined />,
      },
    ],
  },
  {
    label: "Result",
    icon: <AssessmentRounded />,
    children: [
      {
        label: "Result List",
        href: "/dashboard/result-list",
        icon: <InsertEmoticonOutlined />,
      },
      {
        label: "Publish Result",
        href: "/dashboard/publish-result",
        icon: <InsertEmoticonOutlined />,
      },
    ],
  },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        bgcolor: "#0f172a",
      }}
    >
      <Sidebar logoText="My School" menuItems={sidebarMenuItems} />

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          bgcolor: "#0f172a",
        }}
      >
        <Topbar
          logoText="My School"
          userName="John Doe"
          userRole="Administrator"
        />
        <Box
          sx={{
            flex: 1,
            bgcolor: "background.default",
            p: { xs: 2, md: 3 },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
