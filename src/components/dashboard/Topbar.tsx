"use client";

import { NotificationsNoneRounded } from "@mui/icons-material";
import { Box, IconButton, Skeleton, Stack, Typography, alpha } from "@mui/material";
import { useQuery } from "@apollo/client/react";
import { GetCenterDocument } from "@/graphql/generated";
import { UserProfile } from "@/components/dashboard/UserProfile";

export function Topbar() {
  const { data } = useQuery(GetCenterDocument);
  const centerName = data?.getCenter?.name;

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
        {centerName ? (
          <Typography variant="h5" sx={{ color: "#f8fafc" }}>
            {centerName}
          </Typography>
        ) : (
          <Skeleton
            variant="text"
            width={220}
            height={36}
            sx={{ bgcolor: alpha("#ffffff", 0.1), borderRadius: 1 }}
          />
        )}

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
