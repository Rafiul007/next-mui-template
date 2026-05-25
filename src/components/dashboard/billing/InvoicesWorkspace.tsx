"use client";

import { useCallback, useState } from "react";
import dayjs from "dayjs";
import {
  AccountBalanceWalletRounded,
  CheckCircleRounded,
  CloseRounded,
  ErrorOutlineRounded,
  HowToRegRounded,
  ReceiptLongRounded,
  RepeatRounded,
  WarningAmberRounded,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import { useMutation, useQuery } from "@apollo/client/react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { toast } from "react-hot-toast";
import {
  GetAllBatchesDocument,
  GetStudentsDocument,
} from "@/graphql/generated";
import {
  GetAllStudentInvoicesDocument,
  RecordStudentPaymentNewDocument,
  type StudentInvoiceNew,
  type InvoiceType,
} from "@/graphql/billing-new";
import { getErrorMessage } from "@/lib/errors";
import { SummaryCard } from "@/components/ui";

// ── Constants ─────────────────────────────────────────────────────────────────

const PAYMENT_METHODS = [
  { label: "Cash", value: "CASH" },
  { label: "bKash", value: "BKASH" },
  { label: "Nagad", value: "NAGAD" },
  { label: "Rocket", value: "ROCKET" },
  { label: "Card", value: "CARD" },
  { label: "Bank transfer", value: "BANK_TRANSFER" },
  { label: "Other", value: "OTHER" },
];

const OUTSTANDING_STATUSES = new Set(["ISSUED", "UNPAID", "PARTIAL", "OVERDUE"]);
const PAID_STATUSES = new Set(["PAID", "WAIVED"]);

const STATUS_COLOR: Record<string, "default" | "warning" | "success" | "error" | "info"> = {
  ISSUED: "default",
  UNPAID: "default",
  PARTIAL: "warning",
  OVERDUE: "error",
  PAID: "success",
  WAIVED: "info",
};

// Normalises legacy ISSUED → shows as UNPAID in UI
const STATUS_LABEL: Record<string, string> = {
  ISSUED: "Unpaid",
  UNPAID: "Unpaid",
  PARTIAL: "Partial",
  OVERDUE: "Overdue",
  PAID: "Paid",
  WAIVED: "Waived",
};

const INVOICE_TYPE_LABEL: Record<InvoiceType, string> = {
  ADMISSION: "Admission",
  MONTHLY_FEE: "Monthly Fee",
  FINE: "Fine",
  MISC: "Misc",
};

const INVOICE_TYPE_COLOR: Record<InvoiceType, "primary" | "secondary" | "error" | "default"> = {
  ADMISSION: "primary",
  MONTHLY_FEE: "secondary",
  FINE: "error",
  MISC: "default",
};

const formatAmount = (n: number) =>
  `৳${n.toLocaleString("en-BD", { minimumFractionDigits: 0 })}`;

type InvoiceTypeFilter = "ALL" | InvoiceType;

// ── RecordPaymentDialog ───────────────────────────────────────────────────────

function RecordPaymentDialog({
  invoice,
  batchName,
  onClose,
  onSuccess,
}: {
  invoice: StudentInvoiceNew | null;
  batchName: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");
  const [ref, setRef] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [recordPayment, { loading }] = useMutation(RecordStudentPaymentNewDocument);

  const handleOpen = useCallback(() => {
    if (!invoice) return;
    setAmount(String(Math.max(0, invoice.total - invoice.paidAmount)));
    setMethod("CASH");
    setRef("");
    setRemarks("");
    setError(null);
  }, [invoice]);

  // reset when invoice changes
  useState(() => { handleOpen(); });

  if (!invoice) return null;

  const remaining = invoice.total - invoice.paidAmount;
  const studentName = `${invoice.student.firstName} ${invoice.student.lastName ?? ""}`.trim();

  const handleConfirm = async () => {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) { setError("Enter a valid amount."); return; }
    setError(null);
    try {
      await recordPayment({
        variables: {
          payment: {
            invoiceId: invoice.id,
            studentId: invoice.studentId,
            amount: parsed,
            method,
            transactionRef: ref.trim() || `CASH-${Date.now()}`,
            remarks: remarks.trim() || undefined,
          },
        },
      });
      toast.success("Payment recorded.");
      onSuccess();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to record payment."));
    }
  };

  return (
    <Dialog open onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack spacing={0.25}>
            <Typography variant="h6" fontWeight={700}>Record Payment</Typography>
            <Typography variant="body2" color="text.secondary">
              {studentName} &nbsp;·&nbsp; {batchName} &nbsp;·&nbsp;
              {dayjs(invoice.month, "YYYY-MM").format("MMM YYYY")}
            </Typography>
          </Stack>
          <IconButton size="small" onClick={onClose} disabled={loading}>
            <CloseRounded fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          {/* Invoice summary */}
          <Box sx={{ p: 1.5, borderRadius: 1.5, border: "1px solid", borderColor: "divider", bgcolor: alpha("#f8fafc", 0.8) }}>
            <Stack spacing={0.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">Invoice total</Typography>
                <Typography variant="caption" fontWeight={700}>{formatAmount(invoice.total)}</Typography>
              </Stack>
              {invoice.discountAmount > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="success.main">Discount</Typography>
                  <Typography variant="caption" color="success.main">−{formatAmount(invoice.discountAmount)}</Typography>
                </Stack>
              )}
              {invoice.fineAmount > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="error.main">Late fine</Typography>
                  <Typography variant="caption" color="error.main">+{formatAmount(invoice.fineAmount)}</Typography>
                </Stack>
              )}
              {invoice.paidAmount > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="success.main">Already paid</Typography>
                  <Typography variant="caption" color="success.main">{formatAmount(invoice.paidAmount)}</Typography>
                </Stack>
              )}
              <Divider sx={{ my: 0.5 }} />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" fontWeight={700} color="error.main">Remaining</Typography>
                <Typography variant="caption" fontWeight={700} color="error.main">{formatAmount(remaining)}</Typography>
              </Stack>
            </Stack>
          </Box>

          {error && <Alert severity="error" sx={{ py: 0.25, fontSize: 13 }}>{error}</Alert>}

          <Stack direction="row" spacing={1.5}>
            <TextField
              label="Amount (৳)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              size="small"
              type="number"
              inputProps={{ min: 0, step: 1 }}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              size="small"
              select
              sx={{ flex: 1 }}
            >
              {PAYMENT_METHODS.map((m) => (
                <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
              ))}
            </TextField>
          </Stack>

          <TextField
            label="Transaction ref / receipt no."
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            size="small"
            placeholder="Optional for cash"
            fullWidth
          />
          <TextField
            label="Remarks (optional)"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            size="small"
            fullWidth
          />

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button size="small" color="inherit" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleConfirm}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={13} color="inherit" /> : undefined}
            >
              {loading ? "Saving…" : "Confirm Payment"}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

