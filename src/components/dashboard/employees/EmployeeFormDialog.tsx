"use client";

import { type Dayjs } from "dayjs";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
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
  Stack,
  Typography,
} from "@mui/material";
import {
  RhfDatePicker,
  RhfSelect,
  RhfTextField,
  type RhfSelectOption,
} from "@/components/form";

const employmentTypeOptions: RhfSelectOption[] = [
  { label: "Full-time", value: "full-time" },
  { label: "Part-time", value: "part-time" },
  { label: "Contractual", value: "contractual" },
  { label: "Intern", value: "intern" },
];

const bloodGroupOptions: RhfSelectOption[] = [
  { label: "A+", value: "A+" },
  { label: "A-", value: "A-" },
  { label: "B+", value: "B+" },
  { label: "B-", value: "B-" },
  { label: "O+", value: "O+" },
  { label: "O-", value: "O-" },
  { label: "AB+", value: "AB+" },
  { label: "AB-", value: "AB-" },
];

const createSchema = yup.object({
  firstName: yup.string().trim().required("First name is required").max(60, "Too long"),
  lastName: yup.string().trim().max(60, "Too long").default(""),
  phone: yup.string().trim().max(20, "Too long").default(""),
  branchId: yup.string().required("Branch is required"),
  email: yup.string().trim().email("Enter a valid email address").required("Email is required"),
  employmentType: yup.string().required("Employment type is required"),
  joiningDate: yup.mixed<Dayjs>().nullable().required("Joining date is required"),
  employeeCode: yup.string().trim().default(""),
  designation: yup.string().trim().default(""),
  department: yup.string().trim().default(""),
  nid: yup.string().trim().default(""),
  tin: yup.string().trim().default(""),
  bloodGroup: yup.string().default(""),
  emergencyContactName: yup.string().trim().default(""),
  emergencyContactPhone: yup.string().trim().default(""),
  probationEndsAt: yup.mixed<Dayjs>().nullable().default(null),
}).required();

const editSchema = yup.object({
  firstName: yup.string().trim().default(""),
  lastName: yup.string().trim().default(""),
  phone: yup.string().trim().default(""),
  branchId: yup.string().required("Branch is required"),
  email: yup.string().trim().email("Enter a valid email address").default(""),
  employmentType: yup.string().required("Employment type is required"),
  joiningDate: yup.mixed<Dayjs>().nullable().required("Joining date is required"),
  employeeCode: yup.string().trim().default(""),
  designation: yup.string().trim().default(""),
  department: yup.string().trim().default(""),
  nid: yup.string().trim().default(""),
  tin: yup.string().trim().default(""),
  bloodGroup: yup.string().default(""),
  emergencyContactName: yup.string().trim().default(""),
  emergencyContactPhone: yup.string().trim().default(""),
  probationEndsAt: yup.mixed<Dayjs>().nullable().default(null),
}).required();

export type EmployeeFormValues = yup.InferType<typeof createSchema>;

const emptyValues: EmployeeFormValues = {
  firstName: "",
  lastName: "",
  phone: "",
  branchId: "",
  email: "",
  employmentType: "",
  joiningDate: null as unknown as Dayjs,
  employeeCode: "",
  designation: "",
  department: "",
  nid: "",
  tin: "",
  bloodGroup: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  probationEndsAt: null as unknown as Dayjs,
};

export type EmployeeFormDialogProps = {
  branchOptions: RhfSelectOption[];
  errorMessage: string | null;
  initialValues?: EmployeeFormValues;
  isSubmitting: boolean;
  mode: "create" | "edit";
  onClose: () => void;
  onSubmit: (values: EmployeeFormValues) => void;
  open: boolean;
};

export function EmployeeFormDialog({
  branchOptions,
  errorMessage,
  initialValues = emptyValues,
  isSubmitting,
  mode,
  onClose,
  onSubmit,
  open,
}: EmployeeFormDialogProps) {
  const { control, handleSubmit } = useForm<EmployeeFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(mode === "create" ? createSchema : editSchema as any),
    defaultValues: initialValues,
    mode: "onTouched",
  });

  const title = mode === "create" ? "Onboard employee" : "Edit employee profile";
  const submitLabel = mode === "create" ? "Onboard" : "Save changes";

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

            {mode === "create" && (
              <>
                <Stack spacing={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Account details
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
                      name="firstName"
                      label="First name *"
                      placeholder="e.g. Rafiul"
                      trim
                    />
                    <RhfTextField
                      control={control}
                      name="lastName"
                      label="Last name"
                      placeholder="e.g. Hasan"
                      trim
                    />
                    <RhfTextField
                      control={control}
                      name="email"
                      label="Email *"
                      placeholder="employee@example.com"
                      type="email"
                      trim
                      helperText="Used to create the login account"
                    />
                    <RhfTextField
                      control={control}
                      name="phone"
                      label="Phone"
                      placeholder="+8801XXXXXXXXX"
                      trim
                    />
                  </Box>
                </Stack>
                <Divider />
              </>
            )}

            <Stack spacing={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Employment details
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                }}
              >
                <RhfSelect
                  control={control}
                  name="branchId"
                  label="Branch *"
                  options={branchOptions}
                  placeholder="Select branch"
                />
                <RhfSelect
                  control={control}
                  name="employmentType"
                  label="Employment type *"
                  options={employmentTypeOptions}
                  placeholder="Select type"
                />
                <RhfDatePicker
                  control={control}
                  name="joiningDate"
                  label="Joining date *"
                  textFieldProps={{ fullWidth: true }}
                />
                <RhfTextField
                  control={control}
                  name="employeeCode"
                  label="Employee code"
                  helperText="Leave blank to auto-generate"
                  trim
                />
                <RhfTextField
                  control={control}
                  name="designation"
                  label="Designation"
                  placeholder="e.g. Senior Teacher"
                  trim
                />
                <RhfTextField
                  control={control}
                  name="department"
                  label="Department"
                  placeholder="e.g. Science"
                  trim
                />
                {mode === "edit" && (
                  <RhfTextField
                    control={control}
                    name="email"
                    label="Email"
                    placeholder="employee@example.com"
                    type="email"
                    trim
                  />
                )}
              </Box>
            </Stack>

            <Divider />

            <Stack spacing={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Personal information
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
                  name="nid"
                  label="NID number"
                  trim
                />
                <RhfTextField
                  control={control}
                  name="tin"
                  label="TIN number"
                  trim
                />
                <RhfSelect
                  control={control}
                  name="bloodGroup"
                  label="Blood group"
                  options={[
                    { label: "Not specified", value: "" },
                    ...bloodGroupOptions,
                  ]}
                />
                <RhfDatePicker
                  control={control}
                  name="probationEndsAt"
                  label="Probation end date"
                  textFieldProps={{ fullWidth: true }}
                />
              </Box>
            </Stack>

            <Divider />

            <Stack spacing={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Emergency contact
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
                  name="emergencyContactName"
                  label="Contact name"
                  trim
                />
                <RhfTextField
                  control={control}
                  name="emergencyContactPhone"
                  label="Contact phone"
                  trim
                />
              </Box>
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
