"use client";

import { useState } from "react";
import dayjs from "dayjs";
import {
  AccountBalanceWalletRounded,
  CheckCircleRounded,
  CloseRounded,
  ErrorOutlineRounded,
  PersonSearchRounded,
  PrintRounded,
  ReceiptLongRounded,
  WarningAmberRounded,
} from "@mui/icons-material";
import {
  Alert,
  Autocomplete,
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
  TextField,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { useMutation, useQuery } from "@apollo/client/react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { toast } from "react-hot-toast";
import {
  GetAllBatchesDocument,
  GetCenterDocument,
  GetStudentsDocument,
  RecordStudentPaymentDocument,
  type GetStudentsQuery,
} from "@/graphql/generated";
import {
  GetStudentInvoicesNewDocument,
  type StudentInvoiceNew,
  type InvoiceStatus,
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

const STATUS_LABEL: Record<string, string> = {
  ISSUED: "Unpaid",
  UNPAID: "Unpaid",
  PARTIAL: "Partial",
  OVERDUE: "Overdue",
  PAID: "Paid",
  WAIVED: "Waived",
};

const formatAmount = (n: number) =>
  `৳${n.toLocaleString("en-BD", { minimumFractionDigits: 0 })}`;

type StudentRecord = GetStudentsQuery["getStudents"][number];

// ── RecordPaymentDialog ───────────────────────────────────────────────────────

function RecordPaymentDialog({
  invoice,
  studentName,
  batchName,
  onClose,
  onSuccess,
}: {
  invoice: StudentInvoiceNew | null;
  studentName: string;
  batchName: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState(() =>
    invoice ? String(Math.max(0, invoice.total - invoice.paidAmount)) : "",
  );
  const [method, setMethod] = useState("CASH");
  const [ref, setRef] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [recordPayment, { loading }] = useMutation(RecordStudentPaymentDocument);

  if (!invoice) return null;

  const remaining = invoice.total - invoice.paidAmount;

  const handleConfirm = async () => {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      setError("Enter a valid amount.");
      return;
    }
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
            <Typography variant="h6" fontWeight={700}>
              Record Payment
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {studentName} · {batchName} ·{" "}
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
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: alpha("#f8fafc", 0.8),
            }}
          >
            <Stack spacing={0.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">
                  Invoice total
                </Typography>
                <Typography variant="caption" fontWeight={700}>
                  {formatAmount(invoice.total)}
                </Typography>
              </Stack>
              {invoice.discountAmount > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="success.main">
                    Discount
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    −{formatAmount(invoice.discountAmount)}
                  </Typography>
                </Stack>
              )}
              {invoice.fineAmount > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="error.main">
                    Late fine
                  </Typography>
                  <Typography variant="caption" color="error.main">
                    +{formatAmount(invoice.fineAmount)}
                  </Typography>
                </Stack>
              )}
              {invoice.paidAmount > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="success.main">
                    Already paid
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    {formatAmount(invoice.paidAmount)}
                  </Typography>
                </Stack>
              )}
              <Divider sx={{ my: 0.5 }} />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" fontWeight={700} color="error.main">
                  Remaining
                </Typography>
                <Typography variant="caption" fontWeight={700} color="error.main">
                  {formatAmount(remaining)}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          {error && (
            <Alert severity="error" sx={{ py: 0.25, fontSize: 13 }}>
              {error}
            </Alert>
          )}

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
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
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
            <Button
              size="small"
              color="inherit"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleConfirm}
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress size={13} color="inherit" />
                ) : undefined
              }
            >
              {loading ? "Saving…" : "Confirm Payment"}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

// ── Invoice print ─────────────────────────────────────────────────────────────

