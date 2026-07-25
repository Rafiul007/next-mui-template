"use client";

import { useState } from "react";
import {
  AssignmentTurnedInRounded,
  CalendarMonthRounded,
  CancelRounded,
  CheckCircleRounded,
  EditNoteRounded,
  GradingRounded,
  PublishRounded,
  QuizRounded,
  SendRounded,
} from "@mui/icons-material";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "react-hot-toast";
import {
  ApproveExamDocument,
  CreateDraftExamDocument,
  EnterMarksDocument,
  GetAllBatchesDocument,
  GetEnrollmentsByBatchDocument,
  GetExamsByBatchDocument,
  GetResultsByExamDocument,
  GetStudentsDocument,
  GetSubjectsDocument,
  MeDocument,
  PublishResultsDocument,
  RejectExamDocument,
  SubmitExamForApprovalDocument,
  type GetExamsByBatchQuery,
  type GetResultsByExamQuery,
  type GetStudentsQuery,
} from "@/graphql/generated";
import { SearchSelect } from "@/components/form";
import { SummaryCard } from "@/components/ui";
import { hasPermission } from "@/lib/auth/roles";
import { getErrorMessage } from "@/lib/errors";
import { primaryGradient } from "@/theme/theme";
import { QuestionBankPanel } from "./QuestionBankPanel";
import { ExamQuestionsDialog } from "./ExamQuestionsDialog";
import { ScheduleAssignDialog } from "./ScheduleAssignDialog";

type ExamRecord = GetExamsByBatchQuery["getExamsByBatch"][number];
type ResultRecord = GetResultsByExamQuery["getResultsByExam"][number];
type StudentRecord = NonNullable<GetStudentsQuery["getStudents"][number]>;

type BatchOption = { id: string; name: string; classLevel?: string | null; courseName?: string | null };

const STATUS_COLORS: Record<string, "default" | "warning" | "success" | "error" | "info"> = {
  DRAFT: "default",
  PENDING_APPROVAL: "warning",
  APPROVED: "info",
  REJECTED: "error",
  SCHEDULED: "success",
  COMPLETED: "success",
  CANCELLED: "error",
};

const studentName = (s: StudentRecord) => `${s.firstName} ${s.lastName ?? ""}`.trim();

type ExamWorkspaceProps = {
  // Admin console sees every batch; the teacher portal scopes to the signed-in
  // teacher's own batches (passed in, since scoping differs by portal).
  batches?: BatchOption[];
  batchesLoading?: boolean;
};

