"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { AddRounded, EventNoteRounded } from "@mui/icons-material";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { toast } from "react-hot-toast";
import {
  GetMyAttendanceSheetDocument,
  RequestManualAttendanceDocument,
  type GetMyAttendanceSheetQuery,
} from "@/graphql/generated";
import { GetMyEmployeeProfileDocument } from "@/graphql/hr-extended";
import { SummaryCard } from "@/components/ui";
import { getErrorMessage } from "@/lib/errors";
import { primaryGradient } from "@/theme/theme";

type AttendanceRecord =
  GetMyAttendanceSheetQuery["getMyAttendanceSheet"][number];

const STATUS_COLOR: Record<string, "default" | "success" | "error" | "warning"> = {
  present: "success",
  late: "warning",
  half_day: "warning",
  absent: "error",
};

const REQUEST_STATUSES = [
  { value: "PRESENT", label: "Present" },
  { value: "LATE", label: "Late" },
  { value: "HALF_DAY", label: "Half day" },
];

export function TeacherMyAttendanceWorkspace() {
  const { data: profileData, error: profileError } = useQuery(
    GetMyEmployeeProfileDocument,
    { fetchPolicy: "cache-and-network", errorPolicy: "all" },
  );
  const employeeId = profileData?.getMyEmployeeProfile?.id ?? "";

  const [month, setMonth] = useState(dayjs().month() + 1);
  const [year, setYear] = useState(dayjs().year());

  const {
    data: sheetData,
    loading: sheetLoading,
    refetch: refetchSheet,
  } = useQuery(GetMyAttendanceSheetDocument, {
    variables: { month, year },
    fetchPolicy: "cache-and-network",
  });

  const [requestManualAttendance, { loading: requesting }] = useMutation(
    RequestManualAttendanceDocument,
  );

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("PRESENT");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const records = sheetData?.getMyAttendanceSheet ?? [];
  const present = records.filter((r) => r.status?.toUpperCase() === "PRESENT").length;
  const absent = records.filter((r) => r.status?.toUpperCase() === "ABSENT").length;
  const late = records.filter((r) => r.status?.toUpperCase() === "LATE").length;

  const resetForm = () => {
    setDate("");
    setStatus("PRESENT");
    setReason("");
    setError(null);
  };

  const handleRequest = async () => {
    if (!date) {
      setError("Select a date.");
      return;
    }
    if (!reason.trim()) {
      setError("Provide a reason for this correction.");
      return;
    }
    setError(null);
    try {
      await requestManualAttendance({
        variables: {
          input: {
            employeeId,
            attendanceDate: date,
            status,
            reason: reason.trim(),
          },
        },
      });
      toast.success("Attendance correction submitted for HR approval.");
      await refetchSheet();
      setOpen(false);
      resetForm();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to submit request."));
    }
  };

  const columns: MRT_ColumnDef<AttendanceRecord>[] = [
    {
      accessorKey: "attendanceDate",
      header: "Date",
      size: 120,
      Cell: ({ cell }) => (
        <Typography variant="body2">
          {dayjs(String(cell.getValue())).format("DD MMM YYYY")}
        </Typography>
      ),
    },
    {
      accessorKey: "checkInTime",
      header: "Check-in",
      size: 100,
      Cell: ({ cell }) => (
        <Typography variant="body2">{String(cell.getValue() ?? "—")}</Typography>
      ),
    },
    {
      accessorKey: "checkOutTime",
      header: "Check-out",
      size: 100,
      Cell: ({ cell }) => (
        <Typography variant="body2">{String(cell.getValue() ?? "—")}</Typography>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 120,
      Cell: ({ cell }) => {
        const s = String(cell.getValue() ?? "").toLowerCase();
        return (
          <Chip
            label={s.charAt(0).toUpperCase() + s.slice(1)}
            size="small"
            color={STATUS_COLOR[s] ?? "default"}
          />
        );
      },
    },
    {
      accessorKey: "source",
      header: "Source",
      size: 100,
      Cell: ({ cell }) => (
        <Typography variant="caption" color="text.secondary">
          {String(cell.getValue() ?? "").toLowerCase()}
        </Typography>
      ),
    },
    {
      accessorKey: "correctionReason",
      header: "Reason",
      size: 200,
      Cell: ({ cell }) => (
        <Typography variant="body2" color="text.secondary" noWrap>
          {String(cell.getValue() ?? "—")}
        </Typography>
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
              "linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(240,253,250,0.98) 100%)",
          }}
        >
          <Stack
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            spacing={3}
          >
            <Box>
              <Typography variant="h4" component="h1">
                My Attendance
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                Track your own check-ins and request a correction if a day was
                recorded wrong.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={() => setOpen(true)}
              disabled={!employeeId}
              sx={{ alignSelf: "flex-start", backgroundColor: primaryGradient }}
            >
              Request manual attendance
            </Button>
          </Stack>
        </Paper>

        {profileError ? (
          <Alert severity="info">
            No employee profile is linked to your account, so attendance cannot
            be requested. Contact your administrator.
          </Alert>
        ) : null}

        <Stack direction="row" spacing={2}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Month</InputLabel>
            <Select
              label="Month"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <MenuItem key={m} value={m}>
                  {dayjs().month(m - 1).format("MMMM")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Year"
            type="number"
            size="small"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            sx={{ maxWidth: 120 }}
          />
        </Stack>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0,1fr))" },
          }}
        >
          <SummaryCard caption="Present" title={String(present)} icon={<EventNoteRounded />} tone="success" />
          <SummaryCard caption="Late" title={String(late)} icon={<EventNoteRounded />} tone="warning" />
          <SummaryCard caption="Absent" title={String(absent)} icon={<EventNoteRounded />} tone="error" />
        </Box>

        <MaterialReactTable
          columns={columns}
          data={records}
          getRowId={(r) => r.id}
          enableDensityToggle={false}
          enableFullScreenToggle={false}
          enableHiding={false}
          enableColumnFilters={false}
          enableSorting
          initialState={{
            pagination: { pageIndex: 0, pageSize: 10 },
            sorting: [{ id: "attendanceDate", desc: true }],
          }}
          localization={{ noRecordsToDisplay: "No attendance records for this month." }}
          muiTablePaperProps={{
            elevation: 0,
            sx: {
              border: "1px solid",
              borderColor: alpha("#0f172a", 0.08),
              borderRadius: 2,
              overflow: "hidden",
            },
          }}
          state={{ isLoading: sheetLoading && records.length === 0 }}
        />
      </Stack>

      <Dialog open={open} onClose={() => !requesting && setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Request manual attendance</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <TextField
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <FormControl size="small" fullWidth>
              <InputLabel>Requested status</InputLabel>
              <Select
                label="Requested status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {REQUEST_STATUSES.map((s) => (
                  <MenuItem key={s.value} value={s.value}>
                    {s.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              size="small"
              multiline
              rows={3}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={() => setOpen(false)} disabled={requesting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleRequest}
            disabled={requesting || !employeeId}
            startIcon={requesting ? <CircularProgress size={14} color="inherit" /> : undefined}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
