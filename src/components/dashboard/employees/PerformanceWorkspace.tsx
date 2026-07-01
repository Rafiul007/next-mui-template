"use client";

import { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { type Dayjs } from "dayjs";
import {
  AddRounded,
  StarRounded,
  RateReviewRounded,
  PeopleAltRounded,
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
  Paper,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { toast } from "react-hot-toast";
import type { RhfSelectOption, SearchSelectOption } from "@/components/form";
import {
  RhfDatePicker,
  RhfSearchSelect,
  RhfSelect,
  RhfTextField,
} from "@/components/form";
import { SummaryCard } from "@/components/ui";
import {
  GetEmployeesDocument,
  GetPerformanceDashboardDocument,
  GetUsersDocument,
  LaunchReviewCycleDocument,
  SubmitReviewDocument,
  type GetEmployeesQuery,
  type GetPerformanceDashboardQuery,
  type GetUsersQuery,
} from "@/graphql/generated";
import { getErrorMessage } from "@/lib/errors";
import { primaryGradient } from "@/theme/theme";

type DashboardRecord =
  GetPerformanceDashboardQuery["getPerformanceDashboard"][number];
type EmployeeRecord = GetEmployeesQuery["getEmployees"][number];
type UserRecord = NonNullable<GetUsersQuery["getUsers"][number]>;

const cycleTypeOptions: RhfSelectOption[] = [
  { label: "Quarterly", value: "quarterly" },
  { label: "Mid-year", value: "mid-year" },
  { label: "Annual", value: "annual" },
];

const reviewerTypeOptions: RhfSelectOption[] = [
  { label: "Manager", value: "manager" },
  { label: "Peer", value: "peer" },
  { label: "Self", value: "self" },
];

const launchCycleSchema = yup
  .object({
    name: yup.string().trim().required("Cycle name is required"),
    cycleType: yup.string().required("Cycle type is required"),
    year: yup
      .number()
      .typeError("Year must be a number")
      .min(2020, "Year must be 2020 or later")
      .max(2100)
      .integer()
      .required("Year is required"),
    submissionDeadline: yup
      .mixed<Dayjs>()
      .nullable()
      .required("Submission deadline is required"),
  })
  .required();

type LaunchCycleValues = yup.InferType<typeof launchCycleSchema>;

const submitReviewSchema = yup
  .object({
    revieweeId: yup.string().required("Reviewee is required"),
    reviewerId: yup.string().required("Reviewer is required"),
    reviewerType: yup.string().required("Reviewer type is required"),
    overallScore: yup
      .number()
      .typeError("Score must be a number")
      .min(1, "Score must be at least 1")
      .max(10, "Score must be at most 10")
      .integer("Score must be a whole number")
      .required("Score is required"),
    comments: yup.string().trim().default(""),
  })
  .required();

type SubmitReviewValues = yup.InferType<typeof submitReviewSchema>;

const formatPersonName = (user: UserRecord) =>
  `${user.firstName} ${user.lastName ?? ""}`.trim() || user.email;

const buildDashboardColumns = ({
  userLookup,
  employeeLookup,
  onSubmitReview,
}: {
  userLookup: Map<string, string>;
  employeeLookup: Map<string, EmployeeRecord>;
  onSubmitReview: (revieweeId: string) => void;
}): MRT_ColumnDef<DashboardRecord>[] => [
  {
    id: "employee",
    accessorFn: (row) => {
      const emp = employeeLookup.get(row.revieweeId);
      return emp?.userId ? (userLookup.get(emp.userId) ?? "—") : "—";
    },
    header: "Employee",
    size: 200,
    Cell: ({ cell }) => (
      <Typography variant="body2" fontWeight={600}>
        {String(cell.getValue())}
      </Typography>
    ),
  },
  {
    accessorKey: "averageScore",
    header: "Avg score",
    size: 120,
    Cell: ({ cell }) => {
      const score = cell.getValue<number>();
      const color =
        score >= 8 ? "#1d4ed8" : score >= 5 ? "#0369a1" : "#b91c1c";
      return (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <StarRounded sx={{ fontSize: 16, color }} />
          <Typography variant="body2" fontWeight={700} sx={{ color }}>
            {score.toFixed(1)} / 10
          </Typography>
        </Stack>
      );
    },
  },
  {
    accessorKey: "reviewCount",
    header: "Reviews",
    size: 100,
    Cell: ({ cell }) => (
      <Typography variant="body2">{String(cell.getValue())}</Typography>
    ),
  },
  {
    id: "reviewerTypes",
    accessorFn: (row) => row.reviewerTypes.join(", "),
    header: "Reviewer types",
    size: 180,
    Cell: ({ row }) => (
      <Stack direction="row" spacing={0.5} flexWrap="wrap">
        {row.original.reviewerTypes.map((type) => (
          <Chip key={type} label={type} size="small" variant="outlined" />
        ))}
      </Stack>
    ),
  },
  {
    id: "submit",
    header: "Action",
    size: 120,
    enableColumnFilter: false,
    enableSorting: false,
    Cell: ({ row }) => (
      <Tooltip title="Submit review">
        <Button
          size="small"
          variant="outlined"
          startIcon={<RateReviewRounded />}
          onClick={() => onSubmitReview(row.original.revieweeId)}
        >
          Review
        </Button>
      </Tooltip>
    ),
  },
];

export function PerformanceWorkspace() {
  const [isCycleDialogOpen, setIsCycleDialogOpen] = useState(false);
  const [cycleDialogKey, setCycleDialogKey] = useState(0);
  const [cycleErrorMessage, setCycleErrorMessage] = useState<string | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewDialogKey, setReviewDialogKey] = useState(0);
  const [reviewErrorMessage, setReviewErrorMessage] = useState<string | null>(null);
  const [selectedCycleId, setSelectedCycleId] = useState<string>("");
  const [prefilledRevieweeId, setPrefilledRevieweeId] = useState<string>("");

  const { data: usersData } = useQuery(GetUsersDocument, {
    variables: { page: 1, limit: 500 },
  });
  const { data: employeesData } = useQuery(GetEmployeesDocument);
  const {
    data: dashboardData,
    loading: isDashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useQuery(GetPerformanceDashboardDocument, {
    skip: !selectedCycleId,
    variables: { cycleId: selectedCycleId },
    fetchPolicy: "cache-and-network",
  });

  const [launchReviewCycle, launchState] = useMutation(LaunchReviewCycleDocument);
  const [submitReview, submitState] = useMutation(SubmitReviewDocument);

  const employees = employeesData?.getEmployees ?? [];
  const users = (usersData?.getUsers ?? []).filter(
    (u): u is UserRecord => !!u,
  );
  const dashboardRecords = dashboardData?.getPerformanceDashboard ?? [];

  const userLookup = new Map(users.map((u) => [u.id, formatPersonName(u)]));
  const employeeLookup = new Map(employees.map((e) => [e.id, e]));

  const employeeOptions: SearchSelectOption[] = employees.map((e) => {
    const name = e.userId
      ? (userLookup.get(e.userId) ?? e.employeeCode)
      : e.employeeCode;
    return { value: e.id, label: name, keywords: e.employeeCode };
  });

  const totalReviewed = dashboardRecords.length;
  const avgScore =
    totalReviewed > 0
      ? dashboardRecords.reduce((sum, r) => sum + r.averageScore, 0) /
        totalReviewed
      : 0;
  const topPerformers = dashboardRecords.filter(
    (r) => r.averageScore >= 8,
  ).length;

  const {
    control: cycleControl,
    handleSubmit: handleCycleSubmit,
    reset: resetCycleForm,
  } = useForm<LaunchCycleValues, unknown, LaunchCycleValues>({
    resolver: yupResolver(launchCycleSchema) as never,
    defaultValues: {
      name: "",
      cycleType: "",
      year: new Date().getFullYear(),
      submissionDeadline: null as unknown as Dayjs,
    },
    mode: "onTouched",
  });

  const {
    control: reviewControl,
    handleSubmit: handleReviewSubmit,
    reset: resetReviewForm,
    setValue: setReviewValue,
  } = useForm<SubmitReviewValues, unknown, SubmitReviewValues>({
    resolver: yupResolver(submitReviewSchema) as never,
    defaultValues: {
      revieweeId: "",
      reviewerId: "",
      reviewerType: "",
      overallScore: undefined as unknown as number,
      comments: "",
    },
    mode: "onTouched",
  });

  const openCycleDialog = () => {
    resetCycleForm();
    setCycleErrorMessage(null);
    setCycleDialogKey((k) => k + 1);
    setIsCycleDialogOpen(true);
  };

  const openReviewDialog = (revieweeId?: string) => {
    resetReviewForm();
    if (revieweeId) setReviewValue("revieweeId", revieweeId);
    setReviewErrorMessage(null);
    setReviewDialogKey((k) => k + 1);
    setIsReviewDialogOpen(true);
  };

  const handleLaunchCycle = async (values: LaunchCycleValues) => {
    setCycleErrorMessage(null);
    try {
      const result = await launchReviewCycle({
        variables: {
          input: {
            name: values.name.trim(),
            cycleType: values.cycleType.toUpperCase().replace(/-/g, "_"),
            year: values.year,
            submissionDeadline: values.submissionDeadline!.format("YYYY-MM-DD"),
          },
        },
      });
      if (result.error) throw result.error;
      const newCycleId = result.data?.launchReviewCycle?.id;
      if (newCycleId) setSelectedCycleId(newCycleId);
      toast.success("Review cycle launched.");
      setIsCycleDialogOpen(false);
    } catch (error) {
      const message = getErrorMessage(error, "Unable to launch review cycle.");
      setCycleErrorMessage(message);
      toast.error(message);
    }
  };

  const handleSubmitReview = async (values: SubmitReviewValues) => {
    if (!selectedCycleId) {
      setReviewErrorMessage("Please select or launch a review cycle first.");
      return;
    }
    setReviewErrorMessage(null);
    try {
      const result = await submitReview({
        variables: {
          input: {
            cycleId: selectedCycleId,
            revieweeId: values.revieweeId,
            reviewerId: values.reviewerId,
            reviewerType: values.reviewerType.toUpperCase(),
            overallScore: values.overallScore,
            comments: values.comments?.trim() || undefined,
          },
        },
      });
      if (result.error) throw result.error;
      await refetchDashboard();
      toast.success("Review submitted.");
      setIsReviewDialogOpen(false);
    } catch (error) {
      const message = getErrorMessage(error, "Unable to submit review.");
      setReviewErrorMessage(message);
      toast.error(message);
    }
  };

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
                Performance reviews
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Launch review cycles, submit peer/manager reviews, and track scores.
              </Typography>
            </Box>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Button
                variant="outlined"
                startIcon={<RateReviewRounded />}
                onClick={() => openReviewDialog()}
                disabled={!selectedCycleId}
                sx={{ whiteSpace: "nowrap" }}
              >
                Submit review
              </Button>
              <Button
                variant="contained"
                startIcon={<AddRounded />}
                onClick={openCycleDialog}
                sx={{ backgroundColor: primaryGradient, whiteSpace: "nowrap" }}
              >
                Launch cycle
              </Button>
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
              xl: "repeat(3, minmax(0, 1fr))",
            },
          }}
        >
          <SummaryCard
            caption="Employees reviewed"
            title={String(totalReviewed)}
            icon={<PeopleAltRounded />}
          />
          <SummaryCard
            caption="Average score"
            title={avgScore > 0 ? `${avgScore.toFixed(1)} / 10` : "—"}
            icon={<StarRounded />}
            tone="success"
          />
          <SummaryCard
            caption="Top performers (≥ 8)"
            title={String(topPerformers)}
            icon={<StarRounded />}
            tone="default"
          />
        </Box>

        {dashboardError ? (
          <Alert severity="error">
            {dashboardError.message || "Unable to load performance data."}
          </Alert>
        ) : null}

        {!selectedCycleId ? (
          <Paper
            elevation={0}
            sx={{ p: 4, border: "1px solid", borderColor: "divider", textAlign: "center" }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              No review cycle selected
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
              Launch a new review cycle or enter a cycle ID to view the performance dashboard.
            </Typography>
            <Button variant="contained" onClick={openCycleDialog} sx={{ backgroundColor: primaryGradient }}>
              Launch review cycle
            </Button>
          </Paper>
        ) : (
          <MaterialReactTable
            columns={buildDashboardColumns({
              userLookup,
              employeeLookup,
              onSubmitReview: (revieweeId) => openReviewDialog(revieweeId),
            })}
            data={dashboardRecords}
            enableColumnFilters={false}
            enableDensityToggle={false}
            enableFullScreenToggle={false}
            enableHiding={false}
            enableRowActions={false}
            enableSorting
            enableStickyHeader
            getRowId={(row) => row.revieweeId}
            initialState={{
              pagination: { pageIndex: 0, pageSize: 10 },
              sorting: [{ id: "averageScore", desc: true }],
            }}
            localization={{ noRecordsToDisplay: "No reviews submitted yet" }}
            muiTableBodyRowProps={{
              sx: {
                bgcolor: "#ffffff",
                transition: "background-color 140ms ease",
                "&:hover td": { bgcolor: alpha("#eff6ff", 0.9) },
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
            muiBottomToolbarProps={{
              sx: {
                borderTop: "1px solid",
                borderColor: alpha("#0f172a", 0.08),
                bgcolor: "#ffffff",
              },
            }}
            state={{ isLoading: isDashboardLoading && dashboardRecords.length === 0 }}
          />
        )}
      </Stack>

      {/* Launch review cycle dialog */}
      <Dialog
        key={cycleDialogKey}
        open={isCycleDialogOpen}
        onClose={launchState.loading ? undefined : () => setIsCycleDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Launch review cycle</DialogTitle>
        <Box
          component="form"
          onSubmit={handleCycleSubmit(handleLaunchCycle)}
          noValidate
        >
          <DialogContent dividers>
            <Stack spacing={2.5}>
              {cycleErrorMessage ? (
                <Alert severity="error">{cycleErrorMessage}</Alert>
              ) : null}
              <RhfTextField
                control={cycleControl}
                name="name"
                label="Cycle name *"
                placeholder="e.g. Q2 2026 Review"
                trim
              />
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                }}
              >
                <RhfSelect
                  control={cycleControl}
                  name="cycleType"
                  label="Cycle type *"
                  options={cycleTypeOptions}
                  placeholder="Select type"
                />
                <RhfTextField
                  control={cycleControl}
                  name="year"
                  label="Year *"
                  type="number"
                />
              </Box>
              <RhfDatePicker
                control={cycleControl}
                name="submissionDeadline"
                label="Submission deadline *"
                textFieldProps={{ fullWidth: true }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              color="inherit"
              onClick={() => setIsCycleDialogOpen(false)}
              disabled={launchState.loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={launchState.loading}
            >
              Launch
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Submit review dialog */}
      <Dialog
        key={reviewDialogKey}
        open={isReviewDialogOpen}
        onClose={submitState.loading ? undefined : () => setIsReviewDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Submit performance review</DialogTitle>
        <Box
          component="form"
          onSubmit={handleReviewSubmit(handleSubmitReview)}
          noValidate
        >
          <DialogContent dividers>
            <Stack spacing={2.5}>
              {reviewErrorMessage ? (
                <Alert severity="error">{reviewErrorMessage}</Alert>
              ) : null}
              <RhfSearchSelect
                control={reviewControl}
                name="revieweeId"
                label="Reviewee (employee being reviewed) *"
                options={employeeOptions}
                placeholder="Search by name or code…"
              />
              <Divider />
              <RhfSearchSelect
                control={reviewControl}
                name="reviewerId"
                label="Reviewer *"
                options={employeeOptions}
                placeholder="Search by name or code…"
              />
              <RhfSelect
                control={reviewControl}
                name="reviewerType"
                label="Reviewer type *"
                options={reviewerTypeOptions}
                placeholder="Select type"
              />
              <RhfTextField
                control={reviewControl}
                name="overallScore"
                label="Overall score (1–10) *"
                type="number"
                helperText="Enter a whole number between 1 and 10"
              />
              <RhfTextField
                control={reviewControl}
                name="comments"
                label="Comments"
                multiline
                rows={3}
                trim
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              color="inherit"
              onClick={() => setIsReviewDialogOpen(false)}
              disabled={submitState.loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitState.loading}
            >
              Submit review
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}
