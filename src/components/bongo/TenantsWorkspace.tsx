"use client";

import { useEffect, useMemo, useState } from "react";
import type { Dayjs } from "dayjs";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import {
  AddRounded,
  BlockRounded,
  CheckCircleOutlineRounded,
  CloseRounded,
  ContentCopyRounded,
  DeleteForeverRounded,
  EditRounded,
  LaunchRounded,
  MoreVertRounded,
  SearchRounded,
  WarningAmberRounded,
} from "@mui/icons-material";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { toast } from "react-hot-toast";
import {
  RhfDatePicker,
  RhfSelect,
  RhfTextField,
  type RhfSelectOption,
} from "@/components/form";
import { FormGrid } from "@/components/ui/FormGrid";
import {
  ActivateTenantDocument,
  CreateTenantDocument,
  GetSubscriptionPlansDocument,
  GetTenantsDocument,
  ImpersonateTenantDocument,
  SuspendTenantDocument,
  TerminateTenantDocument,
  UpdateTenantDocument,
  type GetSubscriptionPlansQuery,
  type GetTenantsQuery,
} from "@/graphql/generated";
import { getErrorMessage } from "@/lib/errors";
import { primaryGradient } from "@/theme/theme";

type TenantRecord = GetTenantsQuery["getTenants"][number];
type PlanRecord = GetSubscriptionPlansQuery["getSubscriptionPlans"][number];

// ─── Constants ────────────────────────────────────────────────────────────────

const TABLE_GRID =
  "minmax(200px,2.5fr) minmax(160px,1.5fr) minmax(110px,1fr) minmax(100px,1fr) minmax(110px,1fr) minmax(110px,1fr) 52px";

const TABLE_HEADERS = ["Tenant", "Contact", "Plan", "Status", "Trial Ends", "Created", ""];

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  active:     { label: "Active",     color: "#10b981", bg: alpha("#10b981", 0.1) },
  trial:      { label: "Trial",      color: "#f59e0b", bg: alpha("#f59e0b", 0.1) },
  suspended:  { label: "Suspended",  color: "#ef4444", bg: alpha("#ef4444", 0.1) },
  terminated: { label: "Terminated", color: "#64748b", bg: alpha("#64748b", 0.1) },
};

const STATUS_TABS = [
  { value: "all",        label: "All"        },
  { value: "active",     label: "Active"     },
  { value: "trial",      label: "Trial"      },
  { value: "suspended",  label: "Suspended"  },
  { value: "terminated", label: "Terminated" },
];

const formatDate = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const billingCycleSuffix = (cycle: string) => (cycle === "yearly" ? "yr" : "mo");

// ─── Form schema ──────────────────────────────────────────────────────────────

const tenantFormSchema = yup.object({
  legalName:    yup.string().trim().required("Required").max(120),
  contactName:  yup.string().trim().required("Required").max(80),
  contactEmail: yup.string().trim().email("Invalid email").required("Required"),
  contactPhone: yup.string().trim().default(""),
  address:      yup.string().trim().default(""),
  eBIN:         yup.string().trim().default(""),
  tradeLicense: yup.string().trim().default(""),
  planId:       yup.string().required("Select a plan"),
  trialEndsAt:  yup.mixed<Dayjs>().nullable().default(null),
});

type TenantFormValues = yup.InferType<typeof tenantFormSchema>;

const emptyDefaults: TenantFormValues = {
  legalName: "", contactName: "", contactEmail: "",
  contactPhone: "", address: "", eBIN: "",
  tradeLicense: "", planId: "", trialEndsAt: null,
};

// ─── Field config types ───────────────────────────────────────────────────────

type TextFieldCfg = {
  kind: "text";
  name: keyof Omit<TenantFormValues, "trialEndsAt">;
  label: string;
  placeholder?: string;
  type?: string;
  trim?: boolean;
  multiline?: boolean;
  minRows?: number;
  helperText?: string;
  fullSpan?: boolean;
};

type SelectFieldCfg = {
  kind: "select";
  name: "planId";
  label: string;
  options: RhfSelectOption[];
  placeholder?: string;
  fullSpan?: boolean;
};

