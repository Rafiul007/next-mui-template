"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  PaidRounded,
  PointOfSaleRounded,
  PrintRounded,
  ReceiptLongRounded,
} from "@mui/icons-material";
import { useQuery } from "@apollo/client/react";
import {
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import {
  GetAllBatchesDocument,
  GetBatchInvoicesDocument,
  GetCenterDocument,
  GetPaymentsByInvoiceDocument,
  GetStudentsDocument,
  type GetBatchInvoicesQuery,
} from "@/graphql/generated";
import { SummaryCard } from "@/components/ui";
import {
  BatchPicker,
  InvoiceStatusChip,
  MonthField,
  currentMonth,
  formatAmount,
  monthLabel,
  paymentMethodLabel,
  sharedTableProps,
} from "./billing-shared";
import { printInvoiceReceipt } from "./billing-print";

type BatchInvoice = GetBatchInvoicesQuery["getBatchInvoices"][number];

type StudentInfo = { name: string; code: string };

// ── Per-invoice payment rows (lazy loaded in the detail panel) ─────────────────

function PaymentRows({
  invoice,
  student,
  batchName,
  centerName,
}: {
  invoice: BatchInvoice;
  student: StudentInfo;
  batchName: string;
  centerName: string;
}) {
  const { data, loading } = useQuery(GetPaymentsByInvoiceDocument, {
    variables: { invoiceId: invoice.id },
    fetchPolicy: "cache-and-network",
  });

  const payments = data?.getPaymentsByInvoice ?? [];

  if (loading && payments.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  if (payments.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ px: 1, py: 1.5 }}>
        No payments recorded against this invoice yet.
      </Typography>
    );
  }

  return (
    <Stack spacing={1} sx={{ px: 1, py: 1 }}>
      {payments.map((p) => (
        <Stack
          key={p.id}
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{
            px: 2,
            py: 1.25,
            borderRadius: 1.5,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "#fff",
          }}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              bgcolor: alpha("#10b981", 0.1),
              color: "#047857",
            }}
          >
            <PaidRounded sx={{ fontSize: 18 }} />
          </Box>
          <Box sx={{ minWidth: 110 }}>
            <Typography variant="body2" fontWeight={700}>
              {formatAmount(p.amount)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {paymentMethodLabel(p.method)}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" noWrap>
              {p.receiptNumber ? `Receipt ${p.receiptNumber} · ` : ""}
              Ref: {p.transactionRef}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {p.collectedAt ? dayjs(p.collectedAt).format("DD MMM YY, h:mm A") : "—"}
          </Typography>
          <Tooltip title="Print receipt">
            <IconButton
              size="small"
              onClick={() =>
                printInvoiceReceipt({
                  invoice,
                  studentName: student.name,
                  studentCode: student.code,
                  batchName,
                  centerName,
                  documentTitle: "Payment Receipt",
                  payment: {
                    amount: p.amount,
                    method: paymentMethodLabel(p.method),
                    transactionRef: p.transactionRef,
                    receiptNumber: p.receiptNumber,
                    collectedAt: p.collectedAt,
                  },
                })
              }
            >
              <PrintRounded fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ))}
    </Stack>
  );
}

// ── Workspace ─────────────────────────────────────────────────────────────────

