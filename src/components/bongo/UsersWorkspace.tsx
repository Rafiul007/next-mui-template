"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeftRounded,
  ChevronRightRounded,
  PeopleAltRounded,
  SearchRounded,
  VpnKeyRounded,
} from "@mui/icons-material";
import { useQuery } from "@apollo/client/react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { toast } from "react-hot-toast";
import { GetUsersDocument, type GetUsersQuery } from "@/graphql/generated";
import { getErrorMessage } from "@/lib/errors";
import { resolveHomePath } from "@/lib/auth/roles";
import { UserImpersonateDialog } from "./users/UserImpersonateDialog";

type UserRow = NonNullable<GetUsersQuery["getUsers"][number]>;

const PAGE_SIZE = 20;

export function UsersWorkspace() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);
  const [impersonateResult, setImpersonateResult] = useState<{
    targetUserName: string;
    homePath: string;
  } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const isSearching = debouncedQuery.length > 0;

  const { data, loading, error } = useQuery(GetUsersDocument, {
    variables: isSearching
      ? { query: debouncedQuery }
      : { page, limit: PAGE_SIZE },
    fetchPolicy: "cache-and-network",
  });

  const rows = useMemo(
    () => (data?.getUsers ?? []).filter((u): u is UserRow => !!u),
    [data],
  );

  const hasNextPage = !isSearching && rows.length === PAGE_SIZE;

  const handleImpersonate = async (user: UserRow) => {
    setImpersonatingId(user.id);
    try {
      const res = await fetch("/api/auth/impersonate-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const result = (await res.json()) as {
        success?: boolean;
        targetUserName?: string;
        error?: string;
      };
      if (!res.ok || !result.success) {
        throw new Error(result.error ?? "Failed to impersonate user");
      }
      setImpersonateResult({
        targetUserName: result.targetUserName ?? `${user.firstName} ${user.lastName}`,
        homePath: resolveHomePath({ roles: user.roles }),
      });
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to impersonate user"));
    } finally {
      setImpersonatingId(null);
    }
  };

  const columns: MRT_ColumnDef<UserRow>[] = [
    {
      id: "name",
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      header: "Name",
      size: 200,
      Cell: ({ row }) => (
        <Stack spacing={0.25}>
          <Typography variant="subtitle2" fontWeight={700}>
            {row.original.firstName} {row.original.lastName}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {row.original.email}
          </Typography>
        </Stack>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      size: 130,
      Cell: ({ cell }) => (
        <Typography variant="body2" color="text.secondary">
          {(cell.getValue() as string | null) ?? "—"}
        </Typography>
      ),
    },
    {
      id: "roles",
      accessorFn: (row) => row.roles.join(", "),
      header: "Roles",
      size: 220,
      Cell: ({ row }) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {row.original.roles.map((role) => (
            <Chip
              key={role}
              label={role}
              size="small"
              sx={{ fontWeight: 600, bgcolor: alpha("#2563eb", 0.08), color: "primary.dark" }}
            />
          ))}
        </Stack>
      ),
    },
    {
      accessorKey: "isActivated",
      header: "Status",
      size: 100,
      Cell: ({ cell }) => (
        <Chip
          label={cell.getValue() ? "Active" : "Inactive"}
          size="small"
          color={cell.getValue() ? "success" : "default"}
          variant={cell.getValue() ? "filled" : "outlined"}
        />
      ),
    },
    {
      id: "actions",
      header: "",
      size: 160,
      enableSorting: false,
      Cell: ({ row }) => (
        <Tooltip title={`Impersonate ${row.original.firstName}`}>
          <span>
            <Button
              size="small"
              variant="outlined"
              startIcon={<VpnKeyRounded />}
              disabled={impersonatingId === row.original.id}
              onClick={() => handleImpersonate(row.original)}
            >
              Impersonate
            </Button>
          </span>
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <Stack spacing={3}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            border: "1px solid",
            borderColor: "divider",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(240,249,255,0.98) 100%)",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <PeopleAltRounded sx={{ color: "primary.main" }} />
            <Box>
              <Typography variant="h4" component="h1">
                Platform Users
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Search across every tenant. Impersonate a user to see the
                product exactly as they do.
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <TextField
          placeholder="Search by name or email…"
          size="small"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          sx={{ maxWidth: 360 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />

        {error ? (
          <Typography color="error.main">
            {getErrorMessage(error, "Failed to load users")}
          </Typography>
        ) : null}

        <MaterialReactTable
          columns={columns}
          data={rows}
          state={{ isLoading: loading }}
          enablePagination={false}
          enableDensityToggle={false}
          enableFullScreenToggle={false}
          enableHiding={false}
          enableStickyHeader
          muiTablePaperProps={{
            elevation: 0,
            sx: { border: "1px solid", borderColor: alpha("#0f172a", 0.08), borderRadius: 2, overflow: "hidden" },
          }}
          muiTableContainerProps={{ sx: { maxHeight: 560 } }}
          renderEmptyRowsFallback={() => (
            <Box sx={{ px: 3, py: 8, textAlign: "center" }}>
              <PeopleAltRounded sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }} />
              <Typography variant="h6" color="text.secondary">
                No users found
              </Typography>
            </Box>
          )}
          renderBottomToolbarCustomActions={() =>
            isSearching ? (
              <Typography variant="caption" color="text.secondary" sx={{ px: 2, py: 1 }}>
                {rows.length} match{rows.length === 1 ? "" : "es"}
              </Typography>
            ) : (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 2, py: 1 }}>
                <IconButton size="small" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeftRounded fontSize="small" />
                </IconButton>
                <Typography variant="caption" color="text.secondary">
                  Page {page}
                </Typography>
                <IconButton size="small" disabled={!hasNextPage} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRightRounded fontSize="small" />
                </IconButton>
              </Stack>
            )
          }
        />
      </Stack>

      <UserImpersonateDialog
        open={impersonateResult !== null}
        targetUserName={impersonateResult?.targetUserName ?? ""}
        homePath={impersonateResult?.homePath ?? "/"}
        onClose={() => setImpersonateResult(null)}
      />
    </>
  );
}
