"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  AddRounded,
  WorkRounded,
  PeopleRounded,
  CheckCircleRounded,
  EventRounded,
  HowToRegRounded,
  DescriptionRounded,
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
  Tab,
  Tabs,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import { toast } from "react-hot-toast";
import { RhfTextField, RhfSelect, type RhfSelectOption } from "@/components/form";
import { SummaryCard } from "@/components/ui";
import { getErrorMessage } from "@/lib/errors";
import { primaryGradient } from "@/theme/theme";
import {
  GetVacanciesDocument,
  GetApplicationsByVacancyDocument,
  PostVacancyDocument,
  ScheduleInterviewDocument,
  ReviewApplicationDocument,
  HireApplicantDocument,
  GenerateOfferLetterDocument,
  type GetVacanciesQuery,
  type GetApplicationsByVacancyQuery,
} from "@/graphql/hr-extended";

type Vacancy = GetVacanciesQuery["getVacancies"][number];
type Application = GetApplicationsByVacancyQuery["getApplicationsByVacancy"][number];

const jobTypeOptions: RhfSelectOption[] = [
  { label: "Full-time", value: "full_time" },
  { label: "Part-time", value: "part_time" },
  { label: "Contract", value: "contract" },
  { label: "Internship", value: "internship" },
];

const reviewStatusOptions = [
  { label: "Shortlisted", value: "shortlisted" },
  { label: "Rejected", value: "rejected" },
  { label: "On hold", value: "on_hold" },
];

const vacancySchema = yup
  .object({
    title: yup.string().trim().required("Title is required"),
    department: yup.string().trim().required("Department is required"),
    jobType: yup.string().required("Job type is required"),
    noOfPositions: yup
      .number()
      .typeError("Must be a number")
      .min(1)
      .integer()
      .required("Number of positions is required"),
    requiredExperience: yup
      .number()
      .typeError("Must be a number")
      .min(0)
      .integer()
      .nullable()
      .default(null),
    requiredQualification: yup.string().trim().default(""),
    description: yup.string().trim().default(""),
  })
  .required();

type VacancyFormValues = yup.InferType<typeof vacancySchema>;

const STATUS_COLOR: Record<string, "default" | "primary" | "success" | "error" | "warning"> = {
  open: "success",
  closed: "default",
  pending: "warning",
  applied: "primary",
  shortlisted: "primary",
  rejected: "error",
  on_hold: "warning",
  hired: "success",
  interviewed: "warning",
};

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

