"use client";

import "react-big-calendar/lib/css/react-big-calendar.css";

import { CalendarMonthRounded } from "@mui/icons-material";
import {
  Box,
  CircularProgress,
  GlobalStyles,
  Paper,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { useQuery } from "@apollo/client/react";
import { Calendar, dateFnsLocalizer, type Event } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, setHours, setMinutes, addDays } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { MyEnrollmentsDocument } from "@/graphql/student-portal";
import { GetMyRoutineDocument } from "@/graphql/generated";

// ── localizer ────────────────────────────────────────────────────────────────

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), // week starts Monday
  getDay,
  locales: { "en-US": enUS },
});

// ── day mapping ───────────────────────────────────────────────────────────────

const DAY_OFFSET: Record<string, number> = {
  MONDAY: 0, TUESDAY: 1, WEDNESDAY: 2, THURSDAY: 3,
  FRIDAY: 4, SATURDAY: 5, SUNDAY: 6,
};

// Convert a recurring slot to a concrete Date event in the current week
function slotToEvent(slot: {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  roomName?: string | null;
  subjectName?: string | null;
}): Event & { resource: { room?: string | null } } {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const base = addDays(weekStart, DAY_OFFSET[slot.dayOfWeek] ?? 0);

  const [sh, sm] = slot.startTime.split(":").map(Number);
  const [eh, em] = slot.endTime.split(":").map(Number);

  return {
    title: slot.subjectName ?? "Class",
    start: setMinutes(setHours(base, sh), sm),
    end:   setMinutes(setHours(base, eh), em),
    resource: { room: slot.roomName },
  };
}

// ── MUI theme overrides for react-big-calendar ────────────────────────────────

const calendarStyles = (
  <GlobalStyles
    styles={{
      ".rbc-calendar": { fontFamily: "inherit", background: "transparent" },
      ".rbc-toolbar": { marginBottom: 16, flexWrap: "wrap", gap: 8 },
      ".rbc-toolbar button": {
        borderRadius: 8,
        border: "1px solid rgba(148,163,184,0.3)",
        padding: "6px 14px",
        fontSize: 13,
        fontWeight: 600,
        color: "#334155",
        background: "#fff",
        cursor: "pointer",
        transition: "all 0.15s",
      },
      ".rbc-toolbar button:hover": { background: alpha("#10b981", 0.08), borderColor: "#10b981", color: "#065f46" },
      ".rbc-toolbar button.rbc-active": {
        background: alpha("#10b981", 0.12),
        borderColor: "#10b981",
        color: "#065f46",
        boxShadow: "none",
      },
      ".rbc-toolbar .rbc-toolbar-label": { fontWeight: 700, fontSize: 16, color: "#0f172a" },
      ".rbc-header": {
        padding: "10px 4px",
        fontWeight: 700,
        fontSize: 12,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: "#64748b",
        borderBottom: "1px solid rgba(148,163,184,0.2)",
        borderLeft: "none",
      },
      ".rbc-today .rbc-header": { color: "#059669" },
      ".rbc-today": { background: alpha("#10b981", 0.04) },
      ".rbc-time-view, .rbc-month-view": {
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid rgba(148,163,184,0.2)",
      },
      ".rbc-time-header": { borderBottom: "1px solid rgba(148,163,184,0.2)" },
      ".rbc-time-content": { borderTop: "none" },
      ".rbc-timeslot-group": { borderBottom: "1px solid rgba(148,163,184,0.08)" },
      ".rbc-time-slot": { borderTop: "none" },
      ".rbc-day-slot .rbc-time-slot": { borderTop: "1px solid rgba(148,163,184,0.05)" },
      ".rbc-time-gutter .rbc-timeslot-group": {
        borderBottom: "1px solid rgba(148,163,184,0.08)",
        fontSize: 11,
        color: "#94a3b8",
        paddingRight: 8,
      },
      ".rbc-label": { fontSize: 11, color: "#94a3b8", fontVariantNumeric: "tabular-nums" },
      ".rbc-event": {
        borderRadius: 8,
        border: "1.5px solid #10b981 !important",
        background: alpha("#10b981", 0.15),
        color: "#065f46",
        fontSize: 12,
        fontWeight: 600,
        padding: "3px 6px",
        boxShadow: "none",
      },
      ".rbc-event:hover": { background: alpha("#10b981", 0.25), boxShadow: `0 2px 8px ${alpha("#10b981", 0.25)}` },
      ".rbc-event.rbc-selected": { background: alpha("#10b981", 0.3), outline: `2px solid #10b981` },
      ".rbc-event-label": { fontSize: 10, opacity: 0.85, fontWeight: 400 },
      ".rbc-event-content": { lineHeight: 1.3 },
      ".rbc-show-more": { color: "#10b981", fontWeight: 600, fontSize: 11 },
      ".rbc-current-time-indicator": { background: "#ef4444", height: 2 },
      ".rbc-day-slot .rbc-events-container": { marginRight: 4 },
      ".rbc-off-range-bg": { background: "rgba(241,245,249,0.5)" },
    }}
  />
);

