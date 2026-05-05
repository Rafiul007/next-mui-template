import { Alert, Box, Chip, Stack, Typography } from "@mui/material";
import { WorkspacePremiumRounded } from "@mui/icons-material";
import { CardSectionHeader, InfoValue, SectionCard } from "@/components/ui";
import { primaryGradient } from "@/theme/theme";
import type {
  GetSubscriptionPlanQuery,
  GetTenantQuery,
} from "@/graphql/generated";
import { formatCurrency, formatDate } from "./center-utils";

type PlanRecord = GetSubscriptionPlanQuery["getSubscriptionPlan"];
type TenantRecord = GetTenantQuery["getTenant"];

type SubscriptionPlanCardProps = {
  isLoading: boolean;
  plan: PlanRecord;
  tenant: TenantRecord;
};

export function SubscriptionPlanCard({
  isLoading,
  plan,
  tenant,
}: SubscriptionPlanCardProps) {
  return (
    <SectionCard sx={{ p: 3, display: "grid", gap: 2.5 }}>
      <CardSectionHeader
        icon={<WorkspacePremiumRounded />}
        iconSx={{ background: primaryGradient, color: "#ffffff" }}
        title="Subscription plan"
        description="Current entitlements and limits for this tenant."
      />

      {!tenant ? (
        <Alert severity="info">
          Save the center profile first to load the linked tenant and
          subscription plan details.
        </Alert>
      ) : isLoading ? (
        <Typography variant="body2" color="text.secondary">
          Loading subscription details...
        </Typography>
      ) : !plan ? (
        <Alert severity="warning">
          The linked subscription plan could not be loaded.
        </Alert>
      ) : (
        <Stack spacing={2.25}>
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h6">{plan.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {plan.billingCycle} billing
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="h6">
                {formatCurrency(plan.priceBdt)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Trial ends {formatDate(tenant.trialEndsAt)}
              </Typography>
            </Box>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gap: 1.5,
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            }}
          >
            <InfoValue label="Branches" value={String(plan.maxBranches)} />
            <InfoValue label="Students" value={String(plan.maxStudents)} />
            <InfoValue label="Staff" value={String(plan.maxStaff)} />
            <InfoValue label="SMS credits" value={String(plan.smsCredits)} />
            <InfoValue label="Storage" value={`${plan.storageGb} GB`} />
            <InfoValue
              label="Plan status"
              value={plan.active ? "Active" : "Inactive"}
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Included feature
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {plan.featureFlags.length ? (
                plan.featureFlags.map((flag) => (
                  <Chip key={flag} label={flag} size="small" />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No explicit feature flags listed for this plan.
                </Typography>
              )}
            </Stack>
          </Box>
        </Stack>
      )}
    </SectionCard>
  );
}
