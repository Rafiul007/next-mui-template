"use client";

import { useMemo, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import {
  AddRounded,
  CheckRounded,
  CloseRounded,
  EditRounded,
  StorageRounded,
} from "@mui/icons-material";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Switch,
  Typography,
  alpha,
} from "@mui/material";
import { toast } from "react-hot-toast";
import { RhfCheckboxGroup, RhfSelect, RhfTextField } from "@/components/form";
import { FormGrid } from "@/components/ui/FormGrid";
import {
  CreateSubscriptionPlanDocument,
  GetSubscriptionPlansDocument,
  UpdateSubscriptionPlanDocument,
} from "@/graphql/generated";
import { getErrorMessage } from "@/lib/errors";
import { primaryGradient } from "@/theme/theme";
import type { PlanFieldConfig } from "@/constants/subscription";
import {
  LIMIT_ROWS,
  billingCycleSuffix,
  buildPlanSections,
  formatBillingCycle,
  formatBdt,
  formatFlagLabel,
  formatLimit,
  planSchema,
  toLimit,
  type PlanFormValues,
} from "@/constants/subscription";
import type { PlanRecord } from "@/models/subscription";

// ─── Plan Form Dialog ─────────────────────────────────────────────────────────

function PlanFormDialog({
  open,
  plan,
  plans,
  onClose,
}: {
  open: boolean;
  plan: PlanRecord | null;
  plans: PlanRecord[];
  onClose: () => void;
}) {
  const isEdit = !!plan;
  const sections = useMemo(() => buildPlanSections(plans), [plans]);

  const { control, handleSubmit, reset } = useForm<PlanFormValues>({
    resolver: yupResolver(planSchema),
    defaultValues: {
      name:         plan?.name ?? "",
      billingCycle: plan?.billingCycle ?? "monthly",
      priceBdt:     plan?.priceBdt.toString() ?? "",
      maxStudents:  plan?.maxStudents === -1 ? "" : (plan?.maxStudents.toString() ?? ""),
      maxStaff:     plan?.maxStaff === -1 ? "" : (plan?.maxStaff.toString() ?? ""),
      maxBranches:  plan?.maxBranches === -1 ? "" : (plan?.maxBranches.toString() ?? ""),
      smsCredits:   plan?.smsCredits.toString() ?? "",
      storageGb:    plan?.storageGb.toString() ?? "",
      featureFlags: plan?.featureFlags ?? [],
    },
  });

  const refetch = { refetchQueries: [GetSubscriptionPlansDocument] };
  const [createPlan, { loading: creating }] = useMutation(CreateSubscriptionPlanDocument, refetch);
  const [updatePlan, { loading: updating }] = useMutation(UpdateSubscriptionPlanDocument, refetch);
  const saving = creating || updating;

  const handleClose = () => { reset(); onClose(); };

  const onSubmit = handleSubmit(async (values) => {
    const common = {
      name:         values.name,
      billingCycle: values.billingCycle,
      priceBdt:     parseFloat(values.priceBdt),
      maxStudents:  toLimit(values.maxStudents),
      maxStaff:     toLimit(values.maxStaff),
      maxBranches:  toLimit(values.maxBranches),
      smsCredits:   parseInt(values.smsCredits, 10),
      storageGb:    parseInt(values.storageGb, 10),
      featureFlags: values.featureFlags,
    };

    try {
      if (isEdit) {
        await updatePlan({ variables: { plan: { id: plan.id, ...common } } });
        toast.success("Plan updated");
      } else {
        await createPlan({ variables: { plan: common } });
        toast.success("Plan created");
      }
      handleClose();
    } catch (err) {
      toast.error(getErrorMessage(err, isEdit ? "Failed to update plan" : "Failed to create plan"));
    }
  });

  const renderField = (field: PlanFieldConfig) => {
    if (field.kind === "select") {
      return (
        <RhfSelect
          key={field.name}
          control={control}
          name={field.name}
          label={field.label}
          options={field.options}
          size="small"
          sx={field.fullSpan ? { gridColumn: "1 / -1" } : undefined}
        />
      );
    }
    if (field.kind === "checkboxGroup") {
      return (
        <RhfCheckboxGroup
          key={field.name}
          control={control}
          name={field.name}
          label={field.label}
          options={field.options}
          sx={field.fullSpan ? { gridColumn: "1 / -1" } : undefined}
        />
      );
    }
    return (
      <RhfTextField
        key={field.name}
        control={control}
        name={field.name}
        label={field.label}
        placeholder={field.placeholder}
        type={field.type}
        helperText={field.helperText}
        size="small"
        sx={field.fullSpan ? { gridColumn: "1 / -1" } : undefined}
      />
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <Box component="span" sx={{ fontWeight: 700 }}>
          {isEdit ? "Edit Plan" : "New Subscription Plan"}
        </Box>
        <IconButton size="small" onClick={handleClose}>
          <CloseRounded fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1, pb: 2 }} component="form" onSubmit={onSubmit}>
          {sections.map((section) => (
            <Box key={section.key}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                {section.label}
              </Typography>
              <FormGrid>{section.fields.map(renderField)}</FormGrid>
            </Box>
          ))}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={saving}
            sx={{ background: primaryGradient, color: "#fff", fontWeight: 700, py: 1.25 }}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {isEdit ? "Save Changes" : "Create Plan"}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  onEdit,
  onToggle,
  toggling,
}: {
  plan: PlanRecord;
  onEdit: () => void;
  onToggle: () => void;
  toggling: boolean;
}) {
  return (
    <Card
      sx={{
        border: "1px solid",
        borderColor: plan.active ? alpha("#10b981", 0.2) : "divider",
        transition: "border-color 0.2s",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
              {plan.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "capitalize" }}>
              {formatBillingCycle(plan.billingCycle)} billing
            </Typography>
          </Box>

          <Stack direction="row" alignItems="center" spacing={0.5}>
            {toggling ? (
              <CircularProgress size={18} sx={{ mx: 0.75 }} />
            ) : (
              <Switch size="small" checked={plan.active} onChange={onToggle} />
            )}
            <IconButton size="small" onClick={onEdit}>
              <EditRounded fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>

        <Typography variant="h4" fontWeight={800} sx={{ mb: 2 }}>
          ৳{formatBdt(plan.priceBdt)}
          <Typography component="span" variant="body2" color="text.secondary" fontWeight={400}>
            /{billingCycleSuffix(plan.billingCycle)}
          </Typography>
        </Typography>

        <Stack spacing={1} sx={{ mb: 2.5 }}>
          {LIMIT_ROWS.map(({ label, key }) => (
            <Stack key={key} direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">{label}</Typography>
              <Typography variant="body2" fontWeight={600}>{formatLimit(plan[key])}</Typography>
            </Stack>
          ))}
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Storage</Typography>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <StorageRounded sx={{ fontSize: 14, color: "text.secondary" }} />
              <Typography variant="body2" fontWeight={600}>{plan.storageGb} GB</Typography>
            </Stack>
          </Stack>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={0.75}>
          {plan.featureFlags.map((flag) => (
            <Stack key={flag} direction="row" alignItems="center" spacing={1}>
              <CheckRounded sx={{ fontSize: 14, color: "primary.main" }} />
              <Typography variant="body2">{formatFlagLabel(flag)}</Typography>
            </Stack>
          ))}
        </Stack>

        {!plan.active && (
          <Box
            sx={{
              mt: 2, px: 1.5, py: 1, borderRadius: 1.5,
              bgcolor: alpha("#ef4444", 0.06),
              border: "1px solid", borderColor: alpha("#ef4444", 0.12),
            }}
          >
            <Typography variant="caption" color="error.main" fontWeight={600}>
              This plan is inactive — hidden from new tenant signup
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Subscriptions Workspace ──────────────────────────────────────────────────

export function SubscriptionsWorkspace() {
  const [dialogState, setDialogState] = useState<{ plan: PlanRecord | null } | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { data } = useQuery(GetSubscriptionPlansDocument);
  const plans = useMemo(() => data?.getSubscriptionPlans ?? [], [data]);

  const [updatePlan] = useMutation(UpdateSubscriptionPlanDocument, {
    refetchQueries: [GetSubscriptionPlansDocument],
  });

  const handleToggle = async (plan: PlanRecord) => {
    setTogglingId(plan.id);
    try {
      await updatePlan({ variables: { plan: { id: plan.id, active: !plan.active } } });
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update plan"));
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>Subscription Plans</Typography>
            <Typography variant="body2" color="text.secondary">
              Define pricing tiers, limits, and features for tenant subscriptions
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={() => setDialogState({ plan: null })}
            sx={{ background: primaryGradient, color: "#fff", fontWeight: 700, whiteSpace: "nowrap" }}
          >
            New Plan
          </Button>
        </Stack>

        {plans.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <Typography color="text.secondary">No subscription plans yet.</Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", xl: "repeat(4, minmax(0, 1fr))" },
              gap: 2,
            }}
          >
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onEdit={() => setDialogState({ plan })}
                onToggle={() => handleToggle(plan)}
                toggling={togglingId === plan.id}
              />
            ))}
          </Box>
        )}
      </Stack>

      {dialogState !== null && (
        <PlanFormDialog
          open
          plan={dialogState.plan}
          plans={plans}
          onClose={() => setDialogState(null)}
        />
      )}
    </>
  );
}
