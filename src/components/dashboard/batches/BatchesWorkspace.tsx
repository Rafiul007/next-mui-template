"use client";

import React, { useState, type ReactNode } from "react";
import {
  AddRounded,
  AutoStoriesRounded,
  BlockRounded,
  CheckCircleRounded,
  DevicesRounded,
  EditRounded,
  LayersRounded,
  PeopleRounded,
  ScheduleRounded,
  SchoolRounded,
  VideocamRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { useMutation, useQuery } from "@apollo/client/react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { toast } from "react-hot-toast";
import { primaryGradient } from "@/theme/theme";
import { getErrorMessage } from "@/lib/errors";
import {
  ChangeBatchStatusDocument,
  CreateBatchDocument,
  GetAllBatchesDocument,
  UpdateBatchDocument,
  type GetAllBatchesQuery,
} from "@/graphql/generated";
import {
  BatchFormDialog,
  emptyBatchFormValues,
  type BatchFormValues,
  type BatchStatus,
  type BatchType,
  type DeliveryMode,
  type MediumOfInstruction,
  type DiscountType,
  type DiscountValueType,
} from "./BatchFormDialog";

type PaymentEntry = { name: string; amount: number };
type DiscountRule = {
  type: DiscountType;
  name: string;
  value: number;
  valueType: DiscountValueType;
  earlyBirdDeadline: string;
};

type BatchRecord = {
  id: string;
  type: BatchType;
  courseName?: string;
  batchNumber?: string;
  className?: string;
  section?: string;
  totalSeats: number;
  enrolledCount: number;
  status: BatchStatus;
  deliveryMode: DeliveryMode;
  mediumOfInstruction: MediumOfInstruction;
  registrationDeadline?: string;
  oneTimePayments: PaymentEntry[];
  monthlyPayments: PaymentEntry[];
  discounts: DiscountRule[];
  certificateOnCompletion: boolean;
  certificateTemplateName?: string;
  prerequisites?: string;
  notes?: string;
};

type ApiBatch = GetAllBatchesQuery["getAllBatches"][number];

const STATUS_LABEL: Record<BatchStatus, string> = {
  upcoming: "Upcoming",
  ongoing: "Ongoing",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_COLOR: Record<
  BatchStatus,
  "info" | "success" | "default" | "error"
> = {
  upcoming: "info",
  ongoing: "success",
  completed: "default",
  cancelled: "error",
};

const DELIVERY_LABEL: Record<DeliveryMode, string> = {
  "in-person": "In-person",
  online: "Online",
  hybrid: "Hybrid",
};

const DELIVERY_ICON: Record<DeliveryMode, ReactNode> = {
  "in-person": <PeopleRounded sx={{ fontSize: "14px !important" }} />,
  online: <VideocamRounded sx={{ fontSize: "14px !important" }} />,
  hybrid: <DevicesRounded sx={{ fontSize: "14px !important" }} />,
};

const mapApiBatch = (batch: ApiBatch): BatchRecord => {
  const nameParts = batch.name.split(" · ");
  const isClass = batch.type === "class";
  return {
    id: batch.id,
    type: (batch.type ?? "course") as BatchType,
    courseName: !isClass ? (nameParts[0] ?? "") : "",
    batchNumber: !isClass ? (nameParts[1] ?? "") : "",
    className: isClass ? (nameParts[0] ?? "") : "",
    section: isClass ? (nameParts[1] ?? "") : "",
    totalSeats: batch.capacity,
    enrolledCount: batch.enrolledCount,
    status: (batch.status ?? "upcoming") as BatchStatus,
    deliveryMode: (batch.deliveryMode ?? "in-person") as DeliveryMode,
    mediumOfInstruction: (batch.mediumOfInstruction ?? "bangla") as MediumOfInstruction,
    registrationDeadline: batch.registrationDeadline ?? undefined,
    oneTimePayments: [],
    monthlyPayments: [],
    discounts: [],
    certificateOnCompletion: batch.certificateOnCompletion ?? false,
    certificateTemplateName: batch.certificateTemplateName ?? undefined,
    prerequisites: batch.prerequisites ?? undefined,
    notes: batch.notes ?? undefined,
  };
};

const buildBatchName = (values: BatchFormValues) =>
  values.type === "course"
    ? [values.courseName, values.batchNumber].filter(Boolean).join(" · ")
    : [values.className, values.section].filter(Boolean).join(" · ");

// Java enums are UPPER_SNAKE_CASE. Convert frontend kebab/lower values before sending.
const toApiEnum = (value: string) =>
  value.toUpperCase().replace(/-/g, "_");

const getBatchDisplayName = (batch: BatchRecord): string => {
  if (batch.type === "course") {
    const parts = [batch.courseName, batch.batchNumber].filter(Boolean);
    return parts.join(" · ") || "Unnamed Course Batch";
  }
  const parts = [batch.className, batch.section].filter(Boolean);
  return parts.join(" · ") || "Unnamed Class Batch";
};

const formatAmount = (amount: number) => `৳${amount.toLocaleString("en-BD")}`;

const summarisePayments = (entries: PaymentEntry[]) => {
  if (!entries.length) return "—";
  const total = entries.reduce((sum, e) => sum + e.amount, 0);
  return `${formatAmount(total)} (${entries.length})`;
};

const formatDeadline = (date?: string) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const isClosed = (status: BatchStatus) =>
  status === "cancelled" || status === "completed";

const getBatchFormValues = (batch: BatchRecord): BatchFormValues => ({
  type: batch.type,
  status: batch.status,
  courseName: batch.courseName ?? "",
  batchNumber: batch.batchNumber ?? "",
  className: batch.className ?? "",
  section: batch.section ?? "",
  totalSeats: batch.totalSeats,
  deliveryMode: batch.deliveryMode,
  mediumOfInstruction: batch.mediumOfInstruction,
  registrationDeadline: batch.registrationDeadline ?? "",
  oneTimePayments: batch.oneTimePayments,
  monthlyPayments: batch.monthlyPayments,
  discounts: batch.discounts,
  certificateOnCompletion: batch.certificateOnCompletion,
  certificateTemplateName: batch.certificateTemplateName ?? "",
  prerequisites: batch.prerequisites ?? "",
  notes: batch.notes ?? "",
});

const buildBatchColumns = (): MRT_ColumnDef<BatchRecord>[] => [
  {
    id: "name",
    accessorFn: getBatchDisplayName,
    header: "Batch",
    size: 260,
    Cell: ({ row }) => (
      <Stack spacing={0.75}>
        <Typography variant="subtitle2" fontWeight={700}>
          {getBatchDisplayName(row.original)}
        </Typography>
        <Stack direction="row" spacing={0.75} flexWrap="wrap">
          <Chip
            label={row.original.type === "course" ? "Course" : "Class"}
            size="small"
            icon={
              row.original.type === "course" ? (
                <SchoolRounded sx={{ fontSize: "14px !important" }} />
              ) : (
                <AutoStoriesRounded sx={{ fontSize: "14px !important" }} />
              )
            }
            color={row.original.type === "course" ? "primary" : "secondary"}
            variant="outlined"
            sx={{ fontSize: 11 }}
          />
          <Chip
            label={DELIVERY_LABEL[row.original.deliveryMode]}
            size="small"
            icon={DELIVERY_ICON[row.original.deliveryMode] as React.ReactElement}
            variant="outlined"
            sx={{ fontSize: 11 }}
          />
        </Stack>
      </Stack>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 120,
    filterVariant: "select",
    filterFn: "equals",
    filterSelectOptions: ["upcoming", "ongoing", "completed", "cancelled"],
    Cell: ({ cell }) => {
      const status = cell.getValue<BatchStatus>();
      return (
        <Chip
          label={STATUS_LABEL[status]}
          color={STATUS_COLOR[status]}
          size="small"
          variant={status === "completed" ? "outlined" : "filled"}
        />
      );
    },
  },
  {
    id: "seats",
    header: "Seats",
    size: 100,
    accessorFn: (row) => row.totalSeats,
    Cell: ({ row }) => (
      <Stack spacing={0.25}>
        <Typography variant="body2" fontWeight={600}>
          {row.original.totalSeats}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {row.original.enrolledCount} enrolled
        </Typography>
      </Stack>
    ),
  },
  {
    id: "oneTime",
    header: "One-time fees",
    size: 160,
    enableSorting: false,
    accessorFn: (row) => summarisePayments(row.oneTimePayments),
    Cell: ({ row }) => {
      const entries = row.original.oneTimePayments;
      return (
        <Tooltip
          title={
            entries.length
              ? entries
                  .map((e) => `${e.name}: ${formatAmount(e.amount)}`)
                  .join(" · ")
              : "No one-time fees"
          }
        >
          <Typography variant="body2" sx={{ cursor: "default" }}>
            {summarisePayments(entries)}
          </Typography>
        </Tooltip>
      );
    },
  },
  {
    id: "monthly",
    header: "Monthly fees",
    size: 160,
    enableSorting: false,
    accessorFn: (row) => summarisePayments(row.monthlyPayments),
    Cell: ({ row }) => {
      const entries = row.original.monthlyPayments;
      return (
        <Tooltip
          title={
            entries.length
              ? entries
                  .map((e) => `${e.name}: ${formatAmount(e.amount)}/mo`)
                  .join(" · ")
              : "No monthly fees"
          }
        >
          <Typography variant="body2" sx={{ cursor: "default" }}>
            {entries.length ? `${summarisePayments(entries)}/mo` : "—"}
          </Typography>
        </Tooltip>
      );
    },
  },
  {
    id: "deadline",
    header: "Reg. deadline",
    size: 130,
    enableSorting: false,
    accessorFn: (row) => row.registrationDeadline ?? "",
    Cell: ({ row }) => (
      <Stack direction="row" spacing={0.75} alignItems="center">
        <ScheduleRounded sx={{ fontSize: 16, color: "text.secondary" }} />
        <Typography variant="body2">
          {formatDeadline(row.original.registrationDeadline)}
        </Typography>
      </Stack>
    ),
  },
];

function SummaryCard({
  caption,
  icon,
  title,
  tone = "default",
}: {
  caption: string;
  icon: ReactNode;
  title: string;
  tone?: "default" | "success" | "info" | "muted";
}) {
  const borderColor =
    tone === "success"
      ? alpha("#10b981", 0.22)
      : tone === "info"
        ? alpha("#3b82f6", 0.22)
        : tone === "muted"
          ? alpha("#64748b", 0.16)
          : alpha("#0f172a", 0.08);

  const iconBackground =
    tone === "success"
      ? alpha("#10b981", 0.12)
      : tone === "info"
        ? alpha("#3b82f6", 0.12)
        : alpha("#0f172a", 0.06);

  const iconColor =
    tone === "success"
      ? "#047857"
      : tone === "info"
        ? "#1d4ed8"
        : "#0f172a";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: "1px solid",
        borderColor,
        display: "grid",
        gap: 1.25,
      }}
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
            bgcolor: iconBackground,
            color: iconColor,
          }}
        >
          {icon}
        </Box>
      </Stack>
      <Typography variant="h5">{title}</Typography>
    </Paper>
  );
}

