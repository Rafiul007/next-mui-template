export const ADMIT_STUDENT_MUTATION = /* GraphQL */ `
  mutation AdmitStudent($student: AdmitStudentInput!) {
    admitStudent(student: $student) {
      id
      studentCode
      firstName
      firstNameBangla
      lastName
      email
      phone
      dateOfBirth
      gender
      bloodGroup
      classLevel
      previousInstitution
      previousResult
      admissionSource
      village
      upazila
      district
      division
      referrerId
      photo
      status
      userId
      tenantId
    }
  }
`;

export const UPDATE_STUDENT_MUTATION = /* GraphQL */ `
  mutation UpdateStudent($student: UpdateStudentInput!) {
    updateStudent(student: $student) {
      id
      studentCode
      firstName
      firstNameBangla
      lastName
      email
      phone
      dateOfBirth
      gender
      bloodGroup
      classLevel
      previousInstitution
      previousResult
      admissionSource
      village
      upazila
      district
      division
      referrerId
      photo
      status
      userId
      tenantId
    }
  }
`;

export const CHANGE_STUDENT_STATUS_MUTATION = /* GraphQL */ `
  mutation ChangeStudentStatus($studentId: ID!, $status: String!) {
    changeStudentStatus(studentId: $studentId, status: $status) {
      id
      studentCode
      firstName
      firstNameBangla
      lastName
      email
      phone
      dateOfBirth
      gender
      bloodGroup
      classLevel
      previousInstitution
      previousResult
      admissionSource
      village
      upazila
      district
      division
      referrerId
      photo
      status
      userId
      tenantId
    }
  }
`;

export const ADD_GUARDIAN_MUTATION = /* GraphQL */ `
  mutation AddGuardian($guardian: AddGuardianInput!) {
    addGuardian(guardian: $guardian) {
      id
      studentId
      name
      relationship
      phone
      occupation
      nid
    }
  }
`;

export const ENROLL_STUDENT_MUTATION = /* GraphQL */ `
  mutation EnrollStudent($studentId: ID!, $batchId: ID!) {
    enrollStudent(studentId: $studentId, batchId: $batchId) {
      id
      studentId
      batchId
      enrolledAt
      status
      dropReason
      tenantId
    }
  }
`;

export const DROP_ENROLLMENT_MUTATION = /* GraphQL */ `
  mutation DropEnrollment($enrollmentId: ID!, $reason: String) {
    dropEnrollment(enrollmentId: $enrollmentId, reason: $reason) {
      id
      studentId
      batchId
      enrolledAt
      status
      dropReason
      tenantId
    }
  }
`;

export const RE_ENROLL_MUTATION = /* GraphQL */ `
  mutation ReEnroll($studentId: ID!, $newBatchId: ID!) {
    reEnroll(studentId: $studentId, newBatchId: $newBatchId) {
      id
      studentId
      batchId
      enrolledAt
      status
      dropReason
      tenantId
    }
  }
`;

export const MARK_ATTENDANCE_MUTATION = /* GraphQL */ `
  mutation MarkAttendance($entries: [MarkAttendanceInput!]!) {
    markAttendance(entries: $entries) {
      id
      studentId
      sessionId
      status
      markedAt
      markedBy
      correctionReason
      tenantId
    }
  }
`;

export const CORRECT_ATTENDANCE_MUTATION = /* GraphQL */ `
  mutation CorrectAttendance(
    $sessionId: ID!
    $studentId: ID!
    $status: String!
    $correctionReason: String
  ) {
    correctAttendance(
      sessionId: $sessionId
      studentId: $studentId
      status: $status
      correctionReason: $correctionReason
    ) {
      id
      studentId
      sessionId
      status
      markedAt
      markedBy
      correctionReason
      tenantId
    }
  }
`;
