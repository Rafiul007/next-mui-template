"use client";

import { useState, type ReactNode } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  AccountBalanceRounded,
  AccountBalanceWalletRounded,
  ArrowBackRounded,
  CheckCircleRounded,
  DescriptionRounded,
  DownloadRounded,
  FlashOnRounded,
  HistoryRounded,
  LocalAtmRounded,
  PendingActionsRounded,
  PhoneAndroidRounded,
  PrintRounded,
  ReceiptLongRounded,
  SavingsRounded,
  WarningAmberRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
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
import { primaryGradient } from "@/theme/theme";
import { RhfTextField } from "@/components/form";

// ── Types ─────────────────────────────────────────────────────────────────────

type InvoiceStatus = "pending" | "partial" | "paid" | "overdue";
type PaymentMethod =
  | "cash"
  | "bank_transfer"
  | "bkash"
  | "nagad"
  | "rocket"
  | "cheque";

type InvoiceLineItem = { name: string; amount: number };

type PaymentRecord = {
  id: string;
  amount: number;
  method: PaymentMethod;
  paidAt: string;
  reference: string;
  remarks: string;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  studentId: string;
  studentName: string;
  batchId: string;
  batchName: string;
  issuedAt: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  discountAmount: number;
  grossTotal: number;
  netTotal: number;
  payments: PaymentRecord[];
  paidTotal: number;
  balance: number;
  status: InvoiceStatus;
};

type PaymentFormValues = {
  amount: number;
  method: string;
  paidAt: string;
  reference: string;
  remarks: string;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  pending: "Pending",
  partial: "Partial",
  paid: "Paid",
  overdue: "Overdue",
};

const STATUS_COLOR: Record<
  InvoiceStatus,
  "default" | "warning" | "success" | "error"
> = {
  pending: "default",
  partial: "warning",
  paid: "success",
  overdue: "error",
};

const METHOD_LABEL: Record<PaymentMethod, string> = {
  cash: "Cash",
  bank_transfer: "Bank Transfer",
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  cheque: "Cheque",
};

const TAB_VALUES: Array<InvoiceStatus | "all"> = [
  "all",
  "pending",
  "partial",
  "overdue",
  "paid",
];

