"use client";

import { useMemo, useState } from "react";
import { AddRounded } from "@mui/icons-material";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  alpha,
} from "@mui/material";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { toast } from "react-hot-toast";
import {
  ActivateTenantDocument,
  GetSubscriptionPlansDocument,
  GetTenantsDocument,
  ImpersonateTenantDocument,
  SuspendTenantDocument,
  TerminateTenantDocument,
} from "@/graphql/generated";
import { getErrorMessage } from "@/lib/errors";
import { primaryGradient } from "@/theme/theme";
import { STATUS_META, STATUS_TABS, formatDate } from "@/constants/tenant";
import type { ConfirmAction, TenantRecord } from "@/models/tenant";
import type { PlanRecord } from "@/models/subscription";
import { TenantConfirmDialog } from "./tenants/TenantConfirmDialog";
import { TenantFormDialog } from "./tenants/TenantFormDialog";
import { TenantImpersonateDialog } from "./tenants/TenantImpersonateDialog";
import { TenantRowMenu } from "./tenants/TenantRowMenu";
import { TenantStatusSummary } from "./tenants/TenantStatusSummary";

const buildTenantColumns = (
  planById: Record<string, PlanRecord>,
): MRT_ColumnDef<TenantRecord>[] => [
  {
    id: "tenant",
    accessorKey: "legalName",
    header: "Tenant",
    size: 220,
    Cell: ({ row }) => (
      <Stack spacing={0.25}>
        <Typography variant="subtitle2" fontWeight={700}>
          {row.original.legalName}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontFamily: "monospace" }}
        >
          /{row.original.slug}
        </Typography>
      </Stack>
    ),
  },
  {
    id: "contact",
    accessorFn: (row) =>
      `${row.contactName ?? ""} ${row.contactEmail}`.trim(),
    header: "Contact",
    size: 200,
    Cell: ({ row }) => (
      <Stack spacing={0.25}>
        <Typography variant="body2">{row.original.contactName ?? "—"}</Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {row.original.contactEmail}
        </Typography>
      </Stack>
    ),
  },
  {
    id: "plan",
    accessorFn: (row) =>
      planById[row.planId]?.name ?? row.planId.slice(0, 8),
    header: "Plan",
    size: 150,
    Cell: ({ row }) => {
      const plan = planById[row.original.planId];
      return (
        <Chip
          label={plan?.name ?? row.original.planId.slice(0, 8)}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: alpha("#10b981", 0.08),
            color: "primary.dark",
          }}
        />
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 110,
    Cell: ({ cell }) => {
      const meta =
        STATUS_META[String(cell.getValue()).toLowerCase()] ??
        STATUS_META.terminated;
      return (
        <Chip
          label={meta.label}
          size="small"
          sx={{ fontWeight: 600, bgcolor: meta.bg, color: meta.color }}
        />
      );
    },
  },
  {
    accessorKey: "trialEndsAt",
    header: "Trial Ends",
    size: 120,
    enableColumnFilter: false,
    Cell: ({ cell }) => (
      <Typography variant="body2" color="text.secondary">
        {formatDate(cell.getValue() as string | null)}
      </Typography>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    size: 120,
    enableColumnFilter: false,
    Cell: ({ cell }) => (
      <Typography variant="body2" color="text.secondary">
        {formatDate(cell.getValue() as string | null)}
      </Typography>
    ),
  },
];