export function BatchesWorkspace() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedBatch, setSelectedBatch] = useState<BatchRecord | null>(null);
  const [batchToCancel, setBatchToCancel] = useState<BatchRecord | null>(null);
  const [formDialogKey, setFormDialogKey] = useState(0);
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);

  const { data, loading } = useQuery(GetAllBatchesDocument, {
    fetchPolicy: "cache-and-network",
  });

  const [createBatch, { loading: isCreating }] = useMutation(CreateBatchDocument, {
    refetchQueries: [GetAllBatchesDocument],
  });

  const [updateBatch, { loading: isUpdating }] = useMutation(UpdateBatchDocument, {
    refetchQueries: [GetAllBatchesDocument],
  });

  const [changeBatchStatus, { loading: isCancellingMutation }] = useMutation(
    ChangeBatchStatusDocument,
    { refetchQueries: [GetAllBatchesDocument] },
  );

  const batches: BatchRecord[] = (data?.getAllBatches ?? []).map(mapApiBatch);

  const isSubmitting = isCreating || isUpdating;
  const isCancelling = isCancellingMutation;

  const totalBatches = batches.length;
  const upcomingBatches = batches.filter((b) => b.status === "upcoming").length;
  const ongoingBatches = batches.filter((b) => b.status === "ongoing").length;
  const completedBatches = batches.filter((b) => b.status === "completed").length;

  const openCreateDialog = () => {
    setFormMode("create");
    setSelectedBatch(null);
    setFormErrorMessage(null);
    setFormDialogKey((k) => k + 1);
    setIsFormOpen(true);
  };

  const openEditDialog = (batch: BatchRecord) => {
    setFormMode("edit");
    setSelectedBatch(batch);
    setFormErrorMessage(null);
    setFormDialogKey((k) => k + 1);
    setIsFormOpen(true);
  };

  const closeFormDialog = () => {
    if (!isSubmitting) {
      setIsFormOpen(false);
      setSelectedBatch(null);
      setFormErrorMessage(null);
    }
  };

  const handleSubmitBatch = async (values: BatchFormValues) => {
    setFormErrorMessage(null);

    try {
      if (formMode === "edit" && selectedBatch) {
        const result = await updateBatch({
          variables: {
            batch: {
              id: selectedBatch.id,
              name: buildBatchName(values),
              capacity: values.totalSeats,
            },
          },
        });
        if (result.error) throw result.error;
        toast.success("Batch updated successfully.");
      } else {
        const result = await createBatch({
          variables: {
            batch: {
              name: buildBatchName(values),
              capacity: values.totalSeats,
              type: toApiEnum(values.type),
              status: toApiEnum(values.status),
              deliveryMode: toApiEnum(values.deliveryMode),
              mediumOfInstruction: toApiEnum(values.mediumOfInstruction),
              registrationDeadline: values.registrationDeadline || undefined,
              certificateOnCompletion: values.certificateOnCompletion,
              certificateTemplateName: values.certificateTemplateName || undefined,
              prerequisites: values.prerequisites || undefined,
              notes: values.notes || undefined,
            },
          },
        });
        if (result.error) throw result.error;
        toast.success("Batch created successfully.");
      }
      closeFormDialog();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to save batch. Please try again.");
      setFormErrorMessage(message);
      toast.error(message);
    }
  };

  const handleCancelBatch = async () => {
    if (!batchToCancel) return;

    try {
      const result = await changeBatchStatus({
        variables: { batchId: batchToCancel.id, status: "CANCELLED" },
      });
      if (result.error) throw result.error;
      toast.success(`"${getBatchDisplayName(batchToCancel)}" was cancelled.`);
      setBatchToCancel(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to cancel batch."));
    }
  };

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
          <Stack
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            spacing={3}
          >
            <Box sx={{ maxWidth: 760 }}>
              <Typography variant="h4" component="h1" sx={{ mt: 0.5 }}>
                Batch management
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Manage course and class batches, delivery mode, fee structures,
                and discount rules.
              </Typography>
            </Box>
            <Box
              sx={{
                minWidth: { lg: 240 },
                display: "flex",
                alignItems: "flex-start",
                justifyContent: { xs: "stretch", lg: "flex-end" },
              }}
            >
              <Button
                variant="contained"
                startIcon={<AddRounded />}
                onClick={openCreateDialog}
                fullWidth
                sx={{
                  maxWidth: { xs: "100%", lg: 220 },
                  backgroundImage: primaryGradient,
                }}
              >
                Create Batch
              </Button>
            </Box>
          </Stack>
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
            caption="Total Batches"
            title={String(totalBatches)}
            icon={<LayersRounded />}
          />
          <SummaryCard
            caption="Upcoming"
            title={String(upcomingBatches)}
            icon={<ScheduleRounded />}
            tone="info"
          />
          <SummaryCard
            caption="Ongoing"
            title={String(ongoingBatches)}
            icon={<CheckCircleRounded />}
            tone="success"
          />
          <SummaryCard
            caption="Completed"
            title={String(completedBatches)}
            icon={<CheckCircleRounded />}
            tone="muted"
          />
        </Box>

        {/* Table */}
        <MaterialReactTable
          columns={buildBatchColumns()}
          data={batches}
          enableColumnFilters
          enableDensityToggle={false}
          enableFullScreenToggle={false}
          enableHiding={false}
          enableRowActions
          enableSorting
          enableStickyHeader
          getRowId={(row) => row.id}
          state={{ isLoading: loading && batches.length === 0 }}
          initialState={{
            pagination: { pageIndex: 0, pageSize: 10 },
            showColumnFilters: false,
            sorting: [{ id: "name", desc: false }],
          }}
          localization={{
            actions: "Actions",
            noRecordsToDisplay: "No batches found",
          }}
          positionActionsColumn="last"
          muiSearchTextFieldProps={{
            placeholder: "Search batches",
            size: "small",
            sx: { minWidth: { xs: "100%", md: 280 } },
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
              opacity: isClosed(row.original.status) ? 0.7 : 1,
              bgcolor: "#ffffff",
              transition:
                "background-color 140ms ease, transform 140ms ease, box-shadow 140ms ease",
              "&:hover td": { bgcolor: alpha("#ecfdf5", 0.9) },
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: `inset 0 0 0 1px ${alpha("#10b981", 0.12)}`,
              },
            },
          })}
          muiTableBodyCellProps={{
            sx: {
              bgcolor: "#ffffff",
              borderBottom: "1px solid",
              borderColor: alpha("#0f172a", 0.06),
              py: 2.25,
            },
          }}
          muiTableContainerProps={{ sx: { maxHeight: 640, bgcolor: "#ffffff" } }}
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
              py: 1.75,
              bgcolor: "#ffffff",
              borderBottom: "1px solid",
              borderColor: alpha("#0f172a", 0.08),
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
              {loading ? (
                <CircularProgress size={32} />
              ) : (
                <>
                  <Typography variant="subtitle1" fontWeight={700}>
                    No batches yet
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Create your first batch to start managing courses and classes.
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddRounded />}
                    onClick={openCreateDialog}
                    sx={{ mt: 2 }}
                  >
                    Create Batch
                  </Button>
                </>
              )}
            </Box>
          )}
          renderRowActions={({ row }) => (
            <Stack
              direction="row"
              spacing={0.5}
              justifyContent="flex-end"
              sx={{ width: "100%" }}
            >
              <Tooltip title="Edit batch">
                <IconButton
                  size="small"
                  onClick={() => openEditDialog(row.original)}
                  sx={{ bgcolor: alpha("#0f172a", 0.04) }}
                >
                  <EditRounded fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip
                title={
                  isClosed(row.original.status)
                    ? "Already closed"
                    : "Cancel batch"
                }
              >
                <span>
                  <IconButton
                    size="small"
                    disabled={isClosed(row.original.status)}
                    onClick={() => setBatchToCancel(row.original)}
                    sx={{ bgcolor: alpha("#ef4444", 0.08), color: "#b91c1c" }}
                  >
                    <BlockRounded fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          )}
          renderTopToolbarCustomActions={() => (
            <Typography variant="body2" color="text.secondary">
              {totalBatches} batch{totalBatches === 1 ? "" : "es"} total
            </Typography>
          )}
        />
      </Stack>

      <BatchFormDialog
        key={formDialogKey}
        errorMessage={formErrorMessage}
        initialValues={
          selectedBatch
            ? getBatchFormValues(selectedBatch)
            : emptyBatchFormValues
        }
        isSubmitting={isSubmitting}
        mode={formMode}
        onClose={closeFormDialog}
        onSubmit={handleSubmitBatch}
        open={isFormOpen}
      />

      <Dialog
        open={!!batchToCancel}
        onClose={() => !isCancelling && setBatchToCancel(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Cancel batch</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {batchToCancel
              ? `This will mark "${getBatchDisplayName(batchToCancel)}" as cancelled. Existing enrollments will not be affected.`
              : ""}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            color="inherit"
            onClick={() => setBatchToCancel(null)}
            disabled={isCancelling}
          >
            Keep batch
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancelBatch}
            disabled={isCancelling}
          >
            Cancel batch
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
