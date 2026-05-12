"use client";

import React, { useState, type ReactNode } from "react";
import {
  AddRounded,
  AutoStoriesRounded,
  CheckCircleRounded,
  EditRounded,
  LayersRounded,
  MenuBookRounded,
  PauseCircleRounded,
  SchoolRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
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
  CreateProgramDocument,
  CreateSubjectDocument,
  GetProgramsDocument,
  GetSubjectsDocument,
  UpdateProgramDocument,
  UpdateSubjectDocument,
  type GetProgramsQuery,
  type GetSubjectsQuery,
} from "@/graphql/generated";
import {
  SubjectFormDialog,
  emptySubjectFormValues,
  type SubjectFormValues,
} from "./SubjectFormDialog";
import {
  ProgramFormDialog,
  emptyProgramFormValues,
  type ProgramFormValues,
  type SubjectOption,
} from "./ProgramFormDialog";

// ─── Types ────────────────────────────────────────────────────────────────────

type SubjectRecord = {
  id: string;
  name: string;
  nameBangla: string | null;
  code: string | null;
  classLevel: string | null;
  active: boolean;
};

type ProgramRecord = {
  id: string;
  name: string;
  durationMonths: number;
  targetLevel: string | null;
  syllabusPath: string | null;
  subjectIds: string[];
  active: boolean;
};

type ApiSubject = GetSubjectsQuery["getSubjects"][number];
type ApiProgram = GetProgramsQuery["getPrograms"][number];

// ─── Mappers ──────────────────────────────────────────────────────────────────

const mapApiSubject = (s: ApiSubject): SubjectRecord => ({
  id: s.id,
  name: s.name,
  nameBangla: s.nameBangla ?? null,
  code: s.code ?? null,
  classLevel: s.classLevel ?? null,
  active: s.active,
});

const mapApiProgram = (p: ApiProgram): ProgramRecord => ({
  id: p.id,
  name: p.name,
  durationMonths: p.durationMonths,
  targetLevel: p.targetLevel ?? null,
  syllabusPath: p.syllabusPath ?? null,
  subjectIds: p.subjectIds,
  active: p.active,
});

// ─── Summary card ─────────────────────────────────────────────────────────────

