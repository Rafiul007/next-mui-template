"use client";

import { useState } from "react";
import {
  CalendarMonthRounded,
  DateRangeRounded,
  DownloadRounded,
  PersonRounded,
  RoomRounded,
  ScheduleRounded,
} from "@mui/icons-material";
import { useQuery } from "@apollo/client/react";
import {
  Box,
  Chip,
  Divider,
  GlobalStyles,
  Paper,
  Stack,
  Button,
  Typography,
  alpha,
} from "@mui/material";
import {
  GetAllBatchesDocument,
  GetSchedulesByBatchDocument,
  GetUsersDocument,
  type GetSchedulesByBatchQuery,
  type GetUsersQuery,
} from "@/graphql/generated";
import { SearchSelect } from "@/components/form";
import { batchSearchOptions } from "@/lib/search-options";
import { SummaryCard } from "@/components/ui";
import { primaryGradient } from "@/theme/theme";

type ScheduleRecord = GetSchedulesByBatchQuery["getSchedulesByBatch"][number];
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

const DAY_LABELS: Record<string, string> = {
  SUNDAY: "Sunday",
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
};

const DAY_SHORT: Record<string, string> = {
  SUNDAY: "SUN",
  MONDAY: "MON",
  TUESDAY: "TUE",
  WEDNESDAY: "WED",
  THURSDAY: "THU",
  FRIDAY: "FRI",
  SATURDAY: "SAT",
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

const formatTime = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
};

const calcDurationMinutes = (start: string, end: string) => {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;
  const diff = endMins >= startMins ? endMins - startMins : 1440 - startMins + endMins;
  return diff;
};

const formatDuration = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

function DayCard({
  schedule,
  teacher,
  hasClass,
}: {
  schedule?: ScheduleRecord;
  teacher?: string | null;
  hasClass: boolean;
  day: string;
}) {
  if (!hasClass || !schedule) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
          px: 2,
          bgcolor: alpha("#0f172a", 0.02),
          borderColor: "divider",
          minHeight: 180,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: alpha("#0f172a", 0.25),
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          {DAY_SHORT[schedule?.dayOfWeek ?? "SUNDAY"]}
        </Typography>
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ mt: 1.5, fontSize: "0.7rem" }}
        >
          No Class
        </Typography>
      </Box>
    );
  }

  const duration = calcDurationMinutes(schedule.startTime, schedule.endTime);
  const accent = DAY_ACCENT[schedule.dayOfWeek] ?? "#10b981";
  const bg = DAY_BG[schedule.dayOfWeek] ?? "#f0fdf4";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        bgcolor: bg,
        minHeight: 180,
        position: "relative",
      }}
    >
      {/* Day header */}
      <Box
        sx={{
          px: 2.5,
          pt: 2.5,
          pb: 1.5,
          borderBottom: "1px solid",
          borderColor: alpha(accent, 0.15),
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 800,
            color: accent,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            display: "block",
          }}
        >
          {DAY_SHORT[schedule.dayOfWeek]}
        </Typography>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: alpha("#0f172a", 0.7), mt: 0.25 }}
        >
          {DAY_LABELS[schedule.dayOfWeek]}
        </Typography>
      </Box>

      {/* Class details */}
      <Stack spacing={1.25} sx={{ px: 2.5, py: 2, flex: 1 }}>
        {/* Time */}
        <Stack direction="row" spacing={1} alignItems="center">
          <ScheduleRounded sx={{ fontSize: 15, color: accent, flexShrink: 0 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
              {formatTime(schedule.startTime)}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ lineHeight: 1.3 }}
            >
              – {formatTime(schedule.endTime)}
            </Typography>
          </Box>
        </Stack>

        {/* Duration chip */}
        <Box>
          <Chip
            label={formatDuration(duration)}
            size="small"
            sx={{
              bgcolor: alpha(accent, 0.1),
              color: accent,
              fontWeight: 700,
              fontSize: "0.7rem",
              height: 20,
            }}
          />
        </Box>

        <Divider sx={{ borderColor: alpha(accent, 0.12) }} />

        {/* Room */}
        <Stack direction="row" spacing={1} alignItems="center">
          <RoomRounded sx={{ fontSize: 14, color: "text.secondary", flexShrink: 0 }} />
          <Typography
            variant="caption"
            color={schedule.roomName ? "text.primary" : "text.disabled"}
            sx={{ fontWeight: schedule.roomName ? 600 : 400 }}
          >
            {schedule.roomName ? `Room ${schedule.roomName}` : "Room not set"}
          </Typography>
        </Stack>

        {/* Teacher */}
        <Stack direction="row" spacing={1} alignItems="center">
          <PersonRounded sx={{ fontSize: 14, color: "text.secondary", flexShrink: 0 }} />
          <Typography
            variant="caption"
            color={teacher ? "text.primary" : "text.disabled"}
            sx={{ fontWeight: teacher ? 600 : 400 }}
          >
            {teacher ?? "Not assigned"}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

