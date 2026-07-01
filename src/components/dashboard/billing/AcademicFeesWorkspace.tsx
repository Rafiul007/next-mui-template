"use client";

import { useMemo, useState } from "react";
import {
  AddRounded,
  AutorenewRounded,
  CategoryRounded,
  GavelRounded,
  PaidRounded,
  ReceiptLongRounded,
  TuneRounded,
} from "@mui/icons-material";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { toast } from "react-hot-toast";
import {
  CreateFeePlanDocument,
  CreateFeeTypeDocument,
  GetAllBatchesDocument,
  GetFeePlansDocument,
  GetFeeTypesDocument,
  GetLateFinePolicyDocument,
  GetProgramsDocument,
  SetLateFinePolicyDocument,
  type GetFeePlansQuery,
  type GetFeeTypesQuery,
} from "@/graphql/generated";
import { getErrorMessage } from "@/lib/errors";
import { SummaryCard } from "@/components/ui";
import { primaryGradient } from "@/theme/theme";
import {
  FINE_TYPE_OPTIONS,
  FREQUENCY_OPTIONS,
  formatAmount,
  frequencyLabel,
  sharedTableProps,
} from "./billing-shared";

type FeeType = GetFeeTypesQuery["getFeeTypes"][number];
type FeePlan = GetFeePlansQuery["getFeePlans"][number];

// ── Fee Types tab ─────────────────────────────────────────────────────────────

