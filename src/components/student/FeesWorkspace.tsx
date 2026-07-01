"use client";

import { useState } from "react";
import dayjs from "dayjs";
import {
  AccountBalanceWalletRounded,
  CheckCircleRounded,
  DescriptionRounded,
  ExpandLessRounded,
  ExpandMoreRounded,
  WarningAmberRounded,
} from "@mui/icons-material";
import {
  Box,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { useQuery } from "@apollo/client/react";
import { MyInvoicesDocument, type MyInvoice } from "@/graphql/student-portal";
import { SummaryCard } from "@/components/ui";

const STATUS_COLOR: Record<string, "default" | "warning" | "success" | "error" | "info"> = {
  ISSUED: "default",
  PARTIALLY_PAID: "warning",
  OVERDUE: "error",
  PAID: "success",
  WAIVED: "info",
  DRAFT: "default",
  PENDING_WAIVER: "default",
};

const STATUS_LABEL: Record<string, string> = {
  ISSUED: "Unpaid",
  PARTIALLY_PAID: "Partial",
  OVERDUE: "Overdue",
  PAID: "Paid",
  WAIVED: "Waived",
  DRAFT: "Draft",
  PENDING_WAIVER: "Pending Waiver",
};

const formatAmount = (n: number) =>
  `৳${n.toLocaleString("en-BD", { minimumFractionDigits: 0 })}`;

function InvoiceRow({ invoice }: { invoice: MyInvoice }) {
  const [expanded, setExpanded] = useState(false);
  const remaining = invoice.total - invoice.paidAmount;
  const isPaid = ["PAID", "WAIVED"].includes(invoice.status);
  const isOverdue = invoice.status === "OVERDUE";

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: isOverdue
          ? alpha("#ef4444", 0.3)
          : isPaid
            ? alpha("#2563eb", 0.2)
            : "divider",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
          bgcolor: isOverdue
            ? alpha("#fef2f2", 0.5)
            : isPaid
              ? alpha("#eff6ff", 0.5)
              : "transparent",
          cursor: invoice.lineItems.length > 0 ? "pointer" : "default",
        }}
        onClick={() => invoice.lineItems.length > 0 && setExpanded((p) => !p)}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" fontWeight={700}>
              {dayjs(invoice.month, "YYYY-MM").format("MMMM YYYY")}
            </Typography>
            <Chip
              label={STATUS_LABEL[invoice.status] ?? invoice.status}
              size="small"
              color={STATUS_COLOR[invoice.status] ?? "default"}
              variant={isOverdue ? "filled" : "outlined"}
            />
          </Stack>
          {invoice.dueDate && (
            <Typography variant="caption" color="text.secondary">
              Due: {dayjs(invoice.dueDate).format("D MMM YYYY")}
            </Typography>
          )}
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="body2" fontWeight={700}>
              {formatAmount(invoice.total)}
            </Typography>
            {!isPaid && remaining > 0 && (
              <Typography variant="caption" color="error.main">
                Remaining: {formatAmount(remaining)}
              </Typography>
            )}
            {isPaid && invoice.paidAmount > 0 && (
              <Typography variant="caption" color="success.main">
                Paid: {formatAmount(invoice.paidAmount)}
              </Typography>
            )}
          </Box>

          {invoice.lineItems.length > 0 && (
            <IconButton size="small">
              {expanded ? (
                <ExpandLessRounded fontSize="small" />
              ) : (
                <ExpandMoreRounded fontSize="small" />
              )}
            </IconButton>
          )}
        </Stack>
      </Box>

      {invoice.lineItems.length > 0 && (
        <Collapse in={expanded}>
          <Divider />
          <Box sx={{ p: 2, bgcolor: alpha("#f8fafc", 0.6) }}>
            <Stack spacing={0.75}>
              {invoice.lineItems.map((li, i) => (
                <Stack key={i} direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    {li.description}
                  </Typography>
                  <Typography variant="caption" fontWeight={600}>
                    {formatAmount(li.amount)}
                  </Typography>
                </Stack>
              ))}
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
              <Divider sx={{ my: 0.5 }} />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" fontWeight={700}>
                  Total
                </Typography>
                <Typography variant="caption" fontWeight={700}>
                  {formatAmount(invoice.total)}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Collapse>
      )}
    </Box>
  );
}

export function FeesWorkspace() {
  const { data, loading } = useQuery(MyInvoicesDocument);

  const invoices = [...(data?.myInvoices ?? [])].sort((a, b) =>
    b.month.localeCompare(a.month),
  );

  const outstanding = invoices.filter(
    (inv) => !["PAID", "WAIVED"].includes(inv.status),
  );
  const paid = invoices.filter((inv) => ["PAID", "WAIVED"].includes(inv.status));
  const overdueCount = invoices.filter((inv) => inv.status === "OVERDUE").length;
  const totalOutstanding = outstanding.reduce(
    (s, inv) => s + (inv.total - inv.paidAmount),
    0,
  );
  const totalPaid = invoices.reduce((s, inv) => s + inv.paidAmount, 0);

  return (
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
        <Stack direction="row" spacing={1.5} alignItems="center">
          <DescriptionRounded sx={{ color: "primary.main" }} />
          <Box>
            <Typography variant="h4" component="h1">
              My Fees
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Invoice history and payment status
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Summary */}
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
              tone={overdueCount > 0 ? "error" : totalOutstanding > 0 ? "warning" : "success"}
            />
            <SummaryCard
              caption="Total paid"
              title={formatAmount(totalPaid)}
              icon={<CheckCircleRounded />}
              tone="success"
            />
            <SummaryCard
              caption="Overdue invoices"
              title={String(overdueCount)}
              icon={<WarningAmberRounded />}
              tone={overdueCount > 0 ? "error" : "default"}
            />
          </Box>

          {/* Outstanding invoices */}
          {outstanding.length > 0 && (
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <WarningAmberRounded sx={{ color: "error.main", fontSize: 20 }} />
                <Typography variant="h6" fontWeight={700}>
                  Outstanding
                </Typography>
                <Chip
                  label={outstanding.length}
                  size="small"
                  color="error"
                  variant="outlined"
                />
              </Stack>
              <Stack spacing={1.5}>
                {outstanding.map((inv) => (
                  <InvoiceRow key={inv.id} invoice={inv} />
                ))}
              </Stack>
            </Stack>
          )}

          {/* Payment history */}
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <CheckCircleRounded sx={{ color: "success.main", fontSize: 20 }} />
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
            {paid.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No paid invoices yet.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {paid.map((inv) => (
                  <InvoiceRow key={inv.id} invoice={inv} />
                ))}
              </Stack>
            )}
          </Stack>
        </>
      )}
    </Stack>
  );
}