export function ClassRoutineWorkspace() {
  const [selectedBatchId, setSelectedBatchId] = useState("");

  const { data: batchesData, loading: isBatchesLoading } = useQuery(
    GetAllBatchesDocument,
  );
  const { data: usersData } = useQuery(GetUsersDocument, {
    variables: { page: 1, limit: 200 },
  });
  const { data: schedulesData, loading: isSchedulesLoading } = useQuery(
    GetSchedulesByBatchDocument,
    {
      skip: !selectedBatchId,
      variables: { batchId: selectedBatchId },
    },
  );

  const batches = batchesData?.getAllBatches ?? [];
  const users = (usersData?.getUsers ?? []).filter(
    (u): u is UserRecord => !!u,
  );

  const activeSchedules = [...(schedulesData?.getSchedulesByBatch ?? [])]
    .filter((s) => s.active)
    .sort(
      (a, b) =>
        DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek),
    );

  const userLookup = new Map(
    users.map((u) => [
      u.id,
      `${u.firstName} ${u.lastName}`.trim() || u.email,
    ]),
  );

  const selectedBatch = batches.find((b) => b.id === selectedBatchId) ?? null;

  const scheduleByDay = new Map<string, ScheduleRecord>(
    activeSchedules.map((s) => [s.dayOfWeek, s]),
  );

  const classDaysCount = activeSchedules.length;
  const totalWeeklyMinutes = activeSchedules.reduce(
    (sum, s) => sum + calcDurationMinutes(s.startTime, s.endTime),
    0,
  );

  const activeDays = DAY_ORDER.filter((d) => scheduleByDay.has(d));

  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <>
      <GlobalStyles
        styles={{
          "@media print": {
            "body > *": { display: "none !important" },
            "#routine-print-area": {
              display: "block !important",
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              padding: "24px",
            },
            "#routine-print-area *": { display: "revert" },
          },
        }}
      />

      <Stack spacing={3}>
        {/* Page header */}
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
            <Box>
              <Typography variant="h4" component="h1" sx={{ mt: 0.5 }}>
                Class Routine
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2 }}
              >
                Weekly class timetable for a selected batch. Download as PDF for
                printing.
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                alignItems: "flex-start",
                flexShrink: 0,
              }}
            >
              <Button
                variant="contained"
                startIcon={<DownloadRounded />}
                disabled={!selectedBatchId || classDaysCount === 0}
                onClick={handleDownloadPdf}
                sx={{ backgroundImage: primaryGradient, minWidth: 180 }}
              >
                Download PDF
              </Button>
            </Box>
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
            onChange={setSelectedBatchId}
            loading={isBatchesLoading}
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
                caption="Class Days / Week"
                title={String(classDaysCount)}
                icon={<CalendarMonthRounded />}
                tone="success"
              />
              <SummaryCard
                caption="Total Weekly Hours"
                title={
                  totalWeeklyMinutes > 0
                    ? formatDuration(totalWeeklyMinutes)
                    : "0h"
                }
                icon={<ScheduleRounded />}
              />
              <SummaryCard
                caption="Batch"
                title={selectedBatch?.name ?? "—"}
                icon={<DateRangeRounded />}
              />
            </Box>

            {/* Printable routine */}
            <div id="routine-print-area">
              <Paper
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  overflow: "hidden",
                }}
              >
                {/* Routine header */}
                <Box
                  sx={{
                    px: 3,
                    py: 2.5,
                    backgroundImage: primaryGradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{ color: "#ffffff", fontWeight: 800 }}
                    >
                      Weekly Class Routine
                    </Typography>
                    {selectedBatch && (
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255,255,255,0.82)", mt: 0.5 }}
                      >
                        {selectedBatch.courseName
                          ? `${selectedBatch.courseName} — `
                          : ""}
                        {selectedBatch.name}
                      </Typography>
                    )}
                  </Box>
                  <Box
                    sx={{
                      px: 2,
                      py: 0.75,
                      borderRadius: 2,
                      bgcolor: "rgba(255,255,255,0.18)",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#ffffff",
                        fontWeight: 700,
                        letterSpacing: 0.5,
                      }}
                    >
                      {classDaysCount} class day{classDaysCount !== 1 ? "s" : ""}{" "}
                      / week
                    </Typography>
                  </Box>
                </Box>

                {classDaysCount === 0 && !isSchedulesLoading ? (
                  <Box sx={{ px: 4, py: 6, textAlign: "center" }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      No active schedules
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Add recurring schedules from the Class Schedule page to
                      generate a routine.
                    </Typography>
                  </Box>
                ) : (
                  <>
                    {/* Full 7-day timetable grid */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        "& > *:not(:last-child)": {
                          borderRight: "1px solid",
                          borderColor: "divider",
                        },
                      }}
                    >
                      {DAY_ORDER.map((day) => {
                        const schedule = scheduleByDay.get(day);
                        const teacher = schedule?.teacherId
                          ? (userLookup.get(schedule.teacherId) ?? "Unknown")
                          : null;
                        return (
                          <DayCard
                            key={day}
                            day={day}
                            schedule={
                              schedule ?? ({ dayOfWeek: day } as ScheduleRecord)
                            }
                            teacher={teacher}
                            hasClass={!!schedule}
                          />
                        );
                      })}
                    </Box>

                    {/* Active days summary table */}
                    {activeDays.length > 0 && (
                      <>
                        <Divider />
                        <Box sx={{ px: 3, py: 2.5 }}>
                          <Typography
                            variant="overline"
                            color="text.secondary"
                            sx={{ fontWeight: 700, letterSpacing: 1 }}
                          >
                            Schedule Summary
                          </Typography>
                          <Box
                            component="table"
                            sx={{
                              width: "100%",
                              mt: 1.5,
                              borderCollapse: "collapse",
                              "& th, & td": {
                                textAlign: "left",
                                py: 1,
                                px: 1.5,
                                fontSize: "0.8125rem",
                                borderBottom: "1px solid",
                                borderColor: "divider",
                              },
                              "& th": {
                                fontWeight: 700,
                                color: "text.secondary",
                                fontSize: "0.75rem",
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                                bgcolor: alpha("#0f172a", 0.02),
                              },
                              "& tr:last-child td": {
                                borderBottom: "none",
                              },
                            }}
                          >
                            <thead>
                              <tr>
                                <th>Day</th>
                                <th>Time</th>
                                <th>Duration</th>
                                <th>Room</th>
                                <th>Teacher</th>
                              </tr>
                            </thead>
                            <tbody>
                              {activeDays.map((day) => {
                                const s = scheduleByDay.get(day)!;
                                const teacher = s.teacherId
                                  ? (userLookup.get(s.teacherId) ?? "Unknown")
                                  : null;
                                const mins = calcDurationMinutes(
                                  s.startTime,
                                  s.endTime,
                                );
                                return (
                                  <tr key={day}>
                                    <td>
                                      <Typography
                                        variant="body2"
                                        sx={{ fontWeight: 700 }}
                                      >
                                        {DAY_LABELS[day]}
                                      </Typography>
                                    </td>
                                    <td>
                                      <Typography variant="body2">
                                        {formatTime(s.startTime)} –{" "}
                                        {formatTime(s.endTime)}
                                      </Typography>
                                    </td>
                                    <td>
                                      <Typography variant="body2">
                                        {formatDuration(mins)}
                                      </Typography>
                                    </td>
                                    <td>
                                      <Typography
                                        variant="body2"
                                        color={
                                          s.roomName
                                            ? "text.primary"
                                            : "text.disabled"
                                        }
                                      >
                                        {s.roomName
                                          ? `Room ${s.roomName}`
                                          : "—"}
                                      </Typography>
                                    </td>
                                    <td>
                                      <Typography
                                        variant="body2"
                                        color={
                                          teacher
                                            ? "text.primary"
                                            : "text.disabled"
                                        }
                                      >
                                        {teacher ?? "—"}
                                      </Typography>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </Box>
                        </Box>
                      </>
                    )}
                  </>
                )}
              </Paper>
            </div>
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
            <Stack spacing={1.5} alignItems="flex-start">
              <Typography variant="h6">
                Select a batch to view its routine
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose a batch above to see the weekly class timetable.
              </Typography>
            </Stack>
          </Paper>
        )}
      </Stack>
    </>
  );
}
