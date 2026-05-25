"use client";

import type { ReactNode } from "react";
import { Box, Paper, Stack, Typography, alpha } from "@mui/material";

export function SummaryCard({
  caption,
  icon,
  title,
  tone = "default",
}: {
  caption: string;
  icon: ReactNode;
  title: string;
  tone?: "default" | "success" | "muted" | "error" | "warning";
}) {
  const borderColor =
    tone === "success"
      ? alpha("#10b981", 0.22)
      : tone === "error"
        ? alpha("#ef4444", 0.22)
        : tone === "warning"
          ? alpha("#f59e0b", 0.22)
          : tone === "muted"
            ? alpha("#64748b", 0.16)
            : alpha("#0f172a", 0.08);

  const iconBackground =
    tone === "success"
      ? alpha("#10b981", 0.12)
      : tone === "error"
        ? alpha("#ef4444", 0.10)
        : tone === "warning"
          ? alpha("#f59e0b", 0.10)
          : alpha("#0f172a", 0.06);

  const iconColor =
    tone === "success"
      ? "#047857"
      : tone === "error"
        ? "#b91c1c"
        : tone === "warning"
          ? "#b45309"
          : "#0f172a";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: "1px solid",
        borderColor,
        display: "grid",
        gap: 1.25,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          {caption}
        </Typography>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: iconBackground,
            color: iconColor,
          }}
        >
          {icon}
        </Box>
      </Stack>

      <Typography variant="h5">{title}</Typography>
    </Paper>
  );
}
