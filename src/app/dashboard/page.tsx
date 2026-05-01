import {
  AutoGraphRounded,
  CheckCircleRounded,
  PeopleAltRounded,
  PlayLessonRounded,
  ReceiptLongRounded,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { primaryGradient } from "@/theme/theme";

const metrics = [
  {
    label: "Active Students",
    value: "12,480",
    trend: "+14.8%",
    icon: PeopleAltRounded,
  },
  {
    label: "Collections This Month",
    value: "৳18.6L",
    trend: "+8.2%",
    icon: ReceiptLongRounded,
  },
  {
    label: "Classes Running",
    value: "214",
    trend: "+12 new",
    icon: PlayLessonRounded,
  },
  {
    label: "Growth Score",
    value: "89/100",
    trend: "Healthy",
    icon: AutoGraphRounded,
  },
];

const activity = [
  "Banani branch admissions increased after the weekend campaign.",
  "Three new batches are ready for schedule publishing.",
  "Pending fee follow-up list dropped by 18% this week.",
];

export default function DashboardPage() {
  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            xl: "repeat(4, minmax(0, 1fr))",
          },
          gap: 2,
        }}
      >
        {metrics.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.label}>
              <CardContent sx={{ p: 3 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {item.label}
                    </Typography>
                    <Typography variant="h4" sx={{ mt: 1, mb: 1 }}>
                      {item.value}
                    </Typography>
                    <Chip
                      label={item.trend}
                      size="small"
                      sx={{
                        bgcolor: alpha("#10b981", 0.1),
                        color: "primary.dark",
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 8,
                      background: primaryGradient,
                      color: "#ffffff",
                      boxShadow: "0 10px 22px rgba(16, 185, 129, 0.22)",
                    }}
                  >
                    <Icon />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "1.5fr 1fr" },
          gap: 2,
        }}
      >
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
              spacing={1}
              sx={{ mb: 3 }}
            >
              <Box>
                <Typography variant="h6">Performance Snapshot</Typography>
                <Typography variant="body2" color="text.secondary">
                  Core operating metrics for the current month
                </Typography>
              </Box>
              <Chip
                icon={<CheckCircleRounded />}
                label="System healthy"
                sx={{
                  bgcolor: alpha("#10b981", 0.1),
                  color: "primary.dark",
                }}
              />
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
                alignItems: "end",
                gap: 1,
                minHeight: 240,
              }}
            >
              {[42, 58, 54, 76, 68, 80, 72, 88, 84, 92, 86, 98].map(
                (value, index) => (
                  <Box key={`${value}-${index}`} sx={{ gridColumn: "span 1" }}>
                    <Box
                      sx={{
                        height: `${value * 1.7}px`,
                        borderRadius: 8,
                        background:
                          index > 8 ? primaryGradient : alpha("#10b981", 0.18),
                      }}
                    />
                  </Box>
                ),
              )}
            </Box>

            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ mt: 1.5, color: "text.secondary" }}
            >
              {["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month) => (
                <Typography key={month} variant="caption">
                  {month}
                </Typography>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6">Recent Highlights</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Important updates from the last 7 days
            </Typography>

            <Stack spacing={2}>
              {activity.map((item, index) => (
                <Box
                  key={item}
                  sx={{
                    p: 2,
                    borderRadius: 8,
                    bgcolor:
                      index === 0
                        ? alpha("#10b981", 0.08)
                        : alpha("#0f172a", 0.025),
                  }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    {item}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Updated {index + 1} hour{index === 0 ? "" : "s"} ago
                  </Typography>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Stack>
  );
}
