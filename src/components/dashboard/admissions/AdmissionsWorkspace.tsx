"use client";

import { useState, useMemo } from "react";
import {
  BlockRounded,
  CheckCircleRounded,
  DownloadRounded,
  EditRounded,
  EmojiEventsRounded,
  FemaleRounded,
  FilterListRounded,
  GroupsRounded,
  MaleRounded,
  OpenInNewRounded,
  PersonAddRounded,
  SearchRounded,
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
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { useMutation, useQuery } from "@apollo/client/react";
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
  qualifications: {
    id: string;
    institution: string;
    exam: string;
    gradeGpa: string | null;
    passingYear: string | null;
    board: string | null;
  }[];
};

type ApiStudent = GetStudentsQuery["getStudents"][number];
type ApiBatch = GetAllBatchesQuery["getAllBatches"][number];

// ── Constants ────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "#10b981", "#3b82f6", "#8b5cf6", "#f59e0b",
  "#ef4444", "#06b6d4", "#ec4899", "#f97316",
];

const CLASS_CHIP_COLORS: Record<string, { bg: string; text: string }> = {
  SSC: { bg: alpha("#06b6d4", 0.1), text: "#0e7490" },
  HSC: { bg: alpha("#3b82f6", 0.1), text: "#1d4ed8" },
  JSC: { bg: alpha("#f59e0b", 0.1), text: "#b45309" },
  PSC: { bg: alpha("#10b981", 0.1), text: "#047857" },
};

// ── Utilities ────────────────────────────────────────────────────────────────

const avatarColor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getInitials = (first: string, last: string): string =>
  (first.charAt(0) + last.charAt(0)).toUpperCase();

const getFullName = (s: StudentRecord) =>
  `${s.firstName} ${s.lastName}`.trim();

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
    status: batch.status.toLowerCase() as
      | "upcoming"
      | "ongoing"
      | "completed"
      | "cancelled",
    totalSeats: batch.capacity,
    enrolledCount: batch.enrolledCount,
    oneTimePayments,
    monthlyPayments,
    discounts: [],
  };
};

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

// ── Student Avatar ─────────────────────────────────────────────────────────────

function StudentAvatar({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) {
  const color = avatarColor(`${firstName}${lastName}`);
  return (
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: 1.5,
        bgcolor: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontSize: 13,
        fontWeight: 700,
        color: "#fff",
        letterSpacing: 0.5,
      }}
    >
      {getInitials(firstName, lastName)}
    </Box>
  );
}

// ── Class chip ─────────────────────────────────────────────────────────────────

function ClassChip({ level }: { level: string }) {
  const label = level.toUpperCase() || "OTHER";
  const known = CLASS_CHIP_COLORS[label];
  return (
    <Chip
      label={label}
      size="small"
      variant="outlined"
      sx={{
        height: 22,
        fontSize: 11,
        fontWeight: 700,
        borderRadius: 1,
        ...(known
          ? {
              bgcolor: known.bg,
              borderColor: known.text + "44",
              color: known.text,
            }
          : {}),
        "& .MuiChip-label": { px: 1 },
      }}
    />
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  subtitle,
  value,
  icon,
  iconColor,
  iconBg,
}: {
  label: string;
  subtitle?: string;
  value: number;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {label}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
          <Typography variant="h4" fontWeight={700} sx={{ mt: 0.75 }}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: iconColor,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Paper>
  );
}

// ── Workspace ─────────────────────────────────────────────────────────────────

