"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import {
  ExpandMoreRounded,
  LogoutRounded,
  PersonOutlineRounded,
} from "@mui/icons-material";
import { logoutSession } from "@/lib/auth/client";
import { MeDocument } from "@/graphql/generated/index";
import { primaryGradient } from "@/theme/theme";

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const fallbackUser = {
  name: "Dashboard User",
  role: "Authenticated User",
  email: "Signed in",
};

export function UserProfile() {
  const router = useRouter();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { data } = useQuery(MeDocument, {
    errorPolicy: "all",
  });

  const currentUser = data?.me
    ? {
        name: `${data.me.user.firstName} ${data.me.user.lastName}`.trim(),
        role: data.me.roles[0] ?? "Authenticated User",
        email: data.me.user.email,
      }
    : fallbackUser;

  const displayName = currentUser.name || fallbackUser.name;
  const displayRole = currentUser.role || fallbackUser.role;
  const displayEmail = currentUser.email || fallbackUser.email;
  const initials = getInitials(displayName);
  const isMenuOpen = !!menuAnchor;

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    if (!isLoggingOut) {
      setMenuAnchor(null);
    }
  };

  const handleViewProfile = () => {
    setMenuAnchor(null);
    router.push("/dashboard/hr/my-profile");
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logoutSession();
      setMenuAnchor(null);
      router.push("/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <Stack
        component="button"
        type="button"
        direction="row"
        spacing={1.25}
        alignItems="center"
        justifyContent="flex-end"
        onClick={handleOpenMenu}
        aria-haspopup="menu"
        aria-expanded={isMenuOpen ? "true" : undefined}
        sx={{
          px: { xs: 1, md: 1.25 },
          py: 0.75,
          borderRadius: 2,
          bgcolor: "rgba(255, 255, 255, 0.06)",
          border: "1px solid",
          borderColor: "rgba(148, 163, 184, 0.18)",
          color: "inherit",
          cursor: "pointer",
          appearance: "none",
          backgroundImage: "none",
          transition: "background-color 160ms ease, border-color 160ms ease",
          "&:hover": {
            bgcolor: "rgba(255, 255, 255, 0.1)",
            borderColor: "rgba(148, 163, 184, 0.28)",
          },
        }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            background: primaryGradient,
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {initials}
        </Avatar>

        <Box sx={{ display: { xs: "none", sm: "block" }, textAlign: "left" }}>
          <Typography
            variant="subtitle2"
            noWrap
            sx={{ fontWeight: 700, lineHeight: 1.1, color: "#f8fafc" }}
          >
            {displayName}
          </Typography>
          <Typography
            variant="caption"
            noWrap
            sx={{ color: "rgba(226, 232, 240, 0.72)" }}
          >
            {displayRole}
          </Typography>
        </Box>

        <ExpandMoreRounded sx={{ color: "rgba(226, 232, 240, 0.72)" }} />
      </Stack>

      <Menu
        anchorEl={menuAnchor}
        open={isMenuOpen}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 260,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 22px 50px rgba(15, 23, 42, 0.18)",
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.75 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                width: 44,
                height: 44,
                background: primaryGradient,
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {initials}
            </Avatar>

            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap>
                {displayName}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {displayEmail}
              </Typography>
            </Box>
          </Stack>

          <Typography
            variant="caption"
            sx={{ mt: 1.25, display: "block", color: "text.secondary" }}
          >
            {displayRole}
          </Typography>
        </Box>

        <Divider />

        <MenuItem
          onClick={handleViewProfile}
          disabled={isLoggingOut}
          sx={{ gap: 1.25, minHeight: 44 }}
        >
          <PersonOutlineRounded fontSize="small" />
          <Typography variant="body2">My Profile</Typography>
        </MenuItem>

        <MenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          sx={{ gap: 1.25, minHeight: 44 }}
        >
          {isLoggingOut ? (
            <CircularProgress size={18} />
          ) : (
            <LogoutRounded fontSize="small" />
          )}
          <Typography variant="body2">Log out</Typography>
        </MenuItem>
      </Menu>
    </>
  );
}
