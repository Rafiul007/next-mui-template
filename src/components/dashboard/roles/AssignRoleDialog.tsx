"use client";

import { yupResolver } from "@hookform/resolvers/yup";
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
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { RhfSelect, type RhfSelectOption } from "@/components/form";
import type { GetTenantRolesQuery, GetUsersQuery } from "@/graphql/generated";
import { primaryRole } from "@/lib/auth/roles";
import { formatPermissionLabel } from "./permission-registry";
import { useWatch } from "react-hook-form";

type UserRecord = NonNullable<GetUsersQuery["getUsers"][number]>;
type RoleRecord = GetTenantRolesQuery["getTenantRoles"][number];

const assignRoleSchema = yup
  .object({
    roleName: yup.string().trim().required("Select a role to assign."),
  })
  .required();

type AssignRoleFormValues = yup.InferType<typeof assignRoleSchema>;

type AssignRoleDialogProps = {
  displayEmail?: string;
  displayName?: string;
  errorMessage?: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (roleName: string) => Promise<void>;
  open: boolean;
  roles: RoleRecord[];
  user: UserRecord | null;
};

const formatPersonName = (user: UserRecord) =>
  `${user.firstName} ${user.lastName}`.trim() || user.email;

export function AssignRoleDialog({
  displayEmail,
  displayName,
  errorMessage,
  isSubmitting,
  onClose,
  onSubmit,
  open,
  roles,
  user,
}: AssignRoleDialogProps) {
  const roleOptions: RhfSelectOption[] = roles.map((role) => ({
    label: role.name,
    value: role.name,
  }));

  const { control, handleSubmit } = useForm<AssignRoleFormValues>({
    resolver: yupResolver(assignRoleSchema),
    defaultValues: {
      roleName: primaryRole(user?.roles) ?? "",
    },
    mode: "onTouched",
  });

  const selectedRoleName = useWatch({ control, name: "roleName" });
  const selectedRole =
    roles.find((role) => role.name === selectedRoleName) ?? null;

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Assign role</DialogTitle>
      <Box
        component="form"
        onSubmit={handleSubmit(async (values) => onSubmit(values.roleName))}
        noValidate
      >
        <DialogContent dividers>
          <Stack spacing={3}>
            {(user ?? displayName) ? (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Employee
                </Typography>
                <Typography variant="h6" sx={{ mt: 0.75 }}>
                  {user ? formatPersonName(user) : displayName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email ?? displayEmail}
                </Typography>
              </Box>
            ) : null}

            {errorMessage ? (
              <Alert severity="error">{errorMessage}</Alert>
            ) : null}

            {!roles.length ? (
              <Alert severity="info">
                Create a custom role first. System roles are shown only when the
                backend returns them for this workspace.
              </Alert>
            ) : (
              <>
                <RhfSelect
                  control={control}
                  name="roleName"
                  label="Role"
                  options={roleOptions}
                />

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Current roles
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {(user?.roles ?? []).length ? (
                      user!.roles.map((role) => (
                        <Chip key={role} label={role} size="small" />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No roles assigned yet.
                      </Typography>
                    )}
                  </Stack>
                </Box>

                {selectedRole ? (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Permission preview
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      {selectedRole.permissions.length ? (
                        selectedRole.permissions.map((permission) => (
                          <Chip
                            key={permission}
                            label={formatPermissionLabel(permission)}
                            size="small"
                            variant="outlined"
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          This role currently has no explicit permissions.
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                ) : null}
              </>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || !roles.length}
          >
            Assign role
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
