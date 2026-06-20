"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  AssignmentRounded,
  CheckCircleRounded,
  EditNoteRounded,
  GradingRounded,
  PublishRounded,
  QuizRounded,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { toast } from "react-hot-toast";
import {
  RhfSelect,
  RhfTextField,
  SearchSelect,
  type RhfSelectOption,
} from "@/components/form";
import { batchSearchOptions } from "@/lib/search-options";
import { SummaryCard } from "@/components/ui";
import {
  CreateExamDocument,
  EnterMarksDocument,
  GetAllBatchesDocument,
  GetEnrollmentsByBatchDocument,
  GetExamsByBatchDocument,
  GetResultsByExamDocument,
  GetStudentsDocument,
  GetSubjectsDocument,
  PublishResultsDocument,
  type GetExamsByBatchQuery,
  type GetResultsByExamQuery,
} from "@/graphql/generated";
import { getErrorMessage } from "@/lib/errors";
import { primaryGradient } from "@/theme/theme";

type ExamRecord = GetExamsByBatchQuery["getExamsByBatch"][number];
type ResultRecord = GetResultsByExamQuery["getResultsByExam"][number];

// ── Create Exam Form ─────────────────────────────────────────────────────────

const createExamSchema = yup
  .object({
    title: yup.string().trim().required("Title is required"),
    subjectId: yup.string().default(""),
    examDate: yup.string().default(""),
    totalMarks: yup
      .number()
      .typeError("Required")
      .min(1, "Must be at least 1")
      .required("Total marks required"),
    passMark: yup
      .number()
      .typeError("Required")
      .min(0, "Must be ≥ 0")
      .required("Pass mark required"),
  })
  .required();

type CreateExamFormValues = yup.InferType<typeof createExamSchema>;

type CreateExamDialogProps = {
  open: boolean;
  isSubmitting: boolean;
  subjectOptions: RhfSelectOption[];
  errorMessage: string | null;
  onClose: () => void;
  onSubmit: (values: CreateExamFormValues) => Promise<void>;
};

function CreateExamDialog({
  open,
  isSubmitting,
  subjectOptions,
  errorMessage,
  onClose,
  onSubmit,
}: CreateExamDialogProps) {
  const { control, handleSubmit, reset } = useForm<CreateExamFormValues>({
    resolver: yupResolver(createExamSchema),
    defaultValues: {
      title: "",
      subjectId: "",
      examDate: "",
      totalMarks: 100,
      passMark: 40,
    },
    mode: "onTouched",
  });

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : handleClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Create Exam</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            {errorMessage ? (
              <Alert severity="error">{errorMessage}</Alert>
            ) : null}
            <RhfTextField
              control={control}
              name="title"
              label="Exam title"
              placeholder="e.g. Mid-term Exam"
              trim
              fullWidth
            />
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              }}
            >
              <RhfSelect
                control={control}
                name="subjectId"
                label="Subject (optional)"
                options={subjectOptions}
                fullWidth
              />
              <RhfTextField
                control={control}
                name="examDate"
                label="Exam date (optional)"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <RhfTextField
                control={control}
                name="totalMarks"
                label="Total marks"
                type="number"
                fullWidth
                inputProps={{ min: 1 }}
              />
              <RhfTextField
                control={control}
                name="passMark"
                label="Pass mark"
                type="number"
                fullWidth
                inputProps={{ min: 0 }}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={isSubmitting} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Create Exam
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

// ── Enter Marks Dialog ────────────────────────────────────────────────────────

type StudentMark = {
  studentId: string;
  studentName: string;
  marksObtained: string;
  grade: string;
  remarks: string;
};

type EnterMarksDialogProps = {
  open: boolean;
  exam: ExamRecord | null;
  studentMarks: StudentMark[];
  isSubmitting: boolean;
  onClose: () => void;
  onMarkChange: (studentId: string, field: keyof StudentMark, value: string) => void;
  onSubmit: () => Promise<void>;
};

