"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import type { Dayjs } from "dayjs";
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
import { RhfDatePicker, RhfSelect, RhfTextField, type RhfSelectOption } from "@/components/form";

const createSchema = yup
  .object({
    employeeId: yup.string().required("Employee is required"),
    goals: yup.string().trim().required("Goals are required"),
    startDate: yup.mixed<Dayjs>().nullable().required("Start date is required"),
    endDate: yup.mixed<Dayjs>().nullable().required("End date is required"),
  })
  .required();

const updateSchema = yup
  .object({
    status: yup.string().required("Status is required"),
    progressNotes: yup.string().trim().default(""),
  })
  .required();

export type PipCreateValues = yup.InferType<typeof createSchema>;
export type PipUpdateValues = yup.InferType<typeof updateSchema>;

const PIP_STATUS_OPTIONS: RhfSelectOption[] = [
  { label: "Active", value: "ACTIVE" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Terminated", value: "TERMINATED" },
];

type CreateProps = {
  open: boolean;
  isSubmitting: boolean;
  employeeOptions: RhfSelectOption[];
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (values: PipCreateValues) => Promise<void>;
};

type UpdateProps = {
  open: boolean;
  isSubmitting: boolean;
  pipId: string;
  currentStatus: string;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (pipId: string, values: PipUpdateValues) => Promise<void>;
};

export function PipCreateDialog({ open, isSubmitting, employeeOptions, errorMessage, onClose, onSubmit }: CreateProps) {
  const { control, handleSubmit } = useForm<PipCreateValues>({
    resolver: yupResolver(createSchema) as never,
    defaultValues: { employeeId: "", goals: "", startDate: null as unknown as Dayjs, endDate: null as unknown as Dayjs },
    mode: "onTouched",
  });

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Performance Improvement Plan</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
            <RhfSelect control={control} name="employeeId" label="Employee *" options={employeeOptions} placeholder="Select employee" />
            <RhfTextField control={control} name="goals" label="Goals *" multiline rows={3} trim placeholder="Describe the improvement goals..." />
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "1fr 1fr" }}>
              <RhfDatePicker control={control} name="startDate" label="Start date *" textFieldProps={{ fullWidth: true }} />
              <RhfDatePicker control={control} name="endDate" label="End date *" textFieldProps={{ fullWidth: true }} />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>Create PIP</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export function PipUpdateDialog({ open, isSubmitting, pipId, currentStatus, errorMessage, onClose, onSubmit }: UpdateProps) {
  const { control, handleSubmit } = useForm<PipUpdateValues>({
    resolver: yupResolver(updateSchema),
    defaultValues: { status: currentStatus, progressNotes: "" },
    mode: "onTouched",
  });

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Update PIP Progress</DialogTitle>
      <Box component="form" onSubmit={handleSubmit((v) => onSubmit(pipId, v))} noValidate>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
            <RhfSelect control={control} name="status" label="Status *" options={PIP_STATUS_OPTIONS} />
            <RhfTextField control={control} name="progressNotes" label="Progress notes" multiline rows={3} trim placeholder="Describe progress made..." />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>Save update</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
