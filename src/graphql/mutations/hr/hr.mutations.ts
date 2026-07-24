export const UPDATE_EMPLOYEE_MUTATION = /* GraphQL */ `
  mutation UpdateEmployee($input: UpdateEmployeeInput!) {
    updateEmployee(input: $input) {
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

export const RECORD_CHECK_IN_MUTATION = /* GraphQL */ `
  mutation RecordCheckIn($input: RecordCheckInInput!) {
    recordCheckIn(input: $input) {
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

export const RECORD_CHECK_OUT_MUTATION = /* GraphQL */ `
  mutation RecordCheckOut($input: RecordCheckOutInput!) {
    recordCheckOut(input: $input) {
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

export const REQUEST_MANUAL_ATTENDANCE_MUTATION = /* GraphQL */ `
  mutation RequestManualAttendance($input: RequestManualAttendanceInput!) {
    requestManualAttendance(input: $input) {
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

export const APPROVE_MANUAL_ATTENDANCE_MUTATION = /* GraphQL */ `
  mutation ApproveManualAttendance($attendanceId: ID!) {
    approveManualAttendance(attendanceId: $attendanceId) {
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

export const SUBMIT_OVERTIME_CLAIM_MUTATION = /* GraphQL */ `
  mutation SubmitOvertimeClaim($input: SubmitOvertimeClaimInput!) {
    submitOvertimeClaim(input: $input) {
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

export const APPROVE_OVERTIME_CLAIM_MUTATION = /* GraphQL */ `
  mutation ApproveOvertimeClaim($claimId: ID!) {
    approveOvertimeClaim(claimId: $claimId) {
      id
      status
      hourlyRate
      amount
      approvedBy
    }
  }
`;

export const REJECT_OVERTIME_CLAIM_MUTATION = /* GraphQL */ `
  mutation RejectOvertimeClaim($claimId: ID!, $reason: String!) {
    rejectOvertimeClaim(claimId: $claimId, reason: $reason) {
      id
      status
      rejectionReason
    }
  }
`;

export const APPLY_LEAVE_MUTATION = /* GraphQL */ `
  mutation ApplyLeave($input: ApplyLeaveInput!) {
    applyLeave(input: $input) {
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

export const APPROVE_LEAVE_MUTATION = /* GraphQL */ `
  mutation ApproveLeave($applicationId: ID!) {
    approveLeave(applicationId: $applicationId) {
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

export const REJECT_LEAVE_MUTATION = /* GraphQL */ `
  mutation RejectLeave($applicationId: ID!, $reason: String!) {
    rejectLeave(applicationId: $applicationId, reason: $reason) {
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

export const CANCEL_LEAVE_MUTATION = /* GraphQL */ `
  mutation CancelLeave($applicationId: ID!) {
    cancelLeave(applicationId: $applicationId) {
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

export const CREATE_LEAVE_POLICY_MUTATION = /* GraphQL */ `
  mutation CreateLeavePolicy($input: CreateLeavePolicyInput!) {
    createLeavePolicy(input: $input) {
      id
      name
      leaveType
      totalDaysPerYear
      carryForwardDays
      requiresApproval
      tenantId
    }
  }
`;

export const CREATE_SALARY_POLICY_MUTATION = /* GraphQL */ `
  mutation CreateSalaryPolicy($input: SalaryPolicyInput!) {
    createSalaryPolicy(input: $input) {
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

export const UPDATE_SALARY_POLICY_MUTATION = /* GraphQL */ `
  mutation UpdateSalaryPolicy($id: ID!, $input: SalaryPolicyInput!) {
    updateSalaryPolicy(id: $id, input: $input) {
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

export const DELETE_SALARY_POLICY_MUTATION = /* GraphQL */ `
  mutation DeleteSalaryPolicy($id: ID!) {
    deleteSalaryPolicy(id: $id)
  }
`;

export const LAUNCH_REVIEW_CYCLE_MUTATION = /* GraphQL */ `
  mutation LaunchReviewCycle($input: LaunchReviewCycleInput!) {
    launchReviewCycle(input: $input) {
      id
      name
      cycleType
      year
      status
      submissionDeadline
    }
  }
`;

export const SUBMIT_REVIEW_MUTATION = /* GraphQL */ `
  mutation SubmitReview($input: SubmitReviewInput!) {
    submitReview(input: $input) {
      id
      cycleId
      revieweeId
      reviewerId
      reviewerType
      overallScore
      comments
      submittedAt
    }
  }
`;

export const CREATE_PIP_MUTATION = /* GraphQL */ `
  mutation CreatePIP($input: CreatePIPInput!) {
    createPIP(input: $input) {
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

export const UPDATE_PIP_PROGRESS_MUTATION = /* GraphQL */ `
  mutation UpdatePIPProgress($input: UpdatePIPProgressInput!) {
    updatePIPProgress(input: $input) {
      id
      employeeId
      goals
      startDate
      endDate
      status
      progressNotes
    }
  }
`;

export const ADD_SKILL_TAG_MUTATION = /* GraphQL */ `
  mutation AddSkillTag($input: AddSkillTagInput!) {
    addSkillTag(input: $input) {
      id
      employeeId
      skill
      proficiencyLevel
      tenantId
    }
  }
`;

export const ADD_CERTIFICATION_MUTATION = /* GraphQL */ `
  mutation AddCertification($input: AddCertificationInput!) {
    addCertification(input: $input) {
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
