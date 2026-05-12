"use client";

import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  AddRounded,
  AutoStoriesRounded,
  DeleteRounded,
  DevicesRounded,
  PeopleRounded,
  SchoolRounded,
  VideocamRounded,
} from "@mui/icons-material";
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
  IconButton,
  InputAdornment,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { RhfSelect, RhfTextField } from "@/components/form";

export type BatchType = "course" | "class";
export type BatchStatus = "upcoming" | "ongoing" | "completed" | "cancelled";
export type DeliveryMode = "in-person" | "online" | "hybrid";
export type MediumOfInstruction = "bangla" | "english" | "bilingual";
export type FeePlanFrequency = "ONE_TIME" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

// Create-only: API forbids COMPLETED / CANCELLED on create
const CREATE_STATUS_OPTIONS = [
  { label: "Upcoming", value: "upcoming" },
  { label: "Ongoing", value: "ongoing" },
];

const CLASS_LEVEL_OPTIONS = [
  { label: "— None —", value: "" },
  { label: "Class 1", value: "class_1" },
  { label: "Class 2", value: "class_2" },
  { label: "Class 3", value: "class_3" },
  { label: "Class 4", value: "class_4" },
  { label: "Class 5", value: "class_5" },
  { label: "Class 6", value: "class_6" },
  { label: "Class 7", value: "class_7" },
  { label: "Class 8", value: "class_8" },
  { label: "Class 9", value: "class_9" },
  { label: "Class 10", value: "class_10" },
  { label: "Class 11", value: "class_11" },
  { label: "Class 12", value: "class_12" },
  { label: "SSC", value: "ssc" },
  { label: "HSC", value: "hsc" },
  { label: "Admission Prep", value: "admission_prep" },
  { label: "IELTS", value: "ielts" },
  { label: "Other", value: "other" },
];

const MEDIUM_OPTIONS = [
  { label: "Bangla", value: "bangla" },
  { label: "English", value: "english" },
  { label: "Bilingual", value: "bilingual" },
];

const FREQUENCY_OPTIONS = [
  { label: "One-time", value: "ONE_TIME" },
  { label: "Daily", value: "DAILY" },
  { label: "Weekly", value: "WEEKLY" },
  { label: "Monthly", value: "MONTHLY" },
  { label: "Yearly", value: "YEARLY" },
];

const feePlanSchema = yup
  .object({
    feeTypeId: yup.string().required("Fee type is required"),
    amount: yup
      .number()
      .typeError("Enter a valid amount")
      .min(0, "Cannot be negative")
      .required("Amount is required"),
    frequency: yup
      .mixed<FeePlanFrequency>()
      .oneOf(
        ["ONE_TIME", "DAILY", "WEEKLY", "MONTHLY", "YEARLY"] as FeePlanFrequency[],
      )
      .required()
      .default("ONE_TIME"),
  })
  .required();

const batchFormSchema = yup
  .object({
    type: yup
      .mixed<BatchType>()
      .oneOf(["course", "class"] as BatchType[])
      .required("Batch type is required"),
    status: yup
      .mixed<BatchStatus>()
      .oneOf(["upcoming", "ongoing", "completed", "cancelled"] as BatchStatus[])
      .required()
      .default("upcoming"),
    courseName: yup
      .string()
      .trim()
      .when("type", {
        is: "course",
        then: (s) =>
          s.required("Course name is required").max(100, "Too long"),
        otherwise: (s) => s.optional(),
      })
      .default(""),
    batchNumber: yup
      .string()
      .trim()
      .when("type", {
        is: "course",
        then: (s) =>
          s.required("Batch number is required").max(50, "Too long"),
        otherwise: (s) => s.optional(),
      })
      .default(""),
    className: yup
      .string()
      .trim()
      .when("type", {
        is: "class",
        then: (s) =>
          s.required("Class name is required").max(100, "Too long"),
        otherwise: (s) => s.optional(),
      })
      .default(""),
    section: yup.string().trim().max(50, "Too long").default(""),
    classLevel: yup.string().default(""),
    totalSeats: yup
      .number()
      .typeError("Total seats must be a number")
      .min(1, "Must have at least 1 seat")
      .integer("Must be a whole number")
      .required("Total seats is required"),
    startDate: yup.string().default(""),
    endDate: yup.string().default(""),
    deliveryMode: yup
      .mixed<DeliveryMode>()
      .oneOf(["in-person", "online", "hybrid"] as DeliveryMode[])
      .required()
      .default("in-person"),
    mediumOfInstruction: yup
      .mixed<MediumOfInstruction>()
      .oneOf(["bangla", "english", "bilingual"] as MediumOfInstruction[])
      .required()
      .default("bangla"),
    registrationDeadline: yup.string().default(""),
    feePlans: yup.array(feePlanSchema).default([]),
    certificateOnCompletion: yup.boolean().required().default(false),
    certificateTemplateName: yup.string().trim().max(100, "Too long").default(""),
    prerequisites: yup.string().trim().max(500, "Too long").default(""),
    notes: yup.string().trim().max(1000, "Too long").default(""),
  })
  .required();

