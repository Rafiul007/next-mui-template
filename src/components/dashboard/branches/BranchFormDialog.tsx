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
import {
  RhfCheckboxGroup,
  RhfSelect,
  RhfTextField,
  type RhfSelectOption,
} from "@/components/form";

const WORKING_DAY_OPTIONS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const branchFormSchema = yup
  .object({
    name: yup
      .string()
      .trim()
      .required("Branch name is required")
      .max(80, "Branch name must be 80 characters or fewer"),
    address: yup
      .string()
      .trim()
      .max(200, "Address must be 200 characters or fewer")
      .default(""),
    phone: yup
      .string()
      .trim()
      .matches(
        /^$|^[0-9+\-() ]+$/,
        "Use numbers and simple phone characters only",
      )
      .max(30, "Phone number must be 30 characters or fewer")
      .default(""),
    managerId: yup.string().default(""),
    openTime: yup.string().default(""),
    closeTime: yup.string().default(""),
    workingDays: yup.array(yup.string().required()).default([]),
  })
  .required();

export type BranchFormValues = yup.InferType<typeof branchFormSchema>;

type BranchTextFieldConfig = {
  kind: "text";
  name:
    | "name"
    | "phone"
    | "address"
    | "openTime"
    | "closeTime";
  label: string;
  placeholder?: string;
  type?: "text" | "time";
  trim?: boolean;
  shrinkLabel?: boolean;
};

type BranchSelectFieldConfig = {
  kind: "select";
  name: "managerId";
  label: string;
  options: RhfSelectOption[];
};

type BranchFieldConfig = BranchTextFieldConfig | BranchSelectFieldConfig;

type BranchFormDialogProps = {
  centerName?: string;
  errorMessage?: string | null;
  initialValues: BranchFormValues;
  isSubmitting: boolean;
  managerOptions: RhfSelectOption[];
  mode: "create" | "edit";
  onClose: () => void;
  onSubmit: (values: BranchFormValues) => Promise<void>;
  open: boolean;
};

export function BranchFormDialog({
  centerName,
  errorMessage,
  initialValues,
  isSubmitting,
  managerOptions,
  mode,
  onClose,
  onSubmit,
  open,
}: BranchFormDialogProps) {
  const { control, handleSubmit } = useForm<BranchFormValues>({
    resolver: yupResolver(branchFormSchema),
    defaultValues: initialValues,
    mode: "onTouched",
  });

  const title = mode === "create" ? "Create Branch" : "Edit Branch";
  const submitLabel = mode === "create" ? "Create Branch" : "Save Changes";
  const branchFieldConfigs: BranchFieldConfig[] = [
    {
      kind: "text",
      name: "name",
      label: "Branch name",
      placeholder: "Mirpur Campus",
      trim: true,
    },
    {
      kind: "select",
      name: "managerId",
      label: "Branch manager",
      options: managerOptions,
    },
    {
      kind: "text",
      name: "phone",
      label: "Phone",
      placeholder: "+8801XXXXXXXXX",
      trim: true,
    },
    {
      kind: "text",
      name: "address",
      label: "Address",
      placeholder: "Road, area, city",
      trim: true,
    },
    {
      kind: "text",
      name: "openTime",
      label: "Opening time",
      type: "time",
      shrinkLabel: true,
    },
    {
      kind: "text",
      name: "closeTime",
      label: "Closing time",
      type: "time",
      shrinkLabel: true,
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>{title}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {centerName
                  ? `Center: ${centerName}`
                  : "This branch will be linked to the active center."}
              </Typography>
            </Box>

            {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              }}
            >
              {branchFieldConfigs.map((fieldConfig) =>
                fieldConfig.kind === "select" ? (
                  <RhfSelect
                    key={fieldConfig.name}
                    control={control}
                    name={fieldConfig.name}
                    label={fieldConfig.label}
                    options={fieldConfig.options}
                    fullWidth
                  />
                ) : (
                  <RhfTextField
                    key={fieldConfig.name}
                    control={control}
                    name={fieldConfig.name}
                    label={fieldConfig.label}
                    placeholder={fieldConfig.placeholder}
                    type={fieldConfig.type}
                    fullWidth
                    trim={fieldConfig.trim}
                    slotProps={
                      fieldConfig.shrinkLabel
                        ? {
                            inputLabel: {
                              shrink: true,
                            },
                          }
                        : undefined
                    }
                  />
                ),
              )}
            </Box>

            <RhfCheckboxGroup
              control={control}
              name="workingDays"
              label="Working days"
              options={WORKING_DAY_OPTIONS.map((day) => ({
                label: day,
                value: day,
              }))}
              helperText="Choose the days this branch usually stays open."
            />
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
