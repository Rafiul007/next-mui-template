"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  AddRounded,
  PolicyRounded,
  CheckCircleRounded,
  TimerRounded,
  DeleteRounded,
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
import {
  RhfSelect,
  RhfTextField,
  type RhfSelectOption,
} from "@/components/form";
import { SummaryCard } from "@/components/ui";
import {
  CreateLeavePolicyDocument,
  GetLeavePoliciesDocument,
  type GetLeavePoliciesQuery,
} from "@/graphql/generated";
import { getErrorMessage } from "@/lib/errors";
import { primaryGradient } from "@/theme/theme";

type PolicyRecord = NonNullable<
  GetLeavePoliciesQuery["getLeavePolicies"][number]
>;

const leaveTypeOptions: RhfSelectOption[] = [
  { label: "Sick leave", value: "sick" },
  { label: "Casual leave", value: "casual" },
  { label: "Annual leave", value: "annual" },
  { label: "Maternity leave", value: "maternity" },
  { label: "Unpaid leave", value: "unpaid" },
];

const policySchema = yup
  .object({
    name: yup.string().trim().required("Policy name is required"),
    leaveType: yup.string().required("Leave type is required"),
    totalDaysPerYear: yup
      .number()
      .typeError("Must be a number")
      .min(1, "Minimum 1 day")
      .max(365)
      .integer()
      .required("Total days is required"),
    carryForwardDays: yup
      .number()
      .typeError("Must be a number")
      .min(0)
      .max(365)
      .integer()
      .required("Carry forward days is required"),
    description: yup.string().trim().default(""),
  })
  .required();

type PolicyFormValues = yup.InferType<typeof policySchema>;

const LEAVE_TYPE_LABEL: Record<string, string> = {
  sick: "Sick",
  casual: "Casual",
  annual: "Annual",
  maternity: "Maternity",
  unpaid: "Unpaid",
  SICK: "Sick",
  CASUAL: "Casual",
  ANNUAL: "Annual",
  MATERNITY: "Maternity",
  UNPAID: "Unpaid",
};

// ── Policy card ───────────────────────────────────────────────────────────────

function PolicyCard({ policy }: { policy: PolicyRecord }) {
  const typeLabel =
    LEAVE_TYPE_LABEL[policy.leaveType] ??
    policy.leaveType.charAt(0).toUpperCase() +
      policy.leaveType.slice(1).toLowerCase();

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
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={1}
      >
        <Box flex={1} minWidth={0}>
          <Typography variant="subtitle1" fontWeight={700} noWrap>
            {policy.name}
          </Typography>
          <Chip
            label={typeLabel}
            size="small"
            variant="outlined"
            sx={{ mt: 0.5 }}
          />
        </Box>
        <Chip
          label={policy.requiresApproval ? "Approval required" : "Auto-approved"}
          size="small"
          color={policy.requiresApproval ? "default" : "success"}
        />
      </Stack>

      {policy.description ? (
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
          {policy.description}
        </Typography>
      ) : null}

      <Divider />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 1,
        }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary">
            Days per year
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {policy.totalDaysPerYear}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Carry-forward
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {policy.carryForwardDays} day{policy.carryForwardDays !== 1 ? "s" : ""}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

// ── Main Workspace ────────────────────────────────────────────────────────────

