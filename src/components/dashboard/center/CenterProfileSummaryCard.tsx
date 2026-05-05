import { EditRounded, ImageRounded } from "@mui/icons-material";
import { Avatar, Box, Button, Stack, Typography } from "@mui/material";
import { CardSectionHeader, InfoValue, InfoBox, SectionCard } from "@/components/ui";
import type { GetCenterQuery } from "@/graphql/generated";
import { primaryGradient } from "@/theme/theme";

type CenterRecord = GetCenterQuery["getCenter"];

const formatMonth = (month?: number | null) => {
  if (!month) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
  }).format(new Date(2000, month - 1, 1));
};

type CenterProfileSummaryCardProps = {
  center: CenterRecord;
  onEdit: () => void;
};

export function CenterProfileSummaryCard({
  center,
  onEdit,
}: CenterProfileSummaryCardProps) {
  return (
    <SectionCard sx={{ p: { xs: 3, md: 4 } }}>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={2}
        >
          <CardSectionHeader
            icon={
              <Avatar
                src={center?.logo || undefined}
                sx={{
                  width: 42,
                  height: 42,
                  background: center?.logo ? undefined : primaryGradient,
                }}
              >
                {!center?.logo ? <ImageRounded fontSize="small" /> : null}
              </Avatar>
            }
            title="Center profile"
            description="Review the center identity, public contact details, and academic year defaults."
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
          <Stack spacing={0.5}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {center?.name || "Not set"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {center?.tagline || "No tagline added"}
            </Typography>
          </Stack>
        </InfoBox>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          }}
        >
          <InfoValue label="Center name (Bangla)" value={center?.nameBangla || "Not set"} />
          <InfoValue
            label="Established year"
            value={center?.establishedYear ? String(center.establishedYear) : "Not set"}
          />
          <InfoValue
            label="Academic year starts in"
            value={formatMonth(center?.academicYearStartMonth)}
          />
          <InfoValue label="Email" value={center?.email || "Not set"} />
          <InfoValue label="Phone" value={center?.phone || "Not set"} />
          <InfoValue label="Address" value={center?.address || "Not set"} />
        </Box>
      </Stack>
    </SectionCard>
  );
}