type DateFieldCfg = {
  kind: "date";
  name: "trialEndsAt";
  label: string;
  helperText?: string;
  fullSpan?: boolean;
};

type FieldConfig = TextFieldCfg | SelectFieldCfg | DateFieldCfg;

type FormSection = {
  key: string;
  label: string;
  fields: FieldConfig[];
};

const buildSections = (
  planOptions: RhfSelectOption[],
  mode: "create" | "edit",
): FormSection[] => [
  {
    key: "identity",
    label: "Identity",
    fields: [
      { kind: "text", name: "legalName", label: "Legal / School Name", placeholder: "Uddayan Online School", trim: true, fullSpan: true },
      { kind: "select", name: "planId", label: "Subscription Plan", options: planOptions, placeholder: "— Select a plan —" },
      ...(mode === "create"
        ? [{ kind: "date" as const, name: "trialEndsAt" as const, label: "Trial Ends At", helperText: "Leave blank to skip the trial period" }]
        : []),
    ],
  },
  {
    key: "contact",
    label: "Primary Contact",
    fields: [
      { kind: "text", name: "contactName",  label: "Contact Name",  placeholder: "Full name",          trim: true },
      { kind: "text", name: "contactPhone", label: "Phone",         placeholder: "+8801XXXXXXXXX",     trim: true },
      { kind: "text", name: "contactEmail", label: "Email",         placeholder: "admin@school.com",   trim: true, type: "email", fullSpan: true },
      { kind: "text", name: "address",      label: "Address",       placeholder: "Road, area, city",   trim: true, multiline: true, minRows: 2, fullSpan: true },
    ],
  },
  {
    key: "compliance",
    label: "Compliance (optional)",
    fields: [
      { kind: "text", name: "eBIN",         label: "e-BIN",         helperText: "Bangladesh tax ID",   trim: true },
      { kind: "text", name: "tradeLicense", label: "Trade License",                                    trim: true },
    ],
  },
];

// ─── Tenant Form Dialog ───────────────────────────────────────────────────────

