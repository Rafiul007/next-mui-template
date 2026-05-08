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
export type DiscountType = "early_bird" | "sibling" | "merit" | "custom";
export type DiscountValueType = "fixed" | "percentage";

const DISCOUNT_DEFAULT_NAMES: Record<DiscountType, string> = {
  early_bird: "Early Bird Discount",
  sibling: "Sibling Discount",
  merit: "Merit Scholarship",
  custom: "",
};

const DISCOUNT_TYPE_OPTIONS = [
  { label: "Early bird", value: "early_bird" },
  { label: "Sibling", value: "sibling" },
  { label: "Merit / Scholarship", value: "merit" },
  { label: "Custom", value: "custom" },
];

const STATUS_OPTIONS = [
  { label: "Upcoming", value: "upcoming" },
  { label: "Ongoing", value: "ongoing" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const MEDIUM_OPTIONS = [
  { label: "Bangla", value: "bangla" },
  { label: "English", value: "english" },
  { label: "Bilingual", value: "bilingual" },
];

const paymentEntrySchema = yup
  .object({
    name: yup.string().trim().required("Payment name is required"),
    amount: yup
      .number()
      .typeError("Enter a valid amount")
      .min(0, "Amount cannot be negative")
      .required("Amount is required"),
  })
  .required();

const discountSchema = yup
  .object({
    type: yup
      .mixed<DiscountType>()
      .oneOf(["early_bird", "sibling", "merit", "custom"] as DiscountType[])
      .required("Type is required"),
    name: yup
      .string()
      .trim()
      .required("Discount name is required")
      .max(80, "Too long"),
    value: yup
      .number()
      .typeError("Enter a valid value")
      .min(0, "Cannot be negative")
      .required("Value is required"),
    valueType: yup
      .mixed<DiscountValueType>()
      .oneOf(["fixed", "percentage"] as DiscountValueType[])
      .required(),
    earlyBirdDeadline: yup
      .string()
      .when("type", {
        is: "early_bird",
        then: (s) => s.required("Deadline is required for early bird"),
        otherwise: (s) => s.optional(),
      })
      .default(""),
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
    totalSeats: yup
      .number()
      .typeError("Total seats must be a number")
      .min(1, "Must have at least 1 seat")
      .integer("Must be a whole number")
      .required("Total seats is required"),
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
    oneTimePayments: yup.array(paymentEntrySchema).default([]),
    monthlyPayments: yup.array(paymentEntrySchema).default([]),
    discounts: yup.array(discountSchema).default([]),
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
  totalSeats: 30,
  deliveryMode: "in-person",
  mediumOfInstruction: "bangla",
  registrationDeadline: "",
  oneTimePayments: [],
  monthlyPayments: [],
  discounts: [],
  certificateOnCompletion: false,
  certificateTemplateName: "",
  prerequisites: "",
  notes: "",
};

type BatchFormDialogProps = {
  errorMessage?: string | null;
  initialValues: BatchFormValues;
  isSubmitting: boolean;
  mode: "create" | "edit";
  onClose: () => void;
  onSubmit: (values: BatchFormValues) => Promise<void>;
  open: boolean;
};

export function BatchFormDialog({
  errorMessage,
  initialValues,
  isSubmitting,
  mode,
  onClose,
  onSubmit,
  open,
}: BatchFormDialogProps) {
  const { control, handleSubmit, getValues, setValue } =
    useForm<BatchFormValues>({
      resolver: yupResolver(batchFormSchema),
      defaultValues: initialValues,
      mode: "onTouched",
    });

  const batchType = useWatch({ control, name: "type" });
  const deliveryMode = useWatch({ control, name: "deliveryMode" });
  const certEnabled = useWatch({ control, name: "certificateOnCompletion" });
  const discountValues = useWatch({ control, name: "discounts" });

  const {
    fields: oneTimeFields,
    append: appendOneTime,
    remove: removeOneTime,
  } = useFieldArray({ control, name: "oneTimePayments" });

  const {
    fields: monthlyFields,
    append: appendMonthly,
    remove: removeMonthly,
  } = useFieldArray({ control, name: "monthlyPayments" });

  const {
    fields: discountFields,
    append: appendDiscount,
    remove: removeDiscount,
  } = useFieldArray({ control, name: "discounts" });

  const title = mode === "create" ? "Create Batch" : "Edit Batch";
  const submitLabel = mode === "create" ? "Create Batch" : "Save Changes";

  const handleDiscountTypeChange = (index: number, newType: DiscountType) => {
    const currentName = getValues(`discounts.${index}.name`);
    const allDefaults = Object.values(DISCOUNT_DEFAULT_NAMES);
    if (!currentName || allDefaults.includes(currentName)) {
      setValue(`discounts.${index}.name`, DISCOUNT_DEFAULT_NAMES[newType]);
    }
    if (newType !== "early_bird") {
      setValue(`discounts.${index}.earlyBirdDeadline`, "");
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
                <RhfTextField
                  control={control}
                  name="totalSeats"
                  label="Total seats"
                  placeholder="e.g. 50"
                  type="number"
                  fullWidth
                  slotProps={{ htmlInput: { min: 1 } }}
                />
                <RhfSelect
                  control={control}
                  name="status"
                  label="Status"
                  options={STATUS_OPTIONS}
                  fullWidth
                />
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

            {/* ── One-time payments ── */}
            <Stack spacing={2}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Stack spacing={0.25}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    One-time payments
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Admission fee, course fee, lab fee, development fee, etc.
                  </Typography>
                </Stack>
                <Button
                  size="small"
                  startIcon={<AddRounded />}
                  onClick={() => appendOneTime({ name: "", amount: 0 })}
                  variant="outlined"
                  sx={{ flexShrink: 0 }}
                >
                  Add
                </Button>
              </Stack>

              {oneTimeFields.length === 0 ? (
                <EmptyPlaceholder label="No one-time payments added yet." />
              ) : (
                <Stack spacing={1.5}>
                  {oneTimeFields.map((field, index) => (
                    <Box
                      key={field.id}
                      sx={{
                        display: "grid",
                        gap: 1.5,
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 160px auto" },
                        alignItems: "start",
                      }}
                    >
                      <RhfTextField
                        control={control}
                        name={`oneTimePayments.${index}.name`}
                        label="Payment name"
                        placeholder="e.g. Admission fee"
                        fullWidth
                        trim
                      />
                      <RhfTextField
                        control={control}
                        name={`oneTimePayments.${index}.amount`}
                        label="Amount"
                        type="number"
                        fullWidth
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">৳</InputAdornment>
                            ),
                          },
                          htmlInput: { min: 0 },
                        }}
                      />
                      <Tooltip title="Remove">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeOneTime(index)}
                          sx={{ mt: 0.5 }}
                        >
                          <DeleteRounded fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ))}
                </Stack>
              )}
            </Stack>

            <Divider />

            {/* ── Monthly payments ── */}
            <Stack spacing={2}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Stack spacing={0.25}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Monthly payments
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Monthly tuition fee, transport fee, etc.
                  </Typography>
                </Stack>
                <Button
                  size="small"
                  startIcon={<AddRounded />}
                  onClick={() => appendMonthly({ name: "", amount: 0 })}
                  variant="outlined"
                  sx={{ flexShrink: 0 }}
                >
                  Add
                </Button>
              </Stack>

              {monthlyFields.length === 0 ? (
                <EmptyPlaceholder label="No monthly payments added yet." />
              ) : (
                <Stack spacing={1.5}>
                  {monthlyFields.map((field, index) => (
                    <Box
                      key={field.id}
                      sx={{
                        display: "grid",
                        gap: 1.5,
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 160px auto" },
                        alignItems: "start",
                      }}
                    >
                      <RhfTextField
                        control={control}
                        name={`monthlyPayments.${index}.name`}
                        label="Payment name"
                        placeholder="e.g. Monthly fee"
                        fullWidth
                        trim
                      />
                      <RhfTextField
                        control={control}
                        name={`monthlyPayments.${index}.amount`}
                        label="Amount"
                        type="number"
                        fullWidth
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">৳</InputAdornment>
                            ),
                          },
                          htmlInput: { min: 0 },
                        }}
                      />
                      <Tooltip title="Remove">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeMonthly(index)}
                          sx={{ mt: 0.5 }}
                        >
                          <DeleteRounded fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ))}
                </Stack>
              )}
            </Stack>

            <Divider />

            {/* ── Discounts ── */}
            <Stack spacing={2}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Stack spacing={0.25}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Discounts
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Early bird, sibling, merit scholarships, or custom rules.
                  </Typography>
                </Stack>
                <Button
                  size="small"
                  startIcon={<AddRounded />}
                  onClick={() =>
                    appendDiscount({
                      type: "custom",
                      name: "",
                      value: 0,
                      valueType: "fixed",
                      earlyBirdDeadline: "",
                    })
                  }
                  variant="outlined"
                  sx={{ flexShrink: 0 }}
                >
                  Add
                </Button>
              </Stack>

              {discountFields.length === 0 ? (
                <EmptyPlaceholder label="No discounts added yet." />
              ) : (
                <Stack spacing={2}>
                  {discountFields.map((field, index) => {
                    const currentType = discountValues?.[index]?.type;
                    return (
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
                                sm: "150px 1fr auto",
                              },
                              alignItems: "start",
                            }}
                          >
                            <RhfSelect
                              control={control}
                              name={`discounts.${index}.type`}
                              label="Type"
                              options={DISCOUNT_TYPE_OPTIONS}
                              onCustomChange={(e) =>
                                handleDiscountTypeChange(
                                  index,
                                  e.target.value as DiscountType,
                                )
                              }
                            />
                            <RhfTextField
                              control={control}
                              name={`discounts.${index}.name`}
                              label="Discount name"
                              placeholder="e.g. Early Bird Discount"
                              fullWidth
                              trim
                            />
                            <Tooltip title="Remove">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => removeDiscount(index)}
                                sx={{ mt: 0.5 }}
                              >
                                <DeleteRounded fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>

                          <Box
                            sx={{
                              display: "grid",
                              gap: 1.5,
                              gridTemplateColumns: {
                                xs: "1fr",
                                sm: "1fr 140px",
                              },
                              alignItems: "start",
                            }}
                          >
                            <RhfTextField
                              control={control}
                              name={`discounts.${index}.value`}
                              label="Discount value"
                              type="number"
                              fullWidth
                              slotProps={{ htmlInput: { min: 0 } }}
                              helperText="Amount in ৳ or percentage off"
                            />
                            <Controller
                              control={control}
                              name={`discounts.${index}.valueType`}
                              render={({ field: vf }) => (
                                <Stack spacing={0.5}>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Unit
                                  </Typography>
                                  <ToggleButtonGroup
                                    exclusive
                                    value={vf.value}
                                    onChange={(
                                      _,
                                      v: DiscountValueType | null,
                                    ) => {
                                      if (v) vf.onChange(v);
                                    }}
                                    size="small"
                                    fullWidth
                                  >
                                    <ToggleButton value="fixed">
                                      ৳ Fixed
                                    </ToggleButton>
                                    <ToggleButton value="percentage">
                                      % Off
                                    </ToggleButton>
                                  </ToggleButtonGroup>
                                </Stack>
                              )}
                            />
                          </Box>

                          {currentType === "early_bird" && (
                            <RhfTextField
                              control={control}
                              name={`discounts.${index}.earlyBirdDeadline`}
                              label="Enroll before"
                              type="date"
                              fullWidth
                              slotProps={{ inputLabel: { shrink: true } }}
                              helperText="Discount applies to enrollments before this date"
                            />
                          )}
                        </Stack>
                      </Box>
                    );
                  })}
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
