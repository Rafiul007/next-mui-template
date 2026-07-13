"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  AccountBalanceWalletRounded,
  CheckCircleRounded,
  DescriptionRounded,
  PaidRounded,
  ReceiptLongRounded,
  RequestQuoteRounded,
  SavingsRounded,
} from "@mui/icons-material";
import { useQuery } from "@apollo/client/react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  alpha,
} from "@mui/material";
import CloseRounded from "@mui/icons-material/CloseRounded";
import {
  GetMyPayrollRunsDocument,
  GetMyPayrollSummaryDocument,
  GetMyPayslipsDocument,
  GetMySalaryStructureDocument,
  type GetMyPayrollRunsQuery,
  type GetMyPayslipsQuery,
} from "@/graphql/generated";
import { SummaryCard } from "@/components/ui";
import { payrollStatusMeta } from "@/lib/payroll/status";

type Payslip = GetMyPayslipsQuery["getMyPayslips"][number];
type PayrollRun = GetMyPayrollRunsQuery["getMyPayrollRuns"][number];

// ── Helpers ─────────────────────────────────────────────────────────────────

const formatTk = (amount: number) =>
  `৳${amount.toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;

// Runs carry a numeric month (1-12) and year; format to "June 2026".
const runPeriod = (run?: PayrollRun) =>
  run
    ? dayjs(`${run.year}-${String(run.month).padStart(2, "0")}-01`).format(
        "MMMM YYYY",
      )
    : "—";

// ── Reusable section shell ───────────────────────────────────────────────────

function SectionCard({
  icon,
  title,
  subtitle,
  action,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
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
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        {action}
      </Stack>
      {children}
    </Paper>
  );
}

// ── Payslip detail dialog ─────────────────────────────────────────────────────

function BreakdownRow({
  label,
  value,
  strong,
  tone,
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: "default" | "negative";
}) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography
        variant="body2"
        color={strong ? "text.primary" : "text.secondary"}
        fontWeight={strong ? 700 : 400}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={strong ? 800 : 600}
        color={tone === "negative" ? "error.main" : "text.primary"}
      >
        {value}
      </Typography>
    </Stack>
  );
}

function PayslipDialog({
  payslip,
  run,
  onClose,
}: {
  payslip: Payslip | null;
  run?: PayrollRun;
  onClose: () => void;
}) {
  const open = payslip != null;
  const meta = payrollStatusMeta(run?.status);
  const gross = payslip ? payslip.basicSalary + payslip.allowances : 0;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      {payslip ? (
        <>
          <Box
            sx={{
              px: 3,
              py: 2.5,
              color: "#fff",
              background:
                "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)",
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="overline" sx={{ opacity: 0.85, letterSpacing: 1 }}>
                  Payslip
                </Typography>
                <Typography variant="h6" fontWeight={800}>
                  {runPeriod(run)}
                </Typography>
              </Box>
              <IconButton size="small" onClick={onClose} sx={{ color: "#fff" }}>
                <CloseRounded fontSize="small" />
              </IconButton>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
              <Chip
                label={meta.employeeLabel}
                size="small"
                sx={{
                  bgcolor: alpha("#fff", 0.2),
                  color: "#fff",
                  fontWeight: 700,
                  height: 22,
                }}
              />
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                Ref #{payslip.id.slice(0, 8)}
              </Typography>
            </Stack>
          </Box>

          <DialogContent sx={{ px: 3, py: 2.5 }}>
            <Stack spacing={1.25}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                EARNINGS
              </Typography>
              <BreakdownRow label="Basic salary" value={formatTk(payslip.basicSalary)} />
              <BreakdownRow label="Allowances" value={formatTk(payslip.allowances)} />
              <BreakdownRow label="Gross" value={formatTk(gross)} strong />

              <Divider sx={{ my: 1 }} />

              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                DEDUCTIONS
              </Typography>
              <BreakdownRow
                label="Taxable income"
                value={formatTk(payslip.taxableIncome)}
              />
              <BreakdownRow
                label="Tax"
                value={`− ${formatTk(payslip.taxes)}`}
                tone="negative"
              />
              <BreakdownRow
                label="Other deductions"
                value={`− ${formatTk(payslip.deductions)}`}
                tone="negative"
              />

              <Divider sx={{ my: 1 }} />

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha("#14b8a6", 0.1),
                }}
              >
                <Typography variant="subtitle2" fontWeight={700}>
                  Net pay
                </Typography>
                <Typography variant="h5" fontWeight={800} color="success.main">
                  {formatTk(payslip.netAmount)}
                </Typography>
              </Stack>
            </Stack>
          </DialogContent>
        </>
      ) : null}
    </Dialog>
  );
}

// ── Workspace ────────────────────────────────────────────────────────────────

// Employee self-service payroll. Reads the caller-scoped getMy* queries, so it
// works for any signed-in employee (teacher, HR staff, admin) without knowing
// their employee id. Mounted from the teacher, HR, and admin self-service pages.
export function MyPayrollWorkspace() {
  const currentYear = dayjs().year();
  const [year, setYear] = useState(currentYear);
  const [selected, setSelected] = useState<Payslip | null>(null);

  const { data: structureData, loading: structureLoading } = useQuery(
    GetMySalaryStructureDocument,
    { fetchPolicy: "cache-and-network", errorPolicy: "all" },
  );
  const { data: payslipData, loading: payslipLoading } = useQuery(
    GetMyPayslipsDocument,
    { fetchPolicy: "cache-and-network", errorPolicy: "all" },
  );
  const { data: runsData } = useQuery(GetMyPayrollRunsDocument, {
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  });
  const { data: summaryData, loading: summaryLoading } = useQuery(
    GetMyPayrollSummaryDocument,
    { variables: { year }, fetchPolicy: "cache-and-network", errorPolicy: "all" },
  );

  const structure = structureData?.getMySalaryStructure ?? null;
  const payslips = useMemo(
    () => payslipData?.getMyPayslips ?? [],
    [payslipData],
  );
  const runs = useMemo(() => runsData?.getMyPayrollRuns ?? [], [runsData]);
  const summary = summaryData?.getMyPayrollSummary ?? null;

  // Index runs by id so each payslip can resolve its period + status.
  const runById = useMemo(() => {
    const map = new Map<string, PayrollRun>();
    runs.forEach((r) => map.set(r.id, r));
    return map;
  }, [runs]);

  // Years the employee actually has runs in, plus the current year, newest first.
  const availableYears = useMemo(() => {
    const set = new Set<number>([currentYear]);
    runs.forEach((r) => set.add(r.year));
    return Array.from(set).sort((a, b) => b - a);
  }, [runs, currentYear]);

  // Payslips for the selected year, newest first (by run period).
  const yearPayslips = useMemo(() => {
    return payslips
      .filter((p) => runById.get(p.payrollRunId)?.year === year)
      .sort((a, b) => {
        const ra = runById.get(a.payrollRunId);
        const rb = runById.get(b.payrollRunId);
        return (rb?.month ?? 0) - (ra?.month ?? 0);
      });
  }, [payslips, runById, year]);

  const netPaid = summary?.totalNetAmount ?? 0;
  const payslipCount = summary?.payslipCount ?? 0;
  const totalTaxes = summary?.totalTaxes ?? 0;
  const totalDeductions = summary?.totalDeductions ?? 0;

  const loadingKpis = summaryLoading && !summary;

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
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography variant="h4" component="h1">
              Payments &amp; Payroll
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              Your salary structure, payslips, and payroll history.
            </Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: 120, alignSelf: "flex-start" }}>
            <InputLabel>Tax year</InputLabel>
            <Select
              label="Tax year"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {availableYears.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* KPIs — from getMyPayrollSummary for the selected year */}
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
          caption={`Net paid · ${year}`}
          title={loadingKpis ? "…" : formatTk(netPaid)}
          icon={<PaidRounded />}
          tone="success"
        />
        <SummaryCard
          caption={`Payslips · ${year}`}
          title={loadingKpis ? "…" : String(payslipCount)}
          icon={<ReceiptLongRounded />}
        />
        <SummaryCard
          caption={`Tax · ${year}`}
          title={loadingKpis ? "…" : formatTk(totalTaxes)}
          icon={<RequestQuoteRounded />}
          tone="warning"
        />
        <SummaryCard
          caption={`Deductions · ${year}`}
          title={loadingKpis ? "…" : formatTk(totalDeductions)}
          icon={<AccountBalanceWalletRounded />}
          tone="muted"
        />
      </Box>

      {/* Salary structure */}
      <SectionCard
        icon={<SavingsRounded />}
        title="Salary Structure"
        subtitle="Your current monthly pay rates"
      >
        {structureLoading && !structure ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <CircularProgress size={22} />
          </Box>
        ) : structure ? (
          <Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
              }}
            >
              {[
                { label: "Basic salary", value: structure.basicSalary },
                { label: "Allowances", value: structure.allowances ?? 0 },
                { label: "Deductions", value: structure.deductions ?? 0 },
              ].map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    p: 3,
                    borderRight: { md: "1px solid" },
                    borderBottom: { xs: "1px solid", md: "none" },
                    borderColor: { xs: "divider", md: "divider" },
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {item.label}
                  </Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
                    {formatTk(item.value)}
                  </Typography>
                </Box>
              ))}
              <Box
                sx={{
                  p: 3,
                  bgcolor: alpha("#14b8a6", 0.08),
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Net salary
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight={800}
                  color="success.main"
                  sx={{ mt: 0.5 }}
                >
                  {formatTk(structure.netSalary)}
                </Typography>
              </Box>
            </Box>
            {structure.effectiveFrom ? (
              <Typography
                variant="caption"
                color="text.disabled"
                sx={{ display: "block", px: 3, py: 1.5 }}
              >
                Effective from{" "}
                {dayjs(structure.effectiveFrom).format("DD MMM YYYY")}
              </Typography>
            ) : null}
          </Box>
        ) : (
          <Box sx={{ p: 3 }}>
            <Alert severity="info">
              No salary structure has been set for your account yet. Contact HR to
              get your pay rates configured.
            </Alert>
          </Box>
        )}
      </SectionCard>

      {/* Payslips */}
      <SectionCard
        icon={<DescriptionRounded />}
        title="Payslips"
        subtitle={`Payroll history for ${year} — tap a row for the full breakdown`}
      >
        {payslipLoading && payslips.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <CircularProgress size={22} />
          </Box>
        ) : yearPayslips.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center", px: 3 }}>
            <ReceiptLongRounded
              sx={{ fontSize: 40, color: "text.disabled", mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              No payslips for {year}. They appear here once HR processes a payroll
              run you are part of.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small" sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha("#0f172a", 0.02) }}>
                  {["Period", "Status", "Basic", "Allowances", "Tax", "Net pay", ""].map(
                    (h, i) => (
                      <TableCell
                        key={h || "chevron"}
                        align={i >= 2 && i <= 5 ? "right" : "left"}
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
                {yearPayslips.map((p) => {
                  const run = runById.get(p.payrollRunId);
                  const meta = payrollStatusMeta(run?.status);
                  return (
                    <TableRow
                      key={p.id}
                      hover
                      onClick={() => setSelected(p)}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2" fontWeight={700}>
                          {runPeriod(run)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={meta.employeeLabel}
                          size="small"
                          color={meta.color}
                          variant={meta.variant}
                          icon={
                            meta.color === "success" ? (
                              <CheckCircleRounded sx={{ fontSize: 15 }} />
                            ) : undefined
                          }
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatTk(p.basicSalary)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatTk(p.allowances)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="error.main">
                          − {formatTk(p.taxes)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={800}>
                          {formatTk(p.netAmount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ color: "text.disabled" }}>
                        <ReceiptLongRounded sx={{ fontSize: 18 }} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        )}
      </SectionCard>

      <Typography variant="caption" color="text.disabled" sx={{ px: 1 }}>
        Payslips reflect fixed salary-structure payroll (basic + allowances −
        taxes − deductions). Per-session or commission pay is not included.
      </Typography>

      <PayslipDialog
        payslip={selected}
        run={selected ? runById.get(selected.payrollRunId) : undefined}
        onClose={() => setSelected(null)}
      />
    </Stack>
  );
}
