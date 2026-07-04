export const CREATE_ACADEMIC_YEAR_MUTATION = /* GraphQL */ `
  mutation CreateAcademicYear($year: CreateAcademicYearInput!) {
    createAcademicYear(year: $year) {
      id
      label
      startDate
      endDate
      current
      tenantId
    }
  }
`;

export const CREATE_ASSIGNMENT_MUTATION = /* GraphQL */ `
  mutation CreateAssignment($assignment: CreateAssignmentInput!) {
    createAssignment(assignment: $assignment) {
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

export const CREATE_BATCH_MUTATION = /* GraphQL */ `
  mutation CreateBatch($batch: CreateBatchInput!) {
    createBatch(batch: $batch) {
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
      type
      deliveryMode
      mediumOfInstruction
      registrationDeadline
      certificateOnCompletion
      certificateTemplateName
      prerequisites
      notes
      feePlans {
        id
        amount
        feeTypeId
        feeTypeName
        feeTypeKeyName
        frequency
        isActive
      }
      tenantId
    }
  }
`;

export const UPDATE_BATCH_MUTATION = /* GraphQL */ `
  mutation UpdateBatch($batch: UpdateBatchInput!) {
    updateBatch(batch: $batch) {
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
      type
      deliveryMode
      mediumOfInstruction
      registrationDeadline
      certificateOnCompletion
      certificateTemplateName
      prerequisites
      notes
      feePlans {
        id
        amount
        feeTypeId
        feeTypeName
        feeTypeKeyName
        frequency
        isActive
      }
      tenantId
    }
  }
`;

export const CHANGE_BATCH_STATUS_MUTATION = /* GraphQL */ `
  mutation ChangeBatchStatus($batchId: ID!, $status: String!) {
    changeBatchStatus(batchId: $batchId, status: $status) {
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
      type
      deliveryMode
      mediumOfInstruction
      feePlans {
        id
        amount
        feeTypeId
        frequency
        isActive
      }
      tenantId
    }
  }
`;

export const CLONE_BATCH_MUTATION = /* GraphQL */ `
  mutation CloneBatch(
    $sourceBatchId: ID!
    $newName: String!
    $newStartDate: String
    $newEndDate: String
  ) {
    cloneBatch(
      sourceBatchId: $sourceBatchId
      newName: $newName
      newStartDate: $newStartDate
      newEndDate: $newEndDate
    ) {
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
      type
      deliveryMode
      mediumOfInstruction
      feePlans {
        id
        amount
        feeTypeId
        frequency
        isActive
      }
      tenantId
    }
  }
`;

export const CREATE_PROGRAM_MUTATION = /* GraphQL */ `
  mutation CreateProgram($program: CreateProgramInput!) {
    createProgram(program: $program) {
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

export const UPDATE_PROGRAM_MUTATION = /* GraphQL */ `
  mutation UpdateProgram($program: UpdateProgramInput!) {
    updateProgram(program: $program) {
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

export const CREATE_SUBJECT_MUTATION = /* GraphQL */ `
  mutation CreateSubject($subject: CreateSubjectInput!) {
    createSubject(subject: $subject) {
      id
      name
      nameBangla
      code
      classLevel
      batchId
      active
      tenantId
    }
  }
`;

export const UPDATE_SUBJECT_MUTATION = /* GraphQL */ `
  mutation UpdateSubject($subject: UpdateSubjectInput!) {
    updateSubject(subject: $subject) {
      id
      name
      nameBangla
      code
      classLevel
      batchId
      active
      tenantId
    }
  }
`;

export const CREATE_RECURRING_SCHEDULE_MUTATION = /* GraphQL */ `
  mutation CreateRecurringSchedule($schedule: CreateRecurringScheduleInput!) {
    createRecurringSchedule(schedule: $schedule) {
      id
      batchId
      dayOfWeek
      startTime
      endTime
      roomName
      teacherId
      subjectId
      subjectName
      active
      tenantId
    }
  }
`;

export const ADD_ONE_OFF_SESSION_MUTATION = /* GraphQL */ `
  mutation AddOneOffSession($session: CreateOneOffSessionInput!) {
    addOneOffSession(session: $session) {
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

export const ASSIGN_SUBSTITUTE_MUTATION = /* GraphQL */ `
  mutation AssignSubstitute($sessionId: ID!, $substituteTeacherId: ID!) {
    assignSubstitute(
      sessionId: $sessionId
      substituteTeacherId: $substituteTeacherId
    ) {
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

export const UPLOAD_MATERIAL_MUTATION = /* GraphQL */ `
  mutation UploadMaterial($material: UploadMaterialInput!) {
    uploadMaterial(material: $material) {
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

export const SUBMIT_ASSIGNMENT_MUTATION = /* GraphQL */ `
  mutation SubmitAssignment($assignmentId: ID!, $studentId: ID!) {
    submitAssignment(assignmentId: $assignmentId, studentId: $studentId) {
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

export const GIVE_FEEDBACK_MUTATION = /* GraphQL */ `
  mutation GiveFeedback(
    $assignmentId: ID!
    $studentId: ID!
    $feedback: String!
  ) {
    giveFeedback(
      assignmentId: $assignmentId
      studentId: $studentId
      feedback: $feedback
    ) {
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

export const DELETE_BATCH_MUTATION = /* GraphQL */ `
  mutation DeleteBatch($batchId: ID!) {
    deleteBatch(batchId: $batchId)
  }
`;

export const START_SESSION_MUTATION = /* GraphQL */ `
  mutation StartSession($scheduleId: ID!, $date: String!) {
    startSession(scheduleId: $scheduleId, date: $date) {
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

export const CREATE_EXAM_MUTATION = /* GraphQL */ `
  mutation CreateExam($exam: CreateExamInput!) {
    createExam(exam: $exam) {
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

export const ENTER_MARKS_MUTATION = /* GraphQL */ `
  mutation EnterMarks($marks: [EnterMarksInput!]!) {
    enterMarks(marks: $marks) {
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

export const PUBLISH_RESULTS_MUTATION = /* GraphQL */ `
  mutation PublishResults($examId: ID!) {
    publishResults(examId: $examId) {
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
