"use client";

import {
  AnnouncementRounded,
  AutoStoriesRounded,
  BadgeRounded,
  CheckCircleRounded,
  PeopleAltRounded,
  SchoolRounded,
} from "@mui/icons-material";
import { useQuery } from "@apollo/client/react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import {
  GetAllBatchesDocument,
  GetAllNoticesDocument,
  GetEmployeesDocument,
  GetStudentsDocument,
} from "@/graphql/generated";
import { primaryGradient } from "@/theme/theme";

const fmt = (n: number) => n.toLocaleString("en-BD");

const STATUS_COLOR: Record<string, string> = {
  ongoing: "#2563eb",
  upcoming: "#3b82f6",
  completed: "#64748b",
  cancelled: "#ef4444",
};

const STATUS_LABEL: Record<string, string> = {
  ongoing: "Ongoing",
  upcoming: "Upcoming",
  completed: "Completed",
  cancelled: "Cancelled",
};

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  loading,
  accent,
  shadowColor,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  loading: boolean;
  accent?: string;
  shadowColor?: string;
}) {
  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary" noWrap>
              {label}
            </Typography>
            {loading ? (
              <Skeleton width={80} height={44} sx={{ mt: 0.5 }} />
            ) : (
              <Typography variant="h4" sx={{ mt: 0.5, mb: 0.75, fontWeight: 700 }}>
                {value}
              </Typography>
            )}
            {sub &&
              (loading ? (
                <Skeleton width={100} height={20} />
              ) : (
                <Typography variant="caption" color="text.secondary">
                  {sub}
                </Typography>
              ))}
          </Box>
          <Box
            sx={{
              flexShrink: 0,
              width: 48,
              height: 48,
              display: "grid",
              placeItems: "center",
              borderRadius: 2.5,
              background: accent ?? primaryGradient,
              color: "#ffffff",
              boxShadow: `0 8px 20px ${alpha(shadowColor ?? "#2563eb", 0.28)}`,
            }}
          >
            <Icon />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: studentsData, loading: studentsLoading } =
    useQuery(GetStudentsDocument);
  const { data: batchesData, loading: batchesLoading } =
    useQuery(GetAllBatchesDocument);
  const { data: employeesData, loading: employeesLoading } =
    useQuery(GetEmployeesDocument);
  const { data: noticesData, loading: noticesLoading } =
    useQuery(GetAllNoticesDocument);

  const students = studentsData?.getStudents ?? [];
  const batches = batchesData?.getAllBatches ?? [];
  const employees = employeesData?.getEmployees ?? [];
  const notices = noticesData?.getAllNotices ?? [];

  // ── Derived metrics ──────────────────────────────────────────────────────
  const totalStudents = students.length;
  const activeStudents = students.filter(
    (s) => s.status?.toLowerCase() === "active",
  ).length;

  const batchStatusCounts = batches.reduce<Record<string, number>>(
    (acc, b) => {
      const s = (b.status ?? "").toLowerCase();
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    },
    {},
  );
  const ongoingBatches = batchStatusCounts["ongoing"] ?? 0;
  const upcomingBatches = batchStatusCounts["upcoming"] ?? 0;

  const totalEnrolled = batches
    .filter((b) => (b.status ?? "").toLowerCase() === "ongoing")
    .reduce((s, b) => s + b.enrolledCount, 0);

  const totalCapacity = batches
    .filter((b) => (b.status ?? "").toLowerCase() === "ongoing")
    .reduce((s, b) => s + b.capacity, 0);

  const activeStaff = employees.filter(
    (e) => e.status?.toLowerCase() === "active",
  ).length;

  // ── Batch utilization: top 5 ongoing by fill rate ────────────────────────
  const topBatches = [...batches]
    .filter(
      (b) =>
        (b.status ?? "").toLowerCase() === "ongoing" && b.capacity > 0,
    )
    .sort((a, b) => b.enrolledCount / b.capacity - a.enrolledCount / a.capacity)
    .slice(0, 6);

  // ── Recent published notices ─────────────────────────────────────────────
  const recentNotices = [...notices]
    .filter((n) => n.status?.toUpperCase() === "PUBLISHED")
    .sort((a, b) =>
      (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""),
    )
    .slice(0, 4);

  const isLoading = studentsLoading || batchesLoading || employeesLoading;

  return (
    <Stack spacing={3}>
      {/* ── KPI row ──────────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0,1fr))",
            xl: "repeat(4, minmax(0,1fr))",
          },
        }}
      >
        <MetricCard
          label="Total Students"
          value={fmt(totalStudents)}
          sub={`${fmt(activeStudents)} active`}
          icon={SchoolRounded}
          loading={studentsLoading}
        />
        <MetricCard
          label="Active Batches"
          value={ongoingBatches + upcomingBatches}
          sub={`${ongoingBatches} ongoing · ${upcomingBatches} upcoming`}
          icon={AutoStoriesRounded}
          loading={batchesLoading}
          accent="linear-gradient(135deg,#3b82f6,#6366f1)"
          shadowColor="#3b82f6"
        />
        <MetricCard
          label="Enrolled (Ongoing)"
          value={fmt(totalEnrolled)}
          sub={
            totalCapacity > 0
              ? `${Math.round((totalEnrolled / totalCapacity) * 100)}% capacity used`
              : "—"
          }
          icon={PeopleAltRounded}
          loading={batchesLoading}
          accent="linear-gradient(135deg,#f59e0b,#ef4444)"
          shadowColor="#f59e0b"
        />
        <MetricCard
          label="Active Staff"
          value={fmt(activeStaff)}
          sub={`${fmt(employees.length)} total employees`}
          icon={BadgeRounded}
          loading={employeesLoading}
          accent="linear-gradient(135deg,#8b5cf6,#ec4899)"
          shadowColor="#8b5cf6"
        />
      </Box>

      {/* ── Middle row ───────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", lg: "1.6fr 1fr" },
        }}
      >
        {/* Batch overview */}
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700}>
              Batch Overview
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Status breakdown across {fmt(batches.length)} batches
            </Typography>

            {batchesLoading ? (
              <Stack spacing={2}>
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} height={36} />
                ))}
              </Stack>
            ) : batches.length === 0 ? (
              <Typography color="text.disabled" variant="body2">
                No batches yet.
              </Typography>
            ) : (
              <Stack spacing={2}>
                {["ongoing", "upcoming", "completed", "cancelled"]
                  .filter((s) => (batchStatusCounts[s] ?? 0) > 0)
                  .map((status) => {
                    const count = batchStatusCounts[status] ?? 0;
                    const pct = Math.round((count / batches.length) * 100);
                    const color = STATUS_COLOR[status] ?? "#94a3b8";
                    return (
                      <Box key={status}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ mb: 0.75 }}
                        >
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                bgcolor: color,
                                flexShrink: 0,
                              }}
                            />
                            <Typography variant="body2" fontWeight={600}>
                              {STATUS_LABEL[status]}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2" color="text.secondary">
                              {count} batch{count !== 1 ? "es" : ""}
                            </Typography>
                            <Chip
                              label={`${pct}%`}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: 11,
                                bgcolor: alpha(color, 0.12),
                                color,
                                fontWeight: 700,
                              }}
                            />
                          </Stack>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: alpha(color, 0.12),
                            "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 3 },
                          }}
                        />
                      </Box>
                    );
                  })}
              </Stack>
            )}

            {topBatches.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
                  Top Ongoing Batches by Fill Rate
                </Typography>
                <Stack spacing={1.5}>
                  {topBatches.map((b) => {
                    const fill =
                      b.capacity > 0
                        ? Math.round((b.enrolledCount / b.capacity) * 100)
                        : 0;
                    const isFull = fill >= 100;
                    return (
                      <Box key={b.id}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ mb: 0.5 }}
                        >
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            noWrap
                            sx={{ maxWidth: "55%" }}
                          >
                            {b.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color={isFull ? "error.main" : "text.secondary"}
                            fontWeight={isFull ? 700 : 400}
                          >
                            {b.enrolledCount}/{b.capacity}
                            {isFull ? " · Full" : ""}
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(fill, 100)}
                          color={isFull ? "error" : "primary"}
                          sx={{ height: 4, borderRadius: 2 }}
                        />
                      </Box>
                    );
                  })}
                </Stack>
              </>
            )}
          </CardContent>
        </Card>

        {/* Notice board */}
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
              <Typography variant="h6" fontWeight={700}>
                Notice Board
              </Typography>
              {!noticesLoading && recentNotices.length > 0 && (
                <Chip
                  label={`${recentNotices.length} live`}
                  size="small"
                  icon={<CheckCircleRounded sx={{ fontSize: "14px !important" }} />}
                  sx={{ bgcolor: alpha("#2563eb", 0.1), color: "primary.dark", fontWeight: 600 }}
                />
              )}
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Most recent published announcements
            </Typography>

            {noticesLoading ? (
              <Stack spacing={2}>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} height={64} sx={{ borderRadius: 2 }} />
                ))}
              </Stack>
            ) : recentNotices.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: "center",
                  bgcolor: alpha("#0f172a", 0.03),
                  border: "1px dashed",
                  borderColor: "divider",
                  borderRadius: 2,
                }}
              >
                <AnnouncementRounded sx={{ fontSize: 32, color: "text.disabled", mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  No published notices yet.
                </Typography>
              </Paper>
            ) : (
              <Stack spacing={1.5}>
                {recentNotices.map((notice, i) => (
                  <Paper
                    key={notice.id}
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: i === 0 ? alpha("#2563eb", 0.3) : "divider",
                      bgcolor: i === 0 ? alpha("#2563eb", 0.04) : "transparent",
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={700} noWrap>
                      {notice.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 0.25,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {notice.body}
                    </Typography>
                    {notice.publishedAt && (
                      <Typography variant="caption" color="text.disabled" sx={{ mt: 0.75, display: "block" }}>
                        {new Date(notice.publishedAt).toLocaleDateString("en-BD", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </Typography>
                    )}
                  </Paper>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* ── Quick stats row ───────────────────────────────────────────────── */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0,1fr))",
            md: "repeat(4, minmax(0,1fr))",
          },
        }}
      >
        {[
          {
            label: "Total Capacity (Ongoing)",
            value: isLoading ? null : fmt(totalCapacity),
            color: "#3b82f6",
          },
          {
            label: "Available Seats",
            value: isLoading ? null : fmt(Math.max(totalCapacity - totalEnrolled, 0)),
            color: "#2563eb",
          },
          {
            label: "Total Batches",
            value: isLoading ? null : fmt(batches.length),
            color: "#8b5cf6",
          },
          {
            label: "Inactive Students",
            value: isLoading ? null : fmt(totalStudents - activeStudents),
            color: "#f59e0b",
          },
        ].map(({ label, value, color }) => (
          <Paper
            key={label}
            elevation={0}
            sx={{
              p: 2.5,
              border: "1px solid",
              borderColor: alpha(color, 0.2),
              borderRadius: 2,
              bgcolor: alpha(color, 0.04),
            }}
          >
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {label}
            </Typography>
            {value === null ? (
              <Skeleton width={60} height={32} />
            ) : (
              <Typography variant="h5" fontWeight={700} sx={{ color }}>
                {value}
              </Typography>
            )}
          </Paper>
        ))}
      </Box>
    </Stack>
  );
}
