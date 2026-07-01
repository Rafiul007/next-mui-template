"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useMutation, useQuery } from "@apollo/client/react";
import { toast } from "react-hot-toast";
import {
  GetCenterDocument,
  GetMyPlanDocument,
  GetTenantDocument,
  SetupCenterDocument,
  UpdateCenterDocument,
  UpdateTenantDocument,
} from "@/graphql/generated";
import { getErrorMessage } from "@/lib/errors";
import {
  CenterProfileFormCard,
  type CenterProfileFormValues,
} from "./CenterProfileFormCard";
import { CenterProfileSummaryCard } from "./CenterProfileSummaryCard";
import {
  TenantLegalFormCard,
  type TenantLegalFormValues,
} from "./TenantLegalFormCard";
import { TenantLegalSummaryCard } from "./TenantLegalSummaryCard";
import { SubscriptionPlanCard } from "./SubscriptionPlanCard";
import { TenantStatusCard } from "./TenantStatusCard";
import { formatDate, toOptionalNumber, toOptionalString } from "./center-utils";

export function CenterDetailsWorkspace() {
  const [centerErrorMessage, setCenterErrorMessage] = useState<string | null>(
    null,
  );
  const [tenantErrorMessage, setTenantErrorMessage] = useState<string | null>(
    null,
  );
  const [isCenterEditOpen, setIsCenterEditOpen] = useState(false);
  const [isTenantEditOpen, setIsTenantEditOpen] = useState(false);

  const {
    data: centerData,
    error: centerError,
    loading: isCenterLoading,
    refetch: refetchCenter,
  } = useQuery(GetCenterDocument);

  const center = centerData?.getCenter ?? null;
  const tenantId = center?.tenantId ?? null;

  const {
    data: tenantData,
    error: tenantError,
    loading: isTenantLoading,
    refetch: refetchTenant,
  } = useQuery(GetTenantDocument, {
    skip: !tenantId,
    variables: { id: tenantId ?? "" },
  });
  const tenant = tenantData?.getTenant ?? null;

  const {
    data: planData,
    error: planError,
    loading: isPlanLoading,
    refetch: refetchPlan,
  } = useQuery(GetMyPlanDocument);
  const plan = planData?.getMyPlan ?? null;

  const [setupCenter, setupCenterState] = useMutation(SetupCenterDocument);
  const [updateCenter, updateCenterState] = useMutation(UpdateCenterDocument);
  const [updateTenant, updateTenantState] = useMutation(UpdateTenantDocument);
  const isSavingCenter = setupCenterState.loading || updateCenterState.loading;
  const isSavingTenant = updateTenantState.loading;
  const pageError = centerError ?? tenantError ?? planError;

  const saveCenterProfile = async (values: CenterProfileFormValues) => {
    setCenterErrorMessage(null);
    const centerInput = {
      name: values.name.trim(),
      nameBangla: toOptionalString(values.nameBangla),
      tagline: toOptionalString(values.tagline),
      logo: toOptionalString(values.logo),
      establishedYear: toOptionalNumber(values.establishedYear),
      academicYearStartMonth: toOptionalNumber(values.academicYearStartMonth),
      email: toOptionalString(values.email),
      phone: toOptionalString(values.phone),
      address: toOptionalString(values.address),
    };
    try {
      const result = center
        ? await updateCenter({ variables: { center: centerInput } })
        : await setupCenter({ variables: { center: centerInput } });
      if (result.error) throw result.error;
      await refetchCenter();
      toast.success(
        center
          ? "Center profile updated."
          : "Center profile created successfully.",
      );
      return true;
    } catch (error) {
      const message = getErrorMessage(error, "Unable to save center profile.");

      setCenterErrorMessage(message);
      toast.error(message);
      return false;
    }
  };

  const saveTenantLegal = async (values: TenantLegalFormValues) => {
    if (!tenant) {
      setTenantErrorMessage(
        "Tenant details are not available until the center profile is linked.",
      );
      return false;
    }
    setTenantErrorMessage(null);
    try {
      const result = await updateTenant({
        variables: {
          tenant: {
            id: tenant.id,
            legalName: values.legalName.trim(),
            contactName: toOptionalString(values.contactName),
            contactEmail: values.contactEmail.trim(),
            contactPhone: toOptionalString(values.contactPhone),
            address: toOptionalString(values.address),
            tradeLicense: toOptionalString(values.tradeLicense),
            eBIN: toOptionalString(values.eBIN),
          },
        },
      });
      if (result.error) throw result.error;
      await Promise.all([refetchTenant(), refetchPlan()]);
      toast.success("Tenant legal information updated.");
      return true;
    } catch (error) {
      const message = getErrorMessage(error, "Unable to save tenant details.");

      setTenantErrorMessage(message);
      toast.error(message);
      return false;
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
              "linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(240,249,255,0.98) 100%)",
          }}
        >
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={3}
            justifyContent="space-between"
          >
            <Box sx={{ maxWidth: 760 }}>
              <Typography variant="h4" component="h1" sx={{ mt: 0.5 }}>
                Your Profile
              </Typography>
            </Box>

            <Stack spacing={1.25} sx={{ minWidth: { lg: 280 } }}>
              <Chip
                label={
                  center
                    ? `Center linked: ${center.name}`
                    : "Center not configured"
                }
                color={center ? "success" : "default"}
                sx={{ alignSelf: { xs: "flex-start", lg: "flex-end" } }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: { lg: "right" } }}
              >
                {tenant
                  ? `Tenant created ${formatDate(tenant.createdAt)}`
                  : "Create the center profile first to load tenant-linked data."}
              </Typography>
            </Stack>
          </Stack>
        </Paper>

        {pageError ? (
          <Alert severity="error">
            {pageError.message || "Unable to load center details right now."}
          </Alert>
        ) : null}

        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", xl: "1.25fr 0.75fr" },
            alignItems: "start",
          }}
        >
          <Stack spacing={3}>
            {center ? (
              <CenterProfileSummaryCard
                center={center}
                onEdit={() => setIsCenterEditOpen(true)}
              />
            ) : (
              <CenterProfileFormCard
                center={center}
                errorMessage={centerErrorMessage}
                isSubmitting={isSavingCenter}
                onSubmit={async (values) => {
                  await saveCenterProfile(values);
                }}
              />
            )}

            {tenant ? (
              <TenantLegalSummaryCard
                tenant={tenant}
                onEdit={() => setIsTenantEditOpen(true)}
              />
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Stack spacing={2}>
                  <Typography variant="h5">
                    Legal and business information
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tenant-level legal details appear after the center profile
                    has been created and linked to a tenant.
                  </Typography>
                </Stack>
              </Paper>
            )}
          </Stack>

          <Stack spacing={3}>
            <SubscriptionPlanCard
              isLoading={isTenantLoading || isPlanLoading || isCenterLoading}
              plan={plan}
              tenant={tenant}
            />
            <TenantStatusCard tenant={tenant} />
          </Stack>
        </Box>
      </Stack>

      {center ? (
        <Dialog
          open={isCenterEditOpen}
          onClose={
            isSavingCenter ? undefined : () => setIsCenterEditOpen(false)
          }
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>Edit center profile</DialogTitle>
          <DialogContent dividers>
            <CenterProfileFormCard
              center={center}
              embedded
              hideHeader
              errorMessage={centerErrorMessage}
              isSubmitting={isSavingCenter}
              submitLabel="Save changes"
              onSubmit={async (values) => {
                const saved = await saveCenterProfile(values);
                if (saved) {
                  setIsCenterEditOpen(false);
                }
              }}
            />
          </DialogContent>
        </Dialog>
      ) : null}

      {tenant ? (
        <Dialog
          open={isTenantEditOpen}
          onClose={
            isSavingTenant ? undefined : () => setIsTenantEditOpen(false)
          }
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>Edit legal information</DialogTitle>
          <DialogContent dividers>
            <TenantLegalFormCard
              tenant={tenant}
              embedded
              hideHeader
              errorMessage={tenantErrorMessage}
              isSubmitting={isSavingTenant}
              submitLabel="Save changes"
              onSubmit={async (values) => {
                const saved = await saveTenantLegal(values);
                if (saved) {
                  setIsTenantEditOpen(false);
                }
              }}
            />
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}
