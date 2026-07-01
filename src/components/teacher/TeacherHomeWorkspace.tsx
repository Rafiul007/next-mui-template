"use client";

import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import {
  AssessmentRounded,
  AutoStoriesRounded,
  BeachAccessRounded,
  EventNoteRounded,
  FactCheckRounded,
  GroupsRounded,
  RoomRounded,
  ScheduleRounded,
} from "@mui/icons-material";
import { useQuery } from "@apollo/client/react";
import {
  Box,
  Card,
  CardActionArea,
  Chip,
  Paper,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { GetMyRoutineDocument } from "@/graphql/generated";
import { SummaryCard } from "@/components/ui";
import { primaryGradient } from "@/theme/theme";
import {
  dayIndex,
  formatTime,
  useMyBatches,
  type TeacherBatch,
} from "./teacher-shared";

const QUICK_LINKS = [
  {
    label: "My Schedule",
    description: "Weekly class routine",
    icon: EventNoteRounded,
    href: "/teacher/dashboard/schedule",
  },
  {
    label: "Take Attendance",
    description: "Mark students present",
    icon: FactCheckRounded,
    href: "/teacher/dashboard/attendance",
  },
  {
    label: "Exams & Results",
    description: "Create, grade, publish",
    icon: AssessmentRounded,
    href: "/teacher/dashboard/exams",
  },
  {
    label: "Apply for Leave",
    description: "Request time off",
    icon: BeachAccessRounded,
    href: "/teacher/dashboard/leave",
  },
];

// Renders today's class entries for a single batch (each does its own query).
function BatchTodayRow({ batch }: { batch: TeacherBatch }) {
  const { data, loading } = useQuery(GetMyRoutineDocument, {
    variables: { batchId: batch.id },
    fetchPolicy: "cache-and-network",
  });

  const today = dayjs().day();
  const entries = (data?.myRoutine ?? [])
    .filter((r) => r.active && dayIndex(r.dayOfWeek) === today)
    .sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""));

  if (loading && !data) return null;
  if (entries.length === 0) return null;

  return (
    <>
      {entries.map((e) => (
        <Paper
          key={e.id}
          elevation={0}
          sx={{
            p: 2,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              bgcolor: alpha("#2563eb", 0.12),
              color: "#1d4ed8",
              flexShrink: 0,
            }}
          >
            <ScheduleRounded />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={700} noWrap>
              {batch.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatTime(e.startTime)} – {formatTime(e.endTime)}
              {e.roomName ? ` · Room ${e.roomName}` : ""}
            </Typography>
          </Box>
          {e.roomName ? (
            <Chip
              icon={<RoomRounded sx={{ fontSize: 15 }} />}
              label={e.roomName}
              size="small"
              variant="outlined"
            />
          ) : null}
        </Paper>
      ))}
    </>
  );
}

export function TeacherHomeWorkspace() {
  const router = useRouter();
  const { profile, myBatches, loading } = useMyBatches();

  const name = profile?.userInfo
    ? `${profile.userInfo.firstName} ${profile.userInfo.lastName ?? ""}`.trim()
    : "Teacher";

  const totalCapacity = myBatches.reduce((s, b) => s + (b.capacity ?? 0), 0);
  const totalEnrolled = myBatches.reduce((s, b) => s + (b.enrolledCount ?? 0), 0);
  const ongoing = myBatches.filter(
    (b) => (b.status ?? "").toLowerCase() === "ongoing",
  ).length;

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
        <Typography variant="h4" component="h1">
          {dayjs().hour() < 12
            ? "Good morning"
            : dayjs().hour() < 17
              ? "Good afternoon"
              : "Good evening"}
          , {name.split(" ")[0]}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          {dayjs().format("dddd, DD MMMM YYYY")} · Here is your teaching snapshot.
        </Typography>
      </Paper>

      {/* KPIs */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0,1fr))",
            lg: "repeat(4, minmax(0,1fr))",
          },
        }}
      >
        <SummaryCard
          caption="My batches"
          title={String(myBatches.length)}
          icon={<AutoStoriesRounded />}
        />
        <SummaryCard
          caption="Ongoing batches"
          title={String(ongoing)}
          icon={<GroupsRounded />}
          tone="success"
        />
        <SummaryCard
          caption="Students enrolled"
          title={String(totalEnrolled)}
          icon={<GroupsRounded />}
        />
        <SummaryCard
          caption="Total capacity"
          title={String(totalCapacity)}
          icon={<GroupsRounded />}
        />
      </Box>

      {/* Quick actions */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
        }}
      >
        {QUICK_LINKS.map((link) => (
          <Card
            key={link.href}
            elevation={0}
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <CardActionArea
              onClick={() => router.push(link.href)}
              sx={{ p: 2.5, height: "100%" }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  background: primaryGradient,
                  color: "#fff",
                  mb: 1.5,
                }}
              >
                <link.icon />
              </Box>
              <Typography variant="subtitle1" fontWeight={700}>
                {link.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {link.description}
              </Typography>
            </CardActionArea>
          </Card>
        ))}
      </Box>

      {/* Two columns: today's classes + my batches */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
        }}
      >
        <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
            <ScheduleRounded sx={{ color: "text.secondary" }} />
            <Typography variant="h6" fontWeight={700}>
              Today&apos;s Classes
            </Typography>
          </Stack>
          {loading ? (
            <Typography variant="body2" color="text.secondary">
              Loading…
            </Typography>
          ) : myBatches.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No batches assigned to you yet.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {myBatches.map((b) => (
                <BatchTodayRow key={b.id} batch={b} />
              ))}
              <Typography variant="caption" color="text.disabled">
                Only classes scheduled for today are shown. See My Schedule for the
                full week.
              </Typography>
            </Stack>
          )}
        </Paper>

        <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
            <AutoStoriesRounded sx={{ color: "text.secondary" }} />
            <Typography variant="h6" fontWeight={700}>
              My Batches
            </Typography>
          </Stack>
          {loading ? (
            <Typography variant="body2" color="text.secondary">
              Loading…
            </Typography>
          ) : myBatches.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No batches assigned to you yet.
            </Typography>
          ) : (
            <Stack spacing={1.25}>
              {myBatches.map((b) => (
                <Stack
                  key={b.id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    p: 1.75,
                    borderRadius: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2" fontWeight={700} noWrap>
                      {b.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {b.classLevel ? `${b.classLevel} · ` : ""}
                      {b.enrolledCount}/{b.capacity} students
                    </Typography>
                  </Box>
                  <Chip
                    label={b.status ?? "—"}
                    size="small"
                    color={
                      (b.status ?? "").toLowerCase() === "ongoing"
                        ? "success"
                        : "default"
                    }
                    variant="outlined"
                  />
                </Stack>
              ))}
            </Stack>
          )}
        </Paper>
      </Box>
    </Stack>
  );
}
