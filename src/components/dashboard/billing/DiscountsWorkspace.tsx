"use client";

import { useState } from "react";
import {
  AddRounded,
  LocalOfferRounded,
  MoneyOffRounded,
  PercentRounded,
  SchoolRounded,
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
  FormControl,
  FormControlLabel,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { toast } from "react-hot-toast";
import { SummaryCard } from "@/components/ui";
import {
  CreateDiscountDocument,
  GetDiscountsDocument,
  type GetDiscountsQuery,
} from "@/graphql/generated";
import { getErrorMessage } from "@/lib/errors";
import { primaryGradient } from "@/theme/theme";

type DiscountRecord = GetDiscountsQuery["getDiscounts"][number];

const DISCOUNT_TYPE_OPTIONS = [
  { value: "STANDARD", label: "Standard" },
  { value: "EARLY_BIRD", label: "Early Bird" },
  { value: "SCHOLARSHIP", label: "Scholarship" },
  { value: "SIBLING", label: "Sibling" },
  { value: "MERIT", label: "Merit" },
  { value: "STAFF", label: "Staff" },
  { value: "SEASONAL", label: "Seasonal" },
];

const TYPE_COLOR: Record<string, "default" | "success" | "info" | "warning" | "error"> = {
  STANDARD: "default",
  EARLY_BIRD: "warning",
  SCHOLARSHIP: "success",
  SIBLING: "info",
  MERIT: "success",
  STAFF: "info",
  SEASONAL: "warning",
};

const buildColumns = (): MRT_ColumnDef<DiscountRecord>[] => [
  {
    accessorKey: "name",
    header: "Discount name",
    size: 240,
    Cell: ({ cell, row }) => (
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
          {row.original.isPercentage ? (
            <PercentRounded sx={{ fontSize: 18 }} />
          ) : (
            <MoneyOffRounded sx={{ fontSize: 18 }} />
          )}
        </Box>
        <Box>
          <Typography variant="body2" fontWeight={700}>
            {String(cell.getValue())}
          </Typography>
        </Box>
      </Stack>
    ),
  },
  {
    accessorKey: "discountType",
    header: "Type",
    size: 140,
    filterVariant: "select",
    filterSelectOptions: DISCOUNT_TYPE_OPTIONS.map((o) => o.value),
    Cell: ({ cell }) => {
      const val = String(cell.getValue());
      const label = DISCOUNT_TYPE_OPTIONS.find((o) => o.value === val)?.label ?? val;
      return (
        <Chip
          label={label}
          size="small"
          color={TYPE_COLOR[val] ?? "default"}
          variant="outlined"
        />
      );
    },
  },
  {
    id: "value",
    accessorFn: (row) => (row.isPercentage ? `${row.value}%` : `৳ ${row.value.toLocaleString()}`),
    header: "Discount value",
    size: 140,
    Cell: ({ cell, row }) => (
      <Stack direction="row" spacing={0.75} alignItems="center">
        <Chip
          icon={row.original.isPercentage ? <PercentRounded sx={{ fontSize: 14 }} /> : undefined}
          label={String(cell.getValue())}
          size="small"
          color="success"
          variant="filled"
          sx={{ fontWeight: 700 }}
        />
      </Stack>
    ),
  },
  {
    id: "valueType",
    accessorFn: (row) => (row.isPercentage ? "Percentage" : "Fixed amount"),
    header: "Calculation",
    size: 140,
    Cell: ({ row }) => (
      <Typography variant="body2" color="text.secondary">
        {row.original.isPercentage ? "Percentage" : "Fixed amount"}
      </Typography>
    ),
  },
];

type FormState = {
  name: string;
  discountType: string;
  value: string;
  isPercentage: boolean;
  earlyBirdDeadline: string;
};

const emptyForm: FormState = {
  name: "",
  discountType: "STANDARD",
  value: "",
  isPercentage: true,
  earlyBirdDeadline: "",
};

export function DiscountsWorkspace() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    data,
    loading: isLoading,
    error: loadError,
    refetch,
  } = useQuery(GetDiscountsDocument, { fetchPolicy: "cache-and-network" });

  const [createDiscount, createState] = useMutation(CreateDiscountDocument);

  const discounts = data?.getDiscounts ?? [];

  const percentageCount = discounts.filter((d) => d.isPercentage).length;
  const fixedCount = discounts.filter((d) => !d.isPercentage).length;

  const openDialog = () => {
    setForm(emptyForm);
    setFormError(null);
    setDialogKey((k) => k + 1);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    if (!createState.loading) {
      setIsDialogOpen(false);
      setFormError(null);
    }
  };

  const handleCreate = async () => {
    if (!form.name.trim()) { setFormError("Discount name is required."); return; }
    if (!form.value || isNaN(Number(form.value)) || Number(form.value) <= 0) {
      setFormError("Enter a valid discount value greater than 0.");
      return;
    }
    if (form.isPercentage && Number(form.value) > 100) {
      setFormError("Percentage discount cannot exceed 100%.");
      return;
    }
    setFormError(null);
    try {
      await createDiscount({
        variables: {
          input: {
            name: form.name.trim(),
            discountType: form.discountType,
            value: parseFloat(form.value),
            isPercentage: form.isPercentage,
            earlyBirdDeadline: form.earlyBirdDeadline || undefined,
          },
        },
      });
      await refetch();
      toast.success("Discount created.");
      closeDialog();
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to create discount.");
      setFormError(msg);
      toast.error(msg);
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
            background: "linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(240,253,250,0.98) 100%)",
          }}
        >
          <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" spacing={3}>
            <Box sx={{ maxWidth: 720 }}>
              <Typography variant="h4" component="h1" sx={{ mt: 0.5 }}>
                Discounts
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Define percentage and fixed-amount discounts for scholarships, early-bird offers, sibling concessions, and more.
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: { xs: "stretch", lg: "flex-end" } }}>
              <Button
                variant="contained"
                startIcon={<AddRounded />}
                onClick={openDialog}
                sx={{ backgroundColor: primaryGradient, maxWidth: { xs: "100%", lg: 200 } }}
                fullWidth
              >
                New discount
              </Button>
            </Box>
          </Stack>
        </Paper>

        {/* Summary cards */}
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0,1fr))" } }}>
          <SummaryCard caption="Total discounts" title={String(discounts.length)} icon={<LocalOfferRounded />} />
          <SummaryCard caption="Percentage-based" title={String(percentageCount)} icon={<PercentRounded />} tone="success" />
          <SummaryCard caption="Fixed amount" title={String(fixedCount)} icon={<MoneyOffRounded />} />
        </Box>

        {loadError ? (
          <Alert severity="error">{loadError.message || "Unable to load discounts."}</Alert>
        ) : null}

        {/* Discounts table */}
        <MaterialReactTable
          columns={buildColumns()}
          data={discounts}
          getRowId={(row) => row.id}
          enableColumnFilters
          enableDensityToggle={false}
          enableFullScreenToggle={false}
          enableHiding={false}
          enableSorting
          enableStickyHeader
          initialState={{ pagination: { pageIndex: 0, pageSize: 20 } }}
          localization={{ noRecordsToDisplay: "No discounts yet. Create your first discount to get started." }}
          muiSearchTextFieldProps={{ placeholder: "Search discounts", size: "small", sx: { minWidth: { xs: "100%", md: 260 } } }}
          muiTableBodyRowProps={{ sx: { bgcolor: "#ffffff", transition: "background-color 140ms ease", "&:hover td": { bgcolor: alpha("#eff6ff", 0.9) } } }}
          muiTableBodyCellProps={{ sx: { bgcolor: "#ffffff", borderBottom: "1px solid", borderColor: alpha("#0f172a", 0.06), py: 2.25 } }}
          muiTableContainerProps={{ sx: { maxHeight: 560, bgcolor: "#ffffff" } }}
          muiTableHeadCellProps={{ sx: { bgcolor: "#ffffff", color: alpha("#0f172a", 0.72), fontSize: 13, fontWeight: 700, py: 1.75, borderBottom: "1px solid", borderColor: alpha("#0f172a", 0.08) } }}
          muiTablePaperProps={{ elevation: 0, sx: { border: "1px solid", borderColor: alpha("#0f172a", 0.08), borderRadius: 2, overflow: "hidden", bgcolor: "#ffffff", boxShadow: `0 16px 40px ${alpha("#0f172a", 0.06)}` } }}
          muiTopToolbarProps={{ sx: { px: 2.5, py: 1.75, bgcolor: "#ffffff", borderBottom: "1px solid", borderColor: alpha("#0f172a", 0.08) } }}
          muiBottomToolbarProps={{ sx: { borderTop: "1px solid", borderColor: alpha("#0f172a", 0.08), bgcolor: "#ffffff" } }}
          renderEmptyRowsFallback={() => (
            <Box sx={{ px: 3, py: 6, textAlign: "center" }}>
              <SchoolRounded sx={{ fontSize: 44, color: "text.disabled", mb: 1.5 }} />
              <Typography variant="subtitle1" fontWeight={700}>No discounts configured</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Set up scholarship, early-bird, or sibling discounts to apply to student fees.
              </Typography>
              <Button variant="outlined" startIcon={<AddRounded />} onClick={openDialog} sx={{ mt: 2 }}>
                Create discount
              </Button>
            </Box>
          )}
          renderTopToolbarCustomActions={() => (
            <Typography variant="body2" color="text.secondary">
              {discounts.length} discount{discounts.length === 1 ? "" : "s"}
            </Typography>
          )}
          state={{ isLoading, showProgressBars: isLoading }}
        />
      </Stack>

      {/* Create Discount Dialog */}
      <Dialog key={dialogKey} open={isDialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>New discount</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            {formError ? <Alert severity="error">{formError}</Alert> : null}

            <TextField
              label="Discount name *"
              placeholder="e.g. Sibling concession 10%"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              size="small"
              fullWidth
            />

            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Discount type *</InputLabel>
                <Select
                  label="Discount type *"
                  value={form.discountType}
                  onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))}
                >
                  {DISCOUNT_TYPE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label={form.isPercentage ? "Percentage *" : "Amount (৳) *"}
                type="number"
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                size="small"
                fullWidth
                inputProps={{ min: 0, max: form.isPercentage ? 100 : undefined, step: "0.01" }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {form.isPercentage ? "%" : "৳"}
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Stack direction="row" spacing={2} alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={form.isPercentage}
                    onChange={(e) => setForm((f) => ({ ...f, isPercentage: e.target.checked, value: "" }))}
                    color="success"
                  />
                }
                label={
                  <Stack>
                    <Typography variant="body2" fontWeight={600}>
                      {form.isPercentage ? "Percentage discount" : "Fixed amount discount"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {form.isPercentage
                        ? "Applied as a % of the total fee"
                        : "A flat amount deducted from the invoice"}
                    </Typography>
                  </Stack>
                }
              />
            </Stack>

            {form.discountType === "EARLY_BIRD" ? (
              <Tooltip title="Students registering before this date get the discount">
                <TextField
                  label="Early bird deadline"
                  type="date"
                  value={form.earlyBirdDeadline}
                  onChange={(e) => setForm((f) => ({ ...f, earlyBirdDeadline: e.target.value }))}
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Tooltip>
            ) : null}

            {/* Preview */}
            {form.value && !isNaN(Number(form.value)) ? (
              <Alert severity="success" icon={<LocalOfferRounded />}>
                Students receive a{" "}
                <strong>
                  {form.isPercentage ? `${form.value}%` : `৳ ${Number(form.value).toLocaleString()}`}
                </strong>{" "}
                {form.isPercentage ? "reduction" : "flat deduction"} on applicable invoices.
              </Alert>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={closeDialog} disabled={createState.loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={createState.loading || !form.name.trim() || !form.value}
          >
            Create discount
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