function EnterMarksDialog({
  open,
  exam,
  studentMarks,
  isSubmitting,
  onClose,
  onMarkChange,
  onSubmit,
}: EnterMarksDialogProps) {
  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Enter Marks — {exam?.title ?? ""}
        <Typography variant="body2" color="text.secondary" component="div">
          Total: {exam?.totalMarks} marks · Pass: {exam?.passMark} marks
        </Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        {studentMarks.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">
              No enrolled students found for this batch.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 140 }}>Marks</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 120 }}>Grade</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {studentMarks.map((row) => (
                  <TableRow key={row.studentId}>
                    <TableCell>{row.studentName}</TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={row.marksObtained}
                        onChange={(e) =>
                          onMarkChange(row.studentId, "marksObtained", e.target.value)
                        }
                        inputProps={{ min: 0, max: exam?.totalMarks }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              /{exam?.totalMarks}
                            </InputAdornment>
                          ),
                        }}
                        sx={{ width: 130 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={row.grade}
                        placeholder="A, B, C…"
                        onChange={(e) =>
                          onMarkChange(row.studentId, "grade", e.target.value)
                        }
                        sx={{ width: 100 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
                        value={row.remarks}
                        placeholder="Optional"
                        onChange={(e) =>
                          onMarkChange(row.studentId, "remarks", e.target.value)
                        }
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
        <Button onClick={onClose} disabled={isSubmitting} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={isSubmitting || studentMarks.length === 0}
          startIcon={<GradingRounded />}
        >
          Save Marks
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Results Dialog ────────────────────────────────────────────────────────────

type ResultsDialogProps = {
  open: boolean;
  exam: ExamRecord | null;
  results: ResultRecord[];
  studentNameMap: Map<string, string>;
  onClose: () => void;
};

function ResultsDialog({
  open,
  exam,
  results,
  studentNameMap,
  onClose,
}: ResultsDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Results — {exam?.title ?? ""}
        <Typography variant="body2" color="text.secondary" component="div">
          {results.length} student{results.length !== 1 ? "s" : ""} graded ·{" "}
          {exam?.published ? "Published" : "Not published"}
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
                  <TableCell sx={{ fontWeight: 700 }}>Published</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      {studentNameMap.get(r.studentId) ?? r.studentId}
                    </TableCell>
                    <TableCell>
                      {r.marksObtained}/{exam?.totalMarks}
                    </TableCell>
                    <TableCell>{r.grade ?? "—"}</TableCell>
                    <TableCell>{r.remarks ?? "—"}</TableCell>
                    <TableCell>
                      {r.publishedAt ? (
                        <Chip
                          label="Published"
                          color="success"
                          size="small"
                          icon={<CheckCircleRounded />}
                        />
                      ) : (
                        <Chip label="Draft" size="small" variant="outlined" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Main Workspace ────────────────────────────────────────────────────────────

export function ExamsWorkspace() {
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [marksDialogExam, setMarksDialogExam] = useState<ExamRecord | null>(null);
  const [resultsDialogExam, setResultsDialogExam] = useState<ExamRecord | null>(null);
  const [studentMarks, setStudentMarks] = useState<StudentMark[]>([]);
  const [isEnteringMarks, setIsEnteringMarks] = useState(false);

  const { data: batchesData, loading: batchesLoading } =
    useQuery(GetAllBatchesDocument);

  const { data: subjectsData } = useQuery(GetSubjectsDocument);

  const {
    data: examsData,
    loading: examsLoading,
    refetch: refetchExams,
  } = useQuery(GetExamsByBatchDocument, {
    variables: { batchId: selectedBatchId },
    skip: !selectedBatchId,
  });

  const { data: enrollmentsData } = useQuery(GetEnrollmentsByBatchDocument, {
    variables: { batchId: selectedBatchId },
    skip: !selectedBatchId,
  });

  const { data: studentsData } = useQuery(GetStudentsDocument);

  const { data: resultsData } = useQuery(GetResultsByExamDocument, {
    variables: { examId: resultsDialogExam?.id ?? "" },
    skip: !resultsDialogExam,
  });

  const [createExam, createExamState] = useMutation(CreateExamDocument);
  const [enterMarks] = useMutation(EnterMarksDocument);
  const [publishResults] = useMutation(PublishResultsDocument);

  const batches = batchesData?.getAllBatches ?? [];
  const subjects = subjectsData?.getSubjects ?? [];
  const exams = examsData?.getExamsByBatch ?? [];
  const enrollments = enrollmentsData?.getEnrollmentsByBatch ?? [];
  const students = studentsData?.getStudents ?? [];
  const results = resultsData?.getResultsByExam ?? [];

  const subjectOptions: RhfSelectOption[] = [
    { label: "All subjects / General", value: "" },
    ...subjects.map((s) => ({ label: s.name, value: s.id })),
  ];

  const studentNameMap = new Map(
    students.map((s) => [
      s?.id ?? "",
      `${s?.firstName ?? ""} ${s?.lastName ?? ""}`.trim() || (s?.email ?? ""),
    ]),
  );

  const totalExams = exams.length;
  const publishedExams = exams.filter((e) => e.published).length;
  const enrolledCount = enrollments.filter((e) => e.status === "ACTIVE" || e.status === "active").length;

  const columns: MRT_ColumnDef<ExamRecord>[] = [
    {
      accessorKey: "title",
      header: "Exam",
      size: 240,
      Cell: ({ row }) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <QuizRounded sx={{ fontSize: 16, color: "text.secondary", flexShrink: 0 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {row.original.title}
          </Typography>
        </Stack>
      ),
    },
    {
      accessorKey: "examDate",
      header: "Date",
      size: 140,
      Cell: ({ cell }) => (
        <Typography variant="body2" color={!cell.getValue() ? "text.disabled" : undefined}>
          {cell.getValue<string | null>() ?? "—"}
        </Typography>
      ),
    },
    {
      id: "marks",
      header: "Marks",
      size: 140,
      Cell: ({ row }) => (
        <Typography variant="body2">
          {row.original.totalMarks} total · {row.original.passMark} pass
        </Typography>
      ),
    },
    {
      id: "subject",
      header: "Subject",
      size: 160,
      Cell: ({ row }) => {
        const subject = subjects.find((s) => s.id === row.original.subjectId);
        return (
          <Typography
            variant="body2"
            color={!subject ? "text.disabled" : undefined}
          >
            {subject?.name ?? "—"}
          </Typography>
        );
      },
    },
    {
      accessorKey: "published",
      header: "Status",
      size: 120,
      Cell: ({ cell }) =>
        cell.getValue<boolean>() ? (
          <Chip label="Published" color="success" size="small" />
        ) : (
          <Chip label="Draft" size="small" variant="outlined" />
        ),
    },
    {
      id: "actions",
      header: "Actions",
      size: 260,
      enableSorting: false,
      Cell: ({ row }) => {
        const exam = row.original;
        return (
          <Stack direction="row" spacing={0.75}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<EditNoteRounded />}
              onClick={() => openEnterMarks(exam)}
            >
              Marks
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AssignmentRounded />}
              onClick={() => setResultsDialogExam(exam)}
            >
              Results
            </Button>
            {!exam.published && (
              <Button
                size="small"
                variant="outlined"
                color="success"
                startIcon={<PublishRounded />}
                onClick={() => handlePublishResults(exam.id)}
              >
                Publish
              </Button>
            )}
          </Stack>
        );
      },
    },
  ];

  const openEnterMarks = (exam: ExamRecord) => {
    const activeEnrollments = enrollments.filter(
      (e) => e.status === "ACTIVE" || e.status === "active",
    );
    const marks: StudentMark[] = activeEnrollments.map((e) => ({
      studentId: e.studentId,
      studentName: studentNameMap.get(e.studentId) ?? e.studentId,
      marksObtained: "",
      grade: "",
      remarks: "",
    }));
    setStudentMarks(marks);
    setMarksDialogExam(exam);
  };

  const handleMarkChange = (
    studentId: string,
    field: keyof StudentMark,
    value: string,
  ) => {
    setStudentMarks((prev) =>
      prev.map((m) => (m.studentId === studentId ? { ...m, [field]: value } : m)),
    );
  };

  const handleSaveMarks = async () => {
    if (!marksDialogExam) return;
    setIsEnteringMarks(true);
    try {
      const marksInput = studentMarks
        .filter((m) => m.marksObtained !== "")
        .map((m) => ({
          examId: marksDialogExam.id,
          studentId: m.studentId,
          marksObtained: parseFloat(m.marksObtained),
          grade: m.grade.trim() || undefined,
          remarks: m.remarks.trim() || undefined,
        }));

      if (marksInput.length === 0) {
        toast.error("Enter at least one student's marks.");
        return;
      }

      await enterMarks({ variables: { marks: marksInput } });
      toast.success("Marks saved.");
      setMarksDialogExam(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to save marks."));
    } finally {
      setIsEnteringMarks(false);
    }
  };

  const handlePublishResults = async (examId: string) => {
    try {
      await publishResults({ variables: { examId } });
      toast.success("Results published.");
      await refetchExams();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to publish results."));
    }
  };

  const handleCreateExam = async (values: CreateExamFormValues) => {
    if (!selectedBatchId) return;
    setCreateError(null);
    try {
      await createExam({
        variables: {
          exam: {
            batchId: selectedBatchId,
            title: values.title,
            totalMarks: values.totalMarks,
            passMark: values.passMark,
            subjectId: values.subjectId?.trim() || undefined,
            examDate: values.examDate?.trim() || undefined,
          },
        },
      });
      toast.success("Exam created.");
      await refetchExams();
      setIsCreateOpen(false);
    } catch (error) {
      const message = getErrorMessage(error, "Unable to create exam.");
      setCreateError(message);
      toast.error(message);
    }
  };

  const isLoading = batchesLoading || (!!selectedBatchId && examsLoading);

  return (
    <>
      <Stack spacing={3}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            border: "1px solid",
            borderColor: "divider",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(240,249,255,0.98) 100%)",
          }}
        >
          <Stack
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            spacing={3}
          >
            <Box sx={{ maxWidth: 760 }}>
              <Typography variant="h4" component="h1" sx={{ mt: 0.5 }}>
                Exams & Results
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Create exams, enter student marks, and publish results for each
                batch.
              </Typography>
            </Box>
            <Box
              sx={{
                minWidth: { lg: 240 },
                display: "flex",
                alignItems: "flex-start",
                justifyContent: { xs: "stretch", lg: "flex-end" },
              }}
            >
              <Button
                variant="contained"
                startIcon={<QuizRounded />}
                onClick={() => {
                  setCreateError(null);
                  setIsCreateOpen(true);
                }}
                disabled={!selectedBatchId}
                fullWidth
                sx={{
                  maxWidth: { xs: "100%", lg: 220 },
                  backgroundImage: primaryGradient,
                }}
              >
                New Exam
              </Button>
            </Box>
          </Stack>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
          }}
        >
          <SummaryCard
            caption="Total Exams"
            title={String(totalExams)}
            icon={<QuizRounded />}
          />
          <SummaryCard
            caption="Published"
            title={String(publishedExams)}
            icon={<CheckCircleRounded />}
            tone="success"
          />
          <SummaryCard
            caption="Enrolled Students"
            title={String(enrolledCount)}
            icon={<GradingRounded />}
          />
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
            <Typography variant="subtitle2" sx={{ minWidth: 80, flexShrink: 0 }}>
              Select Batch
            </Typography>
            <SearchSelect
              label="Batch"
              placeholder="Search by name, class, or course…"
              options={batchSearchOptions(batches)}
              value={selectedBatchId}
              onChange={setSelectedBatchId}
              sx={{ minWidth: 300 }}
            />
          </Stack>
        </Paper>

        {!selectedBatchId ? (
          <Alert severity="info">
            Select a batch above to view and manage its exams.
          </Alert>
        ) : null}

        {selectedBatchId ? (
          <MaterialReactTable
            columns={columns}
            data={exams}
            enableColumnFilters={false}
            enableDensityToggle={false}
            enableFullScreenToggle={false}
            enableHiding={false}
            enableSorting
            getRowId={(row) => row.id}
            localization={{ noRecordsToDisplay: "No exams yet for this batch" }}
            muiSearchTextFieldProps={{
              placeholder: "Search exams",
              size: "small",
              sx: { minWidth: 240 },
            }}
            muiBottomToolbarProps={{
              sx: {
                borderTop: "1px solid",
                borderColor: alpha("#0f172a", 0.08),
                bgcolor: "#ffffff",
              },
            }}
            muiTableBodyRowProps={{
              sx: {
                bgcolor: "#ffffff",
                transition: "background-color 140ms ease",
                "&:hover td": { bgcolor: alpha("#eff6ff", 0.9) },
              },
            }}
            muiTableBodyCellProps={{
              sx: {
                bgcolor: "#ffffff",
                borderBottom: "1px solid",
                borderColor: alpha("#0f172a", 0.06),
                py: 2,
              },
            }}
            muiTableContainerProps={{ sx: { maxHeight: 520, bgcolor: "#ffffff" } }}
            muiTableHeadCellProps={{
              sx: {
                bgcolor: "#ffffff",
                color: alpha("#0f172a", 0.72),
                fontSize: 13,
                fontWeight: 700,
                py: 1.75,
                borderBottom: "1px solid",
                borderColor: alpha("#0f172a", 0.08),
              },
            }}
            muiTablePaperProps={{
              elevation: 0,
              sx: {
                border: "1px solid",
                borderColor: alpha("#0f172a", 0.08),
                borderRadius: 2,
                overflow: "hidden",
                bgcolor: "#ffffff",
              },
            }}
            muiTopToolbarProps={{
              sx: {
                px: 2.5,
                py: 1.75,
                bgcolor: "#ffffff",
                borderBottom: "1px solid",
                borderColor: alpha("#0f172a", 0.08),
              },
            }}
            renderTopToolbarCustomActions={() => (
              <Typography variant="body2" color="text.secondary">
                {totalExams} exam{totalExams !== 1 ? "s" : ""} · {publishedExams}{" "}
                published
              </Typography>
            )}
            state={{ isLoading, showProgressBars: isLoading }}
          />
        ) : null}
      </Stack>

      <CreateExamDialog
        open={isCreateOpen}
        isSubmitting={createExamState.loading}
        subjectOptions={subjectOptions}
        errorMessage={createError}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateExam}
      />

      <EnterMarksDialog
        open={!!marksDialogExam}
        exam={marksDialogExam}
        studentMarks={studentMarks}
        isSubmitting={isEnteringMarks}
        onClose={() => setMarksDialogExam(null)}
        onMarkChange={handleMarkChange}
        onSubmit={handleSaveMarks}
      />

      <ResultsDialog
        open={!!resultsDialogExam}
        exam={resultsDialogExam}
        results={results}
        studentNameMap={studentNameMap}
        onClose={() => setResultsDialogExam(null)}
      />
    </>
  );
}
