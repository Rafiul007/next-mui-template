"use client";

import { useEffect, useState } from "react";
import { EventNoteRounded, RoomRounded } from "@mui/icons-material";
import { useQuery } from "@apollo/client/react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { GetMyRoutineDocument } from "@/graphql/generated";
import { dayIndex, dayLabel, formatTime, useMyBatches, WEEK_ORDER } from "./teacher-shared";

export function MyScheduleWorkspace() {
  const { myBatches, loading: batchesLoading } = useMyBatches();
  const [batchId, setBatchId] = useState("");

  // Default to the first batch once they load.
  useEffect(() => {
    if (!batchId && myBatches.length > 0) {
      setBatchId(myBatches[0].id);
    }
  }, [batchId, myBatches]);

  const { data, loading } = useQuery(GetMyRoutineDocument, {
    variables: { batchId },
    skip: !batchId,
    fetchPolicy: "cache-and-network",
  });

  const entries = (data?.myRoutine ?? []).filter((r) => r.active);
  const byDay = new Map<number, typeof entries>();
  for (const e of entries) {
    const d = dayIndex(e.dayOfWeek);
    if (!byDay.has(d)) byDay.set(d, []);
    byDay.get(d)!.push(e);
  }
  const days = WEEK_ORDER.filter((d) => byDay.has(d));

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
          My Schedule
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          Your weekly class routine. Pick a batch to view its timetable.
        </Typography>
      </Paper>

      <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
        <FormControl size="small" sx={{ minWidth: 280 }}>
          <InputLabel>Batch</InputLabel>
          <Select
            label="Batch"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
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
      </Paper>

      {!batchId ? null : loading && entries.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Loading schedule…
        </Typography>
      ) : days.length === 0 ? (
        <Box
          sx={{
            py: 8,
            textAlign: "center",
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 2,
            bgcolor: alpha("#f8fafc", 0.6),
          }}
        >
          <EventNoteRounded sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }} />
          <Typography variant="h6" color="text.secondary">
            No classes scheduled
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
            This batch has no recurring routine set up yet.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
          }}
        >
          {days.map((d) => {
            const dayEntries = [...(byDay.get(d) ?? [])].sort((a, b) =>
              (a.startTime ?? "").localeCompare(b.startTime ?? ""),
            );
            return (
              <Paper
                key={d}
                elevation={0}
                sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}
              >
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                  {dayLabel(d)}
                </Typography>
                <Stack spacing={1.25}>
                  {dayEntries.map((e) => (
                    <Box
                      key={e.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        border: "1px solid",
                        borderColor: alpha("#10b981", 0.2),
                        bgcolor: alpha("#ecfdf5", 0.4),
                      }}
                    >
                      <Typography variant="body2" fontWeight={700}>
                        {formatTime(e.startTime)} – {formatTime(e.endTime)}
                      </Typography>
                      {e.roomName ? (
                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.25 }}>
                          <RoomRounded sx={{ fontSize: 14, color: "text.secondary" }} />
                          <Typography variant="caption" color="text.secondary">
                            Room {e.roomName}
                          </Typography>
                        </Stack>
                      ) : null}
                    </Box>
                  ))}
                </Stack>
              </Paper>
            );
          })}
        </Box>
      )}
    </Stack>
  );
}
