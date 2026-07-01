"use client";

import React, { useState } from "react";
import dayjs from "dayjs";
import {
  AddRounded,
  BeachAccessRounded,
  CalendarMonthRounded,
  CelebrationRounded,
  EventBusyRounded,
  PublicRounded,
} from "@mui/icons-material";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
} from "@mui/material";
import { toast } from "react-hot-toast";
import { SummaryCard } from "@/components/ui";
import {
  CreateHolidayDocument,
  GetBranchesDocument,
  GetCenterDocument,
  GetHolidaysDocument,
  type GetHolidaysQuery,
} from "@/graphql/generated";
import { getErrorMessage } from "@/lib/errors";
import { primaryGradient } from "@/theme/theme";

type HolidayRecord = GetHolidaysQuery["getHolidays"][number];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const TYPE_OPTIONS = [
  { value: "PUBLIC", label: "Public Holiday" },
  { value: "NATIONAL", label: "National Holiday" },
  { value: "REGIONAL", label: "Regional Holiday" },
  { value: "BRANCH_SPECIFIC", label: "Branch Specific" },
];

const TYPE_COLOR: Record<string, "success" | "info" | "warning" | "default"> = {
  PUBLIC: "success",
  NATIONAL: "info",
  REGIONAL: "warning",
  BRANCH_SPECIFIC: "default",
};

const TYPE_ICON: Record<string, React.ReactElement> = {
  PUBLIC: <PublicRounded sx={{ fontSize: 14 }} />,
  NATIONAL: <CelebrationRounded sx={{ fontSize: 14 }} />,
  REGIONAL: <BeachAccessRounded sx={{ fontSize: 14 }} />,
  BRANCH_SPECIFIC: <CalendarMonthRounded sx={{ fontSize: 14 }} />,
};

const THIS_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [THIS_YEAR - 1, THIS_YEAR, THIS_YEAR + 1];

const groupByMonth = (holidays: HolidayRecord[]): Map<number, HolidayRecord[]> => {
  const map = new Map<number, HolidayRecord[]>();
  for (const h of holidays) {
    const month = dayjs(h.date).month(); // 0-indexed
    if (!map.has(month)) map.set(month, []);
    map.get(month)!.push(h);
  }
  for (const [, list] of map) {
    list.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
  }
  return map;
};

type FormState = {
  name: string;
  date: string;
  type: string;
  branchId: string;
};

const emptyForm: FormState = {
  name: "",
  date: "",
  type: "PUBLIC",
  branchId: "",
};

