"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LogoutRounded,
  MenuRounded,
  NotificationsNoneRounded,
  SchoolRounded,
} from "@mui/icons-material";
import { usePathname, useRouter } from "next/navigation";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import type { ReactNode } from "react";
import { studentMenuItems } from "@/config/student-menu";
import { primaryGradient } from "@/theme/theme";
import { GetMyUnreadCountDocument } from "@/graphql/generated";
import { useQuery } from "@apollo/client/react";
import { Badge } from "@mui/material";
import { logoutSession } from "@/lib/auth/client";
import { DashboardSwitcherMenuItems } from "@/components/auth/DashboardSwitcherMenuItems";

const SIDEBAR_SURFACE = {
  bgcolor: "#09111c",
  color: "#e2e8f0",
  borderColor: "rgba(148, 163, 184, 0.1)",
};

function StudentSidebar({
  mobileOpen,
  onMobileClose,
}: {
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const pathname = usePathname();

  const content = (
    <Stack
      spacing={3.5}
      sx={{ height: "100%", minHeight: 0, py: 1.5 }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{ minHeight: 72, px: 1, py: 3 }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            display: "grid",
            placeItems: "center",
            borderRadius: 8,
            background: primaryGradient,
            color: "#ffffff",
            boxShadow: "0 10px 22px rgba(37, 99, 235, 0.22)",
          }}
        >
          <SchoolRounded />
        </Box>
        <Typography variant="h6" component="div" fontWeight={700}>
          Student Portal
        </Typography>
      </Stack>

      <List
        disablePadding
        sx={{
          flex: 1,
          minHeight: 0,
          pb: 3,
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(148, 163, 184, 0.35) transparent",
        }}
      >
        {studentMenuItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Box key={item.key} sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={item.href}
                onClick={onMobileClose}
                sx={{
                  minHeight: 48,
                  px: 1.5,
                  borderRadius: 2,
                  color: active ? "#ffffff" : "inherit",
                  bgcolor: active ? alpha("#2563eb", 0.16) : "transparent",
                  border: active
                    ? "1px solid rgba(74, 222, 128, 0.16)"
                    : "1px solid transparent",
                  "&:hover": { bgcolor: alpha("#2563eb", 0.1) },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                  <Icon />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </Box>
          );
        })}
      </List>
    </Stack>
  );

  return (
    <>
      <Box
        component="aside"
        sx={{
          display: { xs: "none", md: "block" },
          width: "clamp(240px, 18vw, 280px)",
          height: "100dvh",
          flexShrink: 0,
          px: 2,
          overflow: "hidden",
          bgcolor: SIDEBAR_SURFACE.bgcolor,
          color: SIDEBAR_SURFACE.color,
          borderRight: `1px solid ${SIDEBAR_SURFACE.borderColor}`,
        }}
      >
        {content}
      </Box>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: "min(86vw, 280px)",
            boxSizing: "border-box",
            px: 2,
            bgcolor: SIDEBAR_SURFACE.bgcolor,
            color: SIDEBAR_SURFACE.color,
            borderRight: `1px solid ${SIDEBAR_SURFACE.borderColor}`,
          },
        }}
      >
        {content}
      </Drawer>
    </>
  );
}

export function StudentShell({ children }: { children: ReactNode }) {
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
      <StudentSidebar
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
        <StudentTopbar onMenuClick={() => setMobileOpen(true)} />

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

function StudentTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  const { data } = useQuery(GetMyUnreadCountDocument);
  const unreadCount = data?.myUnreadCount ?? 0;

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isMenuOpen = !!menuAnchor;

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    if (!isLoggingOut) {
      setMenuAnchor(null);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logoutSession();
      setMenuAnchor(null);
      router.push("/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Box
      sx={{
        px: { xs: 2, md: 3 },
        py: 2,
        bgcolor: "#09111c",
        color: "#e2e8f0",
        borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <IconButton
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            sx={{
              display: { xs: "inline-flex", md: "none" },
              borderRadius: 2,
              color: "#e2e8f0",
              bgcolor: alpha("#ffffff", 0.05),
              border: "1px solid rgba(148, 163, 184, 0.12)",
            }}
          >
            <MenuRounded />
          </IconButton>
          <Typography
            variant="h5"
            sx={{ color: "#f8fafc", fontSize: { xs: "1.1rem", md: "1.5rem" } }}
          >
            BongoEdu360
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <IconButton
            href="/student/notices"
            sx={{
              borderRadius: 2,
              color: "#e2e8f0",
              bgcolor: alpha("#ffffff", 0.05),
              border: "1px solid rgba(148, 163, 184, 0.12)",
            }}
          >
            <Badge badgeContent={unreadCount || undefined} color="error" max={99}>
              <NotificationsNoneRounded />
            </Badge>
          </IconButton>

          <IconButton
            onClick={handleOpenMenu}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen ? "true" : undefined}
            aria-label="Account menu"
            sx={{
              borderRadius: 2,
              color: "#e2e8f0",
              bgcolor: alpha("#ffffff", 0.05),
              border: "1px solid rgba(148, 163, 184, 0.12)",
            }}
          >
            <LogoutRounded />
          </IconButton>

          <Menu
            anchorEl={menuAnchor}
            open={isMenuOpen}
            onClose={handleCloseMenu}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <DashboardSwitcherMenuItems onNavigate={handleCloseMenu} />

            <MenuItem onClick={handleLogout} disabled={isLoggingOut} sx={{ gap: 1.25 }}>
              <LogoutRounded fontSize="small" />
              <Typography variant="body2">
                {isLoggingOut ? "Logging out..." : "Log out"}
              </Typography>
            </MenuItem>
          </Menu>
        </Stack>
      </Stack>
    </Box>
  );
}
