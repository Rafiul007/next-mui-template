"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  AddRounded,
  ApartmentRounded,
  BlockRounded,
  CallRounded,
  EditRounded,
  PlaceRounded,
  ScheduleRounded,
  StorefrontRounded,
  SupervisorAccountRounded,
} from "@mui/icons-material";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Alert,
  Box,
  Button,
  Chip,
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
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { toast } from "react-hot-toast";
import type { RhfSelectOption } from "@/components/form";
import { BranchFormDialog, type BranchFormValues } from "./BranchFormDialog";
import {
  CreateBranchDocument,
  DeactivateBranchDocument,
  GetBranchesDocument,
  GetCenterDocument,
  GetUsersDocument,
  UpdateBranchDocument,
  type GetBranchesQuery,
  type GetUsersQuery,
} from "@/graphql/generated";
import { getErrorMessage } from "@/lib/errors";
import { primaryGradient } from "@/theme/theme";

type BranchRecord = GetBranchesQuery["getBranches"][number];
type UserRecord = NonNullable<GetUsersQuery["getUsers"][number]>;

const emptyBranchFormValues: BranchFormValues = {
  name: "",
  address: "",
  phone: "",
  managerId: "",
  openTime: "",
  closeTime: "",
  workingDays: [],
};

const isInactiveStatus = (status: string) =>
  /inactive|deactivated|disabled/i.test(status);

const formatPersonName = (user: UserRecord) =>
  `${user.firstName} ${user.lastName}`.trim() || user.email;

