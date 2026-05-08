import {
  ApartmentRounded,
  AttachMoneyRounded,
  LayersRounded,
  TrendingUpRounded,
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
    label: "Total Tenants",
    value: "48",
    trend: "+6 this month",
    icon: ApartmentRounded,
  },
  {
    label: "Active Subscriptions",
    value: "41",
    trend: "85% active",
    icon: LayersRounded,
  },
  {
    label: "Monthly Revenue",
    value: "৳3.2L",
    trend: "+12.4%",
    icon: AttachMoneyRounded,
  },
  {
    label: "Growth Rate",
    value: "18.6%",
    trend: "MoM",
    icon: TrendingUpRounded,
  },
];

const recentTenants = [
  {
    name: "Ideal Institute, Motijheel",
    plan: "Pro",
    status: "active",
    joined: "2 days ago",
  },
  {
    name: "Scholastica Coaching",
    plan: "Growth",
    status: "trial",
    joined: "5 days ago",
  },
  {
    name: "Mastermind Academy",
    plan: "Starter",
    status: "active",
    joined: "1 week ago",
  },
  {
    name: "Talent Hub, Sylhet",
    plan: "Pro",
    status: "suspended",
    joined: "2 weeks ago",
  },
];

const statusColors: Record<string, string> = {
  active: "#10b981",
  trial: "#f59e0b",
  suspended: "#ef4444",
};

export default function BongoDashboardPage() {
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
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              Revenue Trend
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Monthly recurring revenue over the last 12 months
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
                alignItems: "end",
                gap: 1,
                minHeight: 200,
              }}
            >
              {[38, 52, 48, 65, 60, 74, 68, 80, 76, 88, 82, 96].map(
                (value, index) => (
                  <Box key={`${value}-${index}`} sx={{ gridColumn: "span 1" }}>
                    <Box
                      sx={{
                        height: `${value * 1.6}px`,
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
              {["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"].map((month) => (
                <Typography key={month} variant="caption">
                  {month}
                </Typography>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              Recently Onboarded
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              New tenants from the last 30 days
            </Typography>

            <Stack spacing={1.5}>
              {recentTenants.map((tenant) => (
                <Box
                  key={tenant.name}
                  sx={{
                    p: 1.75,
                    borderRadius: 2,
                    bgcolor: alpha("#0f172a", 0.03),
                    border: "1px solid",
                    borderColor: alpha("#0f172a", 0.06),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="subtitle2"
                      noWrap
                      sx={{ fontWeight: 600 }}
                    >
                      {tenant.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {tenant.plan} · {tenant.joined}
                    </Typography>
                  </Box>
                  <Chip
                    label={tenant.status}
                    size="small"
                    sx={{
                      textTransform: "capitalize",
                      bgcolor: alpha(statusColors[tenant.status] ?? "#94a3b8", 0.12),
                      color: statusColors[tenant.status] ?? "#64748b",
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Stack>
  );
}
