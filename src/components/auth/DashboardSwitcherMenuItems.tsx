"use client";

import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { Divider, ListSubheader, MenuItem, Typography } from "@mui/material";
import { MeDocument } from "@/graphql/generated";
import {
  accessibleDashboardKeys,
  dashboardKeyForPath,
  pathForDashboard,
} from "@/lib/auth/roles";
import { DASHBOARD_META } from "@/lib/auth/dashboardMeta";

type DashboardSwitcherMenuItemsProps = {
  // Called after navigating, so the host menu can close itself.
  onNavigate?: () => void;
};

// Renders "Switch dashboard" menu entries for users who belong to more than one
// dashboard. Drops into any MUI <Menu>; renders nothing when the user has a
// single home. Self-contained (queries `me`) so both the shared UserProfile menu
// and the student topbar menu can reuse it.
export function DashboardSwitcherMenuItems({
  onNavigate,
}: DashboardSwitcherMenuItemsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data } = useQuery(MeDocument, { errorPolicy: "all" });

  const me = data?.me ?? null;
  const keys = accessibleDashboardKeys(me);

  // Only a switcher when there is something to switch to.
  if (keys.length <= 1) return null;

  const currentKey = dashboardKeyForPath(pathname);

  const handleSwitch = (path: string) => {
    onNavigate?.();
    router.push(path);
  };

  return (
    <>
      <Divider />
      <ListSubheader
        disableSticky
        sx={{ bgcolor: "transparent", lineHeight: 2.2, fontWeight: 700 }}
      >
        Switch dashboard
      </ListSubheader>
      {keys.map((key) => {
        const meta = DASHBOARD_META[key];
        const Icon = meta.icon;
        const isCurrent = key === currentKey;

        return (
          <MenuItem
            key={key}
            selected={isCurrent}
            disabled={isCurrent}
            onClick={() => handleSwitch(pathForDashboard(key))}
            sx={{ gap: 1.25, minHeight: 44 }}
          >
            <Icon fontSize="small" />
            <Typography variant="body2">
              {meta.label}
              {isCurrent ? " (current)" : ""}
            </Typography>
          </MenuItem>
        );
      })}
    </>
  );
}
