"use client";

import { useState } from "react";
import { DeleteRounded, PersonAddRounded } from "@mui/icons-material";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "react-hot-toast";
import {
  AssignStudentToExamDocument,
  GetEnrollmentsByBatchDocument,
  GetExamAssignmentsDocument,
  GetStudentsDocument,
  ScheduleExamDocument,
  UnassignStudentFromExamDocument,
  type GetExamsByBatchQuery,
  type GetStudentsQuery,
} from "@/graphql/generated";
import { SearchSelect } from "@/components/form";
import { getErrorMessage } from "@/lib/errors";

type ExamRecord = GetExamsByBatchQuery["getExamsByBatch"][number];
type StudentRecord = NonNullable<GetStudentsQuery["getStudents"][number]>;

type ScheduleAssignDialogProps = {
  open: boolean;
  exam: ExamRecord | null;
  onClose: () => void;
  onChanged: () => Promise<unknown>;
};

const studentName = (s: StudentRecord) => `${s.firstName} ${s.lastName ?? ""}`.trim();

const toDatetimeLocal = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export function ScheduleAssignDialog({
  open,
  exam,
  onClose,
  onChanged,
}: ScheduleAssignDialogProps) {
  const [startAt, setStartAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [assignAll, setAssignAll] = useState(true);
  const [manualStudentIds, setManualStudentIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Re-seed the form fields whenever a different exam is opened (React's
  // "adjust state during render" pattern — avoids a setState-in-effect flash).
  const [loadedExamId, setLoadedExamId] = useState<string | null>(null);
  if (exam && exam.id !== loadedExamId) {
    setLoadedExamId(exam.id);
    setStartAt(toDatetimeLocal(exam.startAt));
    setDurationMinutes(exam.durationMinutes ? String(exam.durationMinutes) : "60");
  }

  const { data: assignmentsData, refetch: refetchAssignments } = useQuery(
    GetExamAssignmentsDocument,
    { variables: { examId: exam?.id ?? "" }, skip: !exam },
  );
  const { data: enrollmentsData } = useQuery(GetEnrollmentsByBatchDocument, {
    variables: { batchId: exam?.batchId ?? "" },
    skip: !exam,
  });
  const { data: studentsData } = useQuery(GetStudentsDocument);

  const [scheduleExam, { loading: scheduling }] = useMutation(ScheduleExamDocument);
  const [assignStudent, { loading: assigning }] = useMutation(AssignStudentToExamDocument);
  const [unassignStudent] = useMutation(UnassignStudentFromExamDocument);

  const assignments = assignmentsData?.getExamAssignments ?? [];
  const enrollments = (enrollmentsData?.getEnrollmentsByBatch ?? []).filter((e) =>
    /active|enrolled/i.test(e.status),
  );
  const studentNameMap = new Map(
    (studentsData?.getStudents ?? [])
      .filter((s): s is StudentRecord => !!s)
      .map((s) => [s.id, studentName(s)]),
  );
  const assignedIds = new Set(assignments.map((a) => a.studentId));
  const [pickStudentId, setPickStudentId] = useState("");

  const isScheduled = !!exam?.startAt;

  const handleSchedule = async () => {
    if (!exam) return;
    setError(null);
    if (!startAt) {
      setError("Start date/time is required.");
      return;
    }
    const duration = parseInt(durationMinutes, 10);
    if (!duration || duration < 1) {
      setError("Duration must be at least 1 minute.");
      return;
    }
    if (!assignAll && manualStudentIds.length === 0) {
      setError("Select at least one student, or assign the whole batch.");
      return;
    }
    try {
      await scheduleExam({
        variables: {
          input: {
            examId: exam.id,
            startAt: new Date(startAt).toISOString(),
            durationMinutes: duration,
            assignAllInBatch: assignAll,
            manualStudentIds: assignAll ? undefined : manualStudentIds,
          },
        },
      });
      toast.success("Exam scheduled.");
      await onChanged();
      await refetchAssignments();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to schedule exam."));
    }
  };

  const handleAssignOne = async () => {
    if (!exam || !pickStudentId) return;
    try {
      await assignStudent({ variables: { examId: exam.id, studentId: pickStudentId } });
      toast.success("Student assigned.");
      setPickStudentId("");
      await refetchAssignments();
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to assign student."));
    }
  };

  const handleUnassign = async (studentId: string) => {
    if (!exam) return;
    try {
      await unassignStudent({ variables: { examId: exam.id, studentId } });
      toast.success("Student unassigned.");
      await refetchAssignments();
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to unassign student."));
    }
  };

  const unassignedEnrollments = enrollments.filter((e) => !assignedIds.has(e.studentId));

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Schedule &amp; assign — {exam?.title ?? ""}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          {error ? <Alert severity="error">{error}</Alert> : null}

          <Typography variant="subtitle2">
            {isScheduled ? "Reschedule" : "Schedule"}
          </Typography>
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "1fr 1fr" }}>
            <TextField
              label="Start date & time"
              type="datetime-local"
              size="small"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Duration (minutes)"
              type="number"
              size="small"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              slotProps={{ htmlInput: { min: 1 } }}
            />
          </Box>
          {!isScheduled ? (
            <>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={assignAll}
                    onChange={(e) => setAssignAll(e.target.checked)}
                  />
                }
                label="Assign to all active students in this batch"
              />
              {!assignAll ? (
                <Box>
                  {enrollments.map((e) => (
                    <FormControlLabel
                      key={e.studentId}
                      sx={{ display: "flex" }}
                      control={
                        <Checkbox
                          checked={manualStudentIds.includes(e.studentId)}
                          onChange={(ev) =>
                            setManualStudentIds((prev) =>
                              ev.target.checked
                                ? [...prev, e.studentId]
                                : prev.filter((id) => id !== e.studentId),
                            )
                          }
                        />
                      }
                      label={studentNameMap.get(e.studentId) ?? e.studentId}
                    />
                  ))}
                </Box>
              ) : null}
              <Box>
                <Button variant="contained" onClick={handleSchedule} disabled={scheduling}>
                  Schedule exam
                </Button>
              </Box>
            </>
          ) : (
            <Box>
              <Button variant="outlined" onClick={handleSchedule} disabled={scheduling}>
                Save new time
              </Button>
            </Box>
          )}

          <Divider />

          <Typography variant="subtitle2">Assigned students ({assignments.length})</Typography>
          <Stack direction="row" spacing={1}>
            <SearchSelect
              label="Add student"
              placeholder="Search enrolled students…"
              options={unassignedEnrollments.map((e) => ({
                value: e.studentId,
                label: studentNameMap.get(e.studentId) ?? e.studentId,
              }))}
              value={pickStudentId}
              onChange={setPickStudentId}
              sx={{ flex: 1 }}
            />
            <Button
              variant="outlined"
              startIcon={<PersonAddRounded />}
              disabled={!pickStudentId || assigning}
              onClick={handleAssignOne}
            >
              Assign
            </Button>
          </Stack>
          <Stack spacing={0.75}>
            {assignments.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No students assigned yet.
              </Typography>
            ) : (
              assignments.map((a) => (
                <Stack
                  key={a.id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ px: 1.5, py: 0.75, border: "1px solid", borderColor: "divider", borderRadius: 1 }}
                >
                  <Typography variant="body2">
                    {studentNameMap.get(a.studentId) ?? a.studentId}
                  </Typography>
                  <IconButton size="small" color="error" onClick={() => handleUnassign(a.studentId)}>
                    <DeleteRounded fontSize="small" />
                  </IconButton>
                </Stack>
              ))
            )}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
