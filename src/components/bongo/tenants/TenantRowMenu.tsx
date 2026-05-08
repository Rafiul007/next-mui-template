"use client";

import { useState } from "react";
import {
  BlockRounded,
  CheckCircleOutlineRounded,
  DeleteForeverRounded,
  EditRounded,
  LaunchRounded,
  MoreVertRounded,
} from "@mui/icons-material";
import {
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import type { TenantRecord } from "@/models/tenant";

export function TenantRowMenu({
  tenant,
  onEdit,
  onActivate,
  onSuspend,
  onTerminate,
  onImpersonate,
}: {
  tenant: TenantRecord;
  onEdit: () => void;
  onActivate: () => void;
  onSuspend: () => void;
  onTerminate: () => void;
  onImpersonate: () => void;
}) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const close = () => setAnchor(null);
  const act = (fn: () => void) => { close(); fn(); };
  const s = tenant.status.toLowerCase();

  return (
    <>
      <Tooltip title="Actions">
        <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)} sx={{ color: "text.secondary" }}>
          <MoreVertRounded fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{ paper: { sx: { minWidth: 180 } } }}
      >
        <MenuItem onClick={() => act(onEdit)}>
          <EditRounded fontSize="small" sx={{ mr: 1.5, color: "text.secondary" }} />
          Edit details
        </MenuItem>
        <MenuItem onClick={() => act(onImpersonate)}>
          <LaunchRounded fontSize="small" sx={{ mr: 1.5, color: "text.secondary" }} />
          Impersonate
        </MenuItem>

        <Divider />

        {(s === "suspended" || s === "terminated") && (
          <MenuItem onClick={() => act(onActivate)} sx={{ color: "success.main" }}>
            <CheckCircleOutlineRounded fontSize="small" sx={{ mr: 1.5 }} />
            Reactivate
          </MenuItem>
        )}
        {(s === "active" || s === "trial") && (
          <MenuItem onClick={() => act(onSuspend)} sx={{ color: "warning.dark" }}>
            <BlockRounded fontSize="small" sx={{ mr: 1.5 }} />
            Suspend
          </MenuItem>
        )}
        {s !== "terminated" && (
          <MenuItem onClick={() => act(onTerminate)} sx={{ color: "error.main" }}>
            <DeleteForeverRounded fontSize="small" sx={{ mr: 1.5 }} />
            Terminate
          </MenuItem>
        )}
      </Menu>
    </>
  );
}
