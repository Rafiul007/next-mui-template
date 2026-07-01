"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import {
  AccountBalanceWalletRounded,
  AssignmentRounded,
  CampaignRounded,
  CheckCircleRounded,
  CloseRounded,
  EditRounded,
  GroupsRounded,
  PersonRounded,
  SchoolRounded,
  SearchRounded,
  SettingsRounded,
  VerifiedUserRounded,
  VisibilityRounded,
  WorkRounded,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Dialog,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import { type ReactNode, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import * as yup from "yup";
import { RhfTextField } from "@/components/form";
import type { GetTenantRolesQuery } from "@/graphql/generated";
import {
  permissionGroups,
  roleTemplates,
} from "./permission-registry";

type RoleRecord = GetTenantRolesQuery["getTenantRoles"][number];

export type CreateRoleFormValues = {
  name: string;
  permissions: string[];
};

type CreateRoleDialogProps = {
  errorMessage?: string | null;
  existingRoles: RoleRecord[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: CreateRoleFormValues) => Promise<void>;
  open: boolean;
};

const GROUP_ICONS: Record<string, ReactNode> = {
  "tenant-setup": <SettingsRounded sx={{ fontSize: 16 }} />,
  academics: <SchoolRounded sx={{ fontSize: 16 }} />,
  students: <PersonRounded sx={{ fontSize: 16 }} />,
  "hr-staff": <WorkRounded sx={{ fontSize: 16 }} />,
  finance: <AccountBalanceWalletRounded sx={{ fontSize: 16 }} />,
  communication: <CampaignRounded sx={{ fontSize: 16 }} />,
  exams: <AssignmentRounded sx={{ fontSize: 16 }} />,
};

const TEMPLATE_ICONS: Record<string, ReactNode> = {
  admin: <VerifiedUserRounded sx={{ fontSize: 13 }} />,
  hr: <WorkRounded sx={{ fontSize: 13 }} />,
  accountant: <AccountBalanceWalletRounded sx={{ fontSize: 13 }} />,
  teacher: <SchoolRounded sx={{ fontSize: 13 }} />,
  student: <GroupsRounded sx={{ fontSize: 13 }} />,
};

export function CreateRoleDialog({
  errorMessage,
  existingRoles,
  isSubmitting,
  onClose,
  onSubmit,
  open,
}: CreateRoleDialogProps) {
  const [activeGroupKey, setActiveGroupKey] = useState(
    permissionGroups[0].key,
  );
  const [search, setSearch] = useState("");

  const existingRoleNames = new Set(
    existingRoles.map((role) => role.name.toLowerCase()),
  );

  const schema: yup.ObjectSchema<CreateRoleFormValues> = yup
    .object({
      name: yup
        .string()
        .trim()
        .required("Role name is required")
        .max(50, "Role name must be 50 characters or fewer")
        .test(
          "unique-role-name",
          "A role with this name already exists.",
          (value) => !value || !existingRoleNames.has(value.toLowerCase()),
        ),
      permissions: yup.array(yup.string().required()).required(),
    })
    .required();

  const { control, handleSubmit, setValue } = useForm<CreateRoleFormValues>({
    resolver: yupResolver(schema),
    defaultValues: { name: "", permissions: [] },
    mode: "onTouched",
  });

  const selectedPermissions =
    (useWatch({ control, name: "permissions" }) as string[]) ?? [];

  const setPermissions = (next: string[]) =>
    setValue("permissions", next, { shouldValidate: true, shouldDirty: true });

  const toggle = (key: string) => {
    setPermissions(
      selectedPermissions.includes(key)
        ? selectedPermissions.filter((p) => p !== key)
        : [...selectedPermissions, key],
    );
  };

  const toggleGroupRead = (groupKey: string) => {
    const group = permissionGroups.find((g) => g.key === groupKey);
    if (!group) return;
    const readKeys = group.options.map((o) => o.readKey);
    const allOn = readKeys.every((k) => selectedPermissions.includes(k));
    setPermissions(
      allOn
        ? selectedPermissions.filter((p) => !readKeys.includes(p))
        : [...new Set([...selectedPermissions, ...readKeys])],
    );
  };

  const toggleGroupWrite = (groupKey: string) => {
    const group = permissionGroups.find((g) => g.key === groupKey);
    if (!group) return;
    const writeKeys = group.options.map((o) => o.writeKey);
    const allOn = writeKeys.every((k) => selectedPermissions.includes(k));
    setPermissions(
      allOn
        ? selectedPermissions.filter((p) => !writeKeys.includes(p))
        : [...new Set([...selectedPermissions, ...writeKeys])],
    );
  };

  const applyTemplate = (templateId: string) => {
    const template = roleTemplates.find((t) => t.id === templateId);
    if (template) setPermissions(template.permissions);
  };

  const searchLower = search.toLowerCase();

  const filteredGroups = permissionGroups
    .map((group) => ({
      ...group,
      options: searchLower
        ? group.options.filter(
            (opt) =>
              opt.label.toLowerCase().includes(searchLower) ||
              opt.description.toLowerCase().includes(searchLower),
          )
        : group.options,
    }))
    .filter((group) => !searchLower || group.options.length > 0);

  const activeGroup =
    filteredGroups.find((g) => g.key === activeGroupKey) ??
    filteredGroups[0] ??
    null;

  const readCount = selectedPermissions.filter((p) =>
    p.endsWith("_READ"),
  ).length;
  const writeCount = selectedPermissions.filter((p) =>
    p.endsWith("_WRITE"),
  ).length;
  const totalCount = readCount + writeCount;

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          height: { xs: "100%", md: "88vh" },
          maxHeight: { md: 780 },
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit(async (values) => onSubmit(values))}
        noValidate
        sx={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <Box sx={{ px: 3, pt: 2.5, pb: 2, flexShrink: 0 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Create custom role
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                Define what this role can manage inside the workspace.
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={onClose}
              disabled={isSubmitting}
              sx={{ mt: -0.5, mr: -1 }}
            >
              <CloseRounded fontSize="small" />
            </IconButton>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            alignItems={{ sm: "flex-end" }}
            sx={{ mt: 2 }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  letterSpacing: 0.7,
                  textTransform: "uppercase",
                  color: "text.secondary",
                  display: "block",
                  mb: 0.75,
                  fontSize: 10,
                }}
              >
                Role name
              </Typography>
              <RhfTextField
                control={control}
                name="name"
                placeholder="e.g. Batch coordinator"
                fullWidth
                trim
                size="small"
              />
            </Box>

            <Box sx={{ flexShrink: 0 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  letterSpacing: 0.7,
                  textTransform: "uppercase",
                  color: "text.secondary",
                  display: "block",
                  mb: 0.75,
                  fontSize: 10,
                }}
              >
                Start from template
              </Typography>
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                {roleTemplates.map((template) => (
                  <Button
                    key={template.id}
                    size="small"
                    variant="outlined"
                    color="inherit"
                    startIcon={TEMPLATE_ICONS[template.id]}
                    onClick={() => applyTemplate(template.id)}
                    sx={{
                      fontSize: 12,
                      py: 0.5,
                      px: 1.25,
                      borderColor: alpha("#0f172a", 0.18),
                      color: "text.secondary",
                      "&:hover": {
                        borderColor: alpha("#0f172a", 0.35),
                        bgcolor: alpha("#0f172a", 0.04),
                        color: "text.primary",
                      },
                    }}
                  >
                    {template.label}
                  </Button>
                ))}
              </Stack>
            </Box>
          </Stack>

          {errorMessage ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errorMessage}
            </Alert>
          ) : null}
        </Box>

        {/* ── Two-panel body ─────────────────────────────────────────── */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            overflow: "hidden",
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          {/* Left sidebar */}
          <Box
            sx={{
              width: 224,
              flexShrink: 0,
              borderRight: "1px solid",
              borderColor: "divider",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              bgcolor: "#fafafa",
            }}
          >
            <Box
              sx={{
                p: 1.25,
                borderBottom: "1px solid",
                borderColor: alpha("#0f172a", 0.07),
              }}
            >
              <TextField
                size="small"
                placeholder="Search permissions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRounded
                        sx={{ fontSize: 16, color: "text.secondary" }}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                    fontSize: 13,
                    bgcolor: "#ffffff",
                  },
                }}
              />
            </Box>

            <Box sx={{ flex: 1, overflowY: "auto", py: 0.75 }}>
              {filteredGroups.map((group) => {
                const fullGroup = permissionGroups.find(
                  (g) => g.key === group.key,
                );
                const grantedCount =
                  fullGroup?.options.filter(
                    (o) =>
                      selectedPermissions.includes(o.readKey) ||
                      selectedPermissions.includes(o.writeKey),
                  ).length ?? 0;
                const isActive = group.key === activeGroup?.key;

                return (
                  <Box
                    key={group.key}
                    onClick={() => setActiveGroupKey(group.key)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.25,
                      px: 1.25,
                      py: 0.875,
                      mx: 0.75,
                      borderRadius: 1.5,
                      cursor: "pointer",
                      bgcolor: isActive
                        ? alpha("#2563eb", 0.1)
                        : "transparent",
                      color: isActive ? "#1d4ed8" : "text.primary",
                      transition: "background-color 120ms ease",
                      "&:hover": {
                        bgcolor: isActive
                          ? alpha("#2563eb", 0.13)
                          : alpha("#0f172a", 0.05),
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 1.25,
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                        bgcolor: isActive ? "#2563eb" : alpha("#0f172a", 0.07),
                        color: isActive ? "#ffffff" : "text.secondary",
                        transition: "background-color 120ms ease",
                      }}
                    >
                      {GROUP_ICONS[group.key]}
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isActive ? 600 : 400,
                          fontSize: 13,
                          lineHeight: 1.3,
                          color: "inherit",
                        }}
                      >
                        {group.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: 11,
                          color: isActive
                            ? alpha("#1d4ed8", 0.75)
                            : "text.secondary",
                        }}
                      >
                        {grantedCount > 0
                          ? `${grantedCount} of ${group.options.length} granted`
                          : `${group.options.length} permissions`}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}

              {filteredGroups.length === 0 && (
                <Box sx={{ px: 2, py: 3, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
                    No matches
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Right panel */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              bgcolor: "#ffffff",
            }}
          >
            {activeGroup ? (
              <>
                {/* Panel header */}
                <Box
                  sx={{
                    px: 3,
                    py: 2,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    flexShrink: 0,
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {activeGroup.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.25 }}
                  >
                    {activeGroup.description}
                  </Typography>

                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mt: 1.75 }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: "text.secondary",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        fontSize: 10,
                      }}
                    >
                      Quick select
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={
                          <VisibilityRounded sx={{ fontSize: 14 }} />
                        }
                        onClick={() => toggleGroupRead(activeGroup.key)}
                        sx={{
                          fontSize: 12,
                          py: 0.35,
                          borderColor: alpha("#1976d2", 0.35),
                          color: "#1976d2",
                          "&:hover": {
                            borderColor: "#1976d2",
                            bgcolor: alpha("#1976d2", 0.06),
                          },
                        }}
                      >
                        All read
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditRounded sx={{ fontSize: 14 }} />}
                        onClick={() => toggleGroupWrite(activeGroup.key)}
                        sx={{
                          fontSize: 12,
                          py: 0.35,
                          borderColor: alpha("#2563eb", 0.4),
                          color: "#1d4ed8",
                          "&:hover": {
                            borderColor: "#2563eb",
                            bgcolor: alpha("#2563eb", 0.06),
                          },
                        }}
                      >
                        All write
                      </Button>
                    </Stack>
                  </Stack>
                </Box>

                {/* Permission rows */}
                <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
                  <Stack spacing={1}>
                    {activeGroup.options.map((option) => {
                      const isRead = selectedPermissions.includes(
                        option.readKey,
                      );
                      const isWrite = selectedPermissions.includes(
                        option.writeKey,
                      );
                      const isAny = isRead || isWrite;

                      return (
                        <Box
                          key={option.value}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            border: "1px solid",
                            borderColor: isAny
                              ? alpha("#2563eb", 0.28)
                              : alpha("#0f172a", 0.09),
                            borderRadius: 2,
                            px: 2,
                            py: 1.5,
                            bgcolor: isAny
                              ? alpha("#2563eb", 0.04)
                              : "#ffffff",
                            transition:
                              "border-color 120ms ease, background-color 120ms ease",
                          }}
                        >
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, lineHeight: 1.4 }}
                            >
                              {option.label}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block", mt: 0.15 }}
                            >
                              {option.description}
                            </Typography>
                          </Box>

                          <Stack direction="row" spacing={0.75} flexShrink={0}>
                            <Button
                              size="small"
                              variant={isRead ? "contained" : "outlined"}
                              onClick={() => toggle(option.readKey)}
                              startIcon={
                                <VisibilityRounded sx={{ fontSize: 13 }} />
                              }
                              sx={{
                                fontSize: 12,
                                py: 0.4,
                                minWidth: 76,
                                ...(isRead
                                  ? {
                                      bgcolor: "#1976d2",
                                      "&:hover": { bgcolor: "#1565c0" },
                                    }
                                  : {
                                      borderColor: alpha("#0f172a", 0.2),
                                      color: "text.secondary",
                                      "&:hover": {
                                        borderColor: "#1976d2",
                                        color: "#1976d2",
                                        bgcolor: alpha("#1976d2", 0.05),
                                      },
                                    }),
                              }}
                            >
                              Read
                            </Button>
                            <Button
                              size="small"
                              variant={isWrite ? "contained" : "outlined"}
                              onClick={() => toggle(option.writeKey)}
                              startIcon={
                                <EditRounded sx={{ fontSize: 13 }} />
                              }
                              sx={{
                                fontSize: 12,
                                py: 0.4,
                                minWidth: 76,
                                ...(isWrite
                                  ? {
                                      bgcolor: "#2563eb",
                                      "&:hover": { bgcolor: "#1d4ed8" },
                                    }
                                  : {
                                      borderColor: alpha("#0f172a", 0.2),
                                      color: "text.secondary",
                                      "&:hover": {
                                        borderColor: "#2563eb",
                                        color: "#1d4ed8",
                                        bgcolor: alpha("#2563eb", 0.05),
                                      },
                                    }),
                              }}
                            >
                              Write
                            </Button>
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              </>
            ) : (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  No permissions match your search.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            px: 2.5,
            py: 1.75,
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: "#f8fafc",
            flexShrink: 0,
          }}
        >
          <Stack direction="row" spacing={0.5} alignItems="baseline">
            <Typography
              sx={{ fontWeight: 700, fontSize: 15, lineHeight: 1 }}
            >
              {totalCount}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
              total permissions
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ ml: 0.5 }}>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  bgcolor: "#1976d2",
                }}
              />
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                {readCount} read
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  bgcolor: "#2563eb",
                }}
              />
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                {writeCount} write
              </Typography>
            </Stack>
          </Stack>

          <Box sx={{ flex: 1 }} />

          <Button
            onClick={onClose}
            disabled={isSubmitting}
            color="inherit"
            sx={{ fontSize: 14 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || totalCount === 0}
            startIcon={<CheckCircleRounded />}
            sx={{
              fontSize: 14,
              bgcolor: totalCount > 0 ? "#2563eb" : undefined,
              "&:hover": {
                bgcolor: totalCount > 0 ? "#1d4ed8" : undefined,
              },
              "&.Mui-disabled": {
                bgcolor: alpha("#2563eb", 0.3),
                color: "#ffffff",
              },
            }}
          >
            Create role
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
