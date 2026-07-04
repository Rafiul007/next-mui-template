"use client";

import { useMemo } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { CloseRounded } from "@mui/icons-material";
import { useMutation } from "@apollo/client/react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { toast } from "react-hot-toast";
import { RhfDatePicker, RhfSelect, RhfTextField } from "@/components/form";
import { FormGrid } from "@/components/ui/FormGrid";
import {
  CreateTenantDocument,
  GetTenantsDocument,
  UpdateTenantDocument,
} from "@/graphql/generated";
import { getErrorMessage } from "@/lib/errors";
import { primaryGradient } from "@/theme/theme";
import type { TenantFieldConfig } from "@/constants/tenant";
import {
  buildTenantSections,
  emptyTenantDefaults,
  tenantFormSchema,
  type TenantFormValues,
} from "@/constants/tenant";
import { billingCycleSuffix } from "@/constants/subscription";
import type { TenantRecord } from "@/models/tenant";
import type { PlanRecord } from "@/models/subscription";

export function TenantFormDialog({
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
    () => buildTenantSections(planOptions, mode),
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
      : emptyTenantDefaults,
    mode: "onTouched",
  });

  const [createTenant, { loading: creating }] = useMutation(CreateTenantDocument, {
    refetchQueries: [GetTenantsDocument],
    onCompleted: (data) => {
      toast.success(`"${data.createTenant.legalName}" created`);
      reset(emptyTenantDefaults);
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

  const renderField = (field: TenantFieldConfig) => {
    const spanSx = { minWidth: 0, ...(field.fullSpan ? { gridColumn: "1 / -1" } : {}) };

    if (field.kind === "select") {
      return (
        <Box key={field.name} sx={spanSx}>
          <RhfSelect control={control} name={field.name} label={field.label} options={field.options} fullWidth />
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
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="md" fullWidth>
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
