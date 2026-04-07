"use client";

import { Avatar, Box, Stack, Typography } from "@mui/material";

type UserProfileProps = {
  name: string;
  role?: string;
};

export function UserProfile({
  name,
  role = "Dashboard User",
}: UserProfileProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      justifyContent="flex-end"
      sx={{
        px: 5.5,
        py: 1,
        bgcolor: "rgba(255, 255, 255, 0.06)",
        border: "1px solid",
        borderColor: "rgba(148, 163, 184, 0.18)",
      }}
    >
      <Avatar
        sx={{
          width: 40,
          height: 40,
          bgcolor: "primary.main",
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        {initials}
      </Avatar>

      <Box>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, lineHeight: 1.1, color: "#f8fafc" }}
        >
          {name}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: "rgba(226, 232, 240, 0.72)" }}
        >
          {role}
        </Typography>
      </Box>
    </Stack>
  );
}
