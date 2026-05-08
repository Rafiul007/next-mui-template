"use client";

import { useEffect, useState } from "react";
import { CloseRounded, ContentCopyRounded, LaunchRounded } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { primaryGradient } from "@/theme/theme";

export function TenantImpersonateDialog({
  open,
  accessToken,
  tenantSlug,
  onClose,
}: {
  open: boolean;
  accessToken: string;
  tenantSlug: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = () => {
    navigator.clipboard.writeText(accessToken);
    setCopied(true);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box component="span" sx={{ fontWeight: 700 }}>Impersonate — {tenantSlug}</Box>
        <IconButton size="small" onClick={onClose}>
          <CloseRounded fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          <Alert severity="warning">
            You are acting as this tenant. Any changes will affect their account.
          </Alert>

          <Box>
            <Typography variant="caption" color="text.secondary">Access Token</Typography>
            <Box
              sx={{
                mt: 0.75, p: 1.5, borderRadius: 2,
                bgcolor: alpha("#0f172a", 0.05),
                border: "1px solid", borderColor: "divider",
                fontFamily: "monospace", fontSize: 11,
                wordBreak: "break-all", color: "text.secondary",
              }}
            >
              {accessToken.slice(0, 80)}…
            </Box>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" startIcon={<ContentCopyRounded />} onClick={copy} size="small">
              {copied ? "Copied!" : "Copy Token"}
            </Button>
            <Button
              variant="contained"
              startIcon={<LaunchRounded />}
              size="small"
              href="/dashboard"
              target="_blank"
              sx={{ background: primaryGradient, color: "#fff" }}
            >
              Open Tenant Dashboard
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
