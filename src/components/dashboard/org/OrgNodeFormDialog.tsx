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
} from "@mui/material";
import {
  RhfSelect,
  RhfTextField,
  type RhfSelectOption,
} from "@/components/form";

const orgNodeFormSchema = yup
  .object({
    name: yup
      .string()
      .trim()
      .required("Name is required")
      .max(100, "Name must be 100 characters or fewer"),
    level: yup
      .string()
      .trim()
      .required("Level is required")
      .max(60, "Level must be 60 characters or fewer"),
    parentId: yup.string().default(""),
    managerId: yup.string().default(""),
  })
  .required();

export type OrgNodeFormValues = yup.InferType<typeof orgNodeFormSchema>;

type OrgNodeFormDialogProps = {
  errorMessage?: string | null;
  initialValues: OrgNodeFormValues;
  isSubmitting: boolean;
  managerOptions: RhfSelectOption[];
  nodeOptions: RhfSelectOption[];
  onClose: () => void;
  onSubmit: (values: OrgNodeFormValues) => Promise<void>;
  open: boolean;
};

export function OrgNodeFormDialog({
  errorMessage,
  initialValues,
  isSubmitting,
  managerOptions,
  nodeOptions,
  onClose,
  onSubmit,
  open,
}: OrgNodeFormDialogProps) {
  const { control, handleSubmit } = useForm<OrgNodeFormValues>({
    resolver: yupResolver(orgNodeFormSchema),
    defaultValues: initialValues,
    mode: "onTouched",
  });

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Add Organization Node</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers>
          <Stack spacing={3}>
            {errorMessage ? (
              <Alert severity="error">{errorMessage}</Alert>
            ) : null}
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              }}
            >
              <RhfTextField
                control={control}
                name="name"
                label="Name"
                placeholder="e.g. Science Department"
                trim
                fullWidth
              />
              <RhfTextField
                control={control}
                name="level"
                label="Level"
                placeholder="e.g. Department, Team, Unit"
                trim
                fullWidth
              />
              <RhfSelect
                control={control}
                name="parentId"
                label="Parent node (optional)"
                options={nodeOptions}
                fullWidth
              />
              <RhfSelect
                control={control}
                name="managerId"
                label="Manager (optional)"
                options={managerOptions}
                fullWidth
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Add Node
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
