"use client";

import dayjs from "dayjs";
import {
  CheckCircleRounded,
  EventAvailableRounded,
  InfoRounded,
  WarningAmberRounded,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { useQuery } from "@apollo/client/react";
import {
  MyAttendanceSummaryDocument,
  MyEnrollmentsDocument,
} from "@/graphql/student-portal";
import { GetSessionsByBatchDocument } from "@/graphql/generated";
import { SummaryCard } from "@/components/ui";

function BatchSessions({ batchId }: { batchId: string }) {
  const { data, loading } = useQuery(GetSessionsByBatchDocument, {
    variables: { batchId },
  });

  if (loading) return <CircularProgress size={16} />;

  const sessions = [...(data?.getSessionsByBatch ?? [])]
    .filter((s) => s.status === "COMPLETED")
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 20);

  if (sessions.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No completed sessions yet.
      </Typography>
    );
  }

  return (
    <Stack spacing={1}>
      {sessions.map((session) => (
        <Box
          key={session.id}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 1.5,
            borderRadius: 1.5,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack>
            <Typography variant="body2" fontWeight={600}>
              {dayjs(session.date).format("D MMM YYYY")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {session.startTime} – {session.endTime}
            </Typography>
          </Stack>
          <Chip
            label={session.status}
            size="small"
            color="success"
            variant="outlined"
          />
        </Box>
      ))}
    </Stack>
  );
}

export function AttendanceWorkspace() {
  const { data: summaryData, loading: summaryLoading } = useQuery(
    MyAttendanceSummaryDocument,
  );
  const { data: enrollmentsData, loading: enrollmentsLoading } = useQuery(
    MyEnrollmentsDocument,
  );

  const summary = summaryData?.myAttendanceSummary;
  const activeEnrollments = (enrollmentsData?.myEnrollments ?? []).filter(
    (e) => e.status === "ACTIVE",
  );

  const isLoading = summaryLoading || enrollmentsLoading;

  return (
    <Stack spacing={3}>
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
        <Stack direction="row" spacing={1.5} alignItems="center">
          <EventAvailableRounded sx={{ color: "primary.main" }} />
          <Box>
            <Typography variant="h4" component="h1">
              My Attendance
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Track your presence across all sessions
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Shortage alert */}
          {summary?.shortageAlert && (
            <Alert severity="warning" icon={<WarningAmberRounded />}>
              Attendance shortage! You are below the 75% minimum threshold.
              Current: {summary.presentPercent.toFixed(1)}%
            </Alert>
          )}

          {/* Summary stats */}
          {summary && (
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
                caption="Attendance rate"
                title={`${summary.presentPercent.toFixed(1)}%`}
                icon={<EventAvailableRounded />}
                tone={
                  summary.shortageAlert
                    ? "error"
                    : summary.presentPercent >= 75
                      ? "success"
                      : "warning"
                }
              />
              <SummaryCard
                caption="Present"
                title={`${summary.presentCount} / ${summary.totalSessions}`}
                icon={<CheckCircleRounded />}
                tone="success"
              />
              <SummaryCard
                caption="Absent"
                title={String(summary.absentCount)}
                icon={<WarningAmberRounded />}
                tone={summary.absentCount > 0 ? "error" : "default"}
              />
              <SummaryCard
                caption="Late"
                title={String(summary.lateCount)}
                icon={<InfoRounded />}
                tone={summary.lateCount > 0 ? "warning" : "default"}
              />
            </Box>
          )}

          {/* Progress bar */}
          {summary && (
            <Paper
              elevation={0}
              sx={{ p: 3, border: "1px solid", borderColor: "divider" }}
            >
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" fontWeight={600}>
                    Attendance Progress
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Target: 75%
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    height: 12,
                    borderRadius: 6,
                    bgcolor: alpha("#0f172a", 0.06),
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      height: "100%",
                      borderRadius: 6,
                      width: `${Math.min(summary.presentPercent, 100)}%`,
                      bgcolor:
                        summary.presentPercent >= 75
                          ? "success.main"
                          : summary.presentPercent >= 60
                            ? "warning.main"
                            : "error.main",
                      transition: "width 0.6s ease",
                    }}
                  />
                </Box>
                {/* 75% marker */}
                <Box sx={{ position: "relative", height: 0 }}>
                  <Box
                    sx={{
                      position: "absolute",
                      left: "75%",
                      top: -14,
                      transform: "translateX(-50%)",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      75%
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Paper>
          )}

          {/* Sessions list per enrollment */}
          {activeEnrollments.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: "center",
                border: "1px dashed",
                borderColor: "divider",
              }}
            >
              <Typography variant="h6" color="text.secondary">
                No active enrollments
              </Typography>
            </Paper>
          ) : (
            activeEnrollments.map((enrollment) => (
              <Paper
                key={enrollment.id}
                elevation={0}
                sx={{ p: 3, border: "1px solid", borderColor: "divider" }}
              >
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 2, textTransform: "uppercase", letterSpacing: 0.5 }}
                >
                  Recent Sessions · Batch {enrollment.batchId.slice(0, 8)}…
                </Typography>
                <BatchSessions batchId={enrollment.batchId} />
              </Paper>
            ))
          )}
        </>
      )}
    </Stack>
  );
}
