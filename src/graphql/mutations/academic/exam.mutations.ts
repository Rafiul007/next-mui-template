export const CREATE_DRAFT_EXAM_MUTATION = /* GraphQL */ `
  mutation CreateDraftExam($exam: CreateDraftExamInput!) {
    createDraftExam(exam: $exam) {
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

export const ADD_QUESTIONS_FROM_BANK_MUTATION = /* GraphQL */ `
  mutation AddQuestionsFromBank($input: AddQuestionsFromBankInput!) {
    addQuestionsFromBank(input: $input) {
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

export const ADD_INLINE_QUESTION_MUTATION = /* GraphQL */ `
  mutation AddInlineQuestion($input: AddInlineQuestionInput!) {
    addInlineQuestion(input: $input) {
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

export const REMOVE_EXAM_QUESTION_MUTATION = /* GraphQL */ `
  mutation RemoveExamQuestion($examId: ID!, $examQuestionId: ID!) {
    removeExamQuestion(examId: $examId, examQuestionId: $examQuestionId) {
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

export const SET_QUESTION_MARKS_MUTATION = /* GraphQL */ `
  mutation SetQuestionMarks($examId: ID!, $examQuestionId: ID!, $marks: Int!) {
    setQuestionMarks(examId: $examId, examQuestionId: $examQuestionId, marks: $marks) {
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

export const SUBMIT_EXAM_FOR_APPROVAL_MUTATION = /* GraphQL */ `
  mutation SubmitExamForApproval($examId: ID!) {
    submitExamForApproval(examId: $examId) {
      id
      title
      status
      submittedAt
    }
  }
`;

export const APPROVE_EXAM_MUTATION = /* GraphQL */ `
  mutation ApproveExam($examId: ID!) {
    approveExam(examId: $examId) {
      id
      title
      status
      approvedBy
      approvedAt
    }
  }
`;

export const REJECT_EXAM_MUTATION = /* GraphQL */ `
  mutation RejectExam($examId: ID!, $reason: String!) {
    rejectExam(examId: $examId, reason: $reason) {
      id
      title
      status
      rejectionReason
    }
  }
`;

export const SCHEDULE_EXAM_MUTATION = /* GraphQL */ `
  mutation ScheduleExam($input: ScheduleExamInput!) {
    scheduleExam(input: $input) {
      id
      title
      status
      startAt
      durationMinutes
    }
  }
`;

export const ASSIGN_STUDENT_TO_EXAM_MUTATION = /* GraphQL */ `
  mutation AssignStudentToExam($examId: ID!, $studentId: ID!) {
    assignStudentToExam(examId: $examId, studentId: $studentId) {
      id
      examId
      studentId
      assignedAt
    }
  }
`;

export const UNASSIGN_STUDENT_FROM_EXAM_MUTATION = /* GraphQL */ `
  mutation UnassignStudentFromExam($examId: ID!, $studentId: ID!) {
    unassignStudentFromExam(examId: $examId, studentId: $studentId) {
      id
      examId
      studentId
      assignedAt
    }
  }
`;

export const ENTER_MARKS_MUTATION = /* GraphQL */ `
  mutation EnterMarks($marks: [EnterMarksInput!]!) {
    enterMarks(marks: $marks) {
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

export const PUBLISH_RESULTS_MUTATION = /* GraphQL */ `
  mutation PublishResults($examId: ID!) {
    publishResults(examId: $examId) {
      id
      title
      status
      published
    }
  }
`;

export const START_EXAM_ATTEMPT_MUTATION = /* GraphQL */ `
  mutation StartExamAttempt($examId: ID!) {
    startExamAttempt(examId: $examId) {
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

export const SUBMIT_ANSWER_MUTATION = /* GraphQL */ `
  mutation SubmitAnswer($input: SubmitAnswerInput!) {
    submitAnswer(input: $input) {
      examQuestionId
      selectedOrders
    }
  }
`;

export const SUBMIT_ATTEMPT_MUTATION = /* GraphQL */ `
  mutation SubmitAttempt($attemptId: ID!) {
    submitAttempt(attemptId: $attemptId) {
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
