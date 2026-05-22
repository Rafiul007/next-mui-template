"use client";

import { useState, type ReactNode } from "react";
import {
  AddRounded,
  AdminPanelSettingsRounded,
  CheckCircleRounded,
  GroupsRounded,
  HowToRegRounded,
  LockPersonRounded,
  PersonOffRounded,
  ShieldRounded,
} from "@mui/icons-material";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { toast } from "react-hot-toast";
import {
  AssignRoleToUserDocument,
  CreateCustomRoleDocument,
  GetEmployeesDocument,
  GetTenantRolesDocument,
  GetUsersDocument,
  SetActiveStatusDocument,
  type GetEmployeesQuery,
  type GetTenantRolesQuery,
  type GetUsersQuery,
} from "@/graphql/generated";
import { getErrorMessage } from "@/lib/errors";
import { SectionCard } from "@/components/ui";
import { AssignRoleDialog } from "./AssignRoleDialog";
import {
  CreateRoleDialog,
  type CreateRoleFormValues,
} from "./CreateRoleDialog";
import { formatPermissionLabel } from "./permission-registry";

type EmployeeRecord = GetEmployeesQuery["getEmployees"][number];
type UserRecord = NonNullable<GetUsersQuery["getUsers"][number]>;
type RoleRecord = GetTenantRolesQuery["getTenantRoles"][number];

type EmployeeRow = {
  employeeId: string;
  employeeCode: string;
  designation: string | null;
  department: string | null;
  employeeStatus: string;
  userId: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  profilePicture: string | null;
  isActivated: boolean;
  isVerified: boolean;
  roles: string[];
  user: UserRecord | null;
};

type StatusActionState = {
  userId: string;
  name: string;
  nextStatus: boolean;
};

const formatPersonName = (user: UserRecord) =>
  `${user.firstName} ${user.lastName}`.trim() || user.email;

const formatInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");

const buildEmployeeRow = (
  emp: EmployeeRecord,
  userById: Map<string, UserRecord>,
): EmployeeRow => {
  const user = emp.userId ? (userById.get(emp.userId) ?? null) : null;
  const name = user
    ? formatPersonName(user)
    : emp.employeeCode || "Unknown";
  return {
    employeeId: emp.id,
    employeeCode: emp.employeeCode,
    designation: emp.designation,
    department: emp.department,
    employeeStatus: emp.status,
    userId: emp.userId,
    name,
    email: user?.email ?? null,
    phone: user?.phone ?? null,
    profilePicture: user?.profilePicture ?? null,
    isActivated: user?.isActivated ?? false,
    isVerified: user?.isVerified ?? false,
    roles: user?.roles ?? [],
    user,
  };
};

function SummaryCard({
  caption,
  icon,
  title,
  tone = "default",
}: {
  caption: string;
  icon: ReactNode;
  title: string;
  tone?: "default" | "success" | "muted";
}) {
  const borderColor =
    tone === "success"
      ? alpha("#10b981", 0.22)
      : tone === "muted"
        ? alpha("#64748b", 0.16)
        : alpha("#0f172a", 0.08);

  const iconBackground =
    tone === "success" ? alpha("#10b981", 0.12) : alpha("#0f172a", 0.06);

  const iconColor = tone === "success" ? "#047857" : "#0f172a";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: "1px solid",
        borderColor,
        display: "grid",
        gap: 1.25,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          {caption}
        </Typography>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: iconBackground,
            color: iconColor,
          }}
        >
          {icon}
        </Box>
      </Stack>

      <Typography variant="h5">{title}</Typography>
    </Paper>
  );
}

