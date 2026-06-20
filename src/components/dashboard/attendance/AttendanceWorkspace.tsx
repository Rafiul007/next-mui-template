"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  ArrowBackRounded,
  CalendarMonthRounded,
  CheckCircleRounded,
  ClearRounded,
  DownloadRounded,
  EventAvailableRounded,
  InsightsRounded,
  PeopleRounded,
  PersonRounded,
  PlayArrowRounded,
  RoomRounded,
  ScheduleRounded,
  SearchRounded,
  SendRounded,
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
  InputAdornment,
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
  Typography,
  alpha,
} from "@mui/material";
import { toast } from "react-hot-toast";
import {
  CorrectAttendanceDocument,
  GetAllBatchesDocument,
  GetAttendanceBySessionDocument,
  GetEnrollmentsByBatchDocument,
  GetSchedulesByBatchDocument,
  GetSessionsByBatchDocument,
  GetStudentsDocument,
  GetUsersDocument,
  MarkAttendanceDocument,
  StartSessionDocument,
  type GetAttendanceBySessionQuery,
  type GetEnrollmentsByBatchQuery,
  type GetSchedulesByBatchQuery,
  type GetSessionsByBatchQuery,
  type GetStudentsQuery,
} from "@/graphql/generated";
import { SearchSelect } from "@/components/form";
import { getErrorMessage } from "@/lib/errors";
import { batchSearchOptions } from "@/lib/search-options";
import { primaryGradient } from "@/theme/theme";

// ── Types ─────────────────────────────────────────────────────────────────────

type AttendanceRecord =
  GetAttendanceBySessionQuery["getAttendanceBySession"][number];
type EnrollmentRecord =
  GetEnrollmentsByBatchQuery["getEnrollmentsByBatch"][number];
type StudentRecord = NonNullable<GetStudentsQuery["getStudents"][number]>;
type ScheduleRecord = GetSchedulesByBatchQuery["getSchedulesByBatch"][number];
type SessionRecord = GetSessionsByBatchQuery["getSessionsByBatch"][number];

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";
type StatusFilter = "ALL" | AttendanceStatus | "UNMARKED";

// ── Constants ─────────────────────────────────────────────────────────────────

const DAY_NAMES = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

const AVATAR_COLORS = [
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#f97316",
];

// ── Utilities ─────────────────────────────────────────────────────────────────

const toIsoDate = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const todayIso = toIsoDate(new Date());

