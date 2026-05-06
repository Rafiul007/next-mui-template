import { Alert, Box, Chip, Stack, Typography, alpha } from "@mui/material";
import { SettingsRounded } from "@mui/icons-material";
import { CardSectionHeader, SectionCard } from "@/components/ui";
import type { GetTenantQuery } from "@/graphql/generated";
import { formatDate, formatStatusLabel, statusChipColor } from "./center-utils";

type TenantRecord = GetTenantQuery["getTenant"];

type TenantStatusCardProps = {
  tenant: TenantRecord;
};

export function TenantStatusCard({ tenant }: TenantStatusCardProps) {
  return (
    <SectionCard sx={{ p: 3, display: "grid", gap: 2.5 }}>
      <CardSectionHeader
        icon={<SettingsRounded />}
        iconSx={{ bgcolor: alpha("#0f172a", 0.06), color: "#0f172a" }}
        title="Workspace status"
        description="Read-only lifecycle details for the current tenant workspace."
      />

      {!tenant ? (
        <Alert severity="info">
          Workspace status becomes available after the center is linked to a
          tenant.
        </Alert>
      ) : (
        <>
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="subtitle2">Current status</Typography>
              <Chip
                label={formatStatusLabel(tenant.status)}
                color={statusChipColor(tenant.status)}
                sx={{ mt: 1 }}
              />
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="caption" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {formatDate(tenant.createdAt)}
              </Typography>
            </Box>
          </Stack>

          <Alert severity="info">
            Account activation, suspension, billing, and tenant lifecycle
            changes are managed by the BongoEdu360 platform team, not from this
            tenant dashboard.
          </Alert>
        </>
      )}
    </SectionCard>
  );
}
