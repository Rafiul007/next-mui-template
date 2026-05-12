"use client";

import { useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import {
  AddRounded,
  BadgeRounded,
  BlockRounded,
  EditRounded,
  GroupsRounded,
  HourglassTopRounded,
  PersonOffRounded,
} from "@mui/icons-material";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Alert,
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
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { toast } from "react-hot-toast";
import type { RhfSelectOption } from "@/components/form";
import { SummaryCard } from "@/components/ui";
import {
  GetBranchesDocument,
  GetCenterDocument,
  GetEmployeesDocument,
  GetUsersDocument,
  OnboardEmployeeDocument,
  UpdateEmployeeDocument,
  type GetEmployeesQuery,
  type GetUsersQuery,
} from "@/graphql/generated";
import { getErrorMessage } from "@/lib/errors";
import { primaryGradient } from "@/theme/theme";
import {
  EmployeeFormDialog,
  type EmployeeFormValues,
} from "./EmployeeFormDialog";

type EmployeeRecord = GetEmployeesQuery["getEmployees"][number];
type UserRecord = NonNullable<GetUsersQuery["getUsers"][number]>;

type EmploymentType = "full-time" | "part-time" | "contractual" | "intern";
type EmployeeStatus = "active" | "inactive" | string;

const EMPLOYMENT_TYPE_LABEL: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACTUAL: "Contractual",
  INTERN: "Intern",
};

const STATUS_COLOR: Record<string, "success" | "warning" | "default"> = {
  active: "success",
  probation: "warning",
};

const toApiEnum = (value: string) => value.toUpperCase().replace(/-/g, "_");

const toOptionalString = (value: string) => {
  const trimmed = value.trim();
  return trimmed || undefined;
};

const formatPersonName = (user: UserRecord) =>
  `${user.firstName} ${user.lastName ?? ""}`.trim() || user.email;

