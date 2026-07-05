"use client";

import {
  AccountBalanceWalletRounded,
  CalendarMonthRounded,
  EventAvailableRounded,
  HourglassBottomRounded,
  PaidRounded,
  SchoolRounded,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  alpha,
} from "@mui/material";
import { SummaryCard } from "@/components/ui";

// ── Dummy data ──────────────────────────────────────────────────────────────
// Illustrative earnings for online-batch teaching. Replace with a teacher
// payouts API (e.g. getMyTeacherPayouts) once the backend exposes it.

const RATE_PER_SESSION = 500; // ৳ per class taken

type PayoutStatus = "paid" | "pending" | "upcoming";

type Payout = {
  id: string;
  period: string;
  batchName: string;
  sessions: number;
  amount: number;
  status: PayoutStatus;
  date: string; // paid-on for history, due date for upcoming
  method?: string;
};

const PAYMENT_HISTORY: Payout[] = [
  {
    id: "p-2026-06",
    period: "June 2026",
    batchName: "Learn Python · 1",
    sessions: 12,
    amount: 12 * RATE_PER_SESSION,
    status: "paid",
    date: "2026-07-02",
    method: "bKash",
  },
  {
    id: "p-2026-05",
    period: "May 2026",
    batchName: "Learn Python · 1",
    sessions: 12,
    amount: 12 * RATE_PER_SESSION,
    status: "paid",
    date: "2026-06-03",
    method: "Bank transfer",
  },
  {
    id: "p-2026-04",
    period: "April 2026",
    batchName: "Learn Python · 1",
    sessions: 10,
    amount: 10 * RATE_PER_SESSION,
    status: "paid",
    date: "2026-05-04",
    method: "bKash",
  },
];

const UPCOMING_PAYMENTS: Payout[] = [
  {
    id: "u-2026-07",
    period: "July 2026",
    batchName: "Learn Python · 1",
    sessions: 8,
    amount: 8 * RATE_PER_SESSION,
    status: "pending",
    date: "2026-08-02",
    method: "bKash",
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

const formatTk = (amount: number) => `৳${amount.toLocaleString("en-BD")}`;

const formatDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const STATUS_META: Record<
  PayoutStatus,
  { label: string; color: "success" | "warning" | "default" }
> = {
  paid: { label: "Paid", color: "success" },
  pending: { label: "Pending", color: "warning" },
  upcoming: { label: "Upcoming", color: "default" },
};

// ── Table ───────────────────────────────────────────────────────────────────

function PayoutTable({
  rows,
  dateHeader,
  emptyText,
}: {
  rows: Payout[];
  dateHeader: string;
  emptyText: string;
}) {
  if (rows.length === 0) {
    return (
      <Box sx={{ py: 5, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          {emptyText}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ overflowX: "auto" }}>
      <Table size="small" sx={{ minWidth: 640 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: alpha("#0f172a", 0.02) }}>
            {["Period", "Batch", "Sessions", "Amount", dateHeader, "Status"].map(
              (h, i) => (
                <TableCell
                  key={h}
                  align={i === 2 || i === 3 ? "right" : "left"}
                  sx={{
                    fontWeight: 700,
                    fontSize: 11,
                    color: "text.secondary",
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                    py: 1.5,
                  }}
                >
                  {h}
                </TableCell>
              ),
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => {
            const status = STATUS_META[row.status];
            return (
              <TableRow key={row.id} hover>
                <TableCell sx={{ py: 1.5 }}>
                  <Typography variant="body2" fontWeight={700}>
                    {row.period}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{row.batchName}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Chip
                    label={row.sessions}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 700, height: 22 }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={700}>
                    {formatTk(row.amount)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack spacing={0.25}>
                    <Typography variant="body2">
                      {formatDate(row.date)}
                    </Typography>
                    {row.method ? (
                      <Typography variant="caption" color="text.secondary">
                        {row.method}
                      </Typography>
                    ) : null}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip
                    label={status.label}
                    size="small"
                    color={status.color}
                    variant={row.status === "paid" ? "filled" : "outlined"}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}

function SectionCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{ px: 3, py: 2, borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Box sx={{ color: "text.secondary", display: "flex" }}>{icon}</Box>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          ) : null}
        </Box>
      </Stack>
      <Box sx={{ px: { xs: 1.5, md: 2 }, py: 1 }}>{children}</Box>
    </Paper>
  );
}

// ── Workspace ────────────────────────────────────────────────────────────────

export function TeacherPaymentsWorkspace() {
  const totalEarned = PAYMENT_HISTORY.filter((p) => p.status === "paid").reduce(
    (sum, p) => sum + p.amount,
    0,
  );
  const pendingAmount = UPCOMING_PAYMENTS.reduce((sum, p) => sum + p.amount, 0);
  const sessionsTaught = [...PAYMENT_HISTORY, ...UPCOMING_PAYMENTS].reduce(
    (sum, p) => sum + p.sessions,
    0,
  );

  const nextPayout = UPCOMING_PAYMENTS[0];

  return (
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
          Payments &amp; Earnings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          Track your payouts from online batches, upcoming payments, and the
          total classes you have taught.
        </Typography>
      </Paper>

      {/* KPIs */}
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
          caption="Total earned"
          title={formatTk(totalEarned)}
          icon={<PaidRounded />}
          tone="success"
        />
        <SummaryCard
          caption="Pending payout"
          title={formatTk(pendingAmount)}
          icon={<HourglassBottomRounded />}
          tone="warning"
        />
        <SummaryCard
          caption="Sessions taught"
          title={String(sessionsTaught)}
          icon={<SchoolRounded />}
        />
        <SummaryCard
          caption="Rate / session"
          title={formatTk(RATE_PER_SESSION)}
          icon={<AccountBalanceWalletRounded />}
          tone="muted"
        />
      </Box>

      {nextPayout ? (
        <Alert
          severity="info"
          icon={<CalendarMonthRounded fontSize="inherit" />}
          sx={{ fontSize: 14 }}
        >
          Next payout of <strong>{formatTk(nextPayout.amount)}</strong> for{" "}
          <strong>{nextPayout.period}</strong> ({nextPayout.sessions} sessions)
          is due on <strong>{formatDate(nextPayout.date)}</strong>.
        </Alert>
      ) : null}

      {/* Upcoming payments */}
      <SectionCard
        icon={<EventAvailableRounded />}
        title="Upcoming Payments"
        subtitle="Payouts accrued this period, not yet paid"
      >
        <PayoutTable
          rows={UPCOMING_PAYMENTS}
          dateHeader="Due"
          emptyText="No upcoming payments."
        />
      </SectionCard>

      {/* Payment history */}
      <SectionCard
        icon={<PaidRounded />}
        title="Payment History"
        subtitle="Previous payouts you have received"
      >
        <PayoutTable
          rows={PAYMENT_HISTORY}
          dateHeader="Paid on"
          emptyText="No payments yet."
        />
      </SectionCard>

      <Typography variant="caption" color="text.disabled" sx={{ px: 1 }}>
        Figures shown are sample data for preview. Live payout tracking will
        appear here once teacher billing is connected.
      </Typography>
    </Stack>
  );
}