export function AdmissionsWorkspace() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(
    null,
  );
  const [studentToWithdraw, setStudentToWithdraw] =
    useState<StudentRecord | null>(null);
  const [formDialogKey, setFormDialogKey] = useState(0);
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const {
    data: studentsData,
    loading: studentsLoading,
    refetch: refetchStudents,
  } = useQuery(GetStudentsDocument, { fetchPolicy: "cache-and-network" });

  const { data: batchesData } = useQuery(GetAllBatchesDocument, {
    fetchPolicy: "cache-and-network",
  });

  const [admitStudent, { loading: isAdmitting }] =
    useMutation(AdmitStudentDocument);
  const [addGuardian] = useMutation(AddGuardianDocument);
  const [updateStudent, { loading: isUpdating }] =
    useMutation(UpdateStudentDocument);
  const [changeStudentStatus, { loading: isWithdrawing }] = useMutation(
    ChangeStudentStatusDocument,
  );

  const students: StudentRecord[] = (studentsData?.getStudents ?? []).map(
    mapApiStudent,
  );
  const batches: BatchSummary[] = (batchesData?.getAllBatches ?? []).map(
    mapApiBatchToSummary,
  );

  const isSubmitting = isAdmitting || isUpdating;

  const total = students.length;
  const active = students.filter((s) => s.status === "active").length;
  const graduated = students.filter((s) => s.status === "graduated").length;
  const withdrawn = students.filter(
    (s) => s.status === "withdrawn" || s.status === "suspended",
  ).length;

  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        getFullName(s).toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.includes(q),
    );
  }, [students, searchQuery]);

  const pageStudents = filteredStudents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

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
        closeFormDialog();
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
              gender: values.gender
                ? values.gender.toUpperCase()
                : undefined,
              bloodGroup: values.bloodGroup || undefined,
              classLevel: values.classLevel || undefined,
              address: values.address || undefined,
              division: values.division || undefined,
              district: values.district || undefined,
              upazila: values.upazila || undefined,
              village: values.village || undefined,
              previousInstitution:
                values.previousInstitution || undefined,
              previousResult: values.previousResult || undefined,
              admissionSource: values.admissionSource
                ? values.admissionSource.toUpperCase()
                : undefined,
              notes: values.notes || undefined,
              qualifications: qualifications?.length
                ? qualifications
                : undefined,
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

        const studentCode =
          admitResult.data?.admitStudent?.studentCode ?? "";
        toast.success(
          `${values.firstName} ${values.lastName} admitted${studentCode ? ` as ${studentCode}` : ""}. Go to Billing & Payments to generate their invoice.`,
          { duration: 5000 },
        );
        await refetchStudents();
        closeFormDialog();
      }
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Unable to save admission. Please try again.",
      );
      setFormErrorMessage(message);
      toast.error(message);
    }
  };

  const handleWithdraw = async () => {
    if (!studentToWithdraw) return;
    try {
      const result = await changeStudentStatus({
        variables: {
          studentId: studentToWithdraw.id,
          status: "WITHDRAWN",
        },
      });
      if (result.error) throw result.error;
      toast.success(
        `${getFullName(studentToWithdraw)} marked as withdrawn.`,
      );
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
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ sm: "flex-start" }}
          spacing={2}
        >
          <Box>
            <Typography variant="h4" component="h1" fontWeight={700}>
              Admissions & Profiles
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Admit new students, manage personal and guardian details, and
              track enrollment status.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<PersonAddRounded />}
            onClick={openCreateDialog}
            sx={{ backgroundImage: primaryGradient, flexShrink: 0 }}
          >
            New Admission
          </Button>
        </Stack>

        {/* Stat cards */}
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr 1fr",
              lg: "repeat(4, minmax(0, 1fr))",
            },
          }}
        >
          <StatCard
            label="Total Students"
            value={total}
            icon={<GroupsRounded />}
            iconColor="#1d4ed8"
            iconBg={alpha("#3b82f6", 0.1)}
          />
          <StatCard
            label="Active"
            subtitle="enrolled & attending"
            value={active}
            icon={<CheckCircleRounded />}
            iconColor="#047857"
            iconBg={alpha("#10b981", 0.1)}
          />
          <StatCard
            label="Graduated"
            value={graduated}
            icon={<EmojiEventsRounded />}
            iconColor="#b45309"
            iconBg={alpha("#f59e0b", 0.1)}
          />
          <StatCard
            label="Withdrawn / Suspended"
            value={withdrawn}
            icon={<BlockRounded />}
            iconColor="#7c3aed"
            iconBg={alpha("#8b5cf6", 0.1)}
          />
        </Box>

        {/* Student table */}
        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          {/* Toolbar */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ sm: "center" }}
            sx={{
              px: 2.5,
              py: 1.75,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <TextField
              size="small"
              placeholder="Search by name, ID or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRounded
                        sx={{ fontSize: 18, color: "text.secondary" }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ flex: 1, maxWidth: { sm: 380 } }}
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={<FilterListRounded />}
              sx={{ flexShrink: 0 }}
            >
              Filter
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadRounded />}
              sx={{ flexShrink: 0 }}
            >
              Export
            </Button>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ ml: { sm: "auto" }, flexShrink: 0 }}
            >
              {filteredStudents.length} student
              {filteredStudents.length !== 1 ? "s" : ""}
            </Typography>
          </Stack>

          {/* Table */}
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha("#f8fafc", 0.9) }}>
                {[
                  "Student",
                  "Class",
                  "Gender",
                  "Contact",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <TableCell
                    key={h}
                    align={h === "Actions" ? "right" : "left"}
                    sx={{
                      fontWeight: 700,
                      fontSize: 11,
                      color: "text.secondary",
                      textTransform: "uppercase",
                      letterSpacing: 0.6,
                      py: 1.5,
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {studentsLoading && students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        py: 6,
                      }}
                    >
                      <CircularProgress size={28} />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : pageStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box sx={{ py: 6, textAlign: "center" }}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {searchQuery
                          ? "No students match your search"
                          : "No admissions yet"}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        {searchQuery
                          ? "Try a different name or ID."
                          : "Start by admitting your first student."}
                      </Typography>
                      {!searchQuery && (
                        <Button
                          variant="outlined"
                          startIcon={<PersonAddRounded />}
                          onClick={openCreateDialog}
                          sx={{ mt: 2 }}
                        >
                          New Admission
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                pageStudents.map((s) => {
                  const isClosed =
                    s.status === "withdrawn" ||
                    s.status === "graduated" ||
                    s.status === "suspended";
                  const statusDotColor =
                    s.status === "active"
                      ? "#10b981"
                      : s.status === "graduated"
                        ? "#3b82f6"
                        : "#94a3b8";

                  return (
                    <TableRow
                      key={s.id}
                      sx={{
                        opacity: isClosed ? 0.72 : 1,
                        "&:hover td": { bgcolor: alpha("#ecfdf5", 0.6) },
                        transition: "background 100ms ease",
                      }}
                    >
                      {/* STUDENT */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                        >
                          <StudentAvatar
                            firstName={s.firstName}
                            lastName={s.lastName}
                          />
                          <Box minWidth={0}>
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                            >
                              <Typography
                                variant="subtitle2"
                                fontWeight={700}
                                noWrap
                              >
                                {getFullName(s)}
                              </Typography>
                              {s.notes && (
                                <Tooltip title={s.notes} placement="top" arrow>
                                  <StickyNote2Rounded
                                    sx={{
                                      fontSize: 13,
                                      color: "#d97706",
                                      flexShrink: 0,
                                    }}
                                  />
                                </Tooltip>
                              )}
                            </Stack>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {s.studentId}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      {/* CLASS */}
                      <TableCell>
                        {s.classLevel ? (
                          <ClassChip level={s.classLevel} />
                        ) : (
                          <Typography
                            variant="caption"
                            color="text.disabled"
                          >
                            —
                          </Typography>
                        )}
                      </TableCell>

                      {/* GENDER */}
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          {s.gender === "male" ? (
                            <MaleRounded
                              sx={{ fontSize: 16, color: "#3b82f6" }}
                            />
                          ) : s.gender === "female" ? (
                            <FemaleRounded
                              sx={{ fontSize: 16, color: "#ec4899" }}
                            />
                          ) : null}
                          <Typography variant="body2">
                            {s.gender === "male"
                              ? "Male"
                              : s.gender === "female"
                                ? "Female"
                                : "Other"}
                          </Typography>
                        </Stack>
                      </TableCell>

                      {/* CONTACT */}
                      <TableCell>
                        <Typography variant="body2">
                          {s.phone || "—"}
                        </Typography>
                        {s.email && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                          >
                            {s.email}
                          </Typography>
                        )}
                      </TableCell>

                      {/* STATUS */}
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          alignItems="center"
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: statusDotColor,
                              flexShrink: 0,
                            }}
                          />
                          <Typography
                            variant="body2"
                            fontWeight={500}
                            color={statusDotColor}
                          >
                            {s.status === "active"
                              ? "Active"
                              : s.status === "graduated"
                                ? "Graduated"
                                : s.status === "withdrawn"
                                  ? "Withdrawn"
                                  : "Inactive"}
                          </Typography>
                        </Stack>
                      </TableCell>

                      {/* ACTIONS */}
                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={0.5}
                          justifyContent="flex-end"
                        >
                          <Tooltip title="View profile">
                            <IconButton size="small">
                              <OpenInNewRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit record">
                            <IconButton
                              size="small"
                              onClick={() => openEditDialog(s)}
                            >
                              <EditRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip
                            title={
                              isClosed
                                ? "Already closed"
                                : "Withdraw student"
                            }
                          >
                            <span>
                              <IconButton
                                size="small"
                                disabled={isClosed}
                                onClick={() => setStudentToWithdraw(s)}
                                sx={{
                                  color: isClosed
                                    ? undefined
                                    : alpha("#ef4444", 0.8),
                                }}
                              >
                                <BlockRounded fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={filteredStudents.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 15, 25, 50]}
            sx={{
              borderTop: "1px solid",
              borderColor: "divider",
              "& .MuiTablePagination-toolbar": { px: 2.5 },
            }}
          />
        </Paper>
      </Stack>

      {/* Admission form dialog */}
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

      {/* Withdraw confirm dialog */}
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
