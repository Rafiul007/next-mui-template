"use client";

import { useState } from "react";
import {
  AddRounded,
  AutoStoriesRounded,
  CalendarMonthRounded,
  ContentCopyRounded,
  EventRounded,
  PersonRounded,
  RepeatRounded,
  RoomRounded,
  ScheduleRounded,
  SwapHorizRounded,
  TimerRounded,
} from "@mui/icons-material";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { toast } from "react-hot-toast";
import type { RhfSelectOption } from "@/components/form";
import { SummaryCard } from "@/components/ui";
import {
  AddOneOffSessionDocument,
  AssignSubstituteDocument,
  CreateRecurringScheduleDocument,
  CreateSubjectDocument,
  GetAllBatchesDocument,
  GetSchedulesByBatchDocument,
  GetSessionsByBatchDocument,
  GetSubjectsByBatchDocument,
  GetUsersDocument,
  type GetSchedulesByBatchQuery,
  type GetSessionsByBatchQuery,
  type GetSubjectsByBatchQuery,
  type GetUsersQuery,
} from "@/graphql/generated";
import { getErrorMessage } from "@/lib/errors";
import { primaryGradient } from "@/theme/theme";
import {
  BatchSubjectFormDialog,
  type BatchSubjectFormValues,
} from "./BatchSubjectFormDialog";
import {
  RecurringScheduleFormDialog,
  type RecurringScheduleFormValues,
} from "./RecurringScheduleFormDialog";
import {
  OneOffSessionFormDialog,
  type OneOffSessionFormValues,
} from "./OneOffSessionFormDialog";
import { SubstituteDialog } from "./SubstituteDialog";

type ScheduleRecord = GetSchedulesByBatchQuery["getSchedulesByBatch"][number];
type SessionRecord = GetSessionsByBatchQuery["getSessionsByBatch"][number];
type SubjectRecord = GetSubjectsByBatchQuery["getSubjectsByBatch"][number];
type UserRecord = NonNullable<GetUsersQuery["getUsers"][number]>;

const DAY_ORDER = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

const SUBJECT_COLORS = [
  { bg: "#eff6ff", fg: "#1d4ed8", border: "#bfdbfe" },
  { bg: "#f0fdf4", fg: "#15803d", border: "#bbf7d0" },
  { bg: "#fefce8", fg: "#a16207", border: "#fef08a" },
  { bg: "#fdf4ff", fg: "#7e22ce", border: "#e9d5ff" },
  { bg: "#fff1f2", fg: "#be123c", border: "#fecdd3" },
  { bg: "#fff7ed", fg: "#c2410c", border: "#fed7aa" },
  { bg: "#f0f9ff", fg: "#0369a1", border: "#bae6fd" },
  { bg: "#f8fafc", fg: "#475569", border: "#e2e8f0" },
];

const subjectColor = (index: number) =>
  SUBJECT_COLORS[index % SUBJECT_COLORS.length];

const formatDay = (day: string) => day.charAt(0) + day.slice(1).toLowerCase();

const formatTime = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const getSessionStatusColor = (
  status: string,
): "default" | "success" | "error" | "warning" => {
  if (/completed/i.test(status)) return "success";
  if (/cancelled/i.test(status)) return "error";
  if (/ongoing/i.test(status)) return "warning";
  return "default";
};

const getSessionTypeColor = (
  type: string,
): "default" | "primary" | "secondary" => {
  if (/extra/i.test(type)) return "primary";
  if (/makeup/i.test(type)) return "secondary";
  return "default";
};

const calcDurationMinutes = (start: string, end: string) => {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const diff =
    eh * 60 + em >= sh * 60 + sm
      ? eh * 60 + em - (sh * 60 + sm)
      : 1440 - (sh * 60 + sm) + (eh * 60 + em);
  return diff;
};

const formatDuration = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

// ── Subject card ──────────────────────────────────────────────────────────────

