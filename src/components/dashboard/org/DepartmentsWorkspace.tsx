"use client";

import { useState } from "react";
import {
  AccountTreeRounded,
  AddRounded,
  BusinessRounded,
  CheckCircleOutlineRounded,
  EditRounded,
  GroupsRounded,
} from "@mui/icons-material";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { toast } from "react-hot-toast";
import { SummaryCard } from "@/components/ui";
import {
  CreateDepartmentDocument,
  GetDepartmentsDocument,
  UpdateDepartmentDocument,
  type GetDepartmentsQuery,
} from "@/graphql/generated";
import { getErrorMessage } from "@/lib/errors";
import { primaryGradient } from "@/theme/theme";
import {
  DepartmentFormDialog,
  type DepartmentFormValues,
} from "./DepartmentFormDialog";
import type { RhfSelectOption } from "@/components/form";

type DeptRecord = GetDepartmentsQuery["getDepartments"][number];

const STATUS_COLORS: Record<string, "success" | "default" | "error"> = {
  ACTIVE: "success",
  INACTIVE: "error",
};

const buildColumns = ({
  deptLookup,
  onEdit,
}: {
  deptLookup: Map<string, string>;
  onEdit: (dept: DeptRecord) => void;
}): MRT_ColumnDef<DeptRecord>[] => [
  {
    accessorKey: "name",
    header: "Name",
    size: 220,
    Cell: ({ row }) => (
      <Stack direction="row" alignItems="center" spacing={1}>
        <BusinessRounded sx={{ fontSize: 16, color: "text.secondary" }} />
        <Typography variant="subtitle2" fontWeight={700}>
          {row.original.name}
        </Typography>
      </Stack>
    ),
  },
  {
    accessorKey: "code",
    header: "Code",
    size: 100,
    Cell: ({ cell }) => (
      <Chip label={String(cell.getValue())} size="small" variant="outlined" sx={{ fontFamily: "monospace" }} />
    ),
  },
  {
    id: "parent",
    accessorFn: (row) =>
      row.parentDepartmentId ? (deptLookup.get(row.parentDepartmentId) ?? "—") : "—",
    header: "Parent",
    size: 180,
    Cell: ({ cell }) => (
      <Typography variant="body2" color={String(cell.getValue()) === "—" ? "text.disabled" : undefined}>
        {String(cell.getValue())}
      </Typography>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    size: 240,
    Cell: ({ cell }) => (
      <Typography variant="body2" color={!cell.getValue() ? "text.disabled" : undefined} noWrap>
        {String(cell.getValue() ?? "—")}
      </Typography>
    ),
  },
  {
    id: "roles",
    accessorFn: (row) => (row.defaultRoles ?? []).join(", ") || "—",
    header: "Default roles",
    size: 180,
    Cell: ({ row }) => {
      const roles = row.original.defaultRoles ?? [];
      if (!roles.length) return <Typography variant="body2" color="text.disabled">—</Typography>;
      return (
        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          {roles.map((r) => (
            <Chip key={r} label={r} size="small" />
          ))}
        </Stack>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 110,
    Cell: ({ cell }) => {
      const val = String(cell.getValue());
      return (
        <Chip
          label={val}
          size="small"
          color={STATUS_COLORS[val] ?? "default"}
          variant="outlined"
        />
      );
    },
  },
  {
    id: "actions",
    header: "",
    size: 60,
    enableColumnFilter: false,
    enableSorting: false,
    Cell: ({ row }) => (
      <Tooltip title="Edit department">
        <IconButton size="small" onClick={() => onEdit(row.original)}>
          <EditRounded fontSize="small" />
        </IconButton>
      </Tooltip>
    ),
  },
];

const emptyCreate: DepartmentFormValues = {
  name: "",
  code: "",
  description: "",
  parentDepartmentId: "",
  status: "ACTIVE",
};

export function DepartmentsWorkspace() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createKey, setCreateKey] = useState(0);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<DeptRecord | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const {
    data,
    loading: isLoading,
    error: loadError,
    refetch,
  } = useQuery(GetDepartmentsDocument, { fetchPolicy: "cache-and-network" });

  const [createDepartment, createState] = useMutation(CreateDepartmentDocument);
  const [updateDepartment, updateState] = useMutation(UpdateDepartmentDocument);

  const departments = data?.getDepartments ?? [];
  const deptLookup = new Map(departments.map((d) => [d.id, d.name]));

  const activeCount = departments.filter((d) => d.status === "ACTIVE").length;

  const parentOptions: RhfSelectOption[] = [
    { label: "None (top-level)", value: "" },
    ...departments.map((d) => ({ label: d.name, value: d.id })),
  ];

  const openCreate = () => {
    setCreateError(null);
    setCreateKey((k) => k + 1);
    setIsCreateOpen(true);
  };

  const openEdit = (dept: DeptRecord) => {
    setEditError(null);
    setEditTarget(dept);
  };

  const handleCreate = async (values: DepartmentFormValues, defaultRoles: string[]) => {
    setCreateError(null);
    try {
      const result = await createDepartment({
        variables: {
          input: {
            name: values.name.trim(),
            code: values.code.trim().toUpperCase(),
            description: values.description?.trim() || undefined,
            parentDepartmentId: values.parentDepartmentId || undefined,
            defaultRoles: defaultRoles.length ? defaultRoles : undefined,
          },
        },
      });
      if (result.error) throw result.error;
      await refetch();
      toast.success("Department created.");
      setIsCreateOpen(false);
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to create department.");
      setCreateError(msg);
      toast.error(msg);
    }
  };

  const handleEdit = async (values: DepartmentFormValues, defaultRoles: string[]) => {
    if (!editTarget) return;
    setEditError(null);
    try {
      const result = await updateDepartment({
        variables: {
          id: editTarget.id,
          input: {
            name: values.name.trim(),
            description: values.description?.trim() || undefined,
            status: values.status,
            defaultRoles: defaultRoles.length ? defaultRoles : undefined,
          },
        },
      });
      if (result.error) throw result.error;
      await refetch();
      toast.success("Department updated.");
      setEditTarget(null);
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to update department.");
      setEditError(msg);
      toast.error(msg);
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
            background: "linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(240,253,250,0.98) 100%)",
          }}
        >
          <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" spacing={3}>
            <Box sx={{ maxWidth: 720 }}>
              <Typography variant="h4" component="h1" sx={{ mt: 0.5 }}>
                Organization Structure
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Define your organization&apos;s departments, assign default roles, and build a parent-child hierarchy.
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: { xs: "stretch", lg: "flex-end" } }}>
              <Button
                variant="contained"
                startIcon={<AddRounded />}
                onClick={openCreate}
                sx={{ backgroundImage: primaryGradient, maxWidth: { xs: "100%", lg: 200 } }}
                fullWidth
              >
                New department
              </Button>
            </Box>
          </Stack>
        </Paper>

        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" } }}>
          <SummaryCard caption="Total departments" title={String(departments.length)} icon={<BusinessRounded />} />
          <SummaryCard caption="Active" title={String(activeCount)} icon={<CheckCircleOutlineRounded />} tone="success" />
          <SummaryCard caption="Sub-departments" title={String(departments.filter((d) => !!d.parentDepartmentId).length)} icon={<AccountTreeRounded />} />
        </Box>

        {loadError ? (
          <Alert severity="error">{loadError.message || "Unable to load departments."}</Alert>
        ) : null}

        <MaterialReactTable
          columns={buildColumns({ deptLookup, onEdit: openEdit })}
          data={departments}
          enableColumnFilters
          enableDensityToggle={false}
          enableFullScreenToggle={false}
          enableHiding={false}
          enableSorting
          enableStickyHeader
          getRowId={(row) => row.id}
          initialState={{ pagination: { pageIndex: 0, pageSize: 20 } }}
          localization={{ noRecordsToDisplay: "No departments yet" }}
          muiSearchTextFieldProps={{ placeholder: "Search departments", size: "small", sx: { minWidth: { xs: "100%", md: 280 } } }}
          muiTableBodyRowProps={{ sx: { bgcolor: "#ffffff", transition: "background-color 140ms ease", "&:hover td": { bgcolor: alpha("#ecfdf5", 0.9) } } }}
          muiTableBodyCellProps={{ sx: { bgcolor: "#ffffff", borderBottom: "1px solid", borderColor: alpha("#0f172a", 0.06), py: 2.25 } }}
          muiTableContainerProps={{ sx: { maxHeight: 580, bgcolor: "#ffffff" } }}
          muiTableHeadCellProps={{ sx: { bgcolor: "#ffffff", color: alpha("#0f172a", 0.72), fontSize: 13, fontWeight: 700, py: 1.75, borderBottom: "1px solid", borderColor: alpha("#0f172a", 0.08) } }}
          muiTablePaperProps={{ elevation: 0, sx: { border: "1px solid", borderColor: alpha("#0f172a", 0.08), borderRadius: 2, overflow: "hidden", bgcolor: "#ffffff", boxShadow: `0 16px 40px ${alpha("#0f172a", 0.06)}` } }}
          muiTopToolbarProps={{ sx: { px: 2.5, py: 1.75, bgcolor: "#ffffff", borderBottom: "1px solid", borderColor: alpha("#0f172a", 0.08) } }}
          muiBottomToolbarProps={{ sx: { borderTop: "1px solid", borderColor: alpha("#0f172a", 0.08), bgcolor: "#ffffff" } }}
          renderEmptyRowsFallback={() => (
            <Box sx={{ px: 3, py: 6, textAlign: "center" }}>
              <GroupsRounded sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
              <Typography variant="subtitle1" fontWeight={700}>No departments yet</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Create your first department to start organizing staff.
              </Typography>
              <Button variant="outlined" startIcon={<AddRounded />} onClick={openCreate} sx={{ mt: 2 }}>
                Create department
              </Button>
            </Box>
          )}
          renderTopToolbarCustomActions={() => (
            <Typography variant="body2" color="text.secondary">
              {departments.length} department{departments.length === 1 ? "" : "s"}
            </Typography>
          )}
          state={{ isLoading, showProgressBars: isLoading }}
        />
      </Stack>

      <DepartmentFormDialog
        key={`create-${createKey}`}
        open={isCreateOpen}
        mode="create"
        isSubmitting={createState.loading}
        initialValues={emptyCreate}
        parentOptions={parentOptions}
        errorMessage={createError}
        onClose={() => !createState.loading && setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />

      {editTarget && (
        <DepartmentFormDialog
          key={`edit-${editTarget.id}`}
          open={!!editTarget}
          mode="edit"
          isSubmitting={updateState.loading}
          initialValues={{
            name: editTarget.name,
            code: editTarget.code,
            description: editTarget.description ?? "",
            parentDepartmentId: editTarget.parentDepartmentId ?? "",
            status: editTarget.status,
          }}
          parentOptions={parentOptions.filter((o) => o.value !== editTarget.id)}
          errorMessage={editError}
          onClose={() => !updateState.loading && setEditTarget(null)}
          onSubmit={handleEdit}
        />
      )}
    </>
  );
}
