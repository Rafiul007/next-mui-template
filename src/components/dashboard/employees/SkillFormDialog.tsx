"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import type { Dayjs } from "dayjs";
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
import { RhfDatePicker, RhfSelect, RhfTextField, type RhfSelectOption } from "@/components/form";

const skillSchema = yup
  .object({
    employeeId: yup.string().required("Employee is required"),
    skill: yup.string().trim().required("Skill is required"),
    proficiencyLevel: yup.string().required("Proficiency level is required"),
  })
  .required();

const certSchema = yup
  .object({
    employeeId: yup.string().required("Employee is required"),
    name: yup.string().trim().required("Certification name is required"),
    issuingOrganization: yup.string().trim().required("Issuing organization is required"),
    issueDate: yup.mixed<Dayjs>().nullable().required("Issue date is required"),
    expiryDate: yup.mixed<Dayjs>().nullable().default(null),
    certificateUrl: yup.string().trim().default(""),
  })
  .required();

export type SkillFormValues = yup.InferType<typeof skillSchema>;
export type CertFormValues = yup.InferType<typeof certSchema>;

const PROFICIENCY_OPTIONS: RhfSelectOption[] = [
  { label: "Beginner", value: "BEGINNER" },
  { label: "Intermediate", value: "INTERMEDIATE" },
  { label: "Advanced", value: "ADVANCED" },
  { label: "Expert", value: "EXPERT" },
];

type SkillDialogProps = {
  open: boolean;
  isSubmitting: boolean;
  employeeOptions: RhfSelectOption[];
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (values: SkillFormValues) => Promise<void>;
};

type CertDialogProps = {
  open: boolean;
  isSubmitting: boolean;
  employeeOptions: RhfSelectOption[];
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (values: CertFormValues) => Promise<void>;
};

export function AddSkillDialog({ open, isSubmitting, employeeOptions, errorMessage, onClose, onSubmit }: SkillDialogProps) {
  const { control, handleSubmit } = useForm<SkillFormValues>({
    resolver: yupResolver(skillSchema),
    defaultValues: { employeeId: "", skill: "", proficiencyLevel: "" },
    mode: "onTouched",
  });

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Skill Tag</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
            <RhfSelect control={control} name="employeeId" label="Employee *" options={employeeOptions} placeholder="Select employee" />
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
              <RhfTextField control={control} name="skill" label="Skill *" placeholder="e.g. React, Excel, Leadership" trim />
              <RhfSelect control={control} name="proficiencyLevel" label="Proficiency *" options={PROFICIENCY_OPTIONS} placeholder="Select level" />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>Add skill</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export function AddCertificationDialog({ open, isSubmitting, employeeOptions, errorMessage, onClose, onSubmit }: CertDialogProps) {
  const { control, handleSubmit } = useForm<CertFormValues>({
    resolver: yupResolver(certSchema) as never,
    defaultValues: {
      employeeId: "",
      name: "",
      issuingOrganization: "",
      issueDate: null as unknown as Dayjs,
      expiryDate: null,
      certificateUrl: "",
    },
    mode: "onTouched",
  });

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Certification</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
            <RhfSelect control={control} name="employeeId" label="Employee *" options={employeeOptions} placeholder="Select employee" />
            <RhfTextField control={control} name="name" label="Certification name *" trim />
            <RhfTextField control={control} name="issuingOrganization" label="Issuing organization *" trim />
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "1fr 1fr" }}>
              <RhfDatePicker control={control} name="issueDate" label="Issue date *" textFieldProps={{ fullWidth: true }} />
              <RhfDatePicker control={control} name="expiryDate" label="Expiry date (optional)" textFieldProps={{ fullWidth: true }} />
            </Box>
            <RhfTextField control={control} name="certificateUrl" label="Certificate URL (optional)" trim />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>Add certification</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
