"use client";

import { useState, type ReactNode } from "react";
import {
  AddRounded,
  BlockRounded,
  CheckCircleRounded,
  EditRounded,
  EmojiEventsRounded,
  GroupsRounded,
  PersonAddRounded,
  SchoolRounded,
  StickyNote2Rounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { useMutation, useQuery } from "@apollo/client/react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { toast } from "react-hot-toast";
import { primaryGradient } from "@/theme/theme";
import { getErrorMessage } from "@/lib/errors";
import {
  AdmitStudentDocument,
  AddGuardianDocument,
  ChangeStudentStatusDocument,
  GetAllBatchesDocument,
  GetStudentsDocument,
  UpdateStudentDocument,
  type GetAllBatchesQuery,
  type GetStudentsQuery,
} from "@/graphql/generated";
import {
  AdmissionFormDialog,
  emptyAdmissionFormValues,
  type AdmissionFormValues,
  type BatchSummary,
  type PaymentEntry,
  type QualificationEntry,
} from "./AdmissionFormDialog";

// ── Types ────────────────────────────────────────────────────────────────────

type AdmissionStatus = "active" | "graduated" | "withdrawn" | "suspended";
type Gender = "male" | "female" | "other";

type QualificationRecord = {
  id: string;
  institution: string;
  exam: string;
  gradeGpa: string | null;
  passingYear: string | null;
  board: string | null;
};

type StudentRecord = {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  firstNameBangla: string;
  gender: Gender;
  bloodGroup: string;
  phone: string;
  email: string;
  classLevel: string;
  address: string;
  division: string;
  district: string;
  upazila: string;
  village: string;
  previousInstitution: string;
  previousResult: string;
  admissionSource: string;
  notes: string;
  status: AdmissionStatus;
  qualifications: QualificationRecord[];
};

type ApiStudent = GetStudentsQuery["getStudents"][number];
type ApiBatch = GetAllBatchesQuery["getAllBatches"][number];

// ── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<AdmissionStatus, string> = {
  active: "Active",
  graduated: "Graduated",
  withdrawn: "Withdrawn",
  suspended: "Suspended",
};

const STATUS_COLOR: Record<
  AdmissionStatus,
  "success" | "info" | "default" | "warning"
> = {
  active: "success",
  graduated: "info",
  withdrawn: "default",
  suspended: "warning",
};

const GENDER_LABEL: Record<Gender, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
};

// ── Mappers ──────────────────────────────────────────────────────────────────

const mapApiStudent = (s: ApiStudent): StudentRecord => ({
  id: s.id,
  studentId: s.studentCode,
  firstName: s.firstName,
  lastName: s.lastName ?? "",
  firstNameBangla: s.firstNameBangla ?? "",
  gender: (s.gender as Gender) ?? "other",
  bloodGroup: s.bloodGroup ?? "",
  phone: s.phone ?? "",
  email: s.email ?? "",
  classLevel: s.classLevel ?? "",
  address: s.address ?? "",
  division: s.division ?? "",
  district: s.district ?? "",
  upazila: s.upazila ?? "",
  village: s.village ?? "",
  previousInstitution: s.previousInstitution ?? "",
  previousResult: s.previousResult ?? "",
  admissionSource: s.admissionSource ?? "",
  notes: s.notes ?? "",
  status: (s.status as AdmissionStatus) ?? "active",
  qualifications: (s.qualifications ?? []).map((q) => ({
    id: q.id,
    institution: q.institution,
    exam: q.exam,
    gradeGpa: q.gradeGpa,
    passingYear: q.passingYear,
    board: q.board,
  })),
});

const mapApiBatchToSummary = (batch: ApiBatch): BatchSummary => {
  const activePlans = (batch.feePlans ?? []).filter((fp) => fp.isActive);
  const oneTimePayments: PaymentEntry[] = activePlans
    .filter((fp) => fp.frequency?.toUpperCase() !== "MONTHLY")
    .map((fp) => ({ name: fp.feeTypeName ?? fp.feeTypeId, amount: fp.amount }));
  const monthlyPayments: PaymentEntry[] = activePlans
    .filter((fp) => fp.frequency?.toUpperCase() === "MONTHLY")
    .map((fp) => ({ name: fp.feeTypeName ?? fp.feeTypeId, amount: fp.amount }));

  return {
    id: batch.id,
    displayName: batch.name,
    type: (batch.type ?? "course") as "course" | "class",
    status: batch.status.toLowerCase() as "upcoming" | "ongoing" | "completed" | "cancelled",
    totalSeats: batch.capacity,
    enrolledCount: batch.enrolledCount,
    oneTimePayments,
    monthlyPayments,
    discounts: [],
  };
};

