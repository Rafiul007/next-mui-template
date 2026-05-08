"use client";

import { useMemo } from "react";
import {
  AccessTimeRounded,
  BlockRounded,
  CancelRounded,
  CheckCircleOutlineRounded,
  PeopleAltRounded,
} from "@mui/icons-material";
import { Box } from "@mui/material";
import { SummaryCard } from "@/components/ui";
import type { TenantRecord } from "@/models/tenant";

const SUMMARY_ITEMS = [
  { label: "Total",      statusKey: null,          icon: <PeopleAltRounded />,             tone: "default"  as const },
  { label: "Active",     statusKey: "active",      icon: <CheckCircleOutlineRounded />,    tone: "success"  as const },
  { label: "Trial",      statusKey: "trial",       icon: <AccessTimeRounded />,            tone: "default"  as const },
  { label: "Suspended",  statusKey: "suspended",   icon: <BlockRounded />,                 tone: "muted"    as const },
  { label: "Terminated", statusKey: "terminated",  icon: <CancelRounded />,                tone: "muted"    as const },
];

export function TenantStatusSummary({ tenants }: { tenants: TenantRecord[] }) {
  const counts = useMemo(
    () =>
      tenants.reduce<Record<string, number>>((acc, t) => {
        const key = t.status.toLowerCase();
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {}),
    [tenants],
  );

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: {
          xs: "repeat(2, minmax(0, 1fr))",
          sm: "repeat(3, minmax(0, 1fr))",
          xl: "repeat(5, minmax(0, 1fr))",
        },
      }}
    >
      {SUMMARY_ITEMS.map(({ label, statusKey, icon, tone }) => (
        <SummaryCard
          key={label}
          caption={label}
          title={String(statusKey === null ? tenants.length : (counts[statusKey] ?? 0))}
          icon={icon}
          tone={tone}
        />
      ))}
    </Box>
  );
}
