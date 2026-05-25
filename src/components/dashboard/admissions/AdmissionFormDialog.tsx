"use client";

import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  AddRounded,
  CheckRounded,
  DeleteRounded,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { RhfSelect, RhfTextField } from "@/components/form";

// ── Shared types ──────────────────────────────────────────────────────────────

export type PaymentEntry = { name: string; amount: number };

export type BatchDiscount = {
  name: string;
  value: number;
  valueType: "fixed" | "percentage";
};

export type BatchSummary = {
  id: string;
  displayName: string;
  type: "course" | "class";
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  totalSeats: number;
  enrolledCount: number;
  oneTimePayments: PaymentEntry[];
  monthlyPayments: PaymentEntry[];
  discounts: BatchDiscount[];
};

export type QualificationEntry = {
  institution: string;
  exam: string;
  gradeGpa: string;
  passingYear: string;
  board: string;
};

// ── Select options ────────────────────────────────────────────────────────────

const GENDER_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

const BLOOD_GROUP_OPTIONS = [
  { label: "A+", value: "A+" },
  { label: "A-", value: "A-" },
  { label: "B+", value: "B+" },
  { label: "B-", value: "B-" },
  { label: "O+", value: "O+" },
  { label: "O-", value: "O-" },
  { label: "AB+", value: "AB+" },
  { label: "AB-", value: "AB-" },
];

const GUARDIAN_RELATION_OPTIONS = [
  { label: "Father", value: "father" },
  { label: "Mother", value: "mother" },
  { label: "Sibling", value: "sibling" },
  { label: "Grandparent", value: "grandparent" },
  { label: "Uncle / Aunt", value: "uncle_aunt" },
  { label: "Legal guardian", value: "guardian" },
  { label: "Other", value: "other" },
];

const ADMISSION_SOURCE_OPTIONS = [
  { label: "Walk-in", value: "walk_in" },
  { label: "Referral", value: "referral" },
  { label: "Social media", value: "social_media" },
  { label: "Website", value: "website" },
  { label: "Banner / flyer", value: "banner" },
  { label: "Previous student", value: "previous_student" },
  { label: "Other", value: "other" },
];

const DIVISION_OPTIONS = [
  { label: "Dhaka", value: "dhaka" },
  { label: "Chittagong", value: "chittagong" },
  { label: "Rajshahi", value: "rajshahi" },
  { label: "Khulna", value: "khulna" },
  { label: "Sylhet", value: "sylhet" },
  { label: "Barisal", value: "barisal" },
  { label: "Rangpur", value: "rangpur" },
  { label: "Mymensingh", value: "mymensingh" },
];

const EXAM_OPTIONS = [
  { label: "PSC / PEC", value: "psc" },
  { label: "JSC / JDC", value: "jsc" },
  { label: "SSC / Dakhil", value: "ssc" },
  { label: "HSC / Alim", value: "hsc" },
  { label: "O-Level", value: "o_level" },
  { label: "A-Level", value: "a_level" },
  { label: "Other", value: "other" },
];

const BOARD_OPTIONS = [
  { label: "Dhaka", value: "dhaka" },
  { label: "Chittagong", value: "chittagong" },
  { label: "Rajshahi", value: "rajshahi" },
  { label: "Sylhet", value: "sylhet" },
  { label: "Barisal", value: "barisal" },
  { label: "Comilla", value: "comilla" },
  { label: "Jessore", value: "jessore" },
  { label: "Dinajpur", value: "dinajpur" },
  { label: "Madrasa Board", value: "madrasa" },
  { label: "Technical Board", value: "technical" },
  { label: "Other", value: "other" },
];

// ── Schema ────────────────────────────────────────────────────────────────────

const qualificationSchema = yup
  .object({
    institution: yup
      .string()
      .trim()
      .required("Institution name is required")
      .max(150, "Too long"),
    exam: yup.string().required("Examination is required").default(""),
    gradeGpa: yup.string().trim().max(20, "Too long").default(""),
    passingYear: yup
      .string()
      .trim()
      .matches(/^$|^\d{4}$/, "Enter a valid 4-digit year")
      .default(""),
    board: yup.string().default(""),
  })
  .required();