function SubjectCard({
  subject,
  colorIndex,
}: {
  subject: SubjectRecord;
  colorIndex: number;
}) {
  const { bg, fg, border } = subjectColor(colorIndex);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: "1px solid",
        borderColor: border,
        borderRadius: 2,
        bgcolor: bg,
        transition: "box-shadow 140ms ease",
        "&:hover": { boxShadow: `0 4px 16px ${alpha(fg, 0.14)}` },
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1} minWidth={0}>
            <Typography variant="subtitle1" fontWeight={700} color={fg} noWrap>
              {subject.name}
            </Typography>
            {subject.nameBangla ? (
              <Typography variant="body2" color={alpha(fg, 0.7)} noWrap>
                {subject.nameBangla}
              </Typography>
            ) : null}
          </Box>
          <Chip
            label={subject.active ? "Active" : "Inactive"}
            size="small"
            color={subject.active ? "success" : "default"}
            variant="outlined"
            sx={{ ml: 1, flexShrink: 0 }}
          />
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {subject.code ? (
            <Chip
              label={subject.code}
              size="small"
              sx={{
                fontSize: 11,
                height: 20,
                bgcolor: alpha(fg, 0.08),
                color: fg,
                border: "none",
              }}
            />
          ) : null}
          {subject.classLevel ? (
            <Chip
              label={`Class ${subject.classLevel}`}
              size="small"
              variant="outlined"
              sx={{ fontSize: 11, height: 20 }}
            />
          ) : null}
        </Stack>
      </Stack>
    </Paper>
  );
}

// ── Main Workspace ────────────────────────────────────────────────────────────

const emptyScheduleValues: RecurringScheduleFormValues = {
  dayOfWeek: "",
  startTime: "",
  endTime: "",
  roomName: "",
  teacherId: "",
  subjectId: "",
};

const emptySessionValues: OneOffSessionFormValues = {
  date: "",
  startTime: "",
  endTime: "",
  type: "EXTRA",
  roomName: "",
  teacherId: "",
};

