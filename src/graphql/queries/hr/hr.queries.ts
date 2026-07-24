export const GET_EMPLOYEES_QUERY = /* GraphQL */ `
  query GetEmployees {
    getEmployees {
      id
      tenantId
      userId
      branchId
      employeeCode
      designation
      department
      departmentId
      employmentType
      joiningDate
      status
      isOnProbation
      probationEndsAt
      nid
      tin
      bloodGroup
      emergencyContactName
      emergencyContactPhone
      userInfo {
        firstName
        lastName
        email
        phone
        profilePicture
        roles
      }
    }
  }
`;

export const GET_EMPLOYEE_QUERY = /* GraphQL */ `
  query GetEmployee($employeeId: ID!) {
    getEmployee(employeeId: $employeeId) {
      id
      tenantId
      userId
      branchId
      employeeCode
      designation
      department
      employmentType
      joiningDate
      status
      isOnProbation
      probationEndsAt
      nid
      tin
      bloodGroup
      emergencyContactName
      emergencyContactPhone
      userInfo {
        firstName
        lastName
        email
        phone
        profilePicture
      }
    }
  }
`;

export const GET_MONTHLY_ATTENDANCE_SHEET_QUERY = /* GraphQL */ `
  query GetMonthlyAttendanceSheet($employeeId: ID!, $month: Int!, $year: Int!) {
    getMonthlyAttendanceSheet(employeeId: $employeeId, month: $month, year: $year) {
      id
      employeeId
      attendanceDate
      checkInTime
      checkOutTime
      status
      source
      tenantId
    }
  }
`;

export const GET_MY_ATTENDANCE_SHEET_QUERY = /* GraphQL */ `
  query GetMyAttendanceSheet($month: Int!, $year: Int!) {
    getMyAttendanceSheet(month: $month, year: $year) {
      id
      employeeId
      attendanceDate
      checkInTime
      checkOutTime
      status
      source
      correctionReason
      tenantId
    }
  }
`;

export const GET_SALARY_POLICIES_QUERY = /* GraphQL */ `
  query GetSalaryPolicies {
    getSalaryPolicies {
      id
      tenantId
      name
      designation
      isDefault
      basic
      houseRent
      medical
      transport
      deductions
      overtimeHourlyRate
    }
  }
`;

export const GET_OVERTIME_CLAIMS_QUERY = /* GraphQL */ `
  query GetOvertimeClaims($employeeId: ID!) {
    getOvertimeClaims(employeeId: $employeeId) {
      id
      tenantId
      employeeId
      sessionId
      claimDate
      hours
      reason
      status
      hourlyRate
      amount
      approvedBy
      rejectionReason
      payrollRunId
    }
  }
`;

export const GET_MY_OVERTIME_CLAIMS_QUERY = /* GraphQL */ `
  query GetMyOvertimeClaims {
    getMyOvertimeClaims {
      id
      tenantId
      employeeId
      sessionId
      claimDate
      hours
      reason
      status
      hourlyRate
      amount
      approvedBy
      rejectionReason
      payrollRunId
    }
  }
`;

export const GET_PENDING_OVERTIME_CLAIMS_QUERY = /* GraphQL */ `
  query GetPendingOvertimeClaims {
    getPendingOvertimeClaims {
      id
      tenantId
      employeeId
      sessionId
      claimDate
      hours
      reason
      status
      hourlyRate
      amount
      approvedBy
      rejectionReason
      payrollRunId
    }
  }
`;

export const GET_LEAVE_APPLICATIONS_QUERY = /* GraphQL */ `
  query GetLeaveApplications($employeeId: ID!) {
    getLeaveApplications(employeeId: $employeeId) {
      id
      employeeId
      leaveType
      startDate
      endDate
      status
      reason
      tenantId
    }
  }
`;

