"use client";

import { MenuRounded, NotificationsNoneRounded } from "@mui/icons-material";
import {
  Box,
  Chip,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { useQuery } from "@apollo/client/react";
import { GetCenterDocument, MeDocument } from "@/graphql/generated";
import { UserProfile } from "@/components/dashboard/UserProfile";

type TopbarProps = {
  onMenuClick?: () => void;
};

export function Topbar({ onMenuClick }: TopbarProps) {
  const { data } = useQuery(GetCenterDocument);
  const { data: meData } = useQuery(MeDocument, { errorPolicy: "all" });

  // The institute (tenant) name is the org identity. Fall back to the center
  // name for accounts without a tenant (e.g. platform admins).
  const instituteName = meData?.me?.tenantName ?? data?.getCenter?.name;
  const subscription = meData?.me?.subscription ?? null;

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
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
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

          {instituteName ? (
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
              <Typography
                variant="h5"
                noWrap
                sx={{ color: "#f8fafc", fontSize: { xs: "1.1rem", md: "1.5rem" } }}
              >
                {instituteName}
              </Typography>

              {subscription ? (
                <Tooltip
                  title={
                    subscription.features.length
                      ? `Features: ${subscription.features.join(", ")}`
                      : ""
                  }
                  arrow
                >
                  <Chip
                    label={subscription.plan}
                    size="small"
                    sx={{
                      display: { xs: "none", sm: "inline-flex" },
                      textTransform: "capitalize",
                      fontWeight: 700,
                      color: "#e0f2fe",
                      bgcolor: alpha("#38bdf8", 0.16),
                      border: "1px solid",
                      borderColor: alpha("#38bdf8", 0.32),
                    }}
                  />
                </Tooltip>
              ) : null}
            </Stack>
          ) : (
            <Skeleton
              variant="text"
              width={220}
              height={36}
              sx={{ bgcolor: alpha("#ffffff", 0.1), borderRadius: 1 }}
            />
          )}
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <IconButton
            sx={{
              borderRadius: 2,
              color: "#e2e8f0",
              bgcolor: alpha("#ffffff", 0.05),
              border: "1px solid rgba(148, 163, 184, 0.12)",
            }}
          >
            <NotificationsNoneRounded />
          </IconButton>

          <UserProfile />
        </Stack>
      </Stack>
    </Box>
  );
}
