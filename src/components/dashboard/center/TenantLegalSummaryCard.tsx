import { BusinessRounded, EditRounded } from "@mui/icons-material";
import { Box, Button, Stack, Typography } from "@mui/material";
import {
  CardSectionHeader,
  InfoBox,
  InfoValue,
  SectionCard,
} from "@/components/ui";
import type { GetTenantQuery } from "@/graphql/generated";

type TenantRecord = GetTenantQuery["getTenant"];

type TenantLegalSummaryCardProps = {
  onEdit: () => void;
  tenant: TenantRecord;
};

export function TenantLegalSummaryCard({
  onEdit,
  tenant,
}: TenantLegalSummaryCardProps) {
  return (
    <SectionCard sx={{ p: { xs: 3, md: 4 } }}>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={2}
        >
          <CardSectionHeader
            icon={<BusinessRounded />}
            iconSx={{ bgcolor: "rgba(15, 23, 42, 0.06)", color: "#0f172a" }}
            title="Legal and business information"
            description="Review company registration details and the operational contact information used by the workspace."
          />

          <Button
            variant="outlined"
            startIcon={<EditRounded />}
            onClick={onEdit}
            sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
          >
            Edit details
          </Button>
        </Stack>

        <InfoBox>
          <Typography variant="subtitle2">Workspace slug</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {tenant?.slug || "Unavailable"}
          </Typography>
        </InfoBox>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          }}
        >
          <InfoValue
            label="Legal name"
            value={tenant?.legalName || "Not set"}
          />
          <InfoValue
            label="Contact person"
            value={tenant?.contactName || "Not set"}
          />
          <InfoValue
            label="Contact email"
            value={tenant?.contactEmail || "Not set"}
          />
          <InfoValue
            label="Contact phone"
            value={tenant?.contactPhone || "Not set"}
          />
          <InfoValue
            label="Trade license number"
            value={tenant?.tradeLicense || "Not set"}
          />
          <InfoValue label="eBIN number" value={tenant?.eBIN || "Not set"} />
          <Box sx={{ gridColumn: { md: "1 / -1" } }}>
            <InfoValue
              label="Registered address"
              value={tenant?.address || "Not set"}
            />
          </Box>
        </Box>
      </Stack>
    </SectionCard>
  );
}
