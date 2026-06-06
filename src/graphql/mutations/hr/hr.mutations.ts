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
