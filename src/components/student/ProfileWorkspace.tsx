"use client";

import { PersonRounded } from "@mui/icons-material";
import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@apollo/client/react";
import {
  MyStudentProfileDocument,
} from "@/graphql/student-portal";
import { GetGuardiansDocument, MeDocument } from "@/graphql/generated";

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ minWidth: 160, flexShrink: 0 }}
      >
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {value}
      </Typography>
    </Stack>
  );
}

export function ProfileWorkspace() {
  const { data: meData, loading: meLoading } = useQuery(MeDocument, {
    fetchPolicy: "cache-first",
  });
  const { data: profileData, loading: profileLoading } = useQuery(
    MyStudentProfileDocument,
  );

  const profile = profileData?.myStudentProfile;
  const studentId = profile?.id;

  const { data: guardiansData, loading: guardiansLoading } = useQuery(
    GetGuardiansDocument,
    {
      variables: { studentId: studentId ?? "" },
      skip: !studentId,
    },
  );

  const isLoading = meLoading || profileLoading;

  return (
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
        <Stack direction="row" spacing={1.5} alignItems="center">
          <PersonRounded sx={{ color: "primary.main" }} />
          <Box>
            <Typography variant="h4" component="h1">
              My Profile
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Your account and academic information
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Account info */}
          <Paper
            elevation={0}
            sx={{ p: 3, border: "1px solid", borderColor: "divider" }}
          >
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2.5 }}>
              Account
            </Typography>
            <Stack spacing={1.5} divider={<Divider />}>
              <InfoRow
                label="Name"
                value={[
                  meData?.me?.user?.firstName,
                  meData?.me?.user?.lastName,
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
              <InfoRow label="Email" value={meData?.me?.user?.email} />
              <InfoRow label="Phone" value={meData?.me?.user?.phone} />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ minWidth: 160, flexShrink: 0 }}
                >
                  Roles
                </Typography>
                <Stack direction="row" spacing={0.75} flexWrap="wrap">
                  {(meData?.me?.roles ?? []).map((role) => (
                    <Chip key={role} label={role} size="small" variant="outlined" />
                  ))}
                </Stack>
              </Stack>
            </Stack>
          </Paper>

          {/* Academic profile */}
          {profile && (
            <Paper
              elevation={0}
              sx={{ p: 3, border: "1px solid", borderColor: "divider" }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2.5 }}
              >
                <Typography variant="h6" fontWeight={700}>
                  Academic Profile
                </Typography>
                <Chip
                  label={profile.status}
                  size="small"
                  color={profile.status === "ACTIVE" ? "success" : "default"}
                  variant="outlined"
                />
              </Stack>
              <Stack spacing={1.5} divider={<Divider />}>
                <InfoRow label="Student code" value={profile.studentCode} />
                <InfoRow
                  label="Full name"
                  value={[profile.firstName, profile.lastName]
                    .filter(Boolean)
                    .join(" ")}
                />
                {profile.firstNameBangla && (
                  <InfoRow label="Name (Bengali)" value={profile.firstNameBangla} />
                )}
                <InfoRow label="Date of birth" value={profile.dateOfBirth} />
                <InfoRow label="Gender" value={profile.gender} />
                <InfoRow label="Blood group" value={profile.bloodGroup} />
                <InfoRow label="Class level" value={profile.classLevel} />
                <InfoRow label="Email" value={profile.email} />
                <InfoRow label="Phone" value={profile.phone} />
                <InfoRow
                  label="Address"
                  value={[
                    profile.address,
                    profile.upazila,
                    profile.district,
                    profile.division,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                />
                {profile.previousInstitution && (
                  <InfoRow
                    label="Previous institution"
                    value={profile.previousInstitution}
                  />
                )}
                {profile.previousResult && (
                  <InfoRow
                    label="Previous result"
                    value={profile.previousResult}
                  />
                )}
              </Stack>
            </Paper>
          )}

          {/* Guardians */}
          {!guardiansLoading && guardiansData?.getGuardians && guardiansData.getGuardians.length > 0 && (
            <Paper
              elevation={0}
              sx={{ p: 3, border: "1px solid", borderColor: "divider" }}
            >
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2.5 }}>
                Guardians
              </Typography>
              <Stack
                spacing={2}
                divider={<Divider />}
              >
                {guardiansData.getGuardians.map((g) => (
                  <Stack key={g.id} spacing={1} divider={<Divider />}>
                    <InfoRow label="Name" value={g.name} />
                    <InfoRow label="Relationship" value={g.relationship} />
                    <InfoRow label="Phone" value={g.phone} />
                    <InfoRow label="Occupation" value={g.occupation} />
                  </Stack>
                ))}
              </Stack>
            </Paper>
          )}
        </>
      )}
    </Stack>
  );
}
