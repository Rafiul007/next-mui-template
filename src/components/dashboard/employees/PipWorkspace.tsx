"use client";

import { useState } from "react";
import {
  AddRounded,
  AssignmentLateRounded,
  CheckCircleOutlineRounded,
  EditRounded,
  PendingActionsRounded,
} from "@mui/icons-material";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { toast } from "react-hot-toast";
import { SearchSelect, type SearchSelectOption } from "@/components/form";
import { SummaryCard } from "@/components/ui";
import {
  CreatePipDocument,
  GetEmployeesDocument,
  GetPiPsDocument,
  GetUsersDocument,
  MeDocument,
  UpdatePipProgressDocument,
  type GetEmployeesQuery,
  type GetPiPsQuery,
  type GetUsersQuery,
} from "@/graphql/generated";
import { getErrorMessage } from "@/lib/errors";
import { primaryGradient } from "@/theme/theme";
import { PipCreateDialog, PipUpdateDialog, type PipCreateValues, type PipUpdateValues } from "./PipFormDialog";

type PipRecord = GetPiPsQuery["getPIPs"][number];
type EmployeeRecord = GetEmployeesQuery["getEmployees"][number];
type UserRecord = NonNullable<GetUsersQuery["getUsers"][number]>;

const STATUS_COLOR: Record<string, "warning" | "success" | "error" | "default"> = {
  ACTIVE: "warning",
  COMPLETED: "success",
  TERMINATED: "error",
};

const formatName = (u: UserRecord) => `${u.firstName} ${u.lastName ?? ""}`.trim() || u.email;

const buildColumns = ({
  userLookup,
  employeeLookup,
  onUpdate,
}: {
  userLookup: Map<string, string>;
  employeeLookup: Map<string, EmployeeRecord>;
  onUpdate: (pip: PipRecord) => void;
}): MRT_ColumnDef<PipRecord>[] => [
  {
    id: "employee",
    accessorFn: (row) => {
      const emp = employeeLookup.get(row.employeeId);
      return emp?.userId ? (userLookup.get(emp.userId) ?? emp.employeeCode) : (emp?.employeeCode ?? "—");
    },
    header: "Employee",
    size: 200,
    Cell: ({ cell }) => <Typography variant="body2" fontWeight={600}>{String(cell.getValue())}</Typography>,
  },
  {
    accessorKey: "goals",
    header: "Goals",
    size: 300,
    Cell: ({ cell }) => (
      <Typography variant="body2" sx={{ maxWidth: 280, whiteSpace: "normal", lineHeight: 1.5 }}>
        {String(cell.getValue())}
      </Typography>
    ),
  },
  {
    accessorKey: "startDate",
    header: "Start",
    size: 120,
    Cell: ({ cell }) => <Typography variant="body2">{String(cell.getValue())}</Typography>,
  },
  {
    accessorKey: "endDate",
    header: "End",
    size: 120,
    Cell: ({ cell }) => <Typography variant="body2">{String(cell.getValue())}</Typography>,
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 120,
    Cell: ({ cell }) => {
      const val = String(cell.getValue());
      return <Chip label={val} size="small" color={STATUS_COLOR[val] ?? "default"} variant="outlined" />;
    },
  },
  {
    accessorKey: "progressNotes",
    header: "Progress notes",
    size: 220,
    Cell: ({ cell }) => (
      <Typography variant="body2" color={!cell.getValue() ? "text.disabled" : undefined} noWrap>
        {String(cell.getValue() ?? "—")}
      </Typography>
    ),
  },
  {
    id: "actions",
    header: "",
    size: 60,
    enableColumnFilter: false,
    enableSorting: false,
    Cell: ({ row }) => (
      <Tooltip title="Update progress">
        <IconButton size="small" onClick={() => onUpdate(row.original)}>
          <EditRounded fontSize="small" />
        </IconButton>
      </Tooltip>
    ),
  },
];

