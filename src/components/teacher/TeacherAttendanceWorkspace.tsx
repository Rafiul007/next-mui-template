"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import {
  CancelRounded,
  CheckCircleRounded,
  FactCheckRounded,
  HelpOutlineRounded,
  PlayArrowRounded,
  ScheduleRounded,
  SearchRounded,
} from "@mui/icons-material";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
} from "@mui/material";
import { toast } from "react-hot-toast";
import {
  CorrectAttendanceDocument,
  GetAttendanceBySessionDocument,
  GetEnrollmentsByBatchDocument,
  GetSchedulesByBatchDocument,
  GetSessionsByBatchDocument,
  GetStudentsDocument,
  MarkAttendanceDocument,
  StartSessionDocument,
  type GetStudentsQuery,
} from "@/graphql/generated";
import { SummaryCard } from "@/components/ui";
import { getErrorMessage } from "@/lib/errors";
import {
  ATTENDANCE_COLORS,
  dayIndex,
  formatTime,
  useMyBatches,
  type AttendanceStatus,
} from "./teacher-shared";

type StudentRecord = NonNullable<GetStudentsQuery["getStudents"][number]>;
type StatusFilter = "ALL" | AttendanceStatus | "UNMARKED";

const studentName = (s: StudentRecord) =>
  `${s.firstName} ${s.lastName ?? ""}`.trim();

