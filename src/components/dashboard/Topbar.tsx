import {
  NotificationsNoneRounded,
  SearchRounded,
} from "@mui/icons-material";
import { Box, IconButton, InputBase, Stack, Typography, alpha } from "@mui/material";
import { UserProfile } from "@/components/dashboard/UserProfile";

type TopbarProps = {
  logoText: string;
  userName: string;
  userRole?: string;
};

export function Topbar({ logoText, userName, userRole }: TopbarProps) {
  return (
    <Box
      sx={{
        flexShrink: 0,
        px: { xs: 2, md: 3 },
        py: 2,
        bgcolor: "#09111c",
        color: "#e2e8f0",
        borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
      >
        <Box>
          <Typography variant="h5" sx={{ color: "#f8fafc" }}>
            {logoText}
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(226, 232, 240, 0.68)" }}>
            Welcome back. Here is what needs attention today.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              minWidth: { md: 280 },
              px: 1.5,
              py: 0.75,
              borderRadius: 2,
              bgcolor: alpha("#ffffff", 0.05),
              border: "1px solid rgba(148, 163, 184, 0.12)",
            }}
          >
            <SearchRounded sx={{ color: "rgba(148, 163, 184, 0.9)" }} />
            <InputBase
              placeholder="Search menu, reports, people"
              sx={{
                flex: 1,
                color: "#e2e8f0",
                "& input::placeholder": {
                  color: "rgba(148, 163, 184, 0.86)",
                  opacity: 1,
                },
              }}
            />
          </Box>

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

          <UserProfile name={userName} role={userRole} />
        </Stack>
      </Stack>
    </Box>
  );
}