export function LeavePolicyWorkspace() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery(GetLeavePoliciesDocument);
  const policies: PolicyRecord[] = data?.getLeavePolicies ?? [];

  const [createLeavePolicy, createState] = useMutation(CreateLeavePolicyDocument);

  const { control, handleSubmit, reset } = useForm<PolicyFormValues>({
    resolver: yupResolver(policySchema),
    defaultValues: {
      name: "",
      leaveType: "",
      totalDaysPerYear: 14,
      carryForwardDays: 0,
      description: "",
    },
    mode: "onTouched",
  });

  const openDialog = () => {
    reset();
    setRequiresApproval(true);
    setErrorMessage(null);
    setDialogKey((k) => k + 1);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    if (!createState.loading) {
      setIsDialogOpen(false);
      setErrorMessage(null);
    }
  };

  const handleCreate = async (values: PolicyFormValues) => {
    setErrorMessage(null);
    try {
      const result = await createLeavePolicy({
        variables: {
          input: {
            name: values.name.trim(),
            leaveType: values.leaveType.toUpperCase(),
            totalDaysPerYear: values.totalDaysPerYear,
            carryForwardDays: values.carryForwardDays,
            requiresApproval,
            description: values.description?.trim() || undefined,
          },
        },
      });
      if (result.error) throw result.error;
      toast.success(`Leave policy "${values.name.trim()}" created.`);
      closeDialog();
      await refetch();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to create leave policy.");
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const requireApprovalCount = policies.filter((p) => p.requiresApproval).length;
  const carryForwardCount = policies.filter((p) => p.carryForwardDays > 0).length;

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
                Leave policies
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Configure leave types, entitlements, and carry-forward rules for
                your organisation.
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
                onClick={openDialog}
                fullWidth
                sx={{ maxWidth: { xs: "100%", lg: 220 }, backgroundColor: primaryGradient }}
              >
                Create policy
              </Button>
            </Box>
          </Stack>
        </Paper>

        {/* Summary cards */}
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0,1fr))",
              xl: "repeat(3, minmax(0,1fr))",
            },
          }}
        >
          <SummaryCard
            caption="Policies defined"
            title={loading ? "…" : String(policies.length)}
            icon={<PolicyRounded />}
          />
          <SummaryCard
            caption="Require approval"
            title={loading ? "…" : String(requireApprovalCount)}
            icon={<CheckCircleRounded />}
            tone="success"
          />
          <SummaryCard
            caption="With carry-forward"
            title={loading ? "…" : String(carryForwardCount)}
            icon={<TimerRounded />}
            tone="default"
          />
        </Box>

        {/* Loading state */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {/* Policy grid */}
        {!loading && policies.length > 0 && (
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0,1fr))",
                xl: "repeat(3, minmax(0,1fr))",
              },
            }}
          >
            {policies.map((policy) => (
              <PolicyCard key={policy.id} policy={policy} />
            ))}
          </Box>
        )}

        {/* Empty state */}
        {!loading && policies.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 6 },
              border: "1px solid",
              borderColor: "divider",
              textAlign: "center",
            }}
          >
            <PolicyRounded sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6">No leave policies yet</Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, mb: 3 }}
            >
              Create your first leave policy to define entitlements for your team.
            </Typography>
            <Button
              variant="contained"
              onClick={openDialog}
              startIcon={<AddRounded />}
            >
              Create policy
            </Button>
          </Paper>
        )}
      </Stack>

      {/* Create dialog */}
      <Dialog
        key={dialogKey}
        open={isDialogOpen}
        onClose={createState.loading ? undefined : closeDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create leave policy</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(handleCreate)} noValidate>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              {errorMessage ? (
                <Alert severity="error">{errorMessage}</Alert>
              ) : null}

              <RhfTextField
                control={control}
                name="name"
                label="Policy name *"
                placeholder="e.g. Annual Leave 2026"
                trim
              />

              <RhfSelect
                control={control}
                name="leaveType"
                label="Leave type *"
                options={leaveTypeOptions}
                placeholder="Select type"
              />

              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                }}
              >
                <RhfTextField
                  control={control}
                  name="totalDaysPerYear"
                  label="Total days per year *"
                  type="number"
                  helperText="Entitlement days employees receive"
                />
                <RhfTextField
                  control={control}
                  name="carryForwardDays"
                  label="Carry-forward days *"
                  type="number"
                  helperText="Max days that roll over to next year"
                />
              </Box>

              <RhfTextField
                control={control}
                name="description"
                label="Description"
                multiline
                rows={2}
                trim
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={requiresApproval}
                    onChange={(e) => setRequiresApproval(e.target.checked)}
                  />
                }
                label="Requires manager approval"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              color="inherit"
              onClick={closeDialog}
              disabled={createState.loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createState.loading}
              startIcon={
                createState.loading ? (
                  <CircularProgress size={14} color="inherit" />
                ) : undefined
              }
            >
              Create policy
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}
