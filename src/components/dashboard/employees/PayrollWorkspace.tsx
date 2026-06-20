"use client";

import { useState } from "react";
import dayjs from "dayjs";
import {
  AccountBalanceWalletRounded,
  AddRounded,
  CheckCircleRounded,
  GroupsRounded,
  MoneyRounded,
  PaymentsRounded,
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
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { toast } from "react-hot-toast";
import { SummaryCard } from "@/components/ui";
import { GetEmployeesDocument, type GetEmployeesQuery } from "@/graphql/generated";
import {
  ApprovePayrollDocument,
  DisbursePayrollDocument,
  GetPayrollRunsDocument,
  GetSalaryStructureDocument,
  RunPayrollDocument,
  SetSalaryStructureDocument,
  type GetPayrollRunsQuery,
} from "@/graphql/hr-extended";
import { SearchSelect, type SearchSelectOption } from "@/components/form";
import { getErrorMessage } from "@/lib/errors";
import { primaryGradient } from "@/theme/theme";

type PayrollRun = GetPayrollRunsQuery["getPayrollRuns"][number];
type EmployeeRecord = GetEmployeesQuery["getEmployees"][number];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const STATUS_COLOR: Record<string, "default" | "warning" | "success" | "info"> = {
  pending: "warning",
  approved: "info",
  disbursed: "success",
};

const buildPayrollColumns = (
  onApprove: (id: string) => void,
  onDisburse: (id: string) => void,
  isActioning: boolean,
): MRT_ColumnDef<PayrollRun>[] => [
  {
    id: "period",
    accessorFn: (row) => `${MONTH_NAMES[row.month - 1]} ${row.year}`,
    header: "Period",
    size: 160,
    Cell: ({ cell }) => (
      <Typography variant="body2" fontWeight={600}>
        {String(cell.getValue())}
      </Typography>
    ),
  },
  {
    accessorKey: "totalEmployees",
    header: "Employees",
    size: 120,
    Cell: ({ cell }) => (
      <Typography variant="body2">{String(cell.getValue())}</Typography>
    ),
  },
  {
    accessorKey: "totalAmount",
    header: "Total amount",
    size: 160,
    Cell: ({ cell }) => (
      <Typography variant="body2" fontWeight={600}>
        ৳ {Number(cell.getValue()).toLocaleString()}
      </Typography>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 120,
    Cell: ({ cell }) => {
      const status = String(cell.getValue() ?? "").toLowerCase();
      return (
        <Chip
          label={status.charAt(0).toUpperCase() + status.slice(1)}
          color={STATUS_COLOR[status] ?? "default"}
          size="small"
          variant={status === "disbursed" ? "filled" : "outlined"}
        />
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Run date",
    size: 140,
    Cell: ({ cell }) => (
      <Typography variant="body2">
        {dayjs(String(cell.getValue())).format("DD MMM YYYY")}
      </Typography>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    size: 200,
    enableSorting: false,
    enableColumnFilter: false,
    Cell: ({ row }) => {
      const status = row.original.status?.toLowerCase();
      return (
        <Stack direction="row" spacing={1}>
          {status === "pending" ? (
            <Button
              size="small"
              variant="outlined"
              color="info"
              disabled={isActioning}
              onClick={() => onApprove(row.original.id)}
            >
              Approve
            </Button>
          ) : null}
          {status === "approved" ? (
            <Button
              size="small"
              variant="contained"
              color="success"
              disabled={isActioning}
              onClick={() => onDisburse(row.original.id)}
            >
              Disburse
            </Button>
          ) : null}
          {status === "disbursed" ? (
            <Typography variant="body2" color="success.main">
              ✓ Disbursed
            </Typography>
          ) : null}
        </Stack>
      );
    },
  },
];

export function PayrollWorkspace() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [isRunPayrollOpen, setIsRunPayrollOpen] = useState(false);
  const [isSalaryOpen, setIsSalaryOpen] = useState(false);
  const [payrollMonth, setPayrollMonth] = useState(new Date().getMonth() + 1);
  const [payrollYear, setPayrollYear] = useState(new Date().getFullYear());
  const [salaryForm, setSalaryForm] = useState({
    basicSalary: "",
    allowances: "",
    deductions: "",
    effectiveFrom: dayjs().format("YYYY-MM-DD"),
  });
  const [pageError, setPageError] = useState<string | null>(null);

  const { data: employeesData } = useQuery(GetEmployeesDocument);
  const {
    data: payrollRunsData,
    loading: isRunsLoading,
    refetch: refetchRuns,
  } = useQuery(GetPayrollRunsDocument, { fetchPolicy: "cache-and-network" });
  const { data: salaryData, refetch: refetchSalary } = useQuery(
    GetSalaryStructureDocument,
    {
      skip: !selectedEmployeeId,
      variables: { employeeId: selectedEmployeeId },
      fetchPolicy: "cache-and-network",
    },
  );

  const [setSalaryStructure, salaryState] = useMutation(SetSalaryStructureDocument);
  const [runPayroll, runState] = useMutation(RunPayrollDocument);
  const [approvePayroll, approveState] = useMutation(ApprovePayrollDocument);
  const [disbursePayroll, disburseState] = useMutation(DisbursePayrollDocument);

  const employees = employeesData?.getEmployees ?? [];
  const payrollRuns = payrollRunsData?.getPayrollRuns ?? [];
  const salary = salaryData?.getSalaryStructure;

  const totalDisbursed = payrollRuns
    .filter((r) => r.status?.toLowerCase() === "disbursed")
    .reduce((sum, r) => sum + r.totalAmount, 0);
  const pendingRuns = payrollRuns.filter((r) => r.status?.toLowerCase() === "pending").length;
  const isActioning = approveState.loading || disburseState.loading;

  const handleSetSalary = async () => {
    if (!selectedEmployeeId || !salaryForm.basicSalary) return;
    try {
      await setSalaryStructure({
        variables: {
          input: {
            employeeId: selectedEmployeeId,
            basicSalary: parseFloat(salaryForm.basicSalary),
            allowances: salaryForm.allowances ? parseFloat(salaryForm.allowances) : undefined,
            deductions: salaryForm.deductions ? parseFloat(salaryForm.deductions) : undefined,
            effectiveFrom: salaryForm.effectiveFrom,
          },
        },
      });
      await refetchSalary();
      toast.success("Salary structure saved.");
      setIsSalaryOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to save salary structure."));
    }
  };

  const handleRunPayroll = async () => {
    setPageError(null);
    try {
      await runPayroll({ variables: { input: { month: payrollMonth, year: payrollYear } } });
      await refetchRuns();
      toast.success(`Payroll run created for ${MONTH_NAMES[payrollMonth - 1]} ${payrollYear}.`);
      setIsRunPayrollOpen(false);
    } catch (error) {
      const message = getErrorMessage(error, "Unable to run payroll.");
      setPageError(message);
      toast.error(message);
    }
  };

  const handleApprove = async (payrollRunId: string) => {
    try {
      await approvePayroll({ variables: { payrollRunId } });
      await refetchRuns();
      toast.success("Payroll approved.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to approve payroll."));
    }
  };

  const handleDisburse = async (payrollRunId: string) => {
    try {
      await disbursePayroll({ variables: { payrollRunId } });
      await refetchRuns();
      toast.success("Payroll disbursed successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to disburse payroll."));
    }
  };

  const employeeOptions: SearchSelectOption[] = employees.map(
    (e: EmployeeRecord) => ({
      value: e.id,
      label: e.employeeCode || e.id,
      keywords: e.employeeCode,
    }),
  );

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
            <Box sx={{ maxWidth: 760 }}>
              <Typography variant="h4" component="h1" sx={{ mt: 0.5 }}>
                Payroll
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Manage salary structures, run payroll, and disburse salaries to employees.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={() => setIsRunPayrollOpen(true)}
              sx={{ alignSelf: "flex-start", backgroundImage: primaryGradient }}
            >
              Run payroll
            </Button>
          </Stack>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0,1fr))",
              xl: "repeat(3, minmax(0,1fr))",
            },
          }}
        >
          <SummaryCard
            caption="Total runs"
            title={String(payrollRuns.length)}
            icon={<PaymentsRounded />}
          />
          <SummaryCard
            caption="Pending approval"
            title={String(pendingRuns)}
            icon={<MoneyRounded />}
            tone="default"
          />
          <SummaryCard
            caption="Total disbursed"
            title={`৳ ${totalDisbursed.toLocaleString()}`}
            icon={<AccountBalanceWalletRounded />}
            tone="success"
          />
        </Box>

        {pageError ? (
          <Alert severity="error">{pageError}</Alert>
        ) : null}

        <Paper
          elevation={0}
          sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              px: { xs: 2, md: 3 },
              pt: 1,
              borderBottom: "1px solid",
              borderColor: alpha("#0f172a", 0.08),
              bgcolor: "#ffffff",
            }}
          >
            <Tab label={`Payroll runs (${payrollRuns.length})`} />
            <Tab label="Salary structures" />
          </Tabs>

          <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f8fafc" }}>
            {activeTab === 0 ? (
              <MaterialReactTable
                columns={buildPayrollColumns(handleApprove, handleDisburse, isActioning)}
                data={payrollRuns}
                getRowId={(row) => row.id}
                enableColumnFilters={false}
                enableDensityToggle={false}
                enableFullScreenToggle={false}
                enableHiding={false}
                enableRowActions={false}
                enableSorting
                enableStickyHeader
                initialState={{
                  pagination: { pageIndex: 0, pageSize: 10 },
                  sorting: [{ id: "createdAt", desc: true }],
                }}
                localization={{ noRecordsToDisplay: "No payroll runs yet. Click 'Run payroll' to start." }}
                muiTableBodyRowProps={{ sx: { bgcolor: "#ffffff" } }}
                muiTableBodyCellProps={{ sx: { bgcolor: "#ffffff", borderBottom: "1px solid", borderColor: alpha("#0f172a", 0.06), py: 2 } }}
                muiTableContainerProps={{ sx: { maxHeight: 500, bgcolor: "#ffffff" } }}
                muiTableHeadCellProps={{ sx: { bgcolor: "#ffffff", color: alpha("#0f172a", 0.72), fontSize: 13, fontWeight: 700, py: 1.75, borderBottom: "1px solid", borderColor: alpha("#0f172a", 0.08) } }}
                muiTablePaperProps={{ elevation: 0, sx: { border: "1px solid", borderColor: alpha("#0f172a", 0.08), borderRadius: 2, overflow: "hidden", bgcolor: "#ffffff" } }}
                muiTopToolbarProps={{ sx: { px: 2.5, py: 1.75, bgcolor: "#ffffff", borderBottom: "1px solid", borderColor: alpha("#0f172a", 0.08) } }}
                muiBottomToolbarProps={{ sx: { borderTop: "1px solid", borderColor: alpha("#0f172a", 0.08), bgcolor: "#ffffff" } }}
                state={{ isLoading: isRunsLoading && payrollRuns.length === 0 }}
              />
            ) : (
              <Stack spacing={3}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
                  <SearchSelect
                    label="Select employee"
                    placeholder="Search by code…"
                    options={employeeOptions}
                    value={selectedEmployeeId}
                    onChange={setSelectedEmployeeId}
                    sx={{ minWidth: 260 }}
                  />
                  {selectedEmployeeId ? (
                    <Button
                      variant="outlined"
                      startIcon={<MoneyRounded />}
                      onClick={() => {
                        setSalaryForm({
                          basicSalary: salary?.basicSalary?.toString() ?? "",
                          allowances: salary?.allowances?.toString() ?? "",
                          deductions: salary?.deductions?.toString() ?? "",
                          effectiveFrom: salary?.effectiveFrom ?? dayjs().format("YYYY-MM-DD"),
                        });
                        setIsSalaryOpen(true);
                      }}
                    >
                      {salary ? "Update salary" : "Set salary"}
                    </Button>
                  ) : null}
                </Stack>

                {selectedEmployeeId && salary ? (
                  <Paper
                    elevation={0}
                    sx={{ p: 2.5, border: "1px solid", borderColor: alpha("#10b981", 0.2), borderRadius: 2, bgcolor: alpha("#ecfdf5", 0.5) }}
                  >
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                      Current salary structure
                      <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        Effective {dayjs(salary.effectiveFrom).format("DD MMM YYYY")}
                      </Typography>
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gap: 2,
                        gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
                      }}
                    >
                      {[
                        { label: "Basic salary", value: salary.basicSalary },
                        { label: "Allowances", value: salary.allowances ?? 0 },
                        { label: "Deductions", value: salary.deductions ?? 0 },
                        { label: "Net salary", value: salary.netSalary },
                      ].map(({ label, value }) => (
                        <Box key={label} sx={{ textAlign: "center", p: 1.5, bgcolor: "#fff", borderRadius: 1, border: "1px solid", borderColor: alpha("#0f172a", 0.06) }}>
                          <Typography variant="caption" color="text.secondary">{label}</Typography>
                          <Typography variant="h6" sx={{ mt: 0.25 }}>৳ {value.toLocaleString()}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                ) : selectedEmployeeId ? (
                  <Paper
                    elevation={0}
                    sx={{ p: 4, border: "1px solid", borderColor: "divider", textAlign: "center" }}
                  >
                    <GroupsRounded sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
                    <Typography variant="subtitle1" fontWeight={700}>No salary structure set</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                      Set a salary structure for this employee to include them in payroll.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => { setSalaryForm({ basicSalary: "", allowances: "", deductions: "", effectiveFrom: dayjs().format("YYYY-MM-DD") }); setIsSalaryOpen(true); }}
                    >
                      Set salary structure
                    </Button>
                  </Paper>
                ) : (
                  <Paper
                    elevation={0}
                    sx={{ p: 4, border: "1px solid", borderColor: "divider", textAlign: "center" }}
                  >
                    <Typography variant="subtitle1" fontWeight={700}>Select an employee</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Choose an employee above to view or configure their salary structure.
                    </Typography>
                  </Paper>
                )}
              </Stack>
            )}
          </Box>
        </Paper>
      </Stack>

      {/* Run Payroll Dialog */}
      <Dialog
        open={isRunPayrollOpen}
        onClose={() => !runState.loading && setIsRunPayrollOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Run payroll</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Month</InputLabel>
              <Select
                label="Month"
                value={payrollMonth}
                onChange={(e) => setPayrollMonth(Number(e.target.value))}
              >
                {MONTH_NAMES.map((name, i) => (
                  <MenuItem key={name} value={i + 1}>{name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Year"
              type="number"
              value={payrollYear}
              onChange={(e) => setPayrollYear(Number(e.target.value))}
              size="small"
              fullWidth
            />
            <Alert severity="info">
              This will generate payroll entries for all employees with a salary structure for {MONTH_NAMES[payrollMonth - 1]} {payrollYear}.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={() => setIsRunPayrollOpen(false)} disabled={runState.loading}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleRunPayroll} disabled={runState.loading}>
            Run payroll
          </Button>
        </DialogActions>
      </Dialog>

      {/* Salary Structure Dialog */}
      <Dialog
        open={isSalaryOpen}
        onClose={() => !salaryState.loading && setIsSalaryOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{salary ? "Update salary structure" : "Set salary structure"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
              <TextField
                label="Basic salary (৳) *"
                type="number"
                value={salaryForm.basicSalary}
                onChange={(e) => setSalaryForm((f) => ({ ...f, basicSalary: e.target.value }))}
                size="small"
                fullWidth
              />
              <TextField
                label="Allowances (৳)"
                type="number"
                value={salaryForm.allowances}
                onChange={(e) => setSalaryForm((f) => ({ ...f, allowances: e.target.value }))}
                size="small"
                fullWidth
              />
              <TextField
                label="Deductions (৳)"
                type="number"
                value={salaryForm.deductions}
                onChange={(e) => setSalaryForm((f) => ({ ...f, deductions: e.target.value }))}
                size="small"
                fullWidth
              />
              <TextField
                label="Effective from *"
                type="date"
                value={salaryForm.effectiveFrom}
                onChange={(e) => setSalaryForm((f) => ({ ...f, effectiveFrom: e.target.value }))}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            {salaryForm.basicSalary ? (
              <Alert severity="success">
                Net salary: ৳ {(
                  parseFloat(salaryForm.basicSalary || "0") +
                  parseFloat(salaryForm.allowances || "0") -
                  parseFloat(salaryForm.deductions || "0")
                ).toLocaleString()}
              </Alert>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={() => setIsSalaryOpen(false)} disabled={salaryState.loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSetSalary}
            disabled={salaryState.loading || !salaryForm.basicSalary || !selectedEmployeeId}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