const getFullName = (s: StudentRecord) =>
  `${s.firstName} ${s.lastName}`.trim();

const getStudentFormValues = (s: StudentRecord): AdmissionFormValues => ({
  firstName: s.firstName,
  lastName: s.lastName,
  firstNameBangla: s.firstNameBangla,
  dob: "",
  gender: s.gender,
  bloodGroup: s.bloodGroup,
  phone: s.phone,
  email: s.email,
  classLevel: s.classLevel,
  address: s.address,
  division: s.division,
  district: s.district,
  upazila: s.upazila,
  village: s.village,
  previousInstitution: s.previousInstitution,
  previousResult: s.previousResult,
  admissionSource: s.admissionSource,
  guardianName: "",
  guardianRelation: "",
  guardianPhone: "",
  guardianEmail: "",
  guardianOccupation: "",
  guardianNid: "",
  qualifications: [],
  appliedDiscountIndexes: [],
  batchId: "",
  notes: s.notes,
});

// ── Columns ──────────────────────────────────────────────────────────────────

const buildStudentColumns = (): MRT_ColumnDef<StudentRecord>[] => [
  {
    id: "student",
    accessorFn: getFullName,
    header: "Student",
    size: 260,
    Cell: ({ row }) => {
      const s = row.original;
      return (
        <Stack spacing={0.4}>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Typography variant="subtitle2" fontWeight={700}>
              {getFullName(s)}
            </Typography>
            {s.notes && (
              <Tooltip title={s.notes} placement="top" arrow>
                <StickyNote2Rounded sx={{ fontSize: 14, color: "#d97706", flexShrink: 0 }} />
              </Tooltip>
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {s.studentId}
          </Typography>
          {s.qualifications.length > 0 && (
            <Stack direction="row" spacing={0.4} flexWrap="wrap" useFlexGap>
              {s.qualifications.map((q) => (
                <Chip
                  key={q.id}
                  label={q.exam.replace(/_/g, " ").toUpperCase()}
                  size="small"
                  sx={{
                    height: 17,
                    fontSize: 10,
                    fontWeight: 700,
                    bgcolor: alpha("#8b5cf6", 0.1),
                    color: "#5b21b6",
                    "& .MuiChip-label": { px: 0.75 },
                  }}
                />
              ))}
            </Stack>
          )}
        </Stack>
      );
    },
  },
  {
    id: "gender",
    accessorFn: (row) => GENDER_LABEL[row.gender] ?? row.gender,
    header: "Gender",
    size: 100,
    filterVariant: "select",
    filterSelectOptions: ["Male", "Female", "Other"],
    Cell: ({ cell }) => (
      <Typography variant="body2">{String(cell.getValue())}</Typography>
    ),
  },
  {
    accessorKey: "phone",
    header: "Contact",
    size: 160,
    Cell: ({ row }) => (
      <Stack spacing={0.25}>
        <Typography variant="body2">{row.original.phone || "—"}</Typography>
        {row.original.email && (
          <Typography variant="caption" color="text.secondary" noWrap>
            {row.original.email}
          </Typography>
        )}
      </Stack>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 120,
    filterVariant: "select",
    filterSelectOptions: ["active", "graduated", "withdrawn", "suspended"],
    Cell: ({ cell }) => {
      const status = cell.getValue<AdmissionStatus>();
      return (
        <Chip
          label={STATUS_LABEL[status]}
          color={STATUS_COLOR[status]}
          size="small"
          variant={
            status === "withdrawn" || status === "graduated"
              ? "outlined"
              : "filled"
          }
        />
      );
    },
  },
];

// ── Summary card ─────────────────────────────────────────────────────────────

function SummaryCard({
  caption,
  icon,
  title,
  tone = "default",
}: {
  caption: string;
  icon: ReactNode;
  title: string;
  tone?: "default" | "success" | "info" | "muted";
}) {
  const borderColor =
    tone === "success"
      ? alpha("#10b981", 0.22)
      : tone === "info"
        ? alpha("#3b82f6", 0.22)
        : tone === "muted"
          ? alpha("#64748b", 0.16)
          : alpha("#0f172a", 0.08);

  const iconBg =
    tone === "success"
      ? alpha("#10b981", 0.12)
      : tone === "info"
        ? alpha("#3b82f6", 0.12)
        : alpha("#0f172a", 0.06);

  const iconColor =
    tone === "success"
      ? "#047857"
      : tone === "info"
        ? "#1d4ed8"
        : "#0f172a";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: "1px solid",
        borderColor,
        display: "grid",
        gap: 1.25,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          {caption}
        </Typography>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: iconBg,
            color: iconColor,
          }}
        >
          {icon}
        </Box>
      </Stack>
      <Typography variant="h5">{title}</Typography>
    </Paper>
  );
}

