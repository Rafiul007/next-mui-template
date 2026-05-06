"use client";

import { useState } from "react";
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
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import type { SidebarMenuItem } from "@/config/dashboard-menu";
import { primaryGradient } from "@/theme/theme";

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
        .map((item) => [item.key, isItemActive(pathname, item)]),
    ),
  );

  const toggleMenu = (key: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <Box
      component="aside"
      sx={{
        width: { xs: "100%", md: "clamp(260px, 20vw, 320px)" },
        height: { xs: "auto", md: "100dvh" },
        flexShrink: 0,
        bgcolor: "#09111c",
        color: "#e2e8f0",
        px: 2,
        py: 0,
        overflow: "hidden",
        borderRight: "1px solid rgba(148, 163, 184, 0.1)",
      }}
    >
      <Stack
        spacing={3.5}
        sx={{
          height: { md: "100%" },
          minHeight: 0,
          py: { md: 1.5 },
        }}
      >
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
              borderRadius: 8,
              background: primaryGradient,
              color: "#ffffff",
              boxShadow: "0 10px 22px rgba(16, 185, 129, 0.22)",
            }}
          >
            <SchoolRounded />
          </Box>
          <Typography variant="h6" component="div" fontWeight={700}>
            {logoText}
          </Typography>
        </Stack>

        <List
          disablePadding
          sx={{
            flex: 1,
            minHeight: 0,
            pb: 3,
            overflowY: { xs: "visible", md: "auto" },
            overflowX: "hidden",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(148, 163, 184, 0.35) transparent",
            "&::-webkit-scrollbar": {
              width: 8,
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(148, 163, 184, 0.35)",
              borderRadius: 999,
            },
          }}
        >
          {menuItems.map((item) => (
            <Box key={item.key} sx={{ mb: 1 }}>
              {item.children?.length
                ? (() => {
                    const active = isItemActive(pathname, item);
                    const expanded = openMenus[item.key] ?? active;
                    const ItemIcon = item.icon;

                    return (
                      <>
                        <ListItemButton
                          component={item.href ? Link : "button"}
                          href={item.href}
                          onClick={
                            item.href ? undefined : () => toggleMenu(item.key)
                          }
                          sx={{
                            minHeight: 48,
                            px: 1.5,
                            borderRadius: 2,
                            color: active ? "#ffffff" : "inherit",
                            bgcolor: active
                              ? alpha("#10b981", 0.16)
                              : "transparent",
                            border: active
                              ? "1px solid rgba(74, 222, 128, 0.16)"
                              : "1px solid transparent",
                            "&:hover": {
                              bgcolor: alpha("#10b981", 0.1),
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                            <ItemIcon />
                          </ListItemIcon>
                          <ListItemText primary={item.label} />
                          <IconButton
                            size="small"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              toggleMenu(item.key);
                            }}
                            sx={{ color: "inherit" }}
                          >
                            {expanded ? (
                              <ExpandLessRounded fontSize="small" />
                            ) : (
                              <ExpandMoreRounded fontSize="small" />
                            )}
                          </IconButton>
                        </ListItemButton>

                        <Collapse in={expanded} timeout="auto" unmountOnExit>
                          <List disablePadding sx={{ mt: 0.75 }}>
                            {item.children.map((child) => {
                              const active = pathname === child.href;
                              const ChildIcon = child.icon;

                              if (child.href) {
                                return (
                                  <ListItemButton
                                    key={child.key}
                                    component={Link}
                                    href={child.href}
                                    sx={{
                                      ml: 1.5,
                                      mt: 0.5,
                                      minHeight: 40,
                                      pl: 2,
                                      pr: 1.5,
                                      borderRadius: 2,
                                      color: active
                                        ? "#ffffff"
                                        : "rgba(226, 232, 240, 0.82)",
                                      bgcolor: active
                                        ? alpha("#10b981", 0.12)
                                        : "transparent",
                                      "&:hover": {
                                        bgcolor: active
                                          ? alpha("#10b981", 0.16)
                                          : "rgba(148, 163, 184, 0.08)",
                                      },
                                    }}
                                  >
                                    <ListItemIcon
                                      sx={{ minWidth: 24, color: "inherit" }}
                                    >
                                      {ChildIcon ? (
                                        <ChildIcon fontSize="small" />
                                      ) : (
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
                              }

                              return (
                                <Box
                                  key={child.key}
                                  sx={{
                                    ml: 1.5,
                                    mt: 0.5,
                                    minHeight: 40,
                                    display: "flex",
                                    alignItems: "center",
                                    pl: 2,
                                    pr: 1.5,
                                    color: "rgba(226, 232, 240, 0.64)",
                                    borderRadius: 2,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      minWidth: 24,
                                      display: "flex",
                                      alignItems: "center",
                                      color: "inherit",
                                    }}
                                  >
                                    {ChildIcon ? (
                                      <ChildIcon fontSize="small" />
                                    ) : (
                                      <FiberManualRecordRounded
                                        sx={{ fontSize: 8 }}
                                      />
                                    )}
                                  </Box>
                                  <Typography variant="body2" fontWeight={500}>
                                    {child.label}
                                  </Typography>
                                </Box>
                              );
                            })}
                          </List>
                        </Collapse>
                      </>
                    );
                  })()
                : item.href
                  ? (() => {
                      const ItemIcon = item.icon;

                      return (
                        <ListItemButton
                          component={Link}
                          href={item.href}
                          sx={{
                            minHeight: 48,
                            px: 1.5,
                            borderRadius: 2,
                            color:
                              pathname === item.href ? "#ffffff" : "inherit",
                            bgcolor:
                              pathname === item.href
                                ? alpha("#10b981", 0.16)
                                : "transparent",
                            border:
                              pathname === item.href
                                ? "1px solid rgba(74, 222, 128, 0.16)"
                                : "1px solid transparent",
                            "&:hover": {
                              bgcolor: alpha("#10b981", 0.1),
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                            <ItemIcon />
                          </ListItemIcon>
                          <ListItemText primary={item.label} />
                        </ListItemButton>
                      );
                    })()
                  : (() => {
                      const ItemIcon = item.icon;

                      return (
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
                            <ItemIcon />
                          </Box>
                          <Typography variant="body1">{item.label}</Typography>
                        </Box>
                      );
                    })()}
            </Box>
          ))}
        </List>
      </Stack>
    </Box>
  );
}
