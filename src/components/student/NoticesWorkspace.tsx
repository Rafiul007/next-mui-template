"use client";

import { useState } from "react";
import dayjs from "dayjs";
import {
  CampaignRounded,
  ExpandLessRounded,
  ExpandMoreRounded,
} from "@mui/icons-material";
import {
  Box,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { useQuery } from "@apollo/client/react";
import { MyEnrollmentsDocument } from "@/graphql/student-portal";
import { GetNoticesForBatchDocument, GetAllBatchesDocument } from "@/graphql/generated";

type Notice = {
  id: string;
  title: string;
  body: string;
  status: string;
  publishedAt: string | null;
  expiresAt: string | null;
  targetBatchIds: string[];
  tenantId: string;
};

function NoticeCard({ notice }: { notice: Notice }) {
  const [expanded, setExpanded] = useState(false);
  const isExpired =
    notice.expiresAt ? dayjs().isAfter(dayjs(notice.expiresAt)) : false;

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: isExpired ? alpha("#94a3b8", 0.2) : "divider",
        overflow: "hidden",
        opacity: isExpired ? 0.65 : 1,
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "flex-start",
          gap: 1.5,
          cursor: "pointer",
        }}
        onClick={() => setExpanded((p) => !p)}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="body2" fontWeight={700} noWrap>
              {notice.title}
            </Typography>
            {isExpired && (
              <Chip label="Expired" size="small" variant="outlined" color="default" />
            )}
          </Stack>
          {notice.publishedAt && (
            <Typography variant="caption" color="text.secondary">
              {dayjs(notice.publishedAt).format("D MMMM YYYY")}
            </Typography>
          )}
          {!expanded && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {notice.body}
            </Typography>
          )}
        </Box>
        <IconButton size="small" sx={{ flexShrink: 0 }}>
          {expanded ? (
            <ExpandLessRounded fontSize="small" />
          ) : (
            <ExpandMoreRounded fontSize="small" />
          )}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Divider />
        <Box sx={{ p: 2, bgcolor: alpha("#f8fafc", 0.6) }}>
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
            {notice.body}
          </Typography>
          {notice.expiresAt && (
            <Typography variant="caption" color="text.disabled" sx={{ mt: 1.5, display: "block" }}>
              Expires: {dayjs(notice.expiresAt).format("D MMMM YYYY")}
            </Typography>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}

function BatchNotices({ batchId }: { batchId: string }) {
  const { data, loading } = useQuery(GetNoticesForBatchDocument, {
    variables: { batchId },
  });

  if (loading) return <CircularProgress size={16} />;

  const notices = [...(data?.getNoticesForBatch ?? [])]
    .filter((n) => n.status === "PUBLISHED")
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));

  if (notices.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No published notices.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      {notices.map((n) => (
        <NoticeCard key={n.id} notice={n} />
      ))}
    </Stack>
  );
}

export function NoticesWorkspace() {
  const { data: enrollmentsData, loading: enrollmentsLoading } = useQuery(
    MyEnrollmentsDocument,
  );
  const { data: batchesData } = useQuery(GetAllBatchesDocument, {
    fetchPolicy: "cache-and-network",
  });

  const activeEnrollments = (enrollmentsData?.myEnrollments ?? []).filter(
    (e) => e.status === "ACTIVE",
  );

  const batchMap = (batchesData?.getAllBatches ?? []).reduce(
    (acc, batch) => {
      acc[batch.id] = batch;
      return acc;
    },
    {} as Record<string, { id: string; name: string; classLevel?: string | null }>,
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
          <CampaignRounded sx={{ color: "warning.main" }} />
          <Box>
            <Typography variant="h4" component="h1">
              Notices
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Announcements from your coaching center
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
          <CampaignRounded sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }} />
          <Typography variant="h6" color="text.secondary">
            No active enrollments
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={4}>
          {activeEnrollments.map((enrollment) => (
            <Box key={enrollment.id}>
              {batchMap[enrollment.batchId]?.name && (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <Chip
                    label={batchMap[enrollment.batchId]?.name}
                    size="small"
                    variant="outlined"
                  />
                </Stack>
              )}
              <BatchNotices batchId={enrollment.batchId} />
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
