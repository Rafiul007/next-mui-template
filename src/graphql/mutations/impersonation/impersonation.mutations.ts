export const START_IMPERSONATION_MUTATION = /* GraphQL */ `
  mutation StartImpersonation($userId: ID!) {
    startImpersonation(userId: $userId) {
      token
      sessionId
      targetUserId
      targetUserName
      startedAt
    }
  }
`;

export const STOP_IMPERSONATION_MUTATION = /* GraphQL */ `
  mutation StopImpersonation {
    stopImpersonation
  }
`;
