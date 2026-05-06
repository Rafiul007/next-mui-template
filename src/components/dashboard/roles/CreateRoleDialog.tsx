"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  FormLabel,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { RhfTextField } from "@/components/form";
import type { GetTenantRolesQuery } from "@/graphql/generated";
import { permissionGroups } from "./permission-registry";

type RoleRecord = GetTenantRolesQuery["getTenantRoles"][number];

export type CreateRoleFormValues = {
  name: string;
  permissions: string[];
};

type CreateRoleDialogProps = {
  errorMessage?: string | null;
  existingRoles: RoleRecord[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: CreateRoleFormValues) => Promise<void>;
  open: boolean;
};

export function CreateRoleDialog({
  errorMessage,
  existingRoles,
  isSubmitting,
  onClose,
  onSubmit,
  open,
}: CreateRoleDialogProps) {
  const existingRoleNames = new Set(
    existingRoles.map((role) => role.name.toLowerCase()),
  );
  const createRoleSchema: yup.ObjectSchema<CreateRoleFormValues> = yup
    .object({
      name: yup
        .string()
        .trim()
        .required("Role name is required")
        .max(50, "Role name must be 50 characters or fewer")
        .test(
          "unique-role-name",
          "A role with this name already exists.",
          (value) => !value || !existingRoleNames.has(value.toLowerCase()),
        ),
      permissions: yup
        .array(yup.string().required())
        .required()
        .min(1, "Select at least one permission."),
    })
    .required();

  const { control, handleSubmit } = useForm<CreateRoleFormValues>({
    resolver: yupResolver(createRoleSchema),
    defaultValues: {
      name: "",
      permissions: [],
    },
    mode: "onTouched",
  });

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>Create custom role</DialogTitle>
      <Box
        component="form"
        onSubmit={handleSubmit(async (values) => onSubmit(values))}
        noValidate
      >
        <DialogContent dividers>
          <Stack spacing={3}>
            <Typography variant="body2" color="text.secondary">
              Define what this role can manage inside the tenant workspace.
            </Typography>

            {errorMessage ? (
              <Alert severity="error">{errorMessage}</Alert>
            ) : null}

            <RhfTextField
              control={control}
              name="name"
              label="Role name"
              placeholder="Operations Manager"
              fullWidth
              trim
            />

            <Controller
              control={control}
              name="permissions"
              render={({ field, fieldState }) => {
                const selectedPermissions = Array.isArray(field.value)
                  ? field.value
                  : [];

                return (
                  <FormControl error={!!fieldState.error}>
                    <FormLabel
                      sx={{
                        mb: 1.5,
                        color: "text.primary",
                        typography: "subtitle2",
                      }}
                    >
                      Permissions
                    </FormLabel>

                    <Stack spacing={2}>
                      {permissionGroups.map((group) => (
                        <Box
                          key={group.key}
                          sx={{
                            border: "1px solid",
                            borderColor: alpha("#0f172a", 0.08),
                            borderRadius: 2,
                            p: 2,
                            bgcolor: "#ffffff",
                          }}
                        >
                          <Typography variant="subtitle2">
                            {group.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            {group.description}
                          </Typography>

                          <Box
                            sx={{
                              mt: 1.75,
                              display: "grid",
                              gap: 1,
                              gridTemplateColumns: {
                                xs: "1fr",
                                md: "1fr 1fr",
                              },
                            }}
                          >
                            {group.options.map((option) => {
                              const checked = selectedPermissions.includes(
                                option.value,
                              );

                              return (
                                <Box
                                  key={option.value}
                                  sx={{
                                    display: "flex",
                                    gap: 1.25,
                                    alignItems: "flex-start",
                                    border: "1px solid",
                                    borderColor: checked
                                      ? "primary.main"
                                      : alpha("#0f172a", 0.08),
                                    borderRadius: 2,
                                    px: 1.25,
                                    py: 1,
                                    bgcolor: checked
                                      ? alpha("#10b981", 0.07)
                                      : "#ffffff",
                                  }}
                                >
                                  <Checkbox
                                    checked={checked}
                                    sx={{ mt: -0.5, ml: -0.5 }}
                                    onChange={(_, nextChecked) => {
                                      field.onChange(
                                        nextChecked
                                          ? [
                                              ...new Set([
                                                ...selectedPermissions,
                                                option.value,
                                              ]),
                                            ]
                                          : selectedPermissions.filter(
                                              (permission) =>
                                                permission !== option.value,
                                            ),
                                      );
                                    }}
                                  />
                                  <Box sx={{ minWidth: 0 }}>
                                    <Typography
                                      variant="body2"
                                      fontWeight={600}
                                    >
                                      {option.label}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{ display: "block", mt: 0.25 }}
                                    >
                                      {option.description}
                                    </Typography>
                                  </Box>
                                </Box>
                              );
                            })}
                          </Box>
                        </Box>
                      ))}
                    </Stack>

                    <FormHelperText sx={{ mt: 1 }}>
                      {fieldState.error?.message ??
                        "The permission catalog is defined in the frontend until the backend exposes it."}
                    </FormHelperText>
                  </FormControl>
                );
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Create role
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
