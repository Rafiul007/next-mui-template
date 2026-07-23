"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { CheckCircleRounded, LeaderboardRounded, VisibilityRounded } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { useQuery } from "@apollo/client/react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import {
  GetMyResultBreakdownDocument,
  GetMyResultsDocument,
  type GetMyResultsQuery,
} from "@/graphql/generated";

type MyResult = GetMyResultsQuery["myResults"][number];

const gradeColor = (
  grade: string | null,
): "success" | "error" | "warning" | "default" => {
  if (!grade) return "default";
  if (["A+", "A", "A-"].includes(grade)) return "success";
  if (["B+", "B", "B-"].includes(grade)) return "default";
  if (["C+", "C", "C-"].includes(grade)) return "warning";
  return "error";
};

function ResultBreakdownDialog({
  examId,
  onClose,
}: {
  examId: string;
  onClose: () => void;
}) {
  const { data, loading } = useQuery(GetMyResultBreakdownDocument, {
    variables: { examId },
  });
  const breakdown = data?.getMyResultBreakdown;

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Result breakdown
        {breakdown ? (
          <Typography variant="body2" color="text.secondary" component="div">
            {breakdown.marksObtained} marks · {breakdown.grade ?? "—"} ·{" "}
            {dayjs(breakdown.publishedAt).format("D MMM YYYY")}
          </Typography>
        ) : null}
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Typography color="text.secondary">Loading…</Typography>
        ) : !breakdown ? (
          <Typography color="text.secondary">Unable to load breakdown.</Typography>
        ) : (
          <Stack spacing={2}>
            {breakdown.remarks ? <Typography variant="body2">{breakdown.remarks}</Typography> : null}
            {breakdown.questions.map((q, index) => (
              <Paper
                key={q.examQuestionId}
                elevation={0}
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: q.correct ? "success.light" : "divider",
                  bgcolor: q.correct ? alpha("#22c55e", 0.05) : "transparent",
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="body1" sx={{ fontWeight: 600, flex: 1 }}>
                    {index + 1}. {q.questionTextSnapshot}
                  </Typography>
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    {q.correct ? <CheckCircleRounded color="success" fontSize="small" /> : null}
                    <Chip size="small" variant="outlined" label={`${q.marksAwarded} marks`} />
                  </Stack>
                </Stack>
                <Stack sx={{ mt: 1 }}>
                  {q.options.map((opt) => {
                    const wasSelected = q.selectedOrders.includes(opt.order);
                    return (
                      <Typography
                        key={opt.order}
                        variant="body2"
                        sx={{
                          py: 0.25,
                          fontWeight: wasSelected ? 700 : 400,
                          color: opt.correct
                            ? "success.main"
                            : wasSelected
                              ? "error.main"
                              : "text.secondary",
                        }}
                      >
                        {wasSelected ? "▶ " : "　"}
                        {opt.text}
                        {opt.correct ? " (correct)" : ""}
                      </Typography>
                    );
                  })}
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export function ResultsWorkspace() {
  const { data, loading } = useQuery(GetMyResultsDocument);
  const [breakdownExamId, setBreakdownExamId] = useState<string | null>(null);

  const results = [...(data?.myResults ?? [])].sort((a, b) =>
    (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""),
  );

  const passCount = results.filter((r) => !["F", "Fail"].includes(r.grade ?? "")).length;
  const avgMarks =
    results.length > 0
      ? results.reduce((s, r) => s + r.marksObtained, 0) / results.length
      : 0;

  const columns: MRT_ColumnDef<MyResult>[] = [
    {
      accessorKey: "examId",
      header: "Exam",
      size: 200,
      Cell: ({ cell }) => (
        <Typography variant="body2" noWrap>
          {String(cell.getValue()).slice(0, 8)}…
        </Typography>
      ),
    },
    {
      accessorKey: "marksObtained",
      header: "Marks",
      size: 90,
      Cell: ({ cell }) => (
        <Typography variant="body2" fontWeight={600}>
          {String(cell.getValue())}
        </Typography>
      ),
    },
    {
      accessorKey: "grade",
      header: "Grade",
      size: 90,
      Cell: ({ cell }) => {
        const grade = cell.getValue() as string | null;
        return grade ? (
          <Chip label={grade} size="small" color={gradeColor(grade)} variant="outlined" />
        ) : (
          <Typography variant="body2" color="text.disabled">
            —
          </Typography>
        );
      },
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
      size: 200,
      Cell: ({ cell }) => (
        <Typography variant="body2" color="text.secondary" noWrap>
          {(cell.getValue() as string | null) ?? "—"}
        </Typography>
      ),
    },
    {
      accessorKey: "publishedAt",
      header: "Published",
      size: 130,
      Cell: ({ cell }) => {
        const val = cell.getValue() as string | null;
        return (
          <Typography variant="body2" color="text.secondary">
            {val ? dayjs(val).format("D MMM YYYY") : "—"}
          </Typography>
        );
      },
    },
    {
      id: "actions",
      header: "",
      size: 100,
      enableSorting: false,
      Cell: ({ row }) => (
        <Button
          size="small"
          variant="outlined"
          startIcon={<VisibilityRounded />}
          onClick={() => setBreakdownExamId(row.original.examId)}
        >
          Details
        </Button>
      ),
    },
  ];

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
          <LeaderboardRounded sx={{ color: "primary.main" }} />
          <Box>
            <Typography variant="h4" component="h1">
              My Results
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Exam results published by your teachers
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Quick stats */}
      {results.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr 1fr 1fr", md: "repeat(3, minmax(0,1fr))" },
          }}
        >
          {[
            { label: "Total exams", value: results.length },
            { label: "Average marks", value: avgMarks.toFixed(1) },
            { label: "Passed", value: passCount },
          ].map((stat) => (
            <Paper
              key={stat.label}
              elevation={0}
              sx={{
                p: 2.5,
                border: "1px solid",
                borderColor: "divider",
                textAlign: "center",
              }}
            >
              <Typography variant="h5" fontWeight={700}>
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.label}
              </Typography>
            </Paper>
          ))}
        </Box>
      )}

      <MaterialReactTable
        columns={columns}
        data={results}
        state={{ isLoading: loading }}
        enableDensityToggle={false}
        enableFullScreenToggle={false}
        enableHiding={false}
        enableStickyHeader
        muiTablePaperProps={{
          elevation: 0,
          sx: {
            border: "1px solid",
            borderColor: alpha("#0f172a", 0.08),
            borderRadius: 2,
            overflow: "hidden",
          },
        }}
        muiTableContainerProps={{ sx: { maxHeight: 520 } }}
        initialState={{ pagination: { pageIndex: 0, pageSize: 25 } }}
        muiTableBodyRowProps={({ row }) => ({
          sx: {
            "&:hover td": { bgcolor: alpha("#f8fafc", 0.8) },
            ...(["F", "Fail"].includes(row.original.grade ?? "")
              ? { "& td": { bgcolor: alpha("#fef2f2", 0.5) } }
              : {}),
          },
        })}
        renderEmptyRowsFallback={() => (
          <Box sx={{ px: 3, py: 8, textAlign: "center" }}>
            <LeaderboardRounded sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }} />
            <Typography variant="h6" color="text.secondary">
              No results yet
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
              Results will appear here when your teacher publishes them.
            </Typography>
          </Box>
        )}
      />

      {breakdownExamId ? (
        <ResultBreakdownDialog examId={breakdownExamId} onClose={() => setBreakdownExamId(null)} />
      ) : null}
    </Stack>
  );
}
