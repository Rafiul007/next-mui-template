"use client";

import { useState } from "react";
import dayjs from "dayjs";
import {
  AddRounded,
  BalanceRounded,
  BeachAccessRounded,
  EventNoteRounded,
} from "@mui/icons-material";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { toast } from "react-hot-toast";
import {
  ApplyLeaveDocument,
  CancelLeaveDocument,
  GetMyLeaveApplicationsDocument,
  GetMyLeaveBalanceDocument,
  type GetMyLeaveApplicationsQuery,
} from "@/graphql/generated";
import { GetMyEmployeeProfileDocument } from "@/graphql/hr-extended";
import { SummaryCard } from "@/components/ui";
import { getErrorMessage } from "@/lib/errors";
import { primaryGradient } from "@/theme/theme";

type LeaveRecord = GetMyLeaveApplicationsQuery["getMyLeaveApplications"][number];

const LEAVE_TYPES = [
  { value: "sick", label: "Sick" },
  { value: "casual", label: "Casual" },
  { value: "annual", label: "Annual" },
  { value: "maternity", label: "Maternity" },
  { value: "unpaid", label: "Unpaid" },
];

const STATUS_COLOR: Record<string, "default" | "success" | "error" | "warning"> = {
  pending: "warning",
  approved: "success",
  rejected: "error",
  cancelled: "default",
};