// ── EventComponent — shows room below subject ─────────────────────────────────

function EventBlock({ event }: { event: Event & { resource?: { room?: string | null } } }) {
  return (
    <Box sx={{ lineHeight: 1.3 }}>
      <Typography sx={{ fontSize: 11, fontWeight: 700, lineHeight: 1.2 }}>
        {String(event.title)}
      </Typography>
      {event.resource?.room && (
        <Typography sx={{ fontSize: 10, opacity: 0.75, lineHeight: 1.2 }}>
          {event.resource.room}
        </Typography>
      )}
    </Box>
  );
}

// ── BatchCalendar ─────────────────────────────────────────────────────────────

function BatchCalendar({ batchId }: { batchId: string }) {
  const { data, loading } = useQuery(GetMyRoutineDocument, { variables: { batchId } });

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  const slots = data?.myRoutine ?? [];
  const events = slots.map(slotToEvent);

  // Determine min/max hours from actual schedule data
  const times = slots.flatMap((s) => [parseInt(s.startTime), parseInt(s.endTime)]);
  const minHour = times.length ? Math.max(0, Math.min(...times) - 1) : 7;
  const maxHour = times.length ? Math.min(24, Math.max(...times) + 1) : 21;

  return (
    <Box sx={{ height: 620, bgcolor: "background.paper", borderRadius: 2, p: 1 }}>
      {calendarStyles}
      <Calendar
        localizer={localizer}
        events={events}
        defaultView="week"
        views={["week"]}
        step={30}
        timeslots={2}
        min={setMinutes(setHours(new Date(), minHour), 0)}
        max={setMinutes(setHours(new Date(), maxHour), 0)}
        toolbar={false}
        components={{
          event: EventBlock as any,
        }}
        style={{ height: "100%" }}
      />
    </Box>
  );
}

// ── ScheduleWorkspace ─────────────────────────────────────────────────────────

export function ScheduleWorkspace() {
  const { data: enrollmentsData, loading: enrollmentsLoading } = useQuery(MyEnrollmentsDocument);

  const activeEnrollments = (enrollmentsData?.myEnrollments ?? []).filter(
    (e) => e.status === "ACTIVE",
  );

  return (
    <Stack spacing={3}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          border: "1px solid",
          borderColor: "divider",
          background: "linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(240,253,250,0.98) 100%)",
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <CalendarMonthRounded sx={{ color: "primary.main" }} />
          <Box>
            <Typography variant="h4" component="h1">My Schedule</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Weekly class timetable
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {enrollmentsLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : activeEnrollments.length === 0 ? (
        <Paper
          elevation={0}
          sx={{ p: 6, textAlign: "center", border: "1px dashed", borderColor: "divider" }}
        >
          <CalendarMonthRounded sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }} />
          <Typography variant="h6" color="text.secondary">No active enrollments</Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
            Enroll in a batch to see your timetable.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={4}>
          {activeEnrollments.map((enrollment) => (
            <BatchCalendar key={enrollment.id} batchId={enrollment.batchId} />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