function SummaryCard({
  caption,
  icon,
  title,
  tone = "default",
}: {
  caption: string;
  icon: ReactNode;
  title: string;
  tone?: "default" | "success" | "muted";
}) {
  const borderColor =
    tone === "success"
      ? alpha("#10b981", 0.22)
      : tone === "muted"
        ? alpha("#64748b", 0.16)
        : alpha("#0f172a", 0.08);

  const iconBg =
    tone === "success"
      ? alpha("#10b981", 0.12)
      : alpha("#0f172a", 0.06);

  const iconColor =
    tone === "success" ? "#047857" : "#0f172a";

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

// ─── Table styles (shared) ────────────────────────────────────────────────────

const tableProps = {
  muiBottomToolbarProps: {
    sx: {
      borderTop: "1px solid",
      borderColor: alpha("#0f172a", 0.08),
      bgcolor: "#ffffff",
    },
  },
  muiTableBodyCellProps: {
    sx: {
      bgcolor: "#ffffff",
      borderBottom: "1px solid",
      borderColor: alpha("#0f172a", 0.06),
      py: 2.25,
    },
  },
  muiTableBodyRowProps: {
    sx: {
      bgcolor: "#ffffff",
      transition:
        "background-color 140ms ease, transform 140ms ease, box-shadow 140ms ease",
      "&:hover td": { bgcolor: alpha("#ecfdf5", 0.9) },
      "&:hover": {
        transform: "translateY(-1px)",
        boxShadow: `inset 0 0 0 1px ${alpha("#10b981", 0.12)}`,
      },
    },
  },
  muiTableContainerProps: { sx: { maxHeight: 560, bgcolor: "#ffffff" } },
  muiTableHeadCellProps: {
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
  },
  muiTablePaperProps: {
    elevation: 0,
    sx: {
      border: "1px solid",
      borderColor: alpha("#0f172a", 0.08),
      borderRadius: 2,
      overflow: "hidden",
      bgcolor: "#ffffff",
      boxShadow: `0 16px 40px ${alpha("#0f172a", 0.06)}`,
    },
  },
  muiTopToolbarProps: {
    sx: {
      px: 2.5,
      py: 1.75,
      bgcolor: "#ffffff",
      borderBottom: "1px solid",
      borderColor: alpha("#0f172a", 0.08),
    },
  },
  displayColumnDefOptions: {
    "mrt-row-actions": {
      header: "Actions",
      size: 80,
      muiTableBodyCellProps: { sx: { pr: 2, bgcolor: "#ffffff" } },
      muiTableHeadCellProps: {
        sx: {
          pr: 2,
          bgcolor: "#ffffff",
          "& .Mui-TableHeadCell-Content": { justifyContent: "flex-end" },
        },
      },
    },
  },
} as const;

// ─── Column definitions ────────────────────────────────────────────────────────

const buildSubjectColumns = (): MRT_ColumnDef<SubjectRecord>[] => [
  {
    accessorKey: "name",
    header: "Subject",
    size: 220,
    Cell: ({ row }) => (
      <Stack spacing={0.25}>
        <Typography variant="subtitle2" fontWeight={700}>
          {row.original.name}
        </Typography>
        {row.original.nameBangla && (
          <Typography variant="caption" color="text.secondary">
            {row.original.nameBangla}
          </Typography>
        )}
      </Stack>
    ),
  },
  {
    accessorKey: "code",
    header: "Code",
    size: 120,
    Cell: ({ cell }) => {
      const code = cell.getValue<string | null>();
      return code ? (
        <Chip label={code} size="small" variant="outlined" sx={{ fontFamily: "monospace", fontSize: 12 }} />
      ) : (
        <Typography variant="body2" color="text.disabled">—</Typography>
      );
    },
  },
  {
    accessorKey: "classLevel",
    header: "Class level",
    size: 140,
    Cell: ({ cell }) => {
      const level = cell.getValue<string | null>();
      return (
        <Typography variant="body2" color={level ? "text.primary" : "text.disabled"}>
          {level ?? "—"}
        </Typography>
      );
    },
  },
  {
    accessorKey: "active",
    header: "Status",
    size: 110,
    filterVariant: "select",
    filterFn: "equals",
    filterSelectOptions: ["true", "false"],
    Cell: ({ cell }) =>
      cell.getValue<boolean>() ? (
        <Chip label="Active" color="success" size="small" />
      ) : (
        <Chip label="Inactive" color="default" size="small" variant="outlined" />
      ),
  },
];

const buildProgramColumns = (
  subjectMap: Map<string, string>,
): MRT_ColumnDef<ProgramRecord>[] => [
  {
    accessorKey: "name",
    header: "Program",
    size: 220,
    Cell: ({ row }) => (
      <Stack spacing={0.25}>
        <Typography variant="subtitle2" fontWeight={700}>
          {row.original.name}
        </Typography>
        {row.original.targetLevel && (
          <Typography variant="caption" color="text.secondary">
            {row.original.targetLevel}
          </Typography>
        )}
      </Stack>
    ),
  },
  {
    accessorKey: "durationMonths",
    header: "Duration",
    size: 120,
    Cell: ({ cell }) => {
      const months = cell.getValue<number>();
      return (
        <Typography variant="body2">
          {months} {months === 1 ? "month" : "months"}
        </Typography>
      );
    },
  },
  {
    id: "subjects",
    header: "Subjects",
    size: 260,
    enableSorting: false,
    accessorFn: (row) => row.subjectIds.length,
    Cell: ({ row }) => {
      const ids = row.original.subjectIds;
      if (ids.length === 0)
        return (
          <Typography variant="body2" color="text.disabled">
            None
          </Typography>
        );
      const visible = ids.slice(0, 3);
      const rest = ids.length - 3;
      return (
        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          {visible.map((id) => (
            <Chip
              key={id}
              label={subjectMap.get(id) ?? id}
              size="small"
              variant="outlined"
              sx={{ fontSize: 11 }}
            />
          ))}
          {rest > 0 && (
            <Chip
              label={`+${rest} more`}
              size="small"
              sx={{ fontSize: 11 }}
            />
          )}
        </Stack>
      );
    },
  },
  {
    accessorKey: "active",
    header: "Status",
    size: 110,
    filterVariant: "select",
    filterFn: "equals",
    filterSelectOptions: ["true", "false"],
    Cell: ({ cell }) =>
      cell.getValue<boolean>() ? (
        <Chip label="Active" color="success" size="small" />
      ) : (
        <Chip label="Inactive" color="default" size="small" variant="outlined" />
      ),
  },
];

// ─── Workspace ────────────────────────────────────────────────────────────────

export function CatalogWorkspace() {
  const [activeTab, setActiveTab] = useState(0);

  // Subjects state
  const [isSubjectFormOpen, setIsSubjectFormOpen] = useState(false);
  const [subjectFormMode, setSubjectFormMode] = useState<"create" | "edit">("create");
  const [selectedSubject, setSelectedSubject] = useState<SubjectRecord | null>(null);
  const [subjectFormKey, setSubjectFormKey] = useState(0);
  const [subjectFormError, setSubjectFormError] = useState<string | null>(null);

  // Programs state
  const [isProgramFormOpen, setIsProgramFormOpen] = useState(false);
  const [programFormMode, setProgramFormMode] = useState<"create" | "edit">("create");
  const [selectedProgram, setSelectedProgram] = useState<ProgramRecord | null>(null);
  const [programFormKey, setProgramFormKey] = useState(0);
  const [programFormError, setProgramFormError] = useState<string | null>(null);

  // Queries
  const { data: subjectsData, loading: subjectsLoading } = useQuery(
    GetSubjectsDocument,
    { fetchPolicy: "cache-and-network" },
  );

  const { data: programsData, loading: programsLoading } = useQuery(
    GetProgramsDocument,
    { fetchPolicy: "cache-and-network" },
  );

  // Subject mutations
  const [createSubject, { loading: isCreatingSubject }] = useMutation(
    CreateSubjectDocument,
    { refetchQueries: [GetSubjectsDocument] },
  );

  const [updateSubject, { loading: isUpdatingSubject }] = useMutation(
    UpdateSubjectDocument,
    { refetchQueries: [GetSubjectsDocument] },
  );

  // Program mutations
  const [createProgram, { loading: isCreatingProgram }] = useMutation(
    CreateProgramDocument,
    { refetchQueries: [GetProgramsDocument] },
  );

  const [updateProgram, { loading: isUpdatingProgram }] = useMutation(
    UpdateProgramDocument,
    { refetchQueries: [GetProgramsDocument] },
  );

  // Derived data
  const subjects: SubjectRecord[] = (subjectsData?.getSubjects ?? []).map(mapApiSubject);
  const programs: ProgramRecord[] = (programsData?.getPrograms ?? []).map(mapApiProgram);

  const subjectOptions: SubjectOption[] = subjects
    .filter((s) => s.active)
    .map((s) => ({ id: s.id, name: s.name }));

  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));

  const isSubjectSubmitting = isCreatingSubject || isUpdatingSubject;
  const isProgramSubmitting = isCreatingProgram || isUpdatingProgram;

  // Subject form helpers
  const openCreateSubjectDialog = () => {
    setSubjectFormMode("create");
    setSelectedSubject(null);
    setSubjectFormError(null);
    setSubjectFormKey((k) => k + 1);
    setIsSubjectFormOpen(true);
  };

  const openEditSubjectDialog = (subject: SubjectRecord) => {
    setSubjectFormMode("edit");
    setSelectedSubject(subject);
    setSubjectFormError(null);
    setSubjectFormKey((k) => k + 1);
    setIsSubjectFormOpen(true);
  };

  const closeSubjectFormDialog = () => {
    if (!isSubjectSubmitting) {
      setIsSubjectFormOpen(false);
      setSelectedSubject(null);
      setSubjectFormError(null);
    }
  };

  const getSubjectFormValues = (subject: SubjectRecord): SubjectFormValues => ({
    name: subject.name,
    nameBangla: subject.nameBangla ?? "",
    code: subject.code ?? "",
    classLevel: subject.classLevel ?? "",
    active: subject.active,
  });

  const handleSubmitSubject = async (values: SubjectFormValues) => {
    setSubjectFormError(null);
    try {
      if (subjectFormMode === "edit" && selectedSubject) {
        const result = await updateSubject({
          variables: {
            subject: {
              id: selectedSubject.id,
              name: values.name,
              nameBangla: values.nameBangla || undefined,
              code: values.code || undefined,
              classLevel: values.classLevel || undefined,
              active: values.active,
            },
          },
        });
        if (result.error) throw result.error;
        toast.success("Subject updated successfully.");
      } else {
        const result = await createSubject({
          variables: {
            subject: {
              name: values.name,
              nameBangla: values.nameBangla || undefined,
              code: values.code || undefined,
              classLevel: values.classLevel || undefined,
            },
          },
        });
        if (result.error) throw result.error;
        toast.success("Subject created successfully.");
      }
      closeSubjectFormDialog();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to save subject. Please try again.");
      setSubjectFormError(message);
      toast.error(message);
    }
  };

  // Program form helpers
  const openCreateProgramDialog = () => {
    setProgramFormMode("create");
    setSelectedProgram(null);
    setProgramFormError(null);
    setProgramFormKey((k) => k + 1);
    setIsProgramFormOpen(true);
  };

  const openEditProgramDialog = (program: ProgramRecord) => {
    setProgramFormMode("edit");
    setSelectedProgram(program);
    setProgramFormError(null);
    setProgramFormKey((k) => k + 1);
    setIsProgramFormOpen(true);
  };

  const closeProgramFormDialog = () => {
    if (!isProgramSubmitting) {
      setIsProgramFormOpen(false);
      setSelectedProgram(null);
      setProgramFormError(null);
    }
  };

  const getProgramFormValues = (program: ProgramRecord): ProgramFormValues => ({
    name: program.name,
    durationMonths: program.durationMonths,
    targetLevel: program.targetLevel ?? "",
    syllabusPath: program.syllabusPath ?? "",
    subjectIds: program.subjectIds,
    active: program.active,
  });

  const handleSubmitProgram = async (values: ProgramFormValues) => {
    setProgramFormError(null);
    try {
      if (programFormMode === "edit" && selectedProgram) {
        const result = await updateProgram({
          variables: {
            program: {
              id: selectedProgram.id,
              name: values.name,
              durationMonths: values.durationMonths,
              targetLevel: values.targetLevel || undefined,
              syllabusPath: values.syllabusPath || undefined,
              subjectIds: values.subjectIds,
              active: values.active,
            },
          },
        });
        if (result.error) throw result.error;
        toast.success("Program updated successfully.");
      } else {
        const result = await createProgram({
          variables: {
            program: {
              name: values.name,
              durationMonths: values.durationMonths,
              targetLevel: values.targetLevel || undefined,
              syllabusPath: values.syllabusPath || undefined,
              subjectIds: values.subjectIds,
            },
          },
        });
        if (result.error) throw result.error;
        toast.success("Program created successfully.");
      }
      closeProgramFormDialog();
    } catch (error) {
      const message = getErrorMessage(error, "Unable to save program. Please try again.");
      setProgramFormError(message);
      toast.error(message);
    }
  };

  // Stats
  const totalSubjects = subjects.length;
  const activeSubjects = subjects.filter((s) => s.active).length;
  const totalPrograms = programs.length;
  const activePrograms = programs.filter((p) => p.active).length;

  return (
    <>
      <Stack spacing={3}>
        {/* ── Header ── */}
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
                Subjects &amp; Programs
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Define the subjects taught at your center and group them into
                structured programs for batch assignment.
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
                startIcon={<AddRounded />}
                onClick={
                  activeTab === 0
                    ? openCreateSubjectDialog
                    : openCreateProgramDialog
                }
                fullWidth
                sx={{
                  maxWidth: { xs: "100%", lg: 220 },
                  backgroundImage: primaryGradient,
                }}
              >
                {activeTab === 0 ? "Create Subject" : "Create Program"}
              </Button>
            </Box>
          </Stack>
        </Paper>

        {/* ── Tabs ── */}
        <Paper
          elevation={0}
          sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              px: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: "#ffffff",
            }}
          >
            <Tab
              icon={<MenuBookRounded fontSize="small" />}
              iconPosition="start"
              label="Subjects"
              sx={{ gap: 1, minHeight: 52 }}
            />
            <Tab
              icon={<AutoStoriesRounded fontSize="small" />}
              iconPosition="start"
              label="Programs"
              sx={{ gap: 1, minHeight: 52 }}
            />
          </Tabs>

          {/* ── Subjects tab ── */}
          {activeTab === 0 && (
            <Box sx={{ p: { xs: 2, md: 3 } }}>
              <Stack spacing={3}>
                {/* Stats */}
                <Box
                  sx={{
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(3, minmax(0, 1fr))",
                    },
                  }}
                >
                  <SummaryCard
                    caption="Total Subjects"
                    title={String(totalSubjects)}
                    icon={<LayersRounded />}
                  />
                  <SummaryCard
                    caption="Active"
                    title={String(activeSubjects)}
                    icon={<CheckCircleRounded />}
                    tone="success"
                  />
                  <SummaryCard
                    caption="Inactive"
                    title={String(totalSubjects - activeSubjects)}
                    icon={<PauseCircleRounded />}
                    tone="muted"
                  />
                </Box>

                {/* Table */}
                <MaterialReactTable
                  columns={buildSubjectColumns()}
                  data={subjects}
                  enableColumnFilters
                  enableDensityToggle={false}
                  enableFullScreenToggle={false}
                  enableHiding={false}
                  enableRowActions
                  enableSorting
                  enableStickyHeader
                  getRowId={(row) => row.id}
                  state={{
                    isLoading: subjectsLoading && subjects.length === 0,
                  }}
                  initialState={{
                    pagination: { pageIndex: 0, pageSize: 10 },
                    sorting: [{ id: "name", desc: false }],
                  }}
                  localization={{ noRecordsToDisplay: "No subjects found" }}
                  positionActionsColumn="last"
                  muiSearchTextFieldProps={{
                    placeholder: "Search subjects",
                    size: "small",
                    sx: { minWidth: { xs: "100%", md: 260 } },
                  }}
                  {...tableProps}
                  renderEmptyRowsFallback={() => (
                    <Box sx={{ px: 3, py: 6, textAlign: "center" }}>
                      {subjectsLoading ? (
                        <CircularProgress size={32} />
                      ) : (
                        <>
                          <SchoolRounded
                            sx={{ fontSize: 40, color: "text.disabled", mb: 1 }}
                          />
                          <Typography variant="subtitle1" fontWeight={700}>
                            No subjects yet
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                          >
                            Add your first subject to start building your
                            academic catalog.
                          </Typography>
                          <Button
                            variant="outlined"
                            startIcon={<AddRounded />}
                            onClick={openCreateSubjectDialog}
                            sx={{ mt: 2 }}
                          >
                            Create Subject
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
                      <Tooltip title="Edit subject">
                        <IconButton
                          size="small"
                          onClick={() => openEditSubjectDialog(row.original)}
                          sx={{ bgcolor: alpha("#0f172a", 0.04) }}
                        >
                          <EditRounded fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  )}
                  renderTopToolbarCustomActions={() => (
                    <Typography variant="body2" color="text.secondary">
                      {totalSubjects} subject{totalSubjects === 1 ? "" : "s"} total
                    </Typography>
                  )}
                />
              </Stack>
            </Box>
          )}

          {/* ── Programs tab ── */}
          {activeTab === 1 && (
            <Box sx={{ p: { xs: 2, md: 3 } }}>
              <Stack spacing={3}>
                {/* Stats */}
                <Box
                  sx={{
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(3, minmax(0, 1fr))",
                    },
                  }}
                >
                  <SummaryCard
                    caption="Total Programs"
                    title={String(totalPrograms)}
                    icon={<LayersRounded />}
                  />
                  <SummaryCard
                    caption="Active"
                    title={String(activePrograms)}
                    icon={<CheckCircleRounded />}
                    tone="success"
                  />
                  <SummaryCard
                    caption="Inactive"
                    title={String(totalPrograms - activePrograms)}
                    icon={<PauseCircleRounded />}
                    tone="muted"
                  />
                </Box>

                {/* Table */}
                <MaterialReactTable
                  columns={buildProgramColumns(subjectMap)}
                  data={programs}
                  enableColumnFilters
                  enableDensityToggle={false}
                  enableFullScreenToggle={false}
                  enableHiding={false}
                  enableRowActions
                  enableSorting
                  enableStickyHeader
                  getRowId={(row) => row.id}
                  state={{
                    isLoading: programsLoading && programs.length === 0,
                  }}
                  initialState={{
                    pagination: { pageIndex: 0, pageSize: 10 },
                    sorting: [{ id: "name", desc: false }],
                  }}
                  localization={{ noRecordsToDisplay: "No programs found" }}
                  positionActionsColumn="last"
                  muiSearchTextFieldProps={{
                    placeholder: "Search programs",
                    size: "small",
                    sx: { minWidth: { xs: "100%", md: 260 } },
                  }}
                  {...tableProps}
                  renderEmptyRowsFallback={() => (
                    <Box sx={{ px: 3, py: 6, textAlign: "center" }}>
                      {programsLoading ? (
                        <CircularProgress size={32} />
                      ) : (
                        <>
                          <AutoStoriesRounded
                            sx={{ fontSize: 40, color: "text.disabled", mb: 1 }}
                          />
                          <Typography variant="subtitle1" fontWeight={700}>
                            No programs yet
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                          >
                            Create a program to group subjects together for
                            batch assignment.
                          </Typography>
                          <Button
                            variant="outlined"
                            startIcon={<AddRounded />}
                            onClick={openCreateProgramDialog}
                            sx={{ mt: 2 }}
                          >
                            Create Program
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
                      <Tooltip title="Edit program">
                        <IconButton
                          size="small"
                          onClick={() => openEditProgramDialog(row.original)}
                          sx={{ bgcolor: alpha("#0f172a", 0.04) }}
                        >
                          <EditRounded fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  )}
                  renderTopToolbarCustomActions={() => (
                    <Typography variant="body2" color="text.secondary">
                      {totalPrograms} program{totalPrograms === 1 ? "" : "s"} total
                    </Typography>
                  )}
                />
              </Stack>
            </Box>
          )}
        </Paper>
      </Stack>

      {/* ── Subject dialog ── */}
      <SubjectFormDialog
        key={`subject-${subjectFormKey}`}
        errorMessage={subjectFormError}
        initialValues={
          selectedSubject
            ? getSubjectFormValues(selectedSubject)
            : emptySubjectFormValues
        }
        isSubmitting={isSubjectSubmitting}
        mode={subjectFormMode}
        onClose={closeSubjectFormDialog}
        onSubmit={handleSubmitSubject}
        open={isSubjectFormOpen}
      />

      {/* ── Program dialog ── */}
      <ProgramFormDialog
        key={`program-${programFormKey}`}
        errorMessage={programFormError}
        initialValues={
          selectedProgram
            ? getProgramFormValues(selectedProgram)
            : emptyProgramFormValues
        }
        isSubmitting={isProgramSubmitting}
        mode={programFormMode}
        onClose={closeProgramFormDialog}
        onSubmit={handleSubmitProgram}
        open={isProgramFormOpen}
        subjects={subjectOptions}
      />
    </>
  );
}