function FeeTypesTab() {
  const { data, loading, refetch } = useQuery(GetFeeTypesDocument, {
    fetchPolicy: "cache-and-network",
  });
  const [createFeeType, { loading: saving }] = useMutation(CreateFeeTypeDocument);

  const [open, setOpen] = useState(false);
  const [typeName, setTypeName] = useState("");
  const [keyName, setKeyName] = useState("");
  const [isRecurring, setIsRecurring] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const feeTypes = data?.getFeeTypes ?? [];
  const recurringCount = feeTypes.filter((f) => f.isRecurring).length;

  const reset = () => {
    setTypeName("");
    setKeyName("");
    setIsRecurring(true);
    setError(null);
  };

  const handleCreate = async () => {
    if (!typeName.trim()) {
      setError("Fee type name is required.");
      return;
    }
    try {
      await createFeeType({
        variables: {
          input: {
            typeName: typeName.trim(),
            keyName: keyName.trim() || undefined,
            isRecurring,
          },
        },
      });
      await refetch();
      toast.success("Fee type created.");
      setOpen(false);
      reset();
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to create fee type.");
      setError(msg);
    }
  };

  const columns: MRT_ColumnDef<FeeType>[] = [
    {
      accessorKey: "typeName",
      header: "Fee type",
      size: 260,
      Cell: ({ row }) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              bgcolor: alpha("#2563eb", 0.1),
              color: "#1d4ed8",
              flexShrink: 0,
            }}
          >
            <ReceiptLongRounded sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="body2" fontWeight={700}>
              {row.original.typeName}
            </Typography>
            {row.original.keyName ? (
              <Typography variant="caption" color="text.secondary">
                {row.original.keyName}
              </Typography>
            ) : null}
          </Box>
        </Stack>
      ),
    },
    {
      accessorKey: "isRecurring",
      header: "Billing",
      size: 150,
      Cell: ({ cell }) =>
        cell.getValue() ? (
          <Chip
            icon={<AutorenewRounded sx={{ fontSize: 15 }} />}
            label="Recurring"
            size="small"
            color="info"
            variant="outlined"
          />
        ) : (
          <Chip label="One-time" size="small" variant="outlined" />
        ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      size: 120,
      Cell: ({ cell }) => (
        <Chip
          label={cell.getValue() ? "Active" : "Inactive"}
          size="small"
          color={cell.getValue() ? "success" : "default"}
          variant={cell.getValue() ? "filled" : "outlined"}
        />
      ),
    },
  ];

  return (
    <Stack spacing={2.5}>
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0,1fr))" },
        }}
      >
        <SummaryCard
          caption="Fee types"
          title={String(feeTypes.length)}
          icon={<CategoryRounded />}
        />
        <SummaryCard
          caption="Recurring"
          title={String(recurringCount)}
          icon={<AutorenewRounded />}
          tone="success"
        />
        <SummaryCard
          caption="One-time"
          title={String(feeTypes.length - recurringCount)}
          icon={<ReceiptLongRounded />}
        />
      </Box>

      <Stack direction="row" justifyContent="flex-end">
        <Button
          variant="contained"
          startIcon={<AddRounded />}
          onClick={() => setOpen(true)}
          sx={{ backgroundColor: primaryGradient }}
        >
          New fee type
        </Button>
      </Stack>

      <MaterialReactTable
        {...sharedTableProps}
        columns={columns}
        data={feeTypes}
        getRowId={(r) => r.id}
        state={{ isLoading: loading && feeTypes.length === 0 }}
        localization={{
          noRecordsToDisplay:
            "No fee types yet. Create tuition, admission, exam, or transport fees.",
        }}
      />

      <Dialog open={open} onClose={() => !saving && setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New fee type</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <TextField
              label="Fee type name *"
              placeholder="e.g. Monthly tuition"
              value={typeName}
              onChange={(e) => setTypeName(e.target.value)}
              size="small"
              fullWidth
            />
            <TextField
              label="Key name (optional)"
              placeholder="e.g. TUITION — used in code/reports"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              size="small"
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  color="success"
                />
              }
              label={
                <Stack>
                  <Typography variant="body2" fontWeight={600}>
                    {isRecurring ? "Recurring fee" : "One-time fee"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {isRecurring
                      ? "Billed every cycle (e.g. monthly tuition)"
                      : "Charged once (e.g. admission)"}
                  </Typography>
                </Stack>
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={saving || !typeName.trim()}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

// ── Fee Plans tab ─────────────────────────────────────────────────────────────

type Scope = "GLOBAL" | "BATCH" | "PROGRAM";

function FeePlansTab() {
  const { data, loading, refetch } = useQuery(GetFeePlansDocument, {
    fetchPolicy: "cache-and-network",
  });
  const { data: feeTypesData } = useQuery(GetFeeTypesDocument);
  const { data: batchesData } = useQuery(GetAllBatchesDocument);
  const { data: programsData } = useQuery(GetProgramsDocument);
  const [createFeePlan, { loading: saving }] = useMutation(CreateFeePlanDocument);

  const [open, setOpen] = useState(false);
  const [feeTypeId, setFeeTypeId] = useState("");
  const [scope, setScope] = useState<Scope>("GLOBAL");
  const [batchId, setBatchId] = useState("");
  const [programId, setProgramId] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("MONTHLY");
  const [error, setError] = useState<string | null>(null);

  const plans = data?.getFeePlans ?? [];
  const feeTypes = feeTypesData?.getFeeTypes ?? [];
  const batches = batchesData?.getAllBatches ?? [];
  const programs = programsData?.getPrograms ?? [];

  const batchLookup = useMemo(
    () => new Map(batches.map((b) => [b.id, b.name])),
    [batches],
  );
  const programLookup = useMemo(
    () => new Map(programs.map((p) => [p.id, p.name])),
    [programs],
  );
  const feeTypeLookup = useMemo(
    () => new Map(feeTypes.map((f) => [f.id, f.typeName])),
    [feeTypes],
  );

  const monthlyTotal = plans
    .filter((p) => p.isActive && p.frequency === "MONTHLY")
    .reduce((s, p) => s + p.amount, 0);

  const reset = () => {
    setFeeTypeId("");
    setScope("GLOBAL");
    setBatchId("");
    setProgramId("");
    setAmount("");
    setFrequency("MONTHLY");
    setError(null);
  };

  const handleCreate = async () => {
    if (!feeTypeId) {
      setError("Select a fee type.");
      return;
    }
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (scope === "BATCH" && !batchId) {
      setError("Select a batch.");
      return;
    }
    if (scope === "PROGRAM" && !programId) {
      setError("Select a program.");
      return;
    }
    try {
      await createFeePlan({
        variables: {
          input: {
            feeTypeId,
            amount: parsed,
            frequency,
            batchId: scope === "BATCH" ? batchId : undefined,
            programId: scope === "PROGRAM" ? programId : undefined,
          },
        },
      });
      await refetch();
      toast.success("Fee plan created.");
      setOpen(false);
      reset();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create fee plan."));
    }
  };

  const columns: MRT_ColumnDef<FeePlan>[] = [
    {
      id: "feeType",
      header: "Fee type",
      size: 200,
      accessorFn: (r) =>
        r.feeTypeName ?? feeTypeLookup.get(r.feeTypeId) ?? r.feeTypeId,
      Cell: ({ row }) => (
        <Typography variant="body2" fontWeight={700}>
          {row.original.feeTypeName ??
            feeTypeLookup.get(row.original.feeTypeId) ??
            "—"}
        </Typography>
      ),
    },
    {
      id: "scope",
      header: "Applies to",
      size: 200,
      accessorFn: (r) =>
        r.batchId
          ? (batchLookup.get(r.batchId) ?? "Batch")
          : r.programId
            ? (programLookup.get(r.programId) ?? "Program")
            : "All batches",
      Cell: ({ row }) => {
        const r = row.original;
        const label = r.batchId
          ? (batchLookup.get(r.batchId) ?? "Batch")
          : r.programId
            ? (programLookup.get(r.programId) ?? "Program")
            : "All batches (global)";
        return (
          <Chip
            label={label}
            size="small"
            variant="outlined"
            color={r.batchId ? "primary" : r.programId ? "info" : "default"}
          />
        );
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      size: 120,
      Cell: ({ cell }) => (
        <Typography variant="body2" fontWeight={700}>
          {formatAmount(Number(cell.getValue()))}
        </Typography>
      ),
    },
    {
      accessorKey: "frequency",
      header: "Frequency",
      size: 130,
      Cell: ({ cell }) => (
        <Typography variant="body2">{frequencyLabel(String(cell.getValue()))}</Typography>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      size: 110,
      Cell: ({ cell }) => (
        <Chip
          label={cell.getValue() ? "Active" : "Inactive"}
          size="small"
          color={cell.getValue() ? "success" : "default"}
          variant={cell.getValue() ? "filled" : "outlined"}
        />
      ),
    },
  ];

  return (
    <Stack spacing={2.5}>
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0,1fr))" },
        }}
      >
        <SummaryCard
          caption="Active plans"
          title={String(plans.filter((p) => p.isActive).length)}
          icon={<TuneRounded />}
        />
        <SummaryCard
          caption="Monthly recurring value"
          title={formatAmount(monthlyTotal)}
          icon={<PaidRounded />}
          tone="success"
        />
      </Box>

      <Stack direction="row" justifyContent="flex-end">
        <Button
          variant="contained"
          startIcon={<AddRounded />}
          onClick={() => setOpen(true)}
          sx={{ backgroundColor: primaryGradient }}
        >
          New fee plan
        </Button>
      </Stack>

      <MaterialReactTable
        {...sharedTableProps}
        columns={columns}
        data={plans}
        getRowId={(r) => r.id}
        enableColumnFilters
        state={{ isLoading: loading && plans.length === 0 }}
        localization={{
          noRecordsToDisplay:
            "No fee plans yet. Bind a fee type and amount to a batch, program, or all batches.",
        }}
      />

      <Dialog open={open} onClose={() => !saving && setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New fee plan</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            {error ? <Alert severity="error">{error}</Alert> : null}

            <FormControl size="small" fullWidth>
              <InputLabel>Fee type *</InputLabel>
              <Select
                label="Fee type *"
                value={feeTypeId}
                onChange={(e) => setFeeTypeId(e.target.value)}
              >
                {feeTypes.length === 0 ? (
                  <MenuItem disabled value="">
                    Create a fee type first
                  </MenuItem>
                ) : (
                  feeTypes.map((f) => (
                    <MenuItem key={f.id} value={f.id}>
                      {f.typeName}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>Applies to *</InputLabel>
              <Select
                label="Applies to *"
                value={scope}
                onChange={(e) => setScope(e.target.value as Scope)}
              >
                <MenuItem value="GLOBAL">All batches (global)</MenuItem>
                <MenuItem value="BATCH">Specific batch</MenuItem>
                <MenuItem value="PROGRAM">Specific program</MenuItem>
              </Select>
            </FormControl>

            {scope === "BATCH" ? (
              <FormControl size="small" fullWidth>
                <InputLabel>Batch *</InputLabel>
                <Select
                  label="Batch *"
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                >
                  {batches.map((b) => (
                    <MenuItem key={b.id} value={b.id}>
                      {b.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : null}

            {scope === "PROGRAM" ? (
              <FormControl size="small" fullWidth>
                <InputLabel>Program *</InputLabel>
                <Select
                  label="Program *"
                  value={programId}
                  onChange={(e) => setProgramId(e.target.value)}
                >
                  {programs.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : null}

            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "1fr 1fr" }}>
              <TextField
                label="Amount (৳) *"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                size="small"
                inputProps={{ min: 0, step: 1 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">৳</InputAdornment>,
                }}
              />
              <FormControl size="small" fullWidth>
                <InputLabel>Frequency *</InputLabel>
                <Select
                  label="Frequency *"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                >
                  {FREQUENCY_OPTIONS.map((f) => (
                    <MenuItem key={f.value} value={f.value}>
                      {f.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

// ── Late Fine Policy tab ──────────────────────────────────────────────────────

function LateFinePolicyTab() {
  const { data, loading, refetch } = useQuery(GetLateFinePolicyDocument, {
    fetchPolicy: "cache-and-network",
  });
  const [setPolicy, { loading: saving }] = useMutation(SetLateFinePolicyDocument);

  const policy = data?.getLateFinePolicy;

  const [fineType, setFineType] = useState("FIXED");
  const [value, setValue] = useState("");
  const [graceDays, setGraceDays] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate the form once the current policy loads.
  if (policy && !hydrated) {
    setFineType(policy.fineType);
    setValue(String(policy.value));
    setGraceDays(String(policy.graceDays));
    setHydrated(true);
  }

  const handleSave = async () => {
    const parsedValue = parseFloat(value);
    const parsedGrace = parseInt(graceDays, 10);
    if (isNaN(parsedValue) || parsedValue < 0) {
      setError("Enter a valid fine value.");
      return;
    }
    if (isNaN(parsedGrace) || parsedGrace < 0) {
      setError("Enter valid grace days.");
      return;
    }
    setError(null);
    try {
      await setPolicy({
        variables: {
          input: { fineType, value: parsedValue, graceDays: parsedGrace },
        },
      });
      await refetch();
      toast.success("Late fine policy saved.");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save policy."));
    }
  };

  return (
    <Stack spacing={2.5} sx={{ maxWidth: 640 }}>
      {policy ? (
        <SummaryCard
          caption="Current policy"
          title={
            policy.fineType === "PERCENTAGE"
              ? `${policy.value}% after ${policy.graceDays}d`
              : `${formatAmount(policy.value)} after ${policy.graceDays}d`
          }
          icon={<GavelRounded />}
          tone="warning"
        />
      ) : (
        <Alert severity="info" icon={<GavelRounded />}>
          No late fine policy set. Invoices unpaid past their due date will not be
          fined until you configure one.
        </Alert>
      )}

      <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
          {policy ? "Update late fine policy" : "Configure late fine policy"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Applied automatically to invoices that pass their due date plus the grace
          window.
        </Typography>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

        <Stack spacing={2.5}>
          <FormControl size="small" fullWidth>
            <InputLabel>Fine type</InputLabel>
            <Select
              label="Fine type"
              value={fineType}
              onChange={(e) => setFineType(e.target.value)}
            >
              {FINE_TYPE_OPTIONS.map((f) => (
                <MenuItem key={f.value} value={f.value}>
                  {f.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "1fr 1fr" }}>
            <TextField
              label={fineType === "PERCENTAGE" ? "Percentage" : "Amount (৳)"}
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              size="small"
              inputProps={{ min: 0, step: fineType === "PERCENTAGE" ? "0.5" : "1" }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {fineType === "PERCENTAGE" ? "%" : "৳"}
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Grace days"
              type="number"
              value={graceDays}
              onChange={(e) => setGraceDays(e.target.value)}
              size="small"
              inputProps={{ min: 0, step: 1 }}
              helperText="Days after due date before fines apply"
            />
          </Box>

          {value && !isNaN(Number(value)) ? (
            <Alert severity="warning" icon={<GavelRounded />}>
              Invoices unpaid {graceDays || 0} day(s) past due will incur a{" "}
              <strong>
                {fineType === "PERCENTAGE"
                  ? `${value}% fine`
                  : `${formatAmount(Number(value))} fine`}
              </strong>
              {fineType === "PER_DAY" ? " per day" : ""}.
            </Alert>
          ) : null}

          <Stack direction="row" justifyContent="flex-end">
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving || loading}
              startIcon={
                saving ? <CircularProgress size={14} color="inherit" /> : undefined
              }
              sx={{ backgroundColor: primaryGradient }}
            >
              {policy ? "Update policy" : "Save policy"}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}

// ── Workspace ─────────────────────────────────────────────────────────────────

export function AcademicFeesWorkspace() {
  const [tab, setTab] = useState(0);

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
          Academic Fees
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, maxWidth: 680 }}>
          Define the fee structure that drives student invoicing: fee types, the
          plans that bind amounts to batches or programs, and the late fine policy.
        </Typography>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab icon={<CategoryRounded />} iconPosition="start" label="Fee Types" />
          <Tab icon={<TuneRounded />} iconPosition="start" label="Fee Plans" />
          <Tab icon={<GavelRounded />} iconPosition="start" label="Late Fine Policy" />
        </Tabs>
      </Box>

      {tab === 0 ? <FeeTypesTab /> : null}
      {tab === 1 ? <FeePlansTab /> : null}
      {tab === 2 ? <LateFinePolicyTab /> : null}
    </Stack>
  );
}
