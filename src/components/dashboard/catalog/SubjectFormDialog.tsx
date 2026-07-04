"use client";

import { Controller, useForm } from "react-hook-form";
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
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import {
  RhfSearchSelect,
  RhfSelect,
  RhfTextField,
  type SearchSelectOption,
} from "@/components/form";

const CLASS_LEVEL_OPTIONS = [
  { label: "Class 1", value: "CLASS_1" },
  { label: "Class 2", value: "CLASS_2" },
  { label: "Class 3", value: "CLASS_3" },
  { label: "Class 4", value: "CLASS_4" },
  { label: "Class 5", value: "CLASS_5" },
  { label: "Class 6", value: "CLASS_6" },
  { label: "Class 7", value: "CLASS_7" },
  { label: "Class 8", value: "CLASS_8" },
  { label: "Class 9", value: "CLASS_9" },
  { label: "Class 10", value: "CLASS_10" },
  { label: "SSC", value: "SSC" },
  { label: "HSC", value: "HSC" },
  { label: "University", value: "UNIVERSITY" },
];

const subjectFormSchema = yup
  .object({
    name: yup
      .string()
      .trim()
      .required("Subject name is required")
      .max(100, "Must be 100 characters or fewer"),
    nameBangla: yup
      .string()
      .trim()
      .max(100, "Must be 100 characters or fewer")
      .default(""),
    code: yup
      .string()
      .trim()
      .max(20, "Must be 20 characters or fewer")
      .default(""),
    classLevel: yup
      .string()
      .trim()
      .max(50, "Must be 50 characters or fewer")
      .default(""),
    batchId: yup.string().default(""),
    active: yup.boolean().required().default(true),
  })
  .required();

export type SubjectFormValues = yup.InferType<typeof subjectFormSchema>;

export const emptySubjectFormValues: SubjectFormValues = {
  name: "",
  nameBangla: "",
  code: "",
  classLevel: "",
  batchId: "",
  active: true,
};

type SubjectFormDialogProps = {
  batchOptions: SearchSelectOption[];
  batchesLoading?: boolean;
  errorMessage?: string | null;
  initialValues: SubjectFormValues;
  isSubmitting: boolean;
  mode: "create" | "edit";
  onClose: () => void;
  onSubmit: (values: SubjectFormValues) => Promise<void>;
  open: boolean;
};

export function SubjectFormDialog({
  batchOptions,
  batchesLoading,
  errorMessage,
  initialValues,
  isSubmitting,
  mode,
  onClose,
  onSubmit,
  open,
}: SubjectFormDialogProps) {
  const { control, handleSubmit } = useForm<SubjectFormValues>({
    resolver: yupResolver(subjectFormSchema),
    defaultValues: initialValues,
    mode: "onTouched",
  });

  const title = mode === "create" ? "Create Subject" : "Edit Subject";
  const submitLabel = mode === "create" ? "Create Subject" : "Save Changes";

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{title}</DialogTitle>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers>
          <Stack spacing={3}>
            {errorMessage ? (
              <Alert severity="error">{errorMessage}</Alert>
            ) : null}

            <Stack spacing={1.5}>
              <Typography variant="subtitle2" fontWeight={700}>
                Subject details
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                }}
              >
                <RhfTextField
                  control={control}
                  name="name"
                  label="Subject name"
                  placeholder="e.g. Mathematics, Physics"
                  fullWidth
                  trim
                />
                <RhfTextField
                  control={control}
                  name="nameBangla"
                  label="Name in Bangla"
                  placeholder="e.g. গণিত, পদার্থ"
                  fullWidth
                  trim
                />
                <RhfTextField
                  control={control}
                  name="code"
                  label="Subject code"
                  placeholder="e.g. MATH-101"
                  fullWidth
                  trim
                  helperText="Short identifier for schedules and reports"
                />
                <RhfSelect
                  control={control}
                  name="classLevel"
                  label="Class level"
                  options={CLASS_LEVEL_OPTIONS}
                  displayEmpty
                  fullWidth
                  helperText="Leave blank if applicable to all levels"
                />
                <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
                  <RhfSearchSelect
                    control={control}
                    name="batchId"
                    label="Batch"
                    options={[
                      { value: "", label: "Unassigned (library subject)" },
                      ...batchOptions,
                    ]}
                    loading={batchesLoading}
                    placeholder="Search batches…"
                    helperText="Assign to a batch to use it in that batch's routine, or leave unassigned for the program library"
                  />
                </Box>
              </Box>
            </Stack>

            {mode === "edit" && (
              <>
                <Divider />
                <Stack spacing={0.5}>
                  <Controller
                    control={control}
                    name="active"
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        }
                        label="Active"
                      />
                    )}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ pl: 6.5 }}
                  >
                    Inactive subjects are hidden from batch and schedule forms.
                  </Typography>
                </Stack>
              </>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {submitLabel}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
