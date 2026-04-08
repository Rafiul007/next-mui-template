"use client";

import Link from "next/link";
import { HomeRounded, SearchOffRounded } from "@mui/icons-material";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";

export default function DashboardNotFound() {
  return (
    <Paper
      elevation={0}
      sx={{
        minHeight: "calc(100vh - 144px)",
        p: { xs: 3, md: 6 },
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        display: "grid",
        placeItems: "center",
        textAlign: "center",
      }}
    >
      <Stack spacing={3} alignItems="center" sx={{ maxWidth: 520 }}>
        <Box
          sx={{
            width: 88,
            height: 88,
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",
            bgcolor: "rgba(15, 118, 110, 0.12)",
            color: "#0f766e",
          }}
        >
          <SearchOffRounded sx={{ fontSize: 44 }} />
        </Box>

        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            404 - Page Not Found
          </Typography>
          <Typography variant="h4" component="h1" fontWeight={700}>
            Dashboard page not found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            The dashboard page you are looking for does not exist or may have
            been moved.
          </Typography>
        </Stack>

        <Button
          component={Link}
          href="/dashboard"
          variant="contained"
          startIcon={<HomeRounded />}
          sx={{ textTransform: "none" }}
        >
          Back to dashboard
        </Button>
      </Stack>
    </Paper>
  );
}