const admissionFormSchema = yup
  .object({
    // Personal
    firstName: yup
      .string()
      .trim()
      .required("First name is required")
      .max(50, "Too long"),
    lastName: yup.string().trim().max(50, "Too long").default(""),
    firstNameBangla: yup.string().trim().max(60, "Too long").default(""),
    dob: yup.string().default(""),
    gender: yup.string().default(""),
    bloodGroup: yup.string().default(""),
    phone: yup
      .string()
      .trim()
      .matches(/^$|^[0-9+\-() ]+$/, "Use numbers and basic characters only")
      .max(20, "Too long")
      .default(""),
    email: yup.string().email("Invalid email address").trim().default(""),
    classLevel: yup.string().trim().max(60, "Too long").default(""),

    // Address
    address: yup.string().trim().max(300, "Too long").default(""),
    division: yup.string().default(""),
    district: yup.string().trim().max(60, "Too long").default(""),
    upazila: yup.string().trim().max(60, "Too long").default(""),
    village: yup.string().trim().max(60, "Too long").default(""),

    // Academic background
    previousInstitution: yup.string().trim().max(150, "Too long").default(""),
    previousResult: yup.string().trim().max(100, "Too long").default(""),
    admissionSource: yup.string().default(""),

    // Guardian
    guardianName: yup
      .string()
      .trim()
      .required("Guardian name is required")
      .max(100, "Too long"),
    guardianRelation: yup.string().required("Relation is required").default(""),
    guardianPhone: yup
      .string()
      .trim()
      .required("Guardian phone is required")
      .matches(/^[0-9+\-() ]+$/, "Use numbers and basic characters only")
      .max(20, "Too long"),
    guardianEmail: yup
      .string()
      .email("Invalid email address")
      .trim()
      .default(""),
    guardianOccupation: yup.string().trim().max(100, "Too long").default(""),
    guardianNid: yup.string().trim().max(30, "Too long").default(""),

    // Qualifications (dynamic)
    qualifications: yup
      .array(qualificationSchema)
      .default([
        { institution: "", exam: "", gradeGpa: "", passingYear: "", board: "" },
      ]),

    // Batch
    batchId: yup.string().required("Please select a batch"),

    // Applied discount indexes from the selected batch
    appliedDiscountIndexes: yup.array(yup.number().required()).default([]),

    // Notes
    notes: yup.string().trim().max(500, "Too long").default(""),
  })
  .required();

export type AdmissionFormValues = yup.InferType<typeof admissionFormSchema>;

export const emptyAdmissionFormValues: AdmissionFormValues = {
  firstName: "",
  lastName: "",
  firstNameBangla: "",
  dob: "",
  gender: "",
  bloodGroup: "",
  phone: "",
  email: "",
  classLevel: "",
  address: "",
  division: "",
  district: "",
  upazila: "",
  village: "",
  previousInstitution: "",
  previousResult: "",
  admissionSource: "",
  guardianName: "",
  guardianRelation: "",
  guardianPhone: "",
  guardianEmail: "",
  guardianOccupation: "",
  guardianNid: "",
  qualifications: [
    { institution: "", exam: "", gradeGpa: "", passingYear: "", board: "" },
  ],
  batchId: "",
  appliedDiscountIndexes: [],
  notes: "",
};

// ── Props ────────────────────────────────────────────────────────────────────