export function HolidaysWorkspace() {
  const [selectedYear, setSelectedYear] = useState(THIS_YEAR);
  const [branchFilter, setBranchFilter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: centerData } = useQuery(GetCenterDocument);
  const { data: branchesData } = useQuery(GetBranchesDocument, {
    skip: !centerData?.getCenter?.id,
    variables: { centerId: centerData?.getCenter?.id ?? "" },
  });
  const {
    data,
    loading: isLoading,
    error: loadError,
    refetch,
  } = useQuery(GetHolidaysDocument, {
    variables: { year: String(selectedYear) },
    fetchPolicy: "cache-and-network",
  });

  const [createHoliday, createState] = useMutation(CreateHolidayDocument);

  const branches = branchesData?.getBranches ?? [];
  const allHolidays = data?.getHolidays ?? [];

  const displayed = branchFilter
    ? allHolidays.filter((h) => h.branchId === branchFilter)
    : allHolidays;

  const grouped = groupByMonth(displayed);
  const publicCount = displayed.filter((h) => h.type === "PUBLIC" || h.type === "NATIONAL").length;
  const branchSpecific = displayed.filter((h) => h.type === "BRANCH_SPECIFIC").length;

  const openDialog = () => {
    setForm(emptyForm);
    setFormError(null);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    if (!createState.loading) {
      setIsDialogOpen(false);
      setFormError(null);
    }
  };

  const handleCreate = async () => {
    if (!form.name.trim() || !form.date || !form.type) {
      setFormError("Name, date and type are required.");
      return;
    }
    setFormError(null);
    try {
      await createHoliday({
        variables: {
          holiday: {
            name: form.name.trim(),
            date: form.date,
            type: form.type,
            branchId: form.branchId || undefined,
          },
        },
      });
      await refetch();
      toast.success("Holiday added.");
      closeDialog();
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to add holiday.");
      setFormError(msg);
      toast.error(msg);
    }
  };

  return (
    <>
      <Stack spacing={3}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            border: "1px solid",
            borderColor: "divider",
            background: "linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(240,253,250,0.98) 100%)",
          }}
        >
          <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" spacing={3}>
            <Box sx={{ maxWidth: 720 }}>
              <Typography variant="h4" component="h1" sx={{ mt: 0.5 }}>
                Calendar & Holidays
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Manage public, national, and branch-specific holidays for your institution.
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: { xs: "stretch", lg: "flex-end" } }}>
              <Button
                variant="contained"
                startIcon={<AddRounded />}
                onClick={openDialog}
                sx={{ backgroundColor: primaryGradient, maxWidth: { xs: "100%", lg: 200 } }}
                fullWidth
              >
                Add holiday
              </Button>
            </Box>
          </Stack>
        </Paper>

        {/* Summary cards */}
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0,1fr))" } }}>
          <SummaryCard caption="Total holidays" title={String(displayed.length)} icon={<CalendarMonthRounded />} />
          <SummaryCard caption="Public / National" title={String(publicCount)} icon={<PublicRounded />} tone="success" />
          <SummaryCard caption="Branch specific" title={String(branchSpecific)} icon={<BeachAccessRounded />} />
        </Box>

        {/* Year & Branch filters */}
        <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: "block" }}>
                Year
              </Typography>
              <ToggleButtonGroup
                value={selectedYear}
                exclusive
                onChange={(_, v) => { if (v !== null) setSelectedYear(v); }}
                size="small"
              >
                {YEAR_OPTIONS.map((y) => (
                  <ToggleButton key={y} value={y} sx={{ px: 2.5, fontWeight: 600 }}>
                    {y}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            {branches.length > 0 ? (
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel>Filter by branch</InputLabel>
                <Select
                  label="Filter by branch"
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                >
                  <MenuItem value=""><em>All branches</em></MenuItem>
                  {branches.map((b) => (
                    <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : null}
          </Stack>
        </Paper>

        {loadError ? (
          <Alert severity="error">{loadError.message || "Unable to load holidays."}</Alert>
        ) : null}

        {/* Month-grouped calendar view */}
        {isLoading && !displayed.length ? (
          <Paper elevation={0} sx={{ p: 4, border: "1px solid", borderColor: "divider", textAlign: "center" }}>
            <Typography color="text.secondary">Loading holidays…</Typography>
          </Paper>
        ) : displayed.length === 0 ? (
          <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, border: "1px solid", borderColor: "divider", textAlign: "center" }}>
            <EventBusyRounded sx={{ fontSize: 44, color: "text.disabled", mb: 1.5 }} />
            <Typography variant="subtitle1" fontWeight={700}>No holidays for {selectedYear}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Click &ldquo;Add holiday&rdquo; to start building your holiday calendar.
            </Typography>
            <Button variant="outlined" startIcon={<AddRounded />} onClick={openDialog} sx={{ mt: 2 }}>
              Add holiday
            </Button>
          </Paper>
        ) : (
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0,1fr))", xl: "repeat(3, minmax(0,1fr))" },
            }}
          >
            {MONTH_NAMES.map((monthName, idx) => {
              const entries = grouped.get(idx) ?? [];
              if (!entries.length) return null;
              return (
                <Paper
                  key={monthName}
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor: alpha("#0f172a", 0.08),
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  {/* Month header */}
                  <Box
                    sx={{
                      px: 2.5,
                      py: 1.5,
                      bgcolor: alpha("#2563eb", 0.06),
                      borderBottom: "1px solid",
                      borderColor: alpha("#2563eb", 0.12),
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" fontWeight={700}>
                        {monthName}
                      </Typography>
                      <Chip
                        label={`${entries.length} holiday${entries.length === 1 ? "" : "s"}`}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    </Stack>
                  </Box>

                  {/* Holiday list */}
                  <Stack divider={<Divider />}>
                    {entries.map((h) => (
                      <Stack
                        key={h.id}
                        direction="row"
                        alignItems="center"
                        spacing={2}
                        sx={{ px: 2.5, py: 1.75 }}
                      >
                        {/* Date block */}
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 1.5,
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                            bgcolor: alpha("#2563eb", 0.08),
                            border: "1px solid",
                            borderColor: alpha("#2563eb", 0.2),
                          }}
                        >
                          <Typography variant="h6" lineHeight={1} color="success.dark">
                            {dayjs(h.date).format("DD")}
                          </Typography>
                        </Box>

                        {/* Name + type */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {h.name}
                          </Typography>
                          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.4 }}>
                            <Chip
                              icon={TYPE_ICON[h.type] ?? undefined}
                              label={TYPE_OPTIONS.find((t) => t.value === h.type)?.label ?? h.type}
                              size="small"
                              color={TYPE_COLOR[h.type] ?? "default"}
                              variant="outlined"
                              sx={{ height: 20, "& .MuiChip-label": { px: 0.75, fontSize: 11 } }}
                            />
                            {h.branchId ? (
                              <Typography variant="caption" color="text.secondary">
                                Branch only
                              </Typography>
                            ) : null}
                          </Stack>
                        </Box>

                        {/* Day of week */}
                        <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                          {dayjs(h.date).format("ddd")}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              );
            })}
          </Box>
        )}
      </Stack>

      {/* Add Holiday Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add holiday</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            {formError ? <Alert severity="error">{formError}</Alert> : null}

            <TextField
              label="Holiday name *"
              placeholder="e.g. Eid ul-Fitr"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              size="small"
              fullWidth
            />

            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
              <TextField
                label="Date *"
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />

              <FormControl size="small" fullWidth>
                <InputLabel>Type *</InputLabel>
                <Select
                  label="Type *"
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {branches.length > 0 ? (
              <FormControl size="small" fullWidth>
                <InputLabel>Branch (optional)</InputLabel>
                <Select
                  label="Branch (optional)"
                  value={form.branchId}
                  onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))}
                >
                  <MenuItem value=""><em>All branches (global)</em></MenuItem>
                  {branches.map((b) => (
                    <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={closeDialog} disabled={createState.loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={createState.loading || !form.name.trim() || !form.date}
          >
            Add holiday
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