// ── Shared table style ────────────────────────────────────────────────────────

const sharedTableProps = {
  enableDensityToggle: false,
  enableFullScreenToggle: false,
  enableHiding: false,
  enableStickyHeader: true,
  enableGlobalFilter: true,
  positionGlobalFilter: "left" as const,
  muiSearchTextFieldProps: {
    placeholder: "Search student, batch, month…",
    size: "small" as const,
    sx: { minWidth: { xs: "100%", md: 300 } },
  },
  muiTablePaperProps: {
    elevation: 0,
    sx: { border: "1px solid", borderColor: alpha("#0f172a", 0.08), borderRadius: 2, overflow: "hidden" },
  },
  muiTopToolbarProps: {
    sx: { px: 2.5, py: 1.5, borderBottom: "1px solid", borderColor: alpha("#0f172a", 0.08) },
  },
  muiBottomToolbarProps: {
    sx: { borderTop: "1px solid", borderColor: alpha("#0f172a", 0.08) },
  },
  muiTableHeadCellProps: {
    sx: { fontSize: 13, fontWeight: 700, py: 1.75, borderBottom: "1px solid", borderColor: alpha("#0f172a", 0.08) },
  },
  muiTableBodyCellProps: {
    sx: { borderBottom: "1px solid", borderColor: alpha("#0f172a", 0.06), py: 1.75 },
  },
  muiTableContainerProps: { sx: { maxHeight: 520 } },
  initialState: { pagination: { pageIndex: 0, pageSize: 20 }, showGlobalFilter: true },
};

// ── Column definitions ────────────────────────────────────────────────────────

function studentCell(row: StudentInvoiceNew) {
  const name = `${row.student.firstName} ${row.student.lastName ?? ""}`.trim();
  return (
    <Stack spacing={0.25}>
      <Typography variant="subtitle2" fontWeight={700}>{name}</Typography>
      <Typography variant="caption" color="text.secondary">{row.student.studentCode}</Typography>
    </Stack>
  );
}