export const GET_LEAVE_BALANCE_QUERY = /* GraphQL */ `
  query GetLeaveBalance($employeeId: ID!, $year: Int!) {
    getLeaveBalance(employeeId: $employeeId, year: $year) {
      id
      employeeId
      leaveType
      totalBalance
      usedDays
      remainingDays
      year
      tenantId
    }
  }
`;

export const GET_MY_LEAVE_APPLICATIONS_QUERY = /* GraphQL */ `
  query GetMyLeaveApplications {
    getMyLeaveApplications {
      id
      employeeId
      leaveType
      startDate
      endDate
      status
      reason
      tenantId
    }
  }
`;

export const GET_MY_LEAVE_BALANCE_QUERY = /* GraphQL */ `
  query GetMyLeaveBalance($year: Int!) {
    getMyLeaveBalance(year: $year) {
      id
      employeeId
      leaveType
      totalBalance
      usedDays
      remainingDays
      year
      tenantId
    }
  }
`;

// ── Teacher payroll self-service ──────────────────────────────────────────────
// Caller-scoped payroll queries (resolved from JWT, no employeeId arg). Return
// only the signed-in teacher's own data.

export const GET_MY_SALARY_STRUCTURE_QUERY = /* GraphQL */ `
  query GetMySalaryStructure {
    getMySalaryStructure {
      id
      employeeId
      basicSalary
      allowances
      deductions
      netSalary
      effectiveFrom
      tenantId
    }
  }
`;

export const GET_MY_PAYSLIPS_QUERY = /* GraphQL */ `
  query GetMyPayslips {
    getMyPayslips {
      id
      payrollRunId
      employeeId
      basicSalary
      allowances
      deductions
      taxableIncome
      taxes
      netAmount
      tenantId
    }
  }
`;

export const GET_MY_PAYROLL_RUNS_QUERY = /* GraphQL */ `
  query GetMyPayrollRuns {
    getMyPayrollRuns {
      id
      month
      year
      status
      totalAmount
      totalEmployees
      createdAt
      tenantId
    }
  }
`;

export const GET_MY_PAYROLL_SUMMARY_QUERY = /* GraphQL */ `
  query GetMyPayrollSummary($year: Int!) {
    getMyPayrollSummary(year: $year) {
      year
      payslipCount
      totalBasicSalary
      totalAllowances
      totalDeductions
      totalTaxes
      totalNetAmount
    }
  }
`;

export const GET_LEAVE_POLICIES_QUERY = /* GraphQL */ `
  query GetLeavePolicies($departmentId: ID) {
    getLeavePolicies(departmentId: $departmentId) {
      id
      name
      leaveType
      totalDaysPerYear
      carryForwardDays
      requiresApproval
      description
      departmentId
      tenantId
    }
  }
`;

export const GET_PERFORMANCE_DASHBOARD_QUERY = /* GraphQL */ `
  query GetPerformanceDashboard($cycleId: ID!) {
    getPerformanceDashboard(cycleId: $cycleId) {
      revieweeId
      averageScore
      reviewCount
      reviewerTypes
    }
  }
`;

export const GET_PIPS_QUERY = /* GraphQL */ `
  query GetPIPs($employeeId: ID!) {
    getPIPs(employeeId: $employeeId) {
      id
      employeeId
      createdBy
      goals
      startDate
      endDate
      status
      progressNotes
    }
  }
`;

export const GET_SKILL_MATRIX_QUERY = /* GraphQL */ `
  query GetSkillMatrix($employeeId: ID!) {
    getSkillMatrix(employeeId: $employeeId) {
      id
      employeeId
      skill
      proficiencyLevel
      tenantId
    }
  }
`;

export const GET_EXPIRING_CERTIFICATIONS_QUERY = /* GraphQL */ `
  query GetExpiringCertifications {
    getExpiringCertifications {
      id
      employeeId
      name
      issuingOrganization
      issueDate
      expiryDate
      certificateUrl
      tenantId
    }
  }
`;
