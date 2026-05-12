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
