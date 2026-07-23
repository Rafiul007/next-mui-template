"use client";

import { CloseRounded, LaunchRounded } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
} from "@mui/material";
import { primaryGradient } from "@/theme/theme";

export function UserImpersonateDialog({
  open,
  targetUserName,
  homePath,
  onClose,
}: {
  open: boolean;
  targetUserName: string;
  homePath: string;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <Box component="span" sx={{ fontWeight: 700 }}>
          Impersonate — {targetUserName}
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseRounded fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          <Alert severity="warning">
            You are now impersonating {targetUserName}. Use &quot;Stop
            impersonation&quot; in the topbar of their dashboard to return to
            your own account.
          </Alert>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              startIcon={<LaunchRounded />}
              href={homePath}
              target="_blank"
              sx={{ background: primaryGradient, color: "#fff" }}
            >
              Open Dashboard
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
