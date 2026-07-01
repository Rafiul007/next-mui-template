"use client";

import { useState } from "react";
import dayjs from "dayjs";
import {
  AssignmentRounded,
  AssignmentTurnedInRounded,
  CheckCircleRounded,
  ErrorOutlineRounded,
  LinkRounded,
} from "@mui/icons-material";
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
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import { useMutation, useQuery } from "@apollo/client/react";
import { toast } from "react-hot-toast";
import {
  MyEnrollmentsDocument,
  MyStudentProfileDocument,
  SubmitMyAssignmentDocument,
} from "@/graphql/student-portal";
import {
  GetAssignmentsByBatchDocument,
  GetSubmissionsDocument,
  GetAllBatchesDocument,
} from "@/graphql/generated";
import { getErrorMessage } from "@/lib/errors";

function AssignmentCard({
  assignment,
  studentId,
}: {
  assignment: {
    id: string;
    title: string;
    description: string | null;
    dueDate: string | null;
    active: boolean;
    batchId: string | null;
    tenantId: string;
  };
  studentId: string;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const { data: submissionsData, refetch } = useQuery(GetSubmissionsDocument, {
    variables: { assignmentId: assignment.id },
  });

  const [submitMy, { loading: submitting }] = useMutation(
    SubmitMyAssignmentDocument,
    {
      onCompleted: () => {
        toast.success("Assignment submitted.");
        setDialogOpen(false);
        setLinkUrl("");
        refetch();
      },
      onError: (err) => {
        toast.error(getErrorMessage(err, "Submission failed."));
      },
    },
  );

  const mySubmission = submissionsData?.getSubmissions?.find(
    (s) => s.studentId === studentId,
  );

  const isOverdue =
    assignment.dueDate
      ? dayjs(assignment.dueDate).isBefore(dayjs(), "day")
      : false;

  const handleSubmit = () => {
    submitMy({
      variables: {
        assignmentId: assignment.id,
        linkUrl: linkUrl.trim() || null,
      },
    });
  };

  const statusChip = mySubmission ? (
    <Chip
      label={mySubmission.late ? "Submitted (Late)" : "Submitted"}
      size="small"
      color={mySubmission.late ? "warning" : "success"}
      icon={<CheckCircleRounded />}
    />
  ) : isOverdue ? (
    <Chip label="Overdue" size="small" color="error" icon={<ErrorOutlineRounded />} />
  ) : (
    <Chip label="Pending" size="small" color="default" variant="outlined" />
  );

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          border: "1px solid",
          borderColor: mySubmission
            ? alpha("#2563eb", 0.25)
            : isOverdue
              ? alpha("#ef4444", 0.25)
              : "divider",
          bgcolor: mySubmission
            ? alpha("#eff6ff", 0.5)
            : isOverdue
              ? alpha("#fef2f2", 0.4)
              : "transparent",
        }}
      >
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ flex: 1, minWidth: 0, pr: 1 }}>
              <Typography variant="body1" fontWeight={700} noWrap>
                {assignment.title}
              </Typography>
              {assignment.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.25,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {assignment.description}
                </Typography>
              )}
            </Box>
            {statusChip}
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            {assignment.dueDate ? (
              <Typography
                variant="caption"
                color={isOverdue ? "error.main" : "text.secondary"}
                fontWeight={isOverdue ? 600 : 400}
              >
                Due: {dayjs(assignment.dueDate).format("D MMM YYYY")}
              </Typography>
            ) : (
              <Typography variant="caption" color="text.disabled">
                No due date
              </Typography>
            )}

            {!mySubmission && (
              <Button
                size="small"
                variant="contained"
                startIcon={<AssignmentTurnedInRounded fontSize="small" />}
                onClick={() => setDialogOpen(true)}
              >
                Submit
              </Button>
            )}
          </Stack>

          {mySubmission?.filePath && (
            <Stack direction="row" spacing={0.75} alignItems="center">
              <LinkRounded sx={{ fontSize: 14, color: "primary.main" }} />
              <Typography
                variant="caption"
                component="a"
                href={mySubmission.filePath}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: "primary.main", textDecoration: "underline", wordBreak: "break-all" }}
              >
                {mySubmission.filePath}
              </Typography>
            </Stack>
          )}

          {mySubmission?.feedback && (
            <Alert severity="info" sx={{ py: 0.5, fontSize: 13 }}>
              <Typography variant="caption" fontWeight={700}>
                Teacher feedback:{" "}
              </Typography>
              <Typography variant="caption">{mySubmission.feedback}</Typography>
            </Alert>
          )}
        </Stack>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Submit Assignment</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {assignment.title}
            </Typography>
            <TextField
              label="Submission link (optional)"
              placeholder="https://drive.google.com/..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LinkRounded fontSize="small" />
                  </InputAdornment>
                ),
              }}
              helperText="Paste a Google Drive, Classroom, or any public link"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={13} color="inherit" />
              ) : (
                <AssignmentTurnedInRounded fontSize="small" />
              )
            }
          >
            {submitting ? "Submitting…" : "Confirm Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function BatchAssignments({
  batchId,
  studentId,
}: {
  batchId: string;
  studentId: string;
}) {
  const { data, loading } = useQuery(GetAssignmentsByBatchDocument, {
    variables: { batchId },
  });

  if (loading) return <CircularProgress size={16} />;

  const assignments = [...(data?.getAssignmentsByBatch ?? [])]
    .filter((a) => a.active)
    .sort((a, b) => (b.dueDate ?? "").localeCompare(a.dueDate ?? ""));

  if (assignments.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No assignments for this batch.
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      {assignments.map((a) => (
        <AssignmentCard key={a.id} assignment={a} studentId={studentId} />
      ))}
    </Stack>
  );
}

export function AssignmentsWorkspace() {
  const { data: enrollmentsData, loading: enrollmentsLoading } = useQuery(
    MyEnrollmentsDocument,
  );
  const { data: profileData, loading: profileLoading } = useQuery(
    MyStudentProfileDocument,
  );
  const { data: batchesData } = useQuery(GetAllBatchesDocument, {
    fetchPolicy: "cache-and-network",
  });

  const activeEnrollments = (enrollmentsData?.myEnrollments ?? []).filter(
    (e) => e.status === "ACTIVE",
  );
  const studentId = profileData?.myStudentProfile?.id ?? "";
  const isLoading = enrollmentsLoading || profileLoading;

  const batchMap = (batchesData?.getAllBatches ?? []).reduce(
    (acc, batch) => {
      acc[batch.id] = batch;
      return acc;
    },
    {} as Record<string, { id: string; name: string; classLevel?: string | null }>,
  );

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
          <AssignmentRounded sx={{ color: "primary.main" }} />
          <Box>
            <Typography variant="h4" component="h1">
              Assignments
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Submit your assignments across enrolled batches
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : activeEnrollments.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            border: "1px dashed",
            borderColor: "divider",
          }}
        >
          <AssignmentRounded sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }} />
          <Typography variant="h6" color="text.secondary">
            No active enrollments
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={4}>
          {activeEnrollments.map((enrollment) => (
            <Box key={enrollment.id}>
              {batchMap[enrollment.batchId]?.name && (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <Chip
                    label={batchMap[enrollment.batchId]?.name}
                    size="small"
                    variant="outlined"
                  />
                </Stack>
              )}
              {studentId ? (
                <BatchAssignments
                  batchId={enrollment.batchId}
                  studentId={studentId}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Loading profile…
                </Typography>
              )}
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
