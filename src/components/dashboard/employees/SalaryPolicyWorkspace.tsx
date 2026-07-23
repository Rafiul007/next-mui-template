"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  AddRounded,
  DeleteRounded,
  EditRounded,
  PolicyRounded,
  StarRounded,
  WorkRounded,
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
  Divider,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Switch,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { toast } from "react-hot-toast";
import { RhfTextField } from "@/components/form";
import { SummaryCard } from "@/components/ui";
import {
  CreateSalaryPolicyDocument,
  DeleteSalaryPolicyDocument,
  GetSalaryPoliciesDocument,
  UpdateSalaryPolicyDocument,
  type GetSalaryPoliciesQuery,
} from "@/graphql/generated";
import { getErrorMessage } from "@/lib/errors";
import { primaryGradient } from "@/theme/theme";

type PolicyRecord = NonNullable<GetSalaryPoliciesQuery["getSalaryPolicies"][number]>;

const policySchema = yup
  .object({
    name: yup.string().trim().required("Policy name is required"),
    designation: yup.string().trim().default(""),
    basic: yup.number().typeError("Must be a number").min(0).required("Basic is required"),
    houseRent: yup.number().typeError("Must be a number").min(0).required("House rent is required"),
    medical: yup.number().typeError("Must be a number").min(0).required("Medical is required"),
    transport: yup.number().typeError("Must be a number").min(0).required("Transport is required"),
    deductions: yup.number().typeError("Must be a number").min(0).default(0),
  })
  .required();

type PolicyFormValues = yup.InferType<typeof policySchema>;

const grossOf = (p: PolicyRecord) =>
  Number(p.basic) + Number(p.houseRent) + Number(p.medical) + Number(p.transport);

