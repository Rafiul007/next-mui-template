"use client";

import { type Dayjs } from "dayjs";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
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
import {
  RhfDatePicker,
  RhfSearchSelect,
  RhfSelect,
  RhfTextField,
  type RhfSelectOption,
  type SearchSelectOption,
} from "@/components/form";

const leaveTypeOptions: RhfSelectOption[] = [
  { label: "Sick leave", value: "sick" },
  { label: "Casual leave", value: "casual" },
  { label: "Annual leave", value: "annual" },
  { label: "Maternity leave", value: "maternity" },
  { label: "Unpaid leave", value: "unpaid" },
];

const leaveFormSchema = yup
  .object({
    employeeId: yup.string().required("Employee is required"),
    leaveType: yup.string().required("Leave type is required"),
    startDate: yup.mixed<Dayjs>().nullable().required("Start date is required"),
    endDate: yup
      .mixed<Dayjs>()
      .nullable()
      .required("End date is required")
      .test(
        "end-after-start",
        "End date must be on or after start date",
        function (endDate) {
          const { startDate } = this.parent;
          if (!startDate || !endDate) return true;
          return (endDate as Dayjs).isSame(startDate as Dayjs, "day") ||
            (endDate as Dayjs).isAfter(startDate as Dayjs, "day");
        },
      ),
    reason: yup.string().trim().default(""),
  })
  .required();

export type LeaveFormValues = yup.InferType<typeof leaveFormSchema>;

const emptyValues: LeaveFormValues = {
  employeeId: "",
  leaveType: "",
  startDate: null as unknown as Dayjs,
  endDate: null as unknown as Dayjs,
  reason: "",
};

export type LeaveFormDialogProps = {
  employeeOptions: SearchSelectOption[];
  errorMessage: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: LeaveFormValues) => void;
  open: boolean;
};

export function LeaveFormDialog({
  employeeOptions,
  errorMessage,
  isSubmitting,
  onClose,
  onSubmit,
  open,
}: LeaveFormDialogProps) {
  const { control, handleSubmit } = useForm<LeaveFormValues>({
    resolver: yupResolver(leaveFormSchema),
    defaultValues: emptyValues,
    mode: "onTouched",
  });

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Apply for leave</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            {errorMessage ? (
              <Alert severity="error">{errorMessage}</Alert>
            ) : null}

            <RhfSearchSelect
              control={control}
              name="employeeId"
              label="Employee *"
              options={employeeOptions}
              placeholder="Search by name or code…"
            />
            <RhfSelect
              control={control}
              name="leaveType"
              label="Leave type *"
              options={leaveTypeOptions}
              placeholder="Select leave type"
            />
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              }}
            >
              <RhfDatePicker
                control={control}
                name="startDate"
                label="Start date *"
                textFieldProps={{ fullWidth: true }}
              />
              <RhfDatePicker
                control={control}
                name="endDate"
                label="End date *"
                textFieldProps={{ fullWidth: true }}
              />
            </Box>
            <RhfTextField
              control={control}
              name="reason"
              label="Reason"
              multiline
              rows={3}
              trim
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Submit request
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
