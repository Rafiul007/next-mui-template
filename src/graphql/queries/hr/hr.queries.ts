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