export type BatchFormValues = yup.InferType<typeof batchFormSchema>;

export const emptyBatchFormValues: BatchFormValues = {
  type: "course",
  status: "upcoming",
  courseName: "",
  batchNumber: "",
  className: "",
  section: "",
  classLevel: "",
  totalSeats: 30,
  startDate: "",
  endDate: "",
  deliveryMode: "in-person",
  mediumOfInstruction: "bangla",
  registrationDeadline: "",
  feePlans: [],
  certificateOnCompletion: false,
  certificateTemplateName: "",
  prerequisites: "",
  notes: "",
};

type FeeTypeOption = { id: string; typeName: string; isRecurring: boolean };

type BatchFormDialogProps = {
  errorMessage?: string | null;
  feeTypes: FeeTypeOption[];
  initialValues: BatchFormValues;
  isSubmitting: boolean;
  mode: "create" | "edit";
  onClose: () => void;
  onSubmit: (values: BatchFormValues) => Promise<void>;
  open: boolean;
};

export function BatchFormDialog({
  errorMessage,
  feeTypes,
  initialValues,
  isSubmitting,
  mode,
  onClose,
  onSubmit,
  open,
}: BatchFormDialogProps) {
  const { control, handleSubmit, setValue } = useForm<BatchFormValues>({
    resolver: yupResolver(batchFormSchema),
    defaultValues: initialValues,
    mode: "onTouched",
  });

  const batchType = useWatch({ control, name: "type" });
  const deliveryMode = useWatch({ control, name: "deliveryMode" });
  const certEnabled = useWatch({ control, name: "certificateOnCompletion" });

  const {
    fields: feeFields,
    append: appendFee,
    remove: removeFee,
  } = useFieldArray({ control, name: "feePlans" });

  const title = mode === "create" ? "Create Batch" : "Edit Batch";
  const submitLabel = mode === "create" ? "Create Batch" : "Save Changes";

  const feeTypeOptions = feeTypes.map((ft) => ({
    label: ft.typeName,
    value: ft.id,
  }));

  const handleFeeTypeChange = (index: number, feeTypeId: string) => {
    const feeType = feeTypes.find((ft) => ft.id === feeTypeId);
    if (feeType) {
      setValue(
        `feePlans.${index}.frequency`,
        feeType.isRecurring ? "MONTHLY" : "ONE_TIME",
      );
    }
  };

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
          <Stack spacing={4}>
            {errorMessage ? (
              <Alert severity="error">{errorMessage}</Alert>
            ) : null}

            {/* ── Batch type ── */}
            <Stack spacing={1.5}>
              <Typography variant="subtitle2" fontWeight={700}>
                Batch type
              </Typography>
              <Controller
                control={control}
                name="type"
                render={({ field, fieldState: { error } }) => (
                  <Stack spacing={1}>
                    <ToggleButtonGroup
                      exclusive
                      value={field.value}
                      onChange={(_, value: BatchType | null) => {
                        if (value) field.onChange(value);
                      }}
                      size="small"
                    >
                      <ToggleButton value="course" sx={{ px: 3, gap: 1 }}>
                        <SchoolRounded fontSize="small" />
                        Course
                      </ToggleButton>
                      <ToggleButton value="class" sx={{ px: 3, gap: 1 }}>
                        <AutoStoriesRounded fontSize="small" />
                        Class
                      </ToggleButton>
                    </ToggleButtonGroup>
                    {error ? (
                      <Typography variant="caption" color="error">
                        {error.message}
                      </Typography>
                    ) : null}
                    <Typography variant="caption" color="text.secondary">
                      {batchType === "course"
                        ? "Online or offline course with batch numbers — e.g. Calculus · Batch 1, Batch 2"
                        : "Regular class with section — e.g. Class 9 · Section A"}
                    </Typography>
                  </Stack>
                )}
              />
            </Stack>

            <Divider />

            {/* ── Batch details ── */}
            <Stack spacing={1.5}>
              <Typography variant="subtitle2" fontWeight={700}>
                Batch details
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                }}
              >
                {batchType === "course" ? (
                  <>
                    <RhfTextField
                      control={control}
                      name="courseName"
                      label="Course name"
                      placeholder="e.g. Calculus, Physics, English"
                      fullWidth
                      trim
                    />
                    <RhfTextField
                      control={control}
                      name="batchNumber"
                      label="Batch number"
                      placeholder="e.g. Batch 1, Batch 2"
                      fullWidth
                      trim
                    />
                  </>
                ) : (
                  <>
                    <RhfTextField
                      control={control}
                      name="className"
                      label="Class name"
                      placeholder="e.g. Class 9, Class 10"
                      fullWidth
                      trim
                    />
                    <RhfTextField
                      control={control}
                      name="section"
                      label="Section"
                      placeholder="e.g. Section A, Section B"
                      fullWidth
                      trim
                    />
                  </>
                )}

                <RhfSelect
                  control={control}
                  name="classLevel"
                  label="Class level"
                  options={CLASS_LEVEL_OPTIONS}
                  fullWidth
                />

                <RhfTextField
                  control={control}
                  name="totalSeats"
                  label="Total seats"
                  placeholder="e.g. 50"
                  type="number"
                  fullWidth
                  slotProps={{ htmlInput: { min: 1 } }}
                />

                <RhfTextField
                  control={control}
                  name="startDate"
                  label="Start date"
                  type="date"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />

                <RhfTextField
                  control={control}
                  name="endDate"
                  label="End date"
                  type="date"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />

                {/* Status only shown on create — API forbids COMPLETED/CANCELLED at creation.
                    On edit, status transitions go through changeBatchStatus in the table. */}
                {mode === "create" && (
                  <RhfSelect
                    control={control}
                    name="status"
                    label="Initial status"
                    options={CREATE_STATUS_OPTIONS}
                    fullWidth
                  />
                )}
              </Box>
            </Stack>

            <Divider />

            {/* ── Delivery & access ── */}
            <Stack spacing={2}>
              <Typography variant="subtitle2" fontWeight={700}>
                Delivery & access
              </Typography>

              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Delivery mode
                </Typography>
                <Controller
                  control={control}
                  name="deliveryMode"
                  render={({ field }) => (
                    <ToggleButtonGroup
                      exclusive
                      value={field.value}
                      onChange={(_, value: DeliveryMode | null) => {
                        if (value) field.onChange(value);
                      }}
                      size="small"
                    >
                      <ToggleButton value="in-person" sx={{ px: 2.5, gap: 1 }}>
                        <PeopleRounded fontSize="small" />
                        In-person
                      </ToggleButton>
                      <ToggleButton value="online" sx={{ px: 2.5, gap: 1 }}>
                        <VideocamRounded fontSize="small" />
                        Online
                      </ToggleButton>
                      <ToggleButton value="hybrid" sx={{ px: 2.5, gap: 1 }}>
                        <DevicesRounded fontSize="small" />
                        Hybrid
                      </ToggleButton>
                    </ToggleButtonGroup>
                  )}
                />
                {deliveryMode === "hybrid" && (
                  <Typography variant="caption" color="text.secondary">
                    Hybrid batches alternate between in-person and online
                    sessions.
                  </Typography>
                )}
              </Stack>

              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                }}
              >
                <RhfSelect
                  control={control}
                  name="mediumOfInstruction"
                  label="Medium of instruction"
                  options={MEDIUM_OPTIONS}
                  fullWidth
                />
                <RhfTextField
                  control={control}
                  name="registrationDeadline"
                  label="Registration deadline"
                  type="date"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  helperText="Leave blank if enrollment is always open"
                />
              </Box>
            </Stack>

            <Divider />

            {/* ── Fee plans ── */}
            <Stack spacing={2}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Stack spacing={0.25}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Fee plans
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Admission fee, monthly tuition, and other charges for this
                    batch.
                  </Typography>
                </Stack>
                <Button
                  size="small"
                  startIcon={<AddRounded />}
                  onClick={() =>
                    appendFee({ feeTypeId: "", amount: 0, frequency: "ONE_TIME" })
                  }
                  variant="outlined"
                  sx={{ flexShrink: 0 }}
                >
                  Add
                </Button>
              </Stack>

              {feeFields.length === 0 ? (
                <EmptyPlaceholder label="No fee plans added yet." />
              ) : (
                <Stack spacing={2}>
                  {feeFields.map((field, index) => (
                    <Box
                      key={field.id}
                      sx={{
                        p: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                      }}
                    >
                      <Stack spacing={1.5}>
                        <Box
                          sx={{
                            display: "grid",
                            gap: 1.5,
                            gridTemplateColumns: {
                              xs: "1fr",
                              sm: "1fr 150px auto",
                            },
                            alignItems: "start",
                          }}
                        >
                          <RhfSelect
                            control={control}
                            name={`feePlans.${index}.feeTypeId`}
                            label="Fee type"
                            options={feeTypeOptions}
                            fullWidth
                            onCustomChange={(e) =>
                              handleFeeTypeChange(
                                index,
                                e.target.value as string,
                              )
                            }
                          />
                          <RhfTextField
                            control={control}
                            name={`feePlans.${index}.amount`}
                            label="Amount"
                            type="number"
                            fullWidth
                            slotProps={{
                              input: {
                                startAdornment: (
                                  <InputAdornment position="start">
                                    ৳
                                  </InputAdornment>
                                ),
                              },
                              htmlInput: { min: 0 },
                            }}
                          />
                          <Tooltip title="Remove">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeFee(index)}
                              sx={{ mt: 0.5 }}
                            >
                              <DeleteRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>

                        <RhfSelect
                          control={control}
                          name={`feePlans.${index}.frequency`}
                          label="Billing frequency"
                          options={FREQUENCY_OPTIONS}
                          fullWidth
                        />
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </Stack>

            <Divider />

            {/* ── Completion & notes ── */}
            <Stack spacing={2}>
              <Typography variant="subtitle2" fontWeight={700}>
                Completion & notes
              </Typography>

              <Stack spacing={0.5}>
                <Controller
                  control={control}
                  name="certificateOnCompletion"
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      }
                      label="Issue certificate on completion"
                    />
                  )}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ pl: 6.5 }}
                >
                  Students who finish this batch will receive a certificate.
                </Typography>
              </Stack>

              {certEnabled && (
                <RhfTextField
                  control={control}
                  name="certificateTemplateName"
                  label="Certificate template name"
                  placeholder="e.g. HSC Preparation Certificate"
                  fullWidth
                  trim
                  helperText="Name that appears on the issued certificate"
                />
              )}

              <RhfTextField
                control={control}
                name="prerequisites"
                label="Prerequisites"
                placeholder="e.g. Must have completed Class 8 or equivalent"
                fullWidth
                trim
                helperText="Requirements students should meet before enrolling"
              />

              <RhfTextField
                control={control}
                name="notes"
                label="Internal notes"
                placeholder="Staff-only notes about this batch"
                fullWidth
                trim
                multiline
                rows={3}
                helperText="Not visible to students or guardians"
              />
            </Stack>
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

function EmptyPlaceholder({ label }: { label: string }) {
  return (
    <Box
      sx={{
        p: 2,
        border: "1px dashed",
        borderColor: "divider",
        borderRadius: 1,
        textAlign: "center",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}
