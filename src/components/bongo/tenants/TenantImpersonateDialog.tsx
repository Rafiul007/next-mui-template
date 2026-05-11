"use client";

import { CloseRounded, LaunchRounded } from "@mui/icons-material";
import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Box,
} from "@mui/material";
import { primaryGradient } from "@/theme/theme";

export function TenantImpersonateDialog({
  open,
  tenantId: _tenantId,
  tenantSlug,
  onClose,
}: {
  open: boolean;
  tenantId: string;
  tenantSlug: string;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box component="span" sx={{ fontWeight: 700 }}>
          Impersonate — {tenantSlug}
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseRounded fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          <Alert severity="warning">
            You are now impersonating this tenant. All dashboard operations will
            run under their account until you log out.
          </Alert>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              startIcon={<LaunchRounded />}
              href="/dashboard"
              target="_blank"
              sx={{ background: primaryGradient, color: "#fff" }}
            >
              Open Tenant Dashboard
            </Button>
            <Button variant="outlined" onClick={onClose}>
              Close
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
