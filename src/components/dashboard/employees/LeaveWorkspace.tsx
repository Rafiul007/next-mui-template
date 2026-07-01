"use client";

import { useState } from "react";
import dayjs from "dayjs";
import {
  AddRounded,
  CheckCircleRounded,
  CancelRounded,
  HourglassTopRounded,
  EventNoteRounded,
  BalanceRounded,
  SwapHorizRounded,
  PersonAddAlt1Rounded,
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
  TextField,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { toast } from "react-hot-toast";
import { SearchSelect, type SearchSelectOption } from "@/components/form";
import { SummaryCard } from "@/components/ui";
import {
  ApplyLeaveDocument,
  ApproveLeaveDocument,
  CancelLeaveDocument,
  GetEmployeesDocument,
  GetLeaveApplicationsDocument,
  GetLeaveBalanceDocument,
  GetUsersDocument,
  RejectLeaveDocument,
  type GetEmployeesQuery,
  type GetLeaveApplicationsQuery,
  type GetLeaveBalanceQuery,
  type GetUsersQuery,
} from "@/graphql/generated";
import {
  InitLeaveBalancesForEmployeeDocument,
  SuggestSubstitutesDocument,
} from "@/graphql/hr-extended";
import { getErrorMessage } from "@/lib/errors";
import { primaryGradient } from "@/theme/theme";
import { LeaveFormDialog, type LeaveFormValues } from "./LeaveFormDialog";

type LeaveRecord = GetLeaveApplicationsQuery["getLeaveApplications"][number];
type LeaveBalance = GetLeaveBalanceQuery["getLeaveBalance"][number];
type EmployeeRecord = GetEmployeesQuery["getEmployees"][number];
type UserRecord = NonNullable<GetUsersQuery["getUsers"][number]>;

const STATUS_COLOR: Record<
  string,
  "default" | "success" | "error" | "warning"
> = {
  pending: "default",
  approved: "success",
  rejected: "error",
  cancelled: "warning",
};

const LEAVE_TYPE_LABEL: Record<string, string> = {
  sick: "Sick",
  casual: "Casual",
  annual: "Annual",
  maternity: "Maternity",
  unpaid: "Unpaid",
};

const formatPersonName = (user: UserRecord) =>
  `${user.firstName} ${user.lastName ?? ""}`.trim() || user.email;

const calcDays = (startDate: string, endDate: string) => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  return end.diff(start, "day") + 1;
};

