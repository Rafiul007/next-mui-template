"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  AddRounded,
  ArticleRounded,
  AssignmentTurnedInRounded,
  BookmarkRounded,
  CheckCircleOutlineRounded,
  CloudUploadRounded,
  CommentRounded,
  DescriptionRounded,
  FolderOpenRounded,
  HourglassBottomRounded,
  OndemandVideoRounded,
  PendingActionsRounded,
  PersonRounded,
  SchoolRounded,
  VideoLibraryRounded,
  VisibilityRounded,
  WarningAmberRounded,
} from "@mui/icons-material";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
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
  CreateAssignmentDocument,
  GetAllBatchesDocument,
  GetAssignmentsByBatchDocument,
  GetEnrollmentsByBatchDocument,
  GetMaterialsByBatchDocument,
  GetStudentsDocument,
  GetSubjectsDocument,
  GetSubmissionsDocument,
  GiveFeedbackDocument,
  UploadMaterialDocument,
  type GetAssignmentsByBatchQuery,
  type GetMaterialsByBatchQuery,
  type GetSubmissionsQuery,
} from "@/graphql/generated";
import { getErrorMessage } from "@/lib/errors";
import { primaryGradient } from "@/theme/theme";

type MaterialRecord = GetMaterialsByBatchQuery["getMaterialsByBatch"][number];
type AssignmentRecord = GetAssignmentsByBatchQuery["getAssignmentsByBatch"][number];
type SubmissionRecord = GetSubmissionsQuery["getSubmissions"][number];

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDate = (d?: string | null) =>
  d
    ? new Date(d).toLocaleDateString("en-BD", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

const getDueStat = (due?: string | null): "overdue" | "soon" | "future" | "none" => {
  if (!due) return "none";
  const days = Math.floor((new Date(due).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return "overdue";
  if (days <= 3) return "soon";
  return "future";
};

const materialKind = (m: MaterialRecord) => {
  if (m.filePath && m.videoUrl) return "both" as const;
  if (m.videoUrl) return "video" as const;
  return "file" as const;
};

// ── Upload Material Dialog ────────────────────────────────────────────────────

const uploadSchema = yup
  .object({
    title: yup.string().trim().required("Title is required"),
    subjectId: yup.string().default(""),
    videoUrl: yup.string().trim().default(""),
    visibleToAll: yup.boolean().default(true),
  })
  .required();

type UploadFormValues = yup.InferType<typeof uploadSchema>;

function UploadMaterialDialog({
  open,
  isSubmitting,
  subjectOptions,
  errorMessage,
  onClose,
  onSubmit,
}: {
  open: boolean;
  isSubmitting: boolean;
  subjectOptions: RhfSelectOption[];
  errorMessage: string | null;
  onClose: () => void;
  onSubmit: (v: UploadFormValues) => Promise<void>;
}) {
  const { control, handleSubmit, reset, watch } = useForm<UploadFormValues>({
    resolver: yupResolver(uploadSchema),
    defaultValues: {
      title: "",
      subjectId: "",
      videoUrl: "",
      visibleToAll: true,
    },
  });

  const visibleToAll = watch("visibleToAll");

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Upload Study Material</DialogTitle>
      <Box
        component="form"
        onSubmit={handleSubmit(async (v) => {
          await onSubmit(v);
          reset();
        })}
        noValidate
      >
        <DialogContent dividers>
          <Stack spacing={2.5}>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            <RhfTextField
              control={control}
              name="title"
              label="Title"
              placeholder="e.g. Chapter 3 Notes"
              trim
              fullWidth
            />
            <RhfSelect
              control={control}
              name="subjectId"
              label="Subject (optional)"
              options={subjectOptions}
              fullWidth
            />
            <RhfTextField
              control={control}
              name="videoUrl"
              label="Video URL (optional)"
              placeholder="https://youtube.com/watch?v=..."
              trim
              fullWidth
            />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 2,
                bgcolor: alpha("#0f172a", 0.03),
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Visible to all students
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {visibleToAll
                    ? "Every enrolled student can access this"
                    : "Only selected students will see it"}
                </Typography>
              </Box>
              <Controller
                control={control}
                name="visibleToAll"
                render={({ field }) => (
                  <Switch
                    checked={field.value ?? true}
                    onChange={field.onChange}
                    color="primary"
                  />
                )}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={isSubmitting} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={<CloudUploadRounded />}
            sx={{ backgroundImage: primaryGradient }}
          >
            Upload
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

// ── Create Assignment Dialog ──────────────────────────────────────────────────

const assignmentSchema = yup
  .object({
    title: yup.string().trim().required("Title is required"),
    description: yup.string().trim().default(""),
    subjectId: yup.string().default(""),
    dueDate: yup.string().default(""),
  })
  .required();

type AssignmentFormValues = yup.InferType<typeof assignmentSchema>;

function CreateAssignmentDialog({
  open,
  isSubmitting,
  subjectOptions,
  errorMessage,
  onClose,
  onSubmit,
}: {
  open: boolean;
  isSubmitting: boolean;
  subjectOptions: RhfSelectOption[];
  errorMessage: string | null;
  onClose: () => void;
  onSubmit: (v: AssignmentFormValues) => Promise<void>;
}) {
  const { control, handleSubmit, reset } = useForm<AssignmentFormValues>({
    resolver: yupResolver(assignmentSchema),
    defaultValues: { title: "", description: "", subjectId: "", dueDate: "" },
  });

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Assignment</DialogTitle>
      <Box
        component="form"
        onSubmit={handleSubmit(async (v) => {
          await onSubmit(v);
          reset();
        })}
        noValidate
      >
        <DialogContent dividers>
          <Stack spacing={2.5}>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            <RhfTextField
              control={control}
              name="title"
              label="Assignment title"
              placeholder="e.g. Write a short essay on climate change"
              trim
              fullWidth
            />
            <RhfTextField
              control={control}
              name="description"
              label="Instructions (optional)"
              placeholder="Describe what students should do, word limit, format, etc."
              multiline
              rows={3}
              trim
              fullWidth
            />
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
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
                name="dueDate"
                label="Due date (optional)"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={isSubmitting} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={<AddRounded />}
            sx={{ backgroundImage: primaryGradient }}
          >
            Create Assignment
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

// ── Give Feedback Dialog ──────────────────────────────────────────────────────

function GiveFeedbackDialog({
  open,
  isSubmitting,
  studentName,
  existingFeedback,
  errorMessage,
  onClose,
  onSubmit,
}: {
  open: boolean;
  isSubmitting: boolean;
  studentName: string;
  existingFeedback?: string | null;
  errorMessage: string | null;
  onClose: () => void;
  onSubmit: (feedback: string) => Promise<void>;
}) {
  const [text, setText] = useState(existingFeedback ?? "");

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Give Feedback
        <Typography variant="body2" color="text.secondary" component="div">
          for {studentName}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Feedback"
            placeholder="Write detailed feedback for this student's submission..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isSubmitting} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={() => onSubmit(text)}
          variant="contained"
          disabled={isSubmitting || !text.trim()}
          startIcon={<CommentRounded />}
          sx={{ backgroundImage: primaryGradient }}
        >
          Submit Feedback
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Material Card ─────────────────────────────────────────────────────────────

function MaterialCard({
  material,
  subjectName,
}: {
  material: MaterialRecord;
  subjectName?: string;
}) {
  const kind = materialKind(material);

  const iconBg =
    kind === "video"
      ? alpha("#8b5cf6", 0.1)
      : kind === "both"
        ? alpha("#0ea5e9", 0.1)
        : alpha("#10b981", 0.1);

  const iconColor =
    kind === "video" ? "#7c3aed" : kind === "both" ? "#0284c7" : "#059669";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        height: "100%",
        transition: "box-shadow 200ms, border-color 200ms",
        "&:hover": {
          boxShadow: `0 4px 20px ${alpha("#0f172a", 0.08)}`,
          borderColor: alpha("#10b981", 0.3),
        },
      }}
    >
      {/* Icon + title */}
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: iconBg,
            flexShrink: 0,
          }}
        >
          {kind === "video" ? (
            <OndemandVideoRounded sx={{ color: iconColor }} />
          ) : kind === "both" ? (
            <ArticleRounded sx={{ color: iconColor }} />
          ) : (
            <DescriptionRounded sx={{ color: iconColor }} />
          )}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, lineHeight: 1.3 }}
            title={material.title}
          >
            {material.title}
          </Typography>
          {subjectName && (
            <Typography variant="caption" color="text.secondary">
              {subjectName}
            </Typography>
          )}
        </Box>
      </Stack>

      {/* Tags */}
      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
        {material.filePath && (
          <Chip
            label="File"
            size="small"
            icon={<DescriptionRounded />}
            variant="outlined"
            sx={{ fontSize: "0.7rem" }}
          />
        )}
        {material.videoUrl && (
          <Chip
            label="Video"
            size="small"
            icon={<OndemandVideoRounded />}
            variant="outlined"
            color="secondary"
            sx={{ fontSize: "0.7rem" }}
          />
        )}
        <Chip
          label={material.visibleToAll ? "All Students" : "Selected"}
          size="small"
          icon={<VisibilityRounded />}
          color={material.visibleToAll ? "success" : "default"}
          variant="outlined"
          sx={{ fontSize: "0.7rem" }}
        />
      </Stack>

      <Divider />

      {/* Footer */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="caption" color="text.secondary">
          {fmtDate(material.uploadedAt) ?? "No date"}
        </Typography>
        <Stack direction="row" spacing={0.5}>
          {material.filePath && (
            <Tooltip title="Open file">
              <IconButton
                size="small"
                component="a"
                href={material.filePath}
                target="_blank"
                rel="noopener noreferrer"
              >
                <DescriptionRounded fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {material.videoUrl && (
            <Tooltip title="Watch video">
              <IconButton
                size="small"
                component="a"
                href={material.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <OndemandVideoRounded fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}

// ── Assignment Panel ──────────────────────────────────────────────────────────

function AssignmentPanel({
  assignment,
  submissions,
  isSubmissionsLoading,
  studentNameMap,
  enrolledStudentIds,
  subjectName,
  isExpanded,
  onToggle,
  onGiveFeedback,
}: {
  assignment: AssignmentRecord;
  submissions: SubmissionRecord[];
  isSubmissionsLoading: boolean;
  studentNameMap: Map<string, string>;
  enrolledStudentIds: string[];
  subjectName?: string;
  isExpanded: boolean;
  onToggle: () => void;
  onGiveFeedback: (sub: SubmissionRecord) => void;
}) {
  const dueStat = getDueStat(assignment.dueDate);
  const submittedCount = submissions.length;
  const total = enrolledStudentIds.length;
  const pct = total > 0 ? Math.round((submittedCount / total) * 100) : 0;

  const dueColor =
    dueStat === "overdue"
      ? "#ef4444"
      : dueStat === "soon"
        ? "#f59e0b"
        : "#10b981";

  return (
    <Paper
      elevation={0}
      sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }}
    >
      {/* Header row — clickable */}
      <Box
        onClick={onToggle}
        sx={{
          p: 2.5,
          cursor: "pointer",
          transition: "background 150ms",
          "&:hover": { bgcolor: alpha("#0f172a", 0.015) },
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ md: "center" }}
          spacing={2}
        >
          {/* Left: icon + title */}
          <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: alpha("#f59e0b", 0.12),
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <PendingActionsRounded sx={{ color: "#b45309", fontSize: 18 }} />
            </Box>
            <Box minWidth={0}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
                {assignment.title}
              </Typography>
              <Stack direction="row" spacing={0.75} alignItems="center">
                {subjectName && (
                  <Typography variant="caption" color="text.secondary">
                    {subjectName}
                  </Typography>
                )}
                {assignment.description && (
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ maxWidth: 300 }}
                    noWrap
                  >
                    {subjectName ? "·" : ""} {assignment.description}
                  </Typography>
                )}
              </Stack>
            </Box>
          </Stack>

          {/* Right: chips + progress */}
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            flexShrink={0}
          >
            {assignment.dueDate && (
              <Chip
                label={`${fmtDate(assignment.dueDate)} · ${
                  dueStat === "overdue"
                    ? "Overdue"
                    : dueStat === "soon"
                      ? "Due soon"
                      : "Upcoming"
                }`}
                size="small"
                variant="outlined"
                icon={
                  dueStat === "overdue" ? (
                    <WarningAmberRounded
                      sx={{
                        color: `${dueColor} !important`,
                        fontSize: "14px !important",
                      }}
                    />
                  ) : (
                    <HourglassBottomRounded
                      sx={{
                        color: `${dueColor} !important`,
                        fontSize: "14px !important",
                      }}
                    />
                  )
                }
                sx={{
                  color: dueColor,
                  borderColor: dueColor,
                  fontSize: "0.72rem",
                }}
              />
            )}

            <Stack direction="row" spacing={0.5} alignItems="center">
              <AssignmentTurnedInRounded
                sx={{ fontSize: 16, color: "text.secondary" }}
              />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {submittedCount}/{total}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                submitted
              </Typography>
            </Stack>

            <Chip
              label={assignment.active ? "Active" : "Inactive"}
              color={assignment.active ? "success" : "default"}
              size="small"
              variant={assignment.active ? "filled" : "outlined"}
            />
          </Stack>
        </Stack>

        {/* Submission progress bar */}
        {total > 0 && (
          <Box
            sx={{
              mt: 2,
              bgcolor: alpha("#0f172a", 0.06),
              borderRadius: 1,
              height: 4,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: `${pct}%`,
                height: "100%",
                backgroundImage: primaryGradient,
                borderRadius: 1,
                transition: "width 500ms ease",
              }}
            />
          </Box>
        )}
      </Box>

      {/* Submissions table */}
      <Collapse in={isExpanded}>
        <Divider />
        <Box sx={{ p: 2.5, bgcolor: alpha("#f8fafc", 0.7) }}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ fontWeight: 700, letterSpacing: 1, display: "block", mb: 1.5 }}
          >
            Student Submissions
          </Typography>

          {isSubmissionsLoading ? (
            <Typography variant="body2" color="text.secondary">
              Loading submissions...
            </Typography>
          ) : enrolledStudentIds.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No enrolled students in this batch.
            </Typography>
          ) : (
            <Box
              component="table"
              sx={{
                width: "100%",
                borderCollapse: "collapse",
                "& th, & td": {
                  py: 1,
                  px: 1.5,
                  fontSize: "0.8125rem",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  textAlign: "left",
                },
                "& th": {
                  fontWeight: 700,
                  color: "text.secondary",
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  bgcolor: alpha("#0f172a", 0.025),
                },
                "& tr:last-child td": { borderBottom: "none" },
              }}
            >
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Feedback</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {enrolledStudentIds.map((sid) => {
                  const sub = submissions.find((s) => s.studentId === sid);
                  const name = studentNameMap.get(sid) ?? sid;
                  return (
                    <tr key={sid}>
                      <td>
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <PersonRounded
                            sx={{ fontSize: 14, color: "text.secondary" }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600 }}
                          >
                            {name}
                          </Typography>
                        </Stack>
                      </td>
                      <td>
                        <Typography
                          variant="body2"
                          color={sub ? "text.primary" : "text.disabled"}
                        >
                          {sub ? (fmtDate(sub.submittedAt) ?? "—") : "—"}
                        </Typography>
                      </td>
                      <td>
                        {sub ? (
                          <Chip
                            label={sub.late ? "Late" : "On Time"}
                            color={sub.late ? "warning" : "success"}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: "0.7rem" }}
                          />
                        ) : (
                          <Chip
                            label="Not Submitted"
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: "0.7rem", color: "text.disabled" }}
                          />
                        )}
                      </td>
                      <td style={{ maxWidth: 220 }}>
                        {sub?.feedback ? (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: "block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: 200,
                            }}
                            title={sub.feedback}
                          >
                            {sub.feedback}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.disabled">
                            {sub ? "No feedback yet" : "—"}
                          </Typography>
                        )}
                      </td>
                      <td>
                        {sub && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<CommentRounded />}
                            onClick={() => onGiveFeedback(sub)}
                            sx={{ fontSize: "0.75rem" }}
                          >
                            {sub.feedback ? "Edit Feedback" : "Give Feedback"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}

