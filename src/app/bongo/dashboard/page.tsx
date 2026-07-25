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
  CircularProgress,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { useQuery } from "@apollo/client/react";
import { GetRevenueSummaryDocument, GetTenantsDocument } from "@/graphql/generated";
import { primaryGradient } from "@/theme/theme";

const statusColors: Record<string, string> = {
  active: "#2563eb",
  trial: "#f59e0b",
  suspended: "#ef4444",
};

function formatBdt(amount: number): string {
  if (amount >= 100000) {
    return `৳${(amount / 100000).toFixed(1)}L`;
  }
  return `৳${amount.toLocaleString("en-BD")}`;
}

function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
}

export default function BongoDashboardPage() {
  const { data: revenueData, loading: revenueLoading } = useQuery(
    GetRevenueSummaryDocument,
  );
  const { data: tenantsData, loading: tenantsLoading } = useQuery(
    GetTenantsDocument,
    { variables: { page: 1, limit: 100 } },
  );

  const summary = revenueData?.getRevenueSummary;
  const recentTenants = [...(tenantsData?.getTenants ?? [])]
    .sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() -
        new Date(a.createdAt ?? 0).getTime(),
    )
    .slice(0, 4);

  const metrics = [
    {
      label: "Total Tenants",
      value: summary ? String(summary.totalTenants) : "—",
      trend: `${summary?.activeTenants ?? 0} active`,
      icon: ApartmentRounded,
    },
    {
      label: "Active Subscriptions",
      value: summary ? String(summary.activeTenants) : "—",
      trend: summary && summary.totalTenants > 0
        ? `${Math.round((summary.activeTenants / summary.totalTenants) * 100)}% active`
        : "",
      icon: LayersRounded,
    },
    {
      label: "Monthly Recurring Revenue",
      value: summary ? formatBdt(summary.mrr) : "—",
      trend: summary ? `${formatBdt(summary.totalCollected)} collected` : "",
      icon: AttachMoneyRounded,
    },
    {
      label: "Outstanding",
      value: summary ? formatBdt(summary.totalOutstanding) : "—",
      trend: summary ? `${formatBdt(summary.totalInvoiced)} invoiced` : "",
      icon: TrendingUpRounded,
    },
  ];

  if (revenueLoading || tenantsLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

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
                        bgcolor: alpha("#2563eb", 0.1),
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
                      boxShadow: "0 10px 22px rgba(37, 99, 235, 0.22)",
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

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Recently Onboarded
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Latest tenants by signup date
          </Typography>

          {recentTenants.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No tenants yet.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {recentTenants.map((tenant) => {
                const statusKey = (tenant.status ?? "").toLowerCase();
                return (
                  <Box
                    key={tenant.id}
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
                        {tenant.legalName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {timeAgo(tenant.createdAt)}
                      </Typography>
                    </Box>
                    <Chip
                      label={statusKey}
                      size="small"
                      sx={{
                        textTransform: "capitalize",
                        bgcolor: alpha(statusColors[statusKey] ?? "#94a3b8", 0.12),
                        color: statusColors[statusKey] ?? "#64748b",
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    />
                  </Box>
                );
              })}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
