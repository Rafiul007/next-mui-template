"use client";

import { useState } from "react";
import dayjs from "dayjs";
import {
  CheckCircleRounded,
  ReceiptRounded,
  WarningAmberRounded,
} from "@mui/icons-material";
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
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import { useQuery, useMutation } from "@apollo/client/react";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "@/lib/errors";
import {
  RecordStudentPaymentDocument,
} from "@/graphql/generated";
import {
  GetStudentInvoicesNewDocument,
  type StudentInvoiceNew,
} from "@/graphql/billing-new";
import type { PaymentEntry } from "./AdmissionFormDialog";

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

// ── Props ─────────────────────────────────────────────────────────────────────

type Props = {
  open: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  batchId: string;
  batchName: string;
  enrollmentId: string;
  oneTimeFees: PaymentEntry[];
  monthlyFees: PaymentEntry[];
};

// ── InvoiceCard (per invoice) ─────────────────────────────────────────────────

function InvoiceCard({
  invoice,
  studentId,
  onPaymentDone,
}: {
  invoice: StudentInvoiceNew;
  studentId: string;
  onPaymentDone: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("CASH");
  const [payRef, setPayRef] = useState("");
  const [payRemarks, setPayRemarks] = useState("");
  const [payError, setPayError] = useState<string | null>(null);

  const [recordPayment, { loading: isPaying }] = useMutation(RecordStudentPaymentDocument);

  const remaining = invoice.total - invoice.paidAmount;
  const isPaid = invoice.status === "PAID" || remaining <= 0;

  const openPay = () => {
    setPayAmount(String(Math.max(0, remaining)));
    setPayMethod("CASH");
    setPayRef("");
    setPayRemarks("");
    setPayError(null);
    setIsExpanded(true);
  };

  const handleConfirm = async () => {
    const amount = parseFloat(payAmount);
    if (!amount || amount <= 0) { setPayError("Enter a valid amount."); return; }
    setPayError(null);
    try {
      await recordPayment({
        variables: {
          payment: {
            invoiceId: invoice.id,
            studentId,
            amount,
            method: payMethod,
            transactionRef: payRef.trim() || `CASH-${Date.now()}`,
            remarks: payRemarks.trim() || undefined,
          },
        },
      });
      toast.success("Payment recorded.");
      setIsExpanded(false);
      onPaymentDone();
    } catch (err) {
      setPayError(getErrorMessage(err, "Failed to record payment."));
    }
  };

  return (
    <Box sx={{ px: 3, py: 2.5 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
        <Stack spacing={0.4}>
          <Stack direction="row" spacing={1} alignItems="center">
            <ReceiptRounded sx={{ fontSize: 16, color: "primary.main" }} />
            <Typography variant="body2" fontWeight={700}>
              Invoice — {dayjs(invoice.month, "YYYY-MM").format("MMMM YYYY")}
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Due {dayjs(invoice.dueDate).format("DD MMM YYYY")}
          </Typography>
        </Stack>
        <Chip
          label={STATUS_LABEL[invoice.status] ?? invoice.status}
          size="small"
          color={STATUS_COLOR[invoice.status] ?? "default"}
          variant={isPaid ? "filled" : "outlined"}
        />
      </Stack>

      {/* Line items */}
      {invoice.lineItems.length > 0 && (
        <Stack spacing={0.5} mb={1.5}>
          {invoice.lineItems.map((item, i) => (
            <Stack key={i} direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">{item.description}</Typography>
              <Typography variant="body2">{formatAmount(item.amount)}</Typography>
            </Stack>
          ))}
        </Stack>
      )}

      {/* Totals */}
      <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: alpha("#f8fafc", 0.9), border: "1px solid", borderColor: "divider" }}>
        <Stack spacing={0.5}>
          {invoice.discountAmount > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="success.main">Discount</Typography>
              <Typography variant="caption" color="success.main" fontWeight={600}>−{formatAmount(invoice.discountAmount)}</Typography>
            </Stack>
          )}
          {invoice.fineAmount > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="error.main">Late fine</Typography>
              <Typography variant="caption" color="error.main" fontWeight={600}>+{formatAmount(invoice.fineAmount)}</Typography>
            </Stack>
          )}
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" fontWeight={700}>Total</Typography>
            <Typography variant="body2" fontWeight={700}>{formatAmount(invoice.total)}</Typography>
          </Stack>
          {invoice.paidAmount > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="success.main">Paid</Typography>
              <Typography variant="caption" color="success.main" fontWeight={600}>{formatAmount(invoice.paidAmount)}</Typography>
            </Stack>
          )}
          {!isPaid && remaining > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" fontWeight={700} color="error.main">Remaining</Typography>
              <Typography variant="caption" fontWeight={700} color="error.main">{formatAmount(remaining)}</Typography>
            </Stack>
          )}
        </Stack>
      </Box>

      {/* Paid confirmation */}
      {isPaid && (
        <Stack direction="row" spacing={0.75} alignItems="center" mt={1.5}>
          <CheckCircleRounded sx={{ fontSize: 16, color: "success.main" }} />
          <Typography variant="caption" color="success.main" fontWeight={600}>Payment complete</Typography>
        </Stack>
      )}

      {/* Payment form */}
      {!isPaid && (
        <Box mt={1.5}>
          {!isExpanded ? (
            <Button size="small" variant="outlined" fullWidth onClick={openPay}>
              Record payment
            </Button>
          ) : (
            <Stack spacing={1.5}>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                Record Payment
              </Typography>
              {payError && <Alert severity="error" sx={{ py: 0.5 }}>{payError}</Alert>}
              <Stack direction="row" spacing={1.5}>
                <TextField
                  label="Amount (৳)"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  size="small"
                  type="number"
                  inputProps={{ min: 0, step: 1 }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Method"
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
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
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
                size="small"
                placeholder="Optional for cash"
                fullWidth
              />
              <TextField
                label="Remarks (optional)"
                value={payRemarks}
                onChange={(e) => setPayRemarks(e.target.value)}
                size="small"
                fullWidth
              />
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button size="small" color="inherit" onClick={() => setIsExpanded(false)} disabled={isPaying}>Cancel</Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleConfirm}
                  disabled={isPaying}
                  startIcon={isPaying ? <CircularProgress size={13} color="inherit" /> : undefined}
                >
                  {isPaying ? "Saving…" : "Confirm payment"}
                </Button>
              </Stack>
            </Stack>
          )}
        </Box>
      )}
    </Box>
  );
}

