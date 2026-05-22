"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  AddRounded,
  ArchiveRounded,
  AnnouncementRounded,
  CheckCircleRounded,
  PublishRounded,
} from "@mui/icons-material";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { toast } from "react-hot-toast";
import { RhfCheckboxGroup, RhfTextField } from "@/components/form";
import { SummaryCard } from "@/components/ui";
import {
  ArchiveNoticeDocument,
  CreateNoticeDocument,
  GetAllBatchesDocument,
  GetAllNoticesDocument,
  PublishNoticeDocument,
  type GetAllNoticesQuery,
} from "@/graphql/generated";
import { getErrorMessage } from "@/lib/errors";
import { primaryGradient } from "@/theme/theme";

type NoticeRecord = GetAllNoticesQuery["getAllNotices"][number];

type NoticeStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED" | string;

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

const STATUS_COLOR: Record<string, "default" | "success" | "warning" | "error"> = {
  DRAFT: "default",
  PUBLISHED: "success",
  ARCHIVED: "warning",
};

// ── Create Notice Form ────────────────────────────────────────────────────────

const createNoticeSchema = yup
  .object({
    title: yup.string().trim().required("Title is required"),
    body: yup.string().trim().required("Body is required"),
    expiresAt: yup.string().default(""),
    targetBatchIds: yup.array(yup.string().required()).default([]),
  })
  .required();

type CreateNoticeFormValues = yup.InferType<typeof createNoticeSchema>;

type CreateNoticeDialogProps = {
  open: boolean;
  isSubmitting: boolean;
  batchCheckboxOptions: { label: string; value: string }[];
  errorMessage: string | null;
  onClose: () => void;
  onSubmit: (values: CreateNoticeFormValues) => Promise<void>;
};

