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
  InsightsRounded,
  ScheduleRounded,
  ArrowBackRounded,
  ClassRounded,
  EventAvailableRounded,
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
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { toast } from "react-hot-toast";
import { SummaryCard } from "@/components/ui";
import {
  CorrectAttendanceDocument,
  GetAllBatchesDocument,
  GetAttendanceBySessionDocument,
  GetAttendanceSummaryDocument,
  GetEnrollmentsByBatchDocument,
  GetSchedulesByBatchDocument,
  GetSessionsByBatchDocument,
  GetStudentsDocument,
  GetUsersDocument,
  MarkAttendanceDocument,
  type GetAttendanceBySessionQuery,
  type GetEnrollmentsByBatchQuery,
  type GetSchedulesByBatchQuery,
  type GetSessionsByBatchQuery,
  type GetStudentsQuery,
} from "@/graphql/generated";
import { getErrorMessage } from "@/lib/errors";
import { primaryGradient } from "@/theme/theme";

type AttendanceRecord =
  GetAttendanceBySessionQuery["getAttendanceBySession"][number];
type EnrollmentRecord =
  GetEnrollmentsByBatchQuery["getEnrollmentsByBatch"][number];
type StudentRecord = NonNullable<GetStudentsQuery["getStudents"][number]>;
type ScheduleRecord = GetSchedulesByBatchQuery["getSchedulesByBatch"][number];
type SessionRecord = GetSessionsByBatchQuery["getSessionsByBatch"][number];

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

const DAY_NAMES = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

const DAY_LABELS: Record<string, string> = {
  SUNDAY: "Sunday",
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
};

const DAY_BG: Record<string, string> = {
  SUNDAY: "#f0fdf4",
  MONDAY: "#eff6ff",
  TUESDAY: "#fefce8",
  WEDNESDAY: "#fff7ed",
  THURSDAY: "#fdf4ff",
  FRIDAY: "#fff1f2",
  SATURDAY: "#f8fafc",
};

const DAY_ACCENT: Record<string, string> = {
  SUNDAY: "#15803d",
  MONDAY: "#1d4ed8",
  TUESDAY: "#a16207",
  WEDNESDAY: "#c2410c",
  THURSDAY: "#7e22ce",
  FRIDAY: "#be123c",
  SATURDAY: "#475569",
};

const toIsoDate = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const todayIso = toIsoDate(new Date());

const formatDisplayDate = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-BD", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

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

// ── Per-student summary row ───────────────────────────────────────────────────

