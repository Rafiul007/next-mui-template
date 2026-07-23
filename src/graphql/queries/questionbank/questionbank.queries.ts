export const GET_QUESTIONS_BY_TENANT_QUERY = /* GraphQL */ `
  query GetQuestionsByTenant {
    getQuestionsByTenant {
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

export const GET_QUESTIONS_BY_SUBJECT_QUERY = /* GraphQL */ `
  query GetQuestionsBySubject($subjectId: ID!) {
    getQuestionsBySubject(subjectId: $subjectId) {
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

export const GET_QUESTION_BY_ID_QUERY = /* GraphQL */ `
  query GetQuestionById($questionId: ID!) {
    getQuestionById(questionId: $questionId) {
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
