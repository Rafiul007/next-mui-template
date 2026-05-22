"use client";

import { useState, useMemo } from "react";
import {
  CalendarMonthRounded,
  CheckCircleRounded,
  PauseCircleRounded,
  CancelRounded,
  PeopleRounded,
  SaveRounded,
  WarningRounded,
} from "@mui/icons-material";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
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
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
} from "@mui/material";
import { toast } from "react-hot-toast";
import { SummaryCard } from "@/components/ui";
import {
  CorrectAttendanceDocument,
  GetAllBatchesDocument,
  GetAttendanceBySessionDocument,
  GetEnrollmentsByBatchDocument,
  GetSessionsByBatchDocument,
  GetStudentsDocument,
  MarkAttendanceDocument,
  type GetAttendanceBySessionQuery,
  type GetEnrollmentsByBatchQuery,
  type GetStudentsQuery,
} from "@/graphql/generated";
import { getErrorMessage } from "@/lib/errors";
import { primaryGradient } from "@/theme/theme";

type AttendanceRecord =
  GetAttendanceBySessionQuery["getAttendanceBySession"][number];
type EnrollmentRecord =
  GetEnrollmentsByBatchQuery["getEnrollmentsByBatch"][number];
type StudentRecord = NonNullable<GetStudentsQuery["getStudents"][number]>;

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-BD", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatTime = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
};

const statusColors: Record<
  AttendanceStatus,
  "success" | "error" | "warning"
> = {
  PRESENT: "success",
  ABSENT: "error",
  LATE: "warning",
};

const statusIcons: Record<AttendanceStatus, React.ReactNode> = {
  PRESENT: <CheckCircleRounded fontSize="small" />,
  ABSENT: <CancelRounded fontSize="small" />,
  LATE: <PauseCircleRounded fontSize="small" />,
};