function typeCell(inv: StudentInvoiceNew) {
  const t = inv.invoiceType as InvoiceType | undefined;
  if (!t) return <Typography variant="body2" color="text.secondary">—</Typography>;
  return (
    <Chip
      label={INVOICE_TYPE_LABEL[t] ?? t}
      size="small"
      color={INVOICE_TYPE_COLOR[t] ?? "default"}
      icon={t === "ADMISSION" ? <HowToRegRounded sx={{ fontSize: "14px !important" }} /> : <RepeatRounded sx={{ fontSize: "14px !important" }} />}
      variant="outlined"
    />
  );
}

function statusCell(status: string) {
  return (
    <Chip
      label={STATUS_LABEL[status] ?? status}
      size="small"
      color={STATUS_COLOR[status] ?? "default"}
      variant={status === "OVERDUE" ? "filled" : "outlined"}
    />
  );
}

function outstandingColumns(
  batchLookup: Map<string, string>,
  onPay: (inv: StudentInvoiceNew) => void,
): MRT_ColumnDef<StudentInvoiceNew>[] {
  return [
    {
      id: "student",
      accessorFn: (r) => `${r.student.firstName} ${r.student.lastName ?? ""} ${r.student.studentCode ?? ""}`,
      header: "Student",
      size: 200,
      Cell: ({ row }) => studentCell(row.original),
    },
    {
      accessorKey: "student.classLevel",
      header: "Class",
      size: 90,
      Cell: ({ row }) => <Typography variant="body2">{row.original.student.classLevel ?? "—"}</Typography>,
    },
    {
      id: "batch",
      accessorFn: (r) => batchLookup.get(r.batchId) ?? r.batchId,
      header: "Batch",
      size: 160,
      Cell: ({ row }) => <Typography variant="body2" noWrap>{batchLookup.get(row.original.batchId) ?? "—"}</Typography>,
    },
    {
      accessorKey: "invoiceType",
      header: "Type",
      size: 130,
      filterVariant: "select",
      filterSelectOptions: ["ADMISSION", "MONTHLY_FEE", "FINE", "MISC"],
      Cell: ({ row }) => typeCell(row.original),
    },
    {
      accessorKey: "month",
      header: "Month",
      size: 110,
      Cell: ({ cell }) => <Typography variant="body2">{dayjs(String(cell.getValue()), "YYYY-MM").format("MMM YYYY")}</Typography>,
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      size: 110,
      Cell: ({ cell }) => {
        const isPast = dayjs(String(cell.getValue())).isBefore(dayjs(), "day");
        return (
          <Typography variant="body2" color={isPast ? "error.main" : "text.primary"} fontWeight={isPast ? 600 : 400}>
            {dayjs(String(cell.getValue())).format("DD MMM YY")}
          </Typography>
        );
      },
    },
    {
      accessorKey: "total",
      header: "Total",
      size: 95,
      Cell: ({ cell }) => <Typography variant="body2" fontWeight={600}>{formatAmount(Number(cell.getValue()))}</Typography>,
    },
    {
      accessorKey: "paidAmount",
      header: "Paid",
      size: 95,
      Cell: ({ cell }) => (
        <Typography variant="body2" color={Number(cell.getValue()) > 0 ? "success.main" : "text.disabled"}>
          {Number(cell.getValue()) > 0 ? formatAmount(Number(cell.getValue())) : "—"}
        </Typography>
      ),
    },
    {
      id: "remaining",
      accessorFn: (r) => r.total - r.paidAmount,
      header: "Remaining",
      size: 105,
      Cell: ({ cell }) => (
        <Typography variant="body2" fontWeight={700} color="error.main">{formatAmount(Number(cell.getValue()))}</Typography>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 105,
      filterVariant: "select",
      filterSelectOptions: [
        { label: "Unpaid", value: "UNPAID" },
        { label: "Unpaid (legacy)", value: "ISSUED" },
        { label: "Partial", value: "PARTIAL" },
        { label: "Overdue", value: "OVERDUE" },
      ],
      Cell: ({ cell }) => statusCell(String(cell.getValue())),
    },
    {
      id: "actions",
      header: "",
      size: 160,
      enableSorting: false,
      enableColumnFilter: false,
      Cell: ({ row }) => (
        <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
          <Button
            size="small"
            variant="contained"
            startIcon={<ReceiptLongRounded fontSize="small" />}
            onClick={() => onPay(row.original)}
          >
            Record Payment
          </Button>
        </Box>
      ),
    },
  ];
}

function paidColumns(batchLookup: Map<string, string>): MRT_ColumnDef<StudentInvoiceNew>[] {
  return [
    {
      id: "student",
      accessorFn: (r) => `${r.student.firstName} ${r.student.lastName ?? ""} ${r.student.studentCode ?? ""}`,
      header: "Student",
      size: 200,
      Cell: ({ row }) => studentCell(row.original),
    },
    {
      accessorKey: "student.classLevel",
      header: "Class",
      size: 90,
      Cell: ({ row }) => <Typography variant="body2">{row.original.student.classLevel ?? "—"}</Typography>,
    },
    {
      id: "batch",
      accessorFn: (r) => batchLookup.get(r.batchId) ?? r.batchId,
      header: "Batch",
      size: 160,
      Cell: ({ row }) => <Typography variant="body2" noWrap>{batchLookup.get(row.original.batchId) ?? "—"}</Typography>,
    },
    {
      accessorKey: "invoiceType",
      header: "Type",
      size: 130,
      filterVariant: "select",
      filterSelectOptions: ["ADMISSION", "MONTHLY_FEE", "FINE", "MISC"],
      Cell: ({ row }) => typeCell(row.original),
    },
    {
      accessorKey: "month",
      header: "Month",
      size: 110,
      Cell: ({ cell }) => <Typography variant="body2">{dayjs(String(cell.getValue()), "YYYY-MM").format("MMM YYYY")}</Typography>,
    },
    {
      accessorKey: "total",
      header: "Total",
      size: 100,
      Cell: ({ cell }) => <Typography variant="body2" fontWeight={600}>{formatAmount(Number(cell.getValue()))}</Typography>,
    },
    {
      accessorKey: "paidAmount",
      header: "Amount Paid",
      size: 120,
      Cell: ({ cell }) => (
        <Typography variant="body2" color="success.main" fontWeight={600}>{formatAmount(Number(cell.getValue()))}</Typography>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 100,
      filterVariant: "select",
      filterSelectOptions: ["PAID", "WAIVED"],
      Cell: ({ cell }) => statusCell(String(cell.getValue())),
    },
  ];
}

// ── InvoicesWorkspace ─────────────────────────────────────────────────────────

export function InvoicesWorkspace() {
  const [typeFilter, setTypeFilter] = useState<InvoiceTypeFilter>("ALL");
  const [payTarget, setPayTarget] = useState<StudentInvoiceNew | null>(null);

  const { data: invoicesData, loading: invoicesLoading, refetch } = useQuery(
    GetAllStudentInvoicesDocument,
    { fetchPolicy: "cache-and-network" },
  );
  const { data: batchesData } = useQuery(GetAllBatchesDocument);
  // Students query kept for summary cards
  const { data: studentsData } = useQuery(GetStudentsDocument, { fetchPolicy: "cache-and-network" });

  const batchLookup = new Map(
    (batchesData?.getAllBatches ?? []).map((b) => [b.id, b.name]),
  );

  const allInvoices = invoicesData?.getAllStudentInvoices ?? [];

  const filtered = typeFilter === "ALL"
    ? allInvoices
    : allInvoices.filter((inv) => inv.invoiceType === typeFilter);

  const outstanding = filtered.filter((r) => OUTSTANDING_STATUSES.has(r.status));
  const paid = filtered.filter((r) => PAID_STATUSES.has(r.status));

  const totalOutstanding = outstanding.reduce((s, r) => s + (r.total - r.paidAmount), 0);
  const totalCollected = allInvoices.reduce((s, r) => s + r.paidAmount, 0);
  const overdueCount = allInvoices.filter((r) => r.status === "OVERDUE").length;

  const payTargetBatch = payTarget ? (batchLookup.get(payTarget.batchId) ?? "—") : "";

  const isLoading = invoicesLoading && allInvoices.length === 0;

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
            background: "linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(240,253,250,0.98) 100%)",
          }}
        >
          <Typography variant="h4" component="h1">Invoices</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, maxWidth: 680 }}>
            Track and manage all student invoices — admission fees and monthly charges. Record
            payments and monitor collection status across all batches.
          </Typography>
        </Paper>

        {/* Summary cards */}
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" } }}>
          <SummaryCard
            caption="Total outstanding"
            title={formatAmount(totalOutstanding)}
            icon={<AccountBalanceWalletRounded />}
            tone="error"
          />
          <SummaryCard
            caption="Total collected"
            title={formatAmount(totalCollected)}
            icon={<CheckCircleRounded />}
            tone="success"
          />
          <SummaryCard
            caption="Overdue invoices"
            title={String(overdueCount)}
            icon={<WarningAmberRounded />}
            tone={overdueCount > 0 ? "warning" : "default"}
          />
        </Box>

        {/* Invoice type filter tabs */}
        <Box sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
          <Tabs
            value={typeFilter}
            onChange={(_, v) => setTypeFilter(v as InvoiceTypeFilter)}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab value="ALL" label="All invoices" />
            <Tab
              value="ADMISSION"
              label="Admission fees"
              icon={<HowToRegRounded sx={{ fontSize: 16 }} />}
              iconPosition="start"
            />
            <Tab
              value="MONTHLY_FEE"
              label="Monthly fees"
              icon={<RepeatRounded sx={{ fontSize: 16 }} />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Outstanding invoices */}
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <ErrorOutlineRounded sx={{ color: "error.main", fontSize: 20 }} />
            <Typography variant="h6" fontWeight={700}>Outstanding Invoices</Typography>
            {outstanding.length > 0 && (
              <Chip label={outstanding.length} size="small" color="error" variant="outlined" />
            )}
          </Stack>

          <MaterialReactTable
            {...sharedTableProps}
            columns={outstandingColumns(batchLookup, setPayTarget)}
            data={outstanding}
            enableColumnFilters
            enableSorting
            getRowId={(row) => row.id}
            state={{ isLoading }}
            initialState={{
              ...sharedTableProps.initialState,
              showGlobalFilter: true,
              sorting: [{ id: "dueDate", desc: false }],
            }}
            muiTableBodyRowProps={{ sx: { "&:hover td": { bgcolor: alpha("#fef2f2", 0.8) } } }}
            renderTopToolbarCustomActions={() => (
              <Typography variant="body2" color="text.secondary" sx={{ alignSelf: "center" }}>
                {outstanding.length} invoice{outstanding.length !== 1 ? "s" : ""}
              </Typography>
            )}
            renderEmptyRowsFallback={() => (
              <Box sx={{ px: 3, py: 6, textAlign: "center" }}>
                <CheckCircleRounded sx={{ fontSize: 40, color: "success.light", mb: 1 }} />
                <Typography variant="subtitle1" fontWeight={700}>No outstanding invoices</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  All invoices have been cleared.
                </Typography>
              </Box>
            )}
          />
        </Stack>

        <Divider />

        {/* Paid invoices */}
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <CheckCircleRounded sx={{ color: "success.main", fontSize: 20 }} />
            <Typography variant="h6" fontWeight={700}>Payment History</Typography>
            {paid.length > 0 && (
              <Chip label={paid.length} size="small" color="success" variant="outlined" />
            )}
          </Stack>

          <MaterialReactTable
            {...sharedTableProps}
            columns={paidColumns(batchLookup)}
            data={paid}
            enableColumnFilters
            enableSorting
            getRowId={(row) => row.id}
            state={{ isLoading }}
            initialState={{
              ...sharedTableProps.initialState,
              showGlobalFilter: true,
              sorting: [{ id: "month", desc: true }],
            }}
            muiTableBodyRowProps={{ sx: { "&:hover td": { bgcolor: alpha("#f0fdf4", 0.8) } } }}
            renderTopToolbarCustomActions={() => (
              <Typography variant="body2" color="text.secondary" sx={{ alignSelf: "center" }}>
                {paid.length} invoice{paid.length !== 1 ? "s" : ""}
              </Typography>
            )}
            renderEmptyRowsFallback={() => (
              <Box sx={{ px: 3, py: 6, textAlign: "center" }}>
                <Typography variant="subtitle1" fontWeight={700}>No payment history</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Paid invoices will appear here.
                </Typography>
              </Box>
            )}
          />
        </Stack>
      </Stack>

      {payTarget && (
        <RecordPaymentDialog
          invoice={payTarget}
          batchName={payTargetBatch}
          onClose={() => setPayTarget(null)}
          onSuccess={() => {
            setPayTarget(null);
            refetch();
          }}
        />
      )}
    </>
  );
}
