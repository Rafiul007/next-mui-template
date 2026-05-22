export const GET_ACADEMIC_YEARS_QUERY = /* GraphQL */ `
  query GetAcademicYears {
    getAcademicYears {
      id
      label
      startDate
      endDate
      current
      tenantId
    }
  }
`;

export const GET_ALL_BATCHES_QUERY = /* GraphQL */ `
  query GetAllBatches {
    getAllBatches {
      id
      name
      courseName
      branchId
      programId
      headTeacherId
      coTeacherIds
      classLevel
      capacity
      enrolledCount
      startDate
      endDate
      status
      tenantId
      type
      deliveryMode
      mediumOfInstruction
      registrationDeadline
      certificateOnCompletion
      certificateTemplateName
      prerequisites
      notes
      deleted
      feePlans {
        id
        amount
        feeTypeId
        feeTypeName
        feeTypeKeyName
        frequency
        isActive
      }
    }
  }
`;

export const GET_BATCHES_BY_BRANCH_QUERY = /* GraphQL */ `
  query GetBatchesByBranch($branchId: ID!) {
    getBatchesByBranch(branchId: $branchId) {
      id
      name
      branchId
      programId
      headTeacherId
      coTeacherIds
      classLevel
      capacity
      enrolledCount
      startDate
      endDate
      status
      tenantId
    }
  }
`;

export const GET_ASSIGNMENTS_BY_BATCH_QUERY = /* GraphQL */ `
  query GetAssignmentsByBatch($batchId: ID!) {
    getAssignmentsByBatch(batchId: $batchId) {
      id
      title
      description
      attachmentPath
      dueDate
      active
      batchId
      subjectId
      teacherId
      tenantId
    }
  }
`;

export const GET_MATERIALS_BY_BATCH_QUERY = /* GraphQL */ `
  query GetMaterialsByBatch($batchId: ID!) {
    getMaterialsByBatch(batchId: $batchId) {
      id
      title
      batchId
      subjectId
      filePath
      videoUrl
      visibleStudentIds
      visibleToAll
      uploadedAt
      uploadedBy
      tenantId
    }
  }
`;

export const GET_PROGRAMS_QUERY = /* GraphQL */ `
  query GetPrograms {
    getPrograms {
      id
      name
      durationMonths
      targetLevel
      syllabusPath
      subjectIds
      active
      tenantId
    }
  }
`;

export const GET_SUBJECTS_QUERY = /* GraphQL */ `
  query GetSubjects {
    getSubjects {
      id
      name
      nameBangla
      code
      classLevel
      active
      tenantId
    }
  }
`;

export const GET_SCHEDULES_BY_BATCH_QUERY = /* GraphQL */ `
  query GetSchedulesByBatch($batchId: ID!) {
    getSchedulesByBatch(batchId: $batchId) {
      id
      batchId
      dayOfWeek
      startTime
      endTime
      roomName
      teacherId
      active
      tenantId
    }
  }
`;

export const GET_SESSIONS_BY_BATCH_QUERY = /* GraphQL */ `
  query GetSessionsByBatch($batchId: ID!) {
    getSessionsByBatch(batchId: $batchId) {
      id
      batchId
      recurringScheduleId
      teacherId
      substituteTeacherId
      date
      startTime
      endTime
      roomName
      status
      type
      cancelReason
      tenantId
    }
  }
`;

export const GET_EXAMS_BY_BATCH_QUERY = /* GraphQL */ `
  query GetExamsByBatch($batchId: ID!) {
    getExamsByBatch(batchId: $batchId) {
      id
      title
      batchId
      subjectId
      examDate
      totalMarks
      passMark
      published
      tenantId
    }
  }
`;

export const GET_RESULTS_BY_EXAM_QUERY = /* GraphQL */ `
  query GetResultsByExam($examId: ID!) {
    getResultsByExam(examId: $examId) {
      id
      examId
      studentId
      marksObtained
      grade
      remarks
      publishedAt
      tenantId
    }
  }
`;
