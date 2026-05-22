"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";
import { RhfSelect, RhfTextField, type RhfSelectOption } from "@/components/form";

const DAY_OPTIONS: RhfSelectOption[] = [
  { label: "Sunday", value: "SUNDAY" },
  { label: "Monday", value: "MONDAY" },
  { label: "Tuesday", value: "TUESDAY" },
  { label: "Wednesday", value: "WEDNESDAY" },
  { label: "Thursday", value: "THURSDAY" },
  { label: "Friday", value: "FRIDAY" },
  { label: "Saturday", value: "SATURDAY" },
];

const scheduleFormSchema = yup
  .object({
    dayOfWeek: yup.string().required("Day of week is required"),
    startTime: yup.string().required("Start time is required"),
    endTime: yup.string().required("End time is required"),
    roomName: yup.string().trim().max(60, "Room name must be 60 characters or fewer").default(""),
    teacherId: yup.string().default(""),
  })
  .required();

export type RecurringScheduleFormValues = yup.InferType<typeof scheduleFormSchema>;

type RecurringScheduleFormDialogProps = {
  batchName: string;
  errorMessage?: string | null;
  initialValues: RecurringScheduleFormValues;
  isSubmitting: boolean;
  teacherOptions: RhfSelectOption[];
  onClose: () => void;
  onSubmit: (values: RecurringScheduleFormValues) => Promise<void>;
  open: boolean;
};

export function RecurringScheduleFormDialog({
  batchName,
  errorMessage,
  initialValues,
  isSubmitting,
  teacherOptions,
  onClose,
  onSubmit,
  open,
}: RecurringScheduleFormDialogProps) {
  const { control, handleSubmit } = useForm<RecurringScheduleFormValues>({
    resolver: yupResolver(scheduleFormSchema),
    defaultValues: initialValues,
    mode: "onTouched",
  });

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Add Recurring Schedule</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers>
          <Stack spacing={3}>
            {errorMessage ? (
              <Alert severity="error">{errorMessage}</Alert>
            ) : null}
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              }}
            >
              <RhfSelect
                control={control}
                name="dayOfWeek"
                label="Day of week"
                options={DAY_OPTIONS}
                fullWidth
              />
              <RhfSelect
                control={control}
                name="teacherId"
                label="Teacher (optional)"
                options={teacherOptions}
                fullWidth
              />
              <RhfTextField
                control={control}
                name="startTime"
                label="Start time"
                type="time"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <RhfTextField
                control={control}
                name="endTime"
                label="End time"
                type="time"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                <RhfTextField
                  control={control}
                  name="roomName"
                  label="Room / Classroom (optional)"
                  placeholder="e.g. Room 201"
                  trim
                  fullWidth
                />
              </Box>
            </Box>
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: "action.hover",
              }}
            >
              <Box component="span" sx={{ typography: "body2", color: "text.secondary" }}>
                Batch: <strong>{batchName}</strong>
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Add Schedule
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