export function TenantsWorkspace() {
  const [tab, setTab] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [formDialogKey, setFormDialogKey] = useState(0);
  const [editTarget, setEditTarget] = useState<TenantRecord | null>(null);
  const [confirmState, setConfirmState] = useState<{
    action: ConfirmAction;
    tenant: TenantRecord;
  } | null>(null);
  const [impersonateResult, setImpersonateResult] = useState<{
    accessToken: string;
    tenantSlug: string;
  } | null>(null);
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);

  const { data, loading, error } = useQuery(GetTenantsDocument, {
    variables: { page: 1, limit: 200 },
    fetchPolicy: "cache-and-network",
  });
  const { data: plansData } = useQuery(GetSubscriptionPlansDocument);

  const tenants = useMemo(() => data?.getTenants ?? [], [data]);
  const plans = useMemo(
    () => plansData?.getSubscriptionPlans ?? [],
    [plansData],
  );
  const planById = useMemo(
    () =>
      plans.reduce<Record<string, PlanRecord>>((acc, p) => {
        acc[p.id] = p;
        return acc;
      }, {}),
    [plans],
  );

  const columns = useMemo(() => buildTenantColumns(planById), [planById]);

  const filtered = useMemo(
    () =>
      tab === "all"
        ? tenants
        : tenants.filter((t) => t.status.toLowerCase() === tab),
    [tenants, tab],
  );

  const closeConfirm = () => setConfirmState(null);

  const openCreateDialog = () => {
    setEditTarget(null);
    setFormDialogKey((k) => k + 1);
    setFormOpen(true);
  };

  const openEditDialog = (tenant: TenantRecord) => {
    setEditTarget(tenant);
    setFormDialogKey((k) => k + 1);
    setFormOpen(true);
  };

  const [activateTenant, { loading: activating }] = useMutation(
    ActivateTenantDocument,
    {
      refetchQueries: [GetTenantsDocument],
      onCompleted: () => { toast.success("Tenant reactivated"); closeConfirm(); },
      onError: (err) => toast.error(getErrorMessage(err, "Failed to activate")),
    },
  );

  const [suspendTenant, { loading: suspending }] = useMutation(
    SuspendTenantDocument,
    {
      refetchQueries: [GetTenantsDocument],
      onCompleted: () => { toast.success("Tenant suspended"); closeConfirm(); },
      onError: (err) => toast.error(getErrorMessage(err, "Failed to suspend")),
    },
  );

  const [terminateTenant, { loading: terminating }] = useMutation(
    TerminateTenantDocument,
    {
      refetchQueries: [GetTenantsDocument],
      onCompleted: () => { toast.success("Tenant terminated"); closeConfirm(); },
      onError: (err) => toast.error(getErrorMessage(err, "Failed to terminate")),
    },
  );

  const [impersonateTenant] = useMutation(ImpersonateTenantDocument, {
    onCompleted: (data) => {
      setImpersonatingId(null);
      setImpersonateResult({
        accessToken: data.impersonateTenant.accessToken,
        tenantSlug: data.impersonateTenant.tenantSlug,
      });
    },
    onError: (err) => {
      setImpersonatingId(null);
      toast.error(getErrorMessage(err, "Failed to impersonate tenant"));
    },
  });

  const actionLoadingMap: Record<ConfirmAction, boolean> = {
    activate: activating,
    suspend: suspending,
    terminate: terminating,
  };

  const handleConfirm = () => {
    if (!confirmState) return;
    const { action, tenant } = confirmState;
    if (action === "activate") activateTenant({ variables: { tenantId: tenant.id } });
    if (action === "suspend")  suspendTenant({ variables: { tenantId: tenant.id } });
    if (action === "terminate") terminateTenant({ variables: { tenantId: tenant.id } });
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
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
          >
            <Box>
              <Typography variant="h4" component="h1">
                Tenants
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Manage all schools and coaching centres on the Bongo platform
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={openCreateDialog}
              sx={{
                backgroundImage: primaryGradient,
                color: "#fff",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              Add Tenant
            </Button>
          </Stack>
        </Paper>

        {!loading && <TenantStatusSummary tenants={tenants} />}

        {error && (
          <Alert severity="error">
            {getErrorMessage(error, "Failed to load tenants")}
          </Alert>
        )}

        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: alpha("#0f172a", 0.08),
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 2,
              borderBottom: "1px solid",
              borderColor: alpha("#0f172a", 0.08),
              bgcolor: "#ffffff",
            }}
          >
            {STATUS_TABS.map((t) => (
              <Tab key={t.value} value={t.value} label={t.label} />
            ))}
          </Tabs>

          <MaterialReactTable
            columns={columns}
            data={filtered}
            enableColumnFilters={false}
            enableDensityToggle={false}
            enableFullScreenToggle={false}
            enableHiding={false}
            enableRowActions
            enableSorting
            enableStickyHeader
            getRowId={(row) => row.id}
            initialState={{
              pagination: { pageIndex: 0, pageSize: 10 },
            }}
            localization={{ noRecordsToDisplay: "No tenants found" }}
            positionActionsColumn="last"
            muiSearchTextFieldProps={{
              placeholder: "Search tenants",
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
                "&:hover td": { bgcolor: alpha("#ecfdf5", 0.9) },
              },
            }}
            muiTableBodyCellProps={{
              sx: {
                bgcolor: "#ffffff",
                borderBottom: "1px solid",
                borderColor: alpha("#0f172a", 0.06),
                py: 2,
              },
            }}
            muiTableContainerProps={{
              sx: { maxHeight: 620, bgcolor: "#ffffff" },
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
              },
            }}
            muiTablePaperProps={{
              elevation: 0,
              sx: { border: "none", borderRadius: 0 },
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
                size: 80,
                muiTableBodyCellProps: { sx: { pr: 2, bgcolor: "#ffffff" } },
                muiTableHeadCellProps: {
                  sx: {
                    pr: 2,
                    bgcolor: "#ffffff",
                    "& .Mui-TableHeadCell-Content": { justifyContent: "flex-end" },
                  },
                },
              },
            }}
            renderEmptyRowsFallback={() => (
              <Box sx={{ px: 3, py: 6, textAlign: "center" }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  No tenants found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {tab !== "all"
                    ? `No ${tab} tenants match your search.`
                    : "Add your first tenant to get started."}
                </Typography>
              </Box>
            )}
            renderRowActions={({ row }) => (
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                {impersonatingId === row.original.id ? (
                  <CircularProgress size={18} />
                ) : (
                  <TenantRowMenu
                    tenant={row.original}
                    onEdit={() => openEditDialog(row.original)}
                    onActivate={() =>
                      setConfirmState({ action: "activate", tenant: row.original })
                    }
                    onSuspend={() =>
                      setConfirmState({ action: "suspend", tenant: row.original })
                    }
                    onTerminate={() =>
                      setConfirmState({ action: "terminate", tenant: row.original })
                    }
                    onImpersonate={() => {
                      setImpersonatingId(row.original.id);
                      impersonateTenant({ variables: { tenantId: row.original.id } });
                    }}
                  />
                )}
              </Box>
            )}
            renderTopToolbarCustomActions={() => (
              <Typography variant="body2" color="text.secondary">
                {filtered.length} tenant{filtered.length === 1 ? "" : "s"}
              </Typography>
            )}
            state={{
              isLoading: loading,
              showProgressBars: loading,
            }}
          />
        </Paper>
      </Stack>

      <TenantFormDialog
        key={formDialogKey}
        open={formOpen}
        tenant={editTarget}
        plans={plans}
        onClose={() => setFormOpen(false)}
      />

      {confirmState && (
        <TenantConfirmDialog
          open
          action={confirmState.action}
          tenant={confirmState.tenant}
          loading={actionLoadingMap[confirmState.action]}
          onConfirm={handleConfirm}
          onClose={closeConfirm}
        />
      )}

      <TenantImpersonateDialog
        open={impersonateResult !== null}
        accessToken={impersonateResult?.accessToken ?? ""}
        tenantSlug={impersonateResult?.tenantSlug ?? ""}
        onClose={() => setImpersonateResult(null)}
      />
    </>
  );
}
