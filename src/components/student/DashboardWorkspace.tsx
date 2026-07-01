"use client";

import dayjs from "dayjs";
import {
  AssignmentRounded,
  CalendarTodayRounded,
  CampaignRounded,
  EventAvailableRounded,
  NotificationsNoneRounded,
  PaymentsRounded,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { useQuery } from "@apollo/client/react";
import {
  MyAttendanceSummaryDocument,
  MyEnrollmentsDocument,
  MyInvoicesDocument,
} from "@/graphql/student-portal";
import {
  GetMyRoutineDocument,
  GetMyUnreadCountDocument,
  GetNoticesForBatchDocument,
} from "@/graphql/generated";
import { SummaryCard } from "@/components/ui";

const DAY_NAMES = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

const formatAmount = (n: number) =>
  `৳${n.toLocaleString("en-BD", { minimumFractionDigits: 0 })}`;

export function DashboardWorkspace() {
  const { data: attendanceData, loading: attendanceLoading } = useQuery(
    MyAttendanceSummaryDocument,
  );
  const { data: unreadData } = useQuery(GetMyUnreadCountDocument);
  const { data: enrollmentsData, loading: enrollmentsLoading } = useQuery(
    MyEnrollmentsDocument,
  );
  const { data: invoicesData } = useQuery(MyInvoicesDocument);

  const activeEnrollments = (enrollmentsData?.myEnrollments ?? []).filter(
    (e) => e.status === "ACTIVE",
  );
  const firstBatchId = activeEnrollments[0]?.batchId ?? "";

  const { data: routineData } = useQuery(GetMyRoutineDocument, {
    variables: { batchId: firstBatchId },
    skip: !firstBatchId,
  });

  const { data: noticesData } = useQuery(GetNoticesForBatchDocument, {
    variables: { batchId: firstBatchId },
    skip: !firstBatchId,
  });

  const summary = attendanceData?.myAttendanceSummary;
  const unreadCount = unreadData?.myUnreadCount ?? 0;
  const invoices = invoicesData?.myInvoices ?? [];
  const overdueCount = invoices.filter((inv) => inv.status === "OVERDUE").length;
  const outstandingTotal = invoices
    .filter((inv) => !["PAID", "WAIVED"].includes(inv.status))
    .reduce((s, inv) => s + (inv.total - inv.paidAmount), 0);

  const todayName = DAY_NAMES[new Date().getDay()];
  const todayClasses = (routineData?.myRoutine ?? []).filter(
    (r) => r.dayOfWeek === todayName,
  );

  const recentNotices = (noticesData?.getNoticesForBatch ?? [])
    .filter((n) => n.status === "PUBLISHED")
    .slice(0, 3);

  const isLoading = attendanceLoading || enrollmentsLoading;

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          border: "1px solid",
          borderColor: "divider",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(240,253,250,0.98) 100%)",
        }}
      >
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {dayjs().format("dddd, D MMMM YYYY")}
        </Typography>
      </Paper>

      {/* Stats row */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "1fr 1fr",
            md: "repeat(4, minmax(0, 1fr))",
          },
        }}
      >
        <SummaryCard
          caption="Attendance"
          title={summary ? `${summary.presentPercent.toFixed(0)}%` : "—"}
          icon={<EventAvailableRounded />}
          tone={
            summary
              ? summary.shortageAlert
                ? "error"
                : summary.presentPercent >= 75
                  ? "success"
                  : "warning"
              : "default"
          }
        />
        <SummaryCard
          caption="Outstanding dues"
          title={outstandingTotal > 0 ? formatAmount(outstandingTotal) : "৳0"}
          icon={<PaymentsRounded />}
          tone={overdueCount > 0 ? "error" : outstandingTotal > 0 ? "warning" : "success"}
        />
        <SummaryCard
          caption="Unread notifications"
          title={String(unreadCount)}
          icon={<NotificationsNoneRounded />}
          tone={unreadCount > 0 ? "warning" : "default"}
        />
        <SummaryCard
          caption="Classes today"
          title={String(todayClasses.length)}
          icon={<CalendarTodayRounded />}
          tone="default"
        />
      </Box>

      {/* Shortage alert */}
      {summary?.shortageAlert && (
        <Alert severity="warning">
          Attendance shortage alert — current attendance is{" "}
          {summary.presentPercent.toFixed(1)}%. Minimum 75% required.
        </Alert>
      )}

      {/* Body: Today's schedule + Recent notices */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        }}
      >
        {/* Today's classes */}
        <Paper
          elevation={0}
          sx={{ p: 3, border: "1px solid", borderColor: "divider" }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <CalendarTodayRounded sx={{ color: "primary.main", fontSize: 20 }} />
            <Typography variant="h6" fontWeight={700}>
              Today&apos;s Classes
            </Typography>
            <Chip
              label={dayjs().format("ddd")}
              size="small"
              variant="outlined"
            />
          </Stack>

          {!firstBatchId ? (
            <Typography variant="body2" color="text.secondary">
              No active enrollment found.
            </Typography>
          ) : todayClasses.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No classes scheduled for today.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {todayClasses.map((cls) => (
                <Box
                  key={cls.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    border: "1px solid",
                    borderColor: alpha("#10b981", 0.2),
                    bgcolor: alpha("#10b981", 0.04),
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" fontWeight={600}>
                      {cls.startTime} – {cls.endTime}
                    </Typography>
                    {cls.roomName && (
                      <Chip label={cls.roomName} size="small" variant="outlined" />
                    )}
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </Paper>

        {/* Recent notices */}
        <Paper
          elevation={0}
          sx={{ p: 3, border: "1px solid", borderColor: "divider" }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <CampaignRounded sx={{ color: "warning.main", fontSize: 20 }} />
            <Typography variant="h6" fontWeight={700}>
              Latest Notices
            </Typography>
          </Stack>

          {recentNotices.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No recent notices.
            </Typography>
          ) : (
            <Stack spacing={1.5} divider={<Divider />}>
              {recentNotices.map((notice) => (
                <Box key={notice.id}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {notice.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {notice.body}
                  </Typography>
                  {notice.publishedAt && (
                    <Typography variant="caption" color="text.disabled" sx={{ mt: 0.25, display: "block" }}>
                      {dayjs(notice.publishedAt).format("D MMM YYYY")}
                    </Typography>
                  )}
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      </Box>

      {/* Active enrollments */}
      {activeEnrollments.length > 0 && (
        <Paper
          elevation={0}
          sx={{ p: 3, border: "1px solid", borderColor: "divider" }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <AssignmentRounded sx={{ color: "info.main", fontSize: 20 }} />
            <Typography variant="h6" fontWeight={700}>
              My Enrollments
            </Typography>
            <Chip
              label={activeEnrollments.length}
              size="small"
              color="info"
              variant="outlined"
            />
          </Stack>
          <Stack spacing={1}>
            {activeEnrollments.map((e) => (
              <Box
                key={e.id}
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" color="text.secondary" noWrap>
                  Batch ID: {e.batchId}
                </Typography>
                <Chip
                  label={e.status}
                  size="small"
                  color={e.status === "ACTIVE" ? "success" : "default"}
                  variant="outlined"
                />
              </Box>
            ))}
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
