export const GET_ATTENDANCE_BY_SESSION_QUERY = /* GraphQL */ `
  query GetAttendanceBySession($sessionId: ID!) {
    getAttendanceBySession(sessionId: $sessionId) {
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

export const GET_ATTENDANCE_SUMMARY_QUERY = /* GraphQL */ `
  query GetAttendanceSummary($studentId: ID!) {
    getAttendanceSummary(studentId: $studentId) {
      totalSessions
      presentCount
      presentPercent
      absentCount
      absentPercent
      lateCount
      latePercent
      shortageAlert
    }
  }
`;

export const GET_ENROLLMENTS_BY_BATCH_QUERY = /* GraphQL */ `
  query GetEnrollmentsByBatch($batchId: ID!) {
    getEnrollmentsByBatch(batchId: $batchId) {
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

export const GET_ENROLLMENTS_BY_STUDENT_QUERY = /* GraphQL */ `
  query GetEnrollmentsByStudent($studentId: ID!) {
    getEnrollmentsByStudent(studentId: $studentId) {
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

export const GET_GUARDIANS_QUERY = /* GraphQL */ `
  query GetGuardians($studentId: ID!) {
    getGuardians(studentId: $studentId) {
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

export const GET_STUDENT_QUERY = /* GraphQL */ `
  query GetStudent($studentId: ID!) {
    getStudent(studentId: $studentId) {
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

export const GET_STUDENTS_QUERY = /* GraphQL */ `
  query GetStudents {
    getStudents {
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

export const GET_STUDENT_DOCUMENTS_QUERY = /* GraphQL */ `
  query GetStudentDocuments($studentId: ID!) {
    getStudentDocuments(studentId: $studentId) {
      id
      studentId
      type
      filePath
      uploadedAt
      uploadedBy
      tenantId
    }
  }
`;

export const GET_SUBMISSIONS_QUERY = /* GraphQL */ `
  query GetSubmissions($assignmentId: ID!) {
    getSubmissions(assignmentId: $assignmentId) {
      id
      assignmentId
      studentId
      filePath
      submittedAt
      feedback
      feedbackAt
      late
      tenantId
    }
  }
`;