export function ScheduleWorkspace() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedBatchId, setSelectedBatchId] = useState("");

  const [isSubjectFormOpen, setIsSubjectFormOpen] = useState(false);
  const [subjectFormKey, setSubjectFormKey] = useState(0);
  const [subjectFormError, setSubjectFormError] = useState<string | null>(null);

  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false);
  const [isSessionFormOpen, setIsSessionFormOpen] = useState(false);
  const [substituteSession, setSubstituteSession] =
    useState<SessionRecord | null>(null);
  const [scheduleFormKey, setScheduleFormKey] = useState(0);
  const [sessionFormKey, setSessionFormKey] = useState(0);
  const [scheduleFormError, setScheduleFormError] = useState<string | null>(null);
  const [sessionFormError, setSessionFormError] = useState<string | null>(null);
  const [substituteError, setSubstituteError] = useState<string | null>(null);
  const [scheduleFormInitialValues, setScheduleFormInitialValues] =
    useState<RecurringScheduleFormValues>(emptyScheduleValues);

  // Local map: scheduleId → subjectId (UI-only until API adds subjectId to RecurringSchedule)
  const [scheduleSubjectMap, setScheduleSubjectMap] = useState<
    Map<string, string>
  >(new Map());

  const { data: batchesData, loading: isBatchesLoading } = useQuery(
    GetAllBatchesDocument,
  );
  const { data: usersData, loading: isUsersLoading } = useQuery(
    GetUsersDocument,
    { variables: { page: 1, limit: 200 } },
  );
  const {
    data: subjectsData,
    loading: isSubjectsLoading,
    refetch: refetchSubjects,
  } = useQuery(GetSubjectsByBatchDocument, {
    skip: !selectedBatchId,
    variables: { batchId: selectedBatchId },
  });
  const {
    data: schedulesData,
    loading: isSchedulesLoading,
    refetch: refetchSchedules,
  } = useQuery(GetSchedulesByBatchDocument, {
    skip: !selectedBatchId,
    variables: { batchId: selectedBatchId },
  });
  const {
    data: sessionsData,
    loading: isSessionsLoading,
    refetch: refetchSessions,
  } = useQuery(GetSessionsByBatchDocument, {
    skip: !selectedBatchId,
    variables: { batchId: selectedBatchId },
  });

  const [createSubject, createSubjectState] = useMutation(CreateSubjectDocument);
  const [createRecurringSchedule, createScheduleState] = useMutation(
    CreateRecurringScheduleDocument,
  );
  const [addOneOffSession, addSessionState] = useMutation(AddOneOffSessionDocument);
  const [assignSubstitute, assignSubstituteState] = useMutation(
    AssignSubstituteDocument,
  );

  const batches = batchesData?.getAllBatches ?? [];
  const users = (usersData?.getUsers ?? []).filter(
    (u): u is UserRecord => !!u,
  );
  const batchSubjects = subjectsData?.getSubjectsByBatch ?? [];
  const schedules = [...(schedulesData?.getSchedulesByBatch ?? [])].sort(
    (a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek),
  );
  const sessions = [...(sessionsData?.getSessionsByBatch ?? [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const userLookup = new Map(
    users.map((u) => [
      u.id,
      `${u.firstName} ${u.lastName}`.trim() || u.email,
    ]),
  );

  const subjectLookup = new Map(batchSubjects.map((s) => [s.id, s.name]));

  const teacherOptions: RhfSelectOption[] = [
    { label: "Not assigned", value: "" },
    ...users.map((u) => ({
      label: `${u.firstName} ${u.lastName}`.trim() || u.email,
      value: u.id,
    })),
  ];

  const subjectOptions: RhfSelectOption[] = [
    { label: "No subject", value: "" },
    ...batchSubjects.map((s) => ({ label: s.name, value: s.id })),
  ];

  const selectedBatch = batches.find((b) => b.id === selectedBatchId) ?? null;
  const activeSchedules = schedules.filter((s) => s.active);
  const upcomingSessions = sessions.filter((s) => /scheduled/i.test(s.status)).length;
  const isSubmittingSchedule = createScheduleState.loading;
  const isSubmittingSession = addSessionState.loading;
  const isSubmittingSubstitute = assignSubstituteState.loading;

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleBatchChange = (batchId: string) => {
    setSelectedBatchId(batchId);
    setScheduleSubjectMap(new Map());
  };

  const openSubjectForm = () => {
    setSubjectFormError(null);
    setSubjectFormKey((k) => k + 1);
    setIsSubjectFormOpen(true);
  };

  const handleCreateSubject = async (values: BatchSubjectFormValues) => {
    if (!selectedBatchId) return;
    setSubjectFormError(null);
    try {
      const result = await createSubject({
        variables: {
          subject: {
            name: values.name.trim(),
            nameBangla: values.nameBangla?.trim() || undefined,
            code: values.code?.trim() || undefined,
            classLevel: values.classLevel || undefined,
            batchId: selectedBatchId,
          },
        },
      });
      if (result.error) throw result.error;
      toast.success(`Subject "${values.name.trim()}" added to ${selectedBatch?.name}.`);
      setIsSubjectFormOpen(false);
      await refetchSubjects();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to add subject.");
      setSubjectFormError(message);
      toast.error(message);
    }
  };

  const openScheduleForm = (prefill?: RecurringScheduleFormValues) => {
    setScheduleFormError(null);
    setScheduleFormKey((k) => k + 1);
    setScheduleFormInitialValues(prefill ?? emptyScheduleValues);
    setIsScheduleFormOpen(true);
  };

  const openSessionForm = () => {
    setSessionFormError(null);
    setSessionFormKey((k) => k + 1);
    setIsSessionFormOpen(true);
  };

  const openSubstituteDialog = (session: SessionRecord) => {
    setSubstituteError(null);
    setSubstituteSession(session);
  };

  const handleCreateSchedule = async (values: RecurringScheduleFormValues) => {
    if (!selectedBatchId) return;
    setScheduleFormError(null);
    try {
      const result = await createRecurringSchedule({
        variables: {
          schedule: {
            batchId: selectedBatchId,
            dayOfWeek: values.dayOfWeek,
            startTime: values.startTime,
            endTime: values.endTime,
            roomName: values.roomName?.trim() || undefined,
            teacherId: values.teacherId?.trim() || undefined,
          },
        },
      });
      if (result.error) throw result.error;

      // Store subject association locally until API supports subjectId on RecurringSchedule
      const scheduleId = result.data?.createRecurringSchedule?.id;
      if (scheduleId && values.subjectId) {
        setScheduleSubjectMap((prev) =>
          new Map(prev).set(scheduleId, values.subjectId!),
        );
      }

      await refetchSchedules();
      toast.success("Recurring schedule added.");
      setIsScheduleFormOpen(false);
    } catch (error) {
      const message = getErrorMessage(error, "Unable to add schedule.");
      setScheduleFormError(message);
      toast.error(message);
    }
  };

  const handleCreateSession = async (values: OneOffSessionFormValues) => {
    if (!selectedBatchId) return;
    setSessionFormError(null);
    try {
      const result = await addOneOffSession({
        variables: {
          session: {
            batchId: selectedBatchId,
            date: values.date,
            startTime: values.startTime,
            endTime: values.endTime,
            type: values.type,
            roomName: values.roomName?.trim() || undefined,
            teacherId: values.teacherId?.trim() || undefined,
          },
        },
      });
      if (result.error) throw result.error;
      await refetchSessions();
      toast.success("Session added.");
      setIsSessionFormOpen(false);
    } catch (error) {
      const message = getErrorMessage(error, "Unable to add session.");
      setSessionFormError(message);
      toast.error(message);
    }
  };

  const handleAssignSubstitute = async (substituteTeacherId: string) => {
    if (!substituteSession) return;
    setSubstituteError(null);
    try {
      const result = await assignSubstitute({
        variables: { sessionId: substituteSession.id, substituteTeacherId },
      });
      if (result.error) throw result.error;
      await refetchSessions();
      toast.success("Substitute teacher assigned.");
      setSubstituteSession(null);
    } catch (error) {
      const message = getErrorMessage(error, "Unable to assign substitute.");
      setSubstituteError(message);
      toast.error(message);
    }
  };

  // ── Table columns ─────────────────────────────────────────────────────────────

  const scheduleColumns: MRT_ColumnDef<ScheduleRecord>[] = [
    {
      id: "subject",
      header: "Subject",
      size: 150,
      enableSorting: false,
      accessorFn: (row) => {
        const subjectId = scheduleSubjectMap.get(row.id);
        return subjectId ? (subjectLookup.get(subjectId) ?? "—") : "—";
      },
      Cell: ({ row }) => {
        const subjectId = scheduleSubjectMap.get(row.original.id);
        if (!subjectId) {
          return (
            <Typography variant="body2" color="text.disabled">
              —
            </Typography>
          );
        }
        const idx = batchSubjects.findIndex((s) => s.id === subjectId);
        const { fg, bg } = subjectColor(idx >= 0 ? idx : 0);
        return (
          <Chip
            label={subjectLookup.get(subjectId) ?? "—"}
            size="small"
            sx={{ bgcolor: bg, color: fg, fontWeight: 600, fontSize: 12 }}
          />
        );
      },
    },
    {
      accessorKey: "dayOfWeek",
      header: "Day",
      size: 120,
      Cell: ({ cell }) => (
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {formatDay(String(cell.getValue()))}
        </Typography>
      ),
    },
    {
      id: "time",
      accessorFn: (row) => `${row.startTime} – ${row.endTime}`,
      header: "Time",
      size: 170,
      Cell: ({ row }) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <ScheduleRounded sx={{ fontSize: 16, color: "text.secondary" }} />
          <Typography variant="body2">
            {formatTime(row.original.startTime)} –{" "}
            {formatTime(row.original.endTime)}
          </Typography>
        </Stack>
      ),
    },
    {
      id: "duration",
      header: "Duration",
      size: 110,
      enableSorting: false,
      accessorFn: (row) =>
        formatDuration(calcDurationMinutes(row.startTime, row.endTime)),
      Cell: ({ cell }) => (
        <Stack direction="row" spacing={0.75} alignItems="center">
          <TimerRounded sx={{ fontSize: 15, color: "text.secondary" }} />
          <Chip
            label={String(cell.getValue())}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: "0.75rem" }}
          />
        </Stack>
      ),
    },
    {
      accessorKey: "roomName",
      header: "Room",
      size: 130,
      Cell: ({ row }) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <RoomRounded sx={{ fontSize: 16, color: "text.secondary" }} />
          <Typography
            variant="body2"
            color={row.original.roomName ? "text.primary" : "text.disabled"}
          >
            {row.original.roomName || "Not set"}
          </Typography>
        </Stack>
      ),
    },
    {
      id: "teacher",
      accessorFn: (row) =>
        row.teacherId ? (userLookup.get(row.teacherId) ?? "Unknown") : "—",
      header: "Teacher",
      size: 180,
      Cell: ({ row, cell }) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <PersonRounded sx={{ fontSize: 16, color: "text.secondary" }} />
          <Typography
            variant="body2"
            color={!row.original.teacherId ? "text.disabled" : undefined}
          >
            {String(cell.getValue())}
          </Typography>
        </Stack>
      ),
    },
    {
      id: "linkedSessions",
      header: "Sessions",
      size: 100,
      enableSorting: false,
      accessorFn: (row) =>
        sessions.filter((s) => s.recurringScheduleId === row.id).length,
      Cell: ({ cell }) => {
        const count = cell.getValue() as number;
        return (
          <Chip
            label={`${count} session${count !== 1 ? "s" : ""}`}
            size="small"
            color={count > 0 ? "primary" : "default"}
            variant="outlined"
            sx={{ fontSize: "0.72rem" }}
          />
        );
      },
    },
    {
      accessorKey: "active",
      header: "Status",
      size: 100,
      Cell: ({ cell }) => (
        <Chip
          label={cell.getValue() ? "Active" : "Inactive"}
          color={cell.getValue() ? "success" : "default"}
          variant={cell.getValue() ? "filled" : "outlined"}
          size="small"
        />
      ),
    },
    {
      id: "scheduleActions",
      header: "Actions",
      size: 90,
      enableSorting: false,
      Cell: ({ row }) => {
        const subjectId = scheduleSubjectMap.get(row.original.id);
        return (
          <Tooltip title="Duplicate schedule">
            <IconButton
              size="small"
              onClick={() =>
                openScheduleForm({
                  dayOfWeek: row.original.dayOfWeek,
                  startTime: row.original.startTime,
                  endTime: row.original.endTime,
                  roomName: row.original.roomName ?? "",
                  teacherId: row.original.teacherId ?? "",
                  subjectId: subjectId ?? "",
                })
              }
              sx={{ bgcolor: alpha("#0f172a", 0.04) }}
            >
              <ContentCopyRounded fontSize="small" />
            </IconButton>
          </Tooltip>
        );
      },
    },
  ];

  const sessionColumns: MRT_ColumnDef<SessionRecord>[] = [
    {
      accessorKey: "date",
      header: "Date",
      size: 140,
      Cell: ({ cell }) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <CalendarMonthRounded sx={{ fontSize: 16, color: "text.secondary" }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {formatDate(String(cell.getValue()))}
          </Typography>
        </Stack>
      ),
    },
    {
      id: "time",
      accessorFn: (row) => `${row.startTime} – ${row.endTime}`,
      header: "Time",
      size: 160,
      Cell: ({ row }) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <ScheduleRounded sx={{ fontSize: 16, color: "text.secondary" }} />
          <Typography variant="body2">
            {formatTime(row.original.startTime)} –{" "}
            {formatTime(row.original.endTime)}
          </Typography>
        </Stack>
      ),
    },
    {
      id: "subject",
      header: "Subject",
      size: 140,
      enableSorting: false,
      accessorFn: (row) => {
        if (!row.recurringScheduleId) return "—";
        const subjectId = scheduleSubjectMap.get(row.recurringScheduleId);
        return subjectId ? (subjectLookup.get(subjectId) ?? "—") : "—";
      },
      Cell: ({ row }) => {
        const subjectId = row.original.recurringScheduleId
          ? scheduleSubjectMap.get(row.original.recurringScheduleId)
          : undefined;
        if (!subjectId) {
          return (
            <Typography variant="body2" color="text.disabled">
              —
            </Typography>
          );
        }
        const idx = batchSubjects.findIndex((s) => s.id === subjectId);
        const { fg, bg } = subjectColor(idx >= 0 ? idx : 0);
        return (
          <Chip
            label={subjectLookup.get(subjectId) ?? "—"}
            size="small"
            sx={{ bgcolor: bg, color: fg, fontWeight: 600, fontSize: 12 }}
          />
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      size: 120,
      Cell: ({ cell }) => (
        <Chip
          label={String(cell.getValue())}
          color={getSessionTypeColor(String(cell.getValue()))}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 120,
      Cell: ({ cell }) => (
        <Chip
          label={String(cell.getValue())}
          color={getSessionStatusColor(String(cell.getValue()))}
          size="small"
        />
      ),
    },
    {
      accessorKey: "roomName",
      header: "Room",
      size: 130,
      Cell: ({ row }) => (
        <Typography variant="body2">{row.original.roomName || "—"}</Typography>
      ),
    },
    {
      id: "teacher",
      accessorFn: (row) =>
        row.teacherId ? (userLookup.get(row.teacherId) ?? "Unknown") : "—",
      header: "Teacher",
      size: 180,
      Cell: ({ row, cell }) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <PersonRounded sx={{ fontSize: 16, color: "text.secondary" }} />
          <Typography
            variant="body2"
            color={!row.original.teacherId ? "text.disabled" : undefined}
          >
            {String(cell.getValue())}
          </Typography>
        </Stack>
      ),
    },
    {
      id: "substitute",
      header: "Substitute",
      size: 180,
      Cell: ({ row }) => {
        const name = row.original.substituteTeacherId
          ? (userLookup.get(row.original.substituteTeacherId) ?? "Unknown")
          : null;
        return name ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <SwapHorizRounded sx={{ fontSize: 15, color: "text.secondary" }} />
            <Typography variant="body2">{name}</Typography>
          </Stack>
        ) : (
          <Typography variant="body2" color="text.disabled">
            —
          </Typography>
        );
      },
    },
    {
      id: "sessionActions",
      header: "Actions",
      size: 90,
      enableSorting: false,
      Cell: ({ row }) => (
        <Tooltip
          title={
            row.original.substituteTeacherId
              ? "Substitute already assigned"
              : "Assign substitute teacher"
          }
        >
          <span>
            <IconButton
              size="small"
              disabled={!!row.original.substituteTeacherId}
              onClick={() => openSubstituteDialog(row.original)}
              sx={{ bgcolor: alpha("#0f172a", 0.04) }}
            >
              <SwapHorizRounded fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      ),
    },
  ];

  const sharedTableProps = {
    muiBottomToolbarProps: {
      sx: { borderTop: "1px solid", borderColor: alpha("#0f172a", 0.08), bgcolor: "#ffffff" },
    },
    muiTableBodyRowProps: {
      sx: {
        bgcolor: "#ffffff",
        transition: "background-color 140ms ease",
        "&:hover td": { bgcolor: alpha("#ecfdf5", 0.9) },
      },
    },
    muiTableBodyCellProps: {
      sx: {
        bgcolor: "#ffffff",
        borderBottom: "1px solid",
        borderColor: alpha("#0f172a", 0.06),
        py: 2.25,
      },
    },
    muiTableContainerProps: { sx: { maxHeight: 520, bgcolor: "#ffffff" } },
    muiTableHeadCellProps: {
      sx: {
        bgcolor: "#ffffff",
        color: alpha("#0f172a", 0.72),
        fontSize: 13,
        fontWeight: 700,
        py: 1.75,
        borderBottom: "1px solid",
        borderColor: alpha("#0f172a", 0.08),
        "& .MuiInputBase-root": { bgcolor: alpha("#f8fafc", 0.92), borderRadius: 2 },
      },
    },
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        border: "1px solid",
        borderColor: alpha("#0f172a", 0.08),
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "#ffffff",
        boxShadow: `0 16px 40px ${alpha("#0f172a", 0.06)}`,
      },
    },
    muiTopToolbarProps: {
      sx: {
        px: 2.5,
        py: 1.75,
        bgcolor: "#ffffff",
        borderBottom: "1px solid",
        borderColor: alpha("#0f172a", 0.08),
      },
    },
  } as const;

  const noBatchSelected = !selectedBatchId;

  const addButtonLabel =
    activeTab === 0 ? "Add Subject" : activeTab === 1 ? "Add Schedule" : "Add Session";

  const handleAddButtonClick = () => {
    if (activeTab === 0) openSubjectForm();
    else if (activeTab === 1) openScheduleForm();
    else openSessionForm();
  };

  return (
    <>
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
          <Stack
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            spacing={3}
          >
            <Box sx={{ maxWidth: 760 }}>
              <Typography variant="h4" component="h1" sx={{ mt: 0.5 }}>
                Class Schedule
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Manage subjects, recurring weekly schedules, and one-off sessions
                per batch.
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                alignItems: "flex-start",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: { xs: "stretch", lg: "flex-end" },
              }}
            >
              <Button
                variant="contained"
                startIcon={<AddRounded />}
                disabled={noBatchSelected}
                onClick={handleAddButtonClick}
                sx={{ backgroundImage: primaryGradient, minWidth: 200 }}
              >
                {addButtonLabel}
              </Button>
            </Box>
          </Stack>
        </Paper>

        {/* Batch selector */}
        <Paper
          elevation={0}
          sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}
        >
          <FormControl fullWidth size="small" sx={{ maxWidth: 420 }}>
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
        </Paper>

        {selectedBatchId ? (
          <>
            {/* Summary cards */}
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
                caption="Subjects"
                title={isSubjectsLoading ? "…" : String(batchSubjects.length)}
                icon={<AutoStoriesRounded />}
                tone="success"
              />
              <SummaryCard
                caption="Recurring Schedules"
                title={String(activeSchedules.length)}
                icon={<RepeatRounded />}
              />
              <SummaryCard
                caption="Total Sessions"
                title={String(sessions.length)}
                icon={<EventRounded />}
              />
              <SummaryCard
                caption="Upcoming"
                title={String(upcomingSessions)}
                icon={<CalendarMonthRounded />}
              />
            </Box>

            {/* Tabs */}
            <Box>
              <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
              >
                <Tab
                  label={`Subjects (${batchSubjects.length})`}
                  icon={<AutoStoriesRounded sx={{ fontSize: 16 }} />}
                  iconPosition="start"
                />
                <Tab label="Recurring Schedules" />
                <Tab label="Sessions" />
              </Tabs>

              {/* Subjects tab */}
              {activeTab === 0 && (
                <>
                  {isSubjectsLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                      <CircularProgress size={28} />
                    </Box>
                  ) : batchSubjects.length === 0 ? (
                    <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 3, md: 6 },
                        border: "1px solid",
                        borderColor: "divider",
                        textAlign: "center",
                      }}
                    >
                      <AutoStoriesRounded
                        sx={{ fontSize: 48, color: "text.disabled", mb: 2 }}
                      />
                      <Typography variant="h6">No subjects yet</Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1, mb: 3 }}
                      >
                        Add subjects like Physics, Chemistry, Mathematics to{" "}
                        <strong>{selectedBatch?.name}</strong>. Each recurring schedule
                        can then be linked to a subject.
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddRounded />}
                        onClick={openSubjectForm}
                        sx={{ backgroundImage: primaryGradient }}
                      >
                        Add first subject
                      </Button>
                    </Paper>
                  ) : (
                    <>
                      <Alert severity="info" sx={{ mb: 2, fontSize: 13 }}>
                        These subjects belong to <strong>{selectedBatch?.name}</strong>.
                        When creating a recurring schedule, you can select which subject it
                        covers.
                      </Alert>
                      <Box
                        sx={{
                          display: "grid",
                          gap: 2,
                          gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, minmax(0,1fr))",
                            md: "repeat(3, minmax(0,1fr))",
                            xl: "repeat(4, minmax(0,1fr))",
                          },
                        }}
                      >
                        {batchSubjects.map((subject, index) => (
                          <SubjectCard
                            key={subject.id}
                            subject={subject}
                            colorIndex={index}
                          />
                        ))}
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2.5,
                            border: "2px dashed",
                            borderColor: alpha("#0f172a", 0.12),
                            borderRadius: 2,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                            cursor: "pointer",
                            minHeight: 90,
                            transition: "border-color 140ms ease",
                            "&:hover": { borderColor: "primary.main" },
                          }}
                          onClick={openSubjectForm}
                        >
                          <AddRounded sx={{ color: "text.disabled", fontSize: 28 }} />
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            fontWeight={600}
                          >
                            Add subject
                          </Typography>
                        </Paper>
                      </Box>
                    </>
                  )}
                </>
              )}

              {/* Recurring schedules tab */}
              {activeTab === 1 && (
                <MaterialReactTable
                  columns={scheduleColumns}
                  data={schedules}
                  enableColumnFilters={false}
                  enableDensityToggle={false}
                  enableFullScreenToggle={false}
                  enableHiding={false}
                  enableSorting
                  enableStickyHeader
                  getRowId={(row) => row.id}
                  initialState={{ pagination: { pageIndex: 0, pageSize: 10 } }}
                  localization={{ noRecordsToDisplay: "No recurring schedules yet" }}
                  muiSearchTextFieldProps={{
                    placeholder: "Search schedules",
                    size: "small",
                  }}
                  renderEmptyRowsFallback={() => (
                    <Box sx={{ px: 3, py: 5, textAlign: "center" }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        No recurring schedules
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Add a weekly schedule slot for this batch.
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<AddRounded />}
                        onClick={() => openScheduleForm()}
                        sx={{ mt: 2 }}
                      >
                        Add schedule
                      </Button>
                    </Box>
                  )}
                  renderTopToolbarCustomActions={() => (
                    <Typography variant="body2" color="text.secondary">
                      {schedules.length} schedule{schedules.length === 1 ? "" : "s"}{" "}
                      · {activeSchedules.length} active
                    </Typography>
                  )}
                  state={{
                    isLoading: isSchedulesLoading || isUsersLoading,
                    showProgressBars: isSchedulesLoading,
                  }}
                  {...sharedTableProps}
                />
              )}

              {/* Sessions tab */}
              {activeTab === 2 && (
                <MaterialReactTable
                  columns={sessionColumns}
                  data={sessions}
                  enableColumnFilters={false}
                  enableDensityToggle={false}
                  enableFullScreenToggle={false}
                  enableHiding={false}
                  enableSorting
                  enableStickyHeader
                  getRowId={(row) => row.id}
                  initialState={{ pagination: { pageIndex: 0, pageSize: 10 } }}
                  localization={{ noRecordsToDisplay: "No sessions yet" }}
                  muiSearchTextFieldProps={{
                    placeholder: "Search sessions",
                    size: "small",
                  }}
                  renderEmptyRowsFallback={() => (
                    <Box sx={{ px: 3, py: 5, textAlign: "center" }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        No sessions yet
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Add a one-off session for a special class.
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<AddRounded />}
                        onClick={openSessionForm}
                        sx={{ mt: 2 }}
                      >
                        Add session
                      </Button>
                    </Box>
                  )}
                  renderTopToolbarCustomActions={() => (
                    <Typography variant="body2" color="text.secondary">
                      {sessions.length} session{sessions.length === 1 ? "" : "s"}
                    </Typography>
                  )}
                  state={{
                    isLoading: isSessionsLoading || isUsersLoading,
                    showProgressBars: isSessionsLoading,
                  }}
                  {...sharedTableProps}
                />
              )}
            </Box>
          </>
        ) : (
          <Paper
            elevation={0}
            sx={{ p: { xs: 3, md: 4 }, border: "1px solid", borderColor: "divider" }}
          >
            <Stack spacing={1.5} alignItems="flex-start">
              <Typography variant="h6">Select a batch to begin</Typography>
              <Typography variant="body2" color="text.secondary">
                Choose a batch above to manage its subjects, weekly schedule, and
                sessions.
              </Typography>
            </Stack>
          </Paper>
        )}
      </Stack>

      {/* Dialogs */}
      {selectedBatch ? (
        <>
          <BatchSubjectFormDialog
            key={`subject-${subjectFormKey}`}
            batchName={selectedBatch.name}
            errorMessage={subjectFormError}
            isSubmitting={createSubjectState.loading}
            open={isSubjectFormOpen}
            onClose={() => {
              setIsSubjectFormOpen(false);
              setSubjectFormError(null);
            }}
            onSubmit={handleCreateSubject}
          />

          <RecurringScheduleFormDialog
            key={`schedule-${scheduleFormKey}`}
            batchName={selectedBatch.name}
            errorMessage={scheduleFormError}
            initialValues={scheduleFormInitialValues}
            isSubmitting={isSubmittingSchedule}
            teacherOptions={teacherOptions}
            subjectOptions={subjectOptions}
            onClose={() => {
              if (!isSubmittingSchedule) {
                setIsScheduleFormOpen(false);
                setScheduleFormError(null);
              }
            }}
            onSubmit={handleCreateSchedule}
            open={isScheduleFormOpen}
          />

          <OneOffSessionFormDialog
            key={`session-${sessionFormKey}`}
            batchName={selectedBatch.name}
            errorMessage={sessionFormError}
            initialValues={emptySessionValues}
            isSubmitting={isSubmittingSession}
            teacherOptions={teacherOptions}
            onClose={() => {
              if (!isSubmittingSession) {
                setIsSessionFormOpen(false);
                setSessionFormError(null);
              }
            }}
            onSubmit={handleCreateSession}
            open={isSessionFormOpen}
          />
        </>
      ) : null}

      {substituteSession ? (
        <SubstituteDialog
          errorMessage={substituteError}
          isSubmitting={isSubmittingSubstitute}
          sessionDate={formatDate(substituteSession.date)}
          sessionTime={`${formatTime(substituteSession.startTime)} – ${formatTime(substituteSession.endTime)}`}
          teacherOptions={teacherOptions.filter((o) => o.value !== "")}
          onClose={() => {
            if (!isSubmittingSubstitute) {
              setSubstituteSession(null);
              setSubstituteError(null);
            }
          }}
          onSubmit={handleAssignSubstitute}
          open={!!substituteSession}
        />
      ) : null}
    </>
  );
}