function CreateNoticeDialog({
  open,
  isSubmitting,
  batchCheckboxOptions,
  errorMessage,
  onClose,
  onSubmit,
}: CreateNoticeDialogProps) {
  const { control, handleSubmit, reset } = useForm<CreateNoticeFormValues>({
    resolver: yupResolver(createNoticeSchema),
    defaultValues: {
      title: "",
      body: "",
      expiresAt: "",
      targetBatchIds: [],
    },
    mode: "onTouched",
  });

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : handleClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Create Notice</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            {errorMessage ? (
              <Alert severity="error">{errorMessage}</Alert>
            ) : null}
            <RhfTextField
              control={control}
              name="title"
              label="Title"
              placeholder="e.g. Mid-term schedule update"
              trim
              fullWidth
            />
            <RhfTextField
              control={control}
              name="body"
              label="Body"
              placeholder="Write the notice content here…"
              multiline
              rows={4}
              trim
              fullWidth
            />
            <RhfTextField
              control={control}
              name="expiresAt"
              label="Expires at (optional)"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            {batchCheckboxOptions.length > 0 && (
              <RhfCheckboxGroup
                control={control}
                name="targetBatchIds"
                label="Target batches (optional — leave unchecked for all)"
                options={batchCheckboxOptions}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} disabled={isSubmitting} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Create Notice
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

// ── Main Workspace ────────────────────────────────────────────────────────────

export function NoticeWorkspace() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  const {
    data: noticesData,
    loading: noticesLoading,
    refetch: refetchNotices,
  } = useQuery(GetAllNoticesDocument);

  const { data: batchesData } = useQuery(GetAllBatchesDocument);

  const [createNotice, createNoticeState] = useMutation(CreateNoticeDocument);
  const [publishNotice] = useMutation(PublishNoticeDocument);
  const [archiveNotice] = useMutation(ArchiveNoticeDocument);

  const notices = noticesData?.getAllNotices ?? [];
  const batches = batchesData?.getAllBatches ?? [];

  const batchNameMap = new Map(batches.map((b) => [b.id, b.name]));

  const batchCheckboxOptions = batches.map((b) => ({
    label: b.name,
    value: b.id,
  }));

  const totalNotices = notices.length;
  const publishedNotices = notices.filter((n) => n.status === "PUBLISHED").length;
  const draftNotices = notices.filter((n) => n.status === "DRAFT").length;

  const handlePublish = async (noticeId: string) => {
    try {
      await publishNotice({ variables: { noticeId } });
      toast.success("Notice published.");
      await refetchNotices();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to publish notice."));
    }
  };

  const handleArchive = async (noticeId: string) => {
    try {
      await archiveNotice({ variables: { noticeId } });
      toast.success("Notice archived.");
      await refetchNotices();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to archive notice."));
    }
  };

  const handleCreate = async (values: CreateNoticeFormValues) => {
    setCreateError(null);
    try {
      await createNotice({
        variables: {
          notice: {
            title: values.title,
            body: values.body,
            expiresAt: values.expiresAt?.trim() || undefined,
            targetBatchIds:
              values.targetBatchIds && values.targetBatchIds.length > 0
                ? values.targetBatchIds
                : undefined,
          },
        },
      });
      toast.success("Notice created.");
      await refetchNotices();
      setIsCreateOpen(false);
    } catch (error) {
      const message = getErrorMessage(error, "Unable to create notice.");
      setCreateError(message);
      toast.error(message);
    }
  };

  const columns: MRT_ColumnDef<NoticeRecord>[] = [
    {
      accessorKey: "title",
      header: "Title",
      size: 260,
      Cell: ({ row }) => (
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <AnnouncementRounded
            sx={{ fontSize: 16, color: "text.secondary", flexShrink: 0, mt: 0.25 }}
          />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {row.original.title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.25,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {row.original.body}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 120,
      Cell: ({ cell }) => {
        const status = cell.getValue<NoticeStatus>().toUpperCase();
        return (
          <Chip
            label={STATUS_LABEL[status] ?? status}
            color={STATUS_COLOR[status] ?? "default"}
            size="small"
            variant={status === "PUBLISHED" ? "filled" : "outlined"}
          />
        );
      },
    },
    {
      id: "publishedAt",
      header: "Published",
      size: 160,
      Cell: ({ row }) => (
        <Typography
          variant="body2"
          color={!row.original.publishedAt ? "text.disabled" : undefined}
        >
          {row.original.publishedAt
            ? new Date(row.original.publishedAt).toLocaleDateString()
            : "—"}
        </Typography>
      ),
    },
    {
      id: "expiresAt",
      header: "Expires",
      size: 160,
      Cell: ({ row }) => (
        <Typography
          variant="body2"
          color={!row.original.expiresAt ? "text.disabled" : undefined}
        >
          {row.original.expiresAt
            ? new Date(row.original.expiresAt).toLocaleDateString()
            : "No expiry"}
        </Typography>
      ),
    },
    {
      id: "targetBatches",
      header: "Target Batches",
      size: 200,
      Cell: ({ row }) => {
        const ids = row.original.targetBatchIds;
        if (!ids.length) {
          return (
            <Typography variant="body2" color="text.disabled">
              All batches
            </Typography>
          );
        }
        return (
          <Stack direction="row" spacing={0.5} flexWrap="wrap">
            {ids.slice(0, 3).map((id) => (
              <Chip
                key={id}
                label={batchNameMap.get(id) ?? id}
                size="small"
                variant="outlined"
              />
            ))}
            {ids.length > 3 && (
              <Chip label={`+${ids.length - 3}`} size="small" />
            )}
          </Stack>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      size: 200,
      enableSorting: false,
      Cell: ({ row }) => {
        const notice = row.original;
        const status = notice.status.toUpperCase();
        return (
          <Stack direction="row" spacing={0.75}>
            {status === "DRAFT" && (
              <Button
                size="small"
                variant="outlined"
                color="success"
                startIcon={<PublishRounded />}
                onClick={() => handlePublish(notice.id)}
              >
                Publish
              </Button>
            )}
            {status !== "ARCHIVED" && (
              <Button
                size="small"
                variant="outlined"
                color="warning"
                startIcon={<ArchiveRounded />}
                onClick={() => handleArchive(notice.id)}
              >
                Archive
              </Button>
            )}
            {status === "ARCHIVED" && (
              <Chip
                label="Archived"
                icon={<CheckCircleRounded />}
                size="small"
                variant="outlined"
                color="warning"
              />
            )}
          </Stack>
        );
      },
    },
  ];

  return (
    <>
      <Stack spacing={3}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            border: "1px solid",
            borderColor: "divider",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(255,251,235,0.98) 100%)",
          }}
        >
          <Stack
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            spacing={3}
          >
            <Box sx={{ maxWidth: 760 }}>
              <Typography variant="h4" component="h1" sx={{ mt: 0.5 }}>
                Notice Board
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Post announcements and notices for students, staff, and specific
                batches.
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
                onClick={() => {
                  setCreateError(null);
                  setFormKey((k) => k + 1);
                  setIsCreateOpen(true);
                }}
                fullWidth
                sx={{
                  maxWidth: { xs: "100%", lg: 220 },
                  backgroundImage: primaryGradient,
                }}
              >
                Post Notice
              </Button>
            </Box>
          </Stack>
        </Paper>

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
            caption="Total Notices"
            title={String(totalNotices)}
            icon={<AnnouncementRounded />}
          />
          <SummaryCard
            caption="Published"
            title={String(publishedNotices)}
            icon={<CheckCircleRounded />}
            tone="success"
          />
          <SummaryCard
            caption="Drafts"
            title={String(draftNotices)}
            icon={<PublishRounded />}
          />
        </Box>

        <MaterialReactTable
          columns={columns}
          data={notices}
          enableColumnFilters
          enableDensityToggle={false}
          enableFullScreenToggle={false}
          enableHiding={false}
          enableSorting
          enableStickyHeader
          getRowId={(row) => row.id}
          localization={{ noRecordsToDisplay: "No notices yet" }}
          muiSearchTextFieldProps={{
            placeholder: "Search notices",
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
          muiTableBodyRowProps={{
            sx: {
              bgcolor: "#ffffff",
              transition: "background-color 140ms ease",
              "&:hover td": { bgcolor: alpha("#fffbeb", 0.9) },
            },
          }}
          muiTableBodyCellProps={{
            sx: {
              bgcolor: "#ffffff",
              borderBottom: "1px solid",
              borderColor: alpha("#0f172a", 0.06),
              py: 2.25,
            },
          }}
          muiTableContainerProps={{ sx: { maxHeight: 600, bgcolor: "#ffffff" } }}
          muiTableHeadCellProps={{
            sx: {
              bgcolor: "#ffffff",
              color: alpha("#0f172a", 0.72),
              fontSize: 13,
              fontWeight: 700,
              py: 1.75,
              borderBottom: "1px solid",
              borderColor: alpha("#0f172a", 0.08),
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
          renderEmptyRowsFallback={() => (
            <Box sx={{ px: 3, py: 6, textAlign: "center" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                No notices yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Post a notice to inform students and staff.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddRounded />}
                onClick={() => {
                  setCreateError(null);
                  setFormKey((k) => k + 1);
                  setIsCreateOpen(true);
                }}
                sx={{ mt: 2 }}
              >
                Post first notice
              </Button>
            </Box>
          )}
          renderTopToolbarCustomActions={() => (
            <Typography variant="body2" color="text.secondary">
              {publishedNotices} published · {draftNotices} draft
              {draftNotices !== 1 ? "s" : ""}
            </Typography>
          )}
          state={{
            isLoading: noticesLoading,
            showProgressBars: noticesLoading,
          }}
        />
      </Stack>

      <CreateNoticeDialog
        key={formKey}
        open={isCreateOpen}
        isSubmitting={createNoticeState.loading}
        batchCheckboxOptions={batchCheckboxOptions}
        errorMessage={createError}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />
    </>
  );
}
