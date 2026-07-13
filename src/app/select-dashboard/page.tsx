"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import {
  Box,
  Card,
  CircularProgress,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { ArrowForwardRounded } from "@mui/icons-material";
import { MeDocument } from "@/graphql/generated";
import {
  accessibleDashboardKeys,
  pathForDashboard,
  resolveHomePath,
} from "@/lib/auth/roles";
import { DASHBOARD_META } from "@/lib/auth/dashboardMeta";
import { primaryGradient } from "@/theme/theme";

// Shown after login to users who belong to more than one dashboard. A user with
// a single home never lands here: resolveHomePath routes them straight in, and
// this page re-routes anyone who arrives with 0 or 1 accessible dashboards.
export default function SelectDashboardPage() {
  const router = useRouter();
  const { loading, error, data } = useQuery(MeDocument, {
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  });

  const me = data?.me ?? null;
  const keys = me ? accessibleDashboardKeys(me) : [];
  const isAuthFailure = !!error && !me;
  const shouldRedirect = !loading && (isAuthFailure || (me && keys.length <= 1));

  useEffect(() => {
    if (!shouldRedirect) return;
    if (isAuthFailure) {
      router.replace("/login");
    } else if (me) {
      router.replace(resolveHomePath(me));
    }
  }, [shouldRedirect, isAuthFailure, me, router]);

  if (loading && !data) {
    return (
      <Box
        sx={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Don't flash the picker while a redirect is in flight.
  if (shouldRedirect) return null;

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, sm: 3 },
        py: { xs: 4, md: 6 },
        background: "rgba(37, 99, 235, 0.06)",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 880 }}>
        <Stack spacing={1} sx={{ mb: 4, textAlign: "center" }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
            Choose a dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You have access to more than one workspace. Pick where to go.
          </Typography>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gap: 2.5,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
            },
          }}
        >
          {keys.map((key) => {
            const meta = DASHBOARD_META[key];
            const Icon = meta.icon;

            return (
              <Card
                key={key}
                role="button"
                tabIndex={0}
                onClick={() => router.push(pathForDashboard(key))}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    router.push(pathForDashboard(key));
                  }
                }}
                sx={{
                  p: 3,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  transition:
                    "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    borderColor: "primary.main",
                    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.16)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    flexShrink: 0,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: 2,
                    background: primaryGradient,
                    color: "#ffffff",
                  }}
                >
                  <Icon />
                </Box>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {meta.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {meta.description}
                  </Typography>
                </Box>

                <ArrowForwardRounded
                  sx={{ color: alpha("#0f172a", 0.4), flexShrink: 0 }}
                />
              </Card>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
