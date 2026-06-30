"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  AddRounded,
  AssessmentRounded,
  EditNoteRounded,
  PublishRounded,
} from "@mui/icons-material";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import { toast } from "react-hot-toast";
import {
  CreateExamDocument,
  EnterMarksDocument,
  GetEnrollmentsByBatchDocument,
  GetExamsByBatchDocument,
  GetResultsByExamDocument,
  GetStudentsDocument,
  GetSubjectsDocument,
  PublishResultsDocument,
  type GetExamsByBatchQuery,
  type GetStudentsQuery,
} from "@/graphql/generated";
import { SummaryCard } from "@/components/ui";
import { getErrorMessage } from "@/lib/errors";
import { primaryGradient } from "@/theme/theme";
import { useMyBatches } from "./teacher-shared";

type ExamRecord = GetExamsByBatchQuery["getExamsByBatch"][number];
type StudentRecord = NonNullable<GetStudentsQuery["getStudents"][number]>;

type MarkRow = {
  studentId: string;
  studentName: string;
  marksObtained: string;
  grade: string;
  remarks: string;
};

// Standard BD-style letter grade from a percentage; below pass mark is F.
function gradeFor(marks: number, total: number, pass: number): string {
  if (total <= 0) return "";
  if (marks < pass) return "F";
  const pct = (marks / total) * 100;
  if (pct >= 80) return "A+";
  if (pct >= 70) return "A";
  if (pct >= 60) return "A-";
  if (pct >= 50) return "B";
  if (pct >= 40) return "C";
  return "D";
}

const studentName = (s: StudentRecord) =>
  `${s.firstName} ${s.lastName ?? ""}`.trim();

