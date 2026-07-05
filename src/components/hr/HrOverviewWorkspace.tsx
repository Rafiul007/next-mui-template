"use client";

import { useRouter } from "next/navigation";
import {
  AccountTreeRounded,
  AssignmentLateRounded,
  BeachAccessRounded,
  FactCheckRounded,
  GroupsRounded,
  HourglassBottomRounded,
  HowToRegRounded,
  PaymentsRounded,
  PeopleRounded,
  PolicyRounded,
  PsychologyRounded,
  TrendingUpRounded,
  WorkRounded,
} from "@mui/icons-material";
import { useQuery } from "@apollo/client/react";
import {
  Box,
  Card,
  CardActionArea,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import {
  GetDepartmentsDocument,
  GetEmployeesDocument,
  type GetEmployeesQuery,
} from "@/graphql/generated";
import { SummaryCard } from "@/components/ui";
import { primaryGradient } from "@/theme/theme";

type EmployeeRecord = NonNullable<
  GetEmployeesQuery["getEmployees"][number]
>;

const HR_MODULES = [
  {
    label: "Staff Directory",
    description: "Profiles, onboarding, records",
    icon: PeopleRounded,
    href: "/hr/dashboard/employees",
  },
  {
    label: "Staff Attendance",
    description: "Check-in, monthly sheets",
    icon: FactCheckRounded,
    href: "/hr/dashboard/attendance",
  },
  {
    label: "Leave Management",
    description: "Requests & approvals",
    icon: BeachAccessRounded,
    href: "/hr/dashboard/leave",
  },
  {
    label: "Leave Policies",
    description: "Entitlements & rules",
    icon: PolicyRounded,
    href: "/hr/dashboard/leave-policy",
  },
  {
    label: "Payroll",
    description: "Runs, payslips, salaries",
    icon: PaymentsRounded,
    href: "/hr/dashboard/payroll",
  },
  {
    label: "Performance",
    description: "Review cycles & scores",
    icon: TrendingUpRounded,
    href: "/hr/dashboard/performance",
  },
  {
    label: "Recruitment",
    description: "Vacancies & applicants",
    icon: WorkRounded,
    href: "/hr/dashboard/recruitment",
  },
  {
    label: "Improvement Plans",
    description: "PIPs & progress",
    icon: AssignmentLateRounded,
    href: "/hr/dashboard/pip",
  },
  {
    label: "Skills Matrix",
    description: "Competencies & tags",
    icon: PsychologyRounded,
    href: "/hr/dashboard/skills",
  },
];

const DEPT_BAR_COLORS = [
  "#2563eb",
  "#8b5cf6",
  "#0ea5e9",
  "#f59e0b",
  "#10b981",
  "#ec4899",
  "#f97316",
  "#64748b",
];

const employeeName = (e: EmployeeRecord): string =>
  `${e.userInfo?.firstName ?? ""} ${e.userInfo?.lastName ?? ""}`.trim() ||
  e.employeeCode;

const formatDate = (iso?: string | null): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const titleCase = (s: string) =>
  s
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export function HrOverviewWorkspace() {
  const router = useRouter();

  const { data: empData, loading: empLoading } = useQuery(
    GetEmployeesDocument,
    { fetchPolicy: "cache-and-network" },
  );
  const { data: deptData } = useQuery(GetDepartmentsDocument, {
    fetchPolicy: "cache-and-network",
  });

  const employees = (empData?.getEmployees ?? []).filter(
    (e): e is EmployeeRecord => !!e,
  );
  const departments = deptData?.getDepartments ?? [];

  const totalStaff = employees.length;
  const activeStaff = employees.filter(
    (e) => (e.status ?? "").toLowerCase() === "active",
  ).length;
  const onProbation = employees.filter((e) => e.isOnProbation).length;

  // Staff grouped by department (top 6, largest first).
  const deptCounts = new Map<string, number>();
  for (const e of employees) {
    const key = e.department?.trim() || "Unassigned";
    deptCounts.set(key, (deptCounts.get(key) ?? 0) + 1);
  }
  const deptBreakdown = [...deptCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const maxDeptCount = deptBreakdown[0]?.[1] ?? 1;

  // Recent hires — newest joining date first.
  const recentHires = [...employees]
    .filter((e) => e.joiningDate)
    .sort(
      (a, b) =>
        new Date(b.joiningDate).getTime() - new Date(a.joiningDate).getTime(),
    )
    .slice(0, 5);

  return (
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
        <Typography variant="h4" component="h1">
          Human Resources
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          Your staff at a glance — headcount, departments, and quick access to
          every HR tool.
        </Typography>
      </Paper>

      {/* KPIs */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0,1fr))",
            lg: "repeat(4, minmax(0,1fr))",
          },
        }}
      >
        <SummaryCard
          caption="Total staff"
          title={empLoading && totalStaff === 0 ? "…" : String(totalStaff)}
          icon={<GroupsRounded />}
        />
        <SummaryCard
          caption="Active"
          title={String(activeStaff)}
          icon={<HowToRegRounded />}
          tone="success"
        />
        <SummaryCard
          caption="On probation"
          title={String(onProbation)}
          icon={<HourglassBottomRounded />}
          tone="warning"
        />
        <SummaryCard
          caption="Departments"
          title={String(departments.length)}
          icon={<AccountTreeRounded />}
          tone="muted"
        />
      </Box>

      {/* HR modules */}
      <Box>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
          HR Tools
        </Typography>
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
          }}
        >
          {HR_MODULES.map((mod) => (
            <Card
              key={mod.href}
              elevation={0}
              sx={{ border: "1px solid", borderColor: "divider" }}
            >
              <CardActionArea
                onClick={() => router.push(mod.href)}
                sx={{
                  p: 2.5,
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  justifyContent: "flex-start",
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: "grid",
                    placeItems: "center",
                    background: primaryGradient,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  <mod.icon />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {mod.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {mod.description}
                  </Typography>
                </Box>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Breakdown + recent hires */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
        }}
      >
        {/* Staff by department */}
        <Paper
          elevation={0}
          sx={{ p: 3, border: "1px solid", borderColor: "divider" }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <AccountTreeRounded sx={{ color: "text.secondary" }} />
            <Typography variant="h6" fontWeight={700}>
              Staff by Department
            </Typography>
          </Stack>
          {deptBreakdown.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No staff records yet.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {deptBreakdown.map(([dept, count], i) => (
                <Box key={dept}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    sx={{ mb: 0.5 }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      {dept}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {count}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={(count / maxDeptCount) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      bgcolor: alpha("#0f172a", 0.06),
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 1,
                        bgcolor: DEPT_BAR_COLORS[i % DEPT_BAR_COLORS.length],
                      },
                    }}
                  />
                </Box>
              ))}
            </Stack>
          )}
        </Paper>

        {/* Recent hires */}
        <Paper
          elevation={0}
          sx={{ p: 3, border: "1px solid", borderColor: "divider" }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <GroupsRounded sx={{ color: "text.secondary" }} />
            <Typography variant="h6" fontWeight={700}>
              Recent Hires
            </Typography>
          </Stack>
          {recentHires.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No staff records yet.
            </Typography>
          ) : (
            <Stack spacing={1.25}>
              {recentHires.map((e) => (
                <Stack
                  key={e.id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    p: 1.75,
                    borderRadius: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2" fontWeight={700} noWrap>
                      {employeeName(e)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {[e.designation, e.department].filter(Boolean).join(" · ") ||
                        e.employeeCode}
                    </Typography>
                  </Box>
                  <Stack alignItems="flex-end" spacing={0.5} sx={{ flexShrink: 0 }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(e.joiningDate)}
                    </Typography>
                    {e.isOnProbation ? (
                      <Chip
                        label="Probation"
                        size="small"
                        color="warning"
                        variant="outlined"
                        sx={{ height: 20, fontSize: 10 }}
                      />
                    ) : e.employmentType ? (
                      <Chip
                        label={titleCase(e.employmentType)}
                        size="small"
                        variant="outlined"
                        sx={{ height: 20, fontSize: 10 }}
                      />
                    ) : null}
                  </Stack>
                </Stack>
              ))}
            </Stack>
          )}
        </Paper>
      </Box>
    </Stack>
  );
}
