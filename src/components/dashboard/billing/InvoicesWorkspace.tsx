"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  AccountBalanceWalletRounded,
  CheckCircleRounded,
  DownloadRounded,
  GavelRounded,
  MoreVertRounded,
  PersonSearchRounded,
  PrintRounded,
  ReceiptLongRounded,
  TaskAltRounded,
  VisibilityRounded,
  WarningAmberRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { useMutation, useQuery } from "@apollo/client/react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { toast } from "react-hot-toast";
import {
  ApproveWaiverDocument,
  GetAllBatchesDocument,
  GetBatchInvoicesDocument,
  GetCenterDocument,
  GetStudentInvoicesDocument,
  GetStudentsDocument,
  RequestWaiverDocument,
  type GetStudentInvoicesQuery,
} from "@/graphql/generated";
import { getErrorMessage } from "@/lib/errors";
import { SearchSelect } from "@/components/form";
import { studentSearchOptions } from "@/lib/search-options";
import { SummaryCard } from "@/components/ui";
import {
  BatchPicker,
  InvoiceStatusChip,
  MonthField,
  OUTSTANDING_STATUSES,
  PAID_STATUSES,
  currentMonth,
  formatAmount,
  monthLabel,
  sharedTableProps,
} from "./billing-shared";
import { printInvoiceReceipt } from "./billing-print";
import { RecordPaymentDialog } from "./RecordPaymentDialog";
import { downloadPdf, viewPdf } from "@/lib/pdf-actions";

type Invoice = GetStudentInvoicesQuery["getStudentInvoices"][number];

// ── Row actions menu ──────────────────────────────────────────────────────────