const formatBranchStatus = (status: string) => {
  if (isInactiveStatus(status)) {
    return "Inactive";
  }

  if (/active/i.test(status)) {
    return "Active";
  }

  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatSchedule = (
  openTime?: string | null,
  closeTime?: string | null,
) => {
  if (!openTime && !closeTime) {
    return "Not set";
  }

  if (openTime && closeTime) {
    return `${openTime} - ${closeTime}`;
  }

  return openTime ?? closeTime ?? "Not set";
};

const formatWorkingDays = (workingDays?: string[] | null) => {
  if (!workingDays?.length) {
    return "Not set";
  }

  if (workingDays.length <= 2) {
    return workingDays.join(", ");
  }

  return `${workingDays.slice(0, 2).join(", ")} +${workingDays.length - 2}`;
};

const toOptionalString = (value: string) => {
  const trimmedValue = value.trim();

  return trimmedValue ? trimmedValue : undefined;
};

const getBranchFormValues = (
  branch?: BranchRecord | null,
): BranchFormValues => {
  if (!branch) {
    return emptyBranchFormValues;
  }

  return {
    name: branch.name,
    address: branch.address ?? "",
    phone: branch.phone ?? "",
    managerId: branch.managerId ?? "",
    openTime: branch.openTime ?? "",
    closeTime: branch.closeTime ?? "",
    workingDays: branch.workingDays ?? [],
  };
};

const buildBranchColumns = ({
  managerLookup,
  statusOptions,
}: {
  managerLookup: Map<string, string>;
  statusOptions: string[];
}): MRT_ColumnDef<BranchRecord>[] => [
  {
    accessorKey: "name",
    header: "Branch",
    size: 220,
    Cell: ({ row }) => (
      <Stack spacing={0.5}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {row.original.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {row.original.address || "No address provided"}
        </Typography>
      </Stack>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 110,
    filterVariant: "select",
    filterFn: "equals",
    filterSelectOptions: statusOptions,
    Cell: ({ cell }) => {
      const status = String(cell.getValue());
      const inactive = isInactiveStatus(status);

      return (
        <Chip
          label={formatBranchStatus(status)}
          color={inactive ? "default" : "success"}
          variant={inactive ? "outlined" : "filled"}
          size="small"
        />
      );
    },
  },
  {
    id: "manager",
    accessorFn: (branch) =>
      branch.managerId
        ? (managerLookup.get(branch.managerId) ?? "Unknown")
        : "Unassigned",
    header: "Manager",
    size: 180,
    Cell: ({ cell }) => (
      <Stack direction="row" spacing={1} alignItems="center">
        <SupervisorAccountRounded
          sx={{ fontSize: 18, color: "text.secondary" }}
        />
        <Typography variant="body2">{String(cell.getValue())}</Typography>
      </Stack>
    ),
  },
  {
    id: "schedule",
    accessorFn: (branch) => formatSchedule(branch.openTime, branch.closeTime),
    header: "Hours",
    size: 160,
    enableColumnFilter: false,
    Cell: ({ row }) => (
      <Stack direction="row" spacing={1} alignItems="center">
        <ScheduleRounded sx={{ fontSize: 18, color: "text.secondary" }} />
        <Typography variant="body2">
          {formatSchedule(row.original.openTime, row.original.closeTime)}
        </Typography>
      </Stack>
    ),
  },
  {
    id: "workingDays",
    accessorFn: (branch) => formatWorkingDays(branch.workingDays),
    header: "Working Days",
    size: 170,
    Cell: ({ row }) => (
      <Typography variant="body2">
        {formatWorkingDays(row.original.workingDays)}
      </Typography>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    size: 140,
    Cell: ({ row }) => (
      <Stack direction="row" spacing={1} alignItems="center">
        <CallRounded sx={{ fontSize: 18, color: "text.secondary" }} />
        <Typography variant="body2">
          {row.original.phone || "Not set"}
        </Typography>
      </Stack>
    ),
  },
  {
    accessorKey: "address",
    header: "Address",
    size: 260,
    Cell: ({ row }) => (
      <Stack direction="row" spacing={1} alignItems="center">
        <PlaceRounded sx={{ fontSize: 18, color: "text.secondary" }} />
        <Typography variant="body2">
          {row.original.address || "Not set"}
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
  tone?: "default" | "success" | "muted";
}) {
  const borderColor =
    tone === "success"
      ? alpha("#10b981", 0.22)
      : tone === "muted"
        ? alpha("#64748b", 0.16)
        : alpha("#0f172a", 0.08);

  const iconBackground =
    tone === "success" ? alpha("#10b981", 0.12) : alpha("#0f172a", 0.06);

  const iconColor = tone === "success" ? "#047857" : "#0f172a";

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

export function BranchesWorkspace() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedBranch, setSelectedBranch] = useState<BranchRecord | null>(
    null,
  );
  const [branchToDeactivate, setBranchToDeactivate] =
    useState<BranchRecord | null>(null);
  const [formDialogKey, setFormDialogKey] = useState(0);
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);

  const {
    data: centerData,
    error: centerError,
    loading: isCenterLoading,
  } = useQuery(GetCenterDocument);
  const {
    data: usersData,
    error: usersError,
    loading: isUsersLoading,
  } = useQuery(GetUsersDocument, {
    variables: {
      page: 1,
      limit: 200,
    },
  });
  const {
    data: branchesData,
    error: branchesError,
    loading: isBranchesLoading,
    refetch: refetchBranches,
  } = useQuery(GetBranchesDocument, {
    skip: !centerData?.getCenter?.id,
    variables: {
      centerId: centerData?.getCenter?.id ?? "",
    },
  });

  const [createBranch, createBranchState] = useMutation(CreateBranchDocument);
  const [updateBranch, updateBranchState] = useMutation(UpdateBranchDocument);
  const [deactivateBranch, deactivateBranchState] = useMutation(
    DeactivateBranchDocument,
  );

  const center = centerData?.getCenter ?? null;
  const effectiveCenter = center;
  const branches = branchesData?.getBranches ?? [];
  const users = (usersData?.getUsers ?? []).filter(
    (user): user is UserRecord => !!user,
  );
  const managerLookup = new Map(
    users.map((user) => [user.id, formatPersonName(user)]),
  );
  const managerOptions: RhfSelectOption[] = [
    { label: "Unassigned", value: "" },
    ...users.map((user) => ({
      label: formatPersonName(user),
      value: user.id,
    })),
  ];
  const statusOptions = Array.from(
    new Set(branches.map((branch) => branch.status)),
  );
  const activeBranchesCount = branches.filter(
    (branch) => !isInactiveStatus(branch.status),
  ).length;
  const inactiveBranchesCount = branches.length - activeBranchesCount;
  const managedBranchesCount = branches.filter(
    (branch) => !!branch.managerId,
  ).length;
  const isSavingBranch = createBranchState.loading || updateBranchState.loading;
  const isWorkspaceLoading =
    isCenterLoading ||
    isUsersLoading ||
    (Boolean(center?.id) && isBranchesLoading);
  const loadError = centerError ?? usersError ?? branchesError;

  const openCreateDialog = () => {
    setFormMode("create");
    setSelectedBranch(null);
    setFormErrorMessage(null);
    setFormDialogKey((current) => current + 1);
    setIsFormOpen(true);
  };

  const openEditDialog = (branch: BranchRecord) => {
    setFormMode("edit");
    setSelectedBranch(branch);
    setFormErrorMessage(null);
    setFormDialogKey((current) => current + 1);
    setIsFormOpen(true);
  };

  const closeFormDialog = () => {
    if (!isSavingBranch) {
      setIsFormOpen(false);
      setSelectedBranch(null);
      setFormErrorMessage(null);
    }
  };

  const closeDeactivateDialog = () => {
    if (!deactivateBranchState.loading) {
      setBranchToDeactivate(null);
    }
  };

  const handleSubmitBranch = async (values: BranchFormValues) => {
    if (!center?.id) {
      setFormErrorMessage(
        "Set up your center profile before creating or editing branches.",
      );
      return;
    }

    setFormErrorMessage(null);

    try {
      if (formMode === "edit" && selectedBranch) {
        const result = await updateBranch({
          variables: {
            branch: {
              id: selectedBranch.id,
              name: values.name.trim(),
              address: toOptionalString(values.address),
              phone: toOptionalString(values.phone),
              managerId: toOptionalString(values.managerId),
              openTime: toOptionalString(values.openTime),
              closeTime: toOptionalString(values.closeTime),
              workingDays: values.workingDays.length
                ? values.workingDays
                : undefined,
            },
          },
        });

        if (result.error) {
          throw result.error;
        }

        toast.success("Branch details updated.");
      } else {
        const result = await createBranch({
          variables: {
            branch: {
              centerId: center.id,
              name: values.name.trim(),
              address: toOptionalString(values.address),
              phone: toOptionalString(values.phone),
              managerId: toOptionalString(values.managerId),
              openTime: toOptionalString(values.openTime),
              closeTime: toOptionalString(values.closeTime),
              workingDays: values.workingDays.length
                ? values.workingDays
                : undefined,
            },
          },
        });

        if (result.error) {
          throw result.error;
        }

        toast.success("Branch created successfully.");
      }

      await refetchBranches();
      closeFormDialog();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to save branch.");

      setFormErrorMessage(message);
      toast.error(message);
    }
  };

  const handleDeactivateBranch = async () => {
    if (!branchToDeactivate) {
      return;
    }

    try {
      const result = await deactivateBranch({
        variables: {
          branchId: branchToDeactivate.id,
        },
      });

      if (result.error) {
        throw result.error;
      }

      await refetchBranches();
      toast.success(`${branchToDeactivate.name} was deactivated.`);
      setBranchToDeactivate(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to deactivate branch."));
    }
  };

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
                Branch management
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {effectiveCenter
                  ? `Active center: ${effectiveCenter.name}`
                  : "Center details are not configured yet."}
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
                disabled={!effectiveCenter}
                fullWidth
                sx={{
                  maxWidth: { xs: "100%", lg: 220 },
                  backgroundImage: primaryGradient,
                }}
              >
                Add Branch
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
              sm: "repeat(2, minmax(0, 1fr))",
              xl: "repeat(4, minmax(0, 1fr))",
            },
          }}
        >
          <SummaryCard
            caption="Total Branches"
            title={String(branches.length)}
            icon={<StorefrontRounded />}
          />
          <SummaryCard
            caption="Active Branches"
            title={String(activeBranchesCount)}
            icon={<ApartmentRounded />}
            tone="success"
          />
          <SummaryCard
            caption="Inactive Branches"
            title={String(inactiveBranchesCount)}
            icon={<BlockRounded />}
            tone="muted"
          />
          <SummaryCard
            caption="Assigned Managers"
            title={String(managedBranchesCount)}
            icon={<SupervisorAccountRounded />}
          />
        </Box>

        {loadError ? (
          <Alert severity="error">
            {loadError.message || "Unable to load branch data right now."}
          </Alert>
        ) : null}

        {!effectiveCenter ? (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack spacing={2}>
              <Typography variant="h6">
                Center details are required first
              </Typography>
              <Typography variant="body2" color="text.secondary">
                A branch must belong to a center. Complete the center profile
                before creating branches.
              </Typography>
              <Button
                component={Link}
                href="/dashboard/tenant-setup/center-profile"
                variant="outlined"
                sx={{ alignSelf: "flex-start" }}
              >
                Open center details
              </Button>
            </Stack>
          </Paper>
        ) : (
          <MaterialReactTable
            columns={buildBranchColumns({ managerLookup, statusOptions })}
            data={branches}
            enableColumnFilters
            enableDensityToggle={false}
            enableFullScreenToggle={false}
            enableHiding={false}
            enableRowActions
            enableSorting
            enableStickyHeader
            getRowId={(row) => row.id}
            initialState={{
              pagination: { pageIndex: 0, pageSize: 10 },
              showColumnFilters: true,
              sorting: [{ id: "name", desc: false }],
            }}
            localization={{
              actions: "Actions",
              noRecordsToDisplay: "No branches found",
            }}
            positionActionsColumn="last"
            muiSearchTextFieldProps={{
              placeholder: "Search branches",
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
                opacity: isInactiveStatus(row.original.status) ? 0.76 : 1,
                bgcolor: "#ffffff",
                transition:
                  "background-color 140ms ease, transform 140ms ease, box-shadow 140ms ease",
                "&:hover td": {
                  bgcolor: alpha("#ecfdf5", 0.9),
                },
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
            muiTableContainerProps={{
              sx: {
                maxHeight: 640,
                bgcolor: "#ffffff",
              },
            }}
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
                muiTableBodyCellProps: {
                  sx: {
                    pr: 2,
                    bgcolor: "#ffffff",
                  },
                },
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
              <Box
                sx={{
                  px: 3,
                  py: 6,
                  textAlign: "center",
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  No branches yet
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Add your first branch to start organizing locations and
                  managers.
                </Typography>
              </Box>
            )}
            renderRowActions={({ row }) => (
              <Stack
                direction="row"
                spacing={0.5}
                justifyContent="flex-end"
                sx={{ width: "100%" }}
              >
                <Tooltip title="Edit branch">
                  <IconButton
                    size="small"
                    onClick={() => openEditDialog(row.original)}
                    sx={{
                      bgcolor: alpha("#0f172a", 0.04),
                    }}
                  >
                    <EditRounded fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Deactivate branch">
                  <span>
                    <IconButton
                      size="small"
                      disabled={isInactiveStatus(row.original.status)}
                      onClick={() => setBranchToDeactivate(row.original)}
                      sx={{
                        bgcolor: alpha("#ef4444", 0.08),
                        color: "#b91c1c",
                      }}
                    >
                      <BlockRounded fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            )}
            renderTopToolbarCustomActions={() => (
              <Typography variant="body2" color="text.secondary">
                {branches.length} branch{branches.length === 1 ? "" : "es"}{" "}
                linked to {effectiveCenter.name}
              </Typography>
            )}
            state={{
              isLoading: isWorkspaceLoading,
              showProgressBars: isWorkspaceLoading,
            }}
          />
        )}
      </Stack>

      <BranchFormDialog
        key={formDialogKey}
        centerName={effectiveCenter?.name}
        errorMessage={formErrorMessage}
        initialValues={getBranchFormValues(selectedBranch)}
        isSubmitting={isSavingBranch}
        managerOptions={managerOptions}
        mode={formMode}
        onClose={closeFormDialog}
        onSubmit={handleSubmitBranch}
        open={isFormOpen}
      />

      <Dialog
        open={!!branchToDeactivate}
        onClose={closeDeactivateDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Deactivate branch</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {branchToDeactivate
              ? `This will mark ${branchToDeactivate.name} as inactive. You can still keep its history for reference.`
              : ""}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            color="inherit"
            onClick={closeDeactivateDialog}
            disabled={deactivateBranchState.loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeactivateBranch}
            disabled={deactivateBranchState.loading}
          >
            Deactivate
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