// ── Workspace ─────────────────────────────────────────────────────────────────

export function AdmissionsWorkspace() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [studentToWithdraw, setStudentToWithdraw] = useState<StudentRecord | null>(null);
  const [formDialogKey, setFormDialogKey] = useState(0);
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);

  const { data: studentsData, loading: studentsLoading, refetch: refetchStudents } =
    useQuery(GetStudentsDocument, { fetchPolicy: "cache-and-network" });

  const { data: batchesData } = useQuery(GetAllBatchesDocument, {
    fetchPolicy: "cache-and-network",
  });

  const [admitStudent, { loading: isAdmitting }] = useMutation(AdmitStudentDocument);
  const [addGuardian] = useMutation(AddGuardianDocument);
  const [updateStudent, { loading: isUpdating }] = useMutation(UpdateStudentDocument);
  const [changeStudentStatus, { loading: isWithdrawing }] = useMutation(
    ChangeStudentStatusDocument,
  );

  const students: StudentRecord[] = (studentsData?.getStudents ?? []).map(mapApiStudent);
  const batches: BatchSummary[] = (batchesData?.getAllBatches ?? []).map(mapApiBatchToSummary);

  const isSubmitting = isAdmitting || isUpdating;

  const total = students.length;
  const active = students.filter((s) => s.status === "active").length;
  const graduated = students.filter((s) => s.status === "graduated").length;
  const withdrawn = students.filter(
    (s) => s.status === "withdrawn" || s.status === "suspended",
  ).length;

  const openCreateDialog = () => {
    setFormMode("create");
    setSelectedStudent(null);
    setFormErrorMessage(null);
    setFormDialogKey((k) => k + 1);
    setIsFormOpen(true);
  };

  const openEditDialog = (student: StudentRecord) => {
    setFormMode("edit");
    setSelectedStudent(student);
    setFormErrorMessage(null);
    setFormDialogKey((k) => k + 1);
    setIsFormOpen(true);
  };

  const closeFormDialog = () => {
    if (!isSubmitting) {
      setIsFormOpen(false);
      setSelectedStudent(null);
      setFormErrorMessage(null);
    }
  };

  const handleSubmit = async (values: AdmissionFormValues) => {
    setFormErrorMessage(null);

    try {
      if (formMode === "edit" && selectedStudent) {
        const result = await updateStudent({
          variables: {
            student: {
              id: selectedStudent.id,
              firstName: values.firstName || undefined,
              lastName: values.lastName || undefined,
              firstNameBangla: values.firstNameBangla || undefined,
              email: values.email || undefined,
              phone: values.phone || undefined,
              classLevel: values.classLevel || undefined,
              division: values.division || undefined,
              district: values.district || undefined,
              upazila: values.upazila || undefined,
              village: values.village || undefined,
            },
          },
        });
        if (result.error) throw result.error;
        toast.success("Student record updated.");
        await refetchStudents();
      } else {
        const qualifications =
          (values.qualifications as QualificationEntry[] | undefined)
            ?.filter((q) => q.institution || q.exam)
            .map((q) => ({
              institution: q.institution,
              exam: q.exam,
              gradeGpa: q.gradeGpa || undefined,
              passingYear: q.passingYear || undefined,
              board: q.board || undefined,
            })) ?? undefined;

        const admitResult = await admitStudent({
          variables: {
            student: {
              batchId: values.batchId,
              firstName: values.firstName,
              lastName: values.lastName || undefined,
              firstNameBangla: values.firstNameBangla || undefined,
              email: values.email || undefined,
              phone: values.phone || undefined,
              dateOfBirth: values.dob || undefined,
              gender: values.gender ? values.gender.toUpperCase() : undefined,
              bloodGroup: values.bloodGroup || undefined,
              classLevel: values.classLevel || undefined,
              address: values.address || undefined,
              division: values.division || undefined,
              district: values.district || undefined,
              upazila: values.upazila || undefined,
              village: values.village || undefined,
              previousInstitution: values.previousInstitution || undefined,
              previousResult: values.previousResult || undefined,
              admissionSource: values.admissionSource ? values.admissionSource.toUpperCase() : undefined,
              notes: values.notes || undefined,
              qualifications: qualifications?.length ? qualifications : undefined,
            },
          },
        });
        if (admitResult.error) throw admitResult.error;

        const studentId = admitResult.data?.admitStudent?.id;

        if (studentId && values.guardianName) {
          await addGuardian({
            variables: {
              guardian: {
                studentId,
                name: values.guardianName,
                relationship: values.guardianRelation,
                phone: values.guardianPhone || undefined,
                email: values.guardianEmail || undefined,
                occupation: values.guardianOccupation || undefined,
                nid: values.guardianNid || undefined,
              },
            },
          });
        }

        const studentCode = admitResult.data?.admitStudent?.studentCode ?? "";
        toast.success(
          `${values.firstName} ${values.lastName} admitted${studentCode ? ` as ${studentCode}` : ""}. Go to Billing & Payments to generate their invoice.`,
          { duration: 5000 },
        );
        await refetchStudents();
        closeFormDialog();
        return;
      }

      closeFormDialog();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to save admission. Please try again.");
      setFormErrorMessage(message);
      toast.error(message);
    }
  };

  const handleWithdraw = async () => {
    if (!studentToWithdraw) return;

    try {
      const result = await changeStudentStatus({
        variables: { studentId: studentToWithdraw.id, status: "WITHDRAWN" },
      });
      if (result.error) throw result.error;
      toast.success(`${getFullName(studentToWithdraw)} marked as withdrawn.`);
      setStudentToWithdraw(null);
      await refetchStudents();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to withdraw student."));
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
                Admissions & Profiles
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Admit new students, manage personal and guardian details, and
                track enrollment status.
              </Typography>
            </Box>
            <Box
              sx={{
                minWidth: { lg: 240 },
                display: "flex",
                alignItems: "flex-start",
                justifyContent: { xs: "stretch", lg: "flex-end" },
              }}
            >
              <Button
                variant="contained"
                startIcon={<PersonAddRounded />}
                onClick={openCreateDialog}
                fullWidth
                sx={{
                  maxWidth: { xs: "100%", lg: 220 },
                  backgroundImage: primaryGradient,
                }}
              >
                New Admission
              </Button>
            </Box>
          </Stack>
        </Paper>

        {/* Stats */}
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
            caption="Total Students"
            title={String(total)}
            icon={<GroupsRounded />}
          />
          <SummaryCard
            caption="Active"
            title={String(active)}
            icon={<CheckCircleRounded />}
            tone="success"
          />
          <SummaryCard
            caption="Graduated"
            title={String(graduated)}
            icon={<EmojiEventsRounded />}
            tone="info"
          />
          <SummaryCard
            caption="Withdrawn / Suspended"
            title={String(withdrawn)}
            icon={<SchoolRounded />}
            tone="muted"
          />
        </Box>

        {/* Table */}
        <MaterialReactTable
          columns={buildStudentColumns()}
          data={students}
          enableColumnFilters
          enableDensityToggle={false}
          enableExpanding
          enableFullScreenToggle={false}
          enableHiding={false}
          enableRowActions
          enableSorting
          enableStickyHeader
          getRowId={(row) => row.id}
          state={{ isLoading: studentsLoading && students.length === 0 }}
          initialState={{
            pagination: { pageIndex: 0, pageSize: 15 },
            showColumnFilters: true,
            sorting: [{ id: "student", desc: false }],
          }}
          localization={{
            actions: "Actions",
            noRecordsToDisplay: "No students admitted yet",
          }}
          positionActionsColumn="last"
          muiSearchTextFieldProps={{
            placeholder: "Search by name, ID…",
            size: "small",
            sx: { minWidth: { xs: "100%", md: 320 } },
          }}
          muiBottomToolbarProps={{
            sx: {
              borderTop: "1px solid",
              borderColor: alpha("#0f172a", 0.08),
              bgcolor: "#ffffff",
            },
          }}
          muiTableBodyRowProps={({ row }) => ({
            sx: {
              opacity:
                row.original.status === "withdrawn" ||
                row.original.status === "suspended"
                  ? 0.72
                  : 1,
              bgcolor: "#ffffff",
              transition:
                "background-color 140ms ease, transform 140ms ease, box-shadow 140ms ease",
              "&:hover td": { bgcolor: alpha("#ecfdf5", 0.9) },
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: `inset 0 0 0 1px ${alpha("#10b981", 0.12)}`,
              },
            },
          })}
          muiTableBodyCellProps={{
            sx: {
              bgcolor: "#ffffff",
              borderBottom: "1px solid",
              borderColor: alpha("#0f172a", 0.06),
              py: 2,
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
              "& .MuiInputBase-root": {
                bgcolor: alpha("#f8fafc", 0.92),
                borderRadius: 2,
              },
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
          muiDetailPanelProps={{ sx: { bgcolor: alpha("#f8fafc", 0.8) } }}
          displayColumnDefOptions={{
            "mrt-row-expand": {
              size: 40,
              muiTableBodyCellProps: { sx: { bgcolor: "#ffffff" } },
              muiTableHeadCellProps: { sx: { bgcolor: "#ffffff" } },
            },
            "mrt-row-actions": {
              header: "Actions",
              size: 108,
              muiTableBodyCellProps: { sx: { pr: 2, bgcolor: "#ffffff" } },
              muiTableHeadCellProps: {
                sx: {
                  pr: 2,
                  bgcolor: "#ffffff",
                  "& .Mui-TableHeadCell-Content": {
                    justifyContent: "flex-end",
                  },
                },
              },
            },
          }}
          renderDetailPanel={({ row }) => {
            const s = row.original;
            const addressParts = [s.address, s.village, s.upazila, s.district, s.division].filter(Boolean);
            const fullAddress = addressParts.join(", ");
            const hasPrevious = s.previousInstitution || s.previousResult;
            return (
              <Box sx={{ px: 3, py: 2.5, bgcolor: alpha("#f8fafc", 0.8) }}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={3}
                  divider={<Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />}
                >
                  {/* Education / Qualifications */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="overline" color="text.secondary" sx={{ fontSize: 10, letterSpacing: 1.2 }}>
                      Education Background
                    </Typography>
                    {s.qualifications.length > 0 ? (
                      <Stack spacing={1} sx={{ mt: 0.75 }}>
                        {s.qualifications.map((q) => (
                          <Stack key={q.id} direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                            <Chip
                              label={q.exam.replace(/_/g, " ").toUpperCase()}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: 10,
                                fontWeight: 700,
                                bgcolor: alpha("#8b5cf6", 0.12),
                                color: "#5b21b6",
                                "& .MuiChip-label": { px: 1 },
                              }}
                            />
                            <Typography variant="body2" sx={{ flex: 1 }}>
                              {q.institution}
                            </Typography>
                            {q.gradeGpa && (
                              <Typography variant="caption" color="text.secondary">
                                GPA {q.gradeGpa}
                              </Typography>
                            )}
                            {q.passingYear && (
                              <Typography variant="caption" color={alpha("#0f172a", 0.4)}>
                                · {q.passingYear}
                              </Typography>
                            )}
                            {q.board && (
                              <Typography variant="caption" color={alpha("#0f172a", 0.35)}>
                                · {q.board.toUpperCase()} board
                              </Typography>
                            )}
                          </Stack>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                        No qualifications on record
                      </Typography>
                    )}
                    {hasPrevious && (
                      <Stack spacing={0.25} sx={{ mt: 1.5 }}>
                        {s.previousInstitution && (
                          <Typography variant="caption" color="text.secondary">
                            Previous: {s.previousInstitution}
                            {s.previousResult ? ` — ${s.previousResult}` : ""}
                          </Typography>
                        )}
                      </Stack>
                    )}
                  </Box>

                  {/* Address & Details */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="overline" color="text.secondary" sx={{ fontSize: 10, letterSpacing: 1.2 }}>
                      Address & Details
                    </Typography>
                    <Stack spacing={0.75} sx={{ mt: 0.75 }}>
                      {fullAddress ? (
                        <Typography variant="body2">{fullAddress}</Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">No address on record</Typography>
                      )}
                      {s.classLevel && (
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <Typography variant="caption" color="text.secondary">Class level:</Typography>
                          <Chip
                            label={s.classLevel}
                            size="small"
                            variant="outlined"
                            sx={{ height: 18, fontSize: 11, "& .MuiChip-label": { px: 0.75 } }}
                          />
                        </Stack>
                      )}
                      {s.admissionSource && (
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <Typography variant="caption" color="text.secondary">Source:</Typography>
                          <Typography variant="caption">
                            {s.admissionSource.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  </Box>

                  {/* Notes */}
                  {s.notes && (
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="overline" color="text.secondary" sx={{ fontSize: 10, letterSpacing: 1.2 }}>
                        Notes
                      </Typography>
                      <Box
                        sx={{
                          mt: 0.75,
                          p: 1.5,
                          bgcolor: alpha("#f59e0b", 0.07),
                          borderRadius: 1.5,
                          borderLeft: "3px solid",
                          borderColor: "#f59e0b",
                        }}
                      >
                        <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.secondary" }}>
                          {s.notes}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Stack>
              </Box>
            );
          }}
          renderEmptyRowsFallback={() => (
            <Box sx={{ px: 3, py: 6, textAlign: "center" }}>
              {studentsLoading ? (
                <CircularProgress size={32} />
              ) : (
                <>
                  <Typography variant="subtitle1" fontWeight={700}>
                    No admissions yet
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Start by admitting your first student.
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddRounded />}
                    onClick={openCreateDialog}
                    sx={{ mt: 2 }}
                  >
                    New Admission
                  </Button>
                </>
              )}
            </Box>
          )}
          renderRowActions={({ row }) => (
            <Stack
              direction="row"
              spacing={0.5}
              justifyContent="flex-end"
              sx={{ width: "100%" }}
            >
              <Tooltip title="Edit record">
                <IconButton
                  size="small"
                  onClick={() => openEditDialog(row.original)}
                  sx={{ bgcolor: alpha("#0f172a", 0.04) }}
                >
                  <EditRounded fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip
                title={
                  row.original.status === "withdrawn" ||
                  row.original.status === "graduated"
                    ? "Already closed"
                    : "Withdraw student"
                }
              >
                <span>
                  <IconButton
                    size="small"
                    disabled={
                      row.original.status === "withdrawn" ||
                      row.original.status === "graduated"
                    }
                    onClick={() => setStudentToWithdraw(row.original)}
                    sx={{ bgcolor: alpha("#ef4444", 0.08), color: "#b91c1c" }}
                  >
                    <BlockRounded fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          )}
          renderTopToolbarCustomActions={() => (
            <Typography variant="body2" color="text.secondary">
              {total} student{total === 1 ? "" : "s"} total
            </Typography>
          )}
        />
      </Stack>

      <AdmissionFormDialog
        key={formDialogKey}
        batches={batches}
        errorMessage={formErrorMessage}
        initialValues={
          selectedStudent
            ? getStudentFormValues(selectedStudent)
            : emptyAdmissionFormValues
        }
        isSubmitting={isSubmitting}
        mode={formMode}
        onClose={closeFormDialog}
        onSubmit={handleSubmit}
        open={isFormOpen}
      />


      <Dialog
        open={!!studentToWithdraw}
        onClose={() => !isWithdrawing && setStudentToWithdraw(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Withdraw student</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {studentToWithdraw
              ? `This will mark ${getFullName(studentToWithdraw)} (${studentToWithdraw.studentId}) as withdrawn. Their records will be kept for reference.`
              : ""}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            color="inherit"
            onClick={() => setStudentToWithdraw(null)}
            disabled={isWithdrawing}
          >
            Keep active
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleWithdraw}
            disabled={isWithdrawing}
          >
            Withdraw
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