function PolicyCard({
  policy,
  onEdit,
  onDelete,
  deleting,
}: {
  policy: PolicyRecord;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: "1px solid",
        borderColor: alpha("#0f172a", 0.08),
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Box flex={1} minWidth={0}>
          <Typography variant="subtitle1" fontWeight={700} noWrap>
            {policy.name}
          </Typography>
          <Chip
            icon={policy.isDefault ? <StarRounded /> : <WorkRounded />}
            label={policy.isDefault ? "Tenant default" : policy.designation}
            size="small"
            color={policy.isDefault ? "warning" : "default"}
            variant={policy.isDefault ? "filled" : "outlined"}
            sx={{ mt: 0.5 }}
          />
        </Box>
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={onEdit}>
              <EditRounded fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={onDelete} disabled={deleting}>
              {deleting ? <CircularProgress size={16} /> : <DeleteRounded fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Divider />

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">Basic</Typography>
          <Typography variant="body2" fontWeight={600}>৳{Number(policy.basic).toLocaleString()}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">Gross</Typography>
          <Typography variant="body2" fontWeight={600}>৳{grossOf(policy).toLocaleString()}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">House rent</Typography>
          <Typography variant="body2">৳{Number(policy.houseRent).toLocaleString()}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">Medical</Typography>
          <Typography variant="body2">৳{Number(policy.medical).toLocaleString()}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">Transport</Typography>
          <Typography variant="body2">৳{Number(policy.transport).toLocaleString()}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">Deductions</Typography>
          <Typography variant="body2">৳{Number(policy.deductions).toLocaleString()}</Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export function SalaryPolicyWorkspace() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const [isDefault, setIsDefault] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery(GetSalaryPoliciesDocument);
  const policies: PolicyRecord[] = data?.getSalaryPolicies ?? [];

  const [createSalaryPolicy, createState] = useMutation(CreateSalaryPolicyDocument);
  const [updateSalaryPolicy, updateState] = useMutation(UpdateSalaryPolicyDocument);
  const [deleteSalaryPolicy] = useMutation(DeleteSalaryPolicyDocument);

  const { control, handleSubmit, reset } = useForm<PolicyFormValues>({
    resolver: yupResolver(policySchema),
    defaultValues: {
      name: "",
      designation: "",
      basic: 0,
      houseRent: 0,
      medical: 0,
      transport: 0,
      deductions: 0,
    },
    mode: "onTouched",
  });

  const saving = createState.loading || updateState.loading;

  const openCreateDialog = () => {
    reset({ name: "", designation: "", basic: 0, houseRent: 0, medical: 0, transport: 0, deductions: 0 });
    setIsDefault(false);
    setEditingId(null);
    setErrorMessage(null);
    setDialogKey((k) => k + 1);
    setIsDialogOpen(true);
  };

  const openEditDialog = (policy: PolicyRecord) => {
    reset({
      name: policy.name,
      designation: policy.designation ?? "",
      basic: Number(policy.basic),
      houseRent: Number(policy.houseRent),
      medical: Number(policy.medical),
      transport: Number(policy.transport),
      deductions: Number(policy.deductions),
    });
    setIsDefault(policy.isDefault);
    setEditingId(policy.id);
    setErrorMessage(null);
    setDialogKey((k) => k + 1);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    if (!saving) {
      setIsDialogOpen(false);
      setErrorMessage(null);
    }
  };

  const handleSave = async (values: PolicyFormValues) => {
    if (!isDefault && !values.designation?.trim()) {
      setErrorMessage("Set a designation, or mark this policy as the tenant default.");
      return;
    }
    setErrorMessage(null);
    const input = {
      name: values.name.trim(),
      designation: isDefault ? undefined : values.designation?.trim(),
      isDefault,
      basic: values.basic,
      houseRent: values.houseRent,
      medical: values.medical,
      transport: values.transport,
      deductions: values.deductions ?? 0,
    };
    try {
      if (editingId) {
        const result = await updateSalaryPolicy({ variables: { id: editingId, input } });
        if (result.error) throw result.error;
        toast.success(`Salary policy "${values.name.trim()}" updated.`);
      } else {
        const result = await createSalaryPolicy({ variables: { input } });
        if (result.error) throw result.error;
        toast.success(`Salary policy "${values.name.trim()}" created.`);
      }
      closeDialog();
      await refetch();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to save salary policy.");
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const handleDelete = async (policy: PolicyRecord) => {
    setDeletingId(policy.id);
    try {
      const result = await deleteSalaryPolicy({ variables: { id: policy.id } });
      if (result.error) throw result.error;
      toast.success(`Salary policy "${policy.name}" deleted.`);
      await refetch();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to delete salary policy."));
    } finally {
      setDeletingId(null);
    }
  };

  const defaultPolicy = policies.find((p) => p.isDefault);
  const designationCount = policies.filter((p) => !p.isDefault).length;

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
          <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" spacing={3}>
            <Box sx={{ maxWidth: 760 }}>
              <Typography variant="h4" component="h1" sx={{ mt: 0.5 }}>
                Salary policies
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Define a default salary by designation, or a tenant-wide fallback.
                Payroll uses an employee&apos;s custom salary structure if set; otherwise
                it falls back to the matching designation policy, then the tenant default.
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: { xs: "stretch", lg: "flex-end" },
                minWidth: { lg: 220 },
              }}
            >
              <Button
                variant="contained"
                startIcon={<AddRounded />}
                onClick={openCreateDialog}
                fullWidth
                sx={{ maxWidth: { xs: "100%", lg: 220 }, backgroundColor: primaryGradient }}
              >
                Create policy
              </Button>
            </Box>
          </Stack>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0,1fr))", xl: "repeat(3, minmax(0,1fr))" },
          }}
        >
          <SummaryCard
            caption="Designation policies"
            title={loading ? "…" : String(designationCount)}
            icon={<WorkRounded />}
          />
          <SummaryCard
            caption="Tenant default"
            title={loading ? "…" : defaultPolicy ? `৳${Number(defaultPolicy.basic).toLocaleString()}` : "Not set"}
            icon={<StarRounded />}
            tone={defaultPolicy ? "success" : "warning"}
          />
        </Box>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {!loading && policies.length > 0 && (
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0,1fr))", xl: "repeat(3, minmax(0,1fr))" },
            }}
          >
            {policies.map((policy) => (
              <PolicyCard
                key={policy.id}
                policy={policy}
                onEdit={() => openEditDialog(policy)}
                onDelete={() => handleDelete(policy)}
                deleting={deletingId === policy.id}
              />
            ))}
          </Box>
        )}

        {!loading && policies.length === 0 && (
          <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, border: "1px solid", borderColor: "divider", textAlign: "center" }}>
            <PolicyRounded sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6">No salary policies yet</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
              Without a policy, employees with no custom salary structure are skipped during payroll.
            </Typography>
            <Button variant="contained" onClick={openCreateDialog} startIcon={<AddRounded />}>
              Create policy
            </Button>
          </Paper>
        )}
      </Stack>

      <Dialog key={dialogKey} open={isDialogOpen} onClose={saving ? undefined : closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? "Edit salary policy" : "Create salary policy"}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(handleSave)} noValidate>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

              <RhfTextField control={control} name="name" label="Policy name *" placeholder="e.g. Teacher Salary Policy" trim />

              <FormControlLabel
                control={<Switch checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />}
                label="Tenant default (applies when no designation policy matches)"
              />

              {!isDefault ? (
                <RhfTextField
                  control={control}
                  name="designation"
                  label="Designation *"
                  placeholder="e.g. Teacher"
                  helperText="Must match the employee's designation exactly"
                  trim
                />
              ) : null}

              <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
                <RhfTextField control={control} name="basic" label="Basic *" type="number" />
                <RhfTextField control={control} name="houseRent" label="House rent *" type="number" />
                <RhfTextField control={control} name="medical" label="Medical *" type="number" />
                <RhfTextField control={control} name="transport" label="Transport *" type="number" />
              </Box>
              <RhfTextField control={control} name="deductions" label="Deductions" type="number" />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button color="inherit" onClick={closeDialog} disabled={saving}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}
            >
              {editingId ? "Save changes" : "Create policy"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}