export function PipWorkspace() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createKey, setCreateKey] = useState(0);
  const [createError, setCreateError] = useState<string | null>(null);
  const [updateTarget, setUpdateTarget] = useState<PipRecord | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const { data: meData } = useQuery(MeDocument);
  const { data: usersData } = useQuery(GetUsersDocument, { variables: { page: 1, limit: 500 } });
  const { data: empData } = useQuery(GetEmployeesDocument);
  const {
    data: pipsData,
    loading: isPipsLoading,
    error: pipsError,
    refetch: refetchPips,
  } = useQuery(GetPiPsDocument, {
    skip: !selectedEmployeeId,
    variables: { employeeId: selectedEmployeeId },
    fetchPolicy: "cache-and-network",
  });

  const [createPip, createState] = useMutation(CreatePipDocument);
  const [updatePip, updateState] = useMutation(UpdatePipProgressDocument);

  const employees = empData?.getEmployees ?? [];
  const users = (usersData?.getUsers ?? []).filter((u): u is UserRecord => !!u);
  const pips = pipsData?.getPIPs ?? [];

  const userLookup = new Map(users.map((u) => [u.id, formatName(u)]));
  const employeeLookup = new Map(employees.map((e) => [e.id, e]));

  const employeeOptions: SearchSelectOption[] = employees.map((e) => {
    const name = e.userId
      ? (userLookup.get(e.userId) ?? e.employeeCode)
      : e.employeeCode;
    return { value: e.id, label: name, keywords: e.employeeCode };
  });

  const activePips = pips.filter((p) => p.status === "ACTIVE").length;
  const completedPips = pips.filter((p) => p.status === "COMPLETED").length;

  const openCreate = () => {
    setCreateError(null);
    setCreateKey((k) => k + 1);
    setIsCreateOpen(true);
  };

  const openUpdate = (pip: PipRecord) => {
    setUpdateError(null);
    setUpdateTarget(pip);
  };

  const handleCreate = async (values: PipCreateValues) => {
    setCreateError(null);
    const currentUserId = meData?.me?.user?.id;
    if (!currentUserId) {
      setCreateError("Unable to identify the current user. Please refresh and try again.");
      return;
    }
    try {
      const result = await createPip({
        variables: {
          input: {
            employeeId: values.employeeId,
            goals: values.goals.trim(),
            startDate: values.startDate!.format("YYYY-MM-DD"),
            endDate: values.endDate!.format("YYYY-MM-DD"),
            createdBy: currentUserId,
          },
        },
      });
      if (result.error) throw result.error;
      if (values.employeeId === selectedEmployeeId) await refetchPips();
      toast.success("PIP created.");
      setIsCreateOpen(false);
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to create PIP.");
      setCreateError(msg);
      toast.error(msg);
    }
  };

  const handleUpdate = async (pipId: string, values: PipUpdateValues) => {
    setUpdateError(null);
    try {
      const result = await updatePip({
        variables: {
          input: {
            id: pipId,
            status: values.status,
            progressNotes: values.progressNotes?.trim() || undefined,
          },
        },
      });
      if (result.error) throw result.error;
      await refetchPips();
      toast.success("PIP progress updated.");
      setUpdateTarget(null);
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to update PIP.");
      setUpdateError(msg);
      toast.error(msg);
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
            background: "linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(240,253,250,0.98) 100%)",
          }}
        >
          <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" spacing={3}>
            <Box sx={{ maxWidth: 720 }}>
              <Typography variant="h4" component="h1" sx={{ mt: 0.5 }}>
                Performance Improvement Plans
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Create PIPs for underperforming staff, set goals, and track progress toward resolution.
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: { xs: "stretch", lg: "flex-end" } }}>
              <Button
                variant="contained"
                startIcon={<AddRounded />}
                onClick={openCreate}
                sx={{ backgroundColor: primaryGradient, maxWidth: { xs: "100%", lg: 180 } }}
                fullWidth
              >
                New PIP
              </Button>
            </Box>
          </Stack>
        </Paper>

        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" } }}>
          <SummaryCard caption="Total PIPs" title={String(pips.length)} icon={<AssignmentLateRounded />} />
          <SummaryCard caption="Active" title={String(activePips)} icon={<PendingActionsRounded />} tone="default" />
          <SummaryCard caption="Completed" title={String(completedPips)} icon={<CheckCircleOutlineRounded />} tone="success" />
        </Box>

        {/* Employee filter */}
        <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
            <Typography variant="body2" fontWeight={600} sx={{ minWidth: 120 }}>
              Filter by employee
            </Typography>
            <Box sx={{ flex: 1, maxWidth: 360 }}>
              <SearchSelect
                label="Employee"
                placeholder="Search by name or code…"
                options={employeeOptions}
                value={selectedEmployeeId}
                onChange={setSelectedEmployeeId}
              />
            </Box>
          </Stack>
        </Paper>

        {pipsError ? (
          <Alert severity="error">{pipsError.message || "Unable to load PIPs."}</Alert>
        ) : null}

        {!selectedEmployeeId ? (
          <Paper elevation={0} sx={{ p: 5, border: "1px solid", borderColor: "divider", textAlign: "center" }}>
            <AssignmentLateRounded sx={{ fontSize: 44, color: "text.disabled", mb: 1.5 }} />
            <Typography variant="subtitle1" fontWeight={700}>Select an employee</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Choose an employee above to view their Performance Improvement Plans.
            </Typography>
          </Paper>
        ) : (
          <MaterialReactTable
            columns={buildColumns({ userLookup, employeeLookup, onUpdate: openUpdate })}
            data={pips}
            enableColumnFilters
            enableDensityToggle={false}
            enableFullScreenToggle={false}
            enableHiding={false}
            enableSorting
            enableStickyHeader
            getRowId={(row) => row.id}
            initialState={{ pagination: { pageIndex: 0, pageSize: 10 } }}
            localization={{ noRecordsToDisplay: "No PIPs found for this employee" }}
            muiTableBodyRowProps={{ sx: { bgcolor: "#ffffff", "&:hover td": { bgcolor: alpha("#eff6ff", 0.9) } } }}
            muiTableBodyCellProps={{ sx: { bgcolor: "#ffffff", borderBottom: "1px solid", borderColor: alpha("#0f172a", 0.06), py: 2 } }}
            muiTableContainerProps={{ sx: { maxHeight: 560, bgcolor: "#ffffff" } }}
            muiTableHeadCellProps={{ sx: { bgcolor: "#ffffff", color: alpha("#0f172a", 0.72), fontSize: 13, fontWeight: 700, py: 1.75, borderBottom: "1px solid", borderColor: alpha("#0f172a", 0.08) } }}
            muiTablePaperProps={{ elevation: 0, sx: { border: "1px solid", borderColor: alpha("#0f172a", 0.08), borderRadius: 2, overflow: "hidden", bgcolor: "#ffffff", boxShadow: `0 16px 40px ${alpha("#0f172a", 0.06)}` } }}
            muiTopToolbarProps={{ sx: { px: 2.5, py: 1.75, bgcolor: "#ffffff", borderBottom: "1px solid", borderColor: alpha("#0f172a", 0.08) } }}
            muiBottomToolbarProps={{ sx: { borderTop: "1px solid", borderColor: alpha("#0f172a", 0.08), bgcolor: "#ffffff" } }}
            state={{ isLoading: isPipsLoading && pips.length === 0 }}
          />
        )}
      </Stack>

      <PipCreateDialog
        key={`create-${createKey}`}
        open={isCreateOpen}
        isSubmitting={createState.loading}
        employeeOptions={employeeOptions}
        errorMessage={createError}
        onClose={() => !createState.loading && setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />

      {updateTarget && (
        <PipUpdateDialog
          key={`update-${updateTarget.id}`}
          open={!!updateTarget}
          isSubmitting={updateState.loading}
          pipId={updateTarget.id}
          currentStatus={updateTarget.status}
          errorMessage={updateError}
          onClose={() => !updateState.loading && setUpdateTarget(null)}
          onSubmit={handleUpdate}
        />
      )}
    </>
  );
}