type AdmissionFormDialogProps = {
  batches: BatchSummary[];
  errorMessage?: string | null;
  initialValues: AdmissionFormValues;
  isSubmitting: boolean;
  mode: "create" | "edit";
  onClose: () => void;
  onSubmit: (values: AdmissionFormValues) => Promise<void>;
  open: boolean;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatAmount = (n: number) => `৳${n.toLocaleString("en-BD")}`;

const calcDiscount = (
  discount: BatchDiscount,
  oneTimeTotal: number,
): number => {
  if (discount.valueType === "fixed") return discount.value;
  return Math.round((oneTimeTotal * discount.value) / 100);
};

// ── Component ────────────────────────────────────────────────────────────────

export function AdmissionFormDialog({
  batches,
  errorMessage,
  initialValues,
  isSubmitting,
  mode,
  onClose,
  onSubmit,
  open,
}: AdmissionFormDialogProps) {
  const { control, handleSubmit, getValues, setValue } =
    useForm<AdmissionFormValues>({
      resolver: yupResolver(admissionFormSchema),
      defaultValues: initialValues,
      mode: "onTouched",
    });

  const selectedBatchId = useWatch({ control, name: "batchId" });
  const appliedDiscountIndexes = useWatch({
    control,
    name: "appliedDiscountIndexes",
  });

  const selectedBatch = batches.find((b) => b.id === selectedBatchId) ?? null;

  const {
    fields: qualFields,
    append: appendQual,
    remove: removeQual,
  } = useFieldArray({ control, name: "qualifications" });

  const batchOptions = batches
    .filter((b) => b.status !== "cancelled" && b.status !== "completed")
    .map((b) => {
      const available = b.totalSeats - b.enrolledCount;
      const full = available <= 0;
      return {
        label: `${b.displayName} — ${full ? "Full" : `${available} seats left`}`,
        value: b.id,
        disabled: full,
      };
    });

  const toggleDiscount = (index: number) => {
    const current = getValues("appliedDiscountIndexes");
    if (current.includes(index)) {
      setValue(
        "appliedDiscountIndexes",
        current.filter((i) => i !== index),
      );
    } else {
      setValue("appliedDiscountIndexes", [...current, index]);
    }
  };

  const oneTimeTotal = selectedBatch?.oneTimePayments.reduce(
    (s, p) => s + p.amount,
    0,
  ) ?? 0;
  const monthlyTotal = selectedBatch?.monthlyPayments.reduce(
    (s, p) => s + p.amount,
    0,
  ) ?? 0;
  const totalDiscount = (appliedDiscountIndexes ?? []).reduce((sum, idx) => {
    const d = selectedBatch?.discounts[idx];
    return d ? sum + calcDiscount(d, oneTimeTotal) : sum;
  }, 0);
  const finalOneTime = Math.max(0, oneTimeTotal - totalDiscount);

  const title = mode === "create" ? "New Admission" : "Edit Student Record";
  const submitLabel = mode === "create" ? "Admit Student" : "Save Changes";

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle>{title}</DialogTitle>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers>
          <Stack spacing={4}>
            {errorMessage ? (
              <Alert severity="error">{errorMessage}</Alert>
            ) : null}

            {/* ── Personal information ── */}
            <Stack spacing={2}>
              <SectionHeading
                title="Personal information"
                subtitle="Basic identification and contact details of the student."
              />
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                }}
              >
                <RhfTextField
                  control={control}
                  name="firstName"
                  label="First name *"
                  placeholder="e.g. Rafiul"
                  fullWidth
                  trim
                />
                <RhfTextField
                  control={control}
                  name="lastName"
                  label="Last name"
                  placeholder="e.g. Hasan"
                  fullWidth
                  trim
                />
                <RhfTextField
                  control={control}
                  name="firstNameBangla"
                  label="Name in Bangla"
                  placeholder="e.g. রাফিউল"
                  fullWidth
                  trim
                />
                <RhfTextField
                  control={control}
                  name="classLevel"
                  label="Class / Level"
                  placeholder="e.g. Class 9, HSC 1st Year"
                  fullWidth
                  trim
                />
                <RhfTextField
                  control={control}
                  name="dob"
                  label="Date of birth"
                  type="date"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <RhfSelect
                  control={control}
                  name="gender"
                  label="Gender"
                  options={GENDER_OPTIONS}
                  fullWidth
                />
                <RhfSelect
                  control={control}
                  name="bloodGroup"
                  label="Blood group"
                  options={BLOOD_GROUP_OPTIONS}
                  fullWidth
                />
                <RhfTextField
                  control={control}
                  name="phone"
                  label="Phone number"
                  placeholder="+8801XXXXXXXXX"
                  fullWidth
                  trim
                />
                <RhfTextField
                  control={control}
                  name="email"
                  label="Email address"
                  placeholder="student@example.com"
                  type="email"
                  fullWidth
                  trim
                />
                <RhfSelect
                  control={control}
                  name="admissionSource"
                  label="How did they hear about us?"
                  options={[{ label: "Not specified", value: "" }, ...ADMISSION_SOURCE_OPTIONS]}
                  fullWidth
                />
              </Box>
            </Stack>

            <Divider />

            {/* ── Address ── */}
            <Stack spacing={2}>
              <SectionHeading
                title="Address"
                subtitle="Student's home address and location details."
              />
              <RhfTextField
                control={control}
                name="address"
                label="Full address"
                placeholder="Road, area, city"
                fullWidth
                trim
              />
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                }}
              >
                <RhfSelect
                  control={control}
                  name="division"
                  label="Division"
                  options={[{ label: "Select division", value: "" }, ...DIVISION_OPTIONS]}
                  fullWidth
                />
                <RhfTextField
                  control={control}
                  name="district"
                  label="District"
                  placeholder="e.g. Dhaka"
                  fullWidth
                  trim
                />
                <RhfTextField
                  control={control}
                  name="upazila"
                  label="Upazila / Thana"
                  placeholder="e.g. Dhanmondi"
                  fullWidth
                  trim
                />
                <RhfTextField
                  control={control}
                  name="village"
                  label="Village / Area"
                  placeholder="e.g. Jigatola"
                  fullWidth
                  trim
                />
              </Box>
            </Stack>

            <Divider />

            {/* ── Academic background ── */}
            <Stack spacing={2}>
              <SectionHeading
                title="Academic background"
                subtitle="Previous institution and result before joining."
              />
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                }}
              >
                <RhfTextField
                  control={control}
                  name="previousInstitution"
                  label="Previous institution"
                  placeholder="e.g. Dhaka Residential Model College"
                  fullWidth
                  trim
                />
                <RhfTextField
                  control={control}
                  name="previousResult"
                  label="Previous result / GPA"
                  placeholder="e.g. GPA 5.00, A+"
                  fullWidth
                  trim
                />
              </Box>
            </Stack>

            <Divider />

            {/* ── Guardian information ── */}
            <Stack spacing={2}>
              <SectionHeading
                title="Guardian information"
                subtitle="Primary contact responsible for this student."
              />
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                }}
              >
                <RhfTextField
                  control={control}
                  name="guardianName"
                  label="Guardian name"
                  placeholder="e.g. Mohammad Karim"
                  fullWidth
                  trim
                />
                <RhfSelect
                  control={control}
                  name="guardianRelation"
                  label="Relation"
                  options={GUARDIAN_RELATION_OPTIONS}
                  fullWidth
                />
                <RhfTextField
                  control={control}
                  name="guardianPhone"
                  label="Guardian phone"
                  placeholder="+8801XXXXXXXXX"
                  fullWidth
                  trim
                />
                <RhfTextField
                  control={control}
                  name="guardianEmail"
                  label="Guardian email"
                  placeholder="guardian@example.com"
                  type="email"
                  fullWidth
                  trim
                />
                <RhfTextField
                  control={control}
                  name="guardianOccupation"
                  label="Occupation"
                  placeholder="e.g. Teacher, Business"
                  fullWidth
                  trim
                />
                <RhfTextField
                  control={control}
                  name="guardianNid"
                  label="NID / Passport no."
                  placeholder="National ID or passport number"
                  fullWidth
                  trim
                />
              </Box>
            </Stack>

            <Divider />

            {/* ── Educational qualifications (dynamic) ── */}
            <Stack spacing={2}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <SectionHeading
                  title="Educational qualifications"
                  subtitle="Add all academic qualifications, most recent first."
                />
                <Button
                  size="small"
                  startIcon={<AddRounded />}
                  variant="outlined"
                  onClick={() =>
                    appendQual({
                      institution: "",
                      exam: "",
                      gradeGpa: "",
                      passingYear: "",
                      board: "",
                    })
                  }
                  sx={{ flexShrink: 0, ml: 2 }}
                >
                  Add
                </Button>
              </Stack>

              <Stack spacing={2}>
                {qualFields.map((field, index) => (
                  <Box
                    key={field.id}
                    sx={{
                      p: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    <Stack spacing={2}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="body2" fontWeight={600}>
                          Qualification {index + 1}
                        </Typography>
                        {qualFields.length > 1 && (
                          <Tooltip title="Remove">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeQual(index)}
                            >
                              <DeleteRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>

                      <RhfTextField
                        control={control}
                        name={`qualifications.${index}.institution`}
                        label="Institution name"
                        placeholder="e.g. Dhaka Residential Model College"
                        fullWidth
                        trim
                      />

                      <Box
                        sx={{
                          display: "grid",
                          gap: 2,
                          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                        }}
                      >
                        <RhfSelect
                          control={control}
                          name={`qualifications.${index}.exam`}
                          label="Examination"
                          options={EXAM_OPTIONS}
                          fullWidth
                        />
                        <RhfTextField
                          control={control}
                          name={`qualifications.${index}.gradeGpa`}
                          label="Grade / GPA"
                          placeholder="e.g. 5.00, A+"
                          fullWidth
                          trim
                        />
                        <RhfTextField
                          control={control}
                          name={`qualifications.${index}.passingYear`}
                          label="Passing year"
                          placeholder="e.g. 2024"
                          fullWidth
                          trim
                          slotProps={{ htmlInput: { maxLength: 4 } }}
                        />
                        <RhfSelect
                          control={control}
                          name={`qualifications.${index}.board`}
                          label="Board"
                          options={BOARD_OPTIONS}
                          fullWidth
                        />
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Stack>

            <Divider />

            {/* ── Batch enrollment & fees ── */}
            <Stack spacing={2}>
              <SectionHeading
                title="Batch enrollment"
                subtitle="Select the batch this student is being admitted into."
              />

              {batchOptions.length === 0 ? (
                <Alert severity="warning">
                  {batches.length === 0
                    ? "No batches found. Create a batch first before admitting students."
                    : "All batches are completed or cancelled. Create or reactivate a batch to proceed."}
                </Alert>
              ) : (
                <RhfSelect
                  control={control}
                  name="batchId"
                  label="Select batch"
                  options={batchOptions}
                  fullWidth
                  onCustomChange={() =>
                    setValue("appliedDiscountIndexes", [])
                  }
                />
              )}

              {selectedBatch && (
                <Stack spacing={2}>
                  {/* Fee structure */}
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: alpha("#10b981", 0.25),
                      bgcolor: alpha("#f0fdf4", 0.6),
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                      Fee structure — {selectedBatch.displayName}
                    </Typography>

                    <Stack spacing={1.5}>
                      {selectedBatch.oneTimePayments.length > 0 && (
                        <FeeGroup
                          label="One-time payments"
                          rows={selectedBatch.oneTimePayments.map((p) => ({
                            name: p.name,
                            display: formatAmount(p.amount),
                          }))}
                          total={formatAmount(oneTimeTotal)}
                        />
                      )}

                      {selectedBatch.monthlyPayments.length > 0 && (
                        <FeeGroup
                          label="Monthly payments"
                          rows={selectedBatch.monthlyPayments.map((p) => ({
                            name: p.name,
                            display: `${formatAmount(p.amount)}/mo`,
                          }))}
                          total={`${formatAmount(monthlyTotal)}/mo`}
                        />
                      )}

                      {selectedBatch.oneTimePayments.length === 0 &&
                        selectedBatch.monthlyPayments.length === 0 && (
                          <Typography variant="body2" color="text.secondary">
                            No fees configured for this batch.
                          </Typography>
                        )}
                    </Stack>
                  </Box>

                  {/* Discount selection */}
                  {selectedBatch.discounts.length > 0 && (
                    <Stack spacing={1.5}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        Available discounts
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Select the discounts that apply to this student.
                      </Typography>

                      <Stack spacing={1}>
                        {selectedBatch.discounts.map((discount, idx) => {
                          const applied = (
                            appliedDiscountIndexes ?? []
                          ).includes(idx);
                          const saving = calcDiscount(discount, oneTimeTotal);

                          return (
                            <Box
                              key={idx}
                              onClick={() => toggleDiscount(idx)}
                              sx={{
                                p: 1.75,
                                border: "1px solid",
                                borderColor: applied
                                  ? alpha("#10b981", 0.45)
                                  : "divider",
                                borderRadius: 1,
                                cursor: "pointer",
                                bgcolor: applied
                                  ? alpha("#f0fdf4", 0.8)
                                  : "transparent",
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                transition: "all 120ms ease",
                                "&:hover": {
                                  borderColor: alpha("#10b981", 0.35),
                                  bgcolor: alpha("#f0fdf4", 0.5),
                                },
                              }}
                            >
                              <Checkbox
                                checked={applied}
                                onChange={() => toggleDiscount(idx)}
                                onClick={(e) => e.stopPropagation()}
                                size="small"
                                color="success"
                                sx={{ p: 0 }}
                              />
                              <Stack flexGrow={1}>
                                <Typography variant="body2" fontWeight={600}>
                                  {discount.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {discount.valueType === "fixed"
                                    ? `Flat ${formatAmount(discount.value)} off one-time total`
                                    : `${discount.value}% off one-time total`}
                                </Typography>
                              </Stack>
                              <Typography
                                variant="body2"
                                fontWeight={700}
                                color="success.main"
                              >
                                −{formatAmount(saving)}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Stack>

                      {/* Final total after discounts */}
                      {(appliedDiscountIndexes ?? []).length > 0 && (
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 1,
                            border: "1px solid",
                            borderColor: alpha("#10b981", 0.3),
                            bgcolor: alpha("#f0fdf4", 0.5),
                          }}
                        >
                          <Stack spacing={0.75}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                One-time subtotal
                              </Typography>
                              <Typography variant="body2">
                                {formatAmount(oneTimeTotal)}
                              </Typography>
                            </Stack>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                            >
                              <Typography
                                variant="body2"
                                color="success.main"
                              >
                                Discounts applied
                              </Typography>
                              <Typography
                                variant="body2"
                                color="success.main"
                                fontWeight={600}
                              >
                                −{formatAmount(totalDiscount)}
                              </Typography>
                            </Stack>
                            <Divider />
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                            >
                              <Typography variant="body2" fontWeight={700}>
                                Final one-time total
                              </Typography>
                              <Stack direction="row" spacing={0.75} alignItems="center">
                                <CheckRounded
                                  sx={{ fontSize: 16, color: "success.main" }}
                                />
                                <Typography
                                  variant="body2"
                                  fontWeight={700}
                                  color="success.main"
                                >
                                  {formatAmount(finalOneTime)}
                                </Typography>
                              </Stack>
                            </Stack>
                            {monthlyTotal > 0 && (
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                              >
                                <Typography variant="body2" fontWeight={700}>
                                  Monthly total
                                </Typography>
                                <Typography variant="body2" fontWeight={700}>
                                  {formatAmount(monthlyTotal)}/mo
                                </Typography>
                              </Stack>
                            )}
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  )}
                </Stack>
              )}
            </Stack>

            <Divider />

            {/* ── Notes ── */}
            <Stack spacing={2}>
              <SectionHeading
                title="Admission notes"
                subtitle="Internal remarks — not visible to the student or guardian."
              />
              <RhfTextField
                control={control}
                name="notes"
                label="Notes"
                placeholder="Any special remarks, conditions, or instructions..."
                fullWidth
                trim
                multiline
                rows={3}
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

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="subtitle1" fontWeight={700}>
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {subtitle}
      </Typography>
    </Stack>
  );
}

function FeeGroup({
  label,
  rows,
  total,
}: {
  label: string;
  rows: { name: string; display: string }[];
  total: string;
}) {
  return (
    <Stack spacing={0.75}>
      <Typography
        variant="caption"
        fontWeight={600}
        color="text.secondary"
        sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
      >
        {label}
      </Typography>
      {rows.map((r, i) => (
        <Stack key={i} direction="row" justifyContent="space-between">
          <Typography variant="body2">{r.name}</Typography>
          <Typography variant="body2" fontWeight={600}>
            {r.display}
          </Typography>
        </Stack>
      ))}
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{
          pt: 0.75,
          borderTop: "1px dashed",
          borderColor: alpha("#10b981", 0.3),
        }}
      >
        <Typography variant="body2" fontWeight={700}>
          Total
        </Typography>
        <Typography variant="body2" fontWeight={700}>
          {total}
        </Typography>
      </Stack>
    </Stack>
  );
}
