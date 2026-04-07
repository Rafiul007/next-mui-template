import { Paper, Typography } from "@mui/material";

export default function DashboardPage() {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard Page
      </Typography>
      <Typography variant="body1" color="text.secondary">
        This is the dashboard page content area.
      </Typography>
    </Paper>
  );
}
