"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { CloseRounded } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import { useMutation } from "@apollo/client/react";
import { toast } from "react-hot-toast";
import { RecordStudentPaymentDocument } from "@/graphql/generated";
import { getErrorMessage } from "@/lib/errors";
import { MethodSelect, formatAmount } from "./billing-shared";

export type PaymentTarget = {
  invoiceId: string;
  studentId: string;
  total: number;
  paidAmount: number;
  discountAmount?: number;
  fineAmount?: number;
  month?: string;
};

export function RecordPaymentDialog({
  target,
  studentName,
  batchName,
  onClose,
  onSuccess,
}: {
  target: PaymentTarget;
  studentName: string;
  batchName: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const remaining = Math.max(0, target.total - target.paidAmount);
  const [amount, setAmount] = useState(String(remaining));
  const [method, setMethod] = useState("CASH");
  const [ref, setRef] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [recordPayment, { loading }] = useMutation(RecordStudentPaymentDocument);

  const handleConfirm = async () => {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (parsed > remaining + 0.01) {
      setError(`Amount exceeds the ${formatAmount(remaining)} balance due.`);
      return;
    }
    setError(null);
    try {
      await recordPayment({
        variables: {
          payment: {
            invoiceId: target.invoiceId,
            studentId: target.studentId,
            amount: parsed,
            method,
            transactionRef: ref.trim() || `${method}-${Date.now()}`,
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
              {studentName}
              {batchName ? ` · ${batchName}` : ""}
              {target.month
                ? ` · ${dayjs(target.month, "YYYY-MM").format("MMM YYYY")}`
                : ""}
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
                  {formatAmount(target.total)}
                </Typography>
              </Stack>
              {target.paidAmount > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="success.main">
                    Already paid
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    {formatAmount(target.paidAmount)}
                  </Typography>
                </Stack>
              )}
              <Divider sx={{ my: 0.5 }} />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" fontWeight={700} color="error.main">
                  Balance due
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
            <MethodSelect value={method} onChange={setMethod} sx={{ flex: 1 }} />
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
            <Button size="small" color="inherit" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleConfirm}
              disabled={loading}
              startIcon={
                loading ? <CircularProgress size={13} color="inherit" /> : undefined
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