const buildLeaveColumns = ({
  userLookup,
  employeeLookup,
  onApprove,
  onReject,
  onCancel,
  onFindSubstitute,
  isActioning,
}: {
  userLookup: Map<string, string>;
  employeeLookup: Map<string, EmployeeRecord>;
  onApprove: (id: string) => void;
  onReject: (record: LeaveRecord) => void;
  onCancel: (id: string) => void;
  onFindSubstitute: (record: LeaveRecord) => void;
  isActioning: boolean;
}): MRT_ColumnDef<LeaveRecord>[] => [
  {
    id: "employee",
    accessorFn: (row) => {
      const emp = employeeLookup.get(row.employeeId);
      return emp?.userId ? (userLookup.get(emp.userId) ?? "—") : "—";
    },
    header: "Employee",
    size: 200,
    Cell: ({ cell }) => (
      <Typography variant="body2" fontWeight={600}>
        {String(cell.getValue())}
      </Typography>
    ),
  },
  {
    accessorKey: "leaveType",
    header: "Leave type",
    size: 120,
    filterVariant: "select",
    filterSelectOptions: ["sick", "casual", "annual", "maternity", "unpaid"],
    Cell: ({ cell }) => {
      const type = String(cell.getValue() ?? "").toLowerCase();
      return (
        <Chip
          label={LEAVE_TYPE_LABEL[type] ?? type}
          size="small"
          variant="outlined"
        />
      );
    },
  },
  {
    accessorKey: "startDate",
    header: "From",
    size: 120,
    Cell: ({ cell }) => (
      <Typography variant="body2">
        {dayjs(String(cell.getValue())).format("DD MMM YYYY")}
      </Typography>
    ),
  },
  {
    accessorKey: "endDate",
    header: "To",
    size: 120,
    Cell: ({ cell }) => (
      <Typography variant="body2">
        {dayjs(String(cell.getValue())).format("DD MMM YYYY")}
      </Typography>
    ),
  },
  {
    id: "days",
    accessorFn: (row) => calcDays(row.startDate, row.endDate),
    header: "Days",
    size: 80,
    Cell: ({ cell }) => (
      <Typography variant="body2">{String(cell.getValue())}</Typography>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 110,
    filterVariant: "select",
    filterSelectOptions: ["pending", "approved", "rejected", "cancelled"],
    Cell: ({ cell }) => {
      const status = String(cell.getValue() ?? "").toLowerCase();
      return (
        <Chip
          label={status.charAt(0).toUpperCase() + status.slice(1)}
          color={STATUS_COLOR[status] ?? "default"}
          size="small"
          variant={["rejected", "cancelled"].includes(status) ? "outlined" : "filled"}
        />
      );
    },
  },
  {
    accessorKey: "reason",
    header: "Reason",
    size: 200,
    Cell: ({ cell }) => (
      <Typography variant="body2" color="text.secondary" noWrap>
        {String(cell.getValue() ?? "—")}
      </Typography>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    size: 160,
    enableColumnFilter: false,
    enableSorting: false,
    Cell: ({ row }) => {
      const status = row.original.status?.toLowerCase();
      if (status === "pending") {
        return (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Approve">
              <IconButton
                size="small"
                color="success"
                disabled={isActioning}
                onClick={() => onApprove(row.original.id)}
                sx={{ bgcolor: alpha("#2563eb", 0.08) }}
              >
                <CheckCircleRounded fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reject">
              <IconButton
                size="small"
                color="error"
                disabled={isActioning}
                onClick={() => onReject(row.original)}
                sx={{ bgcolor: alpha("#ef4444", 0.08) }}
              >
                <CancelRounded fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        );
      }
      if (status === "approved") {
        return (
          <Tooltip title="Find substitute">
            <IconButton
              size="small"
              color="info"
              onClick={() => onFindSubstitute(row.original)}
              sx={{ bgcolor: alpha("#3b82f6", 0.08) }}
            >
              <SwapHorizRounded fontSize="small" />
            </IconButton>
          </Tooltip>
        );
      }
      return null;
    },
  },
];

export function LeaveWorkspace() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formDialogKey, setFormDialogKey] = useState(0);
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);
  const [leaveToReject, setLeaveToReject] = useState<LeaveRecord | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [substituteFor, setSubstituteFor] = useState<LeaveRecord | null>(null);

  const { data: usersData } = useQuery(GetUsersDocument, {
    variables: { page: 1, limit: 500 },
  });
  const { data: employeesData } = useQuery(GetEmployeesDocument);
  const {
    data: leaveData,
    loading: isLeaveLoading,
    error: leaveError,
    refetch: refetchLeave,
  } = useQuery(GetLeaveApplicationsDocument, {
    skip: !selectedEmployeeId,
    variables: { employeeId: selectedEmployeeId },
    fetchPolicy: "cache-and-network",
  });

  const { data: balanceData, refetch: refetchBalance } = useQuery(
    GetLeaveBalanceDocument,
    {
      skip: !selectedEmployeeId,
      variables: { employeeId: selectedEmployeeId, year: new Date().getFullYear() },
      fetchPolicy: "cache-and-network",
    },
  );

  const { data: substituteData, loading: substituteLoading } = useQuery(
    SuggestSubstitutesDocument,
    {
      skip: !substituteFor,
      variables: { leaveApplicationId: substituteFor?.id ?? "" },
      fetchPolicy: "cache-and-network",
    },
  );

  const [applyLeave, applyState] = useMutation(ApplyLeaveDocument);
  const [approveLeave, approveState] = useMutation(ApproveLeaveDocument);
  const [rejectLeave, rejectState] = useMutation(RejectLeaveDocument);
  const [cancelLeave, cancelState] = useMutation(CancelLeaveDocument);
  const [initLeaveBalances, initBalancesState] = useMutation(
    InitLeaveBalancesForEmployeeDocument,
  );

  const handleInitBalances = async () => {
    if (!selectedEmployeeId) return;
    try {
      await initLeaveBalances({ variables: { employeeId: selectedEmployeeId } });
      await refetchBalance();
      toast.success("Leave balances initialised.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to initialise leave balances."));
    }
  };

  const employees = employeesData?.getEmployees ?? [];
  const users = (usersData?.getUsers ?? []).filter(
    (u): u is UserRecord => !!u,
  );
  const leaveRecords = leaveData?.getLeaveApplications ?? [];
  const leaveBalances: LeaveBalance[] = balanceData?.getLeaveBalance ?? [];

  const userLookup = new Map(users.map((u) => [u.id, formatPersonName(u)]));
  const employeeLookup = new Map(employees.map((e) => [e.id, e]));

  const employeeOptions: SearchSelectOption[] = employees.map((e) => {
    const name = e.userId
      ? (userLookup.get(e.userId) ?? e.employeeCode)
      : e.employeeCode;
    return { value: e.id, label: name, keywords: e.employeeCode };
  });

  const pendingCount = leaveRecords.filter(
    (r) => r.status?.toLowerCase() === "pending",
  ).length;
  const approvedCount = leaveRecords.filter(
    (r) => r.status?.toLowerCase() === "approved",
  ).length;
  const rejectedCount = leaveRecords.filter(
    (r) => r.status?.toLowerCase() === "rejected",
  ).length;

  const isActioning =
    approveState.loading || rejectState.loading || cancelState.loading;

  const openApplyDialog = () => {
    setFormErrorMessage(null);
    setFormDialogKey((k) => k + 1);
    setIsFormOpen(true);
  };

  const closeFormDialog = () => {
    if (!applyState.loading) {
      setIsFormOpen(false);
      setFormErrorMessage(null);
    }
  };

  const handleApplyLeave = async (values: LeaveFormValues) => {
    setFormErrorMessage(null);
    try {
      const result = await applyLeave({
        variables: {
          input: {
            employeeId: values.employeeId,
            leaveType: values.leaveType.toUpperCase(),
            startDate: values.startDate!.format("YYYY-MM-DD"),
            endDate: values.endDate!.format("YYYY-MM-DD"),
            reason: values.reason?.trim() || undefined,
          },
        },
      });
      if (result.error) throw result.error;
      toast.success("Leave application submitted.");
      if (values.employeeId === selectedEmployeeId) await refetchLeave();
      closeFormDialog();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to submit leave application.");
      setFormErrorMessage(message);
      toast.error(message);
    }
  };

  const handleApprove = async (applicationId: string) => {
    try {
      const result = await approveLeave({ variables: { applicationId } });
      if (result.error) throw result.error;
      await refetchLeave();
      toast.success("Leave approved.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to approve leave."));
    }
  };

  const handleRejectConfirm = async () => {
    if (!leaveToReject) return;
    try {
      const result = await rejectLeave({
        variables: {
          applicationId: leaveToReject.id,
          reason: rejectReason.trim() || "Rejected by admin",
        },
      });
      if (result.error) throw result.error;
      await refetchLeave();
      toast.success("Leave rejected.");
      setLeaveToReject(null);
      setRejectReason("");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to reject leave."));
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
                Leave & time off
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Manage leave applications — approve, reject, or submit new requests.
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: { xs: "stretch", lg: "flex-end" },
                minWidth: { lg: 240 },
              }}
            >
              <Button
                variant="contained"
                startIcon={<AddRounded />}
                onClick={openApplyDialog}
                fullWidth
                sx={{
                  maxWidth: { xs: "100%", lg: 220 },
                  backgroundColor: primaryGradient,
                }}
              >
                Apply for leave
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
            caption="Total applications"
            title={String(leaveRecords.length)}
            icon={<EventNoteRounded />}
          />
          <SummaryCard
            caption="Pending"
            title={String(pendingCount)}
            icon={<HourglassTopRounded />}
            tone="default"
          />
          <SummaryCard
            caption="Approved"
            title={String(approvedCount)}
            icon={<CheckCircleRounded />}
            tone="success"
          />
          <SummaryCard
            caption="Rejected"
            title={String(rejectedCount)}
            icon={<CancelRounded />}
            tone="muted"
          />
        </Box>

        {leaveError ? (
          <Alert severity="error">
            {leaveError.message || "Unable to load leave records."}
          </Alert>
        ) : null}

        {selectedEmployeeId && leaveBalances.length > 0 ? (
          <Paper
            elevation={0}
            sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <BalanceRounded sx={{ color: "text.secondary", fontSize: 18 }} />
              <Typography variant="subtitle2">
                Leave balance — {new Date().getFullYear()}
              </Typography>
            </Stack>
            <Box
              sx={{
                display: "grid",
                gap: 1.5,
                gridTemplateColumns: {
                  xs: "repeat(2, 1fr)",
                  sm: "repeat(3, 1fr)",
                  md: "repeat(5, 1fr)",
                },
              }}
            >
              {leaveBalances.map((bal) => (
                <Box
                  key={bal.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: alpha("#0f172a", 0.08),
                    bgcolor: alpha("#f8fafc", 0.8),
                    textAlign: "center",
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: "capitalize" }}>
                    {LEAVE_TYPE_LABEL[bal.leaveType.toLowerCase()] ?? bal.leaveType}
                  </Typography>
                  <Typography variant="h5" sx={{ my: 0.5, color: bal.remainingDays <= 0 ? "error.main" : "success.main" }}>
                    {bal.remainingDays}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    of {bal.totalBalance} days left
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        ) : selectedEmployeeId ? (
          <Paper
            elevation={0}
            sx={{ p: 2.5, border: "1px dashed", borderColor: "divider" }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ sm: "center" }}
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <BalanceRounded sx={{ color: "text.secondary" }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    No leave balances yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Initialise this year&apos;s balances so the employee can apply
                    for leave.
                  </Typography>
                </Box>
              </Stack>
              <Button
                variant="contained"
                startIcon={<PersonAddAlt1Rounded />}
                onClick={handleInitBalances}
                disabled={initBalancesState.loading}
                sx={{ backgroundColor: primaryGradient, whiteSpace: "nowrap" }}
              >
                Initialise balances
              </Button>
            </Stack>
          </Paper>
        ) : null}

        {!selectedEmployeeId ? (
          <Paper
            elevation={0}
            sx={{ p: 4, border: "1px solid", borderColor: "divider" }}
          >
            <Stack spacing={2} alignItems="flex-start">
              <Typography variant="h6">Select an employee to view leaves</Typography>
              <Typography variant="body2" color="text.secondary">
                Choose an employee from the list below to see their leave history.
              </Typography>
              <Box sx={{ minWidth: 280 }}>
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
        ) : (
          <MaterialReactTable
            columns={buildLeaveColumns({
              userLookup,
              employeeLookup,
              onApprove: handleApprove,
              onReject: (record) => {
                setLeaveToReject(record);
                setRejectReason("");
              },
              onCancel: async (id) => {
                try {
                  const result = await cancelLeave({ variables: { applicationId: id } });
                  if (result.error) throw result.error;
                  await refetchLeave();
                  toast.success("Leave cancelled.");
                } catch (error) {
                  toast.error(getErrorMessage(error, "Unable to cancel leave."));
                }
              },
              onFindSubstitute: setSubstituteFor,
              isActioning,
            })}
            data={leaveRecords}
            enableColumnFilters
            enableDensityToggle={false}
            enableFullScreenToggle={false}
            enableHiding={false}
            enableRowActions={false}
            enableSorting
            enableStickyHeader
            getRowId={(row) => row.id}
            initialState={{
              pagination: { pageIndex: 0, pageSize: 10 },
              showColumnFilters: false,
              sorting: [{ id: "startDate", desc: true }],
            }}
            localization={{ noRecordsToDisplay: "No leave applications found" }}
            muiSearchTextFieldProps={{
              placeholder: "Search leaves",
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
            muiTableBodyRowProps={{
              sx: {
                bgcolor: "#ffffff",
                transition: "background-color 140ms ease",
                "&:hover td": { bgcolor: alpha("#eff6ff", 0.9) },
              },
            }}
            muiTableBodyCellProps={{
              sx: {
                bgcolor: "#ffffff",
                borderBottom: "1px solid",
                borderColor: alpha("#0f172a", 0.06),
                py: 2.25,
              },
            }}
            muiTableContainerProps={{
              sx: { maxHeight: 640, bgcolor: "#ffffff" },
            }}
            muiTableHeadCellProps={{
              sx: {
                bgcolor: "#ffffff",
                color: alpha("#0f172a", 0.72),
                fontSize: 13,
                fontWeight: 700,
                py: 1.75,
                borderBottom: "1px solid",
                borderColor: alpha("#0f172a", 0.08),
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
            renderTopToolbarCustomActions={() => (
              <Box sx={{ minWidth: 220 }}>
                <SearchSelect
                  label="Employee"
                  placeholder="Search by name or code…"
                  options={employeeOptions}
                  value={selectedEmployeeId}
                  onChange={setSelectedEmployeeId}
                />
              </Box>
            )}
            state={{ isLoading: isLeaveLoading && leaveRecords.length === 0 }}
          />
        )}
      </Stack>

      <LeaveFormDialog
        key={formDialogKey}
        employeeOptions={employeeOptions}
        errorMessage={formErrorMessage}
        isSubmitting={applyState.loading}
        onClose={closeFormDialog}
        onSubmit={handleApplyLeave}
        open={isFormOpen}
      />

      <Dialog
        open={!!substituteFor}
        onClose={() => setSubstituteFor(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Suggested substitutes</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Available staff who can cover this leave, ranked by suitability.
          </Typography>
          {substituteLoading && !substituteData ? (
            <Typography variant="body2" color="text.secondary">
              Finding substitutes…
            </Typography>
          ) : (substituteData?.suggestSubstitutes ?? []).length === 0 ? (
            <Alert severity="info">
              No available substitutes found for this leave period.
            </Alert>
          ) : (
            <Stack spacing={1}>
              {(substituteData?.suggestSubstitutes ?? []).map((emp) => {
                const name = emp.userInfo
                  ? `${emp.userInfo.firstName} ${emp.userInfo.lastName ?? ""}`.trim()
                  : emp.employeeCode;
                return (
                  <Paper
                    key={emp.id}
                    elevation={0}
                    sx={{
                      p: 1.75,
                      border: "1px solid",
                      borderColor: alpha("#0f172a", 0.08),
                      borderRadius: 2,
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <SwapHorizRounded sx={{ color: "info.main" }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {emp.employeeCode}
                          {emp.designation ? ` · ${emp.designation}` : ""}
                          {emp.department ? ` · ${emp.department}` : ""}
                        </Typography>
                      </Box>
                      {emp.userInfo?.phone ? (
                        <Typography variant="caption" color="text.secondary">
                          {emp.userInfo.phone}
                        </Typography>
                      ) : null}
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={() => setSubstituteFor(null)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!leaveToReject}
        onClose={() => !rejectState.loading && setLeaveToReject(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Reject leave application</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Provide a reason for rejecting this leave request.
            </Typography>
            <TextField
              label="Reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              multiline
              rows={3}
              size="small"
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            color="inherit"
            onClick={() => setLeaveToReject(null)}
            disabled={rejectState.loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRejectConfirm}
            disabled={rejectState.loading}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
