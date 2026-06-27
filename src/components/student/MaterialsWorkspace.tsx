"use client";

import dayjs from "dayjs";
import {
  DownloadRounded,
  FolderOpenRounded,
  PlayCircleOutlineRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { useQuery } from "@apollo/client/react";
import { MyEnrollmentsDocument } from "@/graphql/student-portal";
import { GetMaterialsByBatchDocument } from "@/graphql/generated";

function BatchMaterials({ batchId }: { batchId: string }) {
  const { data, loading } = useQuery(GetMaterialsByBatchDocument, {
    variables: { batchId },
  });

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={24} />
      </Box>
    );

  const materials = [...(data?.getMaterialsByBatch ?? [])].sort((a, b) =>
    (b.uploadedAt ?? "").localeCompare(a.uploadedAt ?? ""),
  );

  if (materials.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No materials uploaded yet.
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
        },
      }}
    >
      {materials.map((mat) => (
        <Paper
          key={mat.id}
          elevation={0}
          sx={{
            p: 2.5,
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            "&:hover": { borderColor: alpha("#10b981", 0.4), boxShadow: `0 0 0 1px ${alpha("#10b981", 0.2)}` },
            transition: "all 0.15s ease",
          }}
        >
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                bgcolor: mat.videoUrl
                  ? alpha("#8b5cf6", 0.1)
                  : alpha("#10b981", 0.1),
                color: mat.videoUrl ? "#7c3aed" : "#047857",
                flexShrink: 0,
              }}
            >
              {mat.videoUrl ? (
                <PlayCircleOutlineRounded fontSize="small" />
              ) : (
                <FolderOpenRounded fontSize="small" />
              )}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                fontWeight={700}
                noWrap
                title={mat.title}
              >
                {mat.title}
              </Typography>
              {mat.uploadedAt && (
                <Typography variant="caption" color="text.secondary">
                  {dayjs(mat.uploadedAt).format("D MMM YYYY")}
                </Typography>
              )}
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            {mat.filePath && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<DownloadRounded fontSize="small" />}
                component="a"
                href={mat.filePath}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ fontSize: 12 }}
              >
                Download
              </Button>
            )}
            {mat.videoUrl && (
              <Button
                size="small"
                variant="outlined"
                color="secondary"
                startIcon={<PlayCircleOutlineRounded fontSize="small" />}
                component="a"
                href={mat.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ fontSize: 12 }}
              >
                Watch
              </Button>
            )}
          </Stack>
        </Paper>
      ))}
    </Box>
  );
}

export function MaterialsWorkspace() {
  const { data: enrollmentsData, loading: enrollmentsLoading } = useQuery(
    MyEnrollmentsDocument,
  );

  const activeEnrollments = (enrollmentsData?.myEnrollments ?? []).filter(
    (e) => e.status === "ACTIVE",
  );

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
          <FolderOpenRounded sx={{ color: "primary.main" }} />
          <Box>
            <Typography variant="h4" component="h1">
              Materials
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Study materials and resources shared by your teachers
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {enrollmentsLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : activeEnrollments.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            border: "1px dashed",
            borderColor: "divider",
          }}
        >
          <FolderOpenRounded sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }} />
          <Typography variant="h6" color="text.secondary">
            No active enrollments
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={4}>
          {activeEnrollments.map((enrollment) => (
            <Box key={enrollment.id}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>
                  Batch
                </Typography>
                <Chip
                  label={enrollment.batchId.slice(0, 8) + "…"}
                  size="small"
                  variant="outlined"
                />
              </Stack>
              <BatchMaterials batchId={enrollment.batchId} />
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
