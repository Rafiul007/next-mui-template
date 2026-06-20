"use client";

import { Fragment, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  ArrowBackRounded,
  ArrowForwardRounded,
  CheckRounded,
  CloseRounded,
  EditRounded,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  Divider,
  IconButton,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { RhfSearchSelect, RhfSelect, RhfTextField } from "@/components/form";
import { primaryGradient } from "@/theme/theme";

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

// ── Options ───────────────────────────────────────────────────────────────────

const GENDER_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

const BLOOD_GROUP_OPTIONS = [
  { label: "A+", value: "A+" }, { label: "A-", value: "A-" },
  { label: "B+", value: "B+" }, { label: "B-", value: "B-" },
  { label: "O+", value: "O+" }, { label: "O-", value: "O-" },
  { label: "AB+", value: "AB+" }, { label: "AB-", value: "AB-" },
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
  { label: "Not specified", value: "" },
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
  { label: "PSC / PEC", value: "psc" }, { label: "JSC / JDC", value: "jsc" },
  { label: "SSC / Dakhil", value: "ssc" }, { label: "HSC / Alim", value: "hsc" },
  { label: "O-Level", value: "o_level" }, { label: "A-Level", value: "a_level" },
  { label: "Other", value: "other" },
];

const BOARD_OPTIONS = [
  { label: "Dhaka", value: "dhaka" }, { label: "Chittagong", value: "chittagong" },
  { label: "Rajshahi", value: "rajshahi" }, { label: "Sylhet", value: "sylhet" },
  { label: "Barisal", value: "barisal" }, { label: "Comilla", value: "comilla" },
  { label: "Jessore", value: "jessore" }, { label: "Dinajpur", value: "dinajpur" },
  { label: "Madrasa Board", value: "madrasa" }, { label: "Technical Board", value: "technical" },
  { label: "Other", value: "other" },
];

// ── Schema ────────────────────────────────────────────────────────────────────

const qualificationSchema = yup.object({
  institution: yup.string().trim().required("Institution name is required").max(150),
  exam: yup.string().required("Examination is required").default(""),
  gradeGpa: yup.string().trim().max(20).default(""),
  passingYear: yup.string().trim().matches(/^$|^\d{4}$/, "4-digit year").default(""),
  board: yup.string().default(""),
}).required();

const admissionFormSchema = yup.object({
  firstName: yup.string().trim().required("First name is required").max(50),
  lastName: yup.string().trim().max(50).default(""),
  firstNameBangla: yup.string().trim().max(60).default(""),
  dob: yup.string().default(""),
  gender: yup.string().default(""),
  bloodGroup: yup.string().default(""),
  phone: yup.string().trim().matches(/^$|^[0-9+\-() ]+$/, "Use numbers only").max(20).default(""),
  email: yup.string().email("Invalid email").trim().default(""),
  classLevel: yup.string().trim().max(60).default(""),
  address: yup.string().trim().max(300).default(""),
  division: yup.string().default(""),
  district: yup.string().trim().max(60).default(""),
  upazila: yup.string().trim().max(60).default(""),
  village: yup.string().trim().max(60).default(""),
  previousInstitution: yup.string().trim().max(150).default(""),
  previousResult: yup.string().trim().max(100).default(""),
  admissionSource: yup.string().default(""),
  guardianName: yup.string().trim().required("Guardian name is required").max(100),
  guardianRelation: yup.string().required("Relation is required").default(""),
  guardianPhone: yup.string().trim().required("Guardian phone is required").matches(/^[0-9+\-() ]+$/, "Use numbers only").max(20),
  guardianEmail: yup.string().email("Invalid email").trim().default(""),
  guardianOccupation: yup.string().trim().max(100).default(""),
  guardianNid: yup.string().trim().max(30).default(""),
  qualifications: yup.array(qualificationSchema).default([]),
  batchId: yup.string().required("Please select a batch"),
  appliedDiscountIndexes: yup.array(yup.number().required()).default([]),
  notes: yup.string().trim().max(500).default(""),
}).required();

export type AdmissionFormValues = yup.InferType<typeof admissionFormSchema>;

export const emptyAdmissionFormValues: AdmissionFormValues = {
  firstName: "", lastName: "", firstNameBangla: "", dob: "", gender: "",
  bloodGroup: "", phone: "", email: "", classLevel: "",
  address: "", division: "", district: "", upazila: "", village: "",
  previousInstitution: "", previousResult: "", admissionSource: "",
  guardianName: "", guardianRelation: "", guardianPhone: "",
  guardianEmail: "", guardianOccupation: "", guardianNid: "",
  qualifications: [], appliedDiscountIndexes: [], batchId: "", notes: "",
};

// ── Wizard step config ────────────────────────────────────────────────────────

const WIZARD_STEPS = [
  { label: "Personal" },
  { label: "Location" },
  { label: "Academic" },
  { label: "Confirm" },
];

// Fields validated at each step (0-indexed)
const STEP_REQUIRED_FIELDS: (keyof AdmissionFormValues)[][] = [
  ["firstName"],
  [],
  ["guardianName", "guardianRelation", "guardianPhone", "batchId"],
  [],
];

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

const fmt = (v: string | undefined | null) => v || "—";
const fmtSource = (v: string) =>
  v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "—";
const calcDiscount = (d: BatchDiscount, total: number) =>
  d.valueType === "fixed" ? d.value : Math.round((total * d.value) / 100);
const fmtAmt = (n: number) => `৳${n.toLocaleString("en-BD")}`;

// ── Stepper ───────────────────────────────────────────────────────────────────

function WizardStepper({
  steps,
  active,
}: {
  steps: { label: string }[];
  active: number;
}) {
  return (
    <Stack
      direction="row"
      alignItems="flex-start"
      justifyContent="center"
      sx={{ pt: 3, pb: 2.5, px: 4 }}
    >
      {steps.map((step, i) => (
        <Fragment key={step.label}>
          <Stack alignItems="center" spacing={0.75} sx={{ minWidth: 64 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                bgcolor:
                  i < active
                    ? "#10b981"
                    : i === active
                      ? "#10b981"
                      : alpha("#0f172a", 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color:
                  i <= active ? "#fff" : alpha("#0f172a", 0.45),
                transition: "background 200ms ease",
              }}
            >
              {i < active ? (
                <CheckRounded sx={{ fontSize: 16 }} />
              ) : (
                <Typography
                  sx={{ fontSize: 14, fontWeight: 700, lineHeight: 1 }}
                >
                  {i + 1}
                </Typography>
              )}
            </Box>
            <Typography
              variant="caption"
              fontWeight={i === active ? 700 : 400}
              color={
                i === active
                  ? "#10b981"
                  : i < active
                    ? "text.secondary"
                    : alpha("#0f172a", 0.4)
              }
            >
              {step.label}
            </Typography>
          </Stack>

          {i < steps.length - 1 && (
            <Box
              sx={{
                flex: 1,
                height: 2,
                mt: "17px",
                mx: 0.5,
                bgcolor: i < active ? "#10b981" : alpha("#0f172a", 0.1),
                transition: "background 200ms ease",
              }}
            />
          )}
        </Fragment>
      ))}
    </Stack>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography variant="subtitle1" fontWeight={700}>
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {subtitle}
      </Typography>
    </Box>
  );
}

// ── Review field ──────────────────────────────────────────────────────────────

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} sx={{ mt: 0.25 }}>
        {value}
      </Typography>
    </Box>
  );
}

