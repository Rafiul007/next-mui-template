import { Box, Typography } from "@mui/material";
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
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr auto 1fr" },
        alignItems: "center",
        gap: 2,
        minHeight: 72,
        px: { xs: 2, md: 3 },
        py: 1.5,
        bgcolor: "#0f172a",
        color: "#e2e8f0",
      }}
    >
      <Box sx={{ display: { xs: "none", md: "block" } }} />

      <Typography
        variant="h6"
        component="div"
        sx={{
          justifySelf: { xs: "flex-start", md: "center" },
          fontWeight: 800,
          color: "inherit",
          letterSpacing: 0.3,
        }}
      >
        {logoText}
      </Typography>

      <Box sx={{ justifySelf: { xs: "flex-start", md: "end" } }}>
        <UserProfile name={userName} role={userRole} />
      </Box>
    </Box>
  );
}
