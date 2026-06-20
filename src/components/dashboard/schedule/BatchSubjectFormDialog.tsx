"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";
import { RhfTextField, type RhfSelectOption, RhfSelect } from "@/components/form";

const CLASS_LEVEL_OPTIONS: RhfSelectOption[] = [
  { label: "Class 1", value: "1" },
  { label: "Class 2", value: "2" },
  { label: "Class 3", value: "3" },
  { label: "Class 4", value: "4" },
  { label: "Class 5", value: "5" },
  { label: "Class 6", value: "6" },
  { label: "Class 7", value: "7" },
  { label: "Class 8", value: "8" },
  { label: "Class 9", value: "9" },
  { label: "Class 10", value: "10" },
  { label: "Class 11", value: "11" },
  { label: "Class 12", value: "12" },
  { label: "HSC", value: "HSC" },
  { label: "SSC", value: "SSC" },
  { label: "Admission", value: "Admission" },
  { label: "University", value: "University" },
];

const batchSubjectSchema = yup
  .object({
    name: yup.string().trim().required("Subject name is required").max(120),
    nameBangla: yup.string().trim().default(""),
    code: yup.string().trim().max(20).default(""),
    classLevel: yup.string().default(""),
  })
  .required();

export type BatchSubjectFormValues = yup.InferType<typeof batchSubjectSchema>;

type BatchSubjectFormDialogProps = {
  batchName: string;
  errorMessage?: string | null;
  isSubmitting: boolean;
  open: boolean;
  onClose: () => void;
  onSubmit: (values: BatchSubjectFormValues) => Promise<void>;
};

export function BatchSubjectFormDialog({
  batchName,
  errorMessage,
  isSubmitting,
  open,
  onClose,
  onSubmit,
}: BatchSubjectFormDialogProps) {
  const { control, handleSubmit, reset } = useForm<BatchSubjectFormValues>({
    resolver: yupResolver(batchSubjectSchema),
    defaultValues: { name: "", nameBangla: "", code: "", classLevel: "" },
    mode: "onTouched",
  });

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Subject to Batch</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            {errorMessage ? (
              <Alert severity="error">{errorMessage}</Alert>
            ) : null}

            <RhfTextField
              control={control}
              name="name"
              label="Subject name *"
              placeholder="e.g. Physics, Chemistry, Mathematics"
              trim
              fullWidth
            />

            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              }}
            >
              <RhfTextField
                control={control}
                name="nameBangla"
                label="Name in Bangla (optional)"
                placeholder="e.g. পদার্থবিজ্ঞান"
                trim
                fullWidth
              />
              <RhfTextField
                control={control}
                name="code"
                label="Subject code (optional)"
                placeholder="e.g. PHY101"
                trim
                fullWidth
              />
            </Box>

            <RhfSelect
              control={control}
              name="classLevel"
              label="Class level (optional)"
              options={[{ label: "Not specified", value: "" }, ...CLASS_LEVEL_OPTIONS]}
              fullWidth
            />

            <Box
              sx={{ p: 2, borderRadius: 1, bgcolor: "action.hover" }}
            >
              <Box
                component="span"
                sx={{ typography: "body2", color: "text.secondary" }}
              >
                Will be added to batch:{" "}
                <Box component="strong">{batchName}</Box>
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={14} color="inherit" />
              ) : undefined
            }
          >
            Add Subject
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
