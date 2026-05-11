"use client";

import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  CheckBoxOutlineBlankRounded,
  CheckBoxRounded,
} from "@mui/icons-material";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { RhfTextField } from "@/components/form";

export type SubjectOption = { id: string; name: string };

const programFormSchema = yup
  .object({
    name: yup
      .string()
      .trim()
      .required("Program name is required")
      .max(100, "Must be 100 characters or fewer"),
    durationMonths: yup
      .number()
      .typeError("Duration must be a number")
      .integer("Must be a whole number")
      .min(1, "Must be at least 1 month")
      .required("Duration is required"),
    targetLevel: yup
      .string()
      .trim()
      .max(100, "Must be 100 characters or fewer")
      .default(""),
    syllabusPath: yup
      .string()
      .trim()
      .max(500, "Must be 500 characters or fewer")
      .default(""),
    subjectIds: yup.array(yup.string().required()).default([]),
    active: yup.boolean().required().default(true),
  })
  .required();

export type ProgramFormValues = yup.InferType<typeof programFormSchema>;

export const emptyProgramFormValues: ProgramFormValues = {
  name: "",
  durationMonths: 12,
  targetLevel: "",
  syllabusPath: "",
  subjectIds: [],
  active: true,
};

type ProgramFormDialogProps = {
  errorMessage?: string | null;
  initialValues: ProgramFormValues;
  isSubmitting: boolean;
  mode: "create" | "edit";
  onClose: () => void;
  onSubmit: (values: ProgramFormValues) => Promise<void>;
  open: boolean;
  subjects: SubjectOption[];
};

export function ProgramFormDialog({
  errorMessage,
  initialValues,
  isSubmitting,
  mode,
  onClose,
  onSubmit,
  open,
  subjects,
}: ProgramFormDialogProps) {
  const { control, handleSubmit } = useForm<ProgramFormValues>({
    resolver: yupResolver(programFormSchema),
    defaultValues: initialValues,
    mode: "onTouched",
  });

  const title = mode === "create" ? "Create Program" : "Edit Program";
  const submitLabel = mode === "create" ? "Create Program" : "Save Changes";

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

            {/* ── Program details ── */}
            <Stack spacing={1.5}>
              <Typography variant="subtitle2" fontWeight={700}>
                Program details
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
                  label="Program name"
                  placeholder="e.g. SSC Science Program"
                  fullWidth
                  trim
                />
                <RhfTextField
                  control={control}
                  name="durationMonths"
                  label="Duration (months)"
                  type="number"
                  fullWidth
                  slotProps={{ htmlInput: { min: 1 } }}
                />
                <RhfTextField
                  control={control}
                  name="targetLevel"
                  label="Target level"
                  placeholder="e.g. SSC, HSC, Class 9–10"
                  fullWidth
                  trim
                />
                <RhfTextField
                  control={control}
                  name="syllabusPath"
                  label="Syllabus link / path"
                  placeholder="https://… or /files/syllabus.pdf"
                  fullWidth
                  trim
                  helperText="Optional link to the syllabus document"
                />
              </Box>
            </Stack>

            <Divider />

            {/* ── Subject selection ── */}
            <Stack spacing={1.5}>
              <Stack spacing={0.25}>
                <Typography variant="subtitle2" fontWeight={700}>
                  Subjects
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Select the subjects covered in this program.
                </Typography>
              </Stack>
              <Controller
                control={control}
                name="subjectIds"
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={subjects}
                    getOptionLabel={(opt) => opt.name}
                    isOptionEqualToValue={(opt, val) => opt.id === val.id}
                    value={subjects.filter((s) =>
                      field.value.includes(s.id),
                    )}
                    onChange={(_, selected) =>
                      field.onChange(selected.map((s) => s.id))
                    }
                    renderOption={(props, option, { selected }) => (
                      <li {...props} key={option.id}>
                        <Checkbox
                          icon={
                            <CheckBoxOutlineBlankRounded fontSize="small" />
                          }
                          checkedIcon={<CheckBoxRounded fontSize="small" />}
                          checked={selected}
                          sx={{ mr: 1 }}
                        />
                        {option.name}
                      </li>
                    )}
                    renderTags={(selected, getTagProps) =>
                      selected.map((option, index) => (
                        <Chip
                          {...getTagProps({ index })}
                          key={option.id}
                          label={option.name}
                          size="small"
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Subjects"
                        placeholder={
                          field.value.length === 0 ? "Search subjects…" : ""
                        }
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                    noOptionsText={
                      subjects.length === 0
                        ? "No subjects exist yet — create subjects first"
                        : "No subjects found"
                    }
                  />
                )}
              />
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
                    Inactive programs are hidden from batch creation forms.
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
