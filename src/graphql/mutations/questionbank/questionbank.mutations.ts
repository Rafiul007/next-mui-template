export const CREATE_QUESTION_MUTATION = /* GraphQL */ `
  mutation CreateQuestion($question: CreateQuestionInput!) {
    createQuestion(question: $question) {
      id
      tenantId
      subjectId
      topic
      type
      text
      difficulty
      defaultMarks
      scoringMode
      createdBy
      active
      options {
        id
        text
        correct
        order
      }
    }
  }
`;

export const UPDATE_QUESTION_MUTATION = /* GraphQL */ `
  mutation UpdateQuestion($question: UpdateQuestionInput!) {
    updateQuestion(question: $question) {
      id
      tenantId
      subjectId
      topic
      type
      text
      difficulty
      defaultMarks
      scoringMode
      createdBy
      active
      options {
        id
        text
        correct
        order
      }
    }
  }
`;

export const DEACTIVATE_QUESTION_MUTATION = /* GraphQL */ `
  mutation DeactivateQuestion($questionId: ID!) {
    deactivateQuestion(questionId: $questionId) {
      id
      active
    }
  }
`;
