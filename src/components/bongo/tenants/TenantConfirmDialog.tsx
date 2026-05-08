"use client";

import { WarningAmberRounded } from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { CONFIRM_CONFIG } from "@/constants/tenant";
import type { ConfirmAction, TenantRecord } from "@/models/tenant";

export function TenantConfirmDialog({
  open,
  action,
  tenant,
  loading,
  onConfirm,
  onClose,
}: {
  open: boolean;
  action: ConfirmAction;
  tenant: TenantRecord;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const cfg = CONFIRM_CONFIG[action];

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <WarningAmberRounded color={cfg.color} />
          <Typography fontWeight={700}>{cfg.title}</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          {cfg.getMessage(tenant.legalName)}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={loading} color="inherit">Cancel</Button>
        <Button
          variant="contained"
          color={cfg.color}
          onClick={onConfirm}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {cfg.confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