// ── AdmissionInvoiceDialog ────────────────────────────────────────────────────

export function AdmissionInvoiceDialog({
  open,
  onClose,
  studentId,
  studentName,
  batchId,
  batchName,
  enrollmentId,
  oneTimeFees,
  monthlyFees,
}: Props) {
  const {
    data: invoicesData,
    loading: invoicesLoading,
    refetch: refetchInvoices,
  } = useQuery(GetStudentInvoicesNewDocument, {
    variables: { studentId },
    skip: !open || !studentId,
    fetchPolicy: "cache-and-network",
  });

  const allInvoices = invoicesData?.getStudentInvoices ?? [];
  const batchInvoices = allInvoices.filter((inv) => inv.batchId === batchId);
  const hasAnyInvoice = batchInvoices.length > 0;
  const hasFees = oneTimeFees.length > 0 || monthlyFees.length > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <ReceiptRounded sx={{ color: "primary.main" }} />
          <Stack spacing={0}>
            <Typography variant="subtitle1" fontWeight={700}>Invoice & Payment</Typography>
            <Typography variant="caption" color="text.secondary">
              {studentName} — {batchName}
            </Typography>
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {invoicesLoading && !hasAnyInvoice ? (
          <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Stack>
            {/* No invoices yet */}
            {!hasAnyInvoice && (
              <Box sx={{ px: 3, py: 3 }}>
                {hasFees ? (
                  <Stack spacing={2.5}>
                    <Alert severity="info" icon={<WarningAmberRounded fontSize="small" />}>
                      No invoices found for this batch yet. Invoices will appear here once they are generated by the system.
                    </Alert>

                    {oneTimeFees.length > 0 && (
                      <Stack spacing={1}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                          Admission fees (one-time)
                        </Typography>
                        {oneTimeFees.map((fee, i) => (
                          <Stack key={i} direction="row" justifyContent="space-between">
                            <Typography variant="body2">{fee.name}</Typography>
                            <Typography variant="body2" fontWeight={600}>{formatAmount(fee.amount)}</Typography>
                          </Stack>
                        ))}
                        <Stack direction="row" justifyContent="space-between" sx={{ pt: 0.75, borderTop: "1px dashed", borderColor: "divider" }}>
                          <Typography variant="body2" fontWeight={700}>Admission total</Typography>
                          <Typography variant="body2" fontWeight={700}>
                            {formatAmount(oneTimeFees.reduce((s, f) => s + f.amount, 0))}
                          </Typography>
                        </Stack>
                      </Stack>
                    )}

                    {monthlyFees.length > 0 && (
                      <Stack spacing={1}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                          Monthly fees (recurring)
                        </Typography>
                        {monthlyFees.map((fee, i) => (
                          <Stack key={i} direction="row" justifyContent="space-between">
                            <Typography variant="body2">{fee.name}</Typography>
                            <Typography variant="body2" fontWeight={600}>{formatAmount(fee.amount)}/mo</Typography>
                          </Stack>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                ) : (
                  <Alert severity="warning">
                    No fees configured for this batch.
                  </Alert>
                )}
              </Box>
            )}

            {/* All batch invoices */}
            {hasAnyInvoice && (
              <Stack divider={<Divider />}>
                {batchInvoices
                  .slice()
                  .sort((a, b) => b.month.localeCompare(a.month))
                  .map((inv) => (
                    <InvoiceCard
                      key={inv.id}
                      invoice={inv}
                      studentId={studentId}
                      onPaymentDone={refetchInvoices}
                    />
                  ))}
              </Stack>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button color="inherit" onClick={onClose}>
          {hasAnyInvoice ? "Close" : "Skip for now"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
