"use client";

import dayjs from "dayjs";
import {
  BadgeRounded,
  BalanceRounded,
  PaymentsRounded,
  PrintRounded,
  WorkRounded,
} from "@mui/icons-material";
import { useQuery } from "@apollo/client/react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import {
  GetCenterDocument,
  GetLeaveBalanceDocument,
  type GetLeaveBalanceQuery,
} from "@/graphql/generated";
import {
  GetMyEmployeeProfileDocument,
  GetMyLatestPayslipDocument,
} from "@/graphql/hr-extended";
import { SummaryCard } from "@/components/ui";
import { printPayslip } from "./payslip-print";

type LeaveBalance = GetLeaveBalanceQuery["getLeaveBalance"][number];

const LEAVE_TYPE_LABEL: Record<string, string> = {
  sick: "Sick",
  casual: "Casual",
  annual: "Annual",
  maternity: "Maternity",
  unpaid: "Unpaid",
};

const fmt = (n: number) => `৳ ${(n ?? 0).toLocaleString("en-BD")}`;

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value || "—"}
      </Typography>
    </Box>
  );
}

export function MyProfileWorkspace() {
  const { data: centerData } = useQuery(GetCenterDocument);
  const {
    data: profileData,
    loading: profileLoading,
    error: profileError,
  } = useQuery(GetMyEmployeeProfileDocument, { fetchPolicy: "cache-and-network" });

  const profile = profileData?.getMyEmployeeProfile;

  const { data: payslipData } = useQuery(GetMyLatestPayslipDocument, {
    fetchPolicy: "cache-and-network",
  });
  const payslip = payslipData?.getMyLatestPayslip;

  const { data: balanceData } = useQuery(GetLeaveBalanceDocument, {
    skip: !profile?.id,
    variables: { employeeId: profile?.id ?? "", year: new Date().getFullYear() },
    fetchPolicy: "cache-and-network",
  });
  const balances: LeaveBalance[] = balanceData?.getLeaveBalance ?? [];

  const centerName = centerData?.getCenter?.name ?? "BongoBrain";
  const fullName = profile?.userInfo
    ? `${profile.userInfo.firstName} ${profile.userInfo.lastName ?? ""}`.trim()
    : (profile?.employeeCode ?? "");

  const handlePrintPayslip = () => {
    if (!payslip) return;
    printPayslip({
      payslip,
      employeeName: fullName || "Employee",
      employeeCode: profile?.employeeCode ?? "—",
      designation: profile?.designation,
      period: null,
      centerName,
    });
  };

  return (
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
        <Typography variant="h4" component="h1">
          My Profile
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, maxWidth: 680 }}>
          Your employment details, latest payslip, and leave balance.
        </Typography>
      </Paper>

      {profileError ? (
        <Alert severity="info">
          No employee profile is linked to your account. This page is for staff
          members with an employee record.
        </Alert>
      ) : profileLoading && !profile ? (
        <Typography variant="body2" color="text.secondary">
          Loading your profile…
        </Typography>
      ) : profile ? (
        <>
          {/* Identity + employment */}
          <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5} alignItems={{ sm: "center" }}>
              <Avatar
                src={profile.userInfo?.profilePicture ?? undefined}
                sx={{ width: 64, height: 64, bgcolor: "primary.main" }}
              >
                {fullName.charAt(0) || "?"}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={700}>
                  {fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {profile.designation || "—"}
                  {profile.department ? ` · ${profile.department}` : ""}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Chip size="small" label={profile.employeeCode} variant="outlined" />
                  <Chip
                    size="small"
                    label={profile.status}
                    color={profile.status?.toLowerCase() === "active" ? "success" : "default"}
                  />
                  {profile.isOnProbation ? (
                    <Chip size="small" label="On probation" color="warning" variant="outlined" />
                  ) : null}
                </Stack>
              </Box>
            </Stack>

            <Divider sx={{ my: 2.5 }} />

            <Box
              sx={{
                display: "grid",
                gap: 2.5,
                gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
              }}
            >
              <Field
                label="Employment type"
                value={profile.employmentType}
              />
              <Field
                label="Joining date"
                value={profile.joiningDate ? dayjs(profile.joiningDate).format("DD MMM YYYY") : null}
              />
              <Field label="Blood group" value={profile.bloodGroup} />
              <Field
                label="Probation ends"
                value={
                  profile.probationEndsAt
                    ? dayjs(profile.probationEndsAt).format("DD MMM YYYY")
                    : null
                }
              />
              <Field label="Email" value={profile.userInfo?.email} />
              <Field label="Phone" value={profile.userInfo?.phone} />
              <Field label="NID" value={profile.nid} />
              <Field label="TIN" value={profile.tin} />
              <Field label="Emergency contact" value={profile.emergencyContactName} />
              <Field label="Emergency phone" value={profile.emergencyContactPhone} />
            </Box>
          </Paper>

          {/* Latest payslip + leave summary */}
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", lg: "1.3fr 1fr" },
            }}
          >
            <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <PaymentsRounded sx={{ color: "text.secondary" }} />
                  <Typography variant="h6" fontWeight={700}>
                    Latest Payslip
                  </Typography>
                </Stack>
                {payslip ? (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PrintRounded />}
                    onClick={handlePrintPayslip}
                  >
                    Print
                  </Button>
                ) : null}
              </Stack>

              {!payslip ? (
                <Box sx={{ py: 4, textAlign: "center" }}>
                  <WorkRounded sx={{ fontSize: 36, color: "text.disabled", mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No payslip available yet.
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box
                    sx={{
                      p: 2,
                      mb: 2,
                      borderRadius: 2,
                      bgcolor: alpha("#10b981", 0.08),
                      border: "1px solid",
                      borderColor: alpha("#10b981", 0.2),
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="subtitle2" color="success.dark" fontWeight={700}>
                      Net Pay
                    </Typography>
                    <Typography variant="h5" fontWeight={800} color="success.dark">
                      {fmt(payslip.netAmount)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "grid",
                      gap: 1.5,
                      gridTemplateColumns: { xs: "repeat(2,1fr)", sm: "repeat(3,1fr)" },
                    }}
                  >
                    {[
                      { label: "Basic", value: payslip.basicSalary },
                      { label: "Allowances", value: payslip.allowances },
                      { label: "Deductions", value: payslip.deductions },
                      { label: "Taxable", value: payslip.taxableIncome },
                      { label: "Taxes", value: payslip.taxes },
                    ].map(({ label, value }) => (
                      <Box
                        key={label}
                        sx={{
                          p: 1.25,
                          borderRadius: 1,
                          border: "1px solid",
                          borderColor: alpha("#0f172a", 0.06),
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {label}
                        </Typography>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {fmt(value)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </Paper>

            <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                <BalanceRounded sx={{ color: "text.secondary" }} />
                <Typography variant="h6" fontWeight={700}>
                  Leave Balance {new Date().getFullYear()}
                </Typography>
              </Stack>
              {balances.length === 0 ? (
                <Box sx={{ py: 4, textAlign: "center" }}>
                  <BadgeRounded sx={{ fontSize: 36, color: "text.disabled", mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No leave balances set for this year.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.25}>
                  {balances.map((bal) => (
                    <Stack
                      key={bal.id}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        border: "1px solid",
                        borderColor: alpha("#0f172a", 0.08),
                      }}
                    >
                      <Typography variant="body2" fontWeight={600}>
                        {LEAVE_TYPE_LABEL[bal.leaveType.toLowerCase()] ?? bal.leaveType}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color={bal.remainingDays <= 0 ? "error.main" : "success.main"}
                      >
                        {bal.remainingDays} / {bal.totalBalance} days
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              )}
            </Paper>
          </Box>

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0,1fr))" },
            }}
          >
            <SummaryCard
              caption="Employee code"
              title={profile.employeeCode}
              icon={<BadgeRounded />}
            />
            <SummaryCard
              caption="Status"
              title={profile.status}
              icon={<WorkRounded />}
              tone={profile.status?.toLowerCase() === "active" ? "success" : "default"}
            />
            <SummaryCard
              caption="Latest net pay"
              title={payslip ? fmt(payslip.netAmount) : "—"}
              icon={<PaymentsRounded />}
              tone="success"
            />
          </Box>
        </>
      ) : null}
    </Stack>
  );
}