// ── Main Workspace ────────────────────────────────────────────────────────────

export function MaterialsWorkspace() {
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [typeFilter, setTypeFilter] = useState<"all" | "file" | "video">("all");

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [expandedAssignmentId, setExpandedAssignmentId] = useState<string | null>(null);

  const [feedbackTarget, setFeedbackTarget] = useState<SubmissionRecord | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data: batchesData, loading: batchesLoading } = useQuery(GetAllBatchesDocument);
  const { data: subjectsData } = useQuery(GetSubjectsDocument);
  const { data: studentsData } = useQuery(GetStudentsDocument);
  const { data: enrollmentsData } = useQuery(GetEnrollmentsByBatchDocument, {
    skip: !selectedBatchId,
    variables: { batchId: selectedBatchId },
  });
  const {
    data: materialsData,
    loading: materialsLoading,
    refetch: refetchMaterials,
  } = useQuery(GetMaterialsByBatchDocument, {
    skip: !selectedBatchId,
    variables: { batchId: selectedBatchId },
  });
  const {
    data: assignmentsData,
    loading: assignmentsLoading,
    refetch: refetchAssignments,
  } = useQuery(GetAssignmentsByBatchDocument, {
    skip: !selectedBatchId,
    variables: { batchId: selectedBatchId },
  });
  const { data: submissionsData, loading: submissionsLoading } = useQuery(
    GetSubmissionsDocument,
    {
      skip: !expandedAssignmentId,
      variables: { assignmentId: expandedAssignmentId ?? "" },
    },
  );

  // ── Mutations ──────────────────────────────────────────────────────────────

  const [uploadMaterial, uploadState] = useMutation(UploadMaterialDocument);
  const [createAssignment, createState] = useMutation(CreateAssignmentDocument);
  const [giveFeedback, feedbackState] = useMutation(GiveFeedbackDocument);

  // ── Data ───────────────────────────────────────────────────────────────────

  const batches = batchesData?.getAllBatches ?? [];
  const subjects = subjectsData?.getSubjects ?? [];
  const rawStudents = studentsData?.getStudents ?? [];
  const enrollments = enrollmentsData?.getEnrollmentsByBatch ?? [];
  const materials = materialsData?.getMaterialsByBatch ?? [];
  const assignments = assignmentsData?.getAssignmentsByBatch ?? [];
  const submissions = submissionsData?.getSubmissions ?? [];

  const subjectLookup = new Map(subjects.map((s) => [s.id, s.name]));
  const studentLookup = new Map(
    rawStudents
      .filter((s): s is NonNullable<typeof s> => !!s?.id)
      .map((s) => [
        s.id,
        `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || s.email || s.id,
      ]),
  );

  const activeEnrollments = enrollments.filter((e) => /active/i.test(e.status));
  const enrolledStudentIds = activeEnrollments.map((e) => e.studentId);

  const subjectOptions: RhfSelectOption[] = [
    { label: "No subject / General", value: "" },
    ...subjects.map((s) => ({ label: s.name, value: s.id })),
  ];

  const fileCount = materials.filter((m) => m.filePath).length;
  const videoCount = materials.filter((m) => m.videoUrl).length;
  const activeAssignments = assignments.filter((a) => a.active).length;

  const filteredMaterials = materials.filter((m) => {
    if (typeFilter === "file") return !!m.filePath;
    if (typeFilter === "video") return !!m.videoUrl;
    return true;
  });

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleUpload = async (values: UploadFormValues) => {
    if (!selectedBatchId) return;
    setUploadError(null);
    try {
      await uploadMaterial({
        variables: {
          material: {
            title: values.title,
            batchId: selectedBatchId,
            subjectId: values.subjectId?.trim() || undefined,
            videoUrl: values.videoUrl?.trim() || undefined,
            visibleToAll: values.visibleToAll ?? true,
          },
        },
      });
      toast.success("Material uploaded.");
      await refetchMaterials();
      setIsUploadOpen(false);
    } catch (err) {
      const msg = getErrorMessage(err, "Unable to upload material.");
      setUploadError(msg);
      toast.error(msg);
    }
  };

  const handleCreateAssignment = async (values: AssignmentFormValues) => {
    if (!selectedBatchId) return;
    setCreateError(null);
    try {
      await createAssignment({
        variables: {
          assignment: {
            title: values.title,
            batchId: selectedBatchId,
            description: values.description?.trim() || undefined,
            subjectId: values.subjectId?.trim() || undefined,
            dueDate: values.dueDate?.trim() || undefined,
          },
        },
      });
      toast.success("Assignment created.");
      await refetchAssignments();
      setIsCreateOpen(false);
    } catch (err) {
      const msg = getErrorMessage(err, "Unable to create assignment.");
      setCreateError(msg);
      toast.error(msg);
    }
  };

  const handleGiveFeedback = async (feedback: string) => {
    if (!feedbackTarget) return;
    setFeedbackError(null);
    try {
      await giveFeedback({
        variables: {
          assignmentId: feedbackTarget.assignmentId,
          studentId: feedbackTarget.studentId,
          feedback,
        },
      });
      toast.success("Feedback submitted.");
      setFeedbackTarget(null);
    } catch (err) {
      const msg = getErrorMessage(err, "Unable to submit feedback.");
      setFeedbackError(msg);
      toast.error(msg);
    }
  };

  const toggleAssignment = (id: string) =>
    setExpandedAssignmentId((prev) => (prev === id ? null : id));

  const noBatch = !selectedBatchId;
  const isLoading = materialsLoading || assignmentsLoading;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <Stack spacing={3}>
        {/* Page header */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            border: "1px solid",
            borderColor: "divider",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(255,251,235,0.98) 100%)",
          }}
        >
          <Stack
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            spacing={3}
          >
            <Box>
              <Typography variant="h4" component="h1" sx={{ mt: 0.5 }}>
                Materials & Homework
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Share study materials and manage assignments with submission
                tracking and feedback.
              </Typography>
            </Box>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems="flex-start"
              flexShrink={0}
            >
              <Button
                variant="outlined"
                startIcon={<CloudUploadRounded />}
                disabled={noBatch}
                onClick={() => {
                  setUploadError(null);
                  setIsUploadOpen(true);
                }}
              >
                Upload Material
              </Button>
              <Button
                variant="contained"
                startIcon={<AddRounded />}
                disabled={noBatch}
                onClick={() => {
                  setCreateError(null);
                  setIsCreateOpen(true);
                }}
                sx={{ backgroundImage: primaryGradient }}
              >
                New Assignment
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Batch selector */}
        <Paper
          elevation={0}
          sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}
        >
          <SearchSelect
            label="Select batch"
            placeholder="Search by name, class, or course…"
            options={batchSearchOptions(batches)}
            value={selectedBatchId}
            onChange={(val) => {
              setSelectedBatchId(val);
              setExpandedAssignmentId(null);
            }}
            loading={batchesLoading}
            sx={{ maxWidth: 420 }}
          />
        </Paper>

        {selectedBatchId ? (
          <>
            {/* Summary cards */}
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(3, minmax(0, 1fr))",
                },
              }}
            >
              <SummaryCard
                caption="Study Materials"
                title={String(materials.length)}
                icon={<FolderOpenRounded />}
                tone="success"
              />
              <SummaryCard
                caption="Assignments Active"
                title={String(activeAssignments)}
                icon={<PendingActionsRounded />}
                tone="warning"
              />
              <SummaryCard
                caption="Enrolled Students"
                title={String(enrolledStudentIds.length)}
                icon={<SchoolRounded />}
              />
            </Box>

            {/* Tabs */}
            <Box>
              <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}
              >
                <Tab label={`Study Materials (${materials.length})`} />
                <Tab label={`Assignments (${assignments.length})`} />
              </Tabs>

              {/* ── Study Materials ── */}
              {activeTab === 0 && (
                <Stack spacing={2.5}>
                  {/* Filter chips */}
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {(["all", "file", "video"] as const).map((f) => (
                      <Chip
                        key={f}
                        label={
                          f === "all"
                            ? `All (${materials.length})`
                            : f === "file"
                              ? `Files (${fileCount})`
                              : `Videos (${videoCount})`
                        }
                        icon={
                          f === "video" ? (
                            <VideoLibraryRounded />
                          ) : f === "file" ? (
                            <DescriptionRounded />
                          ) : (
                            <BookmarkRounded />
                          )
                        }
                        onClick={() => setTypeFilter(f)}
                        color={typeFilter === f ? "primary" : "default"}
                        variant={typeFilter === f ? "filled" : "outlined"}
                        sx={{ cursor: "pointer" }}
                      />
                    ))}
                  </Stack>

                  {/* Grid */}
                  {isLoading ? (
                    <Typography variant="body2" color="text.secondary">
                      Loading...
                    </Typography>
                  ) : filteredMaterials.length === 0 ? (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 6,
                        border: "1px solid",
                        borderColor: "divider",
                        textAlign: "center",
                      }}
                    >
                      <FolderOpenRounded
                        sx={{ fontSize: 52, color: "text.disabled", mb: 1.5 }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        No materials yet
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.75 }}
                      >
                        Upload notes, PDFs, or video links for your students.
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<CloudUploadRounded />}
                        sx={{ mt: 2.5 }}
                        onClick={() => {
                          setUploadError(null);
                          setIsUploadOpen(true);
                        }}
                      >
                        Upload first material
                      </Button>
                    </Paper>
                  ) : (
                    <Box
                      sx={{
                        display: "grid",
                        gap: 2,
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "repeat(2, 1fr)",
                          md: "repeat(3, 1fr)",
                          xl: "repeat(4, 1fr)",
                        },
                      }}
                    >
                      {filteredMaterials.map((m) => (
                        <MaterialCard
                          key={m.id}
                          material={m}
                          subjectName={
                            m.subjectId
                              ? subjectLookup.get(m.subjectId)
                              : undefined
                          }
                        />
                      ))}
                    </Box>
                  )}
                </Stack>
              )}

              {/* ── Assignments ── */}
              {activeTab === 1 && (
                <Stack spacing={2}>
                  {isLoading ? (
                    <Typography variant="body2" color="text.secondary">
                      Loading...
                    </Typography>
                  ) : assignments.length === 0 ? (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 6,
                        border: "1px solid",
                        borderColor: "divider",
                        textAlign: "center",
                      }}
                    >
                      <PendingActionsRounded
                        sx={{ fontSize: 52, color: "text.disabled", mb: 1.5 }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        No assignments yet
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.75 }}
                      >
                        Create homework and track submissions per student.
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<AddRounded />}
                        sx={{ mt: 2.5 }}
                        onClick={() => {
                          setCreateError(null);
                          setIsCreateOpen(true);
                        }}
                      >
                        Create first assignment
                      </Button>
                    </Paper>
                  ) : (
                    assignments.map((a) => (
                      <AssignmentPanel
                        key={a.id}
                        assignment={a}
                        submissions={
                          expandedAssignmentId === a.id ? submissions : []
                        }
                        isSubmissionsLoading={
                          expandedAssignmentId === a.id && submissionsLoading
                        }
                        studentNameMap={studentLookup}
                        enrolledStudentIds={enrolledStudentIds}
                        subjectName={
                          a.subjectId
                            ? subjectLookup.get(a.subjectId)
                            : undefined
                        }
                        isExpanded={expandedAssignmentId === a.id}
                        onToggle={() => toggleAssignment(a.id)}
                        onGiveFeedback={(sub) => {
                          setFeedbackError(null);
                          setFeedbackTarget(sub);
                        }}
                      />
                    ))
                  )}
                </Stack>
              )}
            </Box>
          </>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack spacing={1} alignItems="flex-start">
              <Typography variant="h6">Select a batch to begin</Typography>
              <Typography variant="body2" color="text.secondary">
                Choose a batch above to manage its materials and assignments.
              </Typography>
            </Stack>
          </Paper>
        )}
      </Stack>

      {/* Dialogs */}
      <UploadMaterialDialog
        open={isUploadOpen}
        isSubmitting={uploadState.loading}
        subjectOptions={subjectOptions}
        errorMessage={uploadError}
        onClose={() => setIsUploadOpen(false)}
        onSubmit={handleUpload}
      />

      <CreateAssignmentDialog
        open={isCreateOpen}
        isSubmitting={createState.loading}
        subjectOptions={subjectOptions}
        errorMessage={createError}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateAssignment}
      />

      {feedbackTarget && (
        <GiveFeedbackDialog
          open
          isSubmitting={feedbackState.loading}
          studentName={
            studentLookup.get(feedbackTarget.studentId) ??
            feedbackTarget.studentId
          }
          existingFeedback={feedbackTarget.feedback}
          errorMessage={feedbackError}
          onClose={() => {
            setFeedbackTarget(null);
            setFeedbackError(null);
          }}
          onSubmit={handleGiveFeedback}
        />
      )}
    </>
  );
}