export function RecruitmentWorkspace() {
  const [tab, setTab] = useState(0);
  const [selectedVacancyId, setSelectedVacancyId] = useState<string>("");
  const [dialogKey, setDialogKey] = useState(0);

  // Vacancy dialog
  const [isVacancyDialogOpen, setIsVacancyDialogOpen] = useState(false);
  const [vacancyError, setVacancyError] = useState<string | null>(null);

  // Schedule interview dialog
  const [interviewTarget, setInterviewTarget] = useState<Application | null>(null);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewError, setInterviewError] = useState<string | null>(null);

  // Review dialog
  const [reviewTarget, setReviewTarget] = useState<Application | null>(null);
  const [reviewStatus, setReviewStatus] = useState("shortlisted");
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Hire dialog
  const [hireTarget, setHireTarget] = useState<Application | null>(null);
  const [hireForm, setHireForm] = useState({ branchId: "", department: "", designation: "", joiningDate: "" });
  const [hireError, setHireError] = useState<string | null>(null);

  const { data: vacanciesData, refetch: refetchVacancies } = useQuery(GetVacanciesDocument, {
    fetchPolicy: "cache-and-network",
  });
  const vacancies = vacanciesData?.getVacancies ?? [];

  const { data: applicationsData, refetch: refetchApplications } = useQuery(
    GetApplicationsByVacancyDocument,
    {
      variables: { vacancyId: selectedVacancyId },
      skip: !selectedVacancyId,
      fetchPolicy: "cache-and-network",
    },
  );
  const applications = applicationsData?.getApplicationsByVacancy ?? [];

  const [postVacancy, postVacancyState] = useMutation(PostVacancyDocument);
  const [scheduleInterview, scheduleInterviewState] = useMutation(ScheduleInterviewDocument);
  const [reviewApplication, reviewApplicationState] = useMutation(ReviewApplicationDocument);
  const [hireApplicant, hireApplicantState] = useMutation(HireApplicantDocument);
  const [generateOfferLetter, offerLetterState] = useMutation(
    GenerateOfferLetterDocument,
  );

  // Offer letter result: a URL is opened directly; raw text is shown in a dialog.
  const [offerLetterText, setOfferLetterText] = useState<string | null>(null);

  const handleGenerateOffer = async (application: Application) => {
    try {
      const res = await generateOfferLetter({
        variables: { applicationId: application.id },
      });
      const result = res.data?.generateOfferLetter;
      if (!result) {
        toast.error("No offer letter was returned.");
        return;
      }
      if (/^(https?:)?\//i.test(result)) {
        window.open(result, "_blank", "noopener");
      } else {
        setOfferLetterText(result);
      }
      toast.success("Offer letter generated.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to generate offer letter."));
    }
  };

  const { control, handleSubmit, reset } = useForm<VacancyFormValues>({
    resolver: yupResolver(vacancySchema),
    defaultValues: {
      title: "",
      department: "",
      jobType: "",
      noOfPositions: 1,
      requiredExperience: null,
      requiredQualification: "",
      description: "",
    },
    mode: "onTouched",
  });

  const openVacancyDialog = () => {
    reset();
    setVacancyError(null);
    setDialogKey((k) => k + 1);
    setIsVacancyDialogOpen(true);
  };

  const closeVacancyDialog = () => {
    if (!postVacancyState.loading) {
      setIsVacancyDialogOpen(false);
      setVacancyError(null);
    }
  };

  const handlePostVacancy = async (values: VacancyFormValues) => {
    setVacancyError(null);
    try {
      await postVacancy({
        variables: {
          input: {
            title: values.title.trim(),
            department: values.department.trim(),
            jobType: values.jobType,
            noOfPositions: values.noOfPositions,
            requiredExperience: values.requiredExperience ?? undefined,
            requiredQualification: values.requiredQualification?.trim() || undefined,
            description: values.description?.trim() || undefined,
          },
        },
      });
      await refetchVacancies();
      toast.success(`Vacancy "${values.title}" posted.`);
      closeVacancyDialog();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to post vacancy.");
      setVacancyError(message);
      toast.error(message);
    }
  };

  const handleScheduleInterview = async () => {
    if (!interviewTarget || !interviewDate) return;
    setInterviewError(null);
    try {
      await scheduleInterview({
        variables: { applicationId: interviewTarget.id, interviewDate },
      });
      await refetchApplications();
      toast.success(`Interview scheduled for ${interviewTarget.applicantName}.`);
      setInterviewTarget(null);
      setInterviewDate("");
    } catch (error) {
      const message = getErrorMessage(error, "Unable to schedule interview.");
      setInterviewError(message);
      toast.error(message);
    }
  };

  const handleReview = async () => {
    if (!reviewTarget) return;
    setReviewError(null);
    try {
      await reviewApplication({
        variables: { applicationId: reviewTarget.id, status: reviewStatus },
      });
      await refetchApplications();
      toast.success(`Application status updated to "${reviewStatus}".`);
      setReviewTarget(null);
    } catch (error) {
      const message = getErrorMessage(error, "Unable to update application status.");
      setReviewError(message);
      toast.error(message);
    }
  };

  const handleHire = async () => {
    if (!hireTarget) return;
    setHireError(null);
    if (!hireForm.branchId || !hireForm.department || !hireForm.designation || !hireForm.joiningDate) {
      setHireError("All fields are required.");
      return;
    }
    try {
      await hireApplicant({
        variables: {
          input: {
            applicationId: hireTarget.id,
            branchId: hireForm.branchId,
            department: hireForm.department,
            designation: hireForm.designation,
            joiningDate: hireForm.joiningDate,
          },
        },
      });
      await refetchApplications();
      await refetchVacancies();
      toast.success(`${hireTarget.applicantName} hired successfully.`);
      setHireTarget(null);
      setHireForm({ branchId: "", department: "", designation: "", joiningDate: "" });
    } catch (error) {
      const message = getErrorMessage(error, "Unable to hire applicant.");
      setHireError(message);
      toast.error(message);
    }
  };

  const openVacancies = vacancies.filter((v) => v.status === "open").length;
  const totalApplications = applications.length;
  const hiredCount = applications.filter((a) => a.status === "hired").length;

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
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(240,253,250,0.98) 100%)",
          }}
        >
          <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" spacing={3}>
            <Box sx={{ maxWidth: 760 }}>
              <Typography variant="h4" component="h1" sx={{ mt: 0.5 }}>
                Recruitment
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Post job vacancies, manage applications, schedule interviews, and hire staff.
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: { xs: "stretch", lg: "flex-end" },
                minWidth: { lg: 220 },
              }}
            >
              <Button
                variant="contained"
                startIcon={<AddRounded />}
                onClick={openVacancyDialog}
                fullWidth
                sx={{ maxWidth: { xs: "100%", lg: 220 }, backgroundColor: primaryGradient }}
              >
                Post vacancy
              </Button>
            </Box>
          </Stack>
        </Paper>

        {/* Summary cards */}
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
            caption="Total vacancies"
            title={String(vacancies.length)}
            icon={<WorkRounded />}
          />
          <SummaryCard
            caption="Open positions"
            title={String(openVacancies)}
            icon={<CheckCircleRounded />}
            tone="success"
          />
          <SummaryCard
            caption="Applications"
            title={String(totalApplications)}
            icon={<PeopleRounded />}
            tone="default"
          />
        </Box>

        {/* Tabs */}
        <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{ px: 2, borderBottom: "1px solid", borderColor: "divider" }}
          >
            <Tab label="Vacancies" />
            <Tab label="Applications" />
          </Tabs>

          <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* Vacancies tab */}
            <TabPanel value={tab} index={0}>
              {vacancies.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <WorkRounded sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
                  <Typography variant="h6">No vacancies posted yet</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                    Post your first vacancy to start receiving applications.
                  </Typography>
                  <Button variant="contained" startIcon={<AddRounded />} onClick={openVacancyDialog}>
                    Post vacancy
                  </Button>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "repeat(2, minmax(0,1fr))",
                      xl: "repeat(3, minmax(0,1fr))",
                    },
                  }}
                >
                  {vacancies.map((vacancy) => (
                    <VacancyCard
                      key={vacancy.id}
                      vacancy={vacancy}
                      onViewApplications={(id) => {
                        setSelectedVacancyId(id);
                        setTab(1);
                      }}
                    />
                  ))}
                </Box>
              )}
            </TabPanel>

            {/* Applications tab */}
            <TabPanel value={tab} index={1}>
              <Stack spacing={2}>
                <FormControl size="small" sx={{ maxWidth: 360 }}>
                  <InputLabel>Select vacancy</InputLabel>
                  <Select
                    value={selectedVacancyId}
                    label="Select vacancy"
                    onChange={(e) => setSelectedVacancyId(e.target.value)}
                  >
                    {vacancies.map((v) => (
                      <MenuItem key={v.id} value={v.id}>
                        {v.title} — {v.department}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {!selectedVacancyId ? (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Select a vacancy to view its applications.
                    </Typography>
                  </Box>
                ) : applications.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <PeopleRounded sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      No applications for this vacancy yet.
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={1.5}>
                    {applications.map((app) => (
                      <ApplicationRow
                        key={app.id}
                        application={app}
                        onScheduleInterview={() => {
                          setInterviewTarget(app);
                          setInterviewDate(app.interviewDate ?? "");
                          setInterviewError(null);
                        }}
                        onReview={() => {
                          setReviewTarget(app);
                          setReviewStatus("shortlisted");
                          setReviewError(null);
                        }}
                        onHire={() => {
                          setHireTarget(app);
                          setHireForm({ branchId: "", department: "", designation: "", joiningDate: "" });
                          setHireError(null);
                        }}
                        onGenerateOffer={() => handleGenerateOffer(app)}
                        offerLoading={offerLetterState.loading}
                      />
                    ))}
                  </Stack>
                )}
              </Stack>
            </TabPanel>
          </Box>
        </Paper>
      </Stack>

      {/* Post vacancy dialog */}
      <Dialog
        key={dialogKey}
        open={isVacancyDialogOpen}
        onClose={postVacancyState.loading ? undefined : closeVacancyDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Post a vacancy</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(handlePostVacancy)} noValidate>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              {vacancyError ? <Alert severity="error">{vacancyError}</Alert> : null}

              <RhfTextField control={control} name="title" label="Job title *" trim />

              <RhfTextField control={control} name="department" label="Department *" trim />

              <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
                <RhfSelect
                  control={control}
                  name="jobType"
                  label="Job type *"
                  options={jobTypeOptions}
                />
                <RhfTextField
                  control={control}
                  name="noOfPositions"
                  label="Positions *"
                  type="number"
                  helperText="Number of openings"
                />
              </Box>

              <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
                <RhfTextField
                  control={control}
                  name="requiredExperience"
                  label="Experience (years)"
                  type="number"
                  helperText="Leave blank if not required"
                />
                <RhfTextField
                  control={control}
                  name="requiredQualification"
                  label="Qualification"
                  trim
                  helperText="e.g. Bachelor's degree"
                />
              </Box>

              <RhfTextField
                control={control}
                name="description"
                label="Job description"
                multiline
                rows={3}
                trim
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button color="inherit" onClick={closeVacancyDialog} disabled={postVacancyState.loading}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={postVacancyState.loading}>
              Post vacancy
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Schedule interview dialog */}
      <Dialog
        open={!!interviewTarget}
        onClose={scheduleInterviewState.loading ? undefined : () => setInterviewTarget(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Schedule interview</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {interviewError ? <Alert severity="error">{interviewError}</Alert> : null}
            <Typography variant="body2" color="text.secondary">
              Applicant: <strong>{interviewTarget?.applicantName}</strong>
            </Typography>
            <TextField
              label="Interview date & time *"
              type="datetime-local"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            color="inherit"
            onClick={() => setInterviewTarget(null)}
            disabled={scheduleInterviewState.loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleScheduleInterview}
            disabled={scheduleInterviewState.loading || !interviewDate}
            startIcon={<EventRounded />}
          >
            Schedule
          </Button>
        </DialogActions>
      </Dialog>

      {/* Review application dialog */}
      <Dialog
        open={!!reviewTarget}
        onClose={reviewApplicationState.loading ? undefined : () => setReviewTarget(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Update application status</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {reviewError ? <Alert severity="error">{reviewError}</Alert> : null}
            <Typography variant="body2" color="text.secondary">
              Applicant: <strong>{reviewTarget?.applicantName}</strong>
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={reviewStatus}
                label="Status"
                onChange={(e) => setReviewStatus(e.target.value)}
              >
                {reviewStatusOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            color="inherit"
            onClick={() => setReviewTarget(null)}
            disabled={reviewApplicationState.loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleReview}
            disabled={reviewApplicationState.loading}
          >
            Update status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hire applicant dialog */}
      <Dialog
        open={!!hireTarget}
        onClose={hireApplicantState.loading ? undefined : () => setHireTarget(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Hire applicant</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {hireError ? <Alert severity="error">{hireError}</Alert> : null}
            <Typography variant="body2" color="text.secondary">
              You are about to create an employee record for{" "}
              <strong>{hireTarget?.applicantName}</strong>.
            </Typography>
            <TextField
              label="Branch ID *"
              value={hireForm.branchId}
              onChange={(e) => setHireForm((f) => ({ ...f, branchId: e.target.value }))}
              size="small"
              fullWidth
              helperText="Enter the branch ID to assign this employee to"
            />
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "1fr 1fr" }}>
              <TextField
                label="Department *"
                value={hireForm.department}
                onChange={(e) => setHireForm((f) => ({ ...f, department: e.target.value }))}
                size="small"
                fullWidth
              />
              <TextField
                label="Designation *"
                value={hireForm.designation}
                onChange={(e) => setHireForm((f) => ({ ...f, designation: e.target.value }))}
                size="small"
                fullWidth
              />
            </Box>
            <TextField
              label="Joining date *"
              type="date"
              value={hireForm.joiningDate}
              onChange={(e) => setHireForm((f) => ({ ...f, joiningDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            color="inherit"
            onClick={() => setHireTarget(null)}
            disabled={hireApplicantState.loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleHire}
            disabled={hireApplicantState.loading}
            startIcon={<HowToRegRounded />}
          >
            Hire
          </Button>
        </DialogActions>
      </Dialog>

      {/* Offer letter (raw text) dialog */}
      <Dialog
        open={!!offerLetterText}
        onClose={() => setOfferLetterText(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Offer letter</DialogTitle>
        <DialogContent dividers>
          <Box
            component="pre"
            sx={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontFamily: "inherit",
              fontSize: 14,
              lineHeight: 1.7,
              m: 0,
            }}
          >
            {offerLetterText}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            color="inherit"
            onClick={() => {
              if (offerLetterText) {
                void navigator.clipboard?.writeText(offerLetterText);
                toast.success("Copied to clipboard.");
              }
            }}
          >
            Copy
          </Button>
          <Button variant="contained" onClick={() => setOfferLetterText(null)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function VacancyCard({
  vacancy,
  onViewApplications,
}: {
  vacancy: Vacancy;
  onViewApplications: (id: string) => void;
}) {
  const statusColor = STATUS_COLOR[vacancy.status] ?? "default";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: "1px solid",
        borderColor: alpha("#0f172a", 0.08),
        borderRadius: 2,
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={700} noWrap>
              {vacancy.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {vacancy.department}
            </Typography>
          </Box>
          <Chip label={vacancy.status} size="small" color={statusColor} sx={{ ml: 1, flexShrink: 0 }} />
        </Stack>

        <Divider />

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Job type
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {vacancy.jobType.replace("_", " ")}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Positions
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {vacancy.noOfPositions}
            </Typography>
          </Box>
          {vacancy.requiredExperience != null && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Experience
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {vacancy.requiredExperience} yr{vacancy.requiredExperience !== 1 ? "s" : ""}
              </Typography>
            </Box>
          )}
          {vacancy.requiredQualification && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Qualification
              </Typography>
              <Typography variant="body2" fontWeight={600} noWrap>
                {vacancy.requiredQualification}
              </Typography>
            </Box>
          )}
        </Box>

        <Button
          size="small"
          variant="outlined"
          startIcon={<PeopleRounded />}
          onClick={() => onViewApplications(vacancy.id)}
          fullWidth
        >
          View applications
        </Button>
      </Stack>
    </Paper>
  );
}

function ApplicationRow({
  application,
  onScheduleInterview,
  onReview,
  onHire,
  onGenerateOffer,
  offerLoading,
}: {
  application: Application;
  onScheduleInterview: () => void;
  onReview: () => void;
  onHire: () => void;
  onGenerateOffer: () => void;
  offerLoading: boolean;
}) {
  const statusColor = STATUS_COLOR[application.status] ?? "default";
  const canHire = application.status === "shortlisted" || application.status === "interviewed";
  const canOffer =
    application.status === "hired" ||
    application.status === "shortlisted" ||
    application.status === "interviewed";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: "1px solid",
        borderColor: alpha("#0f172a", 0.08),
        borderRadius: 2,
      }}
    >
      <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} spacing={2}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <Typography variant="subtitle2" fontWeight={700}>
              {application.applicantName}
            </Typography>
            <Chip label={application.status} size="small" color={statusColor} />
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {application.applicantEmail} · {application.applicantPhone}
          </Typography>
          {application.interviewDate && (
            <Typography variant="caption" color="text.secondary" display="block">
              Interview: {new Date(application.interviewDate).toLocaleString()}
            </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={1} flexShrink={0} flexWrap="wrap">
          <Button
            size="small"
            variant="outlined"
            startIcon={<EventRounded />}
            onClick={onScheduleInterview}
            disabled={application.status === "hired" || application.status === "rejected"}
          >
            Interview
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={onReview}
            disabled={application.status === "hired"}
          >
            Review
          </Button>
          {canHire && (
            <Button
              size="small"
              variant="contained"
              color="success"
              startIcon={<HowToRegRounded />}
              onClick={onHire}
            >
              Hire
            </Button>
          )}
          {canOffer && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<DescriptionRounded />}
              onClick={onGenerateOffer}
              disabled={offerLoading}
            >
              Offer letter
            </Button>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}