function StudentSummaryRow({
  studentId,
  studentName,
  studentCode,
}: {
  studentId: string;
  studentName: string;
  studentCode: string;
}) {
  const { data, loading } = useQuery(GetAttendanceSummaryDocument, {
    variables: { studentId },
  });

  const s = data?.getAttendanceSummary;

  return (
    <TableRow
      sx={{
        "&:hover td": { bgcolor: alpha("#ecfdf5", 0.6) },
        transition: "background 120ms",
      }}
    >
      <TableCell>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {studentName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {studentCode}
        </Typography>
      </TableCell>

      {loading ? (
        <TableCell colSpan={5}>
          <CircularProgress size={16} />
        </TableCell>
      ) : s ? (
        <>
          <TableCell align="center">
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {s.totalSessions}
            </Typography>
          </TableCell>
          <TableCell>
            <Stack spacing={0.5}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#059669" }}>
                  {s.presentCount} present
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {s.presentPercent.toFixed(0)}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={s.presentPercent}
                sx={{
                  height: 6,
                  borderRadius: 1,
                  bgcolor: alpha("#0f172a", 0.07),
                  "& .MuiLinearProgress-bar": {
                    backgroundImage: primaryGradient,
                    borderRadius: 1,
                  },
                }}
              />
            </Stack>
          </TableCell>
          <TableCell align="center">
            <Chip
              label={`${s.absentCount} (${s.absentPercent.toFixed(0)}%)`}
              size="small"
              color={s.absentCount > 0 ? "error" : "default"}
              variant="outlined"
              sx={{ fontSize: "0.72rem" }}
            />
          </TableCell>
          <TableCell align="center">
            <Chip
              label={`${s.lateCount} (${s.latePercent.toFixed(0)}%)`}
              size="small"
              color={s.lateCount > 0 ? "warning" : "default"}
              variant="outlined"
              sx={{ fontSize: "0.72rem" }}
            />
          </TableCell>
          <TableCell align="center">
            {s.shortageAlert ? (
              <Tooltip title="Attendance below required threshold">
                <Chip
                  label="Low Attendance"
                  color="error"
                  size="small"
                  icon={<WarningRounded />}
                />
              </Tooltip>
            ) : (
              <Chip
                label="OK"
                color="success"
                size="small"
                variant="outlined"
                icon={<CheckCircleRounded />}
              />
            )}
          </TableCell>
        </>
      ) : (
        <TableCell colSpan={5}>
          <Typography variant="caption" color="text.disabled">
            No data
          </Typography>
        </TableCell>
      )}
    </TableRow>
  );
}

// ── Schedule slot card ────────────────────────────────────────────────────────

function ScheduleSlotCard({
  schedule,
  session,
  teacherName,
  onSelect,
}: {
  schedule: ScheduleRecord;
  session: SessionRecord | null;
  teacherName: string | null;
  onSelect: () => void;
}) {
  const accent = DAY_ACCENT[schedule.dayOfWeek] ?? "#10b981";
  const bg = DAY_BG[schedule.dayOfWeek] ?? "#f0fdf4";
  const hasSession = !!session;

  return (
    <Paper
      elevation={0}
      sx={{
        border: "2px solid",
        borderColor: hasSession ? alpha(accent, 0.3) : alpha("#0f172a", 0.1),
        borderRadius: 2,
        overflow: "hidden",
        transition: "all 160ms ease",
        cursor: hasSession ? "pointer" : "default",
        "&:hover": hasSession
          ? {
              borderColor: accent,
              boxShadow: `0 4px 16px ${alpha(accent, 0.18)}`,
              transform: "translateY(-1px)",
            }
          : {},
      }}
      onClick={hasSession ? onSelect : undefined}
    >
      {/* Time strip */}
      <Box
        sx={{
          px: 2,
          py: 1.25,
          bgcolor: hasSession ? alpha(accent, 0.06) : alpha("#0f172a", 0.03),
          borderBottom: "1px solid",
          borderColor: hasSession ? alpha(accent, 0.15) : alpha("#0f172a", 0.06),
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <ScheduleRounded
            sx={{ fontSize: 15, color: hasSession ? accent : "text.disabled" }}
          />
          <Typography
            variant="body2"
            fontWeight={700}
            color={hasSession ? accent : "text.disabled"}
          >
            {formatTime(schedule.startTime)} – {formatTime(schedule.endTime)}
          </Typography>
        </Stack>
      </Box>

      <Box sx={{ p: 2, bgcolor: hasSession ? bg : "transparent" }}>
        {teacherName ? (
          <Typography variant="caption" color="text.secondary" noWrap>
            {teacherName}
          </Typography>
        ) : null}
        {schedule.roomName ? (
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            noWrap
          >
            {schedule.roomName}
          </Typography>
        ) : null}

        {hasSession ? (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.5 }}>
            <Chip
              label="Session recorded"
              size="small"
              color="success"
              variant="outlined"
              icon={<EventAvailableRounded sx={{ fontSize: 13 }} />}
              sx={{ height: 22, fontSize: 11 }}
            />
            <Typography variant="caption" color="primary.main" fontWeight={600}>
              Tap to mark
            </Typography>
          </Stack>
        ) : (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.5 }}>
            <Chip
              label="No session yet"
              size="small"
              variant="outlined"
              sx={{ height: 22, fontSize: 11, color: "text.disabled" }}
            />
          </Stack>
        )}
      </Box>
    </Paper>
  );
}

