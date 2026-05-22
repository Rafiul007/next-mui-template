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
  Typography,
} from "@mui/material";
import { RhfSelect, type RhfSelectOption } from "@/components/form";

const substituteFormSchema = yup
  .object({
    substituteTeacherId: yup
      .string()
      .required("Please select a substitute teacher"),
  })
  .required();

type SubstituteFormValues = yup.InferType<typeof substituteFormSchema>;

type SubstituteDialogProps = {
  errorMessage?: string | null;
  isSubmitting: boolean;
  sessionDate: string;
  sessionTime: string;
  teacherOptions: RhfSelectOption[];
  onClose: () => void;
  onSubmit: (substituteTeacherId: string) => Promise<void>;
  open: boolean;
};

export function SubstituteDialog({
  errorMessage,
  isSubmitting,
  sessionDate,
  sessionTime,
  teacherOptions,
  onClose,
  onSubmit,
  open,
}: SubstituteDialogProps) {
  const { control, handleSubmit } = useForm<SubstituteFormValues>({
    resolver: yupResolver(substituteFormSchema),
    defaultValues: { substituteTeacherId: "" },
    mode: "onTouched",
  });

  const handleFormSubmit = async (values: SubstituteFormValues) => {
    await onSubmit(values.substituteTeacherId);
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>Assign Substitute Teacher</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Typography variant="body2" color="text.secondary">
              Session: {sessionDate} · {sessionTime}
            </Typography>
            {errorMessage ? (
              <Alert severity="error">{errorMessage}</Alert>
            ) : null}
            <RhfSelect
              control={control}
              name="substituteTeacherId"
              label="Substitute teacher"
              options={teacherOptions}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Assign
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