const fmt12 = (t: string): string => {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${period}`;
};

const fmtDateLong = (iso: string): string => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const fmtDateShort = (iso: string): string => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

const avatarColor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getInitials = (first: string, last?: string | null): string =>
  first.charAt(0).toUpperCase() + (last ? last.charAt(0).toUpperCase() : "");

// ── Student Avatar ─────────────────────────────────────────────────────────────

function StudentAvatar({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName?: string | null;
}) {
  const color = avatarColor(`${firstName}${lastName ?? ""}`);
  return (
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: 1.5,
        bgcolor: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Typography
        sx={{ color: "#fff", fontSize: 13, fontWeight: 700, letterSpacing: 0.5 }}
      >
        {getInitials(firstName, lastName)}
      </Typography>
    </Box>
  );
}

// ── P / A / L Button ─────────────────────────────────────────────────────────

const PAL_COLORS: Record<AttendanceStatus, string> = {
  PRESENT: "#10b981",
  ABSENT: "#ef4444",
  LATE: "#f59e0b",
};

function PALButton({
  label,
  status,
  selected,
  onClick,
}: {
  label: string;
  status: AttendanceStatus;
  selected: boolean;
  onClick: () => void;
}) {
  const color = PAL_COLORS[status];
  return (
    <Box
      component="button"
      onClick={onClick}
      sx={{
        width: 32,
        height: 32,
        borderRadius: 1,
        border: "1.5px solid",
        borderColor: selected ? color : alpha("#0f172a", 0.18),
        bgcolor: selected ? color : "transparent",
        color: selected ? "#fff" : alpha("#0f172a", 0.35),
        cursor: "pointer",
        fontWeight: 700,
        fontSize: 13,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 80ms ease",
        "&:hover": {
          borderColor: color,
          bgcolor: selected ? color : alpha(color, 0.1),
          color: selected ? "#fff" : color,
        },
      }}
    >
      {label}
    </Box>
  );
}

// ── Session Picker Card ───────────────────────────────────────────────────────

function SessionPickerCard({
  schedule,
  session,
  teacherName,
  enrolledCount,
  isStarting,
  onTake,
  onStart,
}: {
  schedule: ScheduleRecord;
  session: SessionRecord | null;
  teacherName: string | null;
  enrolledCount: number;
  isStarting: boolean;
  onTake: () => void;
  onStart: () => void;
}) {
  const hasSession = !!session;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: "1px solid",
        borderColor: hasSession ? alpha("#10b981", 0.35) : "divider",
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        gap: 2,
        transition: "border-color 120ms ease",
        "&:hover": hasSession ? { borderColor: "#10b981" } : {},
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          bgcolor: hasSession ? alpha("#10b981", 0.1) : alpha("#0f172a", 0.05),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <ScheduleRounded
          sx={{ fontSize: 22, color: hasSession ? "#10b981" : "text.disabled" }}
        />
      </Box>

      <Box flex={1} minWidth={0}>
        <Typography variant="subtitle1" fontWeight={700}>
          {fmt12(schedule.startTime)} – {fmt12(schedule.endTime)}
        </Typography>
        <Stack
          direction="row"
          spacing={2}
          flexWrap="wrap"
          useFlexGap
          sx={{ mt: 0.5 }}
        >
          {schedule.roomName && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <RoomRounded sx={{ fontSize: 13, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                {schedule.roomName}
              </Typography>
            </Stack>
          )}
          <Stack direction="row" spacing={0.5} alignItems="center">
            <PeopleRounded sx={{ fontSize: 13, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary">
              {enrolledCount} enrolled
            </Typography>
          </Stack>
          {teacherName && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <PersonRounded sx={{ fontSize: 13, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                {teacherName}
              </Typography>
            </Stack>
          )}
        </Stack>
      </Box>

      {hasSession ? (
        <Button
          variant="contained"
          size="medium"
          startIcon={<EventAvailableRounded />}
          onClick={onTake}
          sx={{ backgroundImage: primaryGradient, flexShrink: 0 }}
        >
          Take attendance
        </Button>
      ) : (
        <Button
          variant="outlined"
          size="medium"
          startIcon={
            isStarting ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <PlayArrowRounded />
            )
          }
          disabled={isStarting}
          onClick={onStart}
          sx={{ flexShrink: 0 }}
        >
          {isStarting ? "Starting…" : "Start session"}
        </Button>
      )}
    </Paper>
  );
}

// ── Session Summary Row (batch summary table) ─────────────────────────────────

function SessionSummaryRow({
  session,
  enrolledCount,
}: {
  session: SessionRecord;
  enrolledCount: number;
}) {
  const { data, loading } = useQuery(GetAttendanceBySessionDocument, {
    variables: { sessionId: session.id },
  });

  const records = data?.getAttendanceBySession ?? [];
  const present = records.filter((r) => r.status === "PRESENT").length;
  const absent = records.filter((r) => r.status === "ABSENT").length;
  const late = records.filter((r) => r.status === "LATE").length;
  const pct =
    enrolledCount > 0 ? Math.round((present / enrolledCount) * 100) : 0;
  const barColor =
    pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <TableRow>
      <TableCell sx={{ py: 1.5 }}>
        <Typography variant="body2" fontWeight={700}>
          {fmtDateShort(session.date)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {fmt12(session.startTime)} – {fmt12(session.endTime)}
        </Typography>
      </TableCell>

      {loading ? (
        <TableCell colSpan={4}>
          <CircularProgress size={14} />
        </TableCell>
      ) : (
        <>
          <TableCell align="center">
            <Typography variant="body2" fontWeight={700} color="#10b981">
              {present}
            </Typography>
          </TableCell>
          <TableCell align="center">
            <Typography
              variant="body2"
              fontWeight={700}
              color={absent > 0 ? "#ef4444" : "text.disabled"}
            >
              {absent}
            </Typography>
          </TableCell>
          <TableCell align="center">
            <Typography
              variant="body2"
              fontWeight={700}
              color={late > 0 ? "#f59e0b" : "text.disabled"}
            >
              {late}
            </Typography>
          </TableCell>
          <TableCell sx={{ minWidth: 150 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography
                variant="body2"
                fontWeight={700}
                color={barColor}
                sx={{ minWidth: 36 }}
              >
                {pct}%
              </Typography>
              <Box flex={1}>
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  sx={{
                    height: 6,
                    borderRadius: 1,
                    bgcolor: alpha("#0f172a", 0.07),
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 1,
                      bgcolor: barColor,
                    },
                  }}
                />
              </Box>
            </Stack>
          </TableCell>
        </>
      )}
    </TableRow>
  );
}

// ── Batch Summary View ─────────────────────────────────────────────────────────

function BatchSummaryView({
  sessions,
  enrollments,
}: {
  sessions: SessionRecord[];
  enrollments: EnrollmentRecord[];
}) {
  const completedCount = sessions.filter((s) =>
    /completed/i.test(s.status),
  ).length;

  const recentSessions = [...sessions]
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
    .slice(0, 6);

  const kpis = [
    {
      label: "Sessions held",
      value: completedCount || sessions.length,
      icon: <CalendarMonthRounded />,
      color: "#10b981",
      bg: alpha("#10b981", 0.1),
    },
    {
      label: "Enrolled students",
      value: enrollments.length,
      icon: <PeopleRounded />,
      color: "#3b82f6",
      bg: alpha("#3b82f6", 0.1),
    },
    {
      label: "Total sessions",
      value: sessions.length,
      icon: <ScheduleRounded />,
      color: "#8b5cf6",
      bg: alpha("#8b5cf6", 0.1),
    },
    {
      label: "Recent shown",
      value: recentSessions.length,
      icon: <InsightsRounded />,
      color: "#f59e0b",
      bg: alpha("#f59e0b", 0.1),
    },
  ];

  return (
    <Stack spacing={3}>
      {/* KPI cards */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "1fr 1fr",
            md: "repeat(4, minmax(0, 1fr))",
          },
        }}
      >
        {kpis.map((kpi) => (
          <Paper
            key={kpi.label}
            elevation={0}
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: kpi.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1.5,
                color: kpi.color,
              }}
            >
              {kpi.icon}
            </Box>
            <Typography variant="h4" fontWeight={700}>
              {kpi.value}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {kpi.label}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Recent sessions table */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ px: 3, py: 2, borderBottom: "1px solid", borderColor: "divider" }}
        >
          <Typography variant="subtitle1" fontWeight={700}>
            Recent sessions
          </Typography>
          <Button size="small" variant="text">
            View all
          </Button>
        </Stack>

        {recentSessions.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <ScheduleRounded
              sx={{ fontSize: 40, color: "text.disabled", mb: 1.5 }}
            />
            <Typography variant="subtitle2" color="text.secondary">
              No sessions yet
            </Typography>
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: alpha("#f8fafc", 0.9) }}>
                {[
                  "Date",
                  "Present",
                  "Absent",
                  "Late",
                  "Attendance progress",
                ].map((h, i) => (
                  <TableCell
                    key={h}
                    align={i > 0 && i < 4 ? "center" : "left"}
                    sx={{
                      fontWeight: 700,
                      fontSize: 11,
                      color: "text.secondary",
                      textTransform: "uppercase",
                      letterSpacing: 0.6,
                      py: 1.5,
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {recentSessions.map((s) => (
                <SessionSummaryRow
                  key={s.id}
                  session={s}
                  enrolledCount={enrollments.length}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Stack>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function AttendanceWorkspace() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [pendingStatus, setPendingStatus] = useState<
    Record<string, AttendanceStatus>
  >({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [startingScheduleId, setStartingScheduleId] = useState<string | null>(
    null,
  );
  const [showAllSessions, setShowAllSessions] = useState(false);

  const initDoneRef = useRef<string>("");

  // ── Queries ───────────────────────────────────────────────────────────────

  const { data: batchesData } = useQuery(GetAllBatchesDocument);
  const { data: studentsData } = useQuery(GetStudentsDocument);
  const { data: usersData } = useQuery(GetUsersDocument);
  const { data: schedulesData, loading: isSchedulesLoading } = useQuery(
    GetSchedulesByBatchDocument,
    { skip: !selectedBatchId, variables: { batchId: selectedBatchId } },
  );
  const {
    data: sessionsData,
    loading: isSessionsLoading,
    refetch: refetchSessions,
  } = useQuery(GetSessionsByBatchDocument, {
    skip: !selectedBatchId,
    variables: { batchId: selectedBatchId },
  });
  const { data: enrollmentsData } = useQuery(GetEnrollmentsByBatchDocument, {
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
    fetchPolicy: "cache-and-network",
  });

  // ── Mutations ─────────────────────────────────────────────────────────────

  const [markAttendance] = useMutation(MarkAttendanceDocument);
  const [correctAttendance] = useMutation(CorrectAttendanceDocument);
  const [startSessionMutation] = useMutation(StartSessionDocument);

  // ── Derived data ──────────────────────────────────────────────────────────

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
          .filter(Boolean)
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

  const selectedDayOfWeek =
    DAY_NAMES[new Date(selectedDate + "T00:00:00").getDay()];

  const daySchedules = useMemo(
    () => schedules.filter((s) => s.dayOfWeek === selectedDayOfWeek),
    [schedules, selectedDayOfWeek],
  );

  const sessionByScheduleDate = useMemo(() => {
    const map = new Map<string, SessionRecord>();
    for (const s of sessions) {
      if (s.recurringScheduleId)
        map.set(`${s.recurringScheduleId}::${s.date}`, s);
    }
    return map;
  }, [sessions]);

  const selectedSession =
    sessions.find((s) => s.id === selectedSessionId) ?? null;
  const selectedBatch = batches.find((b) => b.id === selectedBatchId) ?? null;

  const enrolledStudentIds = useMemo(
    () => enrollments.map((e) => e.studentId),
    [enrollments],
  );

  const enrolledStudents = useMemo(
    () =>
      enrolledStudentIds
        .map((id) => studentLookup.get(id))
        .filter((s): s is StudentRecord => !!s),
    [enrolledStudentIds, studentLookup],
  );

  // Bulk-first: initialize all enrolled → PRESENT once session + enrollments load
  useEffect(() => {
    if (
      !selectedSessionId ||
      enrolledStudentIds.length === 0 ||
      isAttendanceLoading
    )
      return;
    const key = `${selectedSessionId}::${enrolledStudentIds.join(",")}`;
    if (initDoneRef.current === key) return;
    initDoneRef.current = key;

    const alreadyMarked = new Set(existingAttendance.map((a) => a.studentId));
    const next: Record<string, AttendanceStatus> = {};
    for (const id of enrolledStudentIds) {
      if (!alreadyMarked.has(id)) next[id] = "PRESENT";
    }
    setPendingStatus(next);
  }, [
    selectedSessionId,
    enrolledStudentIds,
    isAttendanceLoading,
    existingAttendance,
  ]);

  // ── Attendance state ──────────────────────────────────────────────────────

  const getStatus = useCallback(
    (studentId: string): AttendanceStatus | null => {
      if (pendingStatus[studentId]) return pendingStatus[studentId];
      const existing = existingMap.get(studentId);
      if (existing) return existing.status as AttendanceStatus;
      return null;
    },
    [pendingStatus, existingMap],
  );

  const presentCount = enrolledStudentIds.filter(
    (id) => getStatus(id) === "PRESENT",
  ).length;
  const absentCount = enrolledStudentIds.filter(
    (id) => getStatus(id) === "ABSENT",
  ).length;
  const lateCount = enrolledStudentIds.filter(
    (id) => getStatus(id) === "LATE",
  ).length;
  const unmarkedCount = enrolledStudentIds.filter(
    (id) => !getStatus(id),
  ).length;
  const presentPct =
    enrolledStudents.length > 0
      ? Math.round((presentCount / enrolledStudents.length) * 100)
      : 0;

  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return enrolledStudents.filter((s) => {
      const matchSearch =
        !q ||
        s.firstName.toLowerCase().includes(q) ||
        (s.lastName?.toLowerCase().includes(q) ?? false) ||
        s.studentCode.toLowerCase().includes(q);
      const st = getStatus(s.id);
      const matchFilter =
        statusFilter === "ALL" ||
        (statusFilter === "UNMARKED" ? !st : st === statusFilter);
      return matchSearch && matchFilter;
    });
  }, [enrolledStudents, searchQuery, statusFilter, getStatus]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const resetSession = () => {
    setSelectedSessionId("");
    setPendingStatus({});
    setSaveError(null);
    initDoneRef.current = "";
    setSearchQuery("");
    setStatusFilter("ALL");
  };

  const handleBatchChange = (batchId: string) => {
    setSelectedBatchId(batchId);
    resetSession();
    setShowAllSessions(false);
  };

  const handleSessionSelect = (sessionId: string) => {
    setPendingStatus({});
    initDoneRef.current = "";
    setSelectedSessionId(sessionId);
    setSaveError(null);
    setShowAllSessions(false);
    setSearchQuery("");
    setStatusFilter("ALL");
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setPendingStatus((prev) => {
      const existing = existingMap.get(studentId);
      if (existing?.status === status) {
        const next = { ...prev };
        delete next[studentId];
        return next;
      }
      return { ...prev, [studentId]: status };
    });
  };

  const handleMarkAllPresent = () => {
    const next: Record<string, AttendanceStatus> = {};
    for (const id of enrolledStudentIds) next[id] = "PRESENT";
    setPendingStatus(next);
  };

  const handleStartSession = async (scheduleId: string) => {
    setStartingScheduleId(scheduleId);
    try {
      const result = await startSessionMutation({
        variables: { scheduleId, date: selectedDate },
      });
      if (result.error) throw result.error;
      const newSession = result.data?.startSession;
      if (newSession) {
        await refetchSessions();
        handleSessionSelect(newSession.id);
        toast.success("Session started — mark attendance below.");
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to start session."));
    } finally {
      setStartingScheduleId(null);
    }
  };

  const handleSubmit = async () => {
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
          if (existing.status !== pending)
            toCorrect.push({ studentId, status: pending });
        } else {
          toMark.push({ studentId, status: pending });
        }
      }

      if (toMark.length > 0) {
        const res = await markAttendance({
          variables: {
            entries: toMark.map(({ studentId, status }) => ({
              sessionId: selectedSessionId,
              studentId,
              status,
            })),
          },
        });
        if (res.error) throw res.error;
      }

      for (const { studentId, status } of toCorrect) {
        const res = await correctAttendance({
          variables: { sessionId: selectedSessionId, studentId, status },
        });
        if (res.error) throw res.error;
      }

      await refetchAttendance();
      setPendingStatus({});
      initDoneRef.current = "";
      const n = toMark.length + toCorrect.length;
      toast.success(`Attendance saved for ${n} student${n === 1 ? "" : "s"}.`);
    } catch (error) {
      const msg = getErrorMessage(error, "Unable to save attendance.");
      setSaveError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const hasPending = Object.keys(pendingStatus).length > 0;
  const allMarked = unmarkedCount === 0 && enrolledStudents.length > 0;
  const statBarColor =
    presentPct >= 80 ? "#10b981" : presentPct >= 60 ? "#f59e0b" : "#ef4444";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Stack spacing={3}>
      {/* Page header */}
      <Box>
        <Typography variant="h4" component="h1" fontWeight={700}>
          Student Attendance
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Pick a batch and session to start marking attendance.
        </Typography>
      </Box>

      {/* Batch + date selector */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ sm: "center" }}
      >
        <SearchSelect
          label="Select batch"
          placeholder="Search by name, class, or course…"
          options={batchSearchOptions(batches)}
          value={selectedBatchId}
          onChange={handleBatchChange}
          sx={{ minWidth: 280 }}
        />

        {selectedBatchId && (
          <>
            <Stack direction="row" spacing={1} alignItems="center">
              <CalendarMonthRounded sx={{ fontSize: 18, color: "text.secondary" }} />
              <TextField
                type="date"
                size="small"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  resetSession();
                }}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ width: 160 }}
              />
            </Stack>
            {selectedDate === todayIso && (
              <Chip
                label="Today"
                size="small"
                color="success"
                variant="outlined"
              />
            )}
          </>
        )}
      </Stack>

      {/* No batch → empty state */}
      {!selectedBatchId && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 8 },
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            textAlign: "center",
          }}
        >
          <PeopleRounded sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" fontWeight={700}>
            Select a batch to begin
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, maxWidth: 400, mx: "auto" }}
          >
            Choose a batch above to see scheduled classes and mark attendance.
          </Typography>
        </Paper>
      )}

      {/* Tabs */}
      {selectedBatchId && (
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => {
              if (v === 1) resetSession();
              setActiveTab(v);
            }}
          >
            <Tab
              label="Mark attendance"
              icon={<CheckCircleRounded sx={{ fontSize: 16 }} />}
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
            <Tab
              label="Batch summary"
              icon={<InsightsRounded sx={{ fontSize: 16 }} />}
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
          </Tabs>
        </Box>
      )}

      {/* ── TAB 0: Mark attendance ─────────────────────────────────────────── */}
      {activeTab === 0 && selectedBatchId && (
        <>
          {/* Session picker */}
          {!selectedSessionId && (
            <Stack spacing={2}>
              {isSchedulesLoading || isSessionsLoading ? (
                <Box
                  sx={{ display: "flex", justifyContent: "center", py: 8 }}
                >
                  <CircularProgress size={28} />
                </Box>
              ) : showAllSessions ? (
                /* Browse all sessions */
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                  }}
                >
                  <Stack spacing={2}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="subtitle2" fontWeight={700}>
                        All sessions · {selectedBatch?.name}
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<ArrowBackRounded />}
                        onClick={() => setShowAllSessions(false)}
                      >
                        Back to schedule
                      </Button>
                    </Stack>
                    {sessions.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No sessions found.
                      </Typography>
                    ) : (
                      <FormControl size="small" fullWidth>
                        <Select
                          value=""
                          displayEmpty
                          onChange={(e) =>
                            e.target.value &&
                            handleSessionSelect(e.target.value)
                          }
                          renderValue={() => (
                            <Typography color="text.secondary" variant="body2">
                              Pick a session…
                            </Typography>
                          )}
                        >
                          {sessions.map((s) => (
                            <MenuItem key={s.id} value={s.id}>
                              {fmtDateShort(s.date)} · {fmt12(s.startTime)} –{" "}
                              {fmt12(s.endTime)}
                              {s.type !== "REGULAR" ? ` (${s.type})` : ""}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </Stack>
                </Paper>
              ) : (
                /* Day schedule cards */
                <>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      fontWeight={700}
                    >
                      {selectedDayOfWeek.charAt(0) +
                        selectedDayOfWeek.slice(1).toLowerCase()}{" "}
                      · {fmtDateLong(selectedDate)}
                    </Typography>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => setShowAllSessions(true)}
                    >
                      Browse all sessions
                    </Button>
                  </Stack>

                  {daySchedules.length === 0 ? (
                    <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 4, md: 6 },
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        textAlign: "center",
                      }}
                    >
                      <ScheduleRounded
                        sx={{ fontSize: 40, color: "text.disabled", mb: 1.5 }}
                      />
                      <Typography variant="subtitle1" fontWeight={700}>
                        No classes scheduled
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.75, mb: 2.5 }}
                      >
                        No recurring classes on{" "}
                        {selectedDayOfWeek.charAt(0) +
                          selectedDayOfWeek.slice(1).toLowerCase()}
                        . Try a different date or browse all sessions.
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setShowAllSessions(true)}
                      >
                        Browse all sessions
                      </Button>
                    </Paper>
                  ) : (
                    <Stack spacing={1.5}>
                      {daySchedules.map((schedule) => {
                        const session =
                          sessionByScheduleDate.get(
                            `${schedule.id}::${selectedDate}`,
                          ) ?? null;
                        return (
                          <SessionPickerCard
                            key={schedule.id}
                            schedule={schedule}
                            session={session}
                            teacherName={
                              schedule.teacherId
                                ? (userLookup.get(schedule.teacherId) ?? null)
                                : null
                            }
                            enrolledCount={enrollments.length}
                            isStarting={startingScheduleId === schedule.id}
                            onTake={() =>
                              session && handleSessionSelect(session.id)
                            }
                            onStart={() => handleStartSession(schedule.id)}
                          />
                        );
                      })}
                    </Stack>
                  )}

                  <Alert severity="info" sx={{ fontSize: 13 }}>
                    Only recurring schedule slots are shown. For extra or
                    make-up classes,{" "}
                    <Button
                      size="small"
                      variant="text"
                      sx={{
                        p: 0,
                        minWidth: 0,
                        fontSize: 13,
                        fontWeight: 700,
                        verticalAlign: "baseline",
                      }}
                      onClick={() => setShowAllSessions(true)}
                    >
                      browse all sessions.
                    </Button>
                  </Alert>
                </>
              )}
            </Stack>
          )}

          {/* ── Marking view (split panel) ─────────────────────────────────── */}
          {selectedSessionId && (
            <Box sx={{ display: "flex", gap: 2.5, alignItems: "flex-start" }}>
              {/* LEFT: student list */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {/* Back + session info */}
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ mb: 2 }}
                >
                  <Button
                    size="small"
                    startIcon={<ArrowBackRounded />}
                    onClick={resetSession}
                  >
                    Back
                  </Button>
                  {selectedSession && (
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      flexWrap="wrap"
                      useFlexGap
                    >
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <ScheduleRounded
                          sx={{ fontSize: 14, color: "text.secondary" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {fmt12(selectedSession.startTime)} –{" "}
                          {fmt12(selectedSession.endTime)}
                        </Typography>
                      </Stack>
                      {selectedSession.roomName && (
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          <RoomRounded
                            sx={{ fontSize: 14, color: "text.secondary" }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {selectedSession.roomName}
                          </Typography>
                        </Stack>
                      )}
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <CalendarMonthRounded
                          sx={{ fontSize: 14, color: "text.secondary" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {fmtDateLong(selectedSession.date)}
                        </Typography>
                      </Stack>
                    </Stack>
                  )}
                </Stack>

                {/* Search + bulk actions */}
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  sx={{ mb: 2 }}
                >
                  <TextField
                    size="small"
                    placeholder="Search by name or roll…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchRounded
                              sx={{ fontSize: 18, color: "text.secondary" }}
                            />
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={{ flex: 1 }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<CheckCircleRounded />}
                    onClick={handleMarkAllPresent}
                    sx={{ backgroundImage: primaryGradient, flexShrink: 0 }}
                  >
                    Mark all Present
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ClearRounded />}
                    onClick={() => setPendingStatus({})}
                    sx={{ flexShrink: 0 }}
                  >
                    Clear
                  </Button>
                </Stack>

                {/* Filter chips */}
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  {(
                    [
                      {
                        key: "ALL" as StatusFilter,
                        label: "All",
                        count: enrolledStudents.length,
                      },
                      {
                        key: "PRESENT" as StatusFilter,
                        label: "Present",
                        count: presentCount,
                      },
                      {
                        key: "ABSENT" as StatusFilter,
                        label: "Absent",
                        count: absentCount,
                      },
                      {
                        key: "LATE" as StatusFilter,
                        label: "Late",
                        count: lateCount,
                      },
                      {
                        key: "UNMARKED" as StatusFilter,
                        label: "Unmarked",
                        count: unmarkedCount,
                      },
                    ] as const
                  ).map(({ key, label, count }) => {
                    const active = statusFilter === key;
                    const chipColor =
                      key === "PRESENT"
                        ? "success"
                        : key === "ABSENT"
                          ? "error"
                          : key === "LATE"
                            ? "warning"
                            : "default";
                    return (
                      <Chip
                        key={key}
                        label={`${label} ${count}`}
                        size="small"
                        variant={active ? "filled" : "outlined"}
                        color={active ? chipColor : "default"}
                        onClick={() => setStatusFilter(key)}
                        sx={{ fontWeight: active ? 700 : 400 }}
                      />
                    );
                  })}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: "auto" }}
                  >
                    {filteredStudents.length} shown
                  </Typography>
                </Stack>

                {saveError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {saveError}
                  </Alert>
                )}

                {/* Student table */}
                <Paper
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  {isAttendanceLoading ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        py: 8,
                      }}
                    >
                      <CircularProgress size={28} />
                    </Box>
                  ) : enrolledStudents.length === 0 ? (
                    <Box sx={{ py: 6, textAlign: "center" }}>
                      <PeopleRounded
                        sx={{ fontSize: 40, color: "text.disabled", mb: 1 }}
                      />
                      <Typography variant="subtitle2" color="text.secondary">
                        No enrolled students found
                      </Typography>
                    </Box>
                  ) : (
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: alpha("#f8fafc", 0.9) }}>
                          <TableCell
                            sx={{
                              fontWeight: 700,
                              fontSize: 11,
                              color: "text.secondary",
                              textTransform: "uppercase",
                              letterSpacing: 0.6,
                              py: 1.5,
                            }}
                          >
                            Roll
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 700,
                              fontSize: 11,
                              color: "text.secondary",
                              textTransform: "uppercase",
                              letterSpacing: 0.6,
                              py: 1.5,
                            }}
                          >
                            Student
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontWeight: 700,
                              fontSize: 11,
                              color: "text.secondary",
                              textTransform: "uppercase",
                              letterSpacing: 0.6,
                              py: 1.5,
                              pr: 2.5,
                            }}
                          >
                            P &nbsp; A &nbsp; L
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredStudents.map((student) => {
                          const status = getStatus(student.id);
                          const rowBg =
                            status === "PRESENT"
                              ? alpha("#10b981", 0.045)
                              : status === "ABSENT"
                                ? alpha("#ef4444", 0.04)
                                : status === "LATE"
                                  ? alpha("#f59e0b", 0.04)
                                  : "transparent";

                          return (
                            <TableRow
                              key={student.id}
                              sx={{
                                bgcolor: rowBg,
                                transition: "background 80ms ease",
                                "&:hover td": {
                                  bgcolor:
                                    status === "PRESENT"
                                      ? alpha("#10b981", 0.09)
                                      : alpha("#f8fafc", 0.8),
                                },
                              }}
                            >
                              <TableCell sx={{ py: 1 }}>
                                <Stack
                                  direction="row"
                                  spacing={1.5}
                                  alignItems="center"
                                >
                                  <StudentAvatar
                                    firstName={student.firstName}
                                    lastName={student.lastName}
                                  />
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    fontWeight={600}
                                  >
                                    {student.studentCode}
                                  </Typography>
                                </Stack>
                              </TableCell>
                              <TableCell sx={{ py: 1 }}>
                                <Typography variant="body2" fontWeight={600}>
                                  {student.firstName} {student.lastName}
                                </Typography>
                              </TableCell>
                              <TableCell
                                align="right"
                                sx={{ py: 1, pr: 2 }}
                              >
                                <Stack
                                  direction="row"
                                  spacing={0.5}
                                  justifyContent="flex-end"
                                >
                                  <PALButton
                                    label="P"
                                    status="PRESENT"
                                    selected={status === "PRESENT"}
                                    onClick={() =>
                                      handleStatusChange(
                                        student.id,
                                        "PRESENT",
                                      )
                                    }
                                  />
                                  <PALButton
                                    label="A"
                                    status="ABSENT"
                                    selected={status === "ABSENT"}
                                    onClick={() =>
                                      handleStatusChange(student.id, "ABSENT")
                                    }
                                  />
                                  <PALButton
                                    label="L"
                                    status="LATE"
                                    selected={status === "LATE"}
                                    onClick={() =>
                                      handleStatusChange(student.id, "LATE")
                                    }
                                  />
                                </Stack>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </Paper>
              </Box>

              {/* RIGHT: sticky stats panel */}
              <Box
                sx={{
                  width: { md: 224, lg: 248 },
                  flexShrink: 0,
                  position: "sticky",
                  top: 76,
                  display: { xs: "none", md: "block" },
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  {/* Session block */}
                  <Box
                    sx={{
                      p: 2,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      color="text.secondary"
                      sx={{
                        textTransform: "uppercase",
                        letterSpacing: 0.9,
                        display: "block",
                        mb: 1.25,
                      }}
                    >
                      Session
                    </Typography>
                    {selectedSession && (
                      <Stack spacing={0.75}>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          alignItems="center"
                        >
                          <ScheduleRounded
                            sx={{ fontSize: 14, color: "text.secondary" }}
                          />
                          <Typography variant="body2" fontWeight={600}>
                            {fmt12(selectedSession.startTime)} –{" "}
                            {fmt12(selectedSession.endTime)}
                          </Typography>
                        </Stack>
                        {selectedSession.roomName && (
                          <Stack
                            direction="row"
                            spacing={0.75}
                            alignItems="center"
                          >
                            <RoomRounded
                              sx={{ fontSize: 14, color: "text.secondary" }}
                            />
                            <Typography variant="body2">
                              {selectedSession.roomName}
                            </Typography>
                          </Stack>
                        )}
                        <Stack
                          direction="row"
                          spacing={0.75}
                          alignItems="center"
                        >
                          <CalendarMonthRounded
                            sx={{ fontSize: 14, color: "text.secondary" }}
                          />
                          <Typography variant="body2">
                            {fmtDateShort(selectedSession.date)}
                          </Typography>
                        </Stack>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          alignItems="center"
                        >
                          <PeopleRounded
                            sx={{ fontSize: 14, color: "text.secondary" }}
                          />
                          <Typography variant="body2">
                            {enrolledStudents.length} enrolled
                          </Typography>
                        </Stack>
                      </Stack>
                    )}
                  </Box>

                  {/* Attendance stats */}
                  <Box sx={{ p: 2 }}>
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      color="text.secondary"
                      sx={{
                        textTransform: "uppercase",
                        letterSpacing: 0.9,
                        display: "block",
                        mb: 1.25,
                      }}
                    >
                      Attendance
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 40,
                        fontWeight: 800,
                        lineHeight: 1,
                        color: statBarColor,
                      }}
                    >
                      {presentPct}%
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 1.5 }}
                    >
                      students present
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={presentPct}
                      sx={{
                        height: 6,
                        borderRadius: 1,
                        mb: 2,
                        bgcolor: alpha("#0f172a", 0.07),
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 1,
                          bgcolor: statBarColor,
                        },
                      }}
                    />
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      {[
                        { label: "Present", value: presentCount, color: "#10b981" },
                        { label: "Absent", value: absentCount, color: "#ef4444" },
                        { label: "Late", value: lateCount, color: "#f59e0b" },
                        {
                          label: "Unmarked",
                          value: unmarkedCount,
                          color: alpha("#0f172a", 0.35),
                        },
                      ].map(({ label, value, color }) => (
                        <Box
                          key={label}
                          sx={{
                            p: 1,
                            borderRadius: 1.5,
                            bgcolor: alpha(color, 0.08),
                            textAlign: "center",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 22,
                              fontWeight: 800,
                              color,
                              lineHeight: 1.2,
                            }}
                          >
                            {value}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {label}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  <Divider />

                  {/* Actions */}
                  <Box
                    sx={{
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      startIcon={<DownloadRounded />}
                    >
                      Export CSV / PDF
                    </Button>
                    <Button
                      variant="contained"
                      size="medium"
                      fullWidth
                      startIcon={
                        isSaving ? (
                          <CircularProgress size={14} color="inherit" />
                        ) : (
                          <SendRounded />
                        )
                      }
                      disabled={!hasPending || isSaving}
                      onClick={handleSubmit}
                      sx={{ backgroundImage: primaryGradient }}
                    >
                      Submit attendance
                    </Button>
                    {allMarked ? (
                      <Typography
                        variant="caption"
                        color="success.main"
                        textAlign="center"
                      >
                        All students marked — ready to submit
                      </Typography>
                    ) : unmarkedCount > 0 ? (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        textAlign="center"
                      >
                        {unmarkedCount} student
                        {unmarkedCount !== 1 ? "s" : ""} still unmarked
                      </Typography>
                    ) : null}
                  </Box>
                </Paper>
              </Box>
            </Box>
          )}
        </>
      )}

      {/* ── TAB 1: Batch summary ───────────────────────────────────────────── */}
      {activeTab === 1 && selectedBatchId && (
        <BatchSummaryView sessions={sessions} enrollments={enrollments} />
      )}
    </Stack>
  );
}