export function TeacherAttendanceWorkspace() {
  const { myBatches, loading: batchesLoading } = useMyBatches();

  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [sessionId, setSessionId] = useState("");
  const [pending, setPending] = useState<Record<string, AttendanceStatus>>({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [startingId, setStartingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const initRef = useRef("");

  // Fall back to the first batch until the teacher picks one.
  const batchId = selectedBatchId || myBatches[0]?.id || "";

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: studentsData } = useQuery(GetStudentsDocument);
  const { data: schedulesData } = useQuery(GetSchedulesByBatchDocument, {
    skip: !batchId,
    variables: { batchId },
  });
  const { data: sessionsData, refetch: refetchSessions } = useQuery(
    GetSessionsByBatchDocument,
    { skip: !batchId, variables: { batchId } },
  );
  const { data: enrollmentsData } = useQuery(GetEnrollmentsByBatchDocument, {
    skip: !batchId,
    variables: { batchId },
  });
  const {
    data: attendanceData,
    loading: attendanceLoading,
    refetch: refetchAttendance,
  } = useQuery(GetAttendanceBySessionDocument, {
    skip: !sessionId,
    variables: { sessionId },
    fetchPolicy: "cache-and-network",
  });

  const [markAttendance] = useMutation(MarkAttendanceDocument);
  const [correctAttendance] = useMutation(CorrectAttendanceDocument);
  const [startSession] = useMutation(StartSessionDocument);

  // ── Derived ──────────────────────────────────────────────────────────────
  const allStudents = (studentsData?.getStudents ?? []).filter(
    (s): s is StudentRecord => !!s,
  );
  const studentLookup = useMemo(
    () => new Map(allStudents.map((s) => [s.id, s])),
    [allStudents],
  );

  const dow = new Date(date + "T00:00:00").getDay();
  const daySchedules = (schedulesData?.getSchedulesByBatch ?? []).filter(
    (s) => s.active && dayIndex(s.dayOfWeek) === dow,
  );
  const sessions = useMemo(
    () => sessionsData?.getSessionsByBatch ?? [],
    [sessionsData],
  );
  const sessionBySchedule = useMemo(() => {
    const map = new Map<string, (typeof sessions)[number]>();
    for (const s of sessions) {
      if (s.recurringScheduleId && s.date === date)
        map.set(s.recurringScheduleId, s);
    }
    return map;
  }, [sessions, date]);

  const enrolledIds = (enrollmentsData?.getEnrollmentsByBatch ?? [])
    .filter((e) => /active|enrolled/i.test(e.status))
    .map((e) => e.studentId);
  const enrolledStudents = useMemo(
    () =>
      enrolledIds
        .map((id) => studentLookup.get(id))
        .filter((s): s is StudentRecord => !!s),
    [enrolledIds, studentLookup],
  );

  const existingMap = useMemo(
    () =>
      new Map(
        (attendanceData?.getAttendanceBySession ?? []).map((a) => [
          a.studentId,
          a,
        ]),
      ),
    [attendanceData],
  );

  // Bulk-first: default unmarked students to PRESENT once a session is open.
  useEffect(() => {
    if (!sessionId || enrolledIds.length === 0 || attendanceLoading) return;
    const key = `${sessionId}::${enrolledIds.join(",")}`;
    if (initRef.current === key) return;
    initRef.current = key;
    const next: Record<string, AttendanceStatus> = {};
    for (const id of enrolledIds) if (!existingMap.has(id)) next[id] = "PRESENT";
    setPending(next);
  }, [sessionId, enrolledIds, attendanceLoading, existingMap]);

  const getStatus = useCallback(
    (id: string): AttendanceStatus | null =>
      pending[id] ?? (existingMap.get(id)?.status as AttendanceStatus) ?? null,
    [pending, existingMap],
  );

  const counts = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let unmarked = 0;
    for (const id of enrolledIds) {
      const s = getStatus(id);
      if (s === "PRESENT") present++;
      else if (s === "ABSENT") absent++;
      else if (s === "LATE") late++;
      else unmarked++;
    }
    return { present, absent, late, unmarked };
  }, [enrolledIds, getStatus]);

  const filteredStudents = useMemo(() => {
    const q = search.toLowerCase();
    return enrolledStudents.filter((s) => {
      const matchSearch =
        !q ||
        studentName(s).toLowerCase().includes(q) ||
        s.studentCode.toLowerCase().includes(q);
      const st = getStatus(s.id);
      const matchFilter =
        filter === "ALL"
          ? true
          : filter === "UNMARKED"
            ? !st
            : st === filter;
      return matchSearch && matchFilter;
    });
  }, [enrolledStudents, search, filter, getStatus]);

  const selectedBatch = myBatches.find((b) => b.id === batchId) ?? null;
  const hasPending = Object.keys(pending).length > 0;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const resetSession = () => {
    setSessionId("");
    setPending({});
    setSearch("");
    setFilter("ALL");
    initRef.current = "";
  };

  const openSession = (id: string) => {
    resetSession();
    setSessionId(id);
  };

  const handleStart = async (scheduleId: string) => {
    setStartingId(scheduleId);
    try {
      const res = await startSession({ variables: { scheduleId, date } });
      if (res.error) throw res.error;
      const created = res.data?.startSession;
      if (created) {
        await refetchSessions();
        openSession(created.id);
        toast.success("Session started — mark attendance below.");
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to start session."));
    } finally {
      setStartingId(null);
    }
  };

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setPending((prev) => {
      const existing = existingMap.get(studentId);
      if (existing?.status === status) {
        const next = { ...prev };
        delete next[studentId];
        return next;
      }
      return { ...prev, [studentId]: status };
    });
  };

  const markAllPresent = () => {
    const next: Record<string, AttendanceStatus> = {};
    for (const id of enrolledIds) next[id] = "PRESENT";
    setPending(next);
  };

  const handleSave = async () => {
    if (!sessionId) return;
    setSaving(true);
    try {
      const toMark: { studentId: string; status: AttendanceStatus }[] = [];
      const toCorrect: { studentId: string; status: AttendanceStatus }[] = [];
      for (const studentId of enrolledIds) {
        const status = pending[studentId];
        if (!status) continue;
        const existing = existingMap.get(studentId);
        if (existing) {
          if (existing.status !== status) toCorrect.push({ studentId, status });
        } else {
          toMark.push({ studentId, status });
        }
      }

      if (toMark.length > 0) {
        const res = await markAttendance({
          variables: {
            entries: toMark.map(({ studentId, status }) => ({
              sessionId,
              studentId,
              status,
            })),
          },
        });
        if (res.error) throw res.error;
      }
      for (const { studentId, status } of toCorrect) {
        const res = await correctAttendance({
          variables: { sessionId, studentId, status },
        });
        if (res.error) throw res.error;
      }

      await refetchAttendance();
      setPending({});
      initRef.current = "";
      const n = toMark.length + toCorrect.length;
      toast.success(`Attendance saved for ${n} student${n === 1 ? "" : "s"}.`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to save attendance."));
    } finally {
      setSaving(false);
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
        <Typography variant="h4" component="h1">
          Attendance
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          Start a class session and mark your students present, absent, or late.
        </Typography>
      </Paper>

      {/* Controls */}
      <Paper
        elevation={0}
        sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <FormControl size="small" sx={{ minWidth: 240 }}>
            <InputLabel>Batch</InputLabel>
            <Select
              label="Batch"
              value={batchId}
              onChange={(e) => {
                setSelectedBatchId(e.target.value);
                resetSession();
              }}
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
          <TextField
            label="Date"
            type="date"
            size="small"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              resetSession();
            }}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 180 }}
          />
        </Stack>
      </Paper>

      {/* Session picker */}
      {batchId ? (
        <Paper
          elevation={0}
          sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            Classes on {dayjs(date).format("dddd, DD MMM YYYY")}
          </Typography>
          {daySchedules.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No classes scheduled for this batch on the selected day.
            </Typography>
          ) : (
            <Stack spacing={1.25}>
              {daySchedules.map((sch) => {
                const existing = sessionBySchedule.get(sch.id);
                const active = existing && existing.id === sessionId;
                return (
                  <Stack
                    key={sch.id}
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{
                      p: 1.75,
                      borderRadius: 1.5,
                      border: "1px solid",
                      borderColor: active ? "primary.main" : "divider",
                      bgcolor: active
                        ? alpha("#2563eb", 0.06)
                        : "transparent",
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={700}>
                        {formatTime(sch.startTime)} – {formatTime(sch.endTime)}
                      </Typography>
                      {sch.roomName ? (
                        <Typography variant="caption" color="text.secondary">
                          Room {sch.roomName}
                        </Typography>
                      ) : null}
                    </Box>
                    {existing ? (
                      <Button
                        size="small"
                        variant={active ? "contained" : "outlined"}
                        startIcon={<FactCheckRounded />}
                        onClick={() => openSession(existing.id)}
                      >
                        {active ? "Marking" : "Mark attendance"}
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={
                          startingId === sch.id ? (
                            <CircularProgress size={14} />
                          ) : (
                            <PlayArrowRounded />
                          )
                        }
                        onClick={() => handleStart(sch.id)}
                        disabled={startingId === sch.id}
                      >
                        Start session
                      </Button>
                    )}
                  </Stack>
                );
              })}
            </Stack>
          )}
        </Paper>
      ) : null}

      {/* Marking grid */}
      {sessionId ? (
        <>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
            }}
          >
            <SummaryCard
              caption="Present"
              title={String(counts.present)}
              tone="success"
              icon={<CheckCircleRounded />}
            />
            <SummaryCard
              caption="Absent"
              title={String(counts.absent)}
              tone="error"
              icon={<CancelRounded />}
            />
            <SummaryCard
              caption="Late"
              title={String(counts.late)}
              tone="warning"
              icon={<ScheduleRounded />}
            />
            <SummaryCard
              caption="Unmarked"
              title={String(counts.unmarked)}
              icon={<HelpOutlineRounded />}
            />
          </Box>

          <Paper
            elevation={0}
            sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ md: "center" }}
              justifyContent="space-between"
              sx={{ mb: 2 }}
            >
              <Typography variant="h6" fontWeight={700}>
                {selectedBatch?.name ?? "Students"}
              </Typography>
              <Stack direction="row" spacing={1.5} flexWrap="wrap">
                <TextField
                  size="small"
                  placeholder="Search students"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRounded fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <Button size="small" variant="outlined" onClick={markAllPresent}>
                  Mark all present
                </Button>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
              {(
                [
                  ["ALL", "All"],
                  ["PRESENT", "Present"],
                  ["ABSENT", "Absent"],
                  ["LATE", "Late"],
                  ["UNMARKED", "Unmarked"],
                ] as [StatusFilter, string][]
              ).map(([key, label]) => (
                <Chip
                  key={key}
                  label={label}
                  size="small"
                  onClick={() => setFilter(key)}
                  color={filter === key ? "primary" : "default"}
                  variant={filter === key ? "filled" : "outlined"}
                />
              ))}
            </Stack>

            {enrolledStudents.length === 0 ? (
              <Alert severity="info">
                No active enrollments found for this batch.
              </Alert>
            ) : (
              <Stack spacing={1}>
                {filteredStudents.map((s) => {
                  const status = getStatus(s.id);
                  return (
                    <Stack
                      key={s.id}
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {studentName(s)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {s.studentCode}
                        </Typography>
                      </Box>
                      <ToggleButtonGroup
                        exclusive
                        size="small"
                        value={status}
                        onChange={(_, v) => v && setStatus(s.id, v)}
                      >
                        {(["PRESENT", "ABSENT", "LATE"] as AttendanceStatus[]).map(
                          (st) => (
                            <ToggleButton
                              key={st}
                              value={st}
                              sx={{
                                px: 1.5,
                                "&.Mui-selected": {
                                  bgcolor: alpha(ATTENDANCE_COLORS[st], 0.16),
                                  color: ATTENDANCE_COLORS[st],
                                  "&:hover": {
                                    bgcolor: alpha(ATTENDANCE_COLORS[st], 0.24),
                                  },
                                },
                              }}
                            >
                              {st.charAt(0) + st.slice(1).toLowerCase()}
                            </ToggleButton>
                          ),
                        )}
                      </ToggleButtonGroup>
                    </Stack>
                  );
                })}
              </Stack>
            )}
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              position: "sticky",
              bottom: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {hasPending
                ? `${Object.keys(pending).length} unsaved change${
                    Object.keys(pending).length === 1 ? "" : "s"
                  }`
                : "All changes saved"}
            </Typography>
            <Button
              variant="contained"
              startIcon={
                saving ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <CheckCircleRounded />
                )
              }
              onClick={handleSave}
              disabled={saving || !hasPending}
            >
              Save attendance
            </Button>
          </Paper>
        </>
      ) : null}
    </Stack>
  );
}
