export const GET_EXAM_BY_ID_QUERY = /* GraphQL */ `
  query GetExamById($examId: ID!) {
    getExamById(examId: $examId) {
      id
      tenantId
      batchId
      subjectId
      title
      examDate
      totalMarks
      passMark
      published
      status
      startAt
      durationMinutes
      createdBy
      submittedAt
      approvedBy
      approvedAt
      rejectionReason
      instructions
      examQuestions {
        id
        examId
        order
        marks
        questionTextSnapshot
        typeSnapshot
        optionsSnapshot {
          text
          correct
          order
        }
        sourceQuestionId
        scoringModeSnapshot
      }
    }
  }
`;

export const GET_EXAMS_BY_BATCH_QUERY = /* GraphQL */ `
  query GetExamsByBatch($batchId: ID!) {
    getExamsByBatch(batchId: $batchId) {
      id
      tenantId
      batchId
      subjectId
      title
      examDate
      totalMarks
      passMark
      published
      status
      startAt
      durationMinutes
      createdBy
      submittedAt
      approvedBy
      approvedAt
      rejectionReason
      instructions
      examQuestions {
        id
        examId
        order
        marks
        questionTextSnapshot
        typeSnapshot
        optionsSnapshot {
          text
          correct
          order
        }
        sourceQuestionId
        scoringModeSnapshot
      }
    }
  }
`;

export const GET_RESULTS_BY_EXAM_QUERY = /* GraphQL */ `
  query GetResultsByExam($examId: ID!) {
    getResultsByExam(examId: $examId) {
      id
      tenantId
      examId
      studentId
      marksObtained
      grade
      remarks
      publishedAt
    }
  }
`;

export const GET_MY_RESULTS_QUERY = /* GraphQL */ `
  query GetMyResults {
    myResults {
      id
      tenantId
      examId
      studentId
      marksObtained
      grade
      remarks
      publishedAt
    }
  }
`;

export const GET_RESULT_SLIP_URL_QUERY = /* GraphQL */ `
  query GetResultSlipUrl($examId: ID!, $studentId: ID!) {
    getResultSlipUrl(examId: $examId, studentId: $studentId)
  }
`;

export const GET_MY_RESULT_BREAKDOWN_QUERY = /* GraphQL */ `
  query GetMyResultBreakdown($examId: ID!) {
    getMyResultBreakdown(examId: $examId) {
      examId
      marksObtained
      grade
      remarks
      publishedAt
      questions {
        examQuestionId
        questionTextSnapshot
        typeSnapshot
        options {
          text
          correct
          order
        }
        selectedOrders
        correct
        marksAwarded
      }
    }
  }
`;

export const GET_EXAM_ASSIGNMENTS_QUERY = /* GraphQL */ `
  query GetExamAssignments($examId: ID!) {
    getExamAssignments(examId: $examId) {
      id
      examId
      studentId
      assignedAt
    }
  }
`;

export const GET_MY_SCHEDULED_EXAMS_QUERY = /* GraphQL */ `
  query GetMyScheduledExams {
    getMyScheduledExams {
      id
      tenantId
      batchId
      subjectId
      title
      examDate
      totalMarks
      passMark
      published
      status
      startAt
      durationMinutes
      instructions
    }
  }
`;

export const GET_MY_EXAM_ATTEMPT_QUERY = /* GraphQL */ `
  query GetMyExamAttempt($examId: ID!) {
    getMyExamAttempt(examId: $examId) {
      id
      examId
      studentId
      status
      startedAt
      deadlineAt
      submittedAt
      questions {
        id
        marks
        questionTextSnapshot
        typeSnapshot
        scoringModeSnapshot
        options {
          text
          order
        }
      }
    }
  }
`;