function InvoiceRowMenu({
  invoice,
  onPay,
  onPrint,
  onRequestWaiver,
  onApproveWaiver,
  waiverBusy,
}: {
  invoice: Invoice;
  onPay: (i: Invoice) => void;
  onPrint: (i: Invoice) => void;
  onRequestWaiver: (i: Invoice) => void;
  onApproveWaiver: (i: Invoice) => void;
  waiverBusy: boolean;
}) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const close = () => setAnchor(null);

  const isOutstanding = OUTSTANDING_STATUSES.has(invoice.status);
  const isPaid = PAID_STATUSES.has(invoice.status);
  const isWaiverRequested = invoice.status === "PENDING_WAIVER";

  return (
    <>
      <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
        {isOutstanding && (
          <Button
            size="small"
            variant="contained"
            startIcon={<ReceiptLongRounded fontSize="small" />}
            onClick={() => onPay(invoice)}
          >
            Pay
          </Button>
        )}
        {isPaid && (
          <Tooltip title="Print receipt">
            <IconButton size="small" onClick={() => onPrint(invoice)}>
              <PrintRounded fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {invoice.pdfPath && (
          <>
            <Tooltip title="View invoice PDF">
              <IconButton size="small" onClick={() => viewPdf(invoice.pdfPath!)}>
                <VisibilityRounded fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download invoice PDF">
              <IconButton
                size="small"
                onClick={() => downloadPdf(invoice.pdfPath!, `invoice-${invoice.month}-${invoice.studentId}.pdf`)}
              >
                <DownloadRounded fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
        <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}>
          <MoreVertRounded fontSize="small" />
        </IconButton>
      </Stack>

      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={close}>
        <MenuItem
          onClick={() => {
            onPrint(invoice);
            close();
          }}
        >
          <ListItemIcon>
            <PrintRounded fontSize="small" />
          </ListItemIcon>
          <ListItemText>Print invoice</ListItemText>
        </MenuItem>
        {isOutstanding && !isWaiverRequested && (
          <MenuItem
            disabled={waiverBusy}
            onClick={() => {
              onRequestWaiver(invoice);
              close();
            }}
          >
            <ListItemIcon>
              <GavelRounded fontSize="small" />
            </ListItemIcon>
            <ListItemText>Request waiver</ListItemText>
          </MenuItem>
        )}
        {isWaiverRequested && (
          <MenuItem
            disabled={waiverBusy}
            onClick={() => {
              onApproveWaiver(invoice);
              close();
            }}
          >
            <ListItemIcon>
              <TaskAltRounded fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText>Approve waiver</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
}

// ── Columns ───────────────────────────────────────────────────────────────────

function useInvoiceColumns(opts: {
  showStudent: boolean;
  showBatch: boolean;
  studentLookup: Map<string, { name: string; code: string }>;
  batchLookup: Map<string, string>;
  onPay: (i: Invoice) => void;
  onPrint: (i: Invoice) => void;
  onRequestWaiver: (i: Invoice) => void;
  onApproveWaiver: (i: Invoice) => void;
  waiverBusy: boolean;
}): MRT_ColumnDef<Invoice>[] {
  const cols: MRT_ColumnDef<Invoice>[] = [];

  if (opts.showStudent) {
    cols.push({
      id: "student",
      header: "Student",
      size: 220,
      accessorFn: (r) => opts.studentLookup.get(r.studentId)?.name ?? r.studentId,
      Cell: ({ row }) => {
        const s = opts.studentLookup.get(row.original.studentId);
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
    });
  }

  if (opts.showBatch) {
    cols.push({
      id: "batch",
      header: "Batch",
      size: 170,
      accessorFn: (r) => opts.batchLookup.get(r.batchId) ?? r.batchId,
      Cell: ({ row }) => (
        <Typography variant="body2" noWrap>
          {opts.batchLookup.get(row.original.batchId) ?? "—"}
        </Typography>
      ),
    });
  }

  cols.push(
    {
      accessorKey: "month",
      header: "Month",
      size: 110,
      Cell: ({ cell }) => (
        <Typography variant="body2">{monthLabel(String(cell.getValue()))}</Typography>
      ),
    },
    {
      accessorKey: "dueDate",
      header: "Due",
      size: 110,
      Cell: ({ cell, row }) => {
        const isPast =
          dayjs(String(cell.getValue())).isBefore(dayjs(), "day") &&
          OUTSTANDING_STATUSES.has(row.original.status);
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
      size: 100,
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
          {Number(cell.getValue()) > 0 ? formatAmount(Number(cell.getValue())) : "—"}
        </Typography>
      ),
    },
    {
      id: "remaining",
      header: "Balance",
      size: 105,
      accessorFn: (r) => Math.max(0, r.total - r.paidAmount),
      Cell: ({ cell, row }) => {
        const v = Number(cell.getValue());
        const settled = PAID_STATUSES.has(row.original.status) || v <= 0;
        return (
          <Typography
            variant="body2"
            fontWeight={settled ? 400 : 700}
            color={settled ? "text.disabled" : "error.main"}
          >
            {settled ? "Settled" : formatAmount(v)}
          </Typography>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 130,
      filterVariant: "select",
      filterSelectOptions: [
        { label: "Unpaid", value: "ISSUED" },
        { label: "Partial", value: "PARTIALLY_PAID" },
        { label: "Overdue", value: "OVERDUE" },
        { label: "Paid", value: "PAID" },
        { label: "Waived", value: "WAIVED" },
        { label: "Waiver requested", value: "PENDING_WAIVER" },
      ],
      Cell: ({ cell }) => <InvoiceStatusChip status={String(cell.getValue())} />,
    },
    {
      id: "actions",
      header: "",
      size: 150,
      enableSorting: false,
      enableColumnFilter: false,
      Cell: ({ row }) => (
        <InvoiceRowMenu
          invoice={row.original}
          onPay={opts.onPay}
          onPrint={opts.onPrint}
          onRequestWaiver={opts.onRequestWaiver}
          onApproveWaiver={opts.onApproveWaiver}
          waiverBusy={opts.waiverBusy}
        />
      ),
    },
  );

  return cols;
}

// ── Workspace ─────────────────────────────────────────────────────────────────

export function InvoicesWorkspace() {
  const [tab, setTab] = useState(0);

  const { data: centerData } = useQuery(GetCenterDocument);
  const { data: studentsData, loading: studentsLoading } =
    useQuery(GetStudentsDocument);
  const { data: batchesData, loading: batchesLoading } =
    useQuery(GetAllBatchesDocument);

  const centerName = centerData?.getCenter?.name ?? "BongoBrain";
  const students = studentsData?.getStudents ?? [];
  const batches = batchesData?.getAllBatches ?? [];

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
  const batchLookup = useMemo(
    () => new Map(batches.map((b) => [b.id, b.name])),
    [batches],
  );

  // ── Shared mutations / dialog state ──
  const [payTarget, setPayTarget] = useState<Invoice | null>(null);
  const [requestWaiver, { loading: requesting }] = useMutation(RequestWaiverDocument);
  const [approveWaiver, { loading: approving }] = useMutation(ApproveWaiverDocument);
  const waiverBusy = requesting || approving;

  // ── By Batch state ──
  const [batchId, setBatchId] = useState("");
  const [month, setMonth] = useState(currentMonth());
  const batchReady = Boolean(batchId && month);
  const {
    data: batchInvoicesData,
    loading: batchInvoicesLoading,
    refetch: refetchBatch,
  } = useQuery(GetBatchInvoicesDocument, {
    variables: { batchId, month },
    skip: !batchReady,
    fetchPolicy: "cache-and-network",
  });

  // ── By Student state ──
  const [studentId, setStudentId] = useState("");
  const {
    data: studentInvoicesData,
    loading: studentInvoicesLoading,
    refetch: refetchStudent,
  } = useQuery(GetStudentInvoicesDocument, {
    variables: { studentId },
    skip: !studentId,
    fetchPolicy: "cache-and-network",
  });

  const refetchActive = () => {
    if (tab === 0) refetchBatch();
    else refetchStudent();
  };

  const handlePrint = (inv: Invoice) => {
    const s = studentLookup.get(inv.studentId);
    printInvoiceReceipt({
      invoice: inv,
      studentName: s?.name ?? "—",
      studentCode: s?.code ?? "",
      batchName: batchLookup.get(inv.batchId) ?? "—",
      centerName,
    });
  };

  const handleRequestWaiver = async (inv: Invoice) => {
    try {
      await requestWaiver({ variables: { invoiceId: inv.id } });
      toast.success("Waiver requested.");
      refetchActive();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to request waiver."));
    }
  };

  const handleApproveWaiver = async (inv: Invoice) => {
    try {
      await approveWaiver({ variables: { invoiceId: inv.id } });
      toast.success("Waiver approved.");
      refetchActive();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to approve waiver."));
    }
  };

  const sharedColOpts = {
    studentLookup,
    batchLookup,
    onPay: setPayTarget,
    onPrint: handlePrint,
    onRequestWaiver: handleRequestWaiver,
    onApproveWaiver: handleApproveWaiver,
    waiverBusy,
  };

  // ── Derived data per tab ──
  const batchInvoices = batchInvoicesData?.getBatchInvoices ?? [];
  const studentInvoices = studentInvoicesData?.getStudentInvoices ?? [];

  const batchCols = useInvoiceColumns({
    ...sharedColOpts,
    showStudent: true,
    showBatch: false,
  });
  const studentCols = useInvoiceColumns({
    ...sharedColOpts,
    showStudent: false,
    showBatch: true,
  });

  const summarise = (rows: Invoice[]) => {
    const invoiced = rows.reduce((s, r) => s + r.total, 0);
    const collected = rows.reduce((s, r) => s + r.paidAmount, 0);
    const outstanding = rows
      .filter((r) => OUTSTANDING_STATUSES.has(r.status))
      .reduce((s, r) => s + (r.total - r.paidAmount), 0);
    const overdue = rows.filter((r) => r.status === "OVERDUE").length;
    return { invoiced, collected, outstanding, overdue };
  };

  const activeRows = tab === 0 ? batchInvoices : studentInvoices;
  const stats = summarise(activeRows);

  const selectedStudent = students.find((s) => s.id === studentId);

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
            Bills & Invoices
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, maxWidth: 680 }}>
            Browse invoices by batch and month or drill into a single student. Record
            payments, print receipts, and handle fee waivers.
          </Typography>
        </Paper>

        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab icon={<ReceiptLongRounded />} iconPosition="start" label="By Batch" />
            <Tab icon={<PersonSearchRounded />} iconPosition="start" label="By Student" />
          </Tabs>
        </Box>

        {/* Selectors */}
        <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
          {tab === 0 ? (
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
              <Box sx={{ flex: 1, maxWidth: 420 }}>
                <BatchPicker
                  batches={batches}
                  value={batchId}
                  onChange={setBatchId}
                  loading={batchesLoading}
                />
              </Box>
              <MonthField value={month} onChange={setMonth} sx={{ minWidth: 180 }} />
            </Stack>
          ) : (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="flex-start">
              <PersonSearchRounded sx={{ color: "text.secondary", mt: { sm: 1 } }} />
              <Box sx={{ flex: 1, maxWidth: 480 }}>
                <SearchSelect
                  label="Search student"
                  placeholder="Name, code, phone, or email…"
                  options={studentSearchOptions(students)}
                  loading={studentsLoading}
                  value={studentId}
                  onChange={setStudentId}
                />
              </Box>
              {selectedStudent && (
                <Stack spacing={0.25} sx={{ pt: { sm: 0.5 } }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {`${selectedStudent.firstName} ${selectedStudent.lastName ?? ""}`.trim()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedStudent.studentCode}
                    {selectedStudent.classLevel ? ` · ${selectedStudent.classLevel}` : ""}
                  </Typography>
                </Stack>
              )}
            </Stack>
          )}
        </Paper>

        {(tab === 0 && !batchReady) || (tab === 1 && !studentId) ? (
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
            <ReceiptLongRounded sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }} />
            <Typography variant="h6" color="text.secondary">
              {tab === 0 ? "Select a batch and month" : "Select a student"}
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
              Invoices will load here.
            </Typography>
          </Box>
        ) : (
          <>
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
                caption="Invoiced"
                title={formatAmount(stats.invoiced)}
                icon={<ReceiptLongRounded />}
              />
              <SummaryCard
                caption="Collected"
                title={formatAmount(stats.collected)}
                icon={<CheckCircleRounded />}
                tone="success"
              />
              <SummaryCard
                caption="Outstanding"
                title={formatAmount(stats.outstanding)}
                icon={<AccountBalanceWalletRounded />}
                tone={stats.outstanding > 0 ? "warning" : "default"}
              />
              <SummaryCard
                caption="Overdue invoices"
                title={String(stats.overdue)}
                icon={<WarningAmberRounded />}
                tone={stats.overdue > 0 ? "error" : "default"}
              />
            </Box>

            <Divider />

            <MaterialReactTable
              {...sharedTableProps}
              columns={tab === 0 ? batchCols : studentCols}
              data={activeRows}
              getRowId={(r) => r.id}
              enableColumnFilters
              enableSorting
              state={{
                isLoading:
                  tab === 0
                    ? batchInvoicesLoading && batchInvoices.length === 0
                    : studentInvoicesLoading && studentInvoices.length === 0,
              }}
              initialState={{
                ...sharedTableProps.initialState,
                sorting: [{ id: tab === 0 ? "student" : "month", desc: tab === 1 }],
              }}
              renderEmptyRowsFallback={() => (
                <Box sx={{ px: 3, py: 6, textAlign: "center" }}>
                  <CheckCircleRounded sx={{ fontSize: 40, color: "success.light", mb: 1 }} />
                  <Typography variant="subtitle1" fontWeight={700}>
                    No invoices
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {tab === 0
                      ? `Nothing generated for ${monthLabel(month)}. Run billing from Collections.`
                      : "This student has no invoices yet."}
                  </Typography>
                </Box>
              )}
            />
          </>
        )}
      </Stack>

      {payTarget && (
        <RecordPaymentDialog
          target={{
            invoiceId: payTarget.id,
            studentId: payTarget.studentId,
            total: payTarget.total,
            paidAmount: payTarget.paidAmount,
            month: payTarget.month,
          }}
          studentName={studentLookup.get(payTarget.studentId)?.name ?? ""}
          batchName={batchLookup.get(payTarget.batchId) ?? "—"}
          onClose={() => setPayTarget(null)}
          onSuccess={() => {
            setPayTarget(null);
            refetchActive();
          }}
        />
      )}
    </>
  );
}