const TAB_LABELS: Record<InvoiceStatus | "all", string> = {
  all: "All",
  pending: "Pending",
  partial: "Partial",
  overdue: "Overdue",
  paid: "Paid",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatAmount = (n: number) => `৳${n.toLocaleString("en-BD")}`;

const formatDate = (date: string) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const todayStr = () => new Date().toISOString().split("T")[0];

const computeStatus = (
  balance: number,
  paidTotal: number,
  dueDate: string,
): InvoiceStatus => {
  if (balance <= 0) return "paid";
  const isOverdue = new Date(dueDate) < new Date(new Date().toDateString());
  if (isOverdue) return "overdue";
  if (paidTotal > 0) return "partial";
  return "pending";
};

let paymentSeq = 10;
const nextPaymentId = () => String(paymentSeq++);

// ── Sample data ───────────────────────────────────────────────────────────────

const buildInvoice = (
  id: string,
  num: string,
  studentId: string,
  studentName: string,
  batchId: string,
  batchName: string,
  issuedAt: string,
  dueDate: string,
  lineItems: InvoiceLineItem[],
  discountAmount: number,
  payments: PaymentRecord[],
): Invoice => {
  const grossTotal = lineItems.reduce((s, i) => s + i.amount, 0);
  const netTotal = Math.max(0, grossTotal - discountAmount);
  const paidTotal = payments.reduce((s, p) => s + p.amount, 0);
  const balance = Math.max(0, netTotal - paidTotal);
  const status = computeStatus(balance, paidTotal, dueDate);
  return {
    id,
    invoiceNumber: num,
    studentId,
    studentName,
    batchId,
    batchName,
    issuedAt,
    dueDate,
    lineItems,
    discountAmount,
    grossTotal,
    netTotal,
    payments,
    paidTotal,
    balance,
    status,
  };
};

const SAMPLE_INVOICES: Invoice[] = [
  buildInvoice(
    "inv-1",
    "INV-0001",
    "STU-001",
    "Rafiul Islam",
    "batch-1",
    "Calculus · Batch 1",
    "2026-04-10",
    "2026-04-17",
    [
      { name: "Admission fee", amount: 2000 },
      { name: "Course fee", amount: 5000 },
    ],
    500,
    [
      {
        id: "pay-1",
        amount: 6500,
        method: "bkash",
        paidAt: "2026-04-12",
        reference: "TXN8821K",
        remarks: "Full payment via bKash",
      },
    ],
  ),
  buildInvoice(
    "inv-2",
    "INV-0002",
    "STU-002",
    "Nadia Rahman",
    "batch-2",
    "Class 9 · Section A",
    "2026-04-15",
    "2026-04-22",
    [{ name: "Admission fee", amount: 3000 }],
    0,
    [
      {
        id: "pay-2",
        amount: 1500,
        method: "cash",
        paidAt: "2026-04-16",
        reference: "",
        remarks: "Partial — remainder promised by month end",
      },
    ],
  ),
  buildInvoice(
    "inv-3",
    "INV-0003",
    "STU-003",
    "Tanvir Ahmed",
    "batch-3",
    "Physics · Batch 2",
    "2026-04-28",
    "2026-05-12",
    [{ name: "Admission fee", amount: 1500 }],
    0,
    [],
  ),
  buildInvoice(
    "inv-4",
    "INV-0004",
    "STU-004",
    "Salma Khatun",
    "batch-4",
    "Class 10 · Section B",
    "2026-04-01",
    "2026-04-08",
    [{ name: "Admission fee", amount: 3500 }],
    0,
    [],
  ),
  buildInvoice(
    "inv-5",
    "INV-0005",
    "STU-005",
    "Mehedi Hassan",
    "batch-1",
    "Calculus · Batch 1",
    "2026-04-18",
    "2026-04-25",
    [
      { name: "Admission fee", amount: 2000 },
      { name: "Course fee", amount: 5000 },
    ],
    0,
    [
      {
        id: "pay-3",
        amount: 3000,
        method: "nagad",
        paidAt: "2026-04-19",
        reference: "NGD44329",
        remarks: "",
      },
      {
        id: "pay-4",
        amount: 4000,
        method: "cash",
        paidAt: "2026-04-24",
        reference: "",
        remarks: "Remaining balance cleared",
      },
    ],
  ),
  buildInvoice(
    "inv-6",
    "INV-0006",
    "STU-006",
    "Farida Begum",
    "batch-2",
    "Class 9 · Section A",
    "2026-03-20",
    "2026-03-27",
    [{ name: "Admission fee", amount: 3000 }],
    0,
    [
      {
        id: "pay-5",
        amount: 1000,
        method: "bkash",
        paidAt: "2026-03-21",
        reference: "BKS99012",
        remarks: "",
      },
    ],
  ),
];

// ── Schema factory ────────────────────────────────────────────────────────────

const buildPaymentSchema = (maxBalance: number) =>
  yup
    .object({
      amount: yup
        .number()
        .typeError("Enter a valid amount")
        .required("Amount is required")
        .positive("Amount must be positive")
        .max(
          maxBalance,
          `Cannot exceed outstanding balance of ${formatAmount(maxBalance)}`,
        ),
      method: yup.string().required("Please select a payment method").default(""),
      paidAt: yup.string().required("Payment date is required"),
      reference: yup.string().trim().max(100, "Too long").default(""),
      remarks: yup.string().trim().max(300, "Too long").default(""),
    })
    .required();

// ── Receipt types & helpers ───────────────────────────────────────────────────

type ReceiptData = {
  payment: {
    amount: number;
    method: PaymentMethod;
    paidAt: string;
    reference: string;
    remarks: string;
  };
  newBalance: number;
  newPaidTotal: number;
  newStatus: InvoiceStatus;
};

function generateReceiptHtml(
  invoice: Invoice,
  receipt: ReceiptData,
): string {
  const { payment, newBalance, newPaidTotal, newStatus } = receipt;
  const methodLabel = METHOD_LABEL[payment.method];
  const statusLabel = STATUS_LABEL[newStatus];

  const row = (label: string, value: string, valueStyle = "") =>
    `<div class="row"><span class="label">${label}</span><span class="value" style="${valueStyle}">${value}</span></div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Receipt — ${invoice.invoiceNumber}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',Arial,sans-serif;background:#f9fafb;color:#111827;padding:40px 20px}
    .receipt{max-width:460px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
    .head{background:#eff6ff;padding:32px 32px 24px;text-align:center;border-bottom:2px dashed #dbeafe}
    .check{width:60px;height:60px;background:#2563eb;border-radius:50%;margin:0 auto 14px;display:flex;align-items:center;justify-content:center;font-size:28px;color:#fff;line-height:1}
    .org{font-size:20px;font-weight:800;color:#111}
    .subtitle{font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-top:4px}
    .body{padding:28px 32px}
    .inv-ref{text-align:center;margin-bottom:24px;padding-bottom:20px;border-bottom:1px dashed #e5e7eb;font-size:13px;color:#6b7280}
    .inv-ref strong{color:#111;font-family:monospace;font-size:15px}
    .section{margin-bottom:18px}
    .sec-title{font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px}
    .row{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:7px;gap:8px}
    .label{font-size:13px;color:#6b7280;flex-shrink:0}
    .value{font-size:13px;font-weight:600;color:#111;text-align:right}
    .big{font-size:26px;font-weight:900;color:#2563eb}
    .badge{display:inline-block;padding:2px 12px;border-radius:100px;font-size:11px;font-weight:700}
    .s-paid{background:#dbeafe;color:#1e40af}
    .s-partial{background:#fef3c7;color:#92400e}
    .s-pending{background:#f3f4f6;color:#374151}
    .s-overdue{background:#fee2e2;color:#991b1b}
    .dash{border:none;border-top:1px dashed #e5e7eb;margin:16px 0}
    .footer{text-align:center;padding:16px 32px 24px;border-top:1px solid #f3f4f6;font-size:11px;color:#9ca3af;line-height:1.7}
    @media print{body{background:#fff;padding:0}.receipt{border:none;border-radius:0;box-shadow:none;max-width:100%}}
  </style>
</head>
<body>
  <div class="receipt">
    <div class="head">
      <div class="check">✓</div>
      <div class="org">BongoEdu360</div>
      <div class="subtitle">Payment Receipt</div>
    </div>
    <div class="body">
      <div class="inv-ref"><strong>${invoice.invoiceNumber}</strong> &nbsp;·&nbsp; ${formatDate(payment.paidAt)}</div>
      <div class="section">
        <div class="sec-title">Student</div>
        ${row("Name", invoice.studentName)}
        ${row("Student ID", `<span style="font-family:monospace">${invoice.studentId}</span>`)}
        ${row("Batch", invoice.batchName)}
      </div>
      <hr class="dash">
      <div class="section">
        <div class="sec-title">Payment</div>
        ${row("Amount paid", formatAmount(payment.amount), "font-size:26px;font-weight:900;color:#2563eb")}
        ${row("Method", methodLabel)}
        ${row("Date", formatDate(payment.paidAt))}
        ${payment.reference ? row("Reference", `<span style="font-family:monospace">${payment.reference}</span>`) : ""}
        ${payment.remarks ? row("Remarks", `<em>${payment.remarks}</em>`) : ""}
      </div>
      <hr class="dash">
      <div class="section">
        <div class="sec-title">Invoice summary</div>
        ${row("Invoice total", formatAmount(invoice.netTotal))}
        ${row("Total paid", formatAmount(newPaidTotal), "color:#2563eb")}
        ${row("Balance remaining", formatAmount(newBalance), `color:${newBalance === 0 ? "#2563eb" : "#dc2626"}`)}
        <div class="row"><span class="label">Status</span><span class="badge s-${newStatus}">${statusLabel}</span></div>
      </div>
    </div>
    <div class="footer">
      Thank you for your payment.<br>
      Generated by BongoEdu360 &nbsp;·&nbsp; ${new Date().toLocaleString("en-BD")}
    </div>
  </div>
</body>
</html>`;
}

function openReceiptWindow(html: string) {
  const win = window.open("", "_blank", "width=660,height=860,scrollbars=yes");
  if (!win) {
    alert("Allow popups to open the receipt.");
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 600);
}

function downloadReceiptHtml(html: string, invoiceNumber: string) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `receipt-${invoiceNumber}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Method card ───────────────────────────────────────────────────────────────

function MethodCard({
  bgColor,
  color,
  icon,
  label,
  onClick,
  selected,
}: {
  bgColor: string;
  color: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <Box
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      sx={{
        p: { xs: 1.5, sm: 2 },
        border: "2px solid",
        borderColor: selected ? color : alpha("#0f172a", 0.12),
        borderRadius: 2,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.75,
        bgcolor: selected ? bgColor : "transparent",
        transition: "all 150ms ease",
        userSelect: "none",
        "&:hover": { borderColor: color, bgcolor: bgColor },
        "&:focus-visible": { outline: `2px solid ${color}`, outlineOffset: 2 },
      }}
    >
      <Box
        sx={{
          fontSize: 28,
          display: "flex",
          color: selected ? color : alpha("#0f172a", 0.45),
          transition: "color 150ms ease",
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="caption"
        fontWeight={selected ? 700 : 500}
        sx={{
          color: selected ? color : "text.secondary",
          lineHeight: 1.2,
          textAlign: "center",
          transition: "color 150ms ease",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

// ── Full-screen payment page ───────────────────────────────────────────────────

function PaymentPage({
  invoice,
  onClose,
  onSubmit,
}: {
  invoice: Invoice;
  onClose: () => void;
  onSubmit: (values: PaymentFormValues) => void;
}) {
  const PAYMENT_METHODS = [
    {
      value: "cash",
      label: "Cash",
      icon: <LocalAtmRounded fontSize="inherit" />,
      color: "#2563eb",
      bgColor: "#eff6ff",
    },
    {
      value: "bkash",
      label: "bKash",
      icon: <PhoneAndroidRounded fontSize="inherit" />,
      color: "#e2136e",
      bgColor: "#fdf2f8",
    },
    {
      value: "nagad",
      label: "Nagad",
      icon: <AccountBalanceWalletRounded fontSize="inherit" />,
      color: "#ea580c",
      bgColor: "#fff7ed",
    },
    {
      value: "rocket",
      label: "Rocket",
      icon: <FlashOnRounded fontSize="inherit" />,
      color: "#7c3aed",
      bgColor: "#faf5ff",
    },
    {
      value: "bank_transfer",
      label: "Bank Transfer",
      icon: <AccountBalanceRounded fontSize="inherit" />,
      color: "#1d4ed8",
      bgColor: "#eff6ff",
    },
    {
      value: "cheque",
      label: "Cheque",
      icon: <DescriptionRounded fontSize="inherit" />,
      color: "#475569",
      bgColor: "#f8fafc",
    },
  ];

  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  const { control, handleSubmit } = useForm<PaymentFormValues>({
    resolver: yupResolver(buildPaymentSchema(invoice.balance)),
    defaultValues: {
      amount: invoice.balance,
      method: "",
      paidAt: todayStr(),
      reference: "",
      remarks: "",
    },
    mode: "onTouched",
  });

  const watchedAmount = useWatch({ control, name: "amount" });
  const watchedMethod = useWatch({ control, name: "method" });

  const onFormSubmit = (values: PaymentFormValues) => {
    const amount = Number(values.amount);
    const newPaidTotal = invoice.paidTotal + amount;
    const newBalance = Math.max(0, invoice.netTotal - newPaidTotal);
    const newStatus = computeStatus(newBalance, newPaidTotal, invoice.dueDate);
    setReceipt({
      payment: {
        amount,
        method: values.method as PaymentMethod,
        paidAt: values.paidAt,
        reference: values.reference,
        remarks: values.remarks,
      },
      newBalance,
      newPaidTotal,
      newStatus,
    });
    onSubmit(values);
  };

  const amountNum = Math.min(
    Math.max(0, Number(watchedAmount) || 0),
    invoice.balance,
  );
  const previewPaid = invoice.paidTotal + amountNum;
  const previewBalance = Math.max(0, invoice.netTotal - previewPaid);
  const previewStatus = computeStatus(
    previewBalance,
    previewPaid,
    invoice.dueDate,
  );
  const willClear = previewBalance === 0 && amountNum > 0;

  const selectedMethod = PAYMENT_METHODS.find((m) => m.value === watchedMethod);

  if (receipt) {
    const html = generateReceiptHtml(invoice, receipt);
    return (
      <Dialog open fullScreen>
        <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
          {/* Receipt header */}
          <Box
            sx={{
              px: 3,
              py: 1.75,
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: "#ffffff",
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexShrink: 0,
            }}
          >
            <Tooltip title="Back to invoices">
              <IconButton onClick={onClose} size="small">
                <ArrowBackRounded />
              </IconButton>
            </Tooltip>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" lineHeight={1.3}>
                Payment Receipt
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {invoice.invoiceNumber} · {invoice.studentName}
              </Typography>
            </Box>
            <Chip
              label={STATUS_LABEL[receipt.newStatus]}
              color={STATUS_COLOR[receipt.newStatus]}
              size="small"
            />
          </Box>

          {/* Receipt content */}
          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: { xs: "flex-start", md: "center" },
              p: { xs: 3, md: 5 },
              bgcolor: alpha("#eff6ff", 0.4),
            }}
          >
            {/* Success icon */}
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                bgcolor: "#2563eb",
                display: "grid",
                placeItems: "center",
                mb: 2,
                boxShadow: `0 0 0 12px ${alpha("#2563eb", 0.12)}`,
              }}
            >
              <CheckCircleRounded sx={{ fontSize: 40, color: "#fff" }} />
            </Box>
            <Typography variant="h5" fontWeight={700} mb={0.5}>
              Payment Recorded
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={4}>
              {formatAmount(receipt.payment.amount)} received from{" "}
              {invoice.studentName} via {METHOD_LABEL[receipt.payment.method]}
            </Typography>

            {/* Receipt card */}
            <Paper
              elevation={0}
              sx={{
                width: "100%",
                maxWidth: 480,
                border: "1px solid",
                borderColor: alpha("#0f172a", 0.1),
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: `0 8px 32px ${alpha("#0f172a", 0.08)}`,
              }}
            >
              {/* Card header */}
              <Box
                sx={{
                  px: 3.5,
                  py: 3,
                  bgcolor: alpha("#eff6ff", 0.8),
                  borderBottom: "2px dashed",
                  borderColor: alpha("#2563eb", 0.25),
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="text.secondary"
                  sx={{ textTransform: "uppercase", letterSpacing: 0.8 }}
                >
                  BongoEdu360 · Payment Receipt
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5, fontFamily: "monospace" }}
                >
                  {invoice.invoiceNumber} · {formatDate(receipt.payment.paidAt)}
                </Typography>
              </Box>

              {/* Card body */}
              <Stack spacing={0} divider={<Divider sx={{ borderStyle: "dashed" }} />}>
                {/* Student */}
                <Stack spacing={0.75} sx={{ px: 3.5, py: 2.5 }}>
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color="text.secondary"
                    sx={{ textTransform: "uppercase", letterSpacing: 0.5, mb: 0.5 }}
                  >
                    Student
                  </Typography>
                  {[
                    ["Name", invoice.studentName],
                    ["Student ID", invoice.studentId],
                    ["Batch", invoice.batchName],
                  ].map(([label, value]) => (
                    <Stack
                      key={label}
                      direction="row"
                      justifyContent="space-between"
                    >
                      <Typography variant="body2" color="text.secondary">
                        {label}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={
                          label === "Student ID"
                            ? { fontFamily: "monospace" }
                            : {}
                        }
                      >
                        {value}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>

                {/* Payment */}
                <Stack spacing={0.75} sx={{ px: 3.5, py: 2.5 }}>
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color="text.secondary"
                    sx={{ textTransform: "uppercase", letterSpacing: 0.5, mb: 0.5 }}
                  >
                    Payment
                  </Typography>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2" color="text.secondary">
                      Amount paid
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight={800}
                      color="success.main"
                    >
                      {formatAmount(receipt.payment.amount)}
                    </Typography>
                  </Stack>
                  {[
                    ["Method", METHOD_LABEL[receipt.payment.method]],
                    ["Date", formatDate(receipt.payment.paidAt)],
                    ...(receipt.payment.reference
                      ? [["Reference", receipt.payment.reference]]
                      : []),
                    ...(receipt.payment.remarks
                      ? [["Remarks", receipt.payment.remarks]]
                      : []),
                  ].map(([label, value]) => (
                    <Stack
                      key={label}
                      direction="row"
                      justifyContent="space-between"
                    >
                      <Typography variant="body2" color="text.secondary">
                        {label}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={
                          label === "Reference"
                            ? { fontFamily: "monospace" }
                            : {}
                        }
                      >
                        {value}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>

                {/* Invoice summary */}
                <Stack spacing={0.75} sx={{ px: 3.5, py: 2.5 }}>
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color="text.secondary"
                    sx={{ textTransform: "uppercase", letterSpacing: 0.5, mb: 0.5 }}
                  >
                    Invoice summary
                  </Typography>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Invoice total
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatAmount(invoice.netTotal)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Total paid
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="success.main"
                    >
                      {formatAmount(receipt.newPaidTotal)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Balance remaining
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color={
                        receipt.newBalance === 0
                          ? "success.main"
                          : "error.main"
                      }
                    >
                      {formatAmount(receipt.newBalance)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={STATUS_LABEL[receipt.newStatus]}
                      color={STATUS_COLOR[receipt.newStatus]}
                      size="small"
                      variant={
                        receipt.newStatus === "paid" ? "filled" : "outlined"
                      }
                    />
                  </Stack>
                </Stack>
              </Stack>

              {/* Footer */}
              <Box
                sx={{
                  px: 3.5,
                  py: 2,
                  borderTop: "1px solid",
                  borderColor: alpha("#0f172a", 0.06),
                  bgcolor: alpha("#f8fafc", 0.7),
                  textAlign: "center",
                }}
              >
                <Typography variant="caption" color="text.disabled">
                  Thank you for your payment · Generated by BongoEdu360
                </Typography>
              </Box>
            </Paper>

            {/* Action buttons */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ mt: 3, width: "100%", maxWidth: 480 }}
            >
              <Button
                variant="outlined"
                startIcon={<PrintRounded />}
                onClick={() => openReceiptWindow(html)}
                fullWidth
                size="large"
              >
                Print Receipt
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadRounded />}
                onClick={() =>
                  downloadReceiptHtml(html, invoice.invoiceNumber)
                }
                fullWidth
                size="large"
              >
                Download PDF
              </Button>
            </Stack>
            <Button
              color="inherit"
              onClick={onClose}
              sx={{ mt: 1.5 }}
              startIcon={<ArrowBackRounded />}
            >
              Back to Invoices
            </Button>
          </Box>
        </Box>
      </Dialog>
    );
  }

  return (
    <Dialog open fullScreen>
      <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        {/* ── Header ── */}
        <Box
          sx={{
            px: 3,
            py: 1.75,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "#ffffff",
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexShrink: 0,
          }}
        >
          <Tooltip title="Back to invoices">
            <IconButton onClick={onClose} size="small">
              <ArrowBackRounded />
            </IconButton>
          </Tooltip>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" lineHeight={1.3}>
              Record Payment
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {invoice.invoiceNumber} · {invoice.studentName} ·{" "}
              {invoice.batchName}
            </Typography>
          </Box>

          <Chip
            label={STATUS_LABEL[invoice.status]}
            color={STATUS_COLOR[invoice.status]}
            size="small"
            variant="outlined"
          />
        </Box>

        {/* ── Two-panel body ── */}
        <Box
          component="form"
          onSubmit={handleSubmit(onFormSubmit)}
          noValidate
          sx={{
            flex: 1,
            display: "flex",
            overflow: { xs: "auto", lg: "hidden" },
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
              flex: 1,
              minHeight: 0,
            }}
          >
            {/* ── LEFT: Invoice details ── */}
            <Box
              sx={{
                overflow: { xs: "visible", lg: "auto" },
                p: { xs: 3, md: 4, lg: 5 },
                borderRight: { lg: "1px solid" },
                borderBottom: { xs: "1px solid", lg: "none" },
                borderColor: "divider",
              }}
            >
              <Stack spacing={3}>
                {/* Student info */}
                <Stack spacing={0.5}>
                  <Typography variant="h5" fontWeight={700}>
                    {invoice.studentName}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={invoice.studentId}
                      size="small"
                      sx={{ fontFamily: "monospace", fontSize: 12 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {invoice.batchName}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Issued: {formatDate(invoice.issuedAt)}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={
                        invoice.status === "overdue"
                          ? "error.main"
                          : "text.secondary"
                      }
                    >
                      Due: {formatDate(invoice.dueDate)}
                    </Typography>
                  </Stack>
                </Stack>

                <Divider />

                {/* Fee breakdown */}
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Fee breakdown
                  </Typography>
                  <Stack spacing={1}>
                    {invoice.lineItems.map((item, i) => (
                      <Stack
                        key={i}
                        direction="row"
                        justifyContent="space-between"
                      >
                        <Typography variant="body2">{item.name}</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {formatAmount(item.amount)}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                  {invoice.discountAmount > 0 && (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="success.main">
                        Discount applied
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="success.main"
                      >
                        −{formatAmount(invoice.discountAmount)}
                      </Typography>
                    </Stack>
                  )}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    sx={{
                      pt: 1.25,
                      borderTop: "1px dashed",
                      borderColor: alpha("#0f172a", 0.12),
                    }}
                  >
                    <Typography variant="body2" fontWeight={700}>
                      Invoice total
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {formatAmount(invoice.netTotal)}
                    </Typography>
                  </Stack>
                </Stack>

                <Divider />

                {/* Payment history */}
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Payment history
                  </Typography>
                  {invoice.payments.length === 0 ? (
                    <Typography
                      variant="body2"
                      color="text.disabled"
                      sx={{ fontStyle: "italic" }}
                    >
                      No payments recorded yet.
                    </Typography>
                  ) : (
                    <Stack spacing={1}>
                      {invoice.payments.map((p, idx) => (
                        <Box
                          key={p.id}
                          sx={{
                            p: 1.5,
                            border: "1px solid",
                            borderColor: alpha("#2563eb", 0.2),
                            borderRadius: 1.5,
                            bgcolor: alpha("#eff6ff", 0.5),
                          }}
                        >
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="flex-start"
                          >
                            <Stack spacing={0.25}>
                              <Stack
                                direction="row"
                                spacing={0.75}
                                alignItems="center"
                              >
                                <Typography variant="body2" fontWeight={600}>
                                  Payment {idx + 1}
                                </Typography>
                                <Chip
                                  label={METHOD_LABEL[p.method]}
                                  size="small"
                                  sx={{ height: 18, fontSize: 11 }}
                                />
                              </Stack>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {formatDate(p.paidAt)}
                                {p.reference ? ` · ${p.reference}` : ""}
                              </Typography>
                              {p.remarks && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontStyle: "italic" }}
                                >
                                  {p.remarks}
                                </Typography>
                              )}
                            </Stack>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              color="success.main"
                              sx={{ flexShrink: 0, ml: 2 }}
                            >
                              {formatAmount(p.amount)}
                            </Typography>
                          </Stack>
                        </Box>
                      ))}
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        sx={{ pt: 0.5 }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Total paid so far
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          color="success.main"
                        >
                          {formatAmount(invoice.paidTotal)}
                        </Typography>
                      </Stack>
                    </Stack>
                  )}
                </Stack>

                <Divider />

                {/* Outstanding balance */}
                <Box
                  sx={{
                    p: 2.5,
                    border: "2px solid",
                    borderColor:
                      invoice.status === "overdue"
                        ? alpha("#ef4444", 0.35)
                        : alpha("#f59e0b", 0.35),
                    borderRadius: 2,
                    bgcolor:
                      invoice.status === "overdue"
                        ? alpha("#fef2f2", 0.8)
                        : alpha("#fffbeb", 0.8),
                    textAlign: "center",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Outstanding balance
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight={800}
                    color={
                      invoice.status === "overdue" ? "error.main" : "warning.dark"
                    }
                    sx={{ mt: 0.5 }}
                  >
                    {formatAmount(invoice.balance)}
                  </Typography>
                  {invoice.status === "overdue" && (
                    <Typography variant="caption" color="error.main">
                      Past due date — {formatDate(invoice.dueDate)}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Box>

            {/* ── RIGHT: Payment form ── */}
            <Box
              sx={{
                overflow: { xs: "visible", lg: "auto" },
                p: { xs: 3, md: 4, lg: 5 },
                bgcolor: alpha("#f8fafc", 0.5),
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              {/* Payment method */}
              <Stack spacing={1.5}>
                <Stack spacing={0.25}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Payment method
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Select how this payment was received.
                  </Typography>
                </Stack>
                <Controller
                  control={control}
                  name="method"
                  render={({ field, fieldState }) => (
                    <Stack spacing={1}>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)",
                          gap: 1.5,
                        }}
                      >
                        {PAYMENT_METHODS.map((m) => (
                          <MethodCard
                            key={m.value}
                            selected={field.value === m.value}
                            onClick={() => field.onChange(m.value)}
                            icon={m.icon}
                            label={m.label}
                            color={m.color}
                            bgColor={m.bgColor}
                          />
                        ))}
                      </Box>
                      {fieldState.error && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ display: "block", mt: 0.5 }}
                        >
                          {fieldState.error.message}
                        </Typography>
                      )}
                    </Stack>
                  )}
                />
              </Stack>

              <Divider />

              {/* Payment details */}
              <Stack spacing={1.5}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Payment details
                </Typography>

                <RhfTextField
                  control={control}
                  name="amount"
                  label="Amount"
                  type="number"
                  fullWidth
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography variant="body1" fontWeight={700}>
                            ৳
                          </Typography>
                        </InputAdornment>
                      ),
                    },
                    htmlInput: { min: 1, max: invoice.balance, style: { fontSize: 18, fontWeight: 700 } },
                  }}
                  size="medium"
                />

                <Box
                  sx={{
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  }}
                >
                  <RhfTextField
                    control={control}
                    name="paidAt"
                    label="Payment date"
                    type="date"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                  <RhfTextField
                    control={control}
                    name="reference"
                    label="Reference / TxN no."
                    placeholder="e.g. TXN123ABC"
                    fullWidth
                    trim
                  />
                </Box>

                <RhfTextField
                  control={control}
                  name="remarks"
                  label="Remarks"
                  placeholder="Any notes about this payment…"
                  fullWidth
                  trim
                  multiline
                  rows={2}
                />
              </Stack>

              {/* Live payment preview */}
              <Box
                sx={{
                  p: 2.5,
                  border: "2px solid",
                  borderColor: willClear
                    ? alpha("#2563eb", 0.4)
                    : amountNum > 0
                      ? alpha("#3b82f6", 0.3)
                      : alpha("#0f172a", 0.08),
                  borderRadius: 2,
                  bgcolor: willClear
                    ? alpha("#eff6ff", 0.8)
                    : amountNum > 0
                      ? alpha("#eff6ff", 0.8)
                      : alpha("#f8fafc", 0.8),
                  transition: "all 200ms ease",
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="text.secondary"
                  sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                >
                  After this payment
                </Typography>
                <Stack direction="row" spacing={3} sx={{ mt: 1.5 }}>
                  <Stack spacing={0.5} flex={1}>
                    <Typography variant="caption" color="text.secondary">
                      Current status
                    </Typography>
                    <Chip
                      label={STATUS_LABEL[invoice.status]}
                      color={STATUS_COLOR[invoice.status]}
                      size="small"
                      variant="outlined"
                      sx={{ alignSelf: "flex-start" }}
                    />
                  </Stack>
                  <Typography
                    variant="h6"
                    color="text.disabled"
                    sx={{ alignSelf: "center" }}
                  >
                    →
                  </Typography>
                  <Stack spacing={0.5} flex={1}>
                    <Typography variant="caption" color="text.secondary">
                      New status
                    </Typography>
                    <Chip
                      label={STATUS_LABEL[previewStatus]}
                      color={STATUS_COLOR[previewStatus]}
                      size="small"
                      variant={
                        previewStatus === "paid" ? "filled" : "outlined"
                      }
                      sx={{ alignSelf: "flex-start" }}
                    />
                  </Stack>
                </Stack>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  sx={{ mt: 2 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Remaining balance
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color={previewBalance === 0 ? "success.main" : "text.primary"}
                  >
                    {formatAmount(previewBalance)}
                  </Typography>
                </Stack>
                {willClear && (
                  <Stack
                    direction="row"
                    spacing={0.75}
                    alignItems="center"
                    sx={{ mt: 1.25 }}
                  >
                    <CheckCircleRounded
                      sx={{ fontSize: 16, color: "success.main" }}
                    />
                    <Typography variant="body2" color="success.main" fontWeight={600}>
                      Invoice will be fully cleared
                      {selectedMethod ? ` via ${selectedMethod.label}` : ""}.
                    </Typography>
                  </Stack>
                )}
              </Box>

              {/* Submit */}
              <Box
                sx={{
                  position: { lg: "sticky" },
                  bottom: 0,
                  pt: 1,
                  mt: "auto",
                }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{ backgroundColor: primaryGradient, py: 1.5 }}
                >
                  Record Payment
                  {amountNum > 0 ? ` · ${formatAmount(amountNum)}` : ""}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}

// ── Payment history dialog ────────────────────────────────────────────────────

function PaymentHistoryDialog({
  invoice,
  onClose,
}: {
  invoice: Invoice;
  onClose: () => void;
}) {
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Payment history — {invoice.invoiceNumber}
        <Typography
          component="span"
          variant="body2"
          color="text.secondary"
          sx={{ ml: 1 }}
        >
          {invoice.studentName} · {invoice.studentId}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        {invoice.payments.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ py: 3, textAlign: "center" }}
          >
            No payments recorded yet.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {invoice.payments.map((p, idx) => (
              <Box
                key={p.id}
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  bgcolor: alpha("#f8fafc", 0.7),
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Stack spacing={0.25}>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <Typography variant="body2" fontWeight={700}>
                        Payment {idx + 1}
                      </Typography>
                      <Chip
                        label={METHOD_LABEL[p.method]}
                        size="small"
                        sx={{ height: 20, fontSize: 11 }}
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(p.paidAt)}
                      {p.reference ? ` · Ref: ${p.reference}` : ""}
                    </Typography>
                    {p.remarks && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontStyle: "italic" }}
                      >
                        {p.remarks}
                      </Typography>
                    )}
                  </Stack>
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    color="success.main"
                    sx={{ flexShrink: 0, ml: 2 }}
                  >
                    {formatAmount(p.amount)}
                  </Typography>
                </Stack>
              </Box>
            ))}
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ pt: 1, borderTop: "1px dashed", borderColor: "divider" }}
            >
              <Typography variant="body2" fontWeight={700}>
                Total paid
              </Typography>
              <Typography variant="body2" fontWeight={700} color="success.main">
                {formatAmount(invoice.paidTotal)}
              </Typography>
            </Stack>
            {invoice.balance > 0 && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Remaining balance
                </Typography>
                <Typography variant="body2" fontWeight={600} color="error.main">
                  {formatAmount(invoice.balance)}
                </Typography>
              </Stack>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Summary card ──────────────────────────────────────────────────────────────

function SummaryCard({
  caption,
  icon,
  subtitle,
  title,
  tone = "default",
}: {
  caption: string;
  icon: ReactNode;
  subtitle?: string;
  title: string;
  tone?: "default" | "success" | "warning" | "error" | "muted";
}) {
  const borderColor =
    tone === "success"
      ? alpha("#2563eb", 0.22)
      : tone === "warning"
        ? alpha("#f59e0b", 0.22)
        : tone === "error"
          ? alpha("#ef4444", 0.22)
          : tone === "muted"
            ? alpha("#64748b", 0.16)
            : alpha("#0f172a", 0.08);

  const iconBg =
    tone === "success"
      ? alpha("#2563eb", 0.12)
      : tone === "warning"
        ? alpha("#f59e0b", 0.12)
        : tone === "error"
          ? alpha("#ef4444", 0.12)
          : alpha("#0f172a", 0.06);

  const iconColor =
    tone === "success"
      ? "#1d4ed8"
      : tone === "warning"
        ? "#b45309"
        : tone === "error"
          ? "#b91c1c"
          : "#0f172a";

  return (
    <Paper
      elevation={0}
      sx={{ p: 2.5, border: "1px solid", borderColor, display: "grid", gap: 1 }}
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
            bgcolor: iconBg,
            color: iconColor,
          }}
        >
          {icon}
        </Box>
      </Stack>
      <Typography variant="h5">{title}</Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Paper>
  );
}

// ── Workspace ─────────────────────────────────────────────────────────────────

export function FeesWorkspace() {
  const [invoices, setInvoices] = useState<Invoice[]>(SAMPLE_INVOICES);
  const [activeTab, setActiveTab] = useState<InvoiceStatus | "all">("all");
  const [paymentTarget, setPaymentTarget] = useState<Invoice | null>(null);
  const [historyTarget, setHistoryTarget] = useState<Invoice | null>(null);

  const totalInvoiced = invoices.reduce((s, inv) => s + inv.netTotal, 0);
  const totalCollected = invoices.reduce((s, inv) => s + inv.paidTotal, 0);
  const totalOutstanding = invoices.reduce((s, inv) => s + inv.balance, 0);
  const overdueCount = invoices.filter((inv) => inv.status === "overdue").length;

  const tabCount = (tab: InvoiceStatus | "all") =>
    tab === "all"
      ? invoices.length
      : invoices.filter((inv) => inv.status === tab).length;

  const filtered =
    activeTab === "all"
      ? invoices
      : invoices.filter((inv) => inv.status === activeTab);

  const handleRecordPayment = (values: PaymentFormValues) => {
    if (!paymentTarget) return;
    const newPayment: PaymentRecord = {
      id: nextPaymentId(),
      amount: Number(values.amount),
      method: values.method as PaymentMethod,
      paidAt: values.paidAt,
      reference: values.reference,
      remarks: values.remarks,
    };
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== paymentTarget.id) return inv;
        const payments = [...inv.payments, newPayment];
        const paidTotal = payments.reduce((s, p) => s + p.amount, 0);
        const balance = Math.max(0, inv.netTotal - paidTotal);
        const status = computeStatus(balance, paidTotal, inv.dueDate);
        return { ...inv, payments, paidTotal, balance, status };
      }),
    );
    // PaymentPage shows the receipt — closing is triggered from "Back to Invoices"
  };

  const columns: MRT_ColumnDef<Invoice>[] = [
    {
      id: "invoice",
      accessorKey: "invoiceNumber",
      header: "Invoice",
      size: 210,
      Cell: ({ row }) => (
        <Stack spacing={0.25}>
          <Typography variant="subtitle2" fontWeight={700}>
            {row.original.invoiceNumber}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.original.studentName} · {row.original.studentId}
          </Typography>
        </Stack>
      ),
    },
    {
      accessorKey: "batchName",
      header: "Batch",
      size: 200,
      filterVariant: "select",
      filterSelectOptions: [...new Set(SAMPLE_INVOICES.map((i) => i.batchName))],
      Cell: ({ cell }) => (
        <Typography variant="body2">{String(cell.getValue())}</Typography>
      ),
    },
    {
      id: "dates",
      accessorKey: "issuedAt",
      header: "Issued / Due",
      size: 160,
      Cell: ({ row }) => (
        <Stack spacing={0.25}>
          <Typography variant="body2">
            {formatDate(row.original.issuedAt)}
          </Typography>
          <Typography
            variant="caption"
            color={
              row.original.status === "overdue" ? "error.main" : "text.secondary"
            }
          >
            Due: {formatDate(row.original.dueDate)}
          </Typography>
        </Stack>
      ),
    },
    {
      accessorKey: "netTotal",
      header: "Total",
      size: 120,
      Cell: ({ cell, row }) => (
        <Stack spacing={0.25}>
          <Typography variant="body2" fontWeight={600}>
            {formatAmount(Number(cell.getValue()))}
          </Typography>
          {row.original.discountAmount > 0 && (
            <Typography variant="caption" color="success.main">
              −{formatAmount(row.original.discountAmount)} disc.
            </Typography>
          )}
        </Stack>
      ),
    },
    {
      accessorKey: "paidTotal",
      header: "Paid",
      size: 110,
      Cell: ({ cell, row }) => (
        <Typography
          variant="body2"
          fontWeight={600}
          color={row.original.paidTotal > 0 ? "success.main" : "text.disabled"}
        >
          {formatAmount(Number(cell.getValue()))}
        </Typography>
      ),
    },
    {
      accessorKey: "balance",
      header: "Balance",
      size: 110,
      Cell: ({ cell, row }) => (
        <Typography
          variant="body2"
          fontWeight={600}
          color={row.original.balance > 0 ? "error.main" : "text.disabled"}
        >
          {formatAmount(Number(cell.getValue()))}
        </Typography>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 110,
      filterVariant: "select",
      filterSelectOptions: ["pending", "partial", "paid", "overdue"],
      Cell: ({ cell }) => {
        const status = cell.getValue<InvoiceStatus>();
        return (
          <Chip
            label={STATUS_LABEL[status]}
            color={STATUS_COLOR[status]}
            size="small"
            variant={status === "paid" ? "filled" : "outlined"}
          />
        );
      },
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
              "linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(240,249,255,0.98) 100%)",
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" sx={{ mt: 0.5 }}>
              Fees & Payments
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              Track student invoices, record payments, and monitor outstanding
              balances. Invoices are auto-generated on student admission.
            </Typography>
          </Box>
        </Paper>

        {/* Stats */}
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
            caption="Total Invoiced"
            title={formatAmount(totalInvoiced)}
            subtitle={`${invoices.length} invoice${invoices.length === 1 ? "" : "s"} raised`}
            icon={<ReceiptLongRounded />}
          />
          <SummaryCard
            caption="Total Collected"
            title={formatAmount(totalCollected)}
            subtitle={`${invoices.filter((i) => i.status === "paid").length} fully paid`}
            icon={<SavingsRounded />}
            tone="success"
          />
          <SummaryCard
            caption="Outstanding"
            title={formatAmount(totalOutstanding)}
            subtitle={`${invoices.filter((i) => i.status !== "paid").length} unpaid`}
            icon={<PendingActionsRounded />}
            tone="warning"
          />
          <SummaryCard
            caption="Overdue"
            title={String(overdueCount)}
            subtitle={overdueCount === 0 ? "None overdue" : "Past due date"}
            icon={<WarningAmberRounded />}
            tone={overdueCount > 0 ? "error" : "muted"}
          />
        </Box>

        {/* Invoice table */}
        <MaterialReactTable
          columns={columns}
          data={filtered}
          enableColumnFilters
          enableDensityToggle={false}
          enableFullScreenToggle={false}
          enableHiding={false}
          enableRowActions
          enableSorting
          enableStickyHeader
          getRowId={(row) => row.id}
          initialState={{
            pagination: { pageIndex: 0, pageSize: 15 },
            showColumnFilters: true,
            sorting: [{ id: "dates", desc: true }],
          }}
          positionActionsColumn="last"
          muiSearchTextFieldProps={{
            placeholder: "Search by invoice no., student, batch…",
            size: "small",
            sx: { minWidth: { xs: "100%", md: 320 } },
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
              opacity: row.original.status === "paid" ? 0.72 : 1,
              bgcolor: "#ffffff",
              transition:
                "background-color 140ms ease, transform 140ms ease, box-shadow 140ms ease",
              "&:hover td": {
                bgcolor:
                  row.original.status === "overdue"
                    ? alpha("#fef2f2", 0.9)
                    : alpha("#f0f9ff", 0.9),
              },
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: `inset 0 0 0 1px ${alpha("#3b82f6", 0.1)}`,
              },
            },
          })}
          muiTableBodyCellProps={{
            sx: {
              bgcolor: "#ffffff",
              borderBottom: "1px solid",
              borderColor: alpha("#0f172a", 0.06),
              py: 2,
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
              py: 1.5,
              bgcolor: "#ffffff",
              borderBottom: "1px solid",
              borderColor: alpha("#0f172a", 0.08),
              flexWrap: "wrap",
              gap: 1,
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
              <Typography variant="subtitle1" fontWeight={700}>
                No invoices in this category
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Invoices are created automatically when students are admitted.
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
              <Tooltip
                title={
                  row.original.status === "paid"
                    ? "Invoice fully paid"
                    : "Record payment"
                }
              >
                <span>
                  <IconButton
                    size="small"
                    disabled={row.original.status === "paid"}
                    onClick={() => setPaymentTarget(row.original)}
                    sx={{
                      bgcolor: alpha("#2563eb", 0.08),
                      color: "#1d4ed8",
                      "&.Mui-disabled": { bgcolor: "transparent", opacity: 0.38 },
                    }}
                  >
                    <AccountBalanceWalletRounded fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Payment history">
                <IconButton
                  size="small"
                  onClick={() => setHistoryTarget(row.original)}
                  sx={{ bgcolor: alpha("#0f172a", 0.04) }}
                >
                  <HistoryRounded fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
          renderTopToolbarCustomActions={() => (
            <Tabs
              value={activeTab}
              onChange={(_, v: InvoiceStatus | "all") => setActiveTab(v)}
              sx={{ minHeight: 36 }}
            >
              {TAB_VALUES.map((tab) => (
                <Tab
                  key={tab}
                  value={tab}
                  label={`${TAB_LABELS[tab]} (${tabCount(tab)})`}
                  sx={{ minHeight: 36, py: 0, fontSize: 13 }}
                />
              ))}
            </Tabs>
          )}
        />
      </Stack>

      {paymentTarget && (
        <PaymentPage
          invoice={paymentTarget}
          onClose={() => setPaymentTarget(null)}
          onSubmit={handleRecordPayment}
        />
      )}

      {historyTarget && (
        <PaymentHistoryDialog
          invoice={historyTarget}
          onClose={() => setHistoryTarget(null)}
        />
      )}
    </>
  );
}
