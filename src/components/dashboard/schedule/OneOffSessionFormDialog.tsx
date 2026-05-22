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

const SESSION_TYPE_OPTIONS: RhfSelectOption[] = [
  { label: "Extra Class", value: "EXTRA" },
  { label: "Makeup Class", value: "MAKEUP" },
  { label: "Regular", value: "REGULAR" },
];

const oneOffSessionFormSchema = yup
  .object({
    date: yup.string().required("Date is required"),
    startTime: yup.string().required("Start time is required"),
    endTime: yup.string().required("End time is required"),
    type: yup.string().required("Session type is required"),
    teacherId: yup.string().default(""),
    roomName: yup.string().trim().max(60, "Room name must be 60 characters or fewer").default(""),
  })
  .required();

export type OneOffSessionFormValues = yup.InferType<typeof oneOffSessionFormSchema>;

type OneOffSessionFormDialogProps = {
  batchName: string;
  errorMessage?: string | null;
  initialValues: OneOffSessionFormValues;
  isSubmitting: boolean;
  teacherOptions: RhfSelectOption[];
  onClose: () => void;
  onSubmit: (values: OneOffSessionFormValues) => Promise<void>;
  open: boolean;
};

export function OneOffSessionFormDialog({
  batchName,
  errorMessage,
  initialValues,
  isSubmitting,
  teacherOptions,
  onClose,
  onSubmit,
  open,
}: OneOffSessionFormDialogProps) {
  const { control, handleSubmit } = useForm<OneOffSessionFormValues>({
    resolver: yupResolver(oneOffSessionFormSchema),
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
      <DialogTitle>Add One-Off Session</DialogTitle>
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
              <RhfTextField
                control={control}
                name="date"
                label="Date"
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <RhfSelect
                control={control}
                name="type"
                label="Session type"
                options={SESSION_TYPE_OPTIONS}
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
              <RhfSelect
                control={control}
                name="teacherId"
                label="Teacher (optional)"
                options={teacherOptions}
                fullWidth
              />
              <RhfTextField
                control={control}
                name="roomName"
                label="Room / Classroom (optional)"
                placeholder="e.g. Room 201"
                trim
                fullWidth
              />
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
            Add Session
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
