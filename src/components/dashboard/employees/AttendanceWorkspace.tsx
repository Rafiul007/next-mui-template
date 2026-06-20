"use client";

import { useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import {
  AddRounded,
  CheckCircleRounded,
  EventBusyRounded,
  HourglassTopRounded,
  LoginRounded,
  LogoutRounded,
  ScheduleRounded,
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
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { toast } from "react-hot-toast";
import { SummaryCard } from "@/components/ui";
import {
  ApproveManualAttendanceDocument,
  GetEmployeesDocument,
  GetMonthlyAttendanceSheetDocument,
  GetUsersDocument,
  RecordCheckInDocument,
  RecordCheckOutDocument,
  RequestManualAttendanceDocument,
  type GetEmployeesQuery,
  type GetMonthlyAttendanceSheetQuery,
  type GetUsersQuery,
} from "@/graphql/generated";
import { SearchSelect, type SearchSelectOption } from "@/components/form";
import { getErrorMessage } from "@/lib/errors";

type AttendanceRecord =
  GetMonthlyAttendanceSheetQuery["getMonthlyAttendanceSheet"][number];
type EmployeeRecord = GetEmployeesQuery["getEmployees"][number];
type UserRecord = NonNullable<GetUsersQuery["getUsers"][number]>;

const STATUS_COLOR: Record<
  string,
  "success" | "error" | "warning" | "default"
> = {
  present: "success",
  absent: "error",
  late: "warning",
  pending: "default",
};

const formatPersonName = (user: UserRecord) =>
  `${user.firstName} ${user.lastName ?? ""}`.trim() || user.email;

const buildAttendanceColumns = ({
  userLookup,
  employeeLookup,
  onApprove,
  isApproving,
}: {
  userLookup: Map<string, string>;
  employeeLookup: Map<string, EmployeeRecord>;
  onApprove: (id: string) => void;
  isApproving: boolean;
}): MRT_ColumnDef<AttendanceRecord>[] => [
  {
    id: "employee",
    accessorFn: (row) => {
      const emp = employeeLookup.get(row.employeeId);
      const name = emp?.userId ? (userLookup.get(emp.userId) ?? "—") : "—";
      return name;
    },
    header: "Staff member",
    size: 200,
    Cell: ({ cell }) => (
      <Typography variant="body2" fontWeight={600}>
        {String(cell.getValue())}
      </Typography>
    ),
  },
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
    size: 110,
    Cell: ({ cell }) => (
      <Typography variant="body2">{String(cell.getValue() ?? "—")}</Typography>
    ),
  },
  {
    accessorKey: "checkOutTime",
    header: "Check-out",
    size: 110,
    Cell: ({ cell }) => (
      <Typography variant="body2">{String(cell.getValue() ?? "—")}</Typography>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 110,
    filterVariant: "select",
    filterSelectOptions: ["present", "absent", "late", "pending"],
    Cell: ({ cell }) => {
      const status = String(cell.getValue() ?? "").toLowerCase();
      return (
        <Chip
          label={status.charAt(0).toUpperCase() + status.slice(1)}
          color={STATUS_COLOR[status] ?? "default"}
          size="small"
          variant={status === "pending" ? "outlined" : "filled"}
        />
      );
    },
  },
  {
    accessorKey: "source",
    header: "Source",
    size: 110,
    Cell: ({ cell }) => (
      <Typography variant="body2" color="text.secondary">
        {String(cell.getValue() ?? "—")}
      </Typography>
    ),
  },
  {
    id: "approve",
    header: "Action",
    size: 100,
    enableColumnFilter: false,
    enableSorting: false,
    Cell: ({ row }) => {
      const isPending =
        row.original.status?.toLowerCase() === "pending";
      if (!isPending) return null;
      return (
        <Tooltip title="Approve manual attendance">
          <span>
            <Button
              size="small"
              variant="outlined"
              color="success"
              disabled={isApproving}
              onClick={() => onApprove(row.original.id)}
            >
              Approve
            </Button>
          </span>
        </Tooltip>
      );
    },
  },
];

type ManualRequestForm = {
  attendanceDate: string;
  status: string;
  reason: string;
};

export function AttendanceWorkspace() {
  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [isManualRequestOpen, setIsManualRequestOpen] = useState(false);
  const [manualForm, setManualForm] = useState<ManualRequestForm>({
    attendanceDate: dayjs().format("YYYY-MM-DD"),
    status: "present",
    reason: "",
  });

  const { data: usersData } = useQuery(GetUsersDocument, {
    variables: { page: 1, limit: 500 },
  });
  const { data: employeesData, loading: isEmployeesLoading } = useQuery(
    GetEmployeesDocument,
  );
  const {
    data: attendanceData,
    loading: isAttendanceLoading,
    error: attendanceError,
    refetch: refetchAttendance,
  } = useQuery(GetMonthlyAttendanceSheetDocument, {
    skip: !selectedEmployeeId,
    variables: {
      employeeId: selectedEmployeeId,
      month: selectedMonth.month() + 1,
      year: selectedMonth.year(),
    },
    fetchPolicy: "cache-and-network",
  });

  const [approveManualAttendance, approveState] = useMutation(
    ApproveManualAttendanceDocument,
  );
  const [recordCheckIn, checkInState] = useMutation(RecordCheckInDocument);
  const [recordCheckOut, checkOutState] = useMutation(RecordCheckOutDocument);
  const [requestManualAttendance, manualRequestState] = useMutation(
    RequestManualAttendanceDocument,
  );

  const employees = employeesData?.getEmployees ?? [];
  const users = (usersData?.getUsers ?? []).filter(
    (u): u is UserRecord => !!u,
  );
  const attendanceRecords = attendanceData?.getMonthlyAttendanceSheet ?? [];

  const userLookup = new Map(users.map((u) => [u.id, formatPersonName(u)]));
  const employeeLookup = new Map(employees.map((e) => [e.id, e]));

  const presentCount = attendanceRecords.filter(
    (r) => r.status?.toLowerCase() === "present",
  ).length;
  const absentCount = attendanceRecords.filter(
    (r) => r.status?.toLowerCase() === "absent",
  ).length;
  const lateCount = attendanceRecords.filter(
    (r) => r.status?.toLowerCase() === "late",
  ).length;
  const pendingCount = attendanceRecords.filter(
    (r) => r.status?.toLowerCase() === "pending",
  ).length;

  const employeeOptions: SearchSelectOption[] = employees.map((e) => {
    const name = e.userId
      ? (userLookup.get(e.userId) ?? e.employeeCode)
      : e.employeeCode;
    return { value: e.id, label: name, keywords: e.employeeCode };
  });

  const handleApprove = async (attendanceId: string) => {
    try {
      const result = await approveManualAttendance({ variables: { attendanceId } });
      if (result.error) throw result.error;
      await refetchAttendance();
      toast.success("Attendance approved.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to approve attendance."));
    }
  };

  const handleCheckIn = async () => {
    if (!selectedEmployeeId) return;
    try {
      const result = await recordCheckIn({
        variables: {
          input: {
            employeeId: selectedEmployeeId,
            checkInTime: new Date().toISOString(),
          },
        },
      });
      if (result.error) throw result.error;
      await refetchAttendance();
      toast.success("Check-in recorded.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to record check-in."));
    }
  };

  const handleCheckOut = async () => {
    if (!selectedEmployeeId) return;
    try {
      const result = await recordCheckOut({
        variables: {
          input: {
            employeeId: selectedEmployeeId,
            checkOutTime: new Date().toISOString(),
          },
        },
      });
      if (result.error) throw result.error;
      await refetchAttendance();
      toast.success("Check-out recorded.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to record check-out."));
    }
  };

  const handleManualRequest = async () => {
    if (!selectedEmployeeId) return;
    try {
      const result = await requestManualAttendance({
        variables: {
          input: {
            employeeId: selectedEmployeeId,
            attendanceDate: manualForm.attendanceDate,
            status: manualForm.status,
            reason: manualForm.reason || undefined,
          },
        },
      });
      if (result.error) throw result.error;
      await refetchAttendance();
      toast.success("Manual attendance request submitted.");
      setIsManualRequestOpen(false);
      setManualForm({ attendanceDate: dayjs().format("YYYY-MM-DD"), status: "present", reason: "" });
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to submit request."));
    }
  };

  const isLoading = isAttendanceLoading || isEmployeesLoading;
  const isActionLoading = checkInState.loading || checkOutState.loading;

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
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ md: "center" }}
          spacing={3}
        >
          <Box>
            <Typography variant="h4" component="h1" sx={{ mt: 0.5 }}>
              Staff attendance
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              View monthly attendance records and approve manual requests.
            </Typography>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap">
            <DatePicker
              label="Month"
              value={selectedMonth}
              onChange={(v) => v && setSelectedMonth(v)}
              views={["month", "year"]}
              slotProps={{
                textField: { size: "small", sx: { minWidth: 160 } },
              }}
            />
            <SearchSelect
              label="Employee"
              placeholder="Search by name or code…"
              options={employeeOptions}
              value={selectedEmployeeId}
              onChange={setSelectedEmployeeId}
              sx={{ minWidth: 220 }}
            />
            {selectedEmployeeId ? (
              <Stack direction="row" spacing={1}>
                <Tooltip title="Record today's check-in">
                  <span>
                    <Button
                      size="small"
                      variant="outlined"
                      color="success"
                      startIcon={<LoginRounded />}
                      disabled={isActionLoading}
                      onClick={handleCheckIn}
                    >
                      Check-in
                    </Button>
                  </span>
                </Tooltip>
                <Tooltip title="Record today's check-out">
                  <span>
                    <Button
                      size="small"
                      variant="outlined"
                      color="warning"
                      startIcon={<LogoutRounded />}
                      disabled={isActionLoading}
                      onClick={handleCheckOut}
                    >
                      Check-out
                    </Button>
                  </span>
                </Tooltip>
                <Tooltip title="Submit manual attendance correction">
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddRounded />}
                    onClick={() => setIsManualRequestOpen(true)}
                  >
                    Manual request
                  </Button>
                </Tooltip>
              </Stack>
            ) : null}
          </Stack>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            xl: "repeat(4, minmax(0, 1fr))",
          },
        }}
      >
        <SummaryCard
          caption="Present"
          title={String(presentCount)}
          icon={<CheckCircleRounded />}
          tone="success"
        />
        <SummaryCard
          caption="Absent"
          title={String(absentCount)}
          icon={<EventBusyRounded />}
          tone="muted"
        />
        <SummaryCard
          caption="Late"
          title={String(lateCount)}
          icon={<ScheduleRounded />}
          tone="default"
        />
        <SummaryCard
          caption="Pending approval"
          title={String(pendingCount)}
          icon={<HourglassTopRounded />}
        />
      </Box>

      {attendanceError ? (
        <Alert severity="error">
          {attendanceError.message || "Unable to load attendance records."}
        </Alert>
      ) : null}

      {!selectedEmployeeId ? (
        <Paper
          elevation={0}
          sx={{ p: 4, border: "1px solid", borderColor: "divider", textAlign: "center" }}
        >
          <Typography variant="subtitle1" fontWeight={700}>
            Select an employee
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Choose an employee above to view their monthly attendance sheet.
          </Typography>
        </Paper>
      ) : (
        <MaterialReactTable
          columns={buildAttendanceColumns({
            userLookup,
            employeeLookup,
            onApprove: handleApprove,
            isApproving: approveState.loading,
          })}
          data={attendanceRecords}
          enableColumnFilters
          enableDensityToggle={false}
          enableFullScreenToggle={false}
          enableHiding={false}
          enableRowActions={false}
          enableSorting
          enableStickyHeader
          getRowId={(row) => row.id}
          initialState={{
            pagination: { pageIndex: 0, pageSize: 31 },
            sorting: [{ id: "attendanceDate", desc: false }],
          }}
          localization={{ noRecordsToDisplay: "No records for this period" }}
          muiSearchTextFieldProps={{
            placeholder: "Search records",
            size: "small",
            sx: { minWidth: { xs: "100%", md: 280 } },
          }}
          muiBottomToolbarProps={{
            sx: {
              borderTop: "1px solid",
              borderColor: alpha("#0f172a", 0.08),
              bgcolor: "#ffffff",
            },
          }}
          muiTableBodyRowProps={{
            sx: {
              bgcolor: "#ffffff",
              transition: "background-color 140ms ease",
              "&:hover td": { bgcolor: alpha("#ecfdf5", 0.9) },
            },
          }}
          muiTableBodyCellProps={{
            sx: {
              bgcolor: "#ffffff",
              borderBottom: "1px solid",
              borderColor: alpha("#0f172a", 0.06),
              py: 2.25,
            },
          }}
          muiTableContainerProps={{ sx: { maxHeight: 640, bgcolor: "#ffffff" } }}
          muiTableHeadCellProps={{
            sx: {
              bgcolor: "#ffffff",
              color: alpha("#0f172a", 0.72),
              fontSize: 13,
              fontWeight: 700,
              py: 1.75,
              borderBottom: "1px solid",
              borderColor: alpha("#0f172a", 0.08),
            },
          }}
          muiTablePaperProps={{
            elevation: 0,
            sx: {
              border: "1px solid",
              borderColor: alpha("#0f172a", 0.08),
              borderRadius: 2,
              overflow: "hidden",
              bgcolor: "#ffffff",
              boxShadow: `0 16px 40px ${alpha("#0f172a", 0.06)}`,
            },
          }}
          muiTopToolbarProps={{
            sx: {
              px: 2.5,
              py: 1.75,
              bgcolor: "#ffffff",
              borderBottom: "1px solid",
              borderColor: alpha("#0f172a", 0.08),
            },
          }}
          state={{ isLoading: isLoading && attendanceRecords.length === 0 }}
        />
      )}
    </Stack>

      <Dialog
        open={isManualRequestOpen}
        onClose={() => !manualRequestState.loading && setIsManualRequestOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Request manual attendance</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Date"
              type="date"
              value={manualForm.attendanceDate}
              onChange={(e) => setManualForm((f) => ({ ...f, attendanceDate: e.target.value }))}
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <FormControl size="small" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={manualForm.status}
                onChange={(e) => setManualForm((f) => ({ ...f, status: e.target.value }))}
              >
                <MenuItem value="present">Present</MenuItem>
                <MenuItem value="late">Late</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Reason (optional)"
              value={manualForm.reason}
              onChange={(e) => setManualForm((f) => ({ ...f, reason: e.target.value }))}
              multiline
              rows={2}
              size="small"
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            color="inherit"
            onClick={() => setIsManualRequestOpen(false)}
            disabled={manualRequestState.loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleManualRequest}
            disabled={manualRequestState.loading}
          >
            Submit request
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