export function TransactionsWorkspace() {
  const [batchId, setBatchId] = useState("");
  const [month, setMonth] = useState(currentMonth());

  const { data: batchesData, loading: batchesLoading } =
    useQuery(GetAllBatchesDocument);
  const { data: studentsData } = useQuery(GetStudentsDocument);
  const { data: centerData } = useQuery(GetCenterDocument);

  const ready = Boolean(batchId && month);

  const { data: invoicesData, loading: invoicesLoading } = useQuery(
    GetBatchInvoicesDocument,
    {
      variables: { batchId, month },
      skip: !ready,
      fetchPolicy: "cache-and-network",
    },
  );

  const batches = batchesData?.getAllBatches ?? [];
  const centerName = centerData?.getCenter?.name ?? "BongoBrain";
  const batchName = batches.find((b) => b.id === batchId)?.name ?? "—";

  const studentLookup = useMemo(
    () =>
      new Map<string, StudentInfo>(
        (studentsData?.getStudents ?? []).map((s) => [
          s.id,
          {
            name: `${s.firstName} ${s.lastName ?? ""}`.trim() || s.studentCode,
            code: s.studentCode,
          },
        ]),
      ),
    [studentsData],
  );

  // Only invoices that have collected money belong in the transaction ledger.
  const paidInvoices = (invoicesData?.getBatchInvoices ?? []).filter(
    (i) => i.paidAmount > 0,
  );

  const totalCollected = paidInvoices.reduce((s, i) => s + i.paidAmount, 0);

  const columns: MRT_ColumnDef<BatchInvoice>[] = [
    {
      id: "student",
      header: "Student",
      size: 240,
      accessorFn: (r) => studentLookup.get(r.studentId)?.name ?? r.studentId,
      Cell: ({ row }) => {
        const s = studentLookup.get(row.original.studentId);
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
    },
    {
      accessorKey: "total",
      header: "Invoice total",
      size: 120,
      Cell: ({ cell }) => (
        <Typography variant="body2">{formatAmount(Number(cell.getValue()))}</Typography>
      ),
    },
    {
      accessorKey: "paidAmount",
      header: "Collected",
      size: 120,
      Cell: ({ cell }) => (
        <Typography variant="body2" fontWeight={700} color="success.main">
          {formatAmount(Number(cell.getValue()))}
        </Typography>
      ),
    },
    {
      id: "balance",
      header: "Balance",
      size: 110,
      accessorFn: (r) => Math.max(0, r.total - r.paidAmount),
      Cell: ({ cell }) => {
        const v = Number(cell.getValue());
        return (
          <Typography variant="body2" color={v > 0 ? "error.main" : "text.disabled"}>
            {v > 0 ? formatAmount(v) : "Settled"}
          </Typography>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 110,
      Cell: ({ cell }) => <InvoiceStatusChip status={String(cell.getValue())} />,
    },
  ];

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
        <Typography variant="h4" component="h1">
          Transactions
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, maxWidth: 680 }}>
          The money-in ledger. Pick a batch and month, then expand any row to see
          individual payments and reprint receipts.
        </Typography>
      </Paper>

      <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
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
      </Paper>

      {!ready ? (
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
          <PointOfSaleRounded sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }} />
          <Typography variant="h6" color="text.secondary">
            Select a batch and month
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
            The payment ledger will load here.
          </Typography>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0,1fr))" },
            }}
          >
            <SummaryCard
              caption={`Collected · ${monthLabel(month)}`}
              title={formatAmount(totalCollected)}
              icon={<PaidRounded />}
              tone="success"
            />
            <SummaryCard
              caption="Paying invoices"
              title={String(paidInvoices.length)}
              icon={<ReceiptLongRounded />}
            />
          </Box>

          <MaterialReactTable
            {...sharedTableProps}
            columns={columns}
            data={paidInvoices}
            getRowId={(r) => r.id}
            enableExpanding
            enableSorting
            state={{ isLoading: invoicesLoading && paidInvoices.length === 0 }}
            initialState={{
              ...sharedTableProps.initialState,
              sorting: [{ id: "paidAmount", desc: true }],
            }}
            renderDetailPanel={({ row }) => (
              <PaymentRows
                invoice={row.original}
                student={
                  studentLookup.get(row.original.studentId) ?? {
                    name: "—",
                    code: "",
                  }
                }
                batchName={batchName}
                centerName={centerName}
              />
            )}
            renderEmptyRowsFallback={() => (
              <Box sx={{ px: 3, py: 6, textAlign: "center" }}>
                <PointOfSaleRounded sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
                <Typography variant="subtitle1" fontWeight={700}>
                  No transactions
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  No payments collected for {monthLabel(month)} in this batch.
                </Typography>
              </Box>
            )}
          />
        </>
      )}
    </Stack>
  );
}
