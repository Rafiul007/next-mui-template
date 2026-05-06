"use client";

import { useState, type ReactNode } from "react";
import {
  AddRounded,
  BlockRounded,
  CheckCircleRounded,
  EditRounded,
  PersonAddRounded,
  SchoolRounded,
  GroupsRounded,
  EmojiEventsRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { toast } from "react-hot-toast";
import { primaryGradient } from "@/theme/theme";
import {
  AdmissionFormDialog,
  emptyAdmissionFormValues,
  type AdmissionFormValues,
  type BatchSummary,
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
  dob: string;
  gender: Gender;
  bloodGroup: string;
  phone: string;
  email: string;
  address: string;
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianOccupation: string;
  guardianNid: string;
  qualifications: QualificationEntry[];
  appliedDiscountIndexes: number[];
  batchId: string;
  batchName: string;
  admissionDate: string;
  status: AdmissionStatus;
  notes: string;
};

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

const GUARDIAN_RELATION_LABEL: Record<string, string> = {
  father: "Father",
  mother: "Mother",
  sibling: "Sibling",
  grandparent: "Grandparent",
  uncle_aunt: "Uncle / Aunt",
  guardian: "Legal guardian",
  other: "Other",
};

// Sample batches — replace with API data when backend is ready
const SAMPLE_BATCHES: BatchSummary[] = [
  {
    id: "batch-1",
    displayName: "Calculus · Batch 1",
    type: "course",
    status: "ongoing",
    totalSeats: 40,
    enrolledCount: 12,
    oneTimePayments: [
      { name: "Admission fee", amount: 2000 },
      { name: "Course fee", amount: 5000 },
    ],
    monthlyPayments: [{ name: "Monthly fee", amount: 800 }],
    discounts: [
      { name: "Early Bird Discount", value: 500, valueType: "fixed" },
    ],
  },
  {
    id: "batch-2",
    displayName: "Class 9 · Section A",
    type: "class",
    status: "upcoming",
    totalSeats: 50,
    enrolledCount: 0,
    oneTimePayments: [{ name: "Admission fee", amount: 3000 }],
    monthlyPayments: [
      { name: "Monthly fee", amount: 1200 },
      { name: "Development fee", amount: 200 },
    ],
    discounts: [],
  },
  {
    id: "batch-3",
    displayName: "Physics · Batch 2",
    type: "course",
    status: "ongoing",
    totalSeats: 35,
    enrolledCount: 28,
    oneTimePayments: [{ name: "Admission fee", amount: 1500 }],
    monthlyPayments: [{ name: "Monthly fee", amount: 600 }],
    discounts: [{ name: "Sibling Discount", value: 10, valueType: "percentage" }],
  },
  {
    id: "batch-4",
    displayName: "Class 10 · Section B",
    type: "class",
    status: "ongoing",
    totalSeats: 45,
    enrolledCount: 45,
    oneTimePayments: [{ name: "Admission fee", amount: 3500 }],
    monthlyPayments: [{ name: "Monthly fee", amount: 1500 }],
    discounts: [],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

let studentSeq = 1;
const generateStudentId = () => {
  const id = `STU-${String(studentSeq).padStart(3, "0")}`;
  studentSeq++;
  return id;
};

let recordSeq = 1;
const generateRecordId = () => String(recordSeq++);

const getFullName = (s: StudentRecord) =>
  `${s.firstName} ${s.lastName}`.trim();

const today = () => new Date().toISOString().split("T")[0];

const formatDate = (date: string) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getStudentFormValues = (s: StudentRecord): AdmissionFormValues => ({
  firstName: s.firstName,
  lastName: s.lastName,
  dob: s.dob,
  gender: s.gender,
  bloodGroup: s.bloodGroup,
  phone: s.phone,
  email: s.email,
  address: s.address,
  guardianName: s.guardianName,
  guardianRelation: s.guardianRelation,
  guardianPhone: s.guardianPhone,
  guardianEmail: s.guardianEmail,
  guardianOccupation: s.guardianOccupation,
  guardianNid: s.guardianNid,
  qualifications: s.qualifications,
  appliedDiscountIndexes: s.appliedDiscountIndexes,
  batchId: s.batchId,
  notes: s.notes,
});

// ── Columns ──────────────────────────────────────────────────────────────────

const buildStudentColumns = (
  batches: BatchSummary[],
): MRT_ColumnDef<StudentRecord>[] => {
  const batchNames = batches.map((b) => b.displayName);

  return [
    {
      id: "student",
      accessorFn: getFullName,
      header: "Student",
      size: 220,
      Cell: ({ row }) => (
        <Stack spacing={0.25}>
          <Typography variant="subtitle2" fontWeight={700}>
            {getFullName(row.original)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.original.studentId}
          </Typography>
        </Stack>
      ),
    },
    {
      accessorKey: "batchName",
      header: "Batch",
      size: 200,
      filterVariant: "select",
      filterSelectOptions: batchNames,
      Cell: ({ cell }) => (
        <Typography variant="body2">{String(cell.getValue())}</Typography>
      ),
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
      id: "guardian",
      accessorFn: (row) =>
        `${row.guardianName} (${GUARDIAN_RELATION_LABEL[row.guardianRelation] ?? row.guardianRelation})`,
      header: "Guardian",
      size: 210,
      Cell: ({ row }) => (
        <Stack spacing={0.25}>
          <Typography variant="body2" fontWeight={500}>
            {row.original.guardianName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {GUARDIAN_RELATION_LABEL[row.original.guardianRelation] ??
              row.original.guardianRelation}
          </Typography>
        </Stack>
      ),
    },
    {
      accessorKey: "phone",
      header: "Contact",
      size: 150,
      Cell: ({ cell }) => (
        <Typography variant="body2">{String(cell.getValue())}</Typography>
      ),
    },
    {
      accessorKey: "admissionDate",
      header: "Admitted",
      size: 130,
      Cell: ({ cell }) => (
        <Typography variant="body2">
          {formatDate(String(cell.getValue()))}
        </Typography>
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
};

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
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedStudent, setSelectedStudent] =
    useState<StudentRecord | null>(null);
  const [studentToWithdraw, setStudentToWithdraw] =
    useState<StudentRecord | null>(null);
  const [formDialogKey, setFormDialogKey] = useState(0);
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

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
    setIsSubmitting(true);
    setFormErrorMessage(null);

    try {
      const batch =
        SAMPLE_BATCHES.find((b) => b.id === values.batchId) ?? null;

      if (formMode === "edit" && selectedStudent) {
        setStudents((prev) =>
          prev.map((s) =>
            s.id === selectedStudent.id
              ? {
                  ...s,
                  firstName: values.firstName,
                  lastName: values.lastName,
                  dob: values.dob,
                  gender: values.gender as Gender,
                  bloodGroup: values.bloodGroup,
                  phone: values.phone,
                  email: values.email,
                  address: values.address,
                  guardianName: values.guardianName,
                  guardianRelation: values.guardianRelation,
                  guardianPhone: values.guardianPhone,
                  guardianEmail: values.guardianEmail,
                  guardianOccupation: values.guardianOccupation,
                  guardianNid: values.guardianNid,
                  qualifications: (values.qualifications ?? []) as QualificationEntry[],
                  appliedDiscountIndexes: values.appliedDiscountIndexes ?? [],
                  batchId: values.batchId,
                  batchName: batch?.displayName ?? "Unknown batch",
                  notes: values.notes,
                }
              : s,
          ),
        );
        toast.success("Student record updated.");
      } else {
        const newStudent: StudentRecord = {
          id: generateRecordId(),
          studentId: generateStudentId(),
          firstName: values.firstName,
          lastName: values.lastName,
          dob: values.dob,
          gender: values.gender as Gender,
          bloodGroup: values.bloodGroup,
          phone: values.phone,
          email: values.email,
          address: values.address,
          guardianName: values.guardianName,
          guardianRelation: values.guardianRelation,
          guardianPhone: values.guardianPhone,
          guardianEmail: values.guardianEmail,
          guardianOccupation: values.guardianOccupation,
          guardianNid: values.guardianNid,
          qualifications: (values.qualifications ?? []) as QualificationEntry[],
          appliedDiscountIndexes: values.appliedDiscountIndexes ?? [],
          batchId: values.batchId,
          batchName: batch?.displayName ?? "Unknown batch",
          admissionDate: today(),
          status: "active",
          notes: values.notes,
        };
        setStudents((prev) => [...prev, newStudent]);
        toast.success(
          `${newStudent.firstName} ${newStudent.lastName} admitted as ${newStudent.studentId}.`,
        );
      }

      closeFormDialog();
    } catch {
      setFormErrorMessage("Unable to save admission. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!studentToWithdraw) return;
    setIsWithdrawing(true);
    try {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentToWithdraw.id ? { ...s, status: "withdrawn" } : s,
        ),
      );
      toast.success(`${getFullName(studentToWithdraw)} marked as withdrawn.`);
      setStudentToWithdraw(null);
    } finally {
      setIsWithdrawing(false);
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
          columns={buildStudentColumns(SAMPLE_BATCHES)}
          data={students}
          enableColumnFilters
          enableDensityToggle={false}
          enableFullScreenToggle={false}
          enableHiding={false}
          enableRowActions
          enableSorting
          enableStickyHeader
          getRowId={(row) => row.id}
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
            placeholder: "Search by name, ID, guardian…",
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
          displayColumnDefOptions={{
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
          renderEmptyRowsFallback={() => (
            <Box sx={{ px: 3, py: 6, textAlign: "center" }}>
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
        batches={SAMPLE_BATCHES}
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