export function TeacherLeaveWorkspace() {
  const { data: profileData, error: profileError } = useQuery(
    GetMyEmployeeProfileDocument,
    { fetchPolicy: "cache-and-network", errorPolicy: "all" },
  );
  const employeeId = profileData?.getMyEmployeeProfile?.id ?? "";

  const {
    data: leaveData,
    loading: leaveLoading,
    refetch: refetchLeave,
  } = useQuery(GetMyLeaveApplicationsDocument, {
    fetchPolicy: "cache-and-network",
  });

  const { data: balanceData, refetch: refetchBalance } = useQuery(
    GetMyLeaveBalanceDocument,
    {
      variables: { year: new Date().getFullYear() },
      fetchPolicy: "cache-and-network",
    },
  );

  const [applyLeave, { loading: applying }] = useMutation(ApplyLeaveDocument);
  const [cancelLeave] = useMutation(CancelLeaveDocument);

  const [open, setOpen] = useState(false);
  const [leaveType, setLeaveType] = useState("casual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const records = leaveData?.getMyLeaveApplications ?? [];
  const balances = balanceData?.getMyLeaveBalance ?? [];
  const pending = records.filter((r) => r.status?.toLowerCase() === "pending").length;
  const approved = records.filter((r) => r.status?.toLowerCase() === "approved").length;

  // Balance for the leave type currently selected in the apply dialog. Unpaid
  // and types without a policy simply won't have a matching balance, so those
  // are never blocked.
  const selectedBalance = balances.find(
    (b) => b.leaveType.toLowerCase() === leaveType.toLowerCase(),
  );
  const requestedDays =
    startDate && endDate && !dayjs(endDate).isBefore(dayjs(startDate))
      ? dayjs(endDate).diff(dayjs(startDate), "day") + 1
      : 0;
  const exceedsBalance =
    selectedBalance != null && requestedDays > selectedBalance.remainingDays;

  const resetForm = () => {
    setLeaveType("casual");
    setStartDate("");
    setEndDate("");
    setReason("");
    setError(null);
  };

  const handleApply = async () => {
    if (!startDate || !endDate) {
      setError("Select start and end dates.");
      return;
    }
    if (dayjs(endDate).isBefore(dayjs(startDate))) {
      setError("End date cannot be before the start date.");
      return;
    }
    if (exceedsBalance) {
      setError(
        `Only ${selectedBalance!.remainingDays} ${leaveType} day(s) left, but ${requestedDays} requested.`,
      );
      return;
    }
    setError(null);
    try {
      await applyLeave({
        variables: {
          input: {
            employeeId,
            leaveType: leaveType.toUpperCase(),
            startDate,
            endDate,
            reason: reason.trim() || undefined,
          },
        },
      });
      toast.success("Leave application submitted.");
      await refetchLeave();
      setOpen(false);
      resetForm();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to submit leave application."));
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelLeave({ variables: { applicationId: id } });
      toast.success("Leave cancelled.");
      await refetchLeave();
      await refetchBalance();
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to cancel leave."));
    }
  };

  const columns: MRT_ColumnDef<LeaveRecord>[] = [
    {
      accessorKey: "leaveType",
      header: "Type",
      size: 120,
      Cell: ({ cell }) => (
        <Chip
          label={String(cell.getValue() ?? "").toLowerCase()}
          size="small"
          variant="outlined"
          sx={{ textTransform: "capitalize" }}
        />
      ),
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
      header: "Days",
      size: 80,
      accessorFn: (r) => dayjs(r.endDate).diff(dayjs(r.startDate), "day") + 1,
      Cell: ({ cell }) => <Typography variant="body2">{String(cell.getValue())}</Typography>,
    },
    {
      accessorKey: "reason",
      header: "Reason",
      size: 220,
      Cell: ({ cell }) => (
        <Typography variant="body2" color="text.secondary" noWrap>
          {String(cell.getValue() ?? "—")}
        </Typography>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 120,
      Cell: ({ cell }) => {
        const s = String(cell.getValue() ?? "").toLowerCase();
        return (
          <Chip
            label={s.charAt(0).toUpperCase() + s.slice(1)}
            size="small"
            color={STATUS_COLOR[s] ?? "default"}
            variant={["rejected", "cancelled"].includes(s) ? "outlined" : "filled"}
          />
        );
      },
    },
    {
      id: "actions",
      header: "",
      size: 100,
      enableSorting: false,
      Cell: ({ row }) =>
        row.original.status?.toLowerCase() === "pending" ? (
          <Button size="small" color="error" onClick={() => handleCancel(row.original.id)}>
            Cancel
          </Button>
        ) : null,
    },
  ];

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
            <Box>
              <Typography variant="h4" component="h1">
                Leave
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                Apply for time off and track your requests to HR.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={() => setOpen(true)}
              disabled={!employeeId}
              sx={{ alignSelf: "flex-start", backgroundColor: primaryGradient }}
            >
              Apply for leave
            </Button>
          </Stack>
        </Paper>

        {profileError ? (
          <Alert severity="info">
            No employee profile is linked to your account, so leave cannot be
            applied. Contact your administrator.
          </Alert>
        ) : null}

        {/* Balance */}
        {balances.length > 0 ? (
          <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
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
                gridTemplateColumns: { xs: "repeat(2,1fr)", sm: "repeat(3,1fr)", md: "repeat(5,1fr)" },
              }}
            >
              {balances.map((bal) => (
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
                    {bal.leaveType.toLowerCase()}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ my: 0.5, color: bal.remainingDays <= 0 ? "error.main" : "success.main" }}
                  >
                    {bal.remainingDays}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    of {bal.totalBalance} left
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        ) : null}

        {/* KPIs */}
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0,1fr))" },
          }}
        >
          <SummaryCard caption="Total requests" title={String(records.length)} icon={<EventNoteRounded />} />
          <SummaryCard caption="Pending" title={String(pending)} icon={<BeachAccessRounded />} tone="warning" />
          <SummaryCard caption="Approved" title={String(approved)} icon={<BeachAccessRounded />} tone="success" />
        </Box>

        <MaterialReactTable
          columns={columns}
          data={records}
          getRowId={(r) => r.id}
          enableDensityToggle={false}
          enableFullScreenToggle={false}
          enableHiding={false}
          enableColumnFilters={false}
          enableSorting
          initialState={{
            pagination: { pageIndex: 0, pageSize: 10 },
            sorting: [{ id: "startDate", desc: true }],
          }}
          localization={{ noRecordsToDisplay: "No leave applications yet." }}
          muiTablePaperProps={{
            elevation: 0,
            sx: {
              border: "1px solid",
              borderColor: alpha("#0f172a", 0.08),
              borderRadius: 2,
              overflow: "hidden",
            },
          }}
          state={{ isLoading: leaveLoading && records.length === 0 }}
        />
      </Stack>

      <Dialog open={open} onClose={() => !applying && setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Apply for leave</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <FormControl size="small" fullWidth>
              <InputLabel>Leave type</InputLabel>
              <Select
                label="Leave type"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
              >
                {LEAVE_TYPES.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {selectedBalance ? (
              <Typography
                variant="caption"
                color={exceedsBalance ? "error" : "text.secondary"}
              >
                {selectedBalance.remainingDays} of {selectedBalance.totalBalance}{" "}
                {leaveType} day(s) remaining
                {requestedDays > 0 ? ` — requesting ${requestedDays}` : ""}
              </Typography>
            ) : null}
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "1fr 1fr" }}>
              <TextField
                label="Start date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="End date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>
            <TextField
              label="Reason (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              size="small"
              multiline
              rows={3}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={() => setOpen(false)} disabled={applying}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleApply}
            disabled={applying || !employeeId || exceedsBalance}
            startIcon={applying ? <CircularProgress size={14} color="inherit" /> : undefined}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
