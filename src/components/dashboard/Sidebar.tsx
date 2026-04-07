"use client";

import { type ReactNode, useState } from "react";
import Link from "next/link";
import {
  ExpandLessRounded,
  ExpandMoreRounded,
  FiberManualRecordRounded,
  SchoolRounded,
} from "@mui/icons-material";
import { usePathname } from "next/navigation";
import {
  Box,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";

export type SidebarSubMenuItem = {
  label: string;
  href: string;
  icon?: ReactNode;
};

export type SidebarMenuItem = {
  label: string;
  icon: ReactNode;
  href?: string;
  children?: SidebarSubMenuItem[];
};

type SidebarProps = {
  logoText: string;
  menuItems: SidebarMenuItem[];
};

const isItemActive = (pathname: string, item: SidebarMenuItem) => {
  if (item.href && pathname === item.href) {
    return true;
  }

  return item.children?.some((child) => pathname === child.href) ?? false;
};

export function Sidebar({ logoText, menuItems }: SidebarProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      menuItems
        .filter((item) => item.children?.length)
        .map((item) => [item.label, isItemActive(pathname, item)]),
    ),
  );

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <Box
      sx={{
        width: { xs: "100%", md: "clamp(260px, 20vw, 320px)" },
        minHeight: { xs: "auto", md: "100vh" },
        bgcolor: "#0f172a",
        color: "#e2e8f0",
        px: 2,
        py: 0,
      }}
    >
      <Stack spacing={3.5}>
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{
            minHeight: 72,
            px: 1,
            py: 3,
          }}
        >
          <Box
            sx={{
              width: 42,
              height: 42,
              display: "grid",
              placeItems: "center",
              bgcolor: "#0f766e",
              color: "#ffffff",
            }}
          >
            <SchoolRounded />
          </Box>
          <Box>
            <Typography variant="h6" component="div" fontWeight={700}>
              {logoText}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "rgba(226, 232, 240, 0.72)" }}
            >
              Dashboard Panel
            </Typography>
          </Box>
        </Stack>

        <Stack spacing={1} sx={{ px: 0 }}>
          <Typography
            variant="overline"
            sx={{
              px: 1.5,
              color: "rgba(148, 163, 184, 0.92)",
              letterSpacing: 1.2,
            }}
          >
            Navigation
          </Typography>
        </Stack>

        <List disablePadding>
          {menuItems.map((item) => (
            <Box key={item.label} sx={{ mb: 1 }}>
              {item.children?.length ? (
                (() => {
                  const active = isItemActive(pathname, item);
                  const expanded = openMenus[item.label] ?? active;

                  return (
                    <>
                      <ListItemButton
                        onClick={() => toggleMenu(item.label)}
                        sx={{
                          minHeight: 48,
                          px: 1.5,
                          color: active ? "#ffffff" : "inherit",
                          bgcolor: active
                            ? "rgba(15, 118, 110, 0.22)"
                            : "transparent",
                          "&:hover": {
                            bgcolor: "rgba(15, 118, 110, 0.14)",
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.label} />
                        {expanded ? (
                          <ExpandLessRounded />
                        ) : (
                          <ExpandMoreRounded />
                        )}
                      </ListItemButton>

                      <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <List disablePadding sx={{ mt: 0.75 }}>
                          {item.children.map((child) => {
                            const active = pathname === child.href;

                            return (
                              <ListItemButton
                                key={child.label}
                                component={Link}
                                href={child.href}
                                sx={{
                                  ml: 1.5,
                                  mt: 0.5,
                                  minHeight: 40,
                                  pl: 2,
                                  pr: 1.5,
                                  color: active
                                    ? "#ffffff"
                                    : "rgba(226, 232, 240, 0.82)",
                                  bgcolor: active
                                    ? "rgba(234, 88, 12, 0.18)"
                                    : "transparent",
                                  "&:hover": {
                                    bgcolor: active
                                      ? "rgba(234, 88, 12, 0.22)"
                                      : "rgba(148, 163, 184, 0.08)",
                                  },
                                }}
                              >
                                <ListItemIcon
                                  sx={{ minWidth: 24, color: "inherit" }}
                                >
                                  {child.icon ?? (
                                    <FiberManualRecordRounded
                                      sx={{ fontSize: 8 }}
                                    />
                                  )}
                                </ListItemIcon>
                                <ListItemText
                                  primary={child.label}
                                  primaryTypographyProps={{
                                    variant: "body2",
                                    fontWeight: 500,
                                  }}
                                />
                              </ListItemButton>
                            );
                          })}
                        </List>
                      </Collapse>
                    </>
                  );
                })()
              ) : item.href ? (
                <ListItemButton
                  component={Link}
                  href={item.href}
                  sx={{
                    minHeight: 48,
                    px: 1.5,
                    color: pathname === item.href ? "#ffffff" : "inherit",
                    bgcolor:
                      pathname === item.href
                        ? "rgba(15, 118, 110, 0.22)"
                        : "transparent",
                    "&:hover": {
                      bgcolor: "rgba(15, 118, 110, 0.14)",
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    px: 1.5,
                    py: 1.25,
                  }}
                >
                  <Box
                    sx={{
                      minWidth: 40,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography variant="body1">{item.label}</Typography>
                </Box>
              )}
            </Box>
          ))}
        </List>
      </Stack>
    </Box>
  );
}