// ── Review section ────────────────────────────────────────────────────────────

function ReviewSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          px: 2.5,
          py: 1.5,
          bgcolor: alpha("#f8fafc", 0.8),
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="caption"
          fontWeight={700}
          sx={{ textTransform: "uppercase", letterSpacing: 0.8 }}
        >
          {title}
        </Typography>
        <Button
          size="small"
          startIcon={<EditRounded sx={{ fontSize: 14 }} />}
          onClick={onEdit}
          sx={{ fontSize: 13 }}
        >
          Edit
        </Button>
      </Stack>
      <Box
        sx={{
          p: 2.5,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 2,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

// ── Fee group ────────────────────────────────────────────────────────────────

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
      <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </Typography>
      {rows.map((r, i) => (
        <Stack key={i} direction="row" justifyContent="space-between">
          <Typography variant="body2">{r.name}</Typography>
          <Typography variant="body2" fontWeight={600}>{r.display}</Typography>
        </Stack>
      ))}
      <Stack direction="row" justifyContent="space-between" sx={{ pt: 0.75, borderTop: "1px dashed", borderColor: alpha("#10b981", 0.3) }}>
        <Typography variant="body2" fontWeight={700}>Total</Typography>
        <Typography variant="body2" fontWeight={700}>{total}</Typography>
      </Stack>
    </Stack>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

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
  const [wizardStep, setWizardStep] = useState(0);

  const { control, handleSubmit, trigger, getValues, setValue } =
    useForm<AdmissionFormValues>({
      resolver: yupResolver(admissionFormSchema),
      defaultValues: initialValues,
      mode: "onTouched",
    });

  const selectedBatchId = useWatch({ control, name: "batchId" });
  const appliedDiscountIndexes = useWatch({ control, name: "appliedDiscountIndexes" });
  const watchAll = useWatch({ control });

  const selectedBatch = batches.find((b) => b.id === selectedBatchId) ?? null;

  const { fields: qualFields, append: appendQual, remove: removeQual } =
    useFieldArray({ control, name: "qualifications" });

  const batchOptions = batches
    .filter((b) => b.status !== "cancelled" && b.status !== "completed")
    .map((b) => {
      const available = b.totalSeats - b.enrolledCount;
      const full = available <= 0;
      return {
        label: `${b.displayName} — ${full ? "Full" : `${available} seats left`}`,
        value: b.id,
        keywords: `${b.displayName} ${b.type}`,
        disabled: full,
      };
    });

  const oneTimeTotal = selectedBatch?.oneTimePayments.reduce((s, p) => s + p.amount, 0) ?? 0;
  const monthlyTotal = selectedBatch?.monthlyPayments.reduce((s, p) => s + p.amount, 0) ?? 0;
  const totalDiscount = (appliedDiscountIndexes ?? []).reduce((sum, idx) => {
    const d = selectedBatch?.discounts[idx];
    return d ? sum + calcDiscount(d, oneTimeTotal) : sum;
  }, 0);
  const finalOneTime = Math.max(0, oneTimeTotal - totalDiscount);

  const toggleDiscount = (index: number) => {
    const current = getValues("appliedDiscountIndexes");
    if (current.includes(index)) {
      setValue("appliedDiscountIndexes", current.filter((i) => i !== index));
    } else {
      setValue("appliedDiscountIndexes", [...current, index]);
    }
  };

  const handleContinue = async () => {
    const fields = STEP_REQUIRED_FIELDS[wizardStep];
    if (fields.length > 0) {
      const valid = await trigger(fields);
      if (!valid) return;
    }
    setWizardStep((s) => s + 1);
  };

  const handleBack = () => setWizardStep((s) => s - 1);

  const isCreate = mode === "create";

  // ── Edit mode: simple scrollable form ─────────────────────────────────────

  if (!isCreate) {
    return (
      <Dialog open={open} onClose={isSubmitting ? undefined : onClose} fullWidth maxWidth="md">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 3, py: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>Edit Student Record</Typography>
            <Typography variant="caption" color="text.secondary">Update the student's personal details.</Typography>
          </Box>
          <IconButton onClick={onClose} size="small" disabled={isSubmitting}>
            <CloseRounded />
          </IconButton>
        </Stack>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Box sx={{ p: 3, overflowY: "auto", maxHeight: "70vh" }}>
            <Stack spacing={3}>
              {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

              <SectionHeading title="Personal information" subtitle="Basic identification and contact details." />
              <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
                <RhfTextField control={control} name="firstName" label="First name *" placeholder="e.g. Rafiul" fullWidth trim />
                <RhfTextField control={control} name="lastName" label="Last name" placeholder="e.g. Hasan" fullWidth trim />
                <RhfTextField control={control} name="firstNameBangla" label="Name in Bangla" placeholder="e.g. রাফিউল" fullWidth trim />
                <RhfTextField control={control} name="classLevel" label="Class / Level" placeholder="e.g. Class 9, HSC" fullWidth trim />
                <RhfSelect control={control} name="gender" label="Gender" options={GENDER_OPTIONS} fullWidth />
                <RhfTextField control={control} name="phone" label="Phone number" placeholder="+8801XXXXXXXXX" fullWidth trim />
                <RhfTextField control={control} name="email" label="Email address" type="email" fullWidth trim />
              </Box>

              <Divider />
              <SectionHeading title="Address" subtitle="Student's home address." />
              <RhfTextField control={control} name="address" label="Full address" fullWidth trim />
              <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
                <RhfSelect control={control} name="division" label="Division" options={[{ label: "Select division", value: "" }, ...DIVISION_OPTIONS]} fullWidth />
                <RhfTextField control={control} name="district" label="District" fullWidth trim />
                <RhfTextField control={control} name="upazila" label="Upazila / Thana" fullWidth trim />
                <RhfTextField control={control} name="village" label="Village / Area" fullWidth trim />
              </Box>
            </Stack>
          </Box>

          <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider" }}>
            <Button color="inherit" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={14} color="inherit" /> : undefined}
              sx={{ backgroundImage: primaryGradient }}
            >
              Save Changes
            </Button>
          </Stack>
        </Box>
      </Dialog>
    );
  }

  // ── Create mode: 4-step wizard ────────────────────────────────────────────

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} fullWidth maxWidth="md">
      {/* Modal header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        sx={{ px: 3, pt: 3, pb: 0 }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            New Admission
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Admit a new student and set up their profile.
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" disabled={isSubmitting}>
          <CloseRounded />
        </IconButton>
      </Stack>

      {/* Stepper */}
      <WizardStepper steps={WIZARD_STEPS} active={wizardStep} />

      <Divider />

      {/* Step content */}
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <Box sx={{ px: 3, py: 3, overflowY: "auto", maxHeight: "55vh" }}>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2.5 }}>
              {errorMessage}
            </Alert>
          )}

          {/* ── Step 1: Personal ── */}
          {wizardStep === 0 && (
            <Stack spacing={0}>
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
                  placeholder="e.g. Rakibul"
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
                  placeholder="বাংলায় নাম"
                  fullWidth
                  trim
                />
                <RhfTextField
                  control={control}
                  name="classLevel"
                  label="Class / Level"
                  placeholder="Select class"
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
                  label="Select gender"
                  options={[{ label: "Select gender", value: "" }, ...GENDER_OPTIONS]}
                  fullWidth
                />
                <RhfSelect
                  control={control}
                  name="bloodGroup"
                  label="Select blood group"
                  options={[{ label: "Select blood group", value: "" }, ...BLOOD_GROUP_OPTIONS]}
                  fullWidth
                />
                <RhfTextField
                  control={control}
                  name="phone"
                  label="Phone number"
                  placeholder="+880 17XX XXX XXX"
                  fullWidth
                  trim
                />
                <RhfTextField
                  control={control}
                  name="email"
                  label="Email address"
                  placeholder="student@email.com"
                  type="email"
                  fullWidth
                  trim
                />
                <RhfSelect
                  control={control}
                  name="admissionSource"
                  label="How did they hear about us?"
                  options={ADMISSION_SOURCE_OPTIONS}
                  fullWidth
                />
              </Box>
            </Stack>
          )}

          {/* ── Step 2: Location ── */}
          {wizardStep === 1 && (
            <Stack spacing={0}>
              <SectionHeading
                title="Location"
                subtitle="Student's home address and location details."
              />
              <Stack spacing={2}>
                <RhfTextField
                  control={control}
                  name="address"
                  label="Full address"
                  placeholder="House no., road, area..."
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
                    placeholder="e.g. Gulshan"
                    fullWidth
                    trim
                  />
                  <RhfTextField
                    control={control}
                    name="village"
                    label="Village / Area"
                    placeholder="e.g. Banani"
                    fullWidth
                    trim
                  />
                </Box>
              </Stack>
            </Stack>
          )}

          {/* ── Step 3: Academic + Guardian + Batch ── */}
          {wizardStep === 2 && (
            <Stack spacing={3}>
              {/* Batch enrollment */}
              <Stack spacing={0}>
                <SectionHeading
                  title="Batch enrollment"
                  subtitle="Select the batch this student is being admitted into."
                />
                {batchOptions.length === 0 ? (
                  <Alert severity="warning">
                    {batches.length === 0
                      ? "No batches found. Create a batch first."
                      : "All batches are full or closed."}
                  </Alert>
                ) : (
                  <RhfSearchSelect
                    control={control}
                    name="batchId"
                    label="Select batch *"
                    placeholder="Search batch by name…"
                    options={batchOptions}
                    fullWidth
                    onValueChange={() => setValue("appliedDiscountIndexes", [])}
                  />
                )}

                {selectedBatch && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: alpha("#10b981", 0.25),
                      bgcolor: alpha("#f0fdf4", 0.5),
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={700} mb={1}>
                      Fees — {selectedBatch.displayName}
                    </Typography>
                    <Stack spacing={1.5}>
                      {selectedBatch.oneTimePayments.length > 0 && (
                        <FeeGroup
                          label="One-time"
                          rows={selectedBatch.oneTimePayments.map((p) => ({ name: p.name, display: fmtAmt(p.amount) }))}
                          total={fmtAmt(oneTimeTotal)}
                        />
                      )}
                      {selectedBatch.monthlyPayments.length > 0 && (
                        <FeeGroup
                          label="Monthly"
                          rows={selectedBatch.monthlyPayments.map((p) => ({ name: p.name, display: `${fmtAmt(p.amount)}/mo` }))}
                          total={`${fmtAmt(monthlyTotal)}/mo`}
                        />
                      )}
                    </Stack>

                    {selectedBatch.discounts.length > 0 && (
                      <Stack spacing={1} sx={{ mt: 2 }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">DISCOUNTS</Typography>
                        {selectedBatch.discounts.map((discount, idx) => {
                          const applied = (appliedDiscountIndexes ?? []).includes(idx);
                          return (
                            <Box
                              key={idx}
                              onClick={() => toggleDiscount(idx)}
                              sx={{
                                p: 1.5, border: "1px solid", borderRadius: 1.5, cursor: "pointer",
                                borderColor: applied ? alpha("#10b981", 0.4) : "divider",
                                bgcolor: applied ? alpha("#f0fdf4", 0.8) : "transparent",
                                display: "flex", alignItems: "center", gap: 1,
                                transition: "all 100ms ease",
                              }}
                            >
                              <Checkbox checked={applied} size="small" color="success" sx={{ p: 0 }} onClick={(e) => e.stopPropagation()} onChange={() => toggleDiscount(idx)} />
                              <Typography variant="body2" flex={1}>{discount.name}</Typography>
                              <Typography variant="body2" fontWeight={700} color="success.main">
                                −{fmtAmt(calcDiscount(discount, oneTimeTotal))}
                              </Typography>
                            </Box>
                          );
                        })}
                        {(appliedDiscountIndexes ?? []).length > 0 && (
                          <Stack direction="row" justifyContent="space-between" sx={{ pt: 1, borderTop: "1px dashed", borderColor: alpha("#10b981", 0.3) }}>
                            <Typography variant="body2" fontWeight={700}>Final one-time total</Typography>
                            <Typography variant="body2" fontWeight={700} color="success.main">{fmtAmt(finalOneTime)}</Typography>
                          </Stack>
                        )}
                      </Stack>
                    )}
                  </Box>
                )}
              </Stack>

              <Divider />

              {/* Academic background */}
              <Stack spacing={0}>
                <SectionHeading
                  title="Academic background"
                  subtitle="Previous institution and result before joining."
                />
                <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
                  <RhfTextField control={control} name="previousInstitution" label="Previous institution" placeholder="School / college name" fullWidth trim />
                  <RhfTextField control={control} name="previousResult" label="Previous result / GPA" placeholder="e.g. 5.00 / A+" fullWidth trim />
                </Box>
              </Stack>

              <Divider />

              {/* Guardian information */}
              <Stack spacing={0}>
                <SectionHeading
                  title="Guardian information"
                  subtitle="Primary contact responsible for this student."
                />
                <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
                  <RhfTextField control={control} name="guardianName" label="Guardian name *" placeholder="Full name" fullWidth trim />
                  <RhfSelect control={control} name="guardianRelation" label="Select relation" options={[{ label: "Select relation", value: "" }, ...GUARDIAN_RELATION_OPTIONS]} fullWidth />
                  <RhfTextField control={control} name="guardianPhone" label="Guardian phone" placeholder="+880 17XX XXX XXX" fullWidth trim />
                  <RhfTextField control={control} name="guardianEmail" label="Guardian email" placeholder="guardian@email.com" type="email" fullWidth trim />
                </Box>
              </Stack>

              {/* Notes */}
              <Divider />
              <Stack spacing={0}>
                <SectionHeading title="Admission notes" subtitle="Internal remarks — not visible to the student." />
                <RhfTextField control={control} name="notes" label="Notes" placeholder="Any special remarks or instructions..." fullWidth trim multiline rows={2} />
              </Stack>
            </Stack>
          )}

          {/* ── Step 4: Confirm ── */}
          {wizardStep === 3 && (
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  Review & confirm
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Check all details before creating the student profile.
                </Typography>
              </Box>

              <ReviewSection title="Personal" onEdit={() => setWizardStep(0)}>
                <ReviewField label="Full name" value={`${fmt(watchAll.firstName)} ${fmt(watchAll.lastName)}`.trim()} />
                <ReviewField label="Bangla name" value={fmt(watchAll.firstNameBangla)} />
                <ReviewField label="Class / Level" value={fmt(watchAll.classLevel)} />
                <ReviewField label="Date of birth" value={fmt(watchAll.dob)} />
                <ReviewField label="Gender" value={watchAll.gender ? watchAll.gender.charAt(0).toUpperCase() + watchAll.gender.slice(1) : "—"} />
                <ReviewField label="Blood group" value={fmt(watchAll.bloodGroup)} />
                <ReviewField label="Phone" value={fmt(watchAll.phone)} />
                <ReviewField label="Email" value={fmt(watchAll.email)} />
              </ReviewSection>

              <ReviewSection title="Location" onEdit={() => setWizardStep(1)}>
                <ReviewField label="Address" value={fmt(watchAll.address)} />
                <ReviewField label="Division" value={fmt(watchAll.division)} />
                <ReviewField label="District" value={fmt(watchAll.district)} />
                <ReviewField label="Upazila" value={fmt(watchAll.upazila)} />
              </ReviewSection>

              <ReviewSection title="Academic & Guardian" onEdit={() => setWizardStep(2)}>
                <ReviewField label="Previous institution" value={fmt(watchAll.previousInstitution)} />
                <ReviewField label="Previous GPA" value={fmt(watchAll.previousResult)} />
                <ReviewField label="Guardian" value={fmt(watchAll.guardianName)} />
                <ReviewField label="Guardian phone" value={fmt(watchAll.guardianPhone)} />
                <ReviewField label="Batch" value={selectedBatch?.displayName ?? fmt(watchAll.batchId)} />
                <ReviewField label="Source" value={watchAll.admissionSource ? fmtSource(watchAll.admissionSource) : "—"} />
              </ReviewSection>

              {errorMessage && (
                <Alert severity="error">{errorMessage}</Alert>
              )}
            </Stack>
          )}
        </Box>

        {/* Footer */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Step {wizardStep + 1} of {WIZARD_STEPS.length}
          </Typography>
          <Stack direction="row" spacing={1.5}>
            {wizardStep === 0 ? (
              <Button color="inherit" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
            ) : (
              <Button
                startIcon={<ArrowBackRounded />}
                color="inherit"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                Back
              </Button>
            )}

            {wizardStep < WIZARD_STEPS.length - 1 ? (
              <Button
                variant="contained"
                endIcon={<ArrowForwardRounded />}
                onClick={handleContinue}
                sx={{ backgroundImage: primaryGradient }}
              >
                Continue
              </Button>
            ) : (
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                startIcon={
                  isSubmitting ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <CheckRounded />
                  )
                }
                sx={{ backgroundImage: primaryGradient }}
              >
                Create admission
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>
    </Dialog>
  );
}
