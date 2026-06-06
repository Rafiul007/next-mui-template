"use client";

import { useState } from "react";
import {
  AddRounded,
  EmojiEventsRounded,
  PsychologyRounded,
  WarningAmberRounded,
} from "@mui/icons-material";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  alpha,
} from "@mui/material";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { toast } from "react-hot-toast";
import type { RhfSelectOption } from "@/components/form";
import { SummaryCard } from "@/components/ui";
import {
  AddCertificationDocument,
  AddSkillTagDocument,
  GetEmployeesDocument,
  GetExpiringCertificationsDocument,
  GetSkillMatrixDocument,
  GetUsersDocument,
  type GetExpiringCertificationsQuery,
  type GetSkillMatrixQuery,
  type GetEmployeesQuery,
  type GetUsersQuery,
} from "@/graphql/generated";
import { getErrorMessage } from "@/lib/errors";
import { primaryGradient } from "@/theme/theme";
import { AddSkillDialog, AddCertificationDialog, type SkillFormValues, type CertFormValues } from "./SkillFormDialog";

type SkillRecord = GetSkillMatrixQuery["getSkillMatrix"][number];
type CertRecord = GetExpiringCertificationsQuery["getExpiringCertifications"][number];
type EmployeeRecord = GetEmployeesQuery["getEmployees"][number];
type UserRecord = NonNullable<GetUsersQuery["getUsers"][number]>;

const PROFICIENCY_COLORS: Record<string, "default" | "primary" | "warning" | "success"> = {
  BEGINNER: "default",
  INTERMEDIATE: "primary",
  ADVANCED: "warning",
  EXPERT: "success",
};

const formatName = (u: UserRecord) => `${u.firstName} ${u.lastName ?? ""}`.trim() || u.email;

const buildSkillColumns = ({
  userLookup,
  employeeLookup,
}: {
  userLookup: Map<string, string>;
  employeeLookup: Map<string, EmployeeRecord>;
}): MRT_ColumnDef<SkillRecord>[] => [
  {
    id: "employee",
    accessorFn: (row) => {
      const emp = employeeLookup.get(row.employeeId);
      return emp?.userId ? (userLookup.get(emp.userId) ?? emp.employeeCode) : (emp?.employeeCode ?? "—");
    },
    header: "Employee",
    size: 200,
    Cell: ({ cell }) => <Typography variant="body2" fontWeight={600}>{String(cell.getValue())}</Typography>,
  },
  {
    accessorKey: "skill",
    header: "Skill",
    size: 200,
    Cell: ({ cell }) => <Typography variant="body2">{String(cell.getValue())}</Typography>,
  },
  {
    accessorKey: "proficiencyLevel",
    header: "Proficiency",
    size: 140,
    Cell: ({ cell }) => {
      const val = String(cell.getValue());
      return <Chip label={val} size="small" color={PROFICIENCY_COLORS[val] ?? "default"} variant="outlined" />;
    },
  },
];

const buildCertColumns = ({
  userLookup,
  employeeLookup,
}: {
  userLookup: Map<string, string>;
  employeeLookup: Map<string, EmployeeRecord>;
}): MRT_ColumnDef<CertRecord>[] => [
  {
    id: "employee",
    accessorFn: (row) => {
      const emp = employeeLookup.get(row.employeeId);
      return emp?.userId ? (userLookup.get(emp.userId) ?? emp.employeeCode) : (emp?.employeeCode ?? "—");
    },
    header: "Employee",
    size: 200,
    Cell: ({ cell }) => <Typography variant="body2" fontWeight={600}>{String(cell.getValue())}</Typography>,
  },
  {
    accessorKey: "name",
    header: "Certification",
    size: 220,
    Cell: ({ cell }) => <Typography variant="body2" fontWeight={600}>{String(cell.getValue())}</Typography>,
  },
  {
    accessorKey: "issuingOrganization",
    header: "Issuing org",
    size: 200,
    Cell: ({ cell }) => <Typography variant="body2">{String(cell.getValue())}</Typography>,
  },
  {
    accessorKey: "issueDate",
    header: "Issued",
    size: 120,
    Cell: ({ cell }) => <Typography variant="body2">{String(cell.getValue())}</Typography>,
  },
  {
    accessorKey: "expiryDate",
    header: "Expires",
    size: 120,
    Cell: ({ cell }) => {
      const val = cell.getValue<string | null>();
      if (!val) return <Typography variant="body2" color="text.disabled">—</Typography>;
      const isExpired = new Date(val) < new Date();
      return (
        <Stack direction="row" spacing={0.5} alignItems="center">
          {isExpired && <WarningAmberRounded sx={{ fontSize: 14, color: "warning.main" }} />}
          <Typography variant="body2" color={isExpired ? "warning.main" : undefined} fontWeight={isExpired ? 600 : 400}>
            {val}
          </Typography>
        </Stack>
      );
    },
  },
  {
    id: "url",
    header: "Certificate",
    size: 120,
    enableSorting: false,
    Cell: ({ row }) =>
      row.original.certificateUrl ? (
        <Button
          size="small"
          variant="text"
          href={row.original.certificateUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ textTransform: "none", p: 0, minWidth: 0 }}
        >
          View
        </Button>
      ) : (
        <Typography variant="body2" color="text.disabled">—</Typography>
      ),
  },
];