// ── Main Workspace ────────────────────────────────────────────────────────────

export function AttendanceWorkspace() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [showAllSessions, setShowAllSessions] = useState(false);
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
  const { data: usersData } = useQuery(GetUsersDocument);
  const { data: schedulesData, loading: isSchedulesLoading } = useQuery(
    GetSchedulesByBatchDocument,
    { skip: !selectedBatchId, variables: { batchId: selectedBatchId } },
  );
  const { data: sessionsData, loading: isSessionsLoading } = useQuery(
    GetSessionsByBatchDocument,
    { skip: !selectedBatchId, variables: { batchId: selectedBatchId } },
  );
  const { data: enrollmentsData, loading: isEnrollmentsLoading } = useQuery(
    GetEnrollmentsByBatchDocument,
    { skip: !selectedBatchId, variables: { batchId: selectedBatchId } },
  );
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
  const allUsers = usersData?.getUsers ?? [];
  const schedules = (schedulesData?.getSchedulesByBatch ?? []).filter(
    (s) => s.active,
  );
  const sessions = [...(sessionsData?.getSessionsByBatch ?? [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const enrollments = (enrollmentsData?.getEnrollmentsByBatch ?? []).filter(
    (e): e is EnrollmentRecord => /active|enrolled/i.test(e.status),
  );
  const existingAttendance = attendanceData?.getAttendanceBySession ?? [];

  const userLookup = useMemo(
    () =>
      new Map(
        allUsers
          .filter((u) => !!u)
          .map((u) => [
            u!.id,
            `${u!.firstName ?? ""} ${u!.lastName ?? ""}`.trim() || u!.email,
          ]),
      ),
    [allUsers],
  );

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

  // Sessions indexed by recurringScheduleId::date for instant lookup
  const sessionByScheduleAndDate = useMemo(() => {
    const map = new Map<string, SessionRecord>();
    for (const s of sessions) {
      if (s.recurringScheduleId) {
        map.set(`${s.recurringScheduleId}::${s.date}`, s);
      }
    }
    return map;
  }, [sessions]);

  // Day-of-week for the selected date
  const selectedDayOfWeek =
    DAY_NAMES[new Date(selectedDate + "T00:00:00").getDay()];

  // Schedule slots active on that day
  const daySchedules = useMemo(
    () => schedules.filter((s) => s.dayOfWeek === selectedDayOfWeek),
    [schedules, selectedDayOfWeek],
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
    setShowAllSessions(false);
  };

  const handleSessionSelect = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setPendingStatus({});
    setSaveError(null);
    setShowAllSessions(false);
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
      {/* Header */}
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
          Pick a batch and date to see scheduled classes, then tap a class to
          mark attendance.
        </Typography>
      </Paper>

      {/* Batch + Date selectors */}
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

          {selectedBatchId && (
            <TextField
              label="Date"
              type="date"
              size="small"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedSessionId("");
                setPendingStatus({});
              }}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 180 }}
            />
          )}

          {selectedBatchId && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarMonthRounded
                sx={{ fontSize: 18, color: "text.secondary" }}
              />
              <Typography variant="body2" color="text.secondary">
                {DAY_LABELS[selectedDayOfWeek]}
                {selectedDate === todayIso ? " · Today" : ""}
              </Typography>
            </Box>
          )}
        </Stack>
      </Paper>

      {/* Tabs — only when batch selected */}
      {selectedBatchId && (
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Mark Attendance" />
          <Tab
            label="Batch Summary"
            icon={<InsightsRounded sx={{ fontSize: 16 }} />}
            iconPosition="end"
          />
        </Tabs>
      )}

      {/* ── Batch Summary Tab ── */}
      {activeTab === 1 && selectedBatchId && (
        <Paper
          elevation={0}
          sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }}
        >
          <Box
            sx={{
              px: 3,
              py: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: alpha("#f8fafc", 0.7),
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Attendance Summary —{" "}
              {batches.find((b) => b.id === selectedBatchId)?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lifetime attendance record per enrolled student.
            </Typography>
          </Box>
          {enrolledStudents.length === 0 ? (
            <Box sx={{ px: 3, py: 5, textAlign: "center" }}>
              <Typography variant="subtitle2" color="text.secondary">
                No enrolled students found.
              </Typography>
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: alpha("#f8fafc", 0.9) }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>
                    Student
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: 13 }}>
                    Total Sessions
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 13, minWidth: 180 }}>
                    Present Rate
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: 13 }}>
                    Absent
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: 13 }}>
                    Late
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: 13 }}>
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {enrolledStudents.map((s) => (
                  <StudentSummaryRow
                    key={s.id}
                    studentId={s.id}
                    studentName={`${s.firstName} ${s.lastName ?? ""}`.trim()}
                    studentCode={s.studentCode}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      )}

      {/* ── Mark Attendance Tab ── */}
      {activeTab === 0 && (
        <>
          {/* No batch selected yet */}
          {!selectedBatchId && (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack spacing={1.5}>
                <Typography variant="h6">Select a batch to begin</Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose a batch above, then pick the date of the class you want
                  to mark attendance for.
                </Typography>
              </Stack>
            </Paper>
          )}

          {/* Schedule picker — batch selected, no session chosen yet */}
          {selectedBatchId && !selectedSessionId && !showAllSessions && (
            <Stack spacing={2}>
              {isSchedulesLoading || isSessionsLoading ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <CircularProgress size={28} />
                </Paper>
              ) : schedules.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 3, md: 4 },
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Stack spacing={1.5}>
                    <Typography variant="h6">No class routine set up</Typography>
                    <Typography variant="body2" color="text.secondary">
                      This batch has no recurring schedule. Set one up via
                      Academics → Class Routine, or browse all sessions manually.
                    </Typography>
                    <Box>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ mt: 0.5 }}
                        onClick={() => setShowAllSessions(true)}
                      >
                        Browse all sessions
                      </Button>
                    </Box>
                  </Stack>
                </Paper>
              ) : (
                <>
                  <Box>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 1.5 }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          color: "text.secondary",
                          display: "flex",
                          alignItems: "center",
                          gap: 0.75,
                        }}
                      >
                        <ClassRounded sx={{ fontSize: 15 }} />
                        Classes on {DAY_LABELS[selectedDayOfWeek]}
                        {selectedDate === todayIso ? " (Today)" : ""} ·{" "}
                        {formatDisplayDate(selectedDate)}
                      </Typography>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => setShowAllSessions(true)}
                        sx={{ fontSize: 12 }}
                      >
                        Browse all sessions
                      </Button>
                    </Stack>

                    {daySchedules.length === 0 ? (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 4,
                          border: "1px solid",
                          borderColor: "divider",
                          textAlign: "center",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          fontWeight={700}
                        >
                          No classes scheduled on{" "}
                          {DAY_LABELS[selectedDayOfWeek]}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.disabled"
                          sx={{ mt: 0.5 }}
                        >
                          Pick a different date, or browse all recorded sessions.
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{ mt: 2 }}
                          onClick={() => setShowAllSessions(true)}
                        >
                          Browse all sessions
                        </Button>
                      </Paper>
                    ) : (
                      <Box
                        sx={{
                          display: "grid",
                          gap: 2,
                          gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, minmax(0,1fr))",
                            md: "repeat(3, minmax(0,1fr))",
                          },
                        }}
                      >
                        {daySchedules.map((schedule) => {
                          const session =
                            sessionByScheduleAndDate.get(
                              `${schedule.id}::${selectedDate}`,
                            ) ?? null;
                          return (
                            <ScheduleSlotCard
                              key={schedule.id}
                              schedule={schedule}
                              session={session}
                              teacherName={
                                schedule.teacherId
                                  ? (userLookup.get(schedule.teacherId) ?? null)
                                  : null
                              }
                              onSelect={() =>
                                session && handleSessionSelect(session.id)
                              }
                            />
                          );
                        })}
                      </Box>
                    )}
                  </Box>

                  <Alert severity="info" sx={{ fontSize: 13 }}>
                    Only regular recurring class sessions are shown above. For
                    extra, make-up, or special sessions,{" "}
                    <Button
                      size="small"
                      variant="text"
                      sx={{ p: 0, minWidth: 0, fontSize: 13, fontWeight: 700 }}
                      onClick={() => setShowAllSessions(true)}
                    >
                      browse all sessions.
                    </Button>
                  </Alert>
                </>
              )}
            </Stack>
          )}

          {/* All sessions fallback picker */}
          {selectedBatchId && !selectedSessionId && showAllSessions && (
            <Paper
              elevation={0}
              sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}
            >
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="subtitle2" fontWeight={700}>
                    All sessions — {selectedBatch?.name}
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<ArrowBackRounded />}
                    onClick={() => setShowAllSessions(false)}
                  >
                    Back to schedule view
                  </Button>
                </Stack>

                {isSessionsLoading ? (
                  <CircularProgress size={24} />
                ) : sessions.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No sessions found for this batch.
                  </Typography>
                ) : (
                  <FormControl size="small" fullWidth>
                    <InputLabel>Select session</InputLabel>
                    <Select
                      value=""
                      label="Select session"
                      onChange={(e) => handleSessionSelect(e.target.value)}
                    >
                      {sessions.map((session) => (
                        <MenuItem key={session.id} value={session.id}>
                          {formatDisplayDate(session.date)} ·{" "}
                          {formatTime(session.startTime)} –{" "}
                          {formatTime(session.endTime)}
                          {session.type !== "REGULAR"
                            ? ` (${session.type})`
                            : ""}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Stack>
            </Paper>
          )}

          {/* Loading sheet */}
          {selectedBatchId && selectedSessionId && isSheetLoading && (
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
          )}

          {/* Attendance sheet */}
          {selectedBatchId && selectedSessionId && !isSheetLoading && (
            <>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Button
                  size="small"
                  startIcon={<ArrowBackRounded />}
                  onClick={() => {
                    setSelectedSessionId("");
                    setPendingStatus({});
                  }}
                >
                  Back to schedule
                </Button>
                {selectedSession && (
                  <Typography variant="body2" color="text.secondary">
                    {formatDisplayDate(selectedSession.date)} ·{" "}
                    {formatTime(selectedSession.startTime)} –{" "}
                    {formatTime(selectedSession.endTime)}
                  </Typography>
                )}
              </Stack>

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
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  overflow: "hidden",
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ sm: "center" }}
                  spacing={2}
                  sx={{
                    px: 3,
                    py: 2,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1">
                      {selectedBatch?.name} ·{" "}
                      {selectedSession
                        ? `${formatDisplayDate(selectedSession.date)}, ${formatTime(selectedSession.startTime)}`
                        : ""}
                    </Typography>
                    {isAttendanceTaken ? (
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ mt: 0.5 }}
                      >
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

                {unmarkedCount > 0 &&
                !hasPendingChanges &&
                !isAttendanceTaken ? (
                  <Alert
                    severity="warning"
                    icon={<WarningRounded />}
                    sx={{ mx: 3, mt: 2 }}
                  >
                    {unmarkedCount} student
                    {unmarkedCount === 1 ? " has" : "s have"} no attendance
                    marked yet.
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
                              bgcolor:
                                index % 2 === 0
                                  ? "#ffffff"
                                  : alpha("#f8fafc", 0.5),
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
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
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
                                    [
                                      "PRESENT",
                                      "LATE",
                                      "ABSENT",
                                    ] as AttendanceStatus[]
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
          )}
        </>
      )}
    </Stack>
  );
}