const getEmployeeFormValues = (
  employee?: EmployeeRecord | null,
): EmployeeFormValues => {
  if (!employee) {
    return {
      branchId: "",
      userId: "",
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
  }

  return {
    branchId: employee.branchId,
    userId: employee.userId ?? "",
    employmentType: employee.employmentType
      ? employee.employmentType.toLowerCase().replace(/_/g, "-")
      : "",
    joiningDate: employee.joiningDate
      ? dayjs(employee.joiningDate)
      : (null as unknown as Dayjs),
    employeeCode: employee.employeeCode ?? "",
    designation: employee.designation ?? "",
    department: employee.department ?? "",
    nid: employee.nid ?? "",
    tin: employee.tin ?? "",
    bloodGroup: employee.bloodGroup ?? "",
    emergencyContactName: employee.emergencyContactName ?? "",
    emergencyContactPhone: employee.emergencyContactPhone ?? "",
    probationEndsAt: employee.probationEndsAt
      ? dayjs(employee.probationEndsAt)
      : (null as unknown as Dayjs),
  };
};

const buildEmployeeColumns = ({
  userLookup,
  branchLookup,
}: {
  userLookup: Map<string, string>;
  branchLookup: Map<string, string>;
}): MRT_ColumnDef<EmployeeRecord>[] => [
  {
    id: "name",
    accessorFn: (emp) =>
      emp.userId ? (userLookup.get(emp.userId) ?? "No user linked") : "No user linked",
    header: "Staff member",
    size: 220,
    Cell: ({ row }) => {
      const name = row.original.userId
        ? (userLookup.get(row.original.userId) ?? "No user linked")
        : "No user linked";
      return (
        <Stack spacing={0.5}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {row.original.employeeCode}
          </Typography>
        </Stack>
      );
    },
  },
  {
    id: "branch",
    accessorFn: (emp) => branchLookup.get(emp.branchId) ?? "Unknown",
    header: "Branch",
    size: 160,
    Cell: ({ cell }) => (
      <Typography variant="body2">{String(cell.getValue())}</Typography>
    ),
  },
  {
    accessorKey: "designation",
    header: "Designation",
    size: 160,
    Cell: ({ cell }) => (
      <Typography variant="body2">{String(cell.getValue() ?? "—")}</Typography>
    ),
  },
  {
    accessorKey: "department",
    header: "Department",
    size: 140,
    Cell: ({ cell }) => (
      <Typography variant="body2">{String(cell.getValue() ?? "—")}</Typography>
    ),
  },
  {
    accessorKey: "employmentType",
    header: "Type",
    size: 120,
    Cell: ({ cell }) => {
      const raw = String(cell.getValue() ?? "");
      return (
        <Chip
          label={EMPLOYMENT_TYPE_LABEL[raw] ?? raw}
          size="small"
          variant="outlined"
        />
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 110,
    filterVariant: "select",
    filterSelectOptions: ["active", "probation", "inactive"],
    Cell: ({ cell }) => {
      const status = String(cell.getValue() ?? "active").toLowerCase();
      const label =
        status === "probation"
          ? "Probation"
          : status.charAt(0).toUpperCase() + status.slice(1);
      return (
        <Chip
          label={label}
          color={STATUS_COLOR[status] ?? "default"}
          size="small"
          variant={status === "inactive" ? "outlined" : "filled"}
        />
      );
    },
  },
  {
    accessorKey: "joiningDate",
    header: "Joining date",
    size: 130,
    Cell: ({ cell }) => {
      const val = cell.getValue<string | null>();
      return (
        <Typography variant="body2">
          {val ? dayjs(val).format("DD MMM YYYY") : "—"}
        </Typography>
      );
    },
  },
];

export function EmployeesWorkspace() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeRecord | null>(null);
  const [employeeToDeactivate, setEmployeeToDeactivate] =
    useState<EmployeeRecord | null>(null);
  const [formDialogKey, setFormDialogKey] = useState(0);
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);

  const { data: centerData } = useQuery(GetCenterDocument);
  const {
    data: usersData,
    loading: isUsersLoading,
  } = useQuery(GetUsersDocument, { variables: { page: 1, limit: 500 } });
  const {
    data: branchesData,
    loading: isBranchesLoading,
  } = useQuery(GetBranchesDocument, {
    skip: !centerData?.getCenter?.id,
    variables: { centerId: centerData?.getCenter?.id ?? "" },
  });
  const {
    data: employeesData,
    loading: isEmployeesLoading,
    error: employeesError,
    refetch: refetchEmployees,
  } = useQuery(GetEmployeesDocument);

  const [onboardEmployee, onboardState] = useMutation(OnboardEmployeeDocument);
  const [updateEmployee, updateState] = useMutation(UpdateEmployeeDocument);

  const employees = employeesData?.getEmployees ?? [];
  const users = (usersData?.getUsers ?? []).filter(
    (u): u is UserRecord => !!u,
  );
  const branches = branchesData?.getBranches ?? [];

  const userLookup = new Map(users.map((u) => [u.id, formatPersonName(u)]));
  const branchLookup = new Map(branches.map((b) => [b.id, b.name]));

  const branchOptions: RhfSelectOption[] = branches.map((b) => ({
    label: b.name,
    value: b.id,
  }));
  const userOptions: RhfSelectOption[] = users.map((u) => ({
    label: `${formatPersonName(u)} — ${u.email}`,
    value: u.id,
  }));

  const activeCount = employees.filter(
    (e) => e.status?.toLowerCase() === "active",
  ).length;
  const probationCount = employees.filter(
    (e) => e.status?.toLowerCase() === "probation",
  ).length;
  const inactiveCount = employees.filter(
    (e) => e.status?.toLowerCase() === "inactive",
  ).length;

  const isSaving = onboardState.loading || updateState.loading;
  const isLoading = isUsersLoading || isBranchesLoading || isEmployeesLoading;

  const openCreateDialog = () => {
    setFormMode("create");
    setSelectedEmployee(null);
    setFormErrorMessage(null);
    setFormDialogKey((k) => k + 1);
    setIsFormOpen(true);
  };

  const openEditDialog = (employee: EmployeeRecord) => {
    setFormMode("edit");
    setSelectedEmployee(employee);
    setFormErrorMessage(null);
    setFormDialogKey((k) => k + 1);
    setIsFormOpen(true);
  };

  const closeFormDialog = () => {
    if (!isSaving) {
      setIsFormOpen(false);
      setSelectedEmployee(null);
      setFormErrorMessage(null);
    }
  };

  const handleSubmitEmployee = async (values: EmployeeFormValues) => {
    setFormErrorMessage(null);
    try {
      if (formMode === "edit" && selectedEmployee) {
        const result = await updateEmployee({
          variables: {
            input: {
              employeeId: selectedEmployee.id,
              designation: toOptionalString(values.designation ?? ""),
              department: toOptionalString(values.department ?? ""),
              nid: toOptionalString(values.nid ?? ""),
              tin: toOptionalString(values.tin ?? ""),
              bloodGroup: toOptionalString(values.bloodGroup ?? ""),
              emergencyContactName: toOptionalString(values.emergencyContactName ?? ""),
              emergencyContactPhone: toOptionalString(values.emergencyContactPhone ?? ""),
            },
          },
        });
        if (result.error) throw result.error;
        toast.success("Employee profile updated.");
      } else {
        const result = await onboardEmployee({
          variables: {
            input: {
              branchId: values.branchId,
              userId: toOptionalString(values.userId ?? ""),
              employmentType: toApiEnum(values.employmentType),
              joiningDate: values.joiningDate!.format("YYYY-MM-DD"),
              employeeCode: toOptionalString(values.employeeCode ?? ""),
              designation: toOptionalString(values.designation ?? ""),
              department: toOptionalString(values.department ?? ""),
              nid: toOptionalString(values.nid ?? ""),
              tin: toOptionalString(values.tin ?? ""),
              bloodGroup: toOptionalString(values.bloodGroup ?? ""),
              emergencyContactName: toOptionalString(values.emergencyContactName ?? ""),
              emergencyContactPhone: toOptionalString(values.emergencyContactPhone ?? ""),
              probationEndsAt: values.probationEndsAt
                ? values.probationEndsAt.format("YYYY-MM-DD")
                : undefined,
            },
          },
        });
        if (result.error) throw result.error;
        toast.success("Employee onboarded successfully.");
      }
      await refetchEmployees();
      closeFormDialog();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to save employee. Please try again.");
      setFormErrorMessage(message);
      toast.error(message);
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
          <Stack
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            spacing={3}
          >
            <Box sx={{ maxWidth: 760 }}>
              <Typography variant="h4" component="h1" sx={{ mt: 0.5 }}>
                Staff directory
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Manage employee profiles, employment types, and branch assignments.
              </Typography>
            </Box>
            <Box
              sx={{
                minWidth: { lg: 240 },
                display: "flex",
                alignItems: "flex-start",
                justifyContent: { xs: "stretch", lg: "flex-end" },
              }}
            >
              <Button
                variant="contained"
                startIcon={<AddRounded />}
                onClick={openCreateDialog}
                fullWidth
                sx={{
                  maxWidth: { xs: "100%", lg: 220 },
                  backgroundImage: primaryGradient,
                }}
              >
                Onboard employee
              </Button>
            </Box>
          </Stack>
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
            caption="Total staff"
            title={String(employees.length)}
            icon={<GroupsRounded />}
          />
          <SummaryCard
            caption="Active"
            title={String(activeCount)}
            icon={<BadgeRounded />}
            tone="success"
          />
          <SummaryCard
            caption="On probation"
            title={String(probationCount)}
            icon={<HourglassTopRounded />}
            tone="default"
          />
          <SummaryCard
            caption="Inactive"
            title={String(inactiveCount)}
            icon={<PersonOffRounded />}
            tone="muted"
          />
        </Box>

        {employeesError ? (
          <Alert severity="error">
            {employeesError.message || "Unable to load employee data."}
          </Alert>
        ) : null}

        <MaterialReactTable
          columns={buildEmployeeColumns({ userLookup, branchLookup })}
          data={employees}
          enableColumnFilters
          enableDensityToggle={false}
          enableFullScreenToggle={false}
          enableHiding={false}
          enableRowActions
          enableSorting
          enableStickyHeader
          getRowId={(row) => row.id}
          initialState={{
            pagination: { pageIndex: 0, pageSize: 10 },
            showColumnFilters: false,
            sorting: [{ id: "name", desc: false }],
          }}
          localization={{
            actions: "Actions",
            noRecordsToDisplay: "No employees found",
          }}
          positionActionsColumn="last"
          muiSearchTextFieldProps={{
            placeholder: "Search staff",
            size: "small",
            sx: { minWidth: { xs: "100%", md: 280 } },
          }}
          muiBottomToolbarProps={{
            sx: {
              borderTop: "1px solid",
              borderColor: alpha("#0f172a", 0.08),
              bgcolor: "#ffffff",
            },
          }}
          muiTableBodyRowProps={({ row }) => ({
            sx: {
              opacity: row.original.status?.toLowerCase() === "inactive" ? 0.76 : 1,
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
                  "& .Mui-TableHeadCell-Content": { justifyContent: "flex-end" },
                },
              },
            },
          }}
          renderEmptyRowsFallback={() => (
            <Box sx={{ px: 3, py: 6, textAlign: "center" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                No employees yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Onboard your first team member to get started.
              </Typography>
            </Box>
          )}
          renderRowActions={({ row }) => (
            <Stack
              direction="row"
              spacing={0.5}
              justifyContent="flex-end"
              sx={{ width: "100%" }}
            >
              <Tooltip title="Edit profile">
                <IconButton
                  size="small"
                  onClick={() => openEditDialog(row.original)}
                  sx={{ bgcolor: alpha("#0f172a", 0.04) }}
                >
                  <EditRounded fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Deactivate employee">
                <span>
                  <IconButton
                    size="small"
                    disabled={row.original.status?.toLowerCase() === "inactive"}
                    onClick={() => setEmployeeToDeactivate(row.original)}
                    sx={{ bgcolor: alpha("#ef4444", 0.08), color: "#b91c1c" }}
                  >
                    <BlockRounded fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          )}
          renderTopToolbarCustomActions={() => (
            <Typography variant="body2" color="text.secondary">
              {employees.length} staff member{employees.length === 1 ? "" : "s"}
            </Typography>
          )}
          state={{ isLoading: isLoading && employees.length === 0 }}
        />
      </Stack>

      <EmployeeFormDialog
        key={formDialogKey}
        branchOptions={branchOptions}
        errorMessage={formErrorMessage}
        initialValues={getEmployeeFormValues(selectedEmployee)}
        isSubmitting={isSaving}
        mode={formMode}
        onClose={closeFormDialog}
        onSubmit={handleSubmitEmployee}
        open={isFormOpen}
        userOptions={userOptions}
      />

      <Dialog
        open={!!employeeToDeactivate}
        onClose={() => setEmployeeToDeactivate(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Deactivate employee</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This will mark the employee as inactive. Their records and history
            will be preserved.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={() => setEmployeeToDeactivate(null)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              toast("Deactivation requires a backend mutation — coming soon.");
              setEmployeeToDeactivate(null);
            }}
          >
            Deactivate
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