export function SkillsWorkspace() {
  const [tab, setTab] = useState(0);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");

  const [isSkillOpen, setIsSkillOpen] = useState(false);
  const [skillKey, setSkillKey] = useState(0);
  const [skillError, setSkillError] = useState<string | null>(null);

  const [isCertOpen, setIsCertOpen] = useState(false);
  const [certKey, setCertKey] = useState(0);
  const [certError, setCertError] = useState<string | null>(null);

  const { data: usersData } = useQuery(GetUsersDocument, { variables: { page: 1, limit: 500 } });
  const { data: empData } = useQuery(GetEmployeesDocument);
  const {
    data: skillData,
    loading: isSkillLoading,
    error: skillLoadError,
    refetch: refetchSkills,
  } = useQuery(GetSkillMatrixDocument, {
    skip: !selectedEmployeeId,
    variables: { employeeId: selectedEmployeeId },
    fetchPolicy: "cache-and-network",
  });
  const {
    data: certData,
    loading: isCertLoading,
    error: certLoadError,
    refetch: refetchCerts,
  } = useQuery(GetExpiringCertificationsDocument, { fetchPolicy: "cache-and-network" });

  const [addSkill, addSkillState] = useMutation(AddSkillTagDocument);
  const [addCert, addCertState] = useMutation(AddCertificationDocument);

  const employees = empData?.getEmployees ?? [];
  const users = (usersData?.getUsers ?? []).filter((u): u is UserRecord => !!u);
  const skills = skillData?.getSkillMatrix ?? [];
  const certs = certData?.getExpiringCertifications ?? [];

  const userLookup = new Map(users.map((u) => [u.id, formatName(u)]));
  const employeeLookup = new Map(employees.map((e) => [e.id, e]));

  const employeeOptions: RhfSelectOption[] = employees.map((e) => ({
    label: e.userId ? (userLookup.get(e.userId) ?? e.employeeCode) : e.employeeCode,
    value: e.id,
  }));

  const expiringSoon = certs.filter((c) => {
    if (!c.expiryDate) return false;
    const diff = (new Date(c.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  }).length;

  const handleAddSkill = async (values: SkillFormValues) => {
    setSkillError(null);
    try {
      const result = await addSkill({
        variables: { input: { employeeId: values.employeeId, skill: values.skill.trim(), proficiencyLevel: values.proficiencyLevel } },
      });
      if (result.error) throw result.error;
      if (values.employeeId === selectedEmployeeId) await refetchSkills();
      toast.success("Skill tag added.");
      setIsSkillOpen(false);
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to add skill.");
      setSkillError(msg);
      toast.error(msg);
    }
  };

  const handleAddCert = async (values: CertFormValues) => {
    setCertError(null);
    try {
      const result = await addCert({
        variables: {
          input: {
            employeeId: values.employeeId,
            name: values.name.trim(),
            issuingOrganization: values.issuingOrganization.trim(),
            issueDate: values.issueDate!.format("YYYY-MM-DD"),
            expiryDate: values.expiryDate ? values.expiryDate.format("YYYY-MM-DD") : undefined,
            certificateUrl: values.certificateUrl?.trim() || undefined,
          },
        },
      });
      if (result.error) throw result.error;
      await refetchCerts();
      toast.success("Certification added.");
      setIsCertOpen(false);
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to add certification.");
      setCertError(msg);
      toast.error(msg);
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
            background: "linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(240,253,250,0.98) 100%)",
          }}
        >
          <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" spacing={3}>
            <Box sx={{ maxWidth: 720 }}>
              <Typography variant="h4" component="h1" sx={{ mt: 0.5 }}>
                Skills & Certifications
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Track employee skills, proficiency levels, and professional certifications with expiry alerts.
              </Typography>
            </Box>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Button
                variant="outlined"
                startIcon={<AddRounded />}
                onClick={() => { setCertError(null); setCertKey((k) => k + 1); setIsCertOpen(true); }}
              >
                Add certification
              </Button>
              <Button
                variant="contained"
                startIcon={<AddRounded />}
                onClick={() => { setSkillError(null); setSkillKey((k) => k + 1); setIsSkillOpen(true); }}
                sx={{ backgroundImage: primaryGradient }}
              >
                Add skill
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" } }}>
          <SummaryCard caption="Total certs tracked" title={String(certs.length)} icon={<EmojiEventsRounded />} />
          <SummaryCard caption="Expiring in 30 days" title={String(expiringSoon)} icon={<WarningAmberRounded />} tone={expiringSoon > 0 ? "default" : "success"} />
          <SummaryCard caption="Skills on record" title={String(skills.length)} icon={<PsychologyRounded />} tone="success" />
        </Box>

        <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{ px: 2.5, borderBottom: "1px solid", borderColor: "divider", bgcolor: "#fff" }}
          >
            <Tab label="Skill Matrix" />
            <Tab label={`Certifications${expiringSoon > 0 ? ` (${expiringSoon} expiring)` : ""}`} />
          </Tabs>

          {tab === 0 && (
            <Box sx={{ p: 2 }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }} sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight={600} sx={{ minWidth: 120 }}>Filter by employee</Typography>
                <Box sx={{ flex: 1, maxWidth: 360 }}>
                  <select
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 14, background: "#fff" }}
                  >
                    <option value="">— Select employee —</option>
                    {employeeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Box>
              </Stack>
              {skillLoadError && <Alert severity="error" sx={{ mb: 2 }}>{skillLoadError.message}</Alert>}
              {!selectedEmployeeId ? (
                <Box sx={{ py: 5, textAlign: "center" }}>
                  <PsychologyRounded sx={{ fontSize: 44, color: "text.disabled", mb: 1.5 }} />
                  <Typography variant="subtitle1" fontWeight={700}>Select an employee</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Choose an employee to see their skill matrix.</Typography>
                </Box>
              ) : (
                <MaterialReactTable
                  columns={buildSkillColumns({ userLookup, employeeLookup })}
                  data={skills}
                  enableColumnFilters
                  enableDensityToggle={false}
                  enableFullScreenToggle={false}
                  enableHiding={false}
                  enableSorting
                  getRowId={(row) => row.id}
                  initialState={{ pagination: { pageIndex: 0, pageSize: 15 } }}
                  localization={{ noRecordsToDisplay: "No skills recorded for this employee" }}
                  muiTableBodyRowProps={{ sx: { bgcolor: "#ffffff", "&:hover td": { bgcolor: alpha("#ecfdf5", 0.9) } } }}
                  muiTableBodyCellProps={{ sx: { bgcolor: "#ffffff", borderBottom: "1px solid", borderColor: alpha("#0f172a", 0.06), py: 2 } }}
                  muiTableHeadCellProps={{ sx: { bgcolor: "#ffffff", color: alpha("#0f172a", 0.72), fontSize: 13, fontWeight: 700, py: 1.75, borderBottom: "1px solid", borderColor: alpha("#0f172a", 0.08) } }}
                  muiTablePaperProps={{ elevation: 0, sx: { border: "none", borderRadius: 0 } }}
                  muiTopToolbarProps={{ sx: { px: 0, py: 1, bgcolor: "#ffffff", borderBottom: "1px solid", borderColor: alpha("#0f172a", 0.08) } }}
                  muiBottomToolbarProps={{ sx: { borderTop: "1px solid", borderColor: alpha("#0f172a", 0.08), bgcolor: "#ffffff" } }}
                  state={{ isLoading: isSkillLoading && skills.length === 0 }}
                />
              )}
            </Box>
          )}

          {tab === 1 && (
            <Box sx={{ p: 2 }}>
              {certLoadError && <Alert severity="error" sx={{ mb: 2 }}>{certLoadError.message}</Alert>}
              <MaterialReactTable
                columns={buildCertColumns({ userLookup, employeeLookup })}
                data={certs}
                enableColumnFilters
                enableDensityToggle={false}
                enableFullScreenToggle={false}
                enableHiding={false}
                enableSorting
                getRowId={(row) => row.id}
                initialState={{ pagination: { pageIndex: 0, pageSize: 15 } }}
                localization={{ noRecordsToDisplay: "No certifications tracked" }}
                muiTableBodyRowProps={{ sx: { bgcolor: "#ffffff", "&:hover td": { bgcolor: alpha("#ecfdf5", 0.9) } } }}
                muiTableBodyCellProps={{ sx: { bgcolor: "#ffffff", borderBottom: "1px solid", borderColor: alpha("#0f172a", 0.06), py: 2 } }}
                muiTableHeadCellProps={{ sx: { bgcolor: "#ffffff", color: alpha("#0f172a", 0.72), fontSize: 13, fontWeight: 700, py: 1.75, borderBottom: "1px solid", borderColor: alpha("#0f172a", 0.08) } }}
                muiTablePaperProps={{ elevation: 0, sx: { border: "none", borderRadius: 0 } }}
                muiTopToolbarProps={{ sx: { px: 0, py: 1, bgcolor: "#ffffff", borderBottom: "1px solid", borderColor: alpha("#0f172a", 0.08) } }}
                muiBottomToolbarProps={{ sx: { borderTop: "1px solid", borderColor: alpha("#0f172a", 0.08), bgcolor: "#ffffff" } }}
                state={{ isLoading: isCertLoading && certs.length === 0 }}
              />
            </Box>
          )}
        </Paper>
      </Stack>

      <AddSkillDialog
        key={skillKey}
        open={isSkillOpen}
        isSubmitting={addSkillState.loading}
        employeeOptions={employeeOptions}
        errorMessage={skillError}
        onClose={() => !addSkillState.loading && setIsSkillOpen(false)}
        onSubmit={handleAddSkill}
      />

      <AddCertificationDialog
        key={certKey}
        open={isCertOpen}
        isSubmitting={addCertState.loading}
        employeeOptions={employeeOptions}
        errorMessage={certError}
        onClose={() => !addCertState.loading && setIsCertOpen(false)}
        onSubmit={handleAddCert}
      />
    </>
  );
}