function printInvoice(params: {
  invoice: StudentInvoiceNew;
  studentName: string;
  studentCode: string;
  batchName: string;
  centerName: string;
}) {
  const { invoice, studentName, studentCode, batchName, centerName } = params;
  const win = window.open("", "_blank", "width=820,height=960");
  if (!win) return;

  const monthLabel = dayjs(invoice.month, "YYYY-MM").format("MMMM YYYY");
  const printedOn = dayjs().format("DD MMM YYYY, h:mm A");
  const fmtAmt = (n: number) =>
    `৳${n.toLocaleString("en-BD", { minimumFractionDigits: 0 })}`;
  const statusLabel = invoice.status === "WAIVED" ? "Waived" : "Paid";
  const badgeColor =
    invoice.status === "WAIVED"
      ? { bg: "#e0f2fe", fg: "#0369a1", border: "#bae6fd" }
      : { bg: "#dcfce7", fg: "#15803d", border: "#bbf7d0" };

  const lineItemsHtml =
    invoice.lineItems.length > 0
      ? `<table>
          <thead><tr><th>Description</th><th class="right">Amount</th></tr></thead>
          <tbody>
            ${invoice.lineItems
              .map(
                (li) =>
                  `<tr><td>${li.description}</td><td class="right">${fmtAmt(li.amount)}</td></tr>`,
              )
              .join("")}
          </tbody>
        </table>`
      : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Receipt – ${studentName} – ${monthLabel}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;padding:48px;max-width:640px;margin:0 auto}
    .header{text-align:center;padding-bottom:20px;border-bottom:2px solid #e2e8f0;margin-bottom:28px}
    .center-name{font-size:22px;font-weight:700;color:#0f172a}
    .receipt-label{font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:#94a3b8;margin-top:5px}
    .meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:28px}
    .meta-box{padding:12px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px}
    .meta-label{font-size:10px;text-transform:uppercase;letter-spacing:0.6px;color:#94a3b8;margin-bottom:3px}
    .meta-value{font-size:14px;font-weight:600;color:#0f172a}
    .meta-sub{font-size:12px;color:#64748b;margin-top:2px}
    table{width:100%;border-collapse:collapse;margin-bottom:24px}
    th{font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;padding:8px 12px;background:#f1f5f9;text-align:left;border-bottom:1px solid #e2e8f0}
    th.right{text-align:right}
    td{padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#334155}
    td.right{text-align:right;font-weight:600}
    .totals{margin-left:auto;width:260px;margin-bottom:24px}
    .tr{display:flex;justify-content:space-between;align-items:center;padding:5px 0;font-size:14px;color:#475569}
    .tr.grand{font-weight:700;font-size:16px;color:#0f172a;border-top:2px solid #e2e8f0;padding-top:12px;margin-top:6px}
    .tr.paid-row{color:#15803d;font-weight:600}
    .tr.disc{color:#10b981}
    .tr.fine{color:#ef4444}
    .badge{display:inline-block;padding:5px 16px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;background:${badgeColor.bg};color:${badgeColor.fg};border:1px solid ${badgeColor.border}}
    .footer{margin-top:36px;padding-top:14px;border-top:1px solid #e2e8f0;text-align:center;font-size:11px;color:#94a3b8;line-height:1.6}
    @media print{body{padding:24px}@page{margin:16mm}}
  </style>
</head>
<body>
  <div class="header">
    <div class="center-name">${centerName}</div>
    <div class="receipt-label">Payment Receipt</div>
  </div>

  <div class="meta-grid">
    <div class="meta-box">
      <div class="meta-label">Student</div>
      <div class="meta-value">${studentName}</div>
      <div class="meta-sub">${studentCode}</div>
    </div>
    <div class="meta-box">
      <div class="meta-label">Batch</div>
      <div class="meta-value">${batchName}</div>
    </div>
    <div class="meta-box">
      <div class="meta-label">Invoice Period</div>
      <div class="meta-value">${monthLabel}</div>
    </div>
    <div class="meta-box">
      <div class="meta-label">Printed On</div>
      <div class="meta-value">${printedOn}</div>
    </div>
  </div>

  ${lineItemsHtml}

  <div class="totals">
    <div class="tr"><span>Subtotal</span><span>${fmtAmt(invoice.subtotal)}</span></div>
    ${invoice.discountAmount > 0 ? `<div class="tr disc"><span>Discount</span><span>−${fmtAmt(invoice.discountAmount)}</span></div>` : ""}
    ${invoice.fineAmount > 0 ? `<div class="tr fine"><span>Late fine</span><span>+${fmtAmt(invoice.fineAmount)}</span></div>` : ""}
    <div class="tr grand"><span>Total</span><span>${fmtAmt(invoice.total)}</span></div>
    <div class="tr paid-row"><span>Amount Paid</span><span>${fmtAmt(invoice.paidAmount)}</span></div>
  </div>

  <div class="badge">${statusLabel}</div>

  <div class="footer">
    This is a computer-generated receipt. No signature is required.<br/>
    ${centerName} · Generated ${printedOn}
  </div>

  <script>window.onload=()=>{window.print()}</script>
</body>
</html>`;

  win.document.write(html);
  win.document.close();
}

// ── Table styles ──────────────────────────────────────────────────────────────

const sharedTableProps = {
  enableDensityToggle: false,
  enableFullScreenToggle: false,
  enableHiding: false,
  enableStickyHeader: true,
  muiTablePaperProps: {
    elevation: 0,
    sx: {
      border: "1px solid",
      borderColor: alpha("#0f172a", 0.08),
      borderRadius: 2,
      overflow: "hidden",
    },
  },
  muiTopToolbarProps: {
    sx: {
      px: 2.5,
      py: 1.5,
      borderBottom: "1px solid",
      borderColor: alpha("#0f172a", 0.08),
    },
  },
  muiBottomToolbarProps: {
    sx: { borderTop: "1px solid", borderColor: alpha("#0f172a", 0.08) },
  },
  muiTableHeadCellProps: {
    sx: {
      fontSize: 13,
      fontWeight: 700,
      py: 1.75,
      borderBottom: "1px solid",
      borderColor: alpha("#0f172a", 0.08),
    },
  },
  muiTableBodyCellProps: {
    sx: {
      borderBottom: "1px solid",
      borderColor: alpha("#0f172a", 0.06),
      py: 1.75,
    },
  },
  muiTableContainerProps: { sx: { maxHeight: 480 } },
  initialState: { pagination: { pageIndex: 0, pageSize: 20 } },
};

// ── Column builders ───────────────────────────────────────────────────────────

function statusCell(status: string) {
  return (
    <Chip
      label={STATUS_LABEL[status] ?? status}
      size="small"
      color={STATUS_COLOR[status as InvoiceStatus] ?? "default"}
      variant={status === "OVERDUE" ? "filled" : "outlined"}
    />
  );
}

function buildOutstandingColumns(
  batchLookup: Map<string, string>,
  onPay: (inv: StudentInvoiceNew) => void,
): MRT_ColumnDef<StudentInvoiceNew>[] {
  return [
    {
      id: "batch",
      accessorFn: (r) => batchLookup.get(r.batchId) ?? r.batchId,
      header: "Batch",
      size: 180,
      Cell: ({ row }) => (
        <Typography variant="body2" noWrap>
          {batchLookup.get(row.original.batchId) ?? "—"}
        </Typography>
      ),
    },
    {
      accessorKey: "month",
      header: "Month",
      size: 110,
      Cell: ({ cell }) => (
        <Typography variant="body2">
          {dayjs(String(cell.getValue()), "YYYY-MM").format("MMM YYYY")}
        </Typography>
      ),
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      size: 110,
      Cell: ({ cell }) => {
        const isPast = dayjs(String(cell.getValue())).isBefore(dayjs(), "day");
        return (
          <Typography
            variant="body2"
            color={isPast ? "error.main" : "text.primary"}
            fontWeight={isPast ? 600 : 400}
          >
            {dayjs(String(cell.getValue())).format("DD MMM YY")}
          </Typography>
        );
      },
    },
    {
      accessorKey: "total",
      header: "Total",
      size: 95,
      Cell: ({ cell }) => (
        <Typography variant="body2" fontWeight={600}>
          {formatAmount(Number(cell.getValue()))}
        </Typography>
      ),
    },
    {
      accessorKey: "paidAmount",
      header: "Paid",
      size: 95,
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
      id: "remaining",
      accessorFn: (r) => r.total - r.paidAmount,
      header: "Remaining",
      size: 105,
      Cell: ({ cell }) => (
        <Typography variant="body2" fontWeight={700} color="error.main">
          {formatAmount(Number(cell.getValue()))}
        </Typography>
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

function buildPaidColumns(
  batchLookup: Map<string, string>,
  onPrint: (inv: StudentInvoiceNew) => void,
): MRT_ColumnDef<StudentInvoiceNew>[] {
  return [
    {
      id: "batch",
      accessorFn: (r) => batchLookup.get(r.batchId) ?? r.batchId,
      header: "Batch",
      size: 180,
      Cell: ({ row }) => (
        <Typography variant="body2" noWrap>
          {batchLookup.get(row.original.batchId) ?? "—"}
        </Typography>
      ),
    },
    {
      accessorKey: "month",
      header: "Month",
      size: 110,
      Cell: ({ cell }) => (
        <Typography variant="body2">
          {dayjs(String(cell.getValue()), "YYYY-MM").format("MMM YYYY")}
        </Typography>
      ),
    },
    {
      accessorKey: "total",
      header: "Total",
      size: 100,
      Cell: ({ cell }) => (
        <Typography variant="body2" fontWeight={600}>
          {formatAmount(Number(cell.getValue()))}
        </Typography>
      ),
    },
    {
      accessorKey: "paidAmount",
      header: "Amount Paid",
      size: 120,
      Cell: ({ cell }) => (
        <Typography variant="body2" color="success.main" fontWeight={600}>
          {formatAmount(Number(cell.getValue()))}
        </Typography>
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
    {
      id: "actions",
      header: "",
      size: 56,
      enableSorting: false,
      enableColumnFilter: false,
      Cell: ({ row }) => (
        <Tooltip title="Print receipt">
          <IconButton size="small" onClick={() => onPrint(row.original)}>
            <PrintRounded fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];
}

// ── InvoicesWorkspace ─────────────────────────────────────────────────────────

export function InvoicesWorkspace() {
  const [selectedStudent, setSelectedStudent] =
    useState<StudentRecord | null>(null);
  const [payTarget, setPayTarget] = useState<StudentInvoiceNew | null>(null);

  const { data: centerData } = useQuery(GetCenterDocument);
  const centerName = centerData?.getCenter?.name ?? "BongoBrain";

  const { data: studentsData, loading: studentsLoading } = useQuery(
    GetStudentsDocument,
  );
  const { data: batchesData } = useQuery(GetAllBatchesDocument);
  const {
    data: invoicesData,
    loading: invoicesLoading,
    refetch,
  } = useQuery(GetStudentInvoicesNewDocument, {
    variables: { studentId: selectedStudent?.id ?? "" },
    skip: !selectedStudent,
    fetchPolicy: "cache-and-network",
  });

  const students = studentsData?.getStudents ?? [];
  const batchLookup = new Map(
    (batchesData?.getAllBatches ?? []).map((b) => [b.id, b.name]),
  );

  const allInvoices = invoicesData?.getStudentInvoices ?? [];
  const outstanding = allInvoices.filter((r) => OUTSTANDING_STATUSES.has(r.status));
  const paid = allInvoices.filter((r) => PAID_STATUSES.has(r.status));

  const totalOutstanding = outstanding.reduce(
    (s, r) => s + (r.total - r.paidAmount),
    0,
  );
  const totalCollected = allInvoices.reduce((s, r) => s + r.paidAmount, 0);
  const overdueCount = allInvoices.filter((r) => r.status === "OVERDUE").length;

  const studentName = selectedStudent
    ? `${selectedStudent.firstName} ${selectedStudent.lastName ?? ""}`.trim()
    : "";
  const studentCode = selectedStudent?.studentCode ?? "";
  const payTargetBatch = payTarget
    ? (batchLookup.get(payTarget.batchId) ?? "—")
    : "";

  const handlePrint = (inv: StudentInvoiceNew) => {
    printInvoice({
      invoice: inv,
      studentName,
      studentCode,
      batchName: batchLookup.get(inv.batchId) ?? "—",
      centerName,
    });
  };

  const isInvoicesLoading = invoicesLoading && allInvoices.length === 0;

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
            Invoices
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1.5, maxWidth: 680 }}
          >
            Search for a student to view their invoices, record payments, and
            track collection status across all batches.
          </Typography>
        </Paper>

        {/* Student selector */}
        <Paper
          elevation={0}
          sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="flex-start">
            <PersonSearchRounded
              sx={{ color: "text.secondary", mt: { sm: 1 } }}
            />
            <Box sx={{ flex: 1, maxWidth: 480 }}>
              <Autocomplete<StudentRecord>
                options={students}
                loading={studentsLoading}
                value={selectedStudent}
                onChange={(_, val) => {
                  setSelectedStudent(val);
                  setPayTarget(null);
                }}
                getOptionLabel={(s) =>
                  `${s.firstName} ${s.lastName ?? ""}`.trim() ||
                  s.studentCode
                }
                renderOption={(props, s) => (
                  <Box component="li" {...props} key={s.id}>
                    <Stack spacing={0.25}>
                      <Typography variant="body2" fontWeight={600}>
                        {`${s.firstName} ${s.lastName ?? ""}`.trim()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {s.studentCode}
                        {s.classLevel ? ` · ${s.classLevel}` : ""}
                      </Typography>
                    </Stack>
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search student"
                    placeholder="Name or student code…"
                    size="small"
                  />
                )}
                isOptionEqualToValue={(a, b) => a.id === b.id}
              />
            </Box>
            {selectedStudent && (
              <Stack spacing={0.25} sx={{ pt: { sm: 0.5 } }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  {studentName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedStudent.studentCode}
                  {selectedStudent.classLevel
                    ? ` · ${selectedStudent.classLevel}`
                    : ""}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Paper>

        {/* Only show content when a student is selected */}
        {!selectedStudent ? (
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
            <PersonSearchRounded
              sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }}
            />
            <Typography variant="h6" color="text.secondary">
              Select a student to view invoices
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
              Use the search above to find a student and load their invoice history.
            </Typography>
          </Box>
        ) : (
          <>
            {/* Summary cards */}
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(3, minmax(0, 1fr))",
                },
              }}
            >
              <SummaryCard
                caption="Outstanding"
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

            {/* Outstanding invoices */}
            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <ErrorOutlineRounded
                  sx={{ color: "error.main", fontSize: 20 }}
                />
                <Typography variant="h6" fontWeight={700}>
                  Outstanding Invoices
                </Typography>
                {outstanding.length > 0 && (
                  <Chip
                    label={outstanding.length}
                    size="small"
                    color="error"
                    variant="outlined"
                  />
                )}
              </Stack>

              <MaterialReactTable
                {...sharedTableProps}
                columns={buildOutstandingColumns(batchLookup, setPayTarget)}
                data={outstanding}
                enableColumnFilters
                enableSorting
                getRowId={(r) => r.id}
                state={{ isLoading: isInvoicesLoading }}
                initialState={{
                  ...sharedTableProps.initialState,
                  sorting: [{ id: "dueDate", desc: false }],
                }}
                muiTableBodyRowProps={{
                  sx: { "&:hover td": { bgcolor: alpha("#fef2f2", 0.8) } },
                }}
                renderTopToolbarCustomActions={() => (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ alignSelf: "center" }}
                  >
                    {outstanding.length} invoice
                    {outstanding.length !== 1 ? "s" : ""}
                  </Typography>
                )}
                renderEmptyRowsFallback={() => (
                  <Box sx={{ px: 3, py: 6, textAlign: "center" }}>
                    <CheckCircleRounded
                      sx={{ fontSize: 40, color: "success.light", mb: 1 }}
                    />
                    <Typography variant="subtitle1" fontWeight={700}>
                      No outstanding invoices
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      All invoices have been cleared.
                    </Typography>
                  </Box>
                )}
              />
            </Stack>

            <Divider />

            {/* Payment history */}
            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <CheckCircleRounded
                  sx={{ color: "success.main", fontSize: 20 }}
                />
                <Typography variant="h6" fontWeight={700}>
                  Payment History
                </Typography>
                {paid.length > 0 && (
                  <Chip
                    label={paid.length}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                )}
              </Stack>

              <MaterialReactTable
                {...sharedTableProps}
                columns={buildPaidColumns(batchLookup, handlePrint)}
                data={paid}
                enableColumnFilters
                enableSorting
                getRowId={(r) => r.id}
                state={{ isLoading: isInvoicesLoading }}
                initialState={{
                  ...sharedTableProps.initialState,
                  sorting: [{ id: "month", desc: true }],
                }}
                muiTableBodyRowProps={{
                  sx: { "&:hover td": { bgcolor: alpha("#f0fdf4", 0.8) } },
                }}
                renderTopToolbarCustomActions={() => (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ alignSelf: "center" }}
                  >
                    {paid.length} invoice{paid.length !== 1 ? "s" : ""}
                  </Typography>
                )}
                renderEmptyRowsFallback={() => (
                  <Box sx={{ px: 3, py: 6, textAlign: "center" }}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      No payment history
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      Paid invoices will appear here.
                    </Typography>
                  </Box>
                )}
              />
            </Stack>
          </>
        )}
      </Stack>

      {payTarget && (
        <RecordPaymentDialog
          invoice={payTarget}
          studentName={studentName}
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