const buildColumns = (): MRT_ColumnDef<EmployeeRow>[] => [
  {
    id: "employee",
    accessorFn: (row) => row.name,
    header: "Employee",
    size: 260,
    Cell: ({ row }) => (
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar
          src={row.original.profilePicture ?? undefined}
          sx={{
            width: 40,
            height: 40,
            bgcolor: alpha("#10b981", 0.16),
            color: "#047857",
            fontWeight: 700,
          }}
        >
          {formatInitials(row.original.name)}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {row.original.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {row.original.email ?? row.original.employeeCode}
          </Typography>
        </Box>
      </Stack>
    ),
  },
  {
    id: "roles",
    accessorFn: (row) => row.roles.join(", "),
    header: "Roles",
    size: 240,
    Cell: ({ row }) => (
      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
        {row.original.roles.length ? (
          row.original.roles.map((role) => (
            <Chip key={role} label={role} size="small" />
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No roles assigned
          </Typography>
        )}
      </Stack>
    ),
  },
  {
    id: "status",
    accessorFn: (row) => {
      const s = row.employeeStatus?.toLowerCase() ?? "";
      return s.charAt(0).toUpperCase() + s.slice(1);
    },
    header: "Status",
    size: 120,
    filterVariant: "select",
    filterFn: "equals",
    filterSelectOptions: ["Active", "Inactive", "Probation"],
    Cell: ({ row }) => {
      const s = row.original.employeeStatus?.toLowerCase() ?? "";
      const label = s.charAt(0).toUpperCase() + s.slice(1);
      return (
        <Chip
          label={label}
          color={s === "active" ? "success" : s === "probation" ? "warning" : "default"}
          variant={s === "inactive" ? "outlined" : "filled"}
          size="small"
        />
      );
    },
  },
  {
    id: "isVerified",
    accessorFn: (row) => (row.isVerified ? "Verified" : "Pending"),
    header: "Verified",
    size: 120,
    filterVariant: "select",
    filterFn: "equals",
    filterSelectOptions: ["Verified", "Pending"],
    Cell: ({ row }) => (
      <Chip
        label={row.original.isVerified ? "Verified" : "Pending"}
        color={row.original.isVerified ? "info" : "default"}
        variant={row.original.isVerified ? "filled" : "outlined"}
        size="small"
      />
    ),
  },
  {
    id: "phone",
    accessorFn: (row) => row.phone ?? "",
    header: "Phone",
    size: 150,
    Cell: ({ row }) => (
      <Typography variant="body2">{row.original.phone || "Not set"}</Typography>
    ),
  },
];

export function TeamAccessWorkspace() {
  const [activeTab, setActiveTab] = useState(0);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [createRoleDialogKey, setCreateRoleDialogKey] = useState(0);
  const [selectedRow, setSelectedRow] = useState<EmployeeRow | null>(null);
  const [assignRoleDialogKey, setAssignRoleDialogKey] = useState(0);
  const [pendingStatusAction, setPendingStatusAction] =
    useState<StatusActionState | null>(null);
  const [createRoleError, setCreateRoleError] = useState<string | null>(null);
  const [assignRoleError, setAssignRoleError] = useState<string | null>(null);

  const {
    data: employeesData,
    error: employeesError,
    loading: isEmployeesLoading,
  } = useQuery(GetEmployeesDocument);

  const {
    data: usersData,
    loading: isUsersLoading,
    refetch: refetchUsers,
  } = useQuery(GetUsersDocument, {
    variables: { page: 1, limit: 500 },
  });

  const {
    data: rolesData,
    error: rolesError,
    loading: isRolesLoading,
    refetch: refetchRoles,
  } = useQuery(GetTenantRolesDocument);

  const [createCustomRole, createRoleState] = useMutation(
    CreateCustomRoleDocument,
  );
  const [assignRoleToUser, assignRoleState] = useMutation(
    AssignRoleToUserDocument,
  );
  const [setActiveStatus, setActiveStatusState] = useMutation(
    SetActiveStatusDocument,
  );

  const employees = employeesData?.getEmployees ?? [];
  const users = (usersData?.getUsers ?? []).filter(
    (u): u is UserRecord => !!u,
  );
  const roles = rolesData?.getTenantRoles ?? [];

  const userById = new Map(users.map((u) => [u.id, u]));
  const employeeRows = employees.map((emp) => buildEmployeeRow(emp, userById));

  const activeCount = employees.filter(
    (e) => e.status?.toLowerCase() === "active",
  ).length;
  const inactiveCount = employees.filter(
    (e) => e.status?.toLowerCase() === "inactive",
  ).length;
  const customRolesCount = roles.filter((r) => !r.system).length;

  const roleMemberCounts = new Map<string, number>();
  users.forEach((user) => {
    user.roles.forEach((roleName) => {
      roleMemberCounts.set(roleName, (roleMemberCounts.get(roleName) ?? 0) + 1);
    });
  });

  const pageError = employeesError ?? rolesError;
  const isWorkspaceLoading =
    isEmployeesLoading || isUsersLoading || isRolesLoading;

  const openAssignRoleDialog = (row: EmployeeRow) => {
    setSelectedRow(row);
    setAssignRoleError(null);
    setAssignRoleDialogKey((k) => k + 1);
  };

  const closeAssignRoleDialog = () => {
    if (!assignRoleState.loading) {
      setSelectedRow(null);
      setAssignRoleError(null);
    }
  };

  const openCreateRoleDialog = () => {
    setCreateRoleError(null);
    setCreateRoleDialogKey((k) => k + 1);
    setIsCreateRoleOpen(true);
  };

  const closeCreateRoleDialog = () => {
    if (!createRoleState.loading) {
      setIsCreateRoleOpen(false);
      setCreateRoleError(null);
    }
  };

  const handleAssignRole = async (roleName: string) => {
    if (!selectedRow?.userId) return;

    setAssignRoleError(null);

    try {
      const result = await assignRoleToUser({
        variables: { userId: selectedRow.userId, roleName },
      });

      if (result.error) throw result.error;

      await Promise.all([refetchUsers(), refetchRoles()]);
      toast.success(`${selectedRow.name} received the ${roleName} role.`);
      closeAssignRoleDialog();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to assign role.");
      setAssignRoleError(message);
      toast.error(message);
    }
  };

  const handleCreateRole = async ({ name, permissions }: CreateRoleFormValues) => {
    setCreateRoleError(null);

    try {
      const result = await createCustomRole({
        variables: { role: { name: name.trim(), permissions } },
      });

      if (result.error) throw result.error;

      await refetchRoles();
      toast.success(`${name.trim()} was created successfully.`);
      closeCreateRoleDialog();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to create role.");
      setCreateRoleError(message);
      toast.error(message);
    }
  };

  const handleChangeEmployeeStatus = async () => {
    if (!pendingStatusAction) return;

    try {
      const result = await setActiveStatus({
        variables: {
          id: pendingStatusAction.userId,
          newStatus: pendingStatusAction.nextStatus,
        },
      });

      if (result.error) throw result.error;

      await refetchUsers();
      toast.success(
        `${pendingStatusAction.name} is now ${
          pendingStatusAction.nextStatus ? "active" : "inactive"
        }.`,
      );
      setPendingStatusAction(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update employee status."));
    }
  };

  return (
    <>
      <Stack spacing={3}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            border: "1px solid",
            borderColor: "divider",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(240,253,250,0.98) 100%)",
          }}
        >
          <Box sx={{ maxWidth: 760 }}>
            <Typography variant="h4" component="h1" sx={{ mt: 0.5 }}>
              Roles & Permissions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Manage employee access, workspace roles, and operational
              permissions across your tenant workspace.
            </Typography>
          </Box>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              xl: "repeat(4, minmax(0, 1fr))",
            },
          }}
        >
          <SummaryCard
            caption="Total Employees"
            title={String(employees.length)}
            icon={<GroupsRounded />}
          />
          <SummaryCard
            caption="Active Employees"
            title={String(activeCount)}
            icon={<HowToRegRounded />}
            tone="success"
          />
          <SummaryCard
            caption="Inactive Employees"
            title={String(inactiveCount)}
            icon={<PersonOffRounded />}
            tone="muted"
          />
          <SummaryCard
            caption="Custom Roles"
            title={String(customRolesCount)}
            icon={<ShieldRounded />}
          />
        </Box>

        {pageError ? (
          <Alert severity="error">
            {pageError.message || "Unable to load roles and employee access."}
          </Alert>
        ) : null}

        <SectionCard sx={{ overflow: "hidden" }}>
          <Tabs
            value={activeTab}
            onChange={(_, nextValue) => setActiveTab(nextValue)}
            sx={{
              px: { xs: 2, md: 3 },
              pt: 1,
              borderBottom: "1px solid",
              borderColor: alpha("#0f172a", 0.08),
              bgcolor: "#ffffff",
            }}
          >
            <Tab label={`Employees (${employeeRows.length})`} />
            <Tab label={`Roles (${roles.length})`} />
          </Tabs>

          <Box sx={{ bgcolor: "#f8fafc", p: { xs: 2, md: 3 } }}>
            {activeTab === 0 ? (
              <MaterialReactTable
                columns={buildColumns()}
                data={employeeRows}
                getRowId={(row) => row.employeeId}
                enableColumnFilters
                enableDensityToggle={false}
                enableFullScreenToggle={false}
                enableHiding={false}
                enableRowActions
                enableSorting
                enableStickyHeader
                initialState={{
                  pagination: { pageIndex: 0, pageSize: 10 },
                  showColumnFilters: true,
                  sorting: [{ id: "employee", desc: false }],
                }}
                localization={{
                  actions: "Actions",
                  noRecordsToDisplay: "No employees found",
                }}
                positionActionsColumn="last"
                muiBottomToolbarProps={{
                  sx: {
                    borderTop: "1px solid",
                    borderColor: alpha("#0f172a", 0.08),
                    bgcolor: "#ffffff",
                  },
                }}
                muiSearchTextFieldProps={{
                  placeholder: "Search employees",
                  size: "small",
                  sx: { minWidth: { xs: "100%", md: 280 } },
                }}
                muiTableBodyRowProps={({ row }) => ({
                  sx: {
                    opacity:
                      row.original.employeeStatus?.toLowerCase() === "inactive"
                        ? 0.82
                        : 1,
                    bgcolor: "#ffffff",
                    transition:
                      "background-color 140ms ease, transform 140ms ease, box-shadow 140ms ease",
                    "&:hover td": { bgcolor: alpha("#ecfdf5", 0.9) },
                    "&:hover": {
                      transform: "translateY(-1px)",
                      boxShadow: `inset 0 0 0 1px ${alpha("#10b981", 0.12)}`,
                    },
                  },
                })}
                muiTableBodyCellProps={{
                  sx: {
                    bgcolor: "#ffffff",
                    borderBottom: "1px solid",
                    borderColor: alpha("#0f172a", 0.06),
                    py: 2.25,
                  },
                }}
                muiTableContainerProps={{ sx: { maxHeight: 640, bgcolor: "#ffffff" } }}
                muiTableHeadCellProps={{
                  sx: {
                    bgcolor: "#ffffff",
                    color: alpha("#0f172a", 0.72),
                    fontSize: 13,
                    fontWeight: 700,
                    py: 1.75,
                    borderBottom: "1px solid",
                    borderColor: alpha("#0f172a", 0.08),
                    "& .MuiInputBase-root": {
                      bgcolor: alpha("#f8fafc", 0.92),
                      borderRadius: 2,
                    },
                  },
                }}
                muiTablePaperProps={{
                  elevation: 0,
                  sx: {
                    border: "1px solid",
                    borderColor: alpha("#0f172a", 0.08),
                    borderRadius: 2,
                    overflow: "hidden",
                    bgcolor: "#ffffff",
                    boxShadow: `0 16px 40px ${alpha("#0f172a", 0.06)}`,
                  },
                }}
                muiTopToolbarProps={{
                  sx: {
                    px: 2.5,
                    py: 1.75,
                    bgcolor: "#ffffff",
                    borderBottom: "1px solid",
                    borderColor: alpha("#0f172a", 0.08),
                  },
                }}
                displayColumnDefOptions={{
                  "mrt-row-actions": {
                    header: "Actions",
                    size: 108,
                    muiTableBodyCellProps: { sx: { pr: 2, bgcolor: "#ffffff" } },
                    muiTableHeadCellProps: {
                      sx: {
                        pr: 2,
                        bgcolor: "#ffffff",
                        "& .Mui-TableHeadCell-Content": {
                          justifyContent: "flex-end",
                        },
                      },
                    },
                  },
                }}
                renderEmptyRowsFallback={() => (
                  <Box sx={{ px: 3, py: 6, textAlign: "center" }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      No employees found
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Employee accounts will appear here once they exist in this
                      tenant workspace.
                    </Typography>
                  </Box>
                )}
                renderRowActions={({ row }) => {
                  const hasUser = !!row.original.userId;
                  const isActive = row.original.isActivated;
                  return (
                    <Stack
                      direction="row"
                      spacing={0.5}
                      justifyContent="flex-end"
                      sx={{ width: "100%" }}
                    >
                      <Tooltip
                        title={
                          !hasUser
                            ? "No user account linked to this employee"
                            : !roles.length
                              ? "Create a role before assigning access"
                              : "Assign role"
                        }
                      >
                        <span>
                          <IconButton
                            size="small"
                            disabled={!hasUser || !roles.length}
                            onClick={() => openAssignRoleDialog(row.original)}
                            sx={{ bgcolor: alpha("#0f172a", 0.04) }}
                          >
                            <AdminPanelSettingsRounded fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip
                        title={
                          !hasUser
                            ? "No user account linked"
                            : isActive
                              ? "Deactivate employee"
                              : "Activate employee"
                        }
                      >
                        <span>
                          <IconButton
                            size="small"
                            disabled={!hasUser}
                            onClick={() => {
                              if (!row.original.userId) return;
                              setPendingStatusAction({
                                userId: row.original.userId,
                                name: row.original.name,
                                nextStatus: !isActive,
                              });
                            }}
                            sx={{
                              bgcolor: isActive
                                ? alpha("#ef4444", 0.08)
                                : alpha("#10b981", 0.1),
                              color: isActive ? "#b91c1c" : "#047857",
                            }}
                          >
                            {isActive ? (
                              <PersonOffRounded fontSize="small" />
                            ) : (
                              <CheckCircleRounded fontSize="small" />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  );
                }}
                renderTopToolbarCustomActions={() => (
                  <Typography variant="body2" color="text.secondary">
                    {employeeRows.length} employee
                    {employeeRows.length === 1 ? "" : "s"} in your workspace
                  </Typography>
                )}
                state={{
                  isLoading: isWorkspaceLoading && employeeRows.length === 0,
                  showProgressBars: isWorkspaceLoading,
                }}
              />
            ) : (
              <Stack spacing={2.5}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ md: "center" }}
                >
                  <Box>
                    <Typography variant="h6">Workspace roles</Typography>
                    <Typography variant="body2" color="text.secondary">
                      System roles are read-only. Custom roles help you delegate
                      access for day-to-day operations.
                    </Typography>
                  </Box>
                  {roles.length ? (
                    <Button
                      variant="contained"
                      onClick={openCreateRoleDialog}
                      startIcon={<AddRounded />}
                      sx={{ alignSelf: { xs: "stretch", md: "auto" } }}
                    >
                      Create custom role
                    </Button>
                  ) : null}
                </Stack>

                {roles.length ? (
                  <Box
                    sx={{
                      display: "grid",
                      gap: 2,
                      gridTemplateColumns: {
                        xs: "1fr",
                        md: "repeat(2, minmax(0, 1fr))",
                        xl: "repeat(3, minmax(0, 1fr))",
                      },
                    }}
                  >
                    {roles.map((role) => {
                      const membersCount = roleMemberCounts.get(role.name) ?? 0;
                      const visiblePermissions = role.permissions.slice(0, 4);

                      return (
                        <SectionCard
                          key={role.id}
                          sx={{
                            p: 2.5,
                            borderRadius: 2,
                            bgcolor: "#ffffff",
                            display: "grid",
                            gap: 2,
                          }}
                        >
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            spacing={1.5}
                            alignItems="flex-start"
                          >
                            <Stack spacing={0.75}>
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                flexWrap="wrap"
                                useFlexGap
                              >
                                <Typography variant="h6">{role.name}</Typography>
                                <Chip
                                  size="small"
                                  label={role.system ? "System" : "Custom"}
                                  color={role.system ? "default" : "success"}
                                  variant={role.system ? "outlined" : "filled"}
                                />
                              </Stack>
                              <Typography variant="body2" color="text.secondary">
                                {membersCount} member
                                {membersCount === 1 ? "" : "s"} assigned
                              </Typography>
                            </Stack>

                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                display: "grid",
                                placeItems: "center",
                                bgcolor: role.system
                                  ? alpha("#0f172a", 0.06)
                                  : alpha("#10b981", 0.12),
                                color: role.system ? "#0f172a" : "#047857",
                              }}
                            >
                              <LockPersonRounded />
                            </Box>
                          </Stack>

                          <Box
                            sx={{
                              display: "grid",
                              gap: 1.5,
                              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                            }}
                          >
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Permissions
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {role.permissions.length}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Type
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {role.system ? "Built-in" : "Tenant custom"}
                              </Typography>
                            </Box>
                          </Box>

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
                              {visiblePermissions.length ? (
                                <>
                                  {visiblePermissions.map((permission) => (
                                    <Chip
                                      key={permission}
                                      label={formatPermissionLabel(permission)}
                                      size="small"
                                      variant="outlined"
                                    />
                                  ))}
                                  {role.permissions.length >
                                  visiblePermissions.length ? (
                                    <Chip
                                      label={`+${
                                        role.permissions.length -
                                        visiblePermissions.length
                                      } more`}
                                      size="small"
                                    />
                                  ) : null}
                                </>
                              ) : (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  No explicit permissions defined for this role.
                                </Typography>
                              )}
                            </Stack>
                          </Box>
                        </SectionCard>
                      );
                    })}
                  </Box>
                ) : (
                  <SectionCard
                    sx={{
                      p: { xs: 3, md: 4 },
                      textAlign: "center",
                      bgcolor: "#ffffff",
                    }}
                  >
                    <Stack spacing={1.5} alignItems="center">
                      <Avatar
                        sx={{
                          width: 52,
                          height: 52,
                          bgcolor: alpha("#10b981", 0.12),
                          color: "#047857",
                        }}
                      >
                        <ShieldRounded />
                      </Avatar>
                      <Typography variant="h6">No roles available yet</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Create the first custom role to start delegating access
                        across your team.
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={openCreateRoleDialog}
                        startIcon={<AddRounded />}
                      >
                        Create custom role
                      </Button>
                    </Stack>
                  </SectionCard>
                )}
              </Stack>
            )}
          </Box>
        </SectionCard>
      </Stack>

      <AssignRoleDialog
        key={`assign-role-${assignRoleDialogKey}`}
        errorMessage={assignRoleError}
        isSubmitting={assignRoleState.loading}
        onClose={closeAssignRoleDialog}
        onSubmit={handleAssignRole}
        open={!!selectedRow}
        roles={roles}
        user={selectedRow?.user ?? null}
        displayName={selectedRow?.name}
        displayEmail={selectedRow?.email ?? undefined}
      />

      <CreateRoleDialog
        key={`create-role-${createRoleDialogKey}`}
        errorMessage={createRoleError}
        existingRoles={roles}
        isSubmitting={createRoleState.loading}
        onClose={closeCreateRoleDialog}
        onSubmit={handleCreateRole}
        open={isCreateRoleOpen}
      />

      <Dialog
        open={!!pendingStatusAction}
        onClose={() =>
          setActiveStatusState.loading ? undefined : setPendingStatusAction(null)
        }
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          {pendingStatusAction?.nextStatus
            ? "Activate employee"
            : "Deactivate employee"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {pendingStatusAction
              ? pendingStatusAction.nextStatus
                ? `This will restore workspace access for ${pendingStatusAction.name}.`
                : `This will remove workspace access for ${pendingStatusAction.name} until they are reactivated.`
              : ""}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            color="inherit"
            onClick={() => setPendingStatusAction(null)}
            disabled={setActiveStatusState.loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color={pendingStatusAction?.nextStatus ? "success" : "error"}
            onClick={handleChangeEmployeeStatus}
            disabled={setActiveStatusState.loading}
          >
            {pendingStatusAction?.nextStatus ? "Activate" : "Deactivate"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
