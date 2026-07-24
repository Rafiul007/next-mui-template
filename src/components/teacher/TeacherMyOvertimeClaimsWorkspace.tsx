"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { AddRounded, ScheduleRounded } from "@mui/icons-material";
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
  Paper,
  Stack,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { toast } from "react-hot-toast";
import {
  GetMyOvertimeClaimsDocument,
  SubmitOvertimeClaimDocument,
  type GetMyOvertimeClaimsQuery,
} from "@/graphql/generated";
import { GetMyEmployeeProfileDocument } from "@/graphql/hr-extended";
import { SummaryCard } from "@/components/ui";
import { getErrorMessage } from "@/lib/errors";
import { primaryGradient } from "@/theme/theme";

type ClaimRecord = GetMyOvertimeClaimsQuery["getMyOvertimeClaims"][number];

const STATUS_COLOR: Record<string, "default" | "success" | "error" | "warning"> = {
  pending: "warning",
  approved: "success",
  rejected: "error",
  paid: "success",
};

export function TeacherMyOvertimeClaimsWorkspace() {
  const { data: profileData, error: profileError } = useQuery(
    GetMyEmployeeProfileDocument,
    { fetchPolicy: "cache-and-network", errorPolicy: "all" },
  );
  const employeeId = profileData?.getMyEmployeeProfile?.id ?? "";

  const {
    data: claimsData,
    loading: claimsLoading,
    refetch: refetchClaims,
  } = useQuery(GetMyOvertimeClaimsDocument, { fetchPolicy: "cache-and-network" });

  const [submitOvertimeClaim, { loading: submitting }] = useMutation(
    SubmitOvertimeClaimDocument,
  );

  const [open, setOpen] = useState(false);
  const [claimDate, setClaimDate] = useState("");
  const [hours, setHours] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const claims = claimsData?.getMyOvertimeClaims ?? [];
  const pending = claims.filter((c) => c.status === "PENDING").length;
  const approvedAmount = claims
    .filter((c) => c.status === "APPROVED" || c.status === "PAID")
    .reduce((sum, c) => sum + (c.amount ?? 0), 0);

  const resetForm = () => {
    setClaimDate("");
    setHours("");
    setReason("");
    setError(null);
  };

  const handleSubmit = async () => {
    if (!claimDate) {
      setError("Select the date of the extra class/overtime.");
      return;
    }
    const hoursNum = Number(hours);
    if (!hours || Number.isNaN(hoursNum) || hoursNum <= 0) {
      setError("Enter a valid number of hours.");
      return;
    }
    if (!reason.trim()) {
      setError("Provide a reason for this claim.");
      return;
    }
    setError(null);
    try {
      await submitOvertimeClaim({
        variables: {
          input: {
            employeeId,
            claimDate,
            hours: hoursNum,
            reason: reason.trim(),
          },
        },
      });
      toast.success("Overtime claim submitted for HR approval.");
      await refetchClaims();
      setOpen(false);
      resetForm();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to submit claim."));
    }
  };

  const columns: MRT_ColumnDef<ClaimRecord>[] = [
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
      size: 110,
      Cell: ({ cell }) => {
        const s = String(cell.getValue() ?? "").toLowerCase();
        return (
          <Chip
            label={s.charAt(0).toUpperCase() + s.slice(1)}
            size="small"
            color={STATUS_COLOR[s] ?? "default"}
          />
        );
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      size: 110,
      Cell: ({ cell }) => {
        const v = cell.getValue<number | null>();
        return <Typography variant="body2">{v != null ? `৳${v.toLocaleString()}` : "—"}</Typography>;
      },
    },
    {
      accessorKey: "rejectionReason",
      header: "Rejection reason",
      size: 200,
      Cell: ({ cell }) => (
        <Typography variant="body2" color="text.secondary" noWrap>
          {String(cell.getValue() ?? "—")}
        </Typography>
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
          <Stack
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            spacing={3}
          >
            <Box>
              <Typography variant="h4" component="h1">
                My Overtime &amp; Extra Class Claims
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                Claim payout for extra classes or overtime hours. HR reviews and
                approves each claim; approved claims are paid out on the next payroll run.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={() => setOpen(true)}
              disabled={!employeeId}
              sx={{ alignSelf: "flex-start", backgroundColor: primaryGradient }}
            >
              Submit claim
            </Button>
          </Stack>
        </Paper>

        {profileError ? (
          <Alert severity="info">
            No employee profile is linked to your account, so overtime cannot
            be claimed. Contact your administrator.
          </Alert>
        ) : null}

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0,1fr))" },
          }}
        >
          <SummaryCard caption="Pending review" title={String(pending)} icon={<ScheduleRounded />} tone="warning" />
          <SummaryCard
            caption="Approved / paid total"
            title={`৳${approvedAmount.toLocaleString()}`}
            icon={<ScheduleRounded />}
            tone="success"
          />
        </Box>

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
            sorting: [{ id: "claimDate", desc: true }],
          }}
          localization={{ noRecordsToDisplay: "No overtime claims yet." }}
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

      <Dialog open={open} onClose={() => !submitting && setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Submit overtime / extra class claim</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <TextField
              label="Date"
              type="date"
              value={claimDate}
              onChange={(e) => setClaimDate(e.target.value)}
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              label="Hours"
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              size="small"
              slotProps={{ htmlInput: { min: 0, step: 0.5 } }}
              fullWidth
            />
            <TextField
              label="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              size="small"
              multiline
              rows={3}
              fullWidth
              placeholder="e.g. Covered an extra evening batch for Physics"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || !employeeId}
            startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : undefined}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
