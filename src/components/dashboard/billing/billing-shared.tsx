"use client";

// Shared constants, formatters, and small pickers used across every Billing &
// Payments screen so status colours, money formatting, and table chrome stay
// identical between Invoices, Collections, Transactions, and fee config.

import dayjs from "dayjs";
import { Chip, MenuItem, TextField, alpha } from "@mui/material";
import { SearchSelect } from "@/components/form";
import { batchSearchOptions } from "@/lib/search-options";

// ── Money ───────────────────────────────────────────────────────────────────

export const formatAmount = (n: number) =>
  `৳${(n ?? 0).toLocaleString("en-BD", { minimumFractionDigits: 0 })}`;

// ── Invoice status ──────────────────────────────────────────────────────────

// Must match backend InvoiceStatus enum exactly — DRAFT, ISSUED,
// PARTIALLY_PAID, PAID, OVERDUE, WAIVED, PENDING_WAIVER. The previous values
// here (UNPAID, PARTIAL, WAIVER_REQUESTED) never matched any real invoice,
// which silently broke the Pay button and the waiver-approve action for every
// partially-paid or waiver-requested invoice.
export type InvoiceStatus =
  | "DRAFT"
  | "ISSUED"
  | "PARTIALLY_PAID"
  | "OVERDUE"
  | "PAID"
  | "WAIVED"
  | "PENDING_WAIVER";

export const OUTSTANDING_STATUSES = new Set([
  "ISSUED",
  "PARTIALLY_PAID",
  "OVERDUE",
  "PENDING_WAIVER",
]);
export const PAID_STATUSES = new Set(["PAID", "WAIVED"]);

export const INVOICE_STATUS_COLOR: Record<
  string,
  "default" | "warning" | "success" | "error" | "info"
> = {
  DRAFT: "default",
  ISSUED: "default",
  PARTIALLY_PAID: "warning",
  OVERDUE: "error",
  PAID: "success",
  WAIVED: "info",
  PENDING_WAIVER: "info",
};

export const INVOICE_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  ISSUED: "Unpaid",
  PARTIALLY_PAID: "Partial",
  OVERDUE: "Overdue",
  PAID: "Paid",
  WAIVED: "Waived",
  PENDING_WAIVER: "Waiver requested",
};

export function InvoiceStatusChip({ status }: { status: string }) {
  return (
    <Chip
      label={INVOICE_STATUS_LABEL[status] ?? status}
      size="small"
      color={INVOICE_STATUS_COLOR[status] ?? "default"}
      variant={status === "OVERDUE" ? "filled" : "outlined"}
    />
  );
}

// ── Payment methods ─────────────────────────────────────────────────────────

export const PAYMENT_METHODS = [
  { label: "Cash", value: "CASH" },
  { label: "bKash", value: "BKASH" },
  { label: "Nagad", value: "NAGAD" },
  { label: "Rocket", value: "ROCKET" },
  { label: "Card", value: "CARD" },
  { label: "Bank transfer", value: "BANK_TRANSFER" },
  { label: "Cheque", value: "CHEQUE" },
  { label: "Other", value: "OTHER" },
];

export const paymentMethodLabel = (value: string) =>
  PAYMENT_METHODS.find((m) => m.value === value)?.label ?? value;

// ── Fee plan frequency ──────────────────────────────────────────────────────

export const FREQUENCY_OPTIONS = [
  { label: "Monthly", value: "MONTHLY" },
  { label: "One-time", value: "ONE_TIME" },
  { label: "Quarterly", value: "QUARTERLY" },
  { label: "Half-yearly", value: "HALF_YEARLY" },
  { label: "Yearly", value: "YEARLY" },
];

export const frequencyLabel = (value: string) =>
  FREQUENCY_OPTIONS.find((f) => f.value === value)?.label ?? value;

// ── Late fine type ──────────────────────────────────────────────────────────

// Must match backend LateFineType enum exactly (FIXED, PERCENTAGE_PER_DAY) —
// setLateFinePolicy does LateFineType.valueOf(fineType) and throws on anything else.
export const FINE_TYPE_OPTIONS = [
  { label: "Fixed amount", value: "FIXED" },
  { label: "Percentage per day overdue", value: "PERCENTAGE_PER_DAY" },
];

export const fineTypeLabel = (value: string) =>
  FINE_TYPE_OPTIONS.find((f) => f.value === value)?.label ?? value;

// ── Month helpers ───────────────────────────────────────────────────────────

export const currentMonth = () => dayjs().format("YYYY-MM");

export const monthLabel = (month: string) =>
  dayjs(month, "YYYY-MM").format("MMM YYYY");

export function MonthField({
  label = "Month",
  value,
  onChange,
  size = "small",
  fullWidth,
  sx,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  size?: "small" | "medium";
  fullWidth?: boolean;
  sx?: object;
}) {
  return (
    <TextField
      label={label}
      type="month"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size={size}
      fullWidth={fullWidth}
      slotProps={{ inputLabel: { shrink: true } }}
      sx={sx}
    />
  );
}

// ── Batch picker ────────────────────────────────────────────────────────────

type BatchLike = {
  id: string;
  name: string;
  classLevel?: string | null;
  courseName?: string | null;
  type?: string | null;
};

export function BatchPicker({
  batches,
  value,
  onChange,
  loading,
  label = "Batch",
}: {
  batches: readonly BatchLike[];
  value: string;
  onChange: (value: string) => void;
  loading?: boolean;
  label?: string;
}) {
  return (
    <SearchSelect
      label={label}
      placeholder="Search batch by name, class, or course…"
      options={batchSearchOptions(batches)}
      loading={loading}
      value={value}
      onChange={onChange}
    />
  );
}

// ── Method select (controlled, for payment dialogs) ─────────────────────────

export function MethodSelect({
  value,
  onChange,
  sx,
}: {
  value: string;
  onChange: (value: string) => void;
  sx?: object;
}) {
  return (
    <TextField
      label="Method"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size="small"
      select
      sx={sx}
    >
      {PAYMENT_METHODS.map((m) => (
        <MenuItem key={m.value} value={m.value}>
          {m.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

// ── Shared MaterialReactTable chrome ────────────────────────────────────────

export const sharedTableProps = {
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
  muiTableContainerProps: { sx: { maxHeight: 540 } },
  initialState: { pagination: { pageIndex: 0, pageSize: 20 } },
} as const;
