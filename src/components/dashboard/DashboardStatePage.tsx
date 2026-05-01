import {
  ArrowBackRounded,
  ConstructionRounded,
  SearchOffRounded,
} from "@mui/icons-material";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";

type DashboardStatePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  mode?: "construction" | "notFound";
};

export function DashboardStatePage({
  eyebrow,
  title,
  description,
  mode = "construction",
}: DashboardStatePageProps) {
  const Icon =
    mode === "construction" ? ConstructionRounded : SearchOffRounded;
  const accentBg =
    mode === "construction" ? "rgba(37, 99, 235, 0.12)" : "rgba(15, 118, 110, 0.12)";
  const accentColor = mode === "construction" ? "#2563eb" : "#0f766e";

  return (
    <Paper
      elevation={0}
      sx={{
        minHeight: "100%",
        p: { xs: 3, md: 6 },
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        display: "grid",
        placeItems: "center",
        textAlign: "center",
      }}
    >
      <Stack spacing={3} alignItems="center" sx={{ maxWidth: 560 }}>
        <Box
          sx={{
            width: 88,
            height: 88,
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",
            bgcolor: accentBg,
            color: accentColor,
          }}
        >
          <Icon sx={{ fontSize: 44 }} />
        </Box>

        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            {eyebrow}
          </Typography>
          <Typography variant="h4" component="h1" fontWeight={700}>
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {description}
          </Typography>
        </Stack>

        <Button
          component="a"
          href="/dashboard"
          variant="contained"
          startIcon={<ArrowBackRounded />}
          sx={{ textTransform: "none" }}
        >
          Back to dashboard
        </Button>
      </Stack>
    </Paper>
  );
}
