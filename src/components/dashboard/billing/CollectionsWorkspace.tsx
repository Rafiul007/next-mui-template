"use client";

import { useMemo, useState } from "react";
import {
  AccountBalanceWalletRounded,
  CheckCircleRounded,
  ErrorOutlineRounded,
  PlaylistAddCheckRounded,
  ReceiptLongRounded,
  WarningAmberRounded,
} from "@mui/icons-material";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { toast } from "react-hot-toast";
import {
  GenerateMonthlyStudentInvoicesDocument,
  GetAllBatchesDocument,
  GetBatchFeeReportDocument,
  GetDefaultersDocument,
  GetStudentsDocument,
  type GetDefaultersQuery,
} from "@/graphql/generated";
import { getErrorMessage } from "@/lib/errors";
import { SummaryCard } from "@/components/ui";
import { primaryGradient } from "@/theme/theme";
import {
  BatchPicker,
  InvoiceStatusChip,
  MonthField,
  currentMonth,
  formatAmount,
  monthLabel,
  sharedTableProps,
} from "./billing-shared";
import { RecordPaymentDialog, type PaymentTarget } from "./RecordPaymentDialog";

type Defaulter = GetDefaultersQuery["getDefaulters"][number];

export function CollectionsWorkspace() {
  const [batchId, setBatchId] = useState("");
  const [month, setMonth] = useState(currentMonth());
  const [confirmGenerate, setConfirmGenerate] = useState(false);
  const [payTarget, setPayTarget] = useState<Defaulter | null>(null);

  const { data: batchesData, loading: batchesLoading } =
    useQuery(GetAllBatchesDocument);
  const { data: studentsData } = useQuery(GetStudentsDocument);

  const ready = Boolean(batchId && month);

  const {
    data: reportData,
    loading: reportLoading,
    refetch: refetchReport,
  } = useQuery(GetBatchFeeReportDocument, {
    variables: { batchId, month },
    skip: !ready,
    fetchPolicy: "cache-and-network",
  });

  const {
    data: defaultersData,
    loading: defaultersLoading,
    refetch: refetchDefaulters,
  } = useQuery(GetDefaultersDocument, {
    variables: { batchId, month },
    skip: !ready,
    fetchPolicy: "cache-and-network",
  });

  const [generateInvoices, { loading: generating }] = useMutation(
    GenerateMonthlyStudentInvoicesDocument,
  );

  const batches = batchesData?.getAllBatches ?? [];
  const students = studentsData?.getStudents ?? [];
  const report = reportData?.getBatchFeeReport;
  const defaulters = defaultersData?.getDefaulters ?? [];

  const studentLookup = useMemo(
    () =>
      new Map(
        students.map((s) => [
          s.id,
          {
            name: `${s.firstName} ${s.lastName ?? ""}`.trim() || s.studentCode,
            code: s.studentCode,
          },
        ]),
      ),
    [students],
  );

  const batchName =
    batches.find((b) => b.id === batchId)?.name ?? "this batch";

  const collectionRate =
    report && report.totalInvoiced > 0
      ? Math.round((report.totalPaid / report.totalInvoiced) * 100)
      : 0;

  const refetchAll = () => {
    refetchReport();
    refetchDefaulters();
  };

  const handleGenerate = async () => {
    try {
      const res = await generateInvoices({ variables: { batchId, month } });
      const count = res.data?.generateMonthlyStudentInvoices?.length ?? 0;
      toast.success(
        count > 0
          ? `Generated ${count} invoice${count !== 1 ? "s" : ""} for ${monthLabel(month)}.`
          : `No new invoices needed for ${monthLabel(month)}.`,
      );
      setConfirmGenerate(false);
      refetchAll();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to generate invoices."));
    }
  };

  const columns: MRT_ColumnDef<Defaulter>[] = [
    {
      id: "student",
      header: "Student",
      size: 220,
      accessorFn: (r) => studentLookup.get(r.studentId)?.name ?? r.studentId,
      Cell: ({ row }) => {
        const s = studentLookup.get(row.original.studentId);
        return (
          <Box>
            <Typography variant="body2" fontWeight={700} noWrap>
              {s?.name ?? "—"}
            </Typography>
            {s?.code ? (
              <Typography variant="caption" color="text.secondary">
                {s.code}
              </Typography>
            ) : null}
          </Box>
        );
      },
    },
    {
      accessorKey: "daysOverdue",
      header: "Overdue",
      size: 110,
      Cell: ({ cell }) => {
        const d = Number(cell.getValue());
        return (
          <Chip
            label={d > 0 ? `${d}d` : "Due"}
            size="small"
            color={d > 14 ? "error" : d > 0 ? "warning" : "default"}
            variant={d > 14 ? "filled" : "outlined"}
          />
        );
      },
    },
    {
      accessorKey: "total",
      header: "Total",
      size: 100,
      Cell: ({ cell }) => (
        <Typography variant="body2">{formatAmount(Number(cell.getValue()))}</Typography>
      ),
    },
    {
      accessorKey: "paidAmount",
      header: "Paid",
      size: 100,
      Cell: ({ cell }) => (
        <Typography
          variant="body2"
          color={Number(cell.getValue()) > 0 ? "success.main" : "text.disabled"}
        >
          {Number(cell.getValue()) > 0
            ? formatAmount(Number(cell.getValue()))
            : "—"}
        </Typography>
      ),
    },
    {
      accessorKey: "outstanding",
      header: "Outstanding",
      size: 120,
      Cell: ({ cell }) => (
        <Typography variant="body2" fontWeight={700} color="error.main">
          {formatAmount(Number(cell.getValue()))}
        </Typography>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 110,
      Cell: ({ cell }) => <InvoiceStatusChip status={String(cell.getValue())} />,
    },
    {
      id: "actions",
      header: "",
      size: 150,
      enableSorting: false,
      Cell: ({ row }) => (
        <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
          <Button
            size="small"
            variant="contained"
            startIcon={<ReceiptLongRounded fontSize="small" />}
            onClick={() => setPayTarget(row.original)}
          >
            Collect
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <>
      <Stack spacing={3}>
        {/* Header */}
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
          <Typography variant="h4" component="h1">
            Collections
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, maxWidth: 680 }}>
            Run monthly billing for a batch, track collection progress, and chase
            outstanding dues.
          </Typography>
        </Paper>

        {/* Controls */}
        <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ md: "center" }}
          >
            <Box sx={{ flex: 1, maxWidth: 420 }}>
              <BatchPicker
                batches={batches}
                value={batchId}
                onChange={setBatchId}
                loading={batchesLoading}
              />
            </Box>
            <MonthField value={month} onChange={setMonth} sx={{ minWidth: 180 }} />
            <Box sx={{ flex: 1 }} />
            <Button
              variant="contained"
              startIcon={<PlaylistAddCheckRounded />}
              disabled={!ready}
              onClick={() => setConfirmGenerate(true)}
              sx={{ backgroundImage: primaryGradient }}
            >
              Generate invoices
            </Button>
          </Stack>
        </Paper>

        {!ready ? (
          <Box
            sx={{
              py: 8,
              textAlign: "center",
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 2,
              bgcolor: alpha("#f8fafc", 0.6),
            }}
          >
            <AccountBalanceWalletRounded
              sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }}
            />
            <Typography variant="h6" color="text.secondary">
              Select a batch and month
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
              Collection KPIs and the defaulters list will load here.
            </Typography>
          </Box>
        ) : (
          <>
            {/* KPI cards */}
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0,1fr))",
                  lg: "repeat(4, minmax(0,1fr))",
                },
              }}
            >
              <SummaryCard
                caption="Total invoiced"
                title={formatAmount(report?.totalInvoiced ?? 0)}
                icon={<ReceiptLongRounded />}
              />
              <SummaryCard
                caption="Collected"
                title={formatAmount(report?.totalPaid ?? 0)}
                icon={<CheckCircleRounded />}
                tone="success"
              />
              <SummaryCard
                caption="Pending"
                title={formatAmount(report?.totalPending ?? 0)}
                icon={<AccountBalanceWalletRounded />}
                tone={report && report.totalPending > 0 ? "warning" : "default"}
              />
              <SummaryCard
                caption="Overdue"
                title={formatAmount(report?.totalOverdue ?? 0)}
                icon={<WarningAmberRounded />}
                tone={report && report.totalOverdue > 0 ? "error" : "default"}
              />
            </Box>

            {/* Collection progress */}
            <Paper
              elevation={0}
              sx={{ p: 3, border: "1px solid", borderColor: "divider" }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <Typography variant="subtitle2" fontWeight={700}>
                  Collection progress · {monthLabel(month)}
                </Typography>
                <Typography variant="subtitle2" fontWeight={700} color="success.main">
                  {collectionRate}%
                </Typography>
              </Stack>
              <LinearProgress
                variant={reportLoading && !report ? "indeterminate" : "determinate"}
                value={collectionRate}
                color="success"
                sx={{ height: 10, borderRadius: 5 }}
              />
              {report ? (
                <Stack
                  direction="row"
                  spacing={3}
                  sx={{ mt: 2 }}
                  flexWrap="wrap"
                  useFlexGap
                >
                  <CountPill label="Students" value={report.totalStudents} />
                  <CountPill label="Fully paid" value={report.fullyPaidCount} tone="success" />
                  <CountPill label="Partial" value={report.partiallyPaidCount} tone="warning" />
                  <CountPill label="Unpaid" value={report.unpaidCount} />
                  <CountPill label="Overdue" value={report.overdueCount} tone="error" />
                </Stack>
              ) : null}
            </Paper>

            {/* Defaulters */}
            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <ErrorOutlineRounded sx={{ color: "error.main", fontSize: 20 }} />
                <Typography variant="h6" fontWeight={700}>
                  Defaulters
                </Typography>
                {defaulters.length > 0 && (
                  <Chip
                    label={defaulters.length}
                    size="small"
                    color="error"
                    variant="outlined"
                  />
                )}
              </Stack>

              <MaterialReactTable
                {...sharedTableProps}
                columns={columns}
                data={defaulters}
                getRowId={(r) => r.invoiceId}
                enableSorting
                state={{ isLoading: defaultersLoading && defaulters.length === 0 }}
                initialState={{
                  ...sharedTableProps.initialState,
                  sorting: [{ id: "daysOverdue", desc: true }],
                }}
                renderEmptyRowsFallback={() => (
                  <Box sx={{ px: 3, py: 6, textAlign: "center" }}>
                    <CheckCircleRounded
                      sx={{ fontSize: 40, color: "success.light", mb: 1 }}
                    />
                    <Typography variant="subtitle1" fontWeight={700}>
                      No defaulters
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Every invoice for {monthLabel(month)} is settled or not yet
                      generated.
                    </Typography>
                  </Box>
                )}
              />
            </Stack>
          </>
        )}
      </Stack>

      {/* Generate confirm */}
      <Dialog open={confirmGenerate} onClose={() => !generating && setConfirmGenerate(false)}>
        <DialogTitle>Generate monthly invoices?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This creates {monthLabel(month)} invoices for enrolled students in{" "}
            <strong>{batchName}</strong> using the active fee plans. Students who
            already have an invoice for this month are skipped.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={() => setConfirmGenerate(false)} disabled={generating}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={generating}
            startIcon={generating ? <CircularProgress size={14} color="inherit" /> : undefined}
          >
            {generating ? "Generating…" : "Generate"}
          </Button>
        </DialogActions>
      </Dialog>

      {payTarget && (
        <RecordPaymentDialog
          target={
            {
              invoiceId: payTarget.invoiceId,
              studentId: payTarget.studentId,
              total: payTarget.total,
              paidAmount: payTarget.paidAmount,
              month: payTarget.month,
            } satisfies PaymentTarget
          }
          studentName={studentLookup.get(payTarget.studentId)?.name ?? ""}
          batchName={batchName}
          onClose={() => setPayTarget(null)}
          onSuccess={() => {
            setPayTarget(null);
            refetchAll();
          }}
        />
      )}
    </>
  );
}

function CountPill({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "success" | "warning" | "error";
}) {
  const color =
    tone === "success"
      ? "#047857"
      : tone === "warning"
        ? "#b45309"
        : tone === "error"
          ? "#b91c1c"
          : "#475569";
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography variant="h6" fontWeight={800} sx={{ color }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", sm: "block" } }} />
    </Stack>
  );
}
