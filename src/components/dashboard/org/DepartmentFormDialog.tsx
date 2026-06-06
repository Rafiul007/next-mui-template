"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { RhfSelect, RhfTextField, type RhfSelectOption } from "@/components/form";

const schema = yup
  .object({
    name: yup.string().trim().required("Name is required").max(100),
    code: yup.string().trim().required("Code is required").max(20, "Code must be 20 characters or fewer"),
    description: yup.string().trim().default(""),
    parentDepartmentId: yup.string().default(""),
    status: yup.string().default("ACTIVE"),
  })
  .required();

export type DepartmentFormValues = yup.InferType<typeof schema>;

type Props = {
  open: boolean;
  isSubmitting: boolean;
  initialValues: DepartmentFormValues;
  parentOptions: RhfSelectOption[];
  errorMessage?: string | null;
  mode: "create" | "edit";
  onClose: () => void;
  onSubmit: (values: DepartmentFormValues, defaultRoles: string[]) => Promise<void>;
};

const STATUS_OPTIONS: RhfSelectOption[] = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

export function DepartmentFormDialog({
  open,
  isSubmitting,
  initialValues,
  parentOptions,
  errorMessage,
  mode,
  onClose,
  onSubmit,
}: Props) {
  const [roleInput, setRoleInput] = useState("");
  const [defaultRoles, setDefaultRoles] = useState<string[]>([]);

  const { control, handleSubmit, reset } = useForm<DepartmentFormValues>({
    resolver: yupResolver(schema),
    defaultValues: initialValues,
    mode: "onTouched",
  });

  const addRole = () => {
    const trimmed = roleInput.trim();
    if (trimmed && !defaultRoles.includes(trimmed)) {
      setDefaultRoles((prev) => [...prev, trimmed]);
    }
    setRoleInput("");
  };

  const removeRole = (role: string) => {
    setDefaultRoles((prev) => prev.filter((r) => r !== role));
  };

  const handleFormSubmit = async (values: DepartmentFormValues) => {
    await onSubmit(values, defaultRoles);
    reset();
    setDefaultRoles([]);
    setRoleInput("");
  };

  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === "create" ? "Create Department" : "Edit Department"}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
              <RhfTextField control={control} name="name" label="Department name *" placeholder="e.g. Engineering" trim />
              <RhfTextField control={control} name="code" label="Code *" placeholder="e.g. ENG" trim />
            </Box>

            <RhfTextField
              control={control}
              name="description"
              label="Description"
              multiline
              rows={2}
              trim
            />

            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
              <RhfSelect
                control={control}
                name="parentDepartmentId"
                label="Parent department (optional)"
                options={parentOptions}
              />
              {mode === "edit" && (
                <RhfSelect control={control} name="status" label="Status" options={STATUS_OPTIONS} />
              )}
            </Box>

            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  size="small"
                  label="Default role"
                  placeholder="e.g. teacher"
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addRole();
                    }
                  }}
                  sx={{ flex: 1 }}
                />
                <Button variant="outlined" size="small" onClick={addRole} disabled={!roleInput.trim()}>
                  Add
                </Button>
              </Stack>
              {defaultRoles.length > 0 && (
                <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 1 }}>
                  {defaultRoles.map((role) => (
                    <Chip key={role} label={role} size="small" onDelete={() => removeRole(role)} />
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {mode === "create" ? "Create" : "Save changes"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
