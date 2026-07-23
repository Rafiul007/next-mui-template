"use client";

import { useRouter } from "next/navigation";
import { CalendarMonthRounded, QuizRounded } from "@mui/icons-material";
import { useQuery } from "@apollo/client/react";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { GetMyScheduledExamsDocument } from "@/graphql/generated";

const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
};

export function StudentExamsWorkspace() {
  const router = useRouter();
  const { data, loading } = useQuery(GetMyScheduledExamsDocument, {
    fetchPolicy: "cache-and-network",
  });

  const exams = [...(data?.getMyScheduledExams ?? [])].sort((a, b) =>
    (b.startAt ?? "").localeCompare(a.startAt ?? ""),
  );

  return (
    <Stack spacing={3}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          border: "1px solid",
          borderColor: "divider",
          background: "linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(240,249,255,0.98) 100%)",
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <QuizRounded sx={{ color: "primary.main" }} />
          <Box>
            <Typography variant="h4" component="h1">
              Exams
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Exams scheduled for you. Start when the exam window opens.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {loading && exams.length === 0 ? (
        <Typography color="text.secondary">Loading exams…</Typography>
      ) : exams.length === 0 ? (
        <Box sx={{ py: 8, textAlign: "center", border: "1px dashed", borderColor: "divider", borderRadius: 2 }}>
          <QuizRounded sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }} />
          <Typography variant="h6" color="text.secondary">
            No exams scheduled
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Exams your teacher schedules for you will show up here.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {exams.map((exam) => (
            <Paper key={exam.id} elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ sm: "center" }}
                justifyContent="space-between"
              >
                <Box sx={{ minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle1" fontWeight={700} noWrap>
                      {exam.title}
                    </Typography>
                    <Chip
                      size="small"
                      label={STATUS_LABEL[exam.status] ?? exam.status}
                      color={exam.status === "SCHEDULED" ? "success" : "default"}
                    />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {exam.totalMarks} marks · pass {exam.passMark}
                    {exam.startAt ? ` · starts ${new Date(exam.startAt).toLocaleString()}` : ""}
                    {exam.durationMinutes ? ` · ${exam.durationMinutes} min` : ""}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<CalendarMonthRounded />}
                  onClick={() => router.push(`/student/exams/${exam.id}`)}
                >
                  Open
                </Button>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