export function TeacherExamsWorkspace() {
  const { myBatches, loading: batchesLoading } = useMyBatches();
  const [selectedBatchId, setSelectedBatchId] = useState("");

  // Fall back to the first batch until the teacher picks one.
  const batchId = selectedBatchId || myBatches[0]?.id || "";

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: subjectsData } = useQuery(GetSubjectsDocument);
  const { data: studentsData } = useQuery(GetStudentsDocument);
  const {
    data: examsData,
    loading: examsLoading,
    refetch: refetchExams,
  } = useQuery(GetExamsByBatchDocument, {
    skip: !batchId,
    variables: { batchId },
    fetchPolicy: "cache-and-network",
  });
  const { data: enrollmentsData } = useQuery(GetEnrollmentsByBatchDocument, {
    skip: !batchId,
    variables: { batchId },
  });

  const [createExam, { loading: creating }] = useMutation(CreateExamDocument);
  const [enterMarks] = useMutation(EnterMarksDocument);
  const [publishResults] = useMutation(PublishResultsDocument);

  // ── Derived ──────────────────────────────────────────────────────────────
  const subjects = useMemo(
    () => subjectsData?.getSubjects ?? [],
    [subjectsData],
  );
  const subjectName = useMemo(
    () => new Map(subjects.map((s) => [s.id, s.name])),
    [subjects],
  );
  const studentNameMap = useMemo(
    () =>
      new Map(
        (studentsData?.getStudents ?? [])
          .filter((s): s is StudentRecord => !!s)
          .map((s) => [s.id, studentName(s)]),
      ),
    [studentsData],
  );
  const exams = [...(examsData?.getExamsByBatch ?? [])].sort((a, b) =>
    (b.examDate ?? "").localeCompare(a.examDate ?? ""),
  );
  const enrollments = (enrollmentsData?.getEnrollmentsByBatch ?? []).filter(
    (e) => /active|enrolled/i.test(e.status),
  );
  const published = exams.filter((e) => e.published).length;

  // ── Create exam dialog ─────────────────────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [examDate, setExamDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [totalMarks, setTotalMarks] = useState("100");
  const [passMark, setPassMark] = useState("40");

  const resetCreate = () => {
    setTitle("");
    setSubjectId("");
    setExamDate(dayjs().format("YYYY-MM-DD"));
    setTotalMarks("100");
    setPassMark("40");
  };

  const handleCreate = async () => {
    if (!batchId || !title.trim()) {
      toast.error("Enter an exam title.");
      return;
    }
    try {
      const res = await createExam({
        variables: {
          exam: {
            batchId,
            title: title.trim(),
            totalMarks: parseInt(totalMarks, 10) || 0,
            passMark: parseInt(passMark, 10) || 0,
            subjectId: subjectId || undefined,
            examDate: examDate || undefined,
          },
        },
      });
      if (res.error) throw res.error;
      toast.success("Exam created.");
      await refetchExams();
      setCreateOpen(false);
      resetCreate();
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to create exam."));
    }
  };

  // ── Enter marks dialog ─────────────────────────────────────────────────────
  const [marksExam, setMarksExam] = useState<ExamRecord | null>(null);
  const [rows, setRows] = useState<MarkRow[]>([]);
  const [savingMarks, setSavingMarks] = useState(false);

  const [loadResults] = useLazyQuery(GetResultsByExamDocument, {
    fetchPolicy: "network-only",
  });

  // Seed the marks grid from active enrollments + any existing results.
  const openMarks = async (exam: ExamRecord) => {
    setMarksExam(exam);
    setRows(
      enrollments.map((e) => ({
        studentId: e.studentId,
        studentName: studentNameMap.get(e.studentId) ?? e.studentId,
        marksObtained: "",
        grade: "",
        remarks: "",
      })),
    );
    const { data } = await loadResults({ variables: { examId: exam.id } });
    const existing = new Map(
      (data?.getResultsByExam ?? []).map((r) => [r.studentId, r]),
    );
    if (existing.size === 0) return;
    setRows((prev) =>
      prev.map((r) => {
        const found = existing.get(r.studentId);
        return found
          ? {
              ...r,
              marksObtained: String(found.marksObtained),
              grade: found.grade ?? "",
              remarks: found.remarks ?? "",
            }
          : r;
      }),
    );
  };

  const updateRow = (id: string, field: keyof MarkRow, value: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.studentId !== id) return r;
        const next = { ...r, [field]: value };
        if (field === "marksObtained" && marksExam && value !== "") {
          const m = parseFloat(value);
          if (!Number.isNaN(m))
            next.grade = gradeFor(m, marksExam.totalMarks, marksExam.passMark);
        }
        return next;
      }),
    );
  };

  const handleSaveMarks = async () => {
    if (!marksExam) return;
    const input = rows
      .filter((r) => r.marksObtained !== "")
      .map((r) => ({
        examId: marksExam.id,
        studentId: r.studentId,
        marksObtained: parseFloat(r.marksObtained),
        grade: r.grade.trim() || undefined,
        remarks: r.remarks.trim() || undefined,
      }));
    if (input.length === 0) {
      toast.error("Enter at least one student's marks.");
      return;
    }
    setSavingMarks(true);
    try {
      const res = await enterMarks({ variables: { marks: input } });
      if (res.error) throw res.error;
      toast.success("Marks saved.");
      setMarksExam(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to save marks."));
    } finally {
      setSavingMarks(false);
    }
  };

  const handlePublish = async (examId: string) => {
    try {
      const res = await publishResults({ variables: { examId } });
      if (res.error) throw res.error;
      toast.success("Results published.");
      await refetchExams();
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to publish results."));
    }
  };

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
        <Stack
          direction={{ xs: "column", lg: "row" }}
          justifyContent="space-between"
          spacing={3}
        >
          <Box>
            <Typography variant="h4" component="h1">
              Exams &amp; Results
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              Create exams for your batches, enter marks, and publish results.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={() => setCreateOpen(true)}
            disabled={!batchId}
            sx={{ alignSelf: "flex-start", backgroundImage: primaryGradient }}
          >
            Create exam
          </Button>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}
      >
        <FormControl size="small" sx={{ minWidth: 280 }}>
          <InputLabel>Batch</InputLabel>
          <Select
            label="Batch"
            value={batchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            disabled={batchesLoading}
          >
            {myBatches.length === 0 ? (
              <MenuItem disabled value="">
                No batches assigned
              </MenuItem>
            ) : (
              myBatches.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
      </Paper>

      {batchId ? (
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
          }}
        >
          <SummaryCard
            caption="Total exams"
            title={String(exams.length)}
            icon={<AssessmentRounded />}
          />
          <SummaryCard
            caption="Published"
            title={String(published)}
            tone="success"
            icon={<PublishRounded />}
          />
        </Box>
      ) : null}

      {!batchId ? null : examsLoading && exams.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Loading exams…
        </Typography>
      ) : exams.length === 0 ? (
        <Box
          sx={{
            py: 8,
            textAlign: "center",
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <AssessmentRounded
            sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }}
          />
          <Typography variant="h6" color="text.secondary">
            No exams yet
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
            Create an exam to start recording results for this batch.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {exams.map((exam) => (
            <Paper
              key={exam.id}
              elevation={0}
              sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}
            >
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
                      label={exam.published ? "Published" : "Draft"}
                      size="small"
                      color={exam.published ? "success" : "default"}
                      variant={exam.published ? "filled" : "outlined"}
                    />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {exam.subjectId
                      ? `${subjectName.get(exam.subjectId) ?? "Subject"} · `
                      : ""}
                    {exam.examDate
                      ? `${dayjs(exam.examDate).format("DD MMM YYYY")} · `
                      : ""}
                    {exam.totalMarks} marks · pass {exam.passMark}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditNoteRounded />}
                    onClick={() => openMarks(exam)}
                  >
                    Enter marks
                  </Button>
                  {!exam.published ? (
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<PublishRounded />}
                      onClick={() => handlePublish(exam.id)}
                    >
                      Publish
                    </Button>
                  ) : null}
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Create exam dialog */}
      <Dialog
        open={createOpen}
        onClose={() => !creating && setCreateOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create exam</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            <TextField
              label="Exam title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              size="small"
              fullWidth
              autoFocus
            />
            <FormControl size="small" fullWidth>
              <InputLabel>Subject (optional)</InputLabel>
              <Select
                label="Subject (optional)"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {subjects.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Exam date"
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "1fr 1fr" }}>
              <TextField
                label="Total marks"
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                size="small"
              />
              <TextField
                label="Pass mark"
                type="number"
                value={passMark}
                onChange={(e) => setPassMark(e.target.value)}
                size="small"
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            color="inherit"
            onClick={() => setCreateOpen(false)}
            disabled={creating}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={creating}
            startIcon={
              creating ? <CircularProgress size={14} color="inherit" /> : undefined
            }
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enter marks dialog */}
      <Dialog
        open={!!marksExam}
        onClose={() => !savingMarks && setMarksExam(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Enter marks — {marksExam?.title}
          <Typography variant="caption" color="text.secondary" display="block">
            Total {marksExam?.totalMarks} · pass {marksExam?.passMark}. Grade is
            auto-filled and editable.
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {rows.length === 0 ? (
            <Alert severity="info">
              No active enrollments found for this batch.
            </Alert>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell width={120}>Marks</TableCell>
                  <TableCell width={90}>Grade</TableCell>
                  <TableCell>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.studentId}>
                    <TableCell>{r.studentName}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={r.marksObtained}
                        onChange={(e) =>
                          updateRow(r.studentId, "marksObtained", e.target.value)
                        }
                        slotProps={{
                          htmlInput: { min: 0, max: marksExam?.totalMarks },
                        }}
                        sx={{ width: 100 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={r.grade || "—"}
                        size="small"
                        variant="outlined"
                        sx={{
                          bgcolor:
                            r.grade === "F"
                              ? alpha("#ef4444", 0.1)
                              : r.grade
                                ? alpha("#10b981", 0.1)
                                : "transparent",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={r.remarks}
                        onChange={(e) =>
                          updateRow(r.studentId, "remarks", e.target.value)
                        }
                        fullWidth
                        placeholder="Optional"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            color="inherit"
            onClick={() => setMarksExam(null)}
            disabled={savingMarks}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveMarks}
            disabled={savingMarks || rows.length === 0}
            startIcon={
              savingMarks ? (
                <CircularProgress size={14} color="inherit" />
              ) : undefined
            }
          >
            Save marks
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