export function ExamWorkspace({ batches: batchesProp, batchesLoading: batchesLoadingProp }: ExamWorkspaceProps) {
  const { data: meData } = useQuery(MeDocument);
  const permissions = meData?.me?.permissions ?? [];
  const canManageExams = hasPermission(permissions, "EXAM_MANAGE");
  const canApprove = hasPermission(permissions, "EXAM_APPROVE");
  const canManageBank = hasPermission(permissions, "QUESTION_BANK_MANAGE");
  const canEnterMarks = hasPermission(permissions, "MARKS_ENTRY");
  const canPublish = hasPermission(permissions, "RESULT_PUBLISH");

  const [tab, setTab] = useState<"exams" | "bank">("exams");

  const { data: allBatchesData, loading: allBatchesLoading } = useQuery(GetAllBatchesDocument, {
    skip: !!batchesProp,
  });
  const batches = batchesProp ?? allBatchesData?.getAllBatches ?? [];
  const batchesLoading = batchesProp ? (batchesLoadingProp ?? false) : allBatchesLoading;

  const [selectedBatchId, setSelectedBatchId] = useState("");
  const batchId = selectedBatchId || batches[0]?.id || "";

  const { data: subjectsData } = useQuery(GetSubjectsDocument);
  const { data: studentsData } = useQuery(GetStudentsDocument);
  const {
    data: examsData,
    loading: examsLoading,
    refetch: refetchExams,
  } = useQuery(GetExamsByBatchDocument, {
    variables: { batchId },
    skip: !batchId,
    fetchPolicy: "cache-and-network",
  });
  const { data: enrollmentsData, loading: enrollmentsLoading } = useQuery(GetEnrollmentsByBatchDocument, {
    variables: { batchId },
    skip: !batchId,
  });

  const subjects = subjectsData?.getSubjects ?? [];
  const subjectName = new Map(subjects.map((s) => [s.id, s.name]));
  const studentNameMap = new Map(
    (studentsData?.getStudents ?? [])
      .filter((s): s is StudentRecord => !!s)
      .map((s) => [s.id, studentName(s)]),
  );
  const exams = [...(examsData?.getExamsByBatch ?? [])].sort((a, b) =>
    (b.examDate ?? "").localeCompare(a.examDate ?? ""),
  );
  const enrollments = (enrollmentsData?.getEnrollmentsByBatch ?? []).filter((e) =>
    /active|enrolled/i.test(e.status),
  );

  // ── Create draft ────────────────────────────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [examDate, setExamDate] = useState("");
  const [passMark, setPassMark] = useState("40");
  const [instructions, setInstructions] = useState("");
  const [createDraftExam, { loading: creating }] = useMutation(CreateDraftExamDocument);

  const resetCreate = () => {
    setTitle("");
    setSubjectId("");
    setExamDate("");
    setPassMark("40");
    setInstructions("");
  };

  const handleCreateDraft = async () => {
    if (!batchId || !title.trim()) {
      toast.error("Enter an exam title.");
      return;
    }
    setCreateError(null);
    try {
      await createDraftExam({
        variables: {
          exam: {
            batchId,
            title: title.trim(),
            subjectId: subjectId || undefined,
            examDate: examDate || undefined,
            instructions: instructions.trim() || undefined,
            passMark: parseInt(passMark, 10) || 0,
          },
        },
      });
      toast.success("Draft exam created.");
      await refetchExams();
      setCreateOpen(false);
      resetCreate();
    } catch (err) {
      setCreateError(getErrorMessage(err, "Unable to create draft exam."));
    }
  };

  // ── Approve / reject ────────────────────────────────────────────────────────
  const [approveExam] = useMutation(ApproveExamDocument);
  const [rejectExam] = useMutation(RejectExamDocument);
  const [submitForApproval] = useMutation(SubmitExamForApprovalDocument);
  const [rejectTarget, setRejectTarget] = useState<ExamRecord | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = async (examId: string) => {
    try {
      await approveExam({ variables: { examId } });
      toast.success("Exam approved.");
      await refetchExams();
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to approve exam."));
    }
  };

  const handleReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) return;
    try {
      await rejectExam({ variables: { examId: rejectTarget.id, reason: rejectReason.trim() } });
      toast.success("Exam rejected.");
      setRejectTarget(null);
      setRejectReason("");
      await refetchExams();
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to reject exam."));
    }
  };

  const handleSubmitForApproval = async (examId: string) => {
    try {
      await submitForApproval({ variables: { examId } });
      toast.success("Submitted for approval.");
      await refetchExams();
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to submit for approval."));
    }
  };

  // ── Questions / schedule dialogs ───────────────────────────────────────────
  const [questionsExam, setQuestionsExam] = useState<ExamRecord | null>(null);
  const [scheduleExam, setScheduleExam] = useState<ExamRecord | null>(null);

  // ── Enter marks ─────────────────────────────────────────────────────────────
  type MarkRow = {
    studentId: string;
    studentName: string;
    marksObtained: string;
    grade: string;
    remarks: string;
  };
  const [marksExam, setMarksExam] = useState<ExamRecord | null>(null);
  const [markRows, setMarkRows] = useState<MarkRow[]>([]);
  const [savingMarks, setSavingMarks] = useState(false);
  const [enterMarks] = useMutation(EnterMarksDocument);

  const { data: resultsForMarksData } = useQuery(GetResultsByExamDocument, {
    variables: { examId: marksExam?.id ?? "" },
    skip: !marksExam,
    fetchPolicy: "network-only",
  });

  const openMarks = (exam: ExamRecord) => {
    setMarksExam(exam);
    const existing = new Map(
      (resultsForMarksData?.getResultsByExam ?? []).map((r) => [r.studentId, r]),
    );
    setMarkRows(
      enrollments.map((e) => {
        const found = existing.get(e.studentId);
        return {
          studentId: e.studentId,
          studentName: studentNameMap.get(e.studentId) ?? e.studentId,
          marksObtained: found ? String(found.marksObtained) : "",
          grade: found?.grade ?? "",
          remarks: found?.remarks ?? "",
        };
      }),
    );
  };

  const updateMarkRow = (studentId: string, field: keyof MarkRow, value: string) =>
    setMarkRows((prev) => prev.map((r) => (r.studentId === studentId ? { ...r, [field]: value } : r)));

  const handleSaveMarks = async () => {
    if (!marksExam) return;
    const input = markRows
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
      await enterMarks({ variables: { marks: input } });
      toast.success("Marks saved.");
      setMarksExam(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to save marks."));
    } finally {
      setSavingMarks(false);
    }
  };

  // ── Results / publish ───────────────────────────────────────────────────────
  const [resultsExam, setResultsExam] = useState<ExamRecord | null>(null);
  const { data: resultsData } = useQuery(GetResultsByExamDocument, {
    variables: { examId: resultsExam?.id ?? "" },
    skip: !resultsExam,
  });
  const [publishResults] = useMutation(PublishResultsDocument);
  const results: ResultRecord[] = resultsData?.getResultsByExam ?? [];

  const handlePublish = async (examId: string) => {
    try {
      await publishResults({ variables: { examId } });
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
          background: "linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(240,249,255,0.98) 100%)",
        }}
      >
        <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" spacing={3}>
          <Box sx={{ maxWidth: 760 }}>
            <Typography variant="h4" component="h1">
              Exams &amp; Results
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              Build a question bank, draft exams, route them through approval, schedule and
              assign students, then enter and publish results.
            </Typography>
          </Box>
          {canManageExams && tab === "exams" ? (
            <Button
              variant="contained"
              startIcon={<QuizRounded />}
              onClick={() => {
                setCreateError(null);
                setCreateOpen(true);
              }}
              disabled={!batchId}
              sx={{ backgroundColor: primaryGradient, alignSelf: "flex-start" }}
            >
              New draft exam
            </Button>
          ) : null}
        </Stack>
      </Paper>

      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab value="exams" label="Exams" />
        <Tab value="bank" label="Question Bank" />
      </Tabs>

      {tab === "bank" ? (
        <QuestionBankPanel canManage={canManageBank} />
      ) : (
        <>
          <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
              <Typography variant="subtitle2" sx={{ minWidth: 80, flexShrink: 0 }}>
                Batch
              </Typography>
              <SearchSelect
                label="Batch"
                placeholder="Search by name, class, or course…"
                options={batches.map((b) => ({
                  value: b.id,
                  label: b.name,
                  description: [b.classLevel, b.courseName].filter(Boolean).join(" · "),
                }))}
                value={batchId}
                onChange={setSelectedBatchId}
                sx={{ minWidth: 300 }}
              />
            </Stack>
          </Paper>

          {!batchId ? (
            <Alert severity="info">
              {batchesLoading ? "Loading batches…" : "Select a batch above to view its exams."}
            </Alert>
          ) : (
            <>
              <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" } }}>
                <SummaryCard caption="Total exams" title={String(exams.length)} icon={<QuizRounded />} />
                <SummaryCard
                  caption="Pending approval"
                  title={String(exams.filter((e) => e.status === "PENDING_APPROVAL").length)}
                  icon={<SendRounded />}
                  tone="warning"
                />
                <SummaryCard
                  caption="Scheduled"
                  title={String(exams.filter((e) => e.status === "SCHEDULED").length)}
                  icon={<CalendarMonthRounded />}
                  tone="success"
                />
              </Box>

              {examsLoading && exams.length === 0 ? (
                <Typography color="text.secondary">Loading exams…</Typography>
              ) : exams.length === 0 ? (
                <Box sx={{ py: 8, textAlign: "center", border: "1px dashed", borderColor: "divider", borderRadius: 2 }}>
                  <QuizRounded sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }} />
                  <Typography variant="h6" color="text.secondary">
                    No exams yet
                  </Typography>
                  <Typography variant="body2" color="text.disabled">
                    {canManageExams
                      ? "Create a draft exam to get started."
                      : "No exams have been created for this batch yet."}
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {exams.map((exam) => (
                    <Paper key={exam.id} elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
                      <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={2}
                        alignItems={{ md: "flex-start" }}
                        justifyContent="space-between"
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Typography variant="subtitle1" fontWeight={700}>
                              {exam.title}
                            </Typography>
                            <Chip
                              label={exam.status.replace("_", " ")}
                              size="small"
                              color={STATUS_COLORS[exam.status] ?? "default"}
                            />
                            {exam.published ? (
                              <Chip label="Results published" size="small" variant="outlined" color="success" />
                            ) : null}
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            {exam.subjectId ? `${subjectName.get(exam.subjectId) ?? "Subject"} · ` : ""}
                            {exam.examDate ? `${exam.examDate} · ` : ""}
                            {exam.totalMarks} marks · pass {exam.passMark}
                            {exam.startAt ? ` · starts ${new Date(exam.startAt).toLocaleString()}` : ""}
                          </Typography>
                          {exam.status === "REJECTED" && exam.rejectionReason ? (
                            <Alert severity="error" sx={{ mt: 1 }}>
                              {exam.rejectionReason}
                            </Alert>
                          ) : null}
                        </Box>

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {canManageExams && exam.status === "DRAFT" ? (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<EditNoteRounded />}
                              onClick={() => setQuestionsExam(exam)}
                            >
                              Questions ({exam.examQuestions.length})
                            </Button>
                          ) : null}
                          {canManageExams && exam.status === "DRAFT" && exam.examQuestions.length > 0 ? (
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<SendRounded />}
                              onClick={() => handleSubmitForApproval(exam.id)}
                            >
                              Submit for approval
                            </Button>
                          ) : null}
                          {canApprove && exam.status === "PENDING_APPROVAL" ? (
                            <>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => setQuestionsExam(exam)}
                              >
                                Review ({exam.examQuestions.length})
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircleRounded />}
                                onClick={() => handleApprove(exam.id)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<CancelRounded />}
                                onClick={() => setRejectTarget(exam)}
                              >
                                Reject
                              </Button>
                            </>
                          ) : null}
                          {canManageExams && (exam.status === "APPROVED" || exam.status === "SCHEDULED") ? (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<CalendarMonthRounded />}
                              onClick={() => setScheduleExam(exam)}
                            >
                              {exam.status === "SCHEDULED" ? "Manage schedule" : "Schedule"}
                            </Button>
                          ) : null}
                          {canEnterMarks && (exam.status === "SCHEDULED" || exam.status === "COMPLETED") ? (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<GradingRounded />}
                              // openMarks snapshots `enrollments` into dialog state once, at click
                              // time — clicking before the batch's enrollments have loaded would
                              // permanently lock the dialog onto an empty roster.
                              disabled={enrollmentsLoading}
                              onClick={() => openMarks(exam)}
                            >
                              Enter marks
                            </Button>
                          ) : null}
                          {(canEnterMarks || canPublish) &&
                          (exam.status === "SCHEDULED" || exam.status === "COMPLETED") ? (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<AssignmentTurnedInRounded />}
                              onClick={() => setResultsExam(exam)}
                            >
                              Results
                            </Button>
                          ) : null}
                          {canPublish &&
                          !exam.published &&
                          (exam.status === "SCHEDULED" || exam.status === "COMPLETED") ? (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
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
            </>
          )}
        </>
      )}

      {/* Create draft dialog */}
      <Dialog open={createOpen} onClose={() => !creating && setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New draft exam</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            {createError ? <Alert severity="error">{createError}</Alert> : null}
            <TextField
              label="Exam title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              size="small"
              fullWidth
              autoFocus
            />
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "1fr 1fr" }}>
              <SearchSelect
                label="Subject (optional)"
                placeholder="Search subjects…"
                options={subjects.map((s) => ({ value: s.id, label: s.name }))}
                value={subjectId}
                onChange={setSubjectId}
              />
              <TextField
                label="Exam date (optional)"
                type="date"
                size="small"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>
            <TextField
              label="Pass mark"
              type="number"
              size="small"
              value={passMark}
              onChange={(e) => setPassMark(e.target.value)}
              slotProps={{ htmlInput: { min: 0 } }}
              InputProps={{ endAdornment: <InputAdornment position="end">marks</InputAdornment> }}
            />
            <TextField
              label="Instructions (optional)"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              multiline
              minRows={2}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={() => setCreateOpen(false)} disabled={creating}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreateDraft} disabled={creating}>
            Create draft
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={!!rejectTarget} onClose={() => setRejectTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle>Reject — {rejectTarget?.title}</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            multiline
            minRows={3}
            fullWidth
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={() => setRejectTarget(null)}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleReject} disabled={!rejectReason.trim()}>
            Reject exam
          </Button>
        </DialogActions>
      </Dialog>

      <ExamQuestionsDialog
        open={!!questionsExam}
        exam={questionsExam ? exams.find((e) => e.id === questionsExam.id) ?? questionsExam : null}
        onClose={() => setQuestionsExam(null)}
        onChanged={refetchExams}
      />

      <ScheduleAssignDialog
        open={!!scheduleExam}
        exam={scheduleExam ? exams.find((e) => e.id === scheduleExam.id) ?? scheduleExam : null}
        onClose={() => setScheduleExam(null)}
        onChanged={refetchExams}
      />

      {/* Enter marks dialog */}
      <Dialog open={!!marksExam} onClose={() => !savingMarks && setMarksExam(null)} fullWidth maxWidth="md">
        <DialogTitle>
          Enter marks — {marksExam?.title}
          <Typography variant="caption" color="text.secondary" display="block">
            Total {marksExam?.totalMarks} · pass {marksExam?.passMark}
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {markRows.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">No active enrollments found for this batch.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: 140 }}>Marks</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: 100 }}>Grade</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {markRows.map((row) => (
                    <TableRow key={row.studentId}>
                      <TableCell>{row.studentName}</TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={row.marksObtained}
                          onChange={(e) => updateMarkRow(row.studentId, "marksObtained", e.target.value)}
                          slotProps={{ htmlInput: { min: 0, max: marksExam?.totalMarks } }}
                          sx={{ width: 100 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={row.grade}
                          onChange={(e) => updateMarkRow(row.studentId, "grade", e.target.value)}
                          sx={{ width: 80 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          value={row.remarks}
                          onChange={(e) => updateMarkRow(row.studentId, "remarks", e.target.value)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={() => setMarksExam(null)} disabled={savingMarks}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveMarks}
            disabled={savingMarks || markRows.length === 0}
            startIcon={<GradingRounded />}
          >
            Save marks
          </Button>
        </DialogActions>
      </Dialog>

      {/* Results dialog */}
      <Dialog open={!!resultsExam} onClose={() => setResultsExam(null)} fullWidth maxWidth="md">
        <DialogTitle>
          Results — {resultsExam?.title}
          <Typography variant="body2" color="text.secondary" component="div">
            {results.length} student{results.length !== 1 ? "s" : ""} graded ·{" "}
            {resultsExam?.published ? "Published" : "Not published"}
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {results.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">No results entered yet.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Marks</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Grade</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{studentNameMap.get(r.studentId) ?? r.studentId}</TableCell>
                      <TableCell>
                        {r.marksObtained}/{resultsExam?.totalMarks}
                      </TableCell>
                      <TableCell>{r.grade ?? "—"}</TableCell>
                      <TableCell>{r.remarks ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          {canPublish && resultsExam && !resultsExam.published ? (
            <Button
              variant="contained"
              color="success"
              startIcon={<PublishRounded />}
              onClick={() => resultsExam && handlePublish(resultsExam.id)}
            >
              Publish
            </Button>
          ) : null}
          <Button onClick={() => setResultsExam(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
