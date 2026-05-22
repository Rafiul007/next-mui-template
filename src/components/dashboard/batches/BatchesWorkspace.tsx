"use client";

import React, { useState, type ReactNode } from "react";
import {
  AddRounded,
  AutoStoriesRounded,
  BlockRounded,
  CheckCircleRounded,
  DeleteRounded,
  DevicesRounded,
  DoneRounded,
  EditRounded,
  LayersRounded,
  PeopleRounded,
  PlayArrowRounded,
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
  DeleteBatchDocument,
  GetAllBatchesDocument,
  GetFeeTypesDocument,
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
  type FeePlanFrequency,
  type MediumOfInstruction,
} from "./BatchFormDialog";
import { FeeTypesSection } from "./FeeTypesSection";

type FeePlanEntry = {
  feeTypeId: string;
  amount: number;
  frequency: FeePlanFrequency;
};

type BatchRecord = {
  id: string;
  rawName: string;
  type: BatchType;
  courseName?: string;
  batchNumber?: string;
  className?: string;
  section?: string;
  classLevel?: string;
  totalSeats: number;
  enrolledCount: number;
  status: BatchStatus;
  deliveryMode: DeliveryMode;
  mediumOfInstruction: MediumOfInstruction;
  startDate?: string;
  endDate?: string;
  registrationDeadline?: string;
  feePlans: FeePlanEntry[];
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

const CLASS_LEVEL_LABEL: Record<string, string> = {
  class_1: "Class 1", class_2: "Class 2", class_3: "Class 3",
  class_4: "Class 4", class_5: "Class 5", class_6: "Class 6",
  class_7: "Class 7", class_8: "Class 8", class_9: "Class 9",
  class_10: "Class 10", class_11: "Class 11", class_12: "Class 12",
  ssc: "SSC", hsc: "HSC", admission_prep: "Admission Prep",
  ielts: "IELTS", other: "Other",
};

const DELIVERY_ICON: Record<DeliveryMode, ReactNode> = {
  "in-person": <PeopleRounded sx={{ fontSize: "14px !important" }} />,
  online: <VideocamRounded sx={{ fontSize: "14px !important" }} />,
  hybrid: <DevicesRounded sx={{ fontSize: "14px !important" }} />,
};

const mapApiBatch = (batch: ApiBatch): BatchRecord => {
  // API returns UPPER_SNAKE_CASE enums — normalise to lowercase/kebab before use.
  const batchType = ((batch.type ?? "course").toLowerCase()) as BatchType;
  const batchStatus = ((batch.status ?? "upcoming").toLowerCase()) as BatchStatus;
  const nameParts = batch.name.split(" · ");
  const isClass = batchType === "class";
  // courseName from API takes precedence over parsing the name string
  const apiCourseName = batch.courseName ?? null;
  return {
    id: batch.id,
    rawName: batch.name,
    type: batchType,
    courseName: !isClass ? (apiCourseName ?? nameParts[0] ?? "") : "",
    batchNumber: !isClass ? (nameParts[1] ?? "") : "",
    className: isClass ? (nameParts[0] ?? "") : "",
    section: isClass ? (nameParts[1] ?? "") : "",
    classLevel: batch.classLevel?.toLowerCase() ?? undefined,
    totalSeats: batch.capacity,
    enrolledCount: batch.enrolledCount,
    status: batchStatus,
    deliveryMode: (fromApiEnum(batch.deliveryMode ?? "IN_PERSON")) as DeliveryMode,
    mediumOfInstruction: ((batch.mediumOfInstruction ?? "BANGLA").toLowerCase()) as MediumOfInstruction,
    startDate: batch.startDate ?? undefined,
    endDate: batch.endDate ?? undefined,
    registrationDeadline: batch.registrationDeadline ?? undefined,
    feePlans: (batch.feePlans ?? []).map((fp) => ({
      feeTypeId: fp.feeTypeId,
      amount: fp.amount,
      frequency: fp.frequency as FeePlanFrequency,
    })),
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

// Reverse: convert API UPPER_SNAKE_CASE back to frontend lower-kebab.
const fromApiEnum = (value: string) =>
  value.toLowerCase().replace(/_/g, "-");

const getBatchDisplayName = (batch: BatchRecord): string => {
  if (batch.rawName) return batch.rawName;
  if (batch.type === "course") {
    const parts = [batch.courseName, batch.batchNumber].filter(Boolean);
    return parts.join(" · ") || "Unnamed Course Batch";
  }
  const parts = [batch.className, batch.section].filter(Boolean);
  return parts.join(" · ") || "Unnamed Class Batch";
};

const formatAmount = (amount: number) => `৳${amount.toLocaleString("en-BD")}`;

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
  // If the raw name doesn't use the " · " separator (e.g. API-created or legacy names),
  // put the full name into the primary name field so the user can see and edit it.
  courseName: batch.type === "course" ? (batch.courseName || batch.rawName) : "",
  batchNumber: batch.type === "course" ? (batch.batchNumber ?? "") : "",
  className: batch.type === "class" ? (batch.className || batch.rawName) : "",
  section: batch.type === "class" ? (batch.section ?? "") : "",
  classLevel: batch.classLevel ?? "",
  totalSeats: batch.totalSeats,
  startDate: batch.startDate ?? "",
  endDate: batch.endDate ?? "",
  deliveryMode: batch.deliveryMode,
  mediumOfInstruction: batch.mediumOfInstruction,
  registrationDeadline: batch.registrationDeadline ?? "",
  feePlans: batch.feePlans,
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
    size: 280,
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
          {row.original.classLevel && (
            <Chip
              label={CLASS_LEVEL_LABEL[row.original.classLevel] ?? row.original.classLevel.toUpperCase()}
              size="small"
              color="default"
              sx={{ fontSize: 11 }}
            />
          )}
          <Chip
            label={DELIVERY_LABEL[row.original.deliveryMode] ?? row.original.deliveryMode}
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
      const status = cell.getValue<string>().toLowerCase() as BatchStatus;
      return (
        <Chip
          label={STATUS_LABEL[status] ?? status}
          color={STATUS_COLOR[status] ?? "default"}
          size="small"
          variant={status === "completed" ? "outlined" : "filled"}
        />
      );
    },
  },
  {
    id: "seats",
    header: "Seats",
    size: 120,
    accessorFn: (row) => row.totalSeats - row.enrolledCount,
    Cell: ({ row }) => {
      const { totalSeats, enrolledCount } = row.original;
      const available = totalSeats - enrolledCount;
      const isFull = available <= 0;
      return (
        <Stack spacing={0.25}>
          <Typography variant="body2" fontWeight={600}>
            {enrolledCount} / {totalSeats}
          </Typography>
          <Typography
            variant="caption"
            color={isFull ? "error.main" : "text.secondary"}
            fontWeight={isFull ? 600 : 400}
          >
            {isFull ? "Full" : `${available} seats left`}
          </Typography>
        </Stack>
      );
    },
  },
  {
    id: "feePlans",
    header: "Fees",
    size: 160,
    enableSorting: false,
    accessorFn: (row) => row.feePlans.length,
    Cell: ({ row }) => {
      const plans = row.original.feePlans;
      if (!plans.length) {
        return <Typography variant="body2" color="text.secondary">No fees</Typography>;
      }
      const oneTimeTotal = plans
        .filter((p) => p.frequency === "ONE_TIME")
        .reduce((s, p) => s + p.amount, 0);
      const monthlyTotal = plans
        .filter((p) => p.frequency === "MONTHLY")
        .reduce((s, p) => s + p.amount, 0);
      return (
        <Stack spacing={0.25}>
          {oneTimeTotal > 0 && (
            <Stack spacing={0}>
              <Typography variant="body2" fontWeight={600}>
                {formatAmount(oneTimeTotal)}
              </Typography>
              <Typography variant="caption" color="text.secondary">one-time</Typography>
            </Stack>
          )}
          {monthlyTotal > 0 && (
            <Stack spacing={0}>
              <Typography variant="body2" fontWeight={600}>
                {formatAmount(monthlyTotal)}/mo
              </Typography>
              <Typography variant="caption" color="text.secondary">monthly</Typography>
            </Stack>
          )}
        </Stack>
      );
    },
  },
  {
    id: "schedule",
    header: "Duration",
    size: 180,
    enableSorting: false,
    accessorFn: (row) => row.startDate ?? "",
    Cell: ({ row }) => {
      const { startDate, endDate, registrationDeadline } = row.original;
      if (!startDate && !endDate) {
        return <Typography variant="body2" color="text.secondary">—</Typography>;
      }
      const fmt = (d: string) =>
        new Date(d).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" });
      return (
        <Stack spacing={0.25}>
          {startDate && (
            <Typography variant="body2">
              {fmt(startDate)}
              {endDate ? ` – ${fmt(endDate)}` : ""}
            </Typography>
          )}
          {registrationDeadline && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <ScheduleRounded sx={{ fontSize: 12, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                Reg. deadline: {fmt(registrationDeadline)}
              </Typography>
            </Stack>
          )}
        </Stack>
      );
    },
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
  type StatusChangeReq = { batch: BatchRecord; toStatus: string };

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedBatch, setSelectedBatch] = useState<BatchRecord | null>(null);
  const [statusChangeReq, setStatusChangeReq] = useState<StatusChangeReq | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BatchRecord | null>(null);
  const [formDialogKey, setFormDialogKey] = useState(0);
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);

  const { data, loading } = useQuery(GetAllBatchesDocument, {
    fetchPolicy: "cache-and-network",
  });

  const { data: feeTypesData } = useQuery(GetFeeTypesDocument, {
    fetchPolicy: "cache-and-network",
  });

  const feeTypes = feeTypesData?.getFeeTypes ?? [];

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

  const [deleteBatch, { loading: isDeleting }] = useMutation(DeleteBatchDocument, {
    refetchQueries: [GetAllBatchesDocument],
  });

  const batches: BatchRecord[] = (data?.getAllBatches ?? [])
    .filter((b) => !b.deleted)
    .map(mapApiBatch);

  const isSubmitting = isCreating || isUpdating;
  const isChangingStatus = isCancellingMutation;

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

    const feePlans = values.feePlans.map((fp) => ({
      feeTypeId: fp.feeTypeId,
      amount: fp.amount,
      frequency: fp.frequency,
    }));

    try {
      if (formMode === "edit" && selectedBatch) {
        const result = await updateBatch({
          variables: {
            batch: {
              id: selectedBatch.id,
              name: buildBatchName(values),
              courseName: values.type === "course" ? (values.courseName?.trim() || undefined) : undefined,
              capacity: values.totalSeats,
              classLevel: values.classLevel ? toApiEnum(values.classLevel) : undefined,
              startDate: values.startDate || undefined,
              endDate: values.endDate || undefined,
              feePlans,
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
              courseName: values.type === "course" ? (values.courseName?.trim() || undefined) : undefined,
              capacity: values.totalSeats,
              type: toApiEnum(values.type),
              status: toApiEnum(values.status),
              classLevel: values.classLevel ? toApiEnum(values.classLevel) : undefined,
              startDate: values.startDate || undefined,
              endDate: values.endDate || undefined,
              deliveryMode: toApiEnum(values.deliveryMode),
              mediumOfInstruction: toApiEnum(values.mediumOfInstruction),
              registrationDeadline: values.registrationDeadline || undefined,
              certificateOnCompletion: values.certificateOnCompletion,
              certificateTemplateName: values.certificateTemplateName || undefined,
              prerequisites: values.prerequisites || undefined,
              notes: values.notes || undefined,
              feePlans,
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

  const handleStatusChange = async () => {
    if (!statusChangeReq) return;

    const { batch, toStatus } = statusChangeReq;
    try {
      const result = await changeBatchStatus({
        variables: { batchId: batch.id, status: toStatus },
      });
      if (result.error) throw result.error;
      const label = toStatus === "CANCELLED" ? "cancelled" : toStatus === "ONGOING" ? "marked as ongoing" : "marked as completed";
      toast.success(`"${getBatchDisplayName(batch)}" was ${label}.`);
      setStatusChangeReq(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update batch status."));
    }
  };

  const handleDeleteBatch = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBatch({ variables: { batchId: deleteTarget.id } });
      toast.success(`"${getBatchDisplayName(deleteTarget)}" deleted.`);
      setDeleteTarget(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete batch."));
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
              size: 120,
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
          renderRowActions={({ row }) => {
            const s = row.original.status;
            const closed = isClosed(s);
            return (
              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                justifyContent="flex-end"
                sx={{ width: "100%" }}
              >
                <Tooltip title="Edit batch">
                  <IconButton
                    size="small"
                    onClick={() => openEditDialog(row.original)}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1.5,
                      color: "text.secondary",
                      "&:hover": { borderColor: "primary.main", color: "primary.main", bgcolor: alpha("#10b981", 0.06) },
                    }}
                  >
                    <EditRounded sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>

                {s === "upcoming" && (
                  <Tooltip title="Mark as ongoing">
                    <IconButton
                      size="small"
                      onClick={() =>
                        setStatusChangeReq({ batch: row.original, toStatus: "ONGOING" })
                      }
                      sx={{
                        border: "1px solid",
                        borderColor: alpha("#3b82f6", 0.35),
                        borderRadius: 1.5,
                        color: "info.main",
                        "&:hover": { bgcolor: alpha("#3b82f6", 0.08) },
                      }}
                    >
                      <PlayArrowRounded sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                )}

                {s === "ongoing" && (
                  <Tooltip title="Mark as completed">
                    <IconButton
                      size="small"
                      onClick={() =>
                        setStatusChangeReq({ batch: row.original, toStatus: "COMPLETED" })
                      }
                      sx={{
                        border: "1px solid",
                        borderColor: alpha("#10b981", 0.35),
                        borderRadius: 1.5,
                        color: "success.main",
                        "&:hover": { bgcolor: alpha("#10b981", 0.08) },
                      }}
                    >
                      <DoneRounded sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                )}

                {!closed && (
                  <Tooltip title="Cancel batch">
                    <IconButton
                      size="small"
                      onClick={() =>
                        setStatusChangeReq({ batch: row.original, toStatus: "CANCELLED" })
                      }
                      sx={{
                        border: "1px solid",
                        borderColor: alpha("#ef4444", 0.3),
                        borderRadius: 1.5,
                        color: "error.main",
                        "&:hover": { bgcolor: alpha("#ef4444", 0.06) },
                      }}
                    >
                      <BlockRounded sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                )}

                {closed && (
                  <Tooltip title="Delete batch permanently">
                    <IconButton
                      size="small"
                      onClick={() => setDeleteTarget(row.original)}
                      sx={{
                        border: "1px solid",
                        borderColor: alpha("#ef4444", 0.3),
                        borderRadius: 1.5,
                        color: "error.main",
                        "&:hover": { bgcolor: alpha("#ef4444", 0.06) },
                      }}
                    >
                      <DeleteRounded sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            );
          }}
          renderTopToolbarCustomActions={() => (
            <Typography variant="body2" color="text.secondary">
              {totalBatches} batch{totalBatches === 1 ? "" : "es"} total
            </Typography>
          )}
        />

        <FeeTypesSection />
      </Stack>

      <BatchFormDialog
        key={formDialogKey}
        errorMessage={formErrorMessage}
        feeTypes={feeTypes}
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
        open={!!deleteTarget}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Delete batch</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Permanently delete{" "}
            <strong>{deleteTarget ? getBatchDisplayName(deleteTarget) : ""}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            color="inherit"
            onClick={() => setDeleteTarget(null)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteBatch}
            disabled={isDeleting}
          >
            Delete permanently
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!statusChangeReq}
        onClose={() => !isChangingStatus && setStatusChangeReq(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          {statusChangeReq?.toStatus === "ONGOING"
            ? "Start batch"
            : statusChangeReq?.toStatus === "COMPLETED"
              ? "Complete batch"
              : "Cancel batch"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {statusChangeReq?.toStatus === "ONGOING" &&
              `"${getBatchDisplayName(statusChangeReq.batch)}" will be marked as ongoing.`}
            {statusChangeReq?.toStatus === "COMPLETED" &&
              `"${getBatchDisplayName(statusChangeReq.batch)}" will be closed and marked as completed.`}
            {statusChangeReq?.toStatus === "CANCELLED" &&
              `This will cancel "${getBatchDisplayName(statusChangeReq.batch)}". Existing enrollments will not be affected.`}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            color="inherit"
            onClick={() => setStatusChangeReq(null)}
            disabled={isChangingStatus}
          >
            Go back
          </Button>
          <Button
            variant="contained"
            color={statusChangeReq?.toStatus === "CANCELLED" ? "error" : "primary"}
            onClick={handleStatusChange}
            disabled={isChangingStatus}
          >
            {statusChangeReq?.toStatus === "ONGOING" && "Mark as ongoing"}
            {statusChangeReq?.toStatus === "COMPLETED" && "Mark as completed"}
            {statusChangeReq?.toStatus === "CANCELLED" && "Cancel batch"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
