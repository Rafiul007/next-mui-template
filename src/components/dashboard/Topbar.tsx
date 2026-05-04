import { NotificationsNoneRounded, SearchRounded } from "@mui/icons-material";
import { Box, IconButton, Stack, alpha } from "@mui/material";
import { UserProfile } from "@/components/dashboard/UserProfile";

type TopbarProps = {
  title: string;
  subtitle?: string;
};

export function Topbar({}: TopbarProps) {
  return (
    <Box
      sx={{
        px: { xs: 2, md: 3 },
        py: 2,
        bgcolor: "#09111c",
        color: "#e2e8f0",
        display: "flex",
        alignItems: "end",
        justifyContent: "space-between",
      }}
    >
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
    </Box>
  );
}