export function AttendanceWorkspace() {
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [pendingStatus, setPendingStatus] = useState<
    Record<string, AttendanceStatus>
  >({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { data: batchesData, loading: isBatchesLoading } = useQuery(
    GetAllBatchesDocument,
  );
  const { data: studentsData, loading: isStudentsLoading } = useQuery(
    GetStudentsDocument,
  );
  const {
    data: sessionsData,
    loading: isSessionsLoading,
  } = useQuery(GetSessionsByBatchDocument, {
    skip: !selectedBatchId,
    variables: { batchId: selectedBatchId },
  });
  const {
    data: enrollmentsData,
    loading: isEnrollmentsLoading,
  } = useQuery(GetEnrollmentsByBatchDocument, {
    skip: !selectedBatchId,
    variables: { batchId: selectedBatchId },
  });
  const {
    data: attendanceData,
    loading: isAttendanceLoading,
    refetch: refetchAttendance,
  } = useQuery(GetAttendanceBySessionDocument, {
    skip: !selectedSessionId,
    variables: { sessionId: selectedSessionId },
  });

  const [markAttendance] = useMutation(MarkAttendanceDocument);
  const [correctAttendance] = useMutation(CorrectAttendanceDocument);

  const batches = batchesData?.getAllBatches ?? [];
  const allStudents = (studentsData?.getStudents ?? []).filter(
    (s): s is StudentRecord => !!s,
  );
  const sessions = [...(sessionsData?.getSessionsByBatch ?? [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const enrollments = (enrollmentsData?.getEnrollmentsByBatch ?? []).filter(
    (e): e is EnrollmentRecord => /active|enrolled/i.test(e.status),
  );
  const existingAttendance = attendanceData?.getAttendanceBySession ?? [];

  const studentLookup = useMemo(
    () => new Map(allStudents.map((s) => [s.id, s])),
    [allStudents],
  );
  const existingMap = useMemo(
    () =>
      new Map<string, AttendanceRecord>(
        existingAttendance.map((a) => [a.studentId, a]),
      ),
    [existingAttendance],
  );

  const selectedSession =
    sessions.find((s) => s.id === selectedSessionId) ?? null;
  const selectedBatch = batches.find((b) => b.id === selectedBatchId) ?? null;

  const enrolledStudentIds = enrollments.map((e) => e.studentId);
  const enrolledStudents = enrolledStudentIds
    .map((id) => studentLookup.get(id))
    .filter((s): s is StudentRecord => !!s);

  const getEffectiveStatus = (studentId: string): AttendanceStatus | null => {
    if (pendingStatus[studentId]) return pendingStatus[studentId];
    const existing = existingMap.get(studentId);
    if (existing) return existing.status as AttendanceStatus;
    return null;
  };

  const isAttendanceTaken = existingAttendance.length > 0;
  const presentCount = enrolledStudentIds.filter(
    (id) => getEffectiveStatus(id) === "PRESENT",
  ).length;
  const absentCount = enrolledStudentIds.filter(
    (id) => getEffectiveStatus(id) === "ABSENT",
  ).length;
  const lateCount = enrolledStudentIds.filter(
    (id) => getEffectiveStatus(id) === "LATE",
  ).length;
  const unmarkedCount = enrolledStudentIds.filter(
    (id) => !getEffectiveStatus(id),
  ).length;

  const handleBatchChange = (batchId: string) => {
    setSelectedBatchId(batchId);
    setSelectedSessionId("");
    setPendingStatus({});
    setSaveError(null);
  };

  const handleSessionChange = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setPendingStatus({});
    setSaveError(null);
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setPendingStatus((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAllPresent = () => {
    const newStatus: Record<string, AttendanceStatus> = {};
    for (const studentId of enrolledStudentIds) {
      newStatus[studentId] = "PRESENT";
    }
    setPendingStatus(newStatus);
  };

  const handleSave = async () => {
    if (!selectedSessionId) return;
    setSaveError(null);
    setIsSaving(true);

    try {
      const toMark: { studentId: string; status: AttendanceStatus }[] = [];
      const toCorrect: { studentId: string; status: AttendanceStatus }[] = [];

      for (const studentId of enrolledStudentIds) {
        const pending = pendingStatus[studentId];
        if (!pending) continue;
        const existing = existingMap.get(studentId);
        if (existing) {
          if (existing.status !== pending) {
            toCorrect.push({ studentId, status: pending });
          }
        } else {
          toMark.push({ studentId, status: pending });
        }
      }

      if (toMark.length > 0) {
        const result = await markAttendance({
          variables: {
            entries: toMark.map(({ studentId, status }) => ({
              sessionId: selectedSessionId,
              studentId,
              status,
            })),
          },
        });
        if (result.error) throw result.error;
      }

      for (const { studentId, status } of toCorrect) {
        const result = await correctAttendance({
          variables: {
            sessionId: selectedSessionId,
            studentId,
            status,
          },
        });
        if (result.error) throw result.error;
      }

      await refetchAttendance();
      setPendingStatus({});
      const saved = toMark.length + toCorrect.length;
      toast.success(
        `Attendance saved for ${saved} student${saved === 1 ? "" : "s"}.`,
      );
    } catch (error) {
      const message = getErrorMessage(error, "Unable to save attendance.");
      setSaveError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const hasPendingChanges = Object.keys(pendingStatus).length > 0;
  const isSheetLoading =
    isEnrollmentsLoading || isAttendanceLoading || isStudentsLoading;

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
        <Typography variant="h4" component="h1" sx={{ mt: 0.5 }}>
          Student Attendance
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Select a batch and session to mark or review student attendance.
        </Typography>
      </Paper>

      <Paper
        elevation={0}
        sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ sm: "center" }}
        >
          <FormControl size="small" sx={{ minWidth: 260 }}>
            <InputLabel>Select batch</InputLabel>
            <Select
              value={selectedBatchId}
              label="Select batch"
              onChange={(e) => handleBatchChange(e.target.value)}
              disabled={isBatchesLoading}
            >
              {batches.map((batch) => (
                <MenuItem key={batch.id} value={batch.id}>
                  {batch.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 300 }} disabled={!selectedBatchId}>
            <InputLabel>Select session</InputLabel>
            <Select
              value={selectedSessionId}
              label="Select session"
              onChange={(e) => handleSessionChange(e.target.value)}
              disabled={isSessionsLoading || !selectedBatchId}
            >
              {sessions.map((session) => (
                <MenuItem key={session.id} value={session.id}>
                  {formatDate(session.date)} · {formatTime(session.startTime)}{" "}
                  – {formatTime(session.endTime)}
                  {session.type !== "REGULAR" ? ` (${session.type})` : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {selectedSessionId && !isSheetLoading ? (
        <>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr 1fr",
                sm: "repeat(4, minmax(0, 1fr))",
              },
            }}
          >
            <SummaryCard
              caption="Enrolled"
              title={String(enrolledStudents.length)}
              icon={<PeopleRounded />}
            />
            <SummaryCard
              caption="Present"
              title={String(presentCount)}
              icon={<CheckCircleRounded />}
              tone="success"
            />
            <SummaryCard
              caption="Absent"
              title={String(absentCount)}
              icon={<CancelRounded />}
              tone="muted"
            />
            <SummaryCard
              caption="Late"
              title={String(lateCount)}
              icon={<PauseCircleRounded />}
            />
          </Box>

          <Paper
            elevation={0}
            sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ sm: "center" }}
              spacing={2}
              sx={{ px: 3, py: 2, borderBottom: "1px solid", borderColor: "divider" }}
            >
              <Box>
                <Typography variant="subtitle1">
                  {selectedBatch?.name} ·{" "}
                  {selectedSession
                    ? `${formatDate(selectedSession.date)}, ${formatTime(selectedSession.startTime)}`
                    : ""}
                </Typography>
                {isAttendanceTaken ? (
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                    <CalendarMonthRounded
                      sx={{ fontSize: 14, color: "success.main" }}
                    />
                    <Typography variant="body2" color="success.main">
                      Attendance already taken — changes will be corrections
                    </Typography>
                  </Stack>
                ) : null}
              </Box>
              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleMarkAllPresent}
                  disabled={isSaving}
                >
                  Mark all present
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={
                    isSaving ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : (
                      <SaveRounded />
                    )
                  }
                  disabled={!hasPendingChanges || isSaving}
                  onClick={handleSave}
                  sx={{ backgroundImage: primaryGradient }}
                >
                  Save attendance
                </Button>
              </Stack>
            </Stack>

            {saveError ? (
              <Alert severity="error" sx={{ mx: 3, mt: 2 }}>
                {saveError}
              </Alert>
            ) : null}

            {unmarkedCount > 0 && !hasPendingChanges && !isAttendanceTaken ? (
              <Alert
                severity="warning"
                icon={<WarningRounded />}
                sx={{ mx: 3, mt: 2 }}
              >
                {unmarkedCount} student{unmarkedCount === 1 ? " has" : "s have"}{" "}
                no attendance marked yet.
              </Alert>
            ) : null}

            {enrolledStudents.length === 0 ? (
              <Box sx={{ px: 3, py: 6, textAlign: "center" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  No enrolled students
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Enroll students in this batch to take attendance.
                </Typography>
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha("#f8fafc", 0.9) }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>
                      Student
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>
                      Code
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 700, fontSize: 13 }}
                    >
                      Attendance
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {enrolledStudents.map((student, index) => {
                    const effectiveStatus = getEffectiveStatus(student.id);
                    const isPending = !!pendingStatus[student.id];

                    return (
                      <TableRow
                        key={student.id}
                        sx={{
                          bgcolor: index % 2 === 0 ? "#ffffff" : alpha("#f8fafc", 0.5),
                          "&:hover": { bgcolor: alpha("#ecfdf5", 0.8) },
                        }}
                      >
                        <TableCell>
                          <Stack>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 700 }}
                            >
                              {student.firstName} {student.lastName}
                            </Typography>
                            {student.phone ? (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {student.phone}
                              </Typography>
                            ) : null}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {student.studentCode}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="center"
                            alignItems="center"
                          >
                            <ToggleButtonGroup
                              value={effectiveStatus ?? ""}
                              exclusive
                              onChange={(_, value) => {
                                if (value) {
                                  handleStatusChange(
                                    student.id,
                                    value as AttendanceStatus,
                                  );
                                }
                              }}
                              size="small"
                            >
                              {(
                                ["PRESENT", "LATE", "ABSENT"] as AttendanceStatus[]
                              ).map((status) => (
                                <ToggleButton
                                  key={status}
                                  value={status}
                                  sx={{
                                    px: 1.5,
                                    fontWeight: 700,
                                    fontSize: 11,
                                    "&.Mui-selected": {
                                      color: `${statusColors[status]}.main`,
                                      bgcolor: alpha(
                                        status === "PRESENT"
                                          ? "#10b981"
                                          : status === "ABSENT"
                                            ? "#ef4444"
                                            : "#f59e0b",
                                        0.12,
                                      ),
                                      "&:hover": {
                                        bgcolor: alpha(
                                          status === "PRESENT"
                                            ? "#10b981"
                                            : status === "ABSENT"
                                              ? "#ef4444"
                                              : "#f59e0b",
                                          0.18,
                                        ),
                                      },
                                    },
                                  }}
                                >
                                  {statusIcons[status]}
                                  <Box component="span" sx={{ ml: 0.5 }}>
                                    {status === "PRESENT"
                                      ? "P"
                                      : status === "ABSENT"
                                        ? "A"
                                        : "L"}
                                  </Box>
                                </ToggleButton>
                              ))}
                            </ToggleButtonGroup>
                            {isPending ? (
                              <Chip
                                label="unsaved"
                                size="small"
                                variant="outlined"
                                color="warning"
                                sx={{ height: 20, fontSize: 10 }}
                              />
                            ) : effectiveStatus ? (
                              <Chip
                                label={effectiveStatus.toLowerCase()}
                                size="small"
                                color={statusColors[effectiveStatus]}
                                sx={{ height: 20, fontSize: 10 }}
                              />
                            ) : (
                              <Chip
                                label="not marked"
                                size="small"
                                variant="outlined"
                                sx={{ height: 20, fontSize: 10 }}
                              />
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}

            <Divider />
            <Box
              sx={{
                px: 3,
                py: 1.5,
                bgcolor: alpha("#f8fafc", 0.6),
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="contained"
                startIcon={
                  isSaving ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <SaveRounded />
                  )
                }
                disabled={!hasPendingChanges || isSaving}
                onClick={handleSave}
                sx={{ backgroundImage: primaryGradient }}
              >
                Save attendance
              </Button>
            </Box>
          </Paper>
        </>
      ) : selectedSessionId && isSheetLoading ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <CircularProgress size={32} />
        </Paper>
      ) : selectedBatchId && !selectedSessionId ? (
        <Paper
          elevation={0}
          sx={{ p: { xs: 3, md: 4 }, border: "1px solid", borderColor: "divider" }}
        >
          {isSessionsLoading ? (
            <CircularProgress size={24} />
          ) : sessions.length === 0 ? (
            <Stack spacing={1.5}>
              <Typography variant="h6">No sessions found</Typography>
              <Typography variant="body2" color="text.secondary">
                This batch has no scheduled sessions yet. Add sessions via Class
                Schedule.
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={1.5}>
              <Typography variant="h6">Select a session above</Typography>
              <Typography variant="body2" color="text.secondary">
                {sessions.length} session{sessions.length === 1 ? "" : "s"}{" "}
                available for this batch.
              </Typography>
            </Stack>
          )}
        </Paper>
      ) : !selectedBatchId ? (
        <Paper
          elevation={0}
          sx={{ p: { xs: 3, md: 4 }, border: "1px solid", borderColor: "divider" }}
        >
          <Stack spacing={1.5}>
            <Typography variant="h6">Select a batch to begin</Typography>
            <Typography variant="body2" color="text.secondary">
              Choose a batch above, then select a session to take attendance.
            </Typography>
          </Stack>
        </Paper>
      ) : null}
    </Stack>
  );
}
