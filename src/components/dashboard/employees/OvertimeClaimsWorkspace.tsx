"use client";

import { useState } from "react";
import dayjs from "dayjs";
import {
  CancelRounded,
  CheckCircleRounded,
  HourglassTopRounded,
  PaidRounded,
} from "@mui/icons-material";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Alert,
  Box,
  Button,
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
import { SummaryCard } from "@/components/ui";
import {
  ApproveOvertimeClaimDocument,
  GetEmployeesDocument,
  GetPendingOvertimeClaimsDocument,
  GetUsersDocument,
  RejectOvertimeClaimDocument,
  type GetPendingOvertimeClaimsQuery,
  type GetUsersQuery,
} from "@/graphql/generated";
import { getErrorMessage } from "@/lib/errors";

type ClaimRecord = GetPendingOvertimeClaimsQuery["getPendingOvertimeClaims"][number];
type UserRecord = NonNullable<GetUsersQuery["getUsers"][number]>;

const formatPersonName = (user: UserRecord) =>
  `${user.firstName} ${user.lastName ?? ""}`.trim() || user.email;

export function OvertimeClaimsWorkspace() {
  const [claimToReject, setClaimToReject] = useState<ClaimRecord | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: usersData } = useQuery(GetUsersDocument, {
    variables: { page: 1, limit: 500 },
  });
  const { data: employeesData } = useQuery(GetEmployeesDocument);
  const {
    data: claimsData,
    loading: claimsLoading,
    error: claimsError,
    refetch: refetchClaims,
  } = useQuery(GetPendingOvertimeClaimsDocument, { fetchPolicy: "cache-and-network" });

  const [approveOvertimeClaim, approveState] = useMutation(ApproveOvertimeClaimDocument);
  const [rejectOvertimeClaim, rejectState] = useMutation(RejectOvertimeClaimDocument);

  const users = (usersData?.getUsers ?? []).filter((u): u is UserRecord => !!u);
  const employees = employeesData?.getEmployees ?? [];
  const userLookup = new Map(users.map((u) => [u.id, formatPersonName(u)]));
  const employeeLookup = new Map(employees.map((e) => [e.id, e]));

  const claims = claimsData?.getPendingOvertimeClaims ?? [];
  const totalHours = claims.reduce((sum, c) => sum + c.hours, 0);

  const handleApprove = async (claimId: string) => {
    try {
      const result = await approveOvertimeClaim({ variables: { claimId } });
      if (result.error) throw result.error;
      await refetchClaims();
      toast.success("Overtime claim approved.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to approve claim."));
    }
  };

  const handleRejectConfirm = async () => {
    if (!claimToReject) return;
    try {
      const result = await rejectOvertimeClaim({
        variables: {
          claimId: claimToReject.id,
          reason: rejectReason.trim() || "Rejected by HR",
        },
      });
      if (result.error) throw result.error;
      await refetchClaims();
      toast.success("Overtime claim rejected.");
      setClaimToReject(null);
      setRejectReason("");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to reject claim."));
    }
  };

  const columns: MRT_ColumnDef<ClaimRecord>[] = [
    {
      id: "employee",
      accessorFn: (row) => {
        const emp = employeeLookup.get(row.employeeId);
        return emp?.userId ? (userLookup.get(emp.userId) ?? "—") : "—";
      },
      header: "Teacher",
      size: 200,
      Cell: ({ cell }) => (
        <Typography variant="body2" fontWeight={600}>
          {String(cell.getValue())}
        </Typography>
      ),
    },
    {
      accessorKey: "claimDate",
      header: "Date",
      size: 120,
      Cell: ({ cell }) => (
        <Typography variant="body2">
          {dayjs(String(cell.getValue())).format("DD MMM YYYY")}
        </Typography>
      ),
    },
    {
      accessorKey: "hours",
      header: "Hours",
      size: 90,
      Cell: ({ cell }) => <Typography variant="body2">{String(cell.getValue())}</Typography>,
    },
    {
      accessorKey: "reason",
      header: "Reason",
      size: 260,
      Cell: ({ cell }) => (
        <Typography variant="body2" color="text.secondary" noWrap>
          {String(cell.getValue() ?? "—")}
        </Typography>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      size: 120,
      enableColumnFilter: false,
      enableSorting: false,
      Cell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Approve">
            <IconButton
              size="small"
              color="success"
              disabled={approveState.loading || rejectState.loading}
              onClick={() => handleApprove(row.original.id)}
              sx={{ bgcolor: alpha("#2563eb", 0.08) }}
            >
              <CheckCircleRounded fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reject">
            <IconButton
              size="small"
              color="error"
              disabled={approveState.loading || rejectState.loading}
              onClick={() => {
                setClaimToReject(row.original);
                setRejectReason("");
              }}
              sx={{ bgcolor: alpha("#ef4444", 0.08) }}
            >
              <CancelRounded fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
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
          <Typography variant="h4" component="h1" sx={{ mt: 0.5 }}>
            Overtime &amp; extra class claims
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, maxWidth: 760 }}>
            Review teacher-submitted overtime/extra-class claims. Approving computes the payout
            from the teacher&apos;s designation salary policy overtime rate (or the tenant
            default); the amount is folded into their next payroll run automatically.
          </Typography>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0,1fr))" },
          }}
        >
          <SummaryCard
            caption="Pending claims"
            title={claimsLoading ? "…" : String(claims.length)}
            icon={<HourglassTopRounded />}
            tone="warning"
          />
          <SummaryCard
            caption="Total pending hours"
            title={claimsLoading ? "…" : String(totalHours)}
            icon={<PaidRounded />}
          />
        </Box>

        {claimsError ? (
          <Alert severity="error">{claimsError.message || "Unable to load overtime claims."}</Alert>
        ) : null}

        <MaterialReactTable
          columns={columns}
          data={claims}
          getRowId={(r) => r.id}
          enableDensityToggle={false}
          enableFullScreenToggle={false}
          enableHiding={false}
          enableColumnFilters={false}
          enableSorting
          initialState={{
            pagination: { pageIndex: 0, pageSize: 10 },
            sorting: [{ id: "claimDate", desc: false }],
          }}
          localization={{ noRecordsToDisplay: "No pending overtime claims." }}
          muiTablePaperProps={{
            elevation: 0,
            sx: {
              border: "1px solid",
              borderColor: alpha("#0f172a", 0.08),
              borderRadius: 2,
              overflow: "hidden",
            },
          }}
          state={{ isLoading: claimsLoading && claims.length === 0 }}
        />
      </Stack>

      <Dialog
        open={!!claimToReject}
        onClose={() => !rejectState.loading && setClaimToReject(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Reject overtime claim</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Provide a reason for rejecting this claim.
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
            onClick={() => setClaimToReject(null)}
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