function TenantFormDialog({
  open,
  tenant,
  plans,
  onClose,
}: {
  open: boolean;
  tenant: TenantRecord | null;
  plans: PlanRecord[];
  onClose: () => void;
}) {
  const mode = tenant ? "edit" : "create";

  const planOptions = useMemo(
    () =>
      plans
        .filter((p) => p.active)
        .map((p) => ({
          value: p.id,
          label: `${p.name} — ৳${p.priceBdt.toLocaleString()}/${billingCycleSuffix(p.billingCycle)}`,
        })),
    [plans],
  );

  const sections = useMemo(
    () => buildSections(planOptions, mode),
    [planOptions, mode],
  );

  const { control, handleSubmit, reset } = useForm<TenantFormValues>({
    resolver: yupResolver(tenantFormSchema),
    defaultValues: tenant
      ? {
          legalName:    tenant.legalName,
          contactName:  tenant.contactName ?? "",
          contactEmail: tenant.contactEmail,
          contactPhone: tenant.contactPhone ?? "",
          address:      tenant.address ?? "",
          eBIN:         tenant.eBIN ?? "",
          tradeLicense: tenant.tradeLicense ?? "",
          planId:       tenant.planId,
          trialEndsAt:  null,
        }
      : emptyDefaults,
    mode: "onTouched",
  });

  const [createTenant, { loading: creating }] = useMutation(CreateTenantDocument, {
    refetchQueries: [GetTenantsDocument],
    onCompleted: (data) => {
      toast.success(`"${data.createTenant.legalName}" created`);
      reset(emptyDefaults);
      onClose();
    },
    onError: (err) => toast.error(getErrorMessage(err, "Failed to create tenant")),
  });

  const [updateTenant, { loading: updating }] = useMutation(UpdateTenantDocument, {
    refetchQueries: [GetTenantsDocument],
    onCompleted: () => { toast.success("Tenant updated"); onClose(); },
    onError: (err) => toast.error(getErrorMessage(err, "Failed to update tenant")),
  });

  const busy = creating || updating;

  const onSubmit = (values: TenantFormValues) => {
    const shared = {
      legalName:    values.legalName,
      contactName:  values.contactName,
      contactEmail: values.contactEmail,
      contactPhone: values.contactPhone || null,
      address:      values.address || null,
      eBIN:         values.eBIN || null,
      tradeLicense: values.tradeLicense || null,
      planId:       values.planId || null,
    };

    if (mode === "edit" && tenant) {
      updateTenant({ variables: { tenant: { id: tenant.id, ...shared } } });
    } else {
      createTenant({
        variables: {
          tenant: {
            ...shared,
            planId:      values.planId,
            trialEndsAt: values.trialEndsAt?.toISOString() ?? null,
          },
        },
      });
    }
  };

  const renderField = (field: FieldConfig) => {
    const spanSx = field.fullSpan ? { gridColumn: "1 / -1" } : undefined;

    if (field.kind === "select") {
      return (
        <Box key={field.name} sx={spanSx}>
          <RhfSelect control={control} name={field.name} label={field.label} options={field.options} placeholder={field.placeholder} fullWidth />
        </Box>
      );
    }

    if (field.kind === "date") {
      return (
        <Box key={field.name} sx={spanSx}>
          <RhfDatePicker control={control} name={field.name} label={field.label} textFieldProps={{ helperText: field.helperText, fullWidth: true }} disablePast />
        </Box>
      );
    }

    return (
      <Box key={field.name} sx={spanSx}>
        <RhfTextField control={control} name={field.name} label={field.label} placeholder={field.placeholder} type={field.type} trim={field.trim} multiline={field.multiline} minRows={field.minRows} helperText={field.helperText} fullWidth />
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <Box component="span" sx={{ fontWeight: 700 }}>
          {mode === "edit" ? "Edit Tenant" : "Add New Tenant"}
        </Box>
        <IconButton size="small" onClick={onClose} disabled={busy}>
          <CloseRounded fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent dividers>
          <Stack spacing={3}>
            {sections.map((section, i) => (
              <Stack key={section.key} spacing={2}>
                {i > 0 && <Divider />}
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: "uppercase", letterSpacing: 0.6 }}>
                  {section.label}
                </Typography>
                <FormGrid>{section.fields.map(renderField)}</FormGrid>
              </Stack>
            ))}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={busy} color="inherit">Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={busy}
            startIcon={busy ? <CircularProgress size={16} color="inherit" /> : undefined}
            sx={{ background: primaryGradient, color: "#fff", fontWeight: 700 }}
          >
            {mode === "edit" ? "Save Changes" : "Create Tenant"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

type ConfirmAction = "activate" | "suspend" | "terminate";

const CONFIRM_CONFIG: Record<
  ConfirmAction,
  { title: string; getMessage: (name: string) => string; confirmLabel: string; color: "primary" | "warning" | "error" }
> = {
  activate: {
    title: "Reactivate tenant",
    getMessage: (name) => `This will restore "${name}" to active status and give their users full access to the platform.`,
    confirmLabel: "Reactivate",
    color: "primary",
  },
  suspend: {
    title: "Suspend tenant",
    getMessage: (name) => `This will immediately suspend "${name}". Their users will lose access until reactivated.`,
    confirmLabel: "Suspend",
    color: "warning",
  },
  terminate: {
    title: "Terminate tenant",
    getMessage: (name) => `Terminating "${name}" is permanent. Their account will be closed and data retained for compliance. This cannot be undone.`,
    confirmLabel: "Terminate",
    color: "error",
  },
};

function ConfirmDialog({
  open,
  action,
  tenant,
  loading,
  onConfirm,
  onClose,
}: {
  open: boolean;
  action: ConfirmAction;
  tenant: TenantRecord;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const cfg = CONFIRM_CONFIG[action];

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <WarningAmberRounded color={cfg.color} />
          <Typography fontWeight={700}>{cfg.title}</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          {cfg.getMessage(tenant.legalName)}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={loading} color="inherit">Cancel</Button>
        <Button
          variant="contained"
          color={cfg.color}
          onClick={onConfirm}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {cfg.confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Impersonate Dialog ───────────────────────────────────────────────────────

function ImpersonateDialog({
  open,
  accessToken,
  tenantSlug,
  onClose,
}: {
  open: boolean;
  accessToken: string;
  tenantSlug: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = () => {
    navigator.clipboard.writeText(accessToken);
    setCopied(true);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box component="span" sx={{ fontWeight: 700 }}>Impersonate — {tenantSlug}</Box>
        <IconButton size="small" onClick={onClose}><CloseRounded fontSize="small" /></IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          <Alert severity="warning">
            You are acting as this tenant. Any changes will affect their account.
          </Alert>

          <Box>
            <Typography variant="caption" color="text.secondary">Access Token</Typography>
            <Box
              sx={{
                mt: 0.75, p: 1.5, borderRadius: 2,
                bgcolor: alpha("#0f172a", 0.05),
                border: "1px solid", borderColor: "divider",
                fontFamily: "monospace", fontSize: 11,
                wordBreak: "break-all", color: "text.secondary",
              }}
            >
              {accessToken.slice(0, 80)}…
            </Box>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" startIcon={<ContentCopyRounded />} onClick={copy} size="small">
              {copied ? "Copied!" : "Copy Token"}
            </Button>
            <Button
              variant="contained"
              startIcon={<LaunchRounded />}
              size="small"
              href="/dashboard"
              target="_blank"
              sx={{ background: primaryGradient, color: "#fff" }}
            >
              Open Tenant Dashboard
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

// ─── Row Action Menu ──────────────────────────────────────────────────────────

function RowMenu({
  tenant,
  onEdit,
  onActivate,
  onSuspend,
  onTerminate,
  onImpersonate,
}: {
  tenant: TenantRecord;
  onEdit: () => void;
  onActivate: () => void;
  onSuspend: () => void;
  onTerminate: () => void;
  onImpersonate: () => void;
}) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const close = () => setAnchor(null);
  const act = (fn: () => void) => { close(); fn(); };
  const s = tenant.status;

  return (
    <>
      <Tooltip title="Actions">
        <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)} sx={{ color: "text.secondary" }}>
          <MoreVertRounded fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{ paper: { sx: { minWidth: 180 } } }}
      >
        <MenuItem onClick={() => act(onEdit)}>
          <EditRounded fontSize="small" sx={{ mr: 1.5, color: "text.secondary" }} />
          Edit details
        </MenuItem>
        <MenuItem onClick={() => act(onImpersonate)}>
          <LaunchRounded fontSize="small" sx={{ mr: 1.5, color: "text.secondary" }} />
          Impersonate
        </MenuItem>

        <Divider />

        {(s === "suspended" || s === "terminated") && (
          <MenuItem onClick={() => act(onActivate)} sx={{ color: "success.main" }}>
            <CheckCircleOutlineRounded fontSize="small" sx={{ mr: 1.5 }} />
            Reactivate
          </MenuItem>
        )}
        {(s === "active" || s === "trial") && (
          <MenuItem onClick={() => act(onSuspend)} sx={{ color: "warning.dark" }}>
            <BlockRounded fontSize="small" sx={{ mr: 1.5 }} />
            Suspend
          </MenuItem>
        )}
        {s !== "terminated" && (
          <MenuItem onClick={() => act(onTerminate)} sx={{ color: "error.main" }}>
            <DeleteForeverRounded fontSize="small" sx={{ mr: 1.5 }} />
            Terminate
          </MenuItem>
        )}
      </Menu>
    </>
  );
}

// ─── Status Summary Strip ─────────────────────────────────────────────────────

function StatusSummary({ tenants }: { tenants: TenantRecord[] }) {
  const counts = useMemo(
    () =>
      tenants.reduce<Record<string, number>>((acc, t) => {
        acc[t.status] = (acc[t.status] ?? 0) + 1;
        return acc;
      }, {}),
    [tenants],
  );

  const items = [
    { label: "Total",      value: tenants.length,        color: "#64748b" },
    { label: "Active",     value: counts.active ?? 0,     color: "#10b981" },
    { label: "Trial",      value: counts.trial ?? 0,      color: "#f59e0b" },
    { label: "Suspended",  value: counts.suspended ?? 0,  color: "#ef4444" },
    { label: "Terminated", value: counts.terminated ?? 0, color: "#94a3b8" },
  ];

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 2 }}>
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Typography variant="h5" fontWeight={800} sx={{ color: item.color }}>
              {item.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">{item.label}</Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

// ─── Main Workspace ───────────────────────────────────────────────────────────

export function TenantsWorkspace() {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TenantRecord | null>(null);
  const [confirmState, setConfirmState] = useState<{ action: ConfirmAction; tenant: TenantRecord } | null>(null);
  const [impersonateResult, setImpersonateResult] = useState<{ accessToken: string; tenantSlug: string } | null>(null);
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);

  const { data, loading, error } = useQuery(GetTenantsDocument, {
    variables: { page: 1, limit: 200 },
    fetchPolicy: "cache-and-network",
  });

  const { data: plansData } = useQuery(GetSubscriptionPlansDocument);

  const tenants = useMemo(() => data?.getTenants ?? [], [data]);
  const plans   = useMemo(() => plansData?.getSubscriptionPlans ?? [], [plansData]);

  const planById = useMemo(
    () => plans.reduce<Record<string, PlanRecord>>((acc, p) => { acc[p.id] = p; return acc; }, {}),
    [plans],
  );

  const filtered = useMemo(
    () =>
      tenants.filter((t) => {
        if (tab !== "all" && t.status !== tab) return false;
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          t.legalName.toLowerCase().includes(q) ||
          t.contactEmail.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q) ||
          (t.contactName ?? "").toLowerCase().includes(q)
        );
      }),
    [tenants, tab, search],
  );

  const closeConfirm = () => setConfirmState(null);

  const [activateTenant, { loading: activating }] = useMutation(ActivateTenantDocument, {
    refetchQueries: [GetTenantsDocument],
    onCompleted: () => { toast.success("Tenant reactivated"); closeConfirm(); },
    onError: (err) => toast.error(getErrorMessage(err, "Failed to activate")),
  });

  const [suspendTenant, { loading: suspending }] = useMutation(SuspendTenantDocument, {
    refetchQueries: [GetTenantsDocument],
    onCompleted: () => { toast.success("Tenant suspended"); closeConfirm(); },
    onError: (err) => toast.error(getErrorMessage(err, "Failed to suspend")),
  });

  const [terminateTenant, { loading: terminating }] = useMutation(TerminateTenantDocument, {
    refetchQueries: [GetTenantsDocument],
    onCompleted: () => { toast.success("Tenant terminated"); closeConfirm(); },
    onError: (err) => toast.error(getErrorMessage(err, "Failed to terminate")),
  });

  const [impersonateTenant] = useMutation(ImpersonateTenantDocument, {
    onCompleted: (data) => {
      setImpersonatingId(null);
      setImpersonateResult({
        accessToken: data.impersonateTenant.accessToken,
        tenantSlug:  data.impersonateTenant.tenantSlug,
      });
    },
    onError: (err) => {
      setImpersonatingId(null);
      toast.error(getErrorMessage(err, "Failed to impersonate tenant"));
    },
  });

  const actionLoadingMap: Record<ConfirmAction, boolean> = {
    activate:  activating,
    suspend:   suspending,
    terminate: terminating,
  };
  const actionLoading = confirmState ? actionLoadingMap[confirmState.action] : false;

  const handleConfirm = () => {
    if (!confirmState) return;
    const { action, tenant } = confirmState;
    if (action === "activate")  activateTenant({ variables: { tenantId: tenant.id } });
    if (action === "suspend")   suspendTenant({ variables: { tenantId: tenant.id } });
    if (action === "terminate") terminateTenant({ variables: { tenantId: tenant.id } });
  };

  return (
    <>
      <Stack spacing={3}>
        <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Tenants</Typography>
            <Typography variant="body2" color="text.secondary">
              Manage all schools and coaching centres on the Bongo platform
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={() => { setEditTarget(null); setFormOpen(true); }}
            sx={{ background: primaryGradient, color: "#fff", fontWeight: 700, whiteSpace: "nowrap" }}
          >
            Add Tenant
          </Button>
        </Stack>

        {!loading && <StatusSummary tenants={tenants} />}

        <Card>
          <CardContent sx={{ p: 0 }}>
            <Box
              sx={{
                px: 3, pt: 2, pb: 0,
                display: "flex", flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "stretch", sm: "center" }, gap: 2,
                borderBottom: "1px solid", borderColor: "divider",
              }}
            >
              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ flex: 1, minWidth: 0 }} variant="scrollable" scrollButtons="auto">
                {STATUS_TABS.map((t) => <Tab key={t.value} value={t.value} label={t.label} />)}
              </Tabs>

              <TextField
                size="small"
                placeholder="Search tenants…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ width: { xs: "100%", sm: 240 }, mb: { xs: 0, sm: 1 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {loading && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress />
              </Box>
            )}

            {error && (
              <Box sx={{ p: 3 }}>
                <Alert severity="error">{getErrorMessage(error, "Failed to load tenants")}</Alert>
              </Box>
            )}

            {!loading && !error && (
              <Box sx={{ overflowX: "auto" }}>
                <Box
                  sx={{
                    display: "grid", gridTemplateColumns: TABLE_GRID,
                    px: 3, py: 1.25,
                    borderBottom: "1px solid", borderColor: "divider",
                    bgcolor: alpha("#0f172a", 0.025),
                  }}
                >
                  {TABLE_HEADERS.map((h) => (
                    <Typography key={h} variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {h}
                    </Typography>
                  ))}
                </Box>

                {filtered.length === 0 ? (
                  <Box sx={{ py: 8, textAlign: "center" }}>
                    <Typography color="text.secondary">No tenants match your filter.</Typography>
                  </Box>
                ) : (
                  filtered.map((tenant) => {
                    const meta = STATUS_META[tenant.status] ?? STATUS_META.terminated;
                    const plan = planById[tenant.planId];

                    return (
                      <Box
                        key={tenant.id}
                        sx={{
                          display: "grid", gridTemplateColumns: TABLE_GRID,
                          px: 3, py: 2,
                          borderBottom: "1px solid", borderColor: "divider",
                          alignItems: "center", transition: "background 0.15s",
                          "&:last-child": { borderBottom: "none" },
                          "&:hover": { bgcolor: alpha("#0f172a", 0.02) },
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.3 }}>
                            {tenant.legalName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace" }}>
                            /{tenant.slug}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="body2" noWrap>{tenant.contactName ?? "—"}</Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>{tenant.contactEmail}</Typography>
                        </Box>

                        <Chip
                          label={plan?.name ?? tenant.planId.slice(0, 8)}
                          size="small"
                          sx={{ fontWeight: 600, bgcolor: alpha("#10b981", 0.08), color: "primary.dark", width: "fit-content" }}
                        />

                        <Chip
                          label={meta.label}
                          size="small"
                          sx={{ fontWeight: 600, bgcolor: meta.bg, color: meta.color, width: "fit-content" }}
                        />

                        <Typography variant="body2" color="text.secondary">{formatDate(tenant.trialEndsAt)}</Typography>
                        <Typography variant="body2" color="text.secondary">{formatDate(tenant.createdAt)}</Typography>

                        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                          {impersonatingId === tenant.id ? (
                            <CircularProgress size={18} />
                          ) : (
                            <RowMenu
                              tenant={tenant}
                              onEdit={() => { setEditTarget(tenant); setFormOpen(true); }}
                              onActivate={() => setConfirmState({ action: "activate", tenant })}
                              onSuspend={() => setConfirmState({ action: "suspend", tenant })}
                              onTerminate={() => setConfirmState({ action: "terminate", tenant })}
                              onImpersonate={() => {
                                setImpersonatingId(tenant.id);
                                impersonateTenant({ variables: { tenantId: tenant.id } });
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    );
                  })
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Stack>

      <TenantFormDialog
        open={formOpen}
        tenant={editTarget}
        plans={plans}
        onClose={() => setFormOpen(false)}
      />

      {confirmState && (
        <ConfirmDialog
          open
          action={confirmState.action}
          tenant={confirmState.tenant}
          loading={actionLoading}
          onConfirm={handleConfirm}
          onClose={closeConfirm}
        />
      )}

      <ImpersonateDialog
        open={impersonateResult !== null}
        accessToken={impersonateResult?.accessToken ?? ""}
        tenantSlug={impersonateResult?.tenantSlug ?? ""}
        onClose={() => setImpersonateResult(null)}
      />
    </>
  );
}
